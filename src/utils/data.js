// Cargador centralizado de los datasets JSON desde public/data
// Usa import.meta.env.BASE_URL para que funcione en GitHub Pages

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const cache = new Map();

async function fetchJSON(ruta) {
  if (cache.has(ruta)) return cache.get(ruta);
  const url = `${BASE}/data/${ruta}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
  const json = await res.json();
  cache.set(ruta, json);
  return json;
}

export const cargarPBI = () => fetchJSON('pbi.json');
export const cargarDeuda = () => fetchJSON('deuda.json');
export const cargarPresupuesto = () => fetchJSON('presupuesto.json');
export const cargarPresupuestoRegional = () => fetchJSON('presupuesto_por_region.json');
export const cargarPresupuestoCartera = () => fetchJSON('presupuesto_por_cartera.json');
export const cargarPresupuestoFuncion = () => fetchJSON('presupuesto_funcion.json');
export const cargarMacroeconomico = () => fetchJSON('macroeconomico.json');
export const cargarComposicionRecaudacion = () => fetchJSON('composicion_recaudacion.json');
export const cargarCanonInversion = () => fetchJSON('canon_inversion.json');
export const cargarCanonRegional = () => fetchJSON('canon_por_region.json');
export const cargarObrasTopEmpresas = () => fetchJSON('obras_top_empresas.json');
export const cargarInversionComponentes = () => fetchJSON('inversion_componentes.json');
export const cargarCarteraProyectos = () => fetchJSON('cartera_proyectos_mineros.json');
export const cargarPoblacion = () => fetchJSON('poblacion.json');
export const cargarMetadata = () => fetchJSON('metadata.json');

// Carga el mapa del Perú. Soporta GeoJSON (FeatureCollection) o TopoJSON.
export async function cargarMapaPeru() {
  if (cache.has('mapa')) return cache.get('mapa');
  const url = `${BASE}/data/peru.geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  const data = await res.json();
  cache.set('mapa', data);
  return data;
}

// Alias retrocompatible
export const cargarTopoPeru = cargarMapaPeru;
