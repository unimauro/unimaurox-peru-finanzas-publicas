import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ etiqueta, valor, sub, variacion, fuente, icono: Icono }) {
  const flecha =
    variacion == null ? Minus : variacion > 0 ? TrendingUp : variacion < 0 ? TrendingDown : Minus;
  const Flecha = flecha;
  const color =
    variacion == null
      ? 'text-slate-500'
      : variacion > 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : variacion < 0
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-slate-500';

  return (
    <div className="card relative overflow-hidden">
      {Icono && (
        <div className="absolute right-4 top-4 text-peru-azul/30 dark:text-white/15">
          <Icono size={48} strokeWidth={1.5} />
        </div>
      )}
      <p className="kpi-label">{etiqueta}</p>
      <p className="kpi-value mt-1 text-peru-azul dark:text-white">{valor}</p>
      {sub && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
      )}
      {variacion != null && (
        <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${color}`}>
          <Flecha size={14} />
          <span>
            {variacion > 0 ? '+' : ''}
            {Number(variacion).toLocaleString('es-PE', { maximumFractionDigits: 1 })}% vs año
            anterior
          </span>
        </div>
      )}
      {fuente && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">Fuente: {fuente}</p>
      )}
    </div>
  );
}
