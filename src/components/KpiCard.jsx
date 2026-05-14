import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({
  etiqueta,
  valor,
  unidadInline,
  sub,
  variacion,
  fuente,
  icono: Icono,
}) {
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
    <div className="card relative overflow-hidden !p-4 sm:!p-5">
      {Icono && (
        <div className="pointer-events-none absolute right-3 top-3 text-peru-azul/30 dark:text-white/15 sm:right-4 sm:top-4">
          <Icono size={40} strokeWidth={1.5} className="sm:hidden" />
          <Icono size={48} strokeWidth={1.5} className="hidden sm:block" />
        </div>
      )}
      <p className="kpi-label pr-12">{etiqueta}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pr-10 text-xl font-semibold leading-tight tracking-tight text-peru-azul dark:text-white sm:pr-12 sm:text-2xl md:text-3xl">
        <span className="break-all">{valor}</span>
        {unidadInline && (
          <span className="text-[11px] font-semibold text-peru-rojo dark:text-peru-dorado sm:text-sm md:text-base">
            {unidadInline}
          </span>
        )}
      </p>
      {sub && (
        <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400 sm:text-xs">
          {sub}
        </p>
      )}
      {variacion != null && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium sm:mt-3 sm:text-sm ${color}`}>
          <Flecha size={14} />
          <span>
            {variacion > 0 ? '+' : ''}
            {Number(variacion).toLocaleString('es-PE', { maximumFractionDigits: 1 })}% vs año anterior
          </span>
        </div>
      )}
      {fuente && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">
          Fuente: {fuente}
        </p>
      )}
    </div>
  );
}
