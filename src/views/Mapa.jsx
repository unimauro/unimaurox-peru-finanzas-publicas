import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import ChartContainer from '../components/ChartContainer.jsx';
import SourceBanner from '../components/SourceBanner.jsx';
import { SkeletonChart } from '../components/Skeleton.jsx';
import ErrorBox from '../components/ErrorBox.jsx';
import { useData } from '../hooks/useData.js';
import { cargarPresupuestoRegional, cargarMapaPeru, cargarPoblacion } from '../utils/data.js';
import { useFilters } from '../context/FilterContext.jsx';
import { escalar, sufijoUnidad, tickSoles } from '../utils/format.js';

const METRICAS = [
  { v: 'pim', l: 'Presupuesto (PIM)' },
  { v: 'devengado', l: 'Ejecución (Devengado)' },
  { v: 'ejecucion_pct', l: '% Ejecución' },
  { v: 'per_capita', l: 'Per cápita' },
];

// Normalizador robusto para nombres de regiones (acentos, mayúsculas, espacios)
function norm(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .trim();
}

export default function Mapa() {
  const { anio, unidad } = useFilters();
  const [metrica, setMetrica] = useState('pim');
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  const mapaQ = useData(cargarMapaPeru, []);
  const presRegQ = useData(cargarPresupuestoRegional, []);
  const pobQ = useData(cargarPoblacion, []);

  // Soporta tanto GeoJSON (FeatureCollection) como TopoJSON
  const features = useMemo(() => {
    if (!mapaQ.data) return [];
    if (mapaQ.data.type === 'FeatureCollection') return mapaQ.data.features;
    if (mapaQ.data.objects) {
      const firstKey = Object.keys(mapaQ.data.objects)[0];
      return feature(mapaQ.data, mapaQ.data.objects[firstKey]).features;
    }
    return [];
  }, [mapaQ.data]);

  // Mapa: regionKey → valor según métrica/año
  const valoresPorRegion = useMemo(() => {
    const m = new Map();
    if (!presRegQ.data) return m;
    const pob = new Map((pobQ.data || []).map((p) => [norm(p.region), p]));
    presRegQ.data
      .filter((d) => d.anio === anio)
      .forEach((d) => {
        const key = norm(d.region);
        const pobAnio = pob.get(key)?.poblacion?.[anio];
        const ejec = d.pim_soles ? (d.devengado_soles / d.pim_soles) * 100 : null;
        let valor;
        switch (metrica) {
          case 'pim':
            valor = d.pim_soles;
            break;
          case 'devengado':
            valor = d.devengado_soles;
            break;
          case 'ejecucion_pct':
            valor = ejec;
            break;
          case 'per_capita':
            valor = pobAnio ? d.pim_soles / pobAnio : null;
            break;
          default:
            valor = d.pim_soles;
        }
        m.set(key, {
          valor,
          region: d.region,
          pim: d.pim_soles,
          devengado: d.devengado_soles,
          ejecucion_pct: ejec,
          per_capita: pobAnio ? d.pim_soles / pobAnio : null,
          poblacion: pobAnio,
        });
      });
    return m;
  }, [presRegQ.data, pobQ.data, anio, metrica]);

  // Escala de color
  const escalaColor = useMemo(() => {
    const valores = Array.from(valoresPorRegion.values())
      .map((v) => v.valor)
      .filter((v) => v != null && !Number.isNaN(v));
    if (valores.length === 0) return () => '#e2e8f0';
    const interpolator =
      metrica === 'ejecucion_pct' ? d3.interpolateRdYlGn : d3.interpolateYlOrRd;
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const scale = d3.scaleSequential(interpolator).domain([min, max]);
    return (v) => (v == null ? '#e2e8f0' : scale(v));
  }, [valoresPorRegion, metrica]);

  // Dibuja con D3
  useEffect(() => {
    if (!svgRef.current || features.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 600;
    const height = 600;
    const projection = d3.geoMercator().fitSize([width, height], { type: 'FeatureCollection', features });
    const path = d3.geoPath().projection(projection);

    const getKey = (props) =>
      norm(props.NOMBDEP || props.name || props.NAME_1 || props.region || props.NOMBRE);

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg
      .append('g')
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', (d) => escalaColor(valoresPorRegion.get(getKey(d.properties))?.valor))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.5)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('stroke-width', 2).attr('stroke', '#D91023');
        const info = valoresPorRegion.get(getKey(d.properties));
        setHover({
          nombre:
            info?.region ||
            d.properties.NOMBDEP ||
            d.properties.name ||
            d.properties.NAME_1 ||
            'Región',
          ...info,
        });
      })
      .on('mousemove', (event) => {
        if (tooltipRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          tooltipRef.current.style.left = `${event.clientX - rect.left + 12}px`;
          tooltipRef.current.style.top = `${event.clientY - rect.top + 12}px`;
        }
      })
      .on('mouseleave', function () {
        d3.select(this).attr('stroke-width', 0.5).attr('stroke', '#1e293b');
        setHover(null);
      });
  }, [features, valoresPorRegion, escalaColor]);

  if (mapaQ.error || presRegQ.error)
    return <ErrorBox error={mapaQ.error || presRegQ.error} mensaje="Falta peru.geojson o presupuesto_por_region.json" />;
  if (mapaQ.loading || presRegQ.loading || pobQ.loading) return <SkeletonChart altura={600} />;

  // Ranking
  const ranking = Array.from(valoresPorRegion.entries())
    .map(([_k, v]) => v)
    .filter((v) => v.valor != null)
    .sort((a, b) => b.valor - a.valor);

  const filasExport = ranking.map((r) => ({
    region: r.region,
    anio,
    pim_soles: r.pim,
    devengado_soles: r.devengado,
    ejecucion_pct: r.ejecucion_pct,
    poblacion: r.poblacion,
    per_capita_soles: r.per_capita,
  }));

  const suf = sufijoUnidad(unidad);
  const fmtValor = (v) => {
    if (v == null) return '—';
    if (metrica === 'ejecucion_pct') return `${v.toFixed(1)}%`;
    if (metrica === 'per_capita') return `S/ ${v.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
    return `S/ ${escalar(v, unidad).toLocaleString('es-PE', { maximumFractionDigits: 1 })} ${suf}`;
  };

  return (
    <div className="space-y-6">
      <SourceBanner color="ambar">
        <strong>Origen de los datos:</strong> Presupuesto por región desde los
        totales del <strong>MEF</strong> distribuidos por pesos regionales
        históricos. Población departamental: proyecciones del <strong>INEI</strong>.
        GeoJSON: 25 departamentos del Perú (Callao separado; Lima Metropolitana
        y Lima Provincias agregadas).
      </SourceBanner>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {METRICAS.map((m) => (
            <button
              key={m.v}
              onClick={() => setMetrica(m.v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                metrica === m.v
                  ? 'bg-peru-azul text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {m.l}
            </button>
          ))}
        </div>
        <span className="chip">Año seleccionado: {anio}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="card relative !p-3 sm:!p-5 lg:col-span-2">
          <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
            Mapa coroplético del Perú · {METRICAS.find((m) => m.v === metrica)?.l}
          </h3>
          <svg ref={svgRef} className="h-auto w-full" style={{ maxHeight: 600 }} />
          {hover && (
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-20 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800"
              style={{ minWidth: 200 }}
            >
              <p className="font-semibold text-slate-900 dark:text-white">{hover.nombre}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">PIM: {fmtValor(hover.pim)}</p>
              <p className="text-slate-500 dark:text-slate-400">Devengado: {fmtValor(hover.devengado)}</p>
              <p className="text-slate-500 dark:text-slate-400">
                Ejecución: {hover.ejecucion_pct?.toFixed(1) ?? '—'}%
              </p>
              {hover.per_capita != null && (
                <p className="text-slate-500 dark:text-slate-400">
                  Per cápita: S/ {hover.per_capita.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-400">
            Fuente: MEF · Consulta Amigable + INEI (población departamental).
          </p>
        </div>

        <ChartContainer
          titulo="Ranking de regiones"
          descripcion={`${anio} · ${METRICAS.find((m) => m.v === metrica)?.l}`}
          fuente="MEF + INEI"
          filas={filasExport}
          nombreArchivo={`ranking_regiones_${anio}.csv`}
          altura={Math.min(600, ranking.length * 24 + 20)}
        >
          <div className="h-full overflow-y-auto pr-1">
            <ol className="space-y-1">
              {ranking.map((r, i) => (
                <li
                  key={r.region}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-right font-mono text-slate-400">{i + 1}</span>
                    <span className="text-slate-700 dark:text-slate-200">{r.region}</span>
                  </span>
                  <span className="font-mono font-medium text-peru-azul dark:text-white">
                    {fmtValor(r.valor)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
