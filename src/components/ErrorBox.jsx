import { AlertTriangle } from 'lucide-react';

export default function ErrorBox({ error, mensaje = 'No se pudieron cargar los datos' }) {
  return (
    <div className="card border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-medium">{mensaje}</p>
          {error && (
            <p className="mt-1 font-mono text-xs opacity-75">{String(error.message || error)}</p>
          )}
          <p className="mt-2 text-sm opacity-80">
            Si estás viendo esta demo localmente y faltan los JSON, corre{' '}
            <code className="rounded bg-rose-100 px-1 dark:bg-rose-900/60">
              python scripts/build_data.py
            </code>{' '}
            para generarlos.
          </p>
        </div>
      </div>
    </div>
  );
}
