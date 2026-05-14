// Exportar arreglo de objetos a CSV y descargar como archivo

export function exportarCSV(filas, nombreArchivo = 'datos.csv') {
  if (!Array.isArray(filas) || filas.length === 0) return;
  const headers = Object.keys(filas[0]);
  const escapar = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(','),
    ...filas.map((f) => headers.map((h) => escapar(f[h])).join(',')),
  ].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
