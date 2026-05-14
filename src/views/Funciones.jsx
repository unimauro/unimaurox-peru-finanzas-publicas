import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  HeartPulse,
  GraduationCap,
  HardHat,
  Shield,
  HandHeart,
} from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import { cargarPresupuestoFuncion } from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, tickSoles } from '../utils/format.js';

const FUNCIONES = [
  { key: 'Educación', color: '#3B82F6', icon: GraduationCap },
  { key: 'Salud', color: '#EF4444', icon: HeartPulse },
  { key: 'Construcción y Vivienda', color: '#F59E0B', icon: HardHat },
  { key: 'Defensa y Seguridad', color: '#A855F7', icon: Shield },
  { key: 'Programas Sociales', color: '#10B981', icon: HandHeart },
];

export default function Funciones() {
  const { anio, unidad } = useFilters();
  const fnQ = useData(cargarPresupuestoFuncion, []);

  // Datos del año seleccionado por función
  const porFuncionAnio = useMemo(() => {
    const m = new Map();
    (fnQ.data || [])
      .filter((d) => d.anio === anio)
      .forEach((d) => m.set(d.funcion, d));
    return m;
  }, [fnQ.data, anio]);

  // Serie temporal por función (pivot wide para line chart)
  const serieAncha = useMemo(() => {
    const anios = Array.from(new Set((fnQ.data || []).map((d) => d.anio))).sort();
    return anios.map((a) => {
      const row = { anio: a };
      FUNCIONES.forEach((f) => {
        const d = (fnQ.data || []).find((x) => x.anio === a && x.funcion === f.key);
        row[f.key] = d ? escalar(d.pim_soles, unidad) : null;
      });
      return row;
    });
  }, [fnQ.data, unidad]);

  // Serie de % del PIM total por función
  const seriePctTotal = useMemo(() => {
    const anios = Array.from(new Set((fnQ.data || []).map((d) => d.anio))).sort();
    return anios.map((a) => {
      const row = { anio: a };
      FUNCIONES.forEach((f) => {
        const d = (fnQ.data || []).find((x) => x.anio === a && x.funcion === f.key);
        row[f.key] = d?.pct_pim_total ?? null;
      });
      return row;
    });
  }, [fnQ.data]);

  if (fnQ.error) return <ErrorBox error={fnQ.error} />;
  if (fnQ.loading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonChart altura={400} />
      </div>
    );

  const suf = sufijoUnidad(unidad);

  return (
    <div className="space-y-6">
      <SourceBanner color="ambar">
        <strong>Origen de los datos:</strong> Presupuesto Institucional Modificado
        (PIM) y Devengado del <strong>MEF · Consulta Amigable (SIAF)</strong>{' '}
        agregado por función. Las 5 áreas mostradas son las prioridades del
        gasto social y de infraestructura: <em>Educación, Salud, Construcción,
        Defensa y Programas Sociales</em>. Series desde 1990 (los Programas
        Sociales como categoría se consolidan con la creación del MIDIS en 2011).
      </SourceBanner>

      {/* KPIs 5 funciones */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {FUNCIONES.map(({ key, color, icon: Icon }) => {
          const d = porFuncionAnio.get(key);
          const ejec = d?.pim_soles ? (d.devengado_soles / d.pim_soles) * 100 : null;
          return (
            <KpiCard
              key={key}
              etiqueta={key}
              valor={`S/ ${escalar(d?.pim_soles, unidad)?.toLocaleString('es-PE', { maximumFractionDigits: 1 }) ?? '—'}`}
              unidadInline={suf}
              sub={`${d?.pct_pim_total?.toFixed(1) ?? '—'}% del PIM · ${ejec?.toFixed(0) ?? '—'}% ejec`}
              fuente="MEF"
              icono={Icon}
            />
          );
        })}
      </div>

      {/* Evolución absoluta */}
      <ChartContainer
        titulo="Evolución del presupuesto por función · 1990-2026"
        descripcion={`PIM en ${suf}`}
        fuente="MEF · Consulta Amigable"
        filas={serieAncha}
        nombreArchivo="presupuesto_funcion_pim.csv"
        altura={400}
      >
        <ResponsiveContainer>
          <LineChart data={serieAncha} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {FUNCIONES.map((f) => (
              <Line
                key={f.key}
                type="monotone"
                dataKey={f.key}
                stroke={f.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Composición % del PIM en el tiempo (stacked area) */}
      <ChartContainer
        titulo="Participación de cada función en el PIM total"
        descripcion="% del PIM total · stacked"
        fuente="MEF"
        filas={seriePctTotal}
        nombreArchivo="presupuesto_funcion_pct.csv"
        altura={380}
      >
        <ResponsiveContainer>
          <AreaChart data={seriePctTotal} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [`${Number(v).toFixed(1)}%`, n]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {FUNCIONES.map((f) => (
              <Area
                key={f.key}
                type="monotone"
                dataKey={f.key}
                stackId="1"
                stroke={f.color}
                strokeWidth={1.5}
                fill={f.color}
                fillOpacity={0.65}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Comparativo año actual */}
      <ChartContainer
        titulo={`Ranking de funciones · ${anio}`}
        descripcion={`PIM en ${suf}`}
        fuente="MEF"
        filas={FUNCIONES.map((f) => {
          const d = porFuncionAnio.get(f.key);
          return {
            funcion: f.key,
            pim: escalar(d?.pim_soles, unidad),
            devengado: escalar(d?.devengado_soles, unidad),
            pct: d?.pct_pim_total,
          };
        })}
        nombreArchivo={`ranking_funciones_${anio}.csv`}
        altura={320}
      >
        <ResponsiveContainer>
          <BarChart
            data={FUNCIONES.map((f) => {
              const d = porFuncionAnio.get(f.key);
              return {
                funcion: f.key,
                pim: escalar(d?.pim_soles, unidad),
                devengado: escalar(d?.devengado_soles, unidad),
                color: f.color,
              };
            }).sort((a, b) => (b.pim ?? 0) - (a.pim ?? 0))}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" tickFormatter={(v) => tickSoles(v, unidad)} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="funcion" width={150} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [
                `S/ ${Number(v).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`,
                n,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="pim" name="PIM" radius={[0, 4, 4, 0]}>
              {FUNCIONES.map((f) => (
                <Bar key={f.key} fill={f.color} />
              ))}
            </Bar>
            <Bar dataKey="devengado" name="Devengado" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
