import { useState } from 'react';
import { Coffee, QrCode, X, Smartphone } from 'lucide-react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function DonateButtons() {
  const [yapeOpen, setYapeOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setYapeOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/40 dark:text-purple-200 dark:hover:bg-purple-900/60"
          aria-label="Yapéame un café"
          title="Yapéame un café"
        >
          <Smartphone size={14} />
          <span>Yape</span>
        </button>

        <a
          href="https://buymeacoffee.com/unimauro"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-yellow-300 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400 hover:shadow-md"
          aria-label="Buy me a coffee"
          title="Buy me a coffee"
        >
          <Coffee size={14} />
          <span className="hidden sm:inline">Café</span>
        </a>
      </div>

      {yapeOpen && (
        <YapeModal onClose={() => setYapeOpen(false)} />
      )}
    </>
  );
}

function YapeModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full bg-white p-1.5 text-slate-500 shadow-md ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          <div className="mb-4 flex items-center gap-2 pr-10">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Yapéame un café ☕
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Si te sirve este dashboard
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <img
              src={`${BASE}/yape.png`}
              alt="QR de Yape para Carlos Mauro"
              className="h-48 w-48 rounded-xl border border-slate-200 object-contain dark:border-slate-700 sm:h-56 sm:w-56"
            />
            <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Escanea desde la app Yape · todo aporte ayuda a mantener data
              actualizada y pagar el dominio.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <a
              href="https://buymeacoffee.com/unimauro"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-yellow-400"
            >
              <Coffee size={16} />
              <span>Buy me a coffee</span>
            </a>
            <p className="text-center text-[11px] text-slate-400">
              ¿Desde el extranjero? · Gracias por el apoyo 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
