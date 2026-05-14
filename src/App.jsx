import { useState, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import { SkeletonChart } from './components/Skeleton.jsx';

const Panorama = lazy(() => import('./views/Panorama.jsx'));
const Presupuesto = lazy(() => import('./views/Presupuesto.jsx'));
const Mapa = lazy(() => import('./views/Mapa.jsx'));
const Cartera = lazy(() => import('./views/Cartera.jsx'));
const Deuda = lazy(() => import('./views/Deuda.jsx'));
const Guia = lazy(() => import('./views/Guia.jsx'));

const VIEW_TITLES = {
  panorama: 'Panorama General',
  presupuesto: 'Presupuesto y Ejecución',
  mapa: 'Mapa Regional',
  cartera: 'Por Cartera Ministerial',
  deuda: 'Análisis de Deuda Pública',
  guia: 'Guía & Preguntas Frecuentes',
};

export default function App() {
  const [vista, setVista] = useState('panorama');
  const [sidebarAbierta, setSidebarAbierta] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        vista={vista}
        setVista={setVista}
        abierta={sidebarAbierta}
        cerrar={() => setSidebarAbierta(false)}
      />

      <div className="flex flex-1 flex-col md:ml-0">
        <Topbar abrirSidebar={() => setSidebarAbierta(true)} />

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
              {VIEW_TITLES[vista]}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Datos oficiales de MEF, BCRP e INEI · Serie 1990-2025
            </p>
          </div>

          <Suspense fallback={<SkeletonChart altura={400} />}>
            {vista === 'panorama' && <Panorama />}
            {vista === 'presupuesto' && <Presupuesto />}
            {vista === 'mapa' && <Mapa />}
            {vista === 'cartera' && <Cartera />}
            {vista === 'deuda' && <Deuda />}
            {vista === 'guia' && <Guia />}
          </Suspense>

          <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>
              Construido con datos oficiales de{' '}
              <a className="underline" href="https://www.mef.gob.pe/" target="_blank" rel="noreferrer">
                MEF
              </a>
              ,{' '}
              <a className="underline" href="https://www.bcrp.gob.pe/" target="_blank" rel="noreferrer">
                BCRP
              </a>{' '}
              e{' '}
              <a className="underline" href="https://www.inei.gob.pe/" target="_blank" rel="noreferrer">
                INEI
              </a>
              . Código abierto en{' '}
              <a
                className="underline"
                href="https://github.com/unimauro/unimaurox-peru-finanzas-publicas"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
