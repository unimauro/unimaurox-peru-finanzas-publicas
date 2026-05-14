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
    <section className="card !p-3 sm:!p-5">
      <header className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
            {titulo}
          </h3>
          {descripcion && (
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
              {descripcion}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          {extra}
          {filas && filas.length > 0 && (
            <button
              className="btn !px-2 !py-1 text-xs sm:!px-3 sm:!py-1.5 sm:text-sm"
              onClick={() => exportarCSV(filas, nombreArchivo)}
              title="Exportar a CSV"
            >
              <Download size={14} />
              <span className="hidden md:inline">CSV</span>
            </button>
          )}
        </div>
      </header>
      <div className="w-full" style={{ height: altura, minHeight: 240 }}>
        {children}
      </div>
      {fuente && (
        <footer className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 sm:mt-3 sm:text-[11px]">
          <Info size={11} className="shrink-0" />
          <span className="break-words">Fuente: {fuente}</span>
        </footer>
      )}
    </section>
  );
}
