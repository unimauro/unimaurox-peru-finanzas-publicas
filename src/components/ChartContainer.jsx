import { Download, Info } from 'lucide-react';
import { exportarCSV } from '../utils/csv.js';

export default function ChartContainer({
  titulo,
  descripcion,
  fuente,
  filas,
  nombreArchivo = 'datos.csv',
  altura = 320,
  children,
  extra,
}) {
  return (
    <section className="card">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{titulo}</h3>
          {descripcion && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{descripcion}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {extra}
          {filas && filas.length > 0 && (
            <button
              className="btn"
              onClick={() => exportarCSV(filas, nombreArchivo)}
              title="Exportar a CSV"
            >
              <Download size={14} />
              <span className="hidden md:inline">CSV</span>
            </button>
          )}
        </div>
      </header>
      <div style={{ width: '100%', height: altura }}>{children}</div>
      {fuente && (
        <footer className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
          <Info size={11} />
          <span>Fuente: {fuente}</span>
        </footer>
      )}
    </section>
  );
}
