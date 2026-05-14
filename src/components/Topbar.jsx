import { useState } from 'react';
import { Menu, Moon, Sun, ExternalLink, Share2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useFilters } from '../context/FilterContext.jsx';
import DonateButtons from './DonateButtons.jsx';
import ShareModal from './ShareModal.jsx';

const UNIDADES = [
  { v: 'soles', l: 'Soles' },
  { v: 'miles', l: 'Miles S/' },
  { v: 'millones', l: 'Millones S/' },
  { v: 'miles-millones', l: 'Mil M S/' },
];

export default function Topbar({ abrirSidebar }) {
  const { theme, toggle } = useTheme();
  const { anio, setAnio, anioMin, anioMax, unidad, setUnidad } = useFilters();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      {/* Fila 1: menú móvil + acciones */}
      <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3">
        <button
          className="shrink-0 rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
          onClick={abrirSidebar}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Filtros (desktop inline · mobile en fila 2) */}
        <div className="hidden flex-1 flex-wrap items-center gap-3 md:flex">
          <Filtros
            anio={anio}
            setAnio={setAnio}
            anioMin={anioMin}
            anioMax={anioMax}
            unidad={unidad}
            setUnidad={setUnidad}
          />
        </div>

        {/* Spacer mobile */}
        <div className="flex-1 md:hidden" />

        {/* Acciones */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShareOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-peru-azul bg-peru-azul px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-peru-azulMedio sm:px-3 sm:text-sm"
            aria-label="Compartir dashboard"
            title="Compartir en redes"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Compartir</span>
          </button>
          <DonateButtons />
          <a
            href="https://github.com/unimauro/unimaurox-peru-finanzas-publicas"
            target="_blank"
            rel="noreferrer"
            className="btn hidden lg:inline-flex"
            aria-label="GitHub"
          >
            <ExternalLink size={16} />
            <span>GitHub</span>
          </a>
          <button onClick={toggle} className="btn !px-2 !py-1.5" aria-label="Cambiar tema">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Fila 2 móvil: filtros */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-3 py-2 dark:border-slate-800 md:hidden">
        <Filtros
          anio={anio}
          setAnio={setAnio}
          anioMin={anioMin}
          anioMax={anioMax}
          unidad={unidad}
          setUnidad={setUnidad}
        />
      </div>

      <ShareModal abierto={shareOpen} onClose={() => setShareOpen(false)} />
    </header>
  );
}

function Filtros({ anio, setAnio, anioMin, anioMax, unidad, setUnidad }) {
  const esActual = anio === anioMax;
  return (
    <>
      <label className="flex flex-1 items-center gap-2 text-sm text-slate-600 dark:text-slate-300 sm:flex-initial">
        <span className="text-xs sm:text-sm">Año:</span>
        <span className="font-mono text-sm font-semibold text-peru-azul dark:text-white">{anio}</span>
        <input
          type="range"
          min={anioMin}
          max={anioMax}
          step={1}
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-peru-azul dark:bg-slate-700 sm:flex-initial sm:w-48"
        />
        {esActual && (
          <span
            className="hidden items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 lg:inline-flex"
            title="Año en curso · BCRP I trim · MEF a abr-2026 · SUNAT a abr-2026 · INEI último anual disponible"
          >
            ⚠ Parcial · I trim/abr 2026
          </span>
        )}
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span className="hidden text-xs sm:inline sm:text-sm">Unidad:</span>
        <select
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 sm:text-sm"
        >
          {UNIDADES.map((u) => (
            <option key={u.v} value={u.v}>
              {u.l}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
