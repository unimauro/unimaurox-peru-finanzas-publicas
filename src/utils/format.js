// Formateadores para soles peruanos y porcentajes

const nfPEN = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 0,
});

const nfNum = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 });
const nfInt = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
const nfPct = new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 });

// Convierte un valor en soles a la unidad seleccionada.
// unidad: 'soles' | 'miles' | 'millones' | 'miles-millones'
export function escalar(valorSoles, unidad = 'millones') {
  if (valorSoles == null || Number.isNaN(valorSoles)) return null;
  switch (unidad) {
    case 'soles':
      return valorSoles;
    case 'miles':
      return valorSoles / 1e3;
    case 'millones':
      return valorSoles / 1e6;
    case 'miles-millones':
      return valorSoles / 1e9;
    default:
      return valorSoles;
  }
}

export function sufijoUnidad(unidad) {
  return {
    soles: 'S/',
    miles: 'mil S/',
    millones: 'millones S/',
    'miles-millones': 'mil millones S/',
  }[unidad] || '';
}

// Formato corto con prefijo de moneda y la unidad ya escalada
export function formatSolesCorto(valor, unidad = 'millones') {
  const v = escalar(valor, unidad);
  if (v == null) return '—';
  const abs = Math.abs(v);
  const fixed = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return `S/ ${v.toLocaleString('es-PE', { maximumFractionDigits: fixed })}`;
}

// Cifra cruda con separadores de miles
export function formatNumero(v) {
  if (v == null || Number.isNaN(v)) return '—';
  return nfNum.format(v);
}

export function formatEntero(v) {
  if (v == null || Number.isNaN(v)) return '—';
  return nfInt.format(v);
}

export function formatPorcentaje(v, decimales = 1) {
  if (v == null || Number.isNaN(v)) return '—';
  // v se asume en escala 0-1 si es < 5, sino como porcentaje literal
  const valor = Math.abs(v) <= 5 ? v : v / 100;
  return new Intl.NumberFormat('es-PE', {
    style: 'percent',
    maximumFractionDigits: decimales,
  }).format(valor);
}

// Para variaciones que ya vienen en % (ej. 5.2 significa 5.2%)
export function formatPctLiteral(v, decimales = 1) {
  if (v == null || Number.isNaN(v)) return '—';
  const signo = v > 0 ? '+' : '';
  return `${signo}${v.toLocaleString('es-PE', { maximumFractionDigits: decimales })}%`;
}

export function formatSolesPEN(v) {
  if (v == null || Number.isNaN(v)) return '—';
  return nfPEN.format(v);
}

// Etiqueta amigable para eje de gráficos (S/ 4.2 mil M)
export function tickSoles(v, unidad = 'millones') {
  if (v == null) return '';
  const abs = Math.abs(v);
  if (unidad === 'millones' && abs >= 1000) {
    return `${(v / 1000).toFixed(1)} mil M`;
  }
  if (unidad === 'millones' && abs >= 10) {
    return `${v.toFixed(0)} M`;
  }
  return v.toLocaleString('es-PE', { maximumFractionDigits: 1 });
}
