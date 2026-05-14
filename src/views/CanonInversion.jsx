import { useMemo, useState } from 'react';
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
import { Mountain, Handshake, Pickaxe, TrendingUp } from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import {
  cargarCanonInversion,
  cargarCanonRegional,
  cargarObrasTopEmpresas,
  cargarInversionComponentes,
  cargarCarteraProyectos,
} from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, tickSoles } from '../utils/format.js';

const PALETA = ['#3B82F6', '#F59E0B', '#10B981', '#A855F7', '#EC4899', '#06B6D4', '#EF4444'];

const ESTADO_COLOR = {
  'Operación': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Construcción': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Pre-construcción': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Pre-factibilidad': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Suspendido': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const fmtUSD = (v) => {
  if (v == null) return '—';
  const m = v / 1e6;
  if (Math.abs(m) >= 1000) return `US$ ${(m / 1000).toFixed(1)} mil M`;
  return `US$ ${m.toFixed(0)} M`;
};

export default function CanonInversion() {
  const { anio, unidad } = useFilters();
  const serieQ = useData(cargarCanonInversion, []);
  const regionQ = useData(cargarCanonRegional, []);
  const topQ = useData(cargarObrasTopEmpresas, []);
  const compQ = useData(cargarInversionComponentes, []);
  const carteraQ = useData(cargarCarteraProyectos, []);

  const serie = useMemo(
    () =>
      [...(serieQ.data || [])].sort((a, b) => a.anio - b.anio).map((d) => ({
        anio: d.anio,
        canon: escalar(d.canon_minero_soles, unidad),
        oxi: escalar(d.obras_x_impuestos_soles, unidad),
        inversion_minera_musd: d.inversion_minera_usd / 1e6,
      })),
    [serieQ.data, unidad],
  );

  const rankingCanon = useMemo(() => {
    const list = (regionQ.data || []).filter((d) => d.anio === anio);
    if (list.length === 0) {
      // Fallback al último año disponible
      const aniosDisp = Array.from(new Set((regionQ.data || []).map((d) => d.anio))).sort();
      const fallback = aniosDisp[aniosDisp.length - 1];
      return (regionQ.data || [])
        .filter((d) => d.anio === fallback)
        .filter((d) => d.canon_minero_soles > 0)
        .map((d) => ({
          region: d.region,
          canon: escalar(d.canon_minero_soles, unidad),
          anio_real: fallback,
        }))
        .sort((a, b) => b.canon - a.canon)
        .slice(0, 15);
    }
    return list
      .filter((d) => d.canon_minero_soles > 0)
      .map((d) => ({
        region: d.region,
        canon: escalar(d.canon_minero_soles, unidad),
      }))
      .sort((a, b) => b.canon - a.canon)
      .slice(0, 15);
  }, [regionQ.data, anio, unidad]);

  const anioRealCanon = rankingCanon[0]?.anio_real ?? anio;

  if (serieQ.error) return <ErrorBox error={serieQ.error} />;
  if (serieQ.loading || regionQ.loading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonChart altura={400} />
      </div>
    );

  const suf = sufijoUnidad(unidad);
  const item = serie.find((d) => d.anio === anio) || serie[serie.length - 1];
  const prev = serie.find((d) => d.anio === anio - 1);
  const varCanon = item && prev && prev.canon
    ? ((item.canon - prev.canon) / prev.canon) * 100 : null;
  const varOxI = item && prev && prev.oxi
    ? ((item.oxi - prev.oxi) / prev.oxi) * 100 : null;

  // Cartera por mineral (resumen)
  const carteraTotal = (carteraQ.data || []).reduce(
    (sum, p) => sum + p.inversion_usd_mm, 0,
  ) * 1_000_000;

  return (
    <div className="space-y-6">
      <SourceBanner color="ambar">
        <strong>Origen de los datos:</strong>{' '}
        <strong>MEF · Portal de Transparencia Económica</strong> (canon minero
        distribuido a Gobiernos Regionales y Locales), <strong>ProInversión</strong>{' '}
        (Obras por Impuestos · Ley 29230), <strong>MINEM</strong>{' '}
        (inversión minera ejecutada y cartera de proyectos). El canon empieza en
        1997 con la creación de la ley; las OxI desde 2008.
      </SourceBanner>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          etiqueta={`Canon minero ${anio}`}
          valor={`S/ ${item?.canon?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
          unidadInline={suf}
          sub="Distribuido a regiones"
          variacion={varCanon}
          fuente="MEF · Transparencia"
          icono={Mountain}
        />
        <KpiCard
          etiqueta={`Obras x Impuestos ${anio}`}
          valor={`S/ ${item?.oxi?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
          unidadInline={suf}
          sub="Adjudicado por empresas privadas"
          variacion={varOxI}
          fuente="ProInversión"
          icono={Handshake}
        />
        <KpiCard
          etiqueta={`Inversión minera ${anio}`}
          valor={fmtUSD(item?.inversion_minera_musd * 1e6)}
          sub="Capex ejecutado"
          fuente="MINEM"
          icono={Pickaxe}
        />
        <KpiCard
          etiqueta="Cartera de proyectos"
          valor={fmtUSD(carteraTotal)}
          sub={`${(carteraQ.data || []).length} proyectos · MINEM`}
          fuente="MINEM · Cartera Construcción"
          icono={TrendingUp}
        />
      </div>

      {/* Serie histórica unificada */}
      <ChartContainer
        titulo="Canon minero · Obras por Impuestos · Inversión minera"
        descripcion={`Canon y OxI en ${suf} (eje izq.) · Inversión minera en millones USD (eje der.)`}
        fuente="MEF · ProInversión · MINEM"
        filas={serie}
        nombreArchivo="canon_oxi_inversion.csv"
        altura={420}
      >
        <ResponsiveContainer>
          <ComposedChart data={serie} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => {
                if (n === 'inversion_minera_musd')
                  return [`US$ ${Number(v).toLocaleString('es-PE')} M`, 'Inversión minera'];
                return [
                  `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                  n === 'canon' ? 'Canon minero' : 'Obras por Impuestos',
                ];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="canon" fill="#F59E0B" name="Canon minero" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="oxi" fill="#10B981" name="Obras x Impuestos" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="inversion_minera_musd"
                  stroke="#3B82F6" strokeWidth={3} dot={false} name="Inversión minera (USD)" />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Canon por región */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          titulo={`Canon minero por región · ${anioRealCanon}`}
          descripcion="Top 15 regiones beneficiarias"
          fuente="MEF · Transferencias a GR/GL"
          filas={rankingCanon}
          nombreArchivo={`canon_regional_${anioRealCanon}.csv`}
          altura={Math.max(400, rankingCanon.length * 28)}
        >
          <ResponsiveContainer>
            <BarChart data={rankingCanon} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="region" width={110} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [
                  `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                  'Canon',
                ]}
              />
              <Bar dataKey="canon" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          titulo="Composición de la inversión minera"
          descripcion="% del capex total"
          fuente="MINEM · Anuario Minero"
          filas={compQ.data || []}
          nombreArchivo="inversion_componentes.csv"
          altura={400}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={compQ.data || []}
                dataKey="porcentaje"
                nameKey="componente"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}
                label={(p) => `${p.componente}: ${p.porcentaje}%`}
                labelLine={false}
              >
                {(compQ.data || []).map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Top empresas OxI */}
      <ChartContainer
        titulo="Top empresas en Obras por Impuestos (acumulado)"
        descripcion="Monto histórico adjudicado · 2009-2026"
        fuente="ProInversión"
        filas={(topQ.data || []).map((e) => ({
          empresa: e.empresa,
          rubro: e.rubro,
          monto: escalar(e.monto_acumulado_soles, unidad),
        }))}
        nombreArchivo="oxi_top_empresas.csv"
        altura={Math.max(360, (topQ.data || []).length * 26)}
      >
        <ResponsiveContainer>
          <BarChart
            data={(topQ.data || []).map((e) => ({
              empresa: e.empresa,
              rubro: e.rubro,
              monto: escalar(e.monto_acumulado_soles, unidad),
            })).sort((a, b) => b.monto - a.monto)}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 130, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="empresa" width={170} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n, p) => [
                `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf} · ${p.payload.rubro}`,
                'Acumulado',
              ]}
            />
            <Bar dataKey="monto" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Cartera de proyectos mineros */}
      <section className="card overflow-x-auto">
        <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">
          Cartera de proyectos mineros · 2024-2026
        </h3>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Proyectos en operación, construcción o factibilidad · Fuente: MINEM
        </p>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700">
              <th className="py-2">Proyecto</th>
              <th className="py-2">Empresa</th>
              <th className="py-2">Región</th>
              <th className="py-2">Mineral</th>
              <th className="py-2 text-right">Inversión (USD M)</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {[...(carteraQ.data || [])]
              .sort((a, b) => b.inversion_usd_mm - a.inversion_usd_mm)
              .map((p) => (
                <tr
                  key={p.proyecto}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="py-2 font-medium text-slate-800 dark:text-slate-100">{p.proyecto}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-300">{p.empresa}</td>
                  <td className="py-2 text-xs text-slate-500">{p.region}</td>
                  <td className="py-2 text-xs">
                    <span className="chip">{p.mineral}</span>
                  </td>
                  <td className="py-2 text-right font-mono font-semibold">
                    {p.inversion_usd_mm.toLocaleString('es-PE')}
                  </td>
                  <td className="py-2">
                    <span className={`chip ${ESTADO_COLOR[p.estado] || ''}`}>{p.estado}</span>
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-semibold dark:border-slate-600">
              <td colSpan={4} className="py-2 text-right text-slate-700 dark:text-slate-200">
                Total cartera:
              </td>
              <td className="py-2 text-right font-mono text-peru-azul dark:text-white">
                {((carteraQ.data || []).reduce((s, p) => s + p.inversion_usd_mm, 0)).toLocaleString('es-PE')}
              </td>
              <td className="py-2 text-xs text-slate-500">USD M</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
