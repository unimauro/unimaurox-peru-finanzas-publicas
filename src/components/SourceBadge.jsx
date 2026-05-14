import { Info } from 'lucide-react';

/**
 * Badge informativo que muestra el origen y nivel de confianza de los datos
 * de una sección. Tipos:
 *   - oficial: cifra publicada directamente por la fuente
 *   - estimacion: distribución basada en pesos históricos
 */
export default function SourceBadge({ tipo = 'oficial', fuente, detalle }) {
  const config = {
    oficial: {
      label: 'Cifra oficial',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800',
    },
    estimacion: {
      label: 'Estimación',
      cls: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800',
    },
  };
  const { label, cls } = config[tipo] || config.oficial;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}
      title={detalle || fuente}
    >
      <Info size={10} />
      <span>{label}</span>
      {fuente && <span className="opacity-75">· {fuente}</span>}
    </span>
  );
}
