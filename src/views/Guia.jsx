import {
  LayoutDashboard,
  Wallet,
  Map,
  Building2,
  Landmark,
  Calendar,
  Coins,
  Download,
  Moon,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export default function Guia() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Hero */}
      <section className="card relative overflow-hidden">
        <div className="absolute right-4 top-4 text-peru-azul/20 dark:text-white/10">
          <HelpCircle size={120} strokeWidth={1} />
        </div>
        <div className="relative">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            ¿Qué es este dashboard?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Una visualización ciudadana de <strong>35 años de finanzas públicas
            del Perú</strong> (1990–2025): cuánto produce el país, cuánto debe,
            cómo se reparte el presupuesto entre regiones y ministerios, y qué
            tan eficientemente se ejecuta. Todo construido con datos oficiales
            del BCRP, MEF e INEI, y servido como sitio estático en GitHub Pages
            — sin trackers, sin login.
          </p>
        </div>
      </section>

      {/* 5 vistas */}
      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <LayoutDashboard size={18} /> Las 5 vistas
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              icon: LayoutDashboard,
              titulo: 'Panorama General',
              desc: 'KPIs del año seleccionado (PBI, deuda, presupuesto, ejecución), evolución PBI vs deuda en doble eje y variación interanual.',
              color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
            },
            {
              icon: Wallet,
              titulo: 'Presupuesto y Ejecución',
              desc: 'Diferencia entre PIA (aprobado), PIM (modificado) y Devengado (ejecutado). Heatmap año × sector — haz click sobre un año para ver el detalle.',
              color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
            },
            {
              icon: Map,
              titulo: 'Mapa Regional',
              desc: 'Coroplético interactivo de las 25 regiones (con Callao separado). Cambia entre PIM, % ejecución, presupuesto per cápita o devengado.',
              color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
            },
            {
              icon: Building2,
              titulo: 'Cartera Ministerial',
              desc: 'Treemap proporcional del presupuesto por sector. Selecciona hasta 5 carteras para ver cómo evolucionaron en el tiempo.',
              color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
            },
            {
              icon: Landmark,
              titulo: 'Deuda Pública',
              desc: 'Stock total + % del PBI, composición interna/externa, nueva deuda anual y reparto por moneda y acreedor.',
              color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
            },
          ].map(({ icon: Icon, titulo, desc, color }) => (
            <div
              key={titulo}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon size={18} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Controles globales */}
      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          ⚙️ Controles globales
        </h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <Calendar size={18} className="mt-0.5 shrink-0 text-peru-azul" />
            <div>
              <strong className="text-slate-900 dark:text-white">Slider de año</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Cambia el año de referencia. Los KPIs, el mapa y los pies/donas
                se actualizan al instante; las series de tiempo siguen mostrando
                todo el rango 1990-2025.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Coins size={18} className="mt-0.5 shrink-0 text-peru-dorado" />
            <div>
              <strong className="text-slate-900 dark:text-white">Unidad monetaria</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Soles · miles · millones · miles de millones. Útil para
                comparar magnitudes a distintas escalas.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Moon size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <div>
              <strong className="text-slate-900 dark:text-white">Modo claro/oscuro</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Persiste tu preferencia en el navegador.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Download size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <strong className="text-slate-900 dark:text-white">Botón CSV en cada gráfico</strong>
              <p className="text-slate-600 dark:text-slate-400">
                Descarga los datos exactos que ves en el chart, listos para
                Excel/Sheets. Ideal para periodistas, investigadores y curiosos.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Glosario */}
      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          📖 Glosario rápido
        </h2>
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          {[
            ['PIA', 'Presupuesto Institucional de Apertura: lo aprobado al inicio del año fiscal por la Ley de Presupuesto.'],
            ['PIM', 'Presupuesto Institucional Modificado: PIA + transferencias, ampliaciones y créditos suplementarios durante el año.'],
            ['Devengado', 'Gasto efectivamente ejecutado y reconocido como obligación de pago.'],
            ['% Ejecución', 'Devengado ÷ PIM. Indica qué porción del presupuesto modificado se llegó a gastar.'],
            ['PBI nominal', 'Valor de mercado de todos los bienes y servicios producidos en un año, en soles corrientes (sin ajustar por inflación).'],
            ['Deuda / PBI', 'Stock de deuda pública como porcentaje del PBI. Indicador clave de sostenibilidad fiscal.'],
            ['Cartera / Pliego', 'Cada ministerio o entidad del gobierno central (Educación, Salud, Defensa, etc.).'],
            ['SIAF', 'Sistema Integrado de Administración Financiera del MEF: la fuente oficial del detalle presupuestal.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <dt className="font-semibold text-slate-900 dark:text-white">{t}</dt>
              <dd className="mt-1 text-slate-600 dark:text-slate-400">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Fuentes */}
      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          📚 Fuentes oficiales
        </h2>
        <ul className="space-y-2 text-sm">
          {[
            ['BCRP — Banco Central de Reserva', 'PBI nominal, deuda pública, indicadores macro', 'https://estadisticas.bcrp.gob.pe/'],
            ['MEF — Consulta Amigable (SIAF)', 'Presupuesto y ejecución por entidad/sector/región', 'https://apps5.mineco.gob.pe/transparencia/'],
            ['MEF — Dirección General de Endeudamiento', 'Composición de deuda por moneda y acreedor', 'https://www.mef.gob.pe/'],
            ['INEI', 'Proyecciones de población departamental', 'https://www.inei.gob.pe/'],
          ].map(([nombre, descr, url]) => (
            <li key={nombre} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <ExternalLink size={16} className="mt-0.5 shrink-0 text-peru-azul" />
              <div className="flex-1">
                <a href={url} target="_blank" rel="noreferrer" className="font-medium text-peru-azul hover:underline dark:text-white">
                  {nombre}
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-400">{descr}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Limitaciones */}
      <section className="card border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
          <AlertTriangle size={18} /> Limitaciones conocidas
        </h2>
        <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
          <li>
            <strong>Detalle MEF por región/sector:</strong> distribuido a partir
            de los totales públicos del MEF usando pesos históricos. Para
            cifras 100 % oficiales del SIAF, descargar los CSV mensuales y
            adaptar <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">scripts/fetch_mef.py</code>.
          </li>
          <li>
            <strong>Lima Metropolitana vs Lima Provincias:</strong> aparecen
            fusionadas en el mapa por limitación del GeoJSON estándar. Callao sí
            está separado.
          </li>
          <li>
            <strong>Cifras nominales:</strong> no se ajusta por inflación. Para
            comparaciones reales, usar el deflactor del BCRP.
          </li>
          <li>
            <strong>2025 en ejecución:</strong> el año en curso muestra cifras
            parciales — la ejecución se cierra a fin de año.
          </li>
        </ul>
      </section>

      {/* Autoría */}
      <section className="card overflow-hidden">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <img
            src="https://github.com/unimauro.png"
            alt="Carlos Mauro Cárdenas"
            className="h-24 w-24 rounded-full border-4 border-peru-azul object-cover shadow-md"
          />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Carlos Mauro Cárdenas Fernandez
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Ingeniero con base en Lima, Perú · GenAI, AI Agents, Quantum Computing,
              ML, DevOps, Cloud & Data Science. Apasionado por la <strong>transparencia
              de datos públicos</strong> y proyectos open source.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <a
                href="https://unimauro.github.io/"
                target="_blank"
                rel="noreferrer"
                className="chip hover:bg-peru-azul/10 hover:text-peru-azul dark:hover:bg-peru-azul/30 dark:hover:text-white"
              >
                🏠 unimauro.github.io
              </a>
              <a
                href="https://github.com/unimauro"
                target="_blank"
                rel="noreferrer"
                className="chip hover:bg-peru-azul/10 hover:text-peru-azul dark:hover:bg-peru-azul/30 dark:hover:text-white"
              >
                💻 @unimauro
              </a>
              <a
                href="https://www.linkedin.com/in/carloscardenasf/"
                target="_blank"
                rel="noreferrer"
                className="chip hover:bg-peru-azul/10 hover:text-peru-azul dark:hover:bg-peru-azul/30 dark:hover:text-white"
              >
                💼 LinkedIn
              </a>
              <a
                href="https://twitter.com/unimauro"
                target="_blank"
                rel="noreferrer"
                className="chip hover:bg-peru-azul/10 hover:text-peru-azul dark:hover:bg-peru-azul/30 dark:hover:text-white"
              >
                𝕏 @unimauro
              </a>
              <a
                href="https://unimauro.github.io/salariosperu/"
                target="_blank"
                rel="noreferrer"
                className="chip hover:bg-peru-azul/10 hover:text-peru-azul dark:hover:bg-peru-azul/30 dark:hover:text-white"
              >
                📊 SalariosPerú
              </a>
            </div>
          </div>
        </div>
        <p className="mt-4 border-t border-slate-200 pt-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Este dashboard es 100 % independiente · sin afiliación con BCRP, MEF o INEI ·
          datos públicos · código MIT.
          <br />
          Si te sirvió y quieres apoyar futuras actualizaciones: ☕ Yape o Buy Me a Coffee
          (botones arriba).
        </p>
      </section>

      {/* FAQ corta */}
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          ❓ Preguntas frecuentes
        </h2>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              ¿Puedo usar los datos en mi tesis / nota / video?
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Sí, todos los datos son públicos. Cita la fuente original (BCRP /
              MEF / INEI) y, si quieres, agradece a este dashboard. Bajo licencia
              MIT.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              ¿Cómo actualizo los datos?
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Clona el repo, instala los requirements de Python y corre{' '}
              <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
                python scripts/build_data.py
              </code>
              . Los JSON quedan en <code>public/data/</code>.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              ¿Puedo contribuir?
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Sí. Issues y PRs en{' '}
              <a
                href="https://github.com/unimauro/unimaurox-peru-finanzas-publicas"
                target="_blank"
                rel="noreferrer"
                className="text-peru-azul hover:underline dark:text-white"
              >
                GitHub
              </a>
              . Especialmente bienvenido: scraping real del SIAF y GeoJSON que
              separe Lima Metropolitana.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
