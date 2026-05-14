import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from '../components/ChartContainer.jsx';
import { SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import { cargarPresupuesto, cargarPresupuestoCartera } from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, tickSoles } from '../utils/format.js';

// Color del heatmap según % ejecución (0..100)
function colorEjecucion(pct) {
  if (pct == null) return '#e2e8f0';
  // Escala: rojo (<60) → naranja (75) → amarillo (85) → verde (>=95)
  const clamp = Math.max(0, Math.min(100, pct));
  if (clamp < 60) return '#dc2626';
  if (clamp < 75) return '#f97316';
  if (clamp < 85) return '#f59e0b';
  if (clamp < 95) return '#84cc16';
  return '#16a34a';
}

export default function Presupuesto() {
  const { unidad, anio: anioFiltro } = useFilters();
  const presQ = useData(cargarPresupuesto, []);
  const carteraQ = useData(cargarPresupuestoCartera, []);
  const [anioDrill, setAnioDrill] = useState(null);

  if (presQ.error || carteraQ.error) return <ErrorBox error={presQ.error || carteraQ.error} />;
  if (presQ.loading || carteraQ.loading) return <SkeletonChart altura={500} />;

  const suf = sufijoUnidad(unidad);

  const seriePIA_PIM_DEV = (presQ.data || [])
    .map((d) => ({
      anio: d.anio,
      PIA: escalar(d.pia_soles, unidad),
      PIM: escalar(d.pim_soles, unidad),
      Devengado: escalar(d.devengado_soles, unidad),
      ejecucion_pct: d.pim_soles ? (d.devengado_soles / d.pim_soles) * 100 : null,
    }))
    .sort((a, b) => a.anio - b.anio);

  // Heatmap: año x sector con % de ejecución
  const sectores = useMemo(() => {
    const set = new Set();
    (carteraQ.data || []).forEach((c) => set.add(c.sector));
    return Array.from(set).sort();
  }, [carteraQ.data]);

  const anios = useMemo(() => {
    const set = new Set();
    (carteraQ.data || []).forEach((c) => set.add(c.anio));
    return Array.from(set).sort();
  }, [carteraQ.data]);

  const matriz = useMemo(() => {
    const m = new Map();
    (carteraQ.data || []).forEach((c) => {
      m.set(`${c.anio}|${c.sector}`, c.pim_soles ? (c.devengado_soles / c.pim_soles) * 100 : null);
    });
    return m;
  }, [carteraQ.data]);

  const drillData = anioDrill
    ? (carteraQ.data || [])
        .filter((c) => c.anio === anioDrill)
        .map((c) => ({
          sector: c.sector,
          PIM: escalar(c.pim_soles, unidad),
          Devengado: escalar(c.devengado_soles, unidad),
          ejecucion_pct: c.pim_soles ? (c.devengado_soles / c.pim_soles) * 100 : null,
        }))
        .sort((a, b) => (b.PIM ?? 0) - (a.PIM ?? 0))
    : null;

  return (
    <div className="space-y-6">
      <ChartContainer
        titulo="PIA · PIM · Devengado por año"
        descripcion={`Presupuesto institucional aprobado, modificado y ejecutado · ${suf}`}
        fuente="MEF · Consulta Amigable (SIAF)"
        filas={seriePIA_PIM_DEV}
        nombreArchivo="presupuesto_pia_pim_devengado.csv"
        altura={380}
      >
        <ResponsiveContainer>
          <BarChart data={seriePIA_PIM_DEV} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [
                `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                n,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="PIA" fill="#1B3A6B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="PIM" fill="#C9A02E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Devengado" fill="#D91023" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <section className="card">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Heatmap de % ejecución (año × sector)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Click sobre un año para drill-down · Devengado / PIM
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded" style={{ background: '#dc2626' }} /> {'<'}60%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded" style={{ background: '#f97316' }} /> 60-75%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded" style={{ background: '#f59e0b' }} /> 75-85%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded" style={{ background: '#84cc16' }} /> 85-95%
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded" style={{ background: '#16a34a' }} /> ≥95%
            </span>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white p-1 text-left text-slate-500 dark:bg-slate-900">
                  Sector
                </th>
                {anios.map((a) => (
                  <th
                    key={a}
                    onClick={() => setAnioDrill(a === anioDrill ? null : a)}
                    className={`cursor-pointer p-1 text-center font-medium ${
                      a === anioDrill
                        ? 'text-peru-rojo'
                        : 'text-slate-600 dark:text-slate-300 hover:text-peru-azul'
                    }`}
                  >
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectores.map((sector) => (
                <tr key={sector}>
                  <td className="sticky left-0 z-10 bg-white p-1 pr-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {sector}
                  </td>
                  {anios.map((a) => {
                    const v = matriz.get(`${a}|${sector}`);
                    return (
                      <td
                        key={a}
                        title={v != null ? `${sector} · ${a} · ${v.toFixed(1)}%` : 'sin datos'}
                        className="h-7 w-12 rounded text-center text-[10px] font-medium text-white"
                        style={{ background: colorEjecucion(v) }}
                      >
                        {v != null ? v.toFixed(0) : '·'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">Fuente: MEF · Consulta Amigable.</p>
      </section>

      {drillData && (
        <ChartContainer
          titulo={`Drill-down: sectores en ${anioDrill}`}
          descripcion={`Ranking por PIM (${suf}) y % ejecución`}
          fuente="MEF"
          filas={drillData}
          nombreArchivo={`drill_${anioDrill}.csv`}
          altura={Math.max(280, drillData.length * 28)}
        >
          <ResponsiveContainer>
            <BarChart data={drillData} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="sector" width={140} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [
                  `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                  n,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="PIM" fill="#C9A02E" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Devengado" fill="#D91023" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  );
}
