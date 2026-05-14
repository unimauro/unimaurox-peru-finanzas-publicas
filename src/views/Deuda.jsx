import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from 'recharts';
import { Banknote, Percent, TrendingUp, Coins } from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import { cargarDeuda } from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, tickSoles } from '../utils/format.js';

const PALETA_MONEDA = ['#0B2545', '#C9A02E', '#16a34a', '#0ea5e9'];

export default function Deuda() {
  // 1. Hooks
  const { anio, unidad } = useFilters();
  const deudaQ = useData(cargarDeuda, []);

  const ordenada = useMemo(
    () => [...(deudaQ.data || [])].sort((a, b) => a.anio - b.anio),
    [deudaQ.data],
  );

  const serie = useMemo(
    () =>
      ordenada.map((d) => ({
        anio: d.anio,
        interna: escalar(d.deuda_interna_soles, unidad),
        externa: escalar(d.deuda_externa_soles, unidad),
        total: escalar(d.deuda_total_soles, unidad),
        pct_pbi: d.deuda_pct_pbi,
      })),
    [ordenada, unidad],
  );

  const nuevaDeuda = useMemo(
    () =>
      ordenada.map((d, i) => {
        const prevD = ordenada[i - 1];
        return {
          anio: d.anio,
          nueva: prevD ? escalar(d.deuda_total_soles - prevD.deuda_total_soles, unidad) : null,
        };
      }),
    [ordenada, unidad],
  );

  // 2. Early returns
  if (deudaQ.error) return <ErrorBox error={deudaQ.error} />;
  if (deudaQ.loading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonChart altura={400} />
      </div>
    );

  const suf = sufijoUnidad(unidad);
  const item = ordenada.find((d) => d.anio === anio);
  const prev = ordenada.find((d) => d.anio === anio - 1);

  const varAbs = item && prev ? item.deuda_total_soles - prev.deuda_total_soles : null;
  const varPct =
    item && prev ? ((item.deuda_total_soles - prev.deuda_total_soles) / prev.deuda_total_soles) * 100 : null;

  const composicionMoneda = (item?.composicion_moneda || []).map((c) => ({
    name: c.moneda,
    value: c.porcentaje,
  }));
  const composicionAcreedor = (item?.composicion_acreedor || []).map((c) => ({
    name: c.acreedor,
    value: c.porcentaje,
  }));

  return (
    <div className="space-y-6">
      <SourceBanner color="azul">
        <strong>Origen de los datos:</strong> Stock de deuda pública del{' '}
        <strong>MEF — Dirección General de Endeudamiento (DGE)</strong> y{' '}
        <strong>BCRP</strong>. La composición por moneda y acreedor proviene
        del Informe Anual de Deuda Pública del MEF. Los porcentajes del PBI se
        calculan sobre la serie nominal del BCRP.
      </SourceBanner>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          etiqueta={`Deuda total ${anio}`}
          valor={`S/ ${escalar(item?.deuda_total_soles, unidad)?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
          unidadInline={suf}
          sub="Stock de deuda pública bruta"
          variacion={varPct}
          fuente="BCRP / MEF · DGE"
          icono={Banknote}
        />
        <KpiCard
          etiqueta="% del PBI"
          valor={`${item?.deuda_pct_pbi?.toFixed(1) ?? '—'}%`}
          sub="Ratio deuda / PBI nominal"
          fuente="BCRP"
          icono={Percent}
        />
        <KpiCard
          etiqueta="Variación absoluta"
          valor={
            varAbs != null
              ? `${varAbs > 0 ? '+' : ''}S/ ${escalar(varAbs, unidad).toLocaleString('es-PE', { maximumFractionDigits: 1 })}`
              : '—'
          }
          unidadInline={suf}
          sub={`vs ${anio - 1}`}
          fuente="Cálculo propio"
          icono={TrendingUp}
        />
        <KpiCard
          etiqueta="Deuda externa"
          valor={`S/ ${escalar(item?.deuda_externa_soles, unidad)?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
          unidadInline={suf}
          sub={`${((item?.deuda_externa_soles / item?.deuda_total_soles) * 100 || 0).toFixed(1)}% del total`}
          fuente="MEF · DGE"
          icono={Coins}
        />
      </div>

      <ChartContainer
        titulo="Stock de deuda pública 1990-2025"
        descripcion={`Interna + externa (barras apiladas) · % del PBI (línea)`}
        fuente="BCRP · MEF · Dirección General de Endeudamiento"
        filas={serie}
        nombreArchivo="deuda_publica_serie.csv"
        altura={400}
      >
        <ResponsiveContainer>
          <ComposedChart data={serie} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v?.toFixed?.(0) ?? v}%`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => {
                if (n === 'pct_pbi')
                  return [`${Number(v).toFixed(1)}%`, '% del PBI'];
                return [
                  `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                  n === 'interna' ? 'Deuda interna' : 'Deuda externa',
                ];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="interna" stackId="d" fill="#0B2545" name="Deuda interna" />
            <Bar yAxisId="left" dataKey="externa" stackId="d" fill="#C9A02E" name="Deuda externa" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pct_pbi"
              stroke="#D91023"
              strokeWidth={2.5}
              dot={false}
              name="% del PBI"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer
        titulo="Nueva deuda contraída por año"
        descripcion={`Δ stock anual · ${suf} · positivo = nueva emisión neta`}
        fuente="Cálculo propio sobre serie BCRP/MEF"
        filas={nuevaDeuda}
        nombreArchivo="nueva_deuda_anual.csv"
        altura={320}
      >
        <ResponsiveContainer>
          <BarChart data={nuevaDeuda} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [
                `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                'Nueva deuda',
              ]}
            />
            <Bar dataKey="nueva" radius={[4, 4, 0, 0]}>
              {nuevaDeuda.map((d, i) => (
                <Cell key={i} fill={d.nueva >= 0 ? '#D91023' : '#16a34a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          titulo={`Composición por moneda · ${anio}`}
          descripcion="% de la deuda total"
          fuente="MEF · DGE"
          filas={composicionMoneda}
          nombreArchivo={`composicion_moneda_${anio}.csv`}
          altura={300}
        >
          {composicionMoneda.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Sin datos detallados para este año
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={composicionMoneda}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={2}
                  label={(p) => `${p.name}: ${p.value.toFixed(0)}%`}
                  labelLine={false}
                >
                  {composicionMoneda.map((_, i) => (
                    <Cell key={i} fill={PALETA_MONEDA[i % PALETA_MONEDA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        <ChartContainer
          titulo={`Composición por acreedor · ${anio}`}
          descripcion="Multilateral, bilateral, bonos, otros"
          fuente="MEF · DGE"
          filas={composicionAcreedor}
          nombreArchivo={`composicion_acreedor_${anio}.csv`}
          altura={300}
        >
          {composicionAcreedor.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Sin datos detallados para este año
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={composicionAcreedor}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={2}
                  label={(p) => `${p.name}: ${p.value.toFixed(0)}%`}
                  labelLine={false}
                >
                  {composicionAcreedor.map((_, i) => (
                    <Cell key={i} fill={PALETA_MONEDA[i % PALETA_MONEDA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
