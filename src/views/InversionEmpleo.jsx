import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
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
import {
  Briefcase, Globe2, Users, BookOpen, Cpu, Building,
} from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonCard, SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import {
  cargarInversionEmpleo, cargarFdiPorPais, cargarPeaPorSector,
  cargarIDInternacional, cargarIDFuentes, cargarEgresadosPorArea,
  cargarIngenieriaDesagregada,
} from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';

const PALETA = ['#3B82F6', '#F59E0B', '#10B981', '#A855F7', '#EC4899', '#06B6D4',
                '#EF4444', '#84CC16', '#F97316', '#14B8A6', '#8B5CF6', '#0EA5E9'];

const fmtUSD = (v) => {
  if (v == null) return '—';
  const m = v / 1e6;
  if (Math.abs(m) >= 1000) return `US$ ${(m / 1000).toFixed(1)} mil M`;
  return `US$ ${m.toFixed(0)} M`;
};

export default function InversionEmpleo() {
  const { anio } = useFilters();
  const serieQ = useData(cargarInversionEmpleo, []);
  const fdiQ = useData(cargarFdiPorPais, []);
  const peaQ = useData(cargarPeaPorSector, []);
  const idIntQ = useData(cargarIDInternacional, []);
  const idFuQ = useData(cargarIDFuentes, []);
  const egrQ = useData(cargarEgresadosPorArea, []);
  const ingQ = useData(cargarIngenieriaDesagregada, []);

  const serie = useMemo(
    () =>
      [...(serieQ.data || [])].sort((a, b) => a.anio - b.anio).map((d) => ({
        anio: d.anio,
        inversion_priv: d.inversion_privada_usd / 1e6,
        fdi: d.fdi_usd / 1e6,
        informalidad: d.informalidad_pct,
        id_pct: d.id_pct_pbi,
        egresados: d.egresados_universitarios_total,
      })),
    [serieQ.data],
  );

  if (serieQ.error) return <ErrorBox error={serieQ.error} />;
  if (serieQ.loading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonChart altura={400} />
      </div>
    );

  const item = serie.find((d) => d.anio === anio) || serie[serie.length - 1];
  const prev = serie.find((d) => d.anio === anio - 1);
  const varInv = item && prev ? ((item.inversion_priv - prev.inversion_priv) / prev.inversion_priv) * 100 : null;
  const varFdi = item && prev && prev.fdi ? ((item.fdi - prev.fdi) / prev.fdi) * 100 : null;

  return (
    <div className="space-y-6">
      <SourceBanner color="azul">
        <strong>Origen de los datos:</strong> Inversión privada e IED del{' '}
        <strong>BCRP</strong> (Balanza de Pagos), informalidad y empleo
        sectorial del <strong>INEI</strong> (ENAHO), gasto en I+D del{' '}
        <strong>CONCYTEC + UNESCO UIS</strong>, egresados universitarios de{' '}
        <strong>SUNEDU</strong>. Composición de la IED por país de origen:{' '}
        <strong>ProInversión</strong>.
      </SourceBanner>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          etiqueta={`Inversión privada ${anio}`}
          valor={fmtUSD(item?.inversion_priv * 1e6)}
          sub="Nacional + extranjera"
          variacion={varInv}
          fuente="BCRP"
          icono={Building}
        />
        <KpiCard
          etiqueta={`IED (FDI) ${anio}`}
          valor={fmtUSD(item?.fdi * 1e6)}
          sub="Inversión Extranjera Directa neta"
          variacion={varFdi}
          fuente="BCRP · Balanza de Pagos"
          icono={Globe2}
        />
        <KpiCard
          etiqueta={`Informalidad ${anio}`}
          valor={`${item?.informalidad?.toFixed(1) ?? '—'}%`}
          sub="PEA con empleo informal"
          fuente="INEI · ENAHO"
          icono={Users}
        />
        <KpiCard
          etiqueta={`Gasto I+D ${anio}`}
          valor={`${item?.id_pct?.toFixed(2) ?? '—'}%`}
          sub="del PBI (ref. OECD: 2.7%)"
          fuente="CONCYTEC / UNESCO"
          icono={Cpu}
        />
      </div>

      {/* Inversión total + FDI */}
      <ChartContainer
        titulo="Inversión privada total y Extranjera Directa (FDI)"
        descripcion="Millones de USD · Inversión bruta fija privada y flujo neto de IED"
        fuente="BCRP · Balanza de Pagos"
        filas={serie}
        nombreArchivo="inversion_privada_fdi.csv"
        altura={380}
      >
        <ResponsiveContainer>
          <ComposedChart data={serie} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [
                `US$ ${Number(v).toLocaleString('es-PE')} M`,
                n === 'inversion_priv' ? 'Inversión privada total' : 'IED (flujo neto)',
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="inversion_priv" fill="#3B82F6" name="Inversión privada total"
                 radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="fdi" stroke="#F59E0B" strokeWidth={3}
                  dot={false} name="IED neta" />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* FDI por país + PEA por sector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          titulo="IED por país de origen (stock acumulado)"
          descripcion="% del stock total · datos ProInversión"
          fuente="ProInversión · Reporte Anual"
          filas={fdiQ.data || []}
          nombreArchivo="fdi_por_pais.csv"
          altura={400}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={fdiQ.data || []}
                dataKey="porcentaje"
                nameKey="pais"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={55}
                paddingAngle={2}
                label={(p) => `${p.pais}: ${p.porcentaje}%`}
                labelLine={false}
              >
                {(fdiQ.data || []).map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          titulo="PEA ocupada por sector económico"
          descripcion={`Año 2024 · % de la PEA total · barras = informalidad sectorial`}
          fuente="INEI · ENAHO"
          filas={peaQ.data || []}
          nombreArchivo="pea_por_sector.csv"
          altura={400}
        >
          <ResponsiveContainer>
            <BarChart
              data={(peaQ.data || []).map((d, i) => ({ ...d, color: PALETA[i % PALETA.length] }))}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="sector" width={150} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [
                  `${Number(v).toFixed(1)}%`,
                  n === 'pct' ? 'Participación' : 'Informalidad sectorial',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pct" fill="#3B82F6" name="% de la PEA" radius={[0, 4, 4, 0]} />
              <Bar dataKey="informalidad_pct" fill="#EF4444" name="% informalidad" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Informalidad histórica */}
      <ChartContainer
        titulo="Evolución de la informalidad laboral"
        descripcion="% de la PEA ocupada con empleo informal · serie 2007-2026"
        fuente="INEI · ENAHO"
        filas={serie.filter((d) => d.informalidad != null)}
        nombreArchivo="informalidad_serie.csv"
        altura={320}
      >
        <ResponsiveContainer>
          <AreaChart data={serie.filter((d) => d.informalidad != null)}
                     margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradInf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[60, 85]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Informalidad']}
            />
            <Area type="monotone" dataKey="informalidad" stroke="#EF4444"
                  strokeWidth={3} fill="url(#gradInf)" name="Informalidad" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* I+D internacional + fuentes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartContainer
          titulo="Gasto en I+D · Perú vs el mundo"
          descripcion="% del PBI · 2023"
          fuente="UNESCO UIS · CONCYTEC"
          filas={idIntQ.data || []}
          nombreArchivo="id_internacional.csv"
          altura={360}
        >
          <ResponsiveContainer>
            <BarChart
              data={(idIntQ.data || []).sort((a, b) => b.pct_pbi - a.pct_pbi)}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 70, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="pais" width={120} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`, '% del PBI']}
              />
              <Bar dataKey="pct_pbi" radius={[0, 4, 4, 0]}>
                {(idIntQ.data || []).map((d, i) => (
                  <Cell key={i} fill={d.pais === 'Perú' ? '#EF4444' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          titulo="¿Quién financia la I+D en Perú?"
          descripcion="% del gasto total"
          fuente="CONCYTEC"
          filas={idFuQ.data || []}
          nombreArchivo="id_fuentes.csv"
          altura={360}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={idFuQ.data || []}
                dataKey="pct"
                nameKey="fuente"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={45}
                paddingAngle={2}
                label={(p) => `${p.pct}%`}
                labelLine={false}
              >
                {(idFuQ.data || []).map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          titulo="Egresados universitarios por área"
          descripcion="% del total anual · SUNEDU 2023"
          fuente="SUNEDU"
          filas={egrQ.data || []}
          nombreArchivo="egresados_por_area.csv"
          altura={360}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={egrQ.data || []}
                dataKey="pct"
                nameKey="area"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={45}
                paddingAngle={2}
                label={(p) => `${p.pct}%`}
                labelLine={false}
              >
                {(egrQ.data || []).map((d, i) => (
                  <Cell key={i} fill={d.color || PALETA[i % PALETA.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Ingeniería desagregada */}
      <ChartContainer
        titulo="Ingeniería desagregada por carrera"
        descripcion="% dentro del área de Ingeniería y Tecnología (Civil, Industrial, Sistemas...)"
        fuente="SUNEDU · Egresados universitarios"
        filas={ingQ.data || []}
        nombreArchivo="ingenieria_desagregada.csv"
        altura={Math.max(360, (ingQ.data || []).length * 32)}
      >
        <ResponsiveContainer>
          <BarChart
            data={(ingQ.data || []).sort((a, b) => b.pct - a.pct)}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="carrera" width={200} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v}%`, '% de ingeniería']}
            />
            <Bar dataKey="pct" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
