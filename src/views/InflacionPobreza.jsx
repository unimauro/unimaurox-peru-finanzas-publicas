import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, DollarSign, Users, Home } from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import {
  cargarInflacionPobreza,
  cargarIpcDesagregado,
  cargarPobrezaUrbanaRural,
  cargarPobrezaPorRegion,
} from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';

export default function InflacionPobreza() {
  const { anio } = useFilters();
  const serieQ = useData(cargarInflacionPobreza, []);
  const ipcQ = useData(cargarIpcDesagregado, []);
  const urQ = useData(cargarPobrezaUrbanaRural, []);
  const regQ = useData(cargarPobrezaPorRegion, []);

  const [verHiper, setVerHiper] = useState(false);

  const serie = useMemo(
    () => [...(serieQ.data || [])].sort((a, b) => a.anio - b.anio),
    [serieQ.data],
  );

  // Para inflación, separamos visualmente la hiperinflación
  const serieInflacion = useMemo(() => {
    const inicio = verHiper ? 1990 : 1995;
    return serie.filter((d) => d.anio >= inicio && d.inflacion_pct != null).map((d) => ({
      anio: d.anio,
      inflacion: d.inflacion_pct,
    }));
  }, [serie, verHiper]);

  const serieTC = useMemo(
    () =>
      serie.filter((d) => d.tipo_cambio_sol_usd != null).map((d) => ({
        anio: d.anio,
        tc: d.tipo_cambio_sol_usd,
      })),
    [serie],
  );

  const seriePobreza = useMemo(
    () =>
      serie
        .filter((d) => d.pobreza_total_pct != null)
        .map((d) => ({
          anio: d.anio,
          pobreza: d.pobreza_total_pct,
          extrema: d.pobreza_extrema_pct,
        })),
    [serie],
  );

  if (serieQ.error) return <ErrorBox error={serieQ.error} />;
  if (serieQ.loading || ipcQ.loading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonChart altura={400} />
      </div>
    );

  const item = serie.find((d) => d.anio === anio) || serie[serie.length - 1];

  // Ranking pobreza regional (desc)
  const rankingRegion = [...(regQ.data || [])].sort((a, b) => b.pobreza_pct - a.pobreza_pct);

  return (
    <div className="space-y-6">
      <SourceBanner color="azul">
        <strong>Origen de los datos:</strong> Inflación y tipo de cambio del{' '}
        <strong>BCRP</strong> (Reporte de Inflación + Cuadros Anuales). IPC
        desagregado por grupo del <strong>INEI</strong>. Pobreza monetaria y
        extrema, urbana/rural y por región: <strong>INEI · ENAHO</strong>{' '}
        (Encuesta Nacional de Hogares). Cambio metodológico de pobreza en 2004.
      </SourceBanner>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          etiqueta={`Inflación ${anio}`}
          valor={`${item?.inflacion_pct?.toFixed(1) ?? '—'}%`}
          sub="Variación anual del IPC"
          fuente="BCRP"
          icono={TrendingUp}
        />
        <KpiCard
          etiqueta={`Tipo de cambio ${anio}`}
          valor={`S/ ${item?.tipo_cambio_sol_usd?.toFixed(2) ?? '—'}`}
          sub="Promedio anual S/ por USD"
          fuente="BCRP"
          icono={DollarSign}
        />
        <KpiCard
          etiqueta={`Pobreza monetaria ${anio}`}
          valor={`${item?.pobreza_total_pct?.toFixed(1) ?? '—'}%`}
          sub={`Pobreza extrema: ${item?.pobreza_extrema_pct?.toFixed(1) ?? '—'}%`}
          fuente="INEI · ENAHO"
          icono={Users}
        />
        <KpiCard
          etiqueta={`Línea de pobreza ${anio}`}
          valor={`S/ ${item?.linea_pobreza_soles_mes?.toLocaleString('es-PE') ?? '—'}`}
          sub="por persona / mes"
          fuente="INEI"
          icono={Home}
        />
      </div>

      {/* Inflación */}
      <ChartContainer
        titulo={`Inflación anual del Perú · ${verHiper ? '1990' : '1995'}-2026`}
        descripcion={
          verHiper
            ? '⚠️ 1990 = 7,649.6% (hiperinflación post Inti). Eje en escala logarítmica.'
            : 'Variación del IPC. La meta del BCRP es 1-3%. Boom inflacionario 2021-22 post-pandemia.'
        }
        fuente="BCRP · IPC fin de periodo"
        filas={serieInflacion}
        nombreArchivo="inflacion_anual.csv"
        altura={380}
        extra={
          <button
            onClick={() => setVerHiper((v) => !v)}
            className="btn !px-2 !py-1 text-xs"
          >
            {verHiper ? 'Ocultar hiper 90-92' : 'Ver hiperinflación 1990-92'}
          </button>
        }
      >
        <ResponsiveContainer>
          <ComposedChart data={serieInflacion} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis
              scale={verHiper ? 'log' : 'auto'}
              domain={verHiper ? [0.1, 10000] : [-2, 'auto']}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Inflación']}
            />
            <ReferenceLine y={3} stroke="#10B981" strokeDasharray="4 4"
                           label={{ value: 'Meta BCRP 3%', position: 'right', fontSize: 10, fill: '#10B981' }} />
            <Bar dataKey="inflacion" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Tipo de cambio + IPC desagregado */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          titulo="Tipo de cambio S/ por USD · 1990-2026"
          descripcion="Promedio anual · BCRP"
          fuente="BCRP"
          filas={serieTC}
          nombreArchivo="tipo_cambio.csv"
          altura={360}
        >
          <ResponsiveContainer>
            <AreaChart data={serieTC} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `S/ ${v}`} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`S/ ${Number(v).toFixed(2)}`, 'TC']}
              />
              <Area
                type="monotone"
                dataKey="tc"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#gradTC)"
                name="S/ por USD"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          titulo="¿Qué subió más en el último año?"
          descripcion="Variación 2024 del IPC por grupo · INEI"
          fuente="INEI · IPC nacional"
          filas={ipcQ.data || []}
          nombreArchivo="ipc_desagregado.csv"
          altura={360}
        >
          <ResponsiveContainer>
            <BarChart
              data={[...(ipcQ.data || [])].sort((a, b) => b.variacion_pct - a.variacion_pct)}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 130, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="grupo" width={170} tick={{ fontSize: 9 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v, n, p) => [
                  `${Number(v).toFixed(1)}%  ·  peso canasta ${p.payload.peso_canasta}%`,
                  'Variación',
                ]}
              />
              <ReferenceLine x={0} stroke="#64748b" />
              <Bar dataKey="variacion_pct" radius={[0, 4, 4, 0]}>
                {(ipcQ.data || []).map((d, i) => (
                  <Bar key={i} fill={d.variacion_pct < 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Pobreza nacional */}
      <ChartContainer
        titulo="Pobreza monetaria nacional · 1997-2026"
        descripcion="% de la población · Pobreza total (línea roja) y pobreza extrema (área verde)"
        fuente="INEI · ENAHO"
        filas={seriePobreza}
        nombreArchivo="pobreza_nacional.csv"
        altura={380}
      >
        <ResponsiveContainer>
          <ComposedChart data={seriePobreza} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPobreza" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 60]} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [
                `${Number(v).toFixed(1)}%`,
                n === 'pobreza' ? 'Pobreza total' : 'Pobreza extrema',
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="pobreza" stroke="#EF4444" strokeWidth={3}
                  fill="url(#gradPobreza)" name="Pobreza total" />
            <Line type="monotone" dataKey="extrema" stroke="#F59E0B" strokeWidth={2.5}
                  dot={{ r: 3 }} name="Pobreza extrema" />
            <ReferenceLine x={2020} stroke="#94a3b8" strokeDasharray="4 4"
                           label={{ value: 'COVID', position: 'top', fontSize: 10, fill: '#94a3b8' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Urbana vs rural + Ranking regional */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ChartContainer
            titulo="Pobreza urbana vs rural"
            descripcion="% de la población · serie INEI"
            fuente="INEI · ENAHO"
            filas={urQ.data || []}
            nombreArchivo="pobreza_urbana_rural.csv"
            altura={380}
          >
            <ResponsiveContainer>
              <LineChart data={urQ.data || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 90]} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  formatter={(v, n) => [`${Number(v).toFixed(1)}%`, n === 'urbana' ? 'Urbana' : 'Rural']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="urbana" stroke="#3B82F6" strokeWidth={3}
                      dot={{ r: 3 }} name="Pobreza urbana" />
                <Line type="monotone" dataKey="rural" stroke="#F59E0B" strokeWidth={3}
                      dot={{ r: 3 }} name="Pobreza rural" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="lg:col-span-3">
          <ChartContainer
            titulo="Pobreza monetaria por región · 2024"
            descripcion="% de la población · 25 departamentos + Callao"
            fuente="INEI · ENAHO 2024"
            filas={rankingRegion}
            nombreArchivo="pobreza_por_region_2024.csv"
            altura={Math.max(380, rankingRegion.length * 16)}
          >
            <ResponsiveContainer>
              <BarChart
                data={rankingRegion}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="region" width={110} tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Pobreza']}
                />
                <ReferenceLine x={27.6} stroke="#94a3b8" strokeDasharray="4 4"
                               label={{ value: 'Promedio nacional 27.6%', position: 'top', fontSize: 9, fill: '#94a3b8' }} />
                <Bar dataKey="pobreza_pct" radius={[0, 4, 4, 0]}>
                  {rankingRegion.map((d, i) => (
                    <Bar key={i} fill={d.pobreza_pct > 30 ? '#EF4444' : d.pobreza_pct > 20 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
