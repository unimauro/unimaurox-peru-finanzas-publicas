import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Pickaxe, Receipt, Ship, Anchor } from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import {
  cargarMacroeconomico,
  cargarComposicionRecaudacion,
} from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, tickSoles } from '../utils/format.js';

const PALETA = ['#3B82F6', '#F59E0B', '#10B981', '#A855F7', '#EC4899', '#06B6D4'];

const fmtUSD = (v) => {
  if (v == null) return '—';
  const m = v / 1e6;
  if (Math.abs(m) >= 1000) return `US$ ${(m / 1000).toFixed(1)} mil M`;
  return `US$ ${m.toFixed(0)} M`;
};

export default function Economia() {
  const { anio, unidad } = useFilters();
  const macroQ = useData(cargarMacroeconomico, []);
  const recaudQ = useData(cargarComposicionRecaudacion, []);

  const serie = useMemo(
    () => [...(macroQ.data || [])].sort((a, b) => a.anio - b.anio),
    [macroQ.data],
  );

  const serieComercio = useMemo(
    () =>
      serie.map((d) => ({
        anio: d.anio,
        exportaciones: d.exportaciones_usd / 1e6,
        importaciones: d.importaciones_usd / 1e6,
        balanza: d.balanza_comercial_usd / 1e6,
      })),
    [serie],
  );

  const serieMineria = useMemo(
    () =>
      serie.map((d) => ({
        anio: d.anio,
        cobre: d.cobre_produccion_kt,
        oro: d.oro_produccion_t,
        pbi_pct: d.mineria_pbi_pct,
      })),
    [serie],
  );

  const serieSunat = useMemo(
    () =>
      serie.map((d) => ({
        anio: d.anio,
        recaudacion: escalar(d.sunat_recaudacion_soles, unidad),
      })),
    [serie, unidad],
  );

  if (macroQ.error) return <ErrorBox error={macroQ.error} />;
  if (macroQ.loading || recaudQ.loading)
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
  const varSunat =
    item && prev
      ? ((item.sunat_recaudacion_soles - prev.sunat_recaudacion_soles) / prev.sunat_recaudacion_soles) * 100
      : null;
  const varExport =
    item && prev
      ? ((item.exportaciones_usd - prev.exportaciones_usd) / prev.exportaciones_usd) * 100
      : null;

  return (
    <div className="space-y-6">
      <SourceBanner color="azul">
        <strong>Origen de los datos:</strong> Recaudación tributaria del{' '}
        <strong>SUNAT</strong> (Nota Tributaria mensual), comercio exterior
        del <strong>BCRP</strong> (exportaciones FOB / importaciones CIF en
        USD), producción minera del <strong>MINEM</strong> (Anuario Minero) y
        aporte al PBI según <strong>BCRP — Cuentas Nacionales</strong>.
      </SourceBanner>

      {/* KPIs macro */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          etiqueta={`Recaudación SUNAT ${anio}`}
          valor={`S/ ${escalar(item?.sunat_recaudacion_soles, unidad)?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
          unidadInline={suf}
          sub="Ingresos tributarios"
          variacion={varSunat}
          fuente="SUNAT"
          icono={Receipt}
        />
        <KpiCard
          etiqueta={`Exportaciones ${anio}`}
          valor={fmtUSD(item?.exportaciones_usd)}
          sub={`${item?.exportaciones_tradicionales_pct?.toFixed(0) ?? '—'}% tradicionales`}
          variacion={varExport}
          fuente="BCRP · FOB"
          icono={Ship}
        />
        <KpiCard
          etiqueta={`Importaciones ${anio}`}
          valor={fmtUSD(item?.importaciones_usd)}
          sub="Bienes y servicios"
          fuente="BCRP · CIF"
          icono={Anchor}
        />
        <KpiCard
          etiqueta={`Minería ${anio}`}
          valor={`${item?.mineria_pbi_pct?.toFixed(1) ?? '—'}%`}
          sub={`del PBI · Cu ${item?.cobre_produccion_kt?.toLocaleString('es-PE') ?? '—'} kt`}
          fuente="MINEM"
          icono={Pickaxe}
        />
      </div>

      {/* SUNAT recaudación */}
      <ChartContainer
        titulo="Recaudación tributaria SUNAT"
        descripcion={`Serie 1990-2026 · ${suf} · Gobierno Central`}
        fuente="SUNAT · Nota Tributaria"
        filas={serieSunat}
        nombreArchivo="sunat_recaudacion.csv"
        altura={340}
      >
        <ResponsiveContainer>
          <ComposedChart data={serieSunat} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSunat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [
                `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                'Recaudación',
              ]}
            />
            <Area
              type="monotone"
              dataKey="recaudacion"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#gradSunat)"
              name="Recaudación SUNAT"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Composición recaudación pie */}
        <ChartContainer
          titulo="Composición de la recaudación"
          descripcion="% del total de ingresos tributarios"
          fuente="SUNAT · promedios históricos"
          filas={recaudQ.data || []}
          nombreArchivo="composicion_recaudacion.csv"
          altura={340}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={recaudQ.data || []}
                dataKey="porcentaje"
                nameKey="concepto"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={55}
                paddingAngle={2}
                label={(p) => `${p.concepto}: ${p.porcentaje}%`}
                labelLine={false}
              >
                {(recaudQ.data || []).map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Comercio exterior */}
        <ChartContainer
          titulo="Comercio exterior"
          descripcion="Exportaciones vs importaciones · millones USD"
          fuente="BCRP · Balanza comercial"
          filas={serieComercio}
          nombreArchivo="comercio_exterior.csv"
          altura={340}
        >
          <ResponsiveContainer>
            <ComposedChart data={serieComercio} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [`US$ ${Number(v).toLocaleString('es-PE')} M`, n]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="exportaciones" stroke="#10B981" strokeWidth={3} dot={false} name="Exportaciones" />
              <Line type="monotone" dataKey="importaciones" stroke="#EF4444" strokeWidth={3} dot={false} name="Importaciones" />
              <Line type="monotone" dataKey="balanza" stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Balanza" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Minería */}
      <ChartContainer
        titulo="Minería: producción y aporte al PBI"
        descripcion="Cobre (miles de t · barras) · Oro (t · línea naranja) · % PBI (línea azul)"
        fuente="MINEM · BCRP"
        filas={serieMineria}
        nombreArchivo="mineria.csv"
        altura={380}
      >
        <ResponsiveContainer>
          <ComposedChart data={serieMineria} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(1)} k`} tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => {
                if (n === 'pbi_pct') return [`${Number(v).toFixed(2)}%`, '% del PBI'];
                if (n === 'cobre') return [`${Number(v).toLocaleString('es-PE')} kt`, 'Cobre'];
                if (n === 'oro') return [`${Number(v).toFixed(1)} t`, 'Oro'];
                return [v, n];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="cobre" fill="#A855F7" name="Cobre (kt)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="oro" stroke="#F59E0B" strokeWidth={3} dot={false} name="Oro (t)" />
            <Line yAxisId="right" type="monotone" dataKey="pbi_pct" stroke="#3B82F6" strokeWidth={3} dot={false} name="% del PBI" />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
