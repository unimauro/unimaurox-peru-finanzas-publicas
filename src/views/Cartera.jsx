import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  Treemap,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import { cargarPresupuestoCartera } from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, tickSoles } from '../utils/format.js';

const PALETA = [
  '#0B2545',
  '#1B3A6B',
  '#D91023',
  '#C9A02E',
  '#16a34a',
  '#0ea5e9',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#14b8a6',
];

export default function Cartera() {
  // 1. Hooks
  const { anio, unidad } = useFilters();
  const carteraQ = useData(cargarPresupuestoCartera, []);
  const [seleccionados, setSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const treemapData = useMemo(() => {
    return (carteraQ.data || [])
      .filter((c) => c.anio === anio)
      .map((c) => ({
        name: c.sector,
        size: c.pim_soles,
        pim_soles: c.pim_soles,
        devengado_soles: c.devengado_soles,
        ejecucion_pct: c.pim_soles ? (c.devengado_soles / c.pim_soles) * 100 : null,
      }))
      .filter((c) => c.size > 0)
      .sort((a, b) => b.size - a.size);
  }, [carteraQ.data, anio]);

  const sectores = useMemo(() => {
    const set = new Set();
    (carteraQ.data || []).forEach((c) => set.add(c.sector));
    return Array.from(set).sort();
  }, [carteraQ.data]);

  const serieComparativa = useMemo(() => {
    if (seleccionados.length === 0) return [];
    const aniosUnicos = Array.from(new Set((carteraQ.data || []).map((c) => c.anio))).sort();
    return aniosUnicos.map((a) => {
      const row = { anio: a };
      seleccionados.forEach((sector) => {
        const d = (carteraQ.data || []).find((x) => x.anio === a && x.sector === sector);
        row[sector] = d ? escalar(d.pim_soles, unidad) : null;
      });
      return row;
    });
  }, [carteraQ.data, seleccionados, unidad]);

  const tablaSectores = useMemo(() => {
    return (carteraQ.data || [])
      .filter((c) => c.anio === anio)
      .map((c) => ({
        sector: c.sector,
        pim: escalar(c.pim_soles, unidad),
        devengado: escalar(c.devengado_soles, unidad),
        ejecucion_pct: c.pim_soles ? (c.devengado_soles / c.pim_soles) * 100 : null,
      }))
      .sort((a, b) => (b.pim ?? 0) - (a.pim ?? 0));
  }, [carteraQ.data, anio, unidad]);

  // 2. Early returns (después de hooks)
  if (carteraQ.error) return <ErrorBox error={carteraQ.error} />;
  if (carteraQ.loading) return <SkeletonChart altura={500} />;

  const suf = sufijoUnidad(unidad);
  const sectoresFiltrados = sectores.filter((s) =>
    s.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const toggleSector = (sector) => {
    setSeleccionados((prev) => {
      if (prev.includes(sector)) return prev.filter((s) => s !== sector);
      if (prev.length >= 5) return prev;
      return [...prev, sector];
    });
  };

  return (
    <div className="space-y-6">
      <SourceBanner color="ambar">
        <strong>Origen de los datos:</strong> Distribución del presupuesto por
        cartera ministerial basada en los totales del <strong>MEF · Consulta
        Amigable</strong> y los pesos relativos históricos de cada sector
        (Educación, Salud, etc.) según los Reportes Anuales del MEF.
      </SourceBanner>

      <ChartContainer
        titulo={`Distribución del presupuesto por sector · ${anio}`}
        descripcion={`Treemap proporcional al PIM (${suf})`}
        fuente="MEF · Consulta Amigable"
        filas={tablaSectores}
        nombreArchivo={`presupuesto_carteras_${anio}.csv`}
        altura={420}
      >
        <ResponsiveContainer>
          <Treemap
            data={treemapData}
            dataKey="size"
            stroke="#fff"
            content={<CustomCell />}
          />
        </ResponsiveContainer>
      </ChartContainer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Comparar carteras
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Selecciona hasta 5 sectores para ver su evolución
          </p>
          <input
            type="text"
            placeholder="Buscar sector…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <div className="mt-3 max-h-80 overflow-y-auto pr-1">
            {sectoresFiltrados.map((sector) => {
              const activo = seleccionados.includes(sector);
              return (
                <label
                  key={sector}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => toggleSector(sector)}
                    disabled={!activo && seleccionados.length >= 5}
                  />
                  <span
                    className="h-3 w-3 rounded"
                    style={{ background: activo ? PALETA[seleccionados.indexOf(sector) % PALETA.length] : '#cbd5e1' }}
                  />
                  <span className="text-slate-700 dark:text-slate-200">{sector}</span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">{seleccionados.length}/5 seleccionados</p>
        </div>

        <div className="lg:col-span-2">
          {seleccionados.length === 0 ? (
            <div className="card flex h-full min-h-[320px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Selecciona sectores en el panel izquierdo para comparar su evolución.
            </div>
          ) : (
            <ChartContainer
              titulo="Evolución del PIM por sector"
              descripcion={`Serie 1990-2025 · ${suf}`}
              fuente="MEF"
              filas={serieComparativa}
              nombreArchivo="comparativo_carteras.csv"
              altura={400}
            >
              <ResponsiveContainer>
                <LineChart data={serieComparativa} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(v, n) => [
                      v != null
                        ? `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`
                        : '—',
                      n,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {seleccionados.map((sector, i) => (
                    <Line
                      key={sector}
                      type="monotone"
                      dataKey={sector}
                      stroke={PALETA[i % PALETA.length]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </div>

      <section className="card overflow-x-auto">
        <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
          Tabla detallada · {anio}
        </h3>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700">
              <th className="py-2">Sector</th>
              <th className="py-2 text-right">PIM ({suf})</th>
              <th className="py-2 text-right">Devengado ({suf})</th>
              <th className="py-2 text-right">% Ejecución</th>
            </tr>
          </thead>
          <tbody>
            {tablaSectores.map((row) => (
              <tr
                key={row.sector}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                <td className="py-2 font-medium text-slate-700 dark:text-slate-200">{row.sector}</td>
                <td className="py-2 text-right font-mono">
                  {row.pim?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}
                </td>
                <td className="py-2 text-right font-mono">
                  {row.devengado?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}
                </td>
                <td className="py-2 text-right font-mono">
                  {row.ejecucion_pct?.toFixed(1) ?? '—'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function CustomCell({ x, y, width, height, name, size, depth, index }) {
  if (depth !== 1) return null;
  const color = PALETA[index % PALETA.length];
  const labelVisible = width > 70 && height > 30;
  const valueVisible = width > 90 && height > 50;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{ fill: color, stroke: '#fff', strokeWidth: 2 }}
      />
      {labelVisible && (
        <text
          x={x + 8}
          y={y + 18}
          fill="#fff"
          fontSize={12}
          fontWeight={600}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
      )}
      {valueVisible && (
        <text
          x={x + 8}
          y={y + 36}
          fill="rgba(255,255,255,0.85)"
          fontSize={11}
          style={{ pointerEvents: 'none' }}
        >
          S/ {(size / 1e6).toLocaleString('es-PE', { maximumFractionDigits: 0 })} M
        </text>
      )}
    </g>
  );
}
