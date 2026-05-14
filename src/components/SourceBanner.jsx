import { Info } from 'lucide-react';

/**
 * Banner contextual al inicio de cada vista que aclara de dónde vienen los datos.
 */
export default function SourceBanner({ children, color = 'azul' }) {
  const palette = {
    azul: 'border-peru-azul/30 bg-peru-azul/5 text-slate-700 dark:border-peru-azul/50 dark:bg-peru-azul/20 dark:text-slate-200',
    ambar: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200',
  };
  return (
    <aside
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ${palette[color]}`}
    >
      <Info size={14} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </aside>
  );
}
