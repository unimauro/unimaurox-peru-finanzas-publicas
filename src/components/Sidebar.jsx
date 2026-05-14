import {
  LayoutDashboard, Wallet, Map, Building2, Landmark,
  Pickaxe, HeartPulse, Mountain, Briefcase, HelpCircle, X,
} from 'lucide-react';

const items = [
  { id: 'panorama', label: 'Panorama General', icon: LayoutDashboard },
  { id: 'presupuesto', label: 'Presupuesto y Ejecución', icon: Wallet },
  { id: 'mapa', label: 'Mapa Regional', icon: Map },
  { id: 'cartera', label: 'Por Cartera Ministerial', icon: Building2 },
  { id: 'funciones', label: 'Salud · Educación · Etc.', icon: HeartPulse },
  { id: 'deuda', label: 'Deuda Pública', icon: Landmark },
  { id: 'economia', label: 'Economía Real', icon: Pickaxe },
  { id: 'canon', label: 'Canon · OxI · Minería', icon: Mountain },
  { id: 'inversion', label: 'Inversión · Empleo · I+D', icon: Briefcase },
  { id: 'guia', label: 'Guía & FAQ', icon: HelpCircle },
];

export default function Sidebar({ vista, setVista, abierta, cerrar }) {
  return (
    <>
      {/* Overlay móvil */}
      {abierta && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={cerrar}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0 ${
          abierta ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-peru-rojo text-white">
              <span className="font-bold">P</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                Finanzas Públicas
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Perú · 1990-2026</p>
            </div>
          </div>
          <button
            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={cerrar}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const activo = vista === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setVista(item.id);
                  cerrar?.();
                }}
                className={`nav-item ${activo ? 'nav-item-active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-200">Fuentes oficiales</p>
          <p className="mt-1 leading-relaxed">
            MEF (Consulta Amigable), BCRP, INEI. Última actualización en{' '}
            <span className="font-mono">/data/metadata.json</span>.
          </p>
        </div>
      </aside>
    </>
  );
}
