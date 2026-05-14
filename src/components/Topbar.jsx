import { Menu, Moon, Sun, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useFilters } from '../context/FilterContext.jsx';
import DonateButtons from './DonateButtons.jsx';

const UNIDADES = [
  { v: 'soles', l: 'Soles' },
  { v: 'miles', l: 'Miles S/' },
  { v: 'millones', l: 'Millones S/' },
  { v: 'miles-millones', l: 'Mil M S/' },
];

export default function Topbar({ abrirSidebar }) {
  const { theme, toggle } = useTheme();
  const { anio, setAnio, anioMin, anioMax, unidad, setUnidad } = useFilters();

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <button
        className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
        onClick={abrirSidebar}
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      <div className="flex flex-1 flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="hidden sm:inline">Año:</span>
          <span className="font-mono font-semibold text-peru-azul dark:text-white">{anio}</span>
          <input
            type="range"
            min={anioMin}
            max={anioMax}
            step={1}
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="h-2 w-32 cursor-pointer appearance-none rounded-full bg-slate-200 accent-peru-azul dark:bg-slate-700 sm:w-48"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="hidden sm:inline">Unidad:</span>
          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {UNIDADES.map((u) => (
              <option key={u.v} value={u.v}>
                {u.l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <DonateButtons />
        <a
          href="https://github.com/unimauro/unimaurox-peru-finanzas-publicas"
          target="_blank"
          rel="noreferrer"
          className="btn hidden md:inline-flex"
          aria-label="GitHub"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <button onClick={toggle} className="btn" aria-label="Cambiar tema">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
