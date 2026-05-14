import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { Banknote, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import ChartContainer from '../components/ChartContainer.jsx';
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import { cargarPBI, cargarDeuda, cargarPresupuesto } from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, formatPctLiteral, tickSoles } from '../utils/format.js';

export default function Panorama() {
  const { anio, unidad } = useFilters();
  const pbiQ = useData(cargarPBI, []);
  const deudaQ = useData(cargarDeuda, []);
  const presQ = useData(cargarPresupuesto, []);

  if (pbiQ.error || deudaQ.error || presQ.error) {
    return <ErrorBox error={pbiQ.error || deudaQ.error || presQ.error} />;
  }

  const loading = pbiQ.loading || deudaQ.loading || presQ.loading;

  // KPIs del año seleccionado
  const pbiAnio = pbiQ.data?.find((d) => d.anio === anio);
  const pbiPrev = pbiQ.data?.find((d) => d.anio === anio - 1);
  const deudaAnio = deudaQ.data?.find((d) => d.anio === anio);
  const deudaPrev = deudaQ.data?.find((d) => d.anio === anio - 1);
  const presAnio = presQ.data?.find((d) => d.anio === anio);

  const varPBI =
    pbiAnio && pbiPrev ? ((pbiAnio.pbi_nominal_soles - pbiPrev.pbi_nominal_soles) / pbiPrev.pbi_nominal_soles) * 100 : null;
  const varDeuda =
    deudaAnio && deudaPrev
      ? ((deudaAnio.deuda_total_soles - deudaPrev.deuda_total_soles) / deudaPrev.deuda_total_soles) * 100
      : null;
  const ejecPct = presAnio?.pim_soles ? (presAnio.devengado_soles / presAnio.pim_soles) * 100 : null;

  // Serie combinada PBI vs Deuda
  const seriePbiDeuda = useMemo(() => {
    if (!pbiQ.data || !deudaQ.data) return [];
    return pbiQ.data
      .map((p) => {
        const d = deudaQ.data.find((x) => x.anio === p.anio);
        return {
          anio: p.anio,
          pbi: escalar(p.pbi_nominal_soles, unidad),
          deuda: d ? escalar(d.deuda_total_soles, unidad) : null,
          deuda_pct_pbi: d?.deuda_pct_pbi ?? null,
        };
      })
      .sort((a, b) => a.anio - b.anio);
  }, [pbiQ.data, deudaQ.data, unidad]);

  // Composición deuda interna vs externa
  const composicionDeuda = useMemo(() => {
    if (!deudaQ.data) return [];
    return deudaQ.data
      .map((d) => ({
        anio: d.anio,
        interna: escalar(d.deuda_interna_soles, unidad),
        externa: escalar(d.deuda_externa_soles, unidad),
      }))
      .sort((a, b) => a.anio - b.anio);
  }, [deudaQ.data, unidad]);

  // Variación YoY deuda
  const varYoYDeuda = useMemo(() => {
    if (!deudaQ.data) return [];
    const arr = [...deudaQ.data].sort((a, b) => a.anio - b.anio);
    return arr.map((d, i) => {
      const prev = arr[i - 1];
      return {
        anio: d.anio,
        variacion: prev
          ? ((d.deuda_total_soles - prev.deuda_total_soles) / prev.deuda_total_soles) * 100
          : null,
      };
    });
  }, [deudaQ.data]);

  const suf = sufijoUnidad(unidad);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <KpiCard
              etiqueta={`PBI ${anio}`}
              valor={`S/ ${escalar(pbiAnio?.pbi_nominal_soles, unidad)?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
              sub={suf}
              variacion={varPBI}
              fuente="BCRP"
              icono={TrendingUp}
            />
            <KpiCard
              etiqueta={`Deuda pública ${anio}`}
              valor={`S/ ${escalar(deudaAnio?.deuda_total_soles, unidad)?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
              sub={`${deudaAnio?.deuda_pct_pbi?.toFixed(1) ?? '—'}% del PBI`}
              variacion={varDeuda}
              fuente="BCRP/MEF"
              icono={Banknote}
            />
            <KpiCard
              etiqueta={`Presupuesto (PIM) ${anio}`}
              valor={`S/ ${escalar(presAnio?.pim_soles, unidad)?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
              sub={suf}
              fuente="MEF · Consulta Amigable"
              icono={Wallet}
            />
            <KpiCard
              etiqueta="Ejecución presupuestal"
              valor={`${ejecPct?.toFixed(1) ?? '—'}%`}
              sub={`Devengado / PIM · ${anio}`}
              fuente="MEF"
              icono={PiggyBank}
            />
          </>
        )}
      </div>

      {/* PBI vs Deuda dual axis */}
      {loading ? (
        <SkeletonChart altura={360} />
      ) : (
        <ChartContainer
          titulo="PBI nominal vs Deuda pública total"
          descripcion={`Serie 1990-2025 · valores en ${suf}`}
          fuente="BCRP · Estadísticas macroeconómicas"
          filas={seriePbiDeuda}
          nombreArchivo="pbi_vs_deuda.csv"
          altura={360}
        >
          <ResponsiveContainer>
            <LineChart data={seriePbiDeuda} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => tickSoles(v, unidad)}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => tickSoles(v, unidad)}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [`S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`, n === 'pbi' ? 'PBI' : 'Deuda total']}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pbi"
                name="PBI nominal"
                stroke="#0B2545"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="deuda"
                name="Deuda pública"
                stroke="#D91023"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Composición deuda + Variación YoY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <SkeletonChart altura={300} />
            <SkeletonChart altura={300} />
          </>
        ) : (
          <>
            <ChartContainer
              titulo="Composición de la deuda pública"
              descripcion="Interna vs externa (área apilada)"
              fuente="BCRP · Dirección General de Endeudamiento (MEF)"
              filas={composicionDeuda}
              nombreArchivo="composicion_deuda.csv"
              altura={300}
            >
              <ResponsiveContainer>
                <AreaChart data={composicionDeuda} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradInterna" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B2545" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#0B2545" stopOpacity={0.35} />
                    </linearGradient>
                    <linearGradient id="gradExterna" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A02E" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#C9A02E" stopOpacity={0.35} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(v, n) => [
                      `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                      n === 'interna' ? 'Deuda interna' : 'Deuda externa',
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="externa"
                    stackId="1"
                    stroke="#C9A02E"
                    fill="url(#gradExterna)"
                    name="Deuda externa"
                  />
                  <Area
                    type="monotone"
                    dataKey="interna"
                    stackId="1"
                    stroke="#0B2545"
                    fill="url(#gradInterna)"
                    name="Deuda interna"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              titulo="Variación anual de la deuda pública"
              descripcion="YoY % · positivo = la deuda creció ese año"
              fuente="Cálculo propio sobre serie BCRP/MEF"
              filas={varYoYDeuda}
              nombreArchivo="variacion_deuda_yoy.csv"
              altura={300}
            >
              <ResponsiveContainer>
                <BarChart data={varYoYDeuda} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${v?.toFixed?.(0) ?? v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [formatPctLiteral(v), 'Variación']}
                  />
                  <Bar
                    dataKey="variacion"
                    name="Variación %"
                    fill="#D91023"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </>
        )}
      </div>
    </div>
  );
}
