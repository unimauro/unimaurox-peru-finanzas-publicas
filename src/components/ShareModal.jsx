import { useState } from 'react';
import { Share2, X, Copy, Check, MessageCircle, Send, Mail } from 'lucide-react';

// Iconos de marca como SVG inline (lucide-react ya no los exporta)
const IconTwitter = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconLinkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z"/>
  </svg>
);
const IconInstagram = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38a3.72 3.72 0 0 1-1.38.9c-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
  </svg>
);

const URL = 'https://unimauro.github.io/unimaurox-peru-finanzas-publicas/';

// Plantillas pre-armadas (con emojis para que se vea jugoso)
const PLANTILLAS = {
  corto: `🇵🇪 Encontré un dashboard que muestra 35 años de finanzas públicas del Perú:
PBI, deuda, presupuesto y ejecución por región y ministerio. Datos oficiales BCRP/MEF/INEI.

${URL}`,
  largo: `🇵🇪💸 ¿Sabías que la deuda pública del Perú equivale al 34% del PBI en 2025?

Te comparto un dashboard ciudadano con 35 años de datos oficiales:
📊 PBI y deuda 1990-2025
🗺️ Mapa interactivo por las 25 regiones (con Callao separado)
🏛️ Presupuesto por cartera ministerial
✅ Datos del BCRP, MEF e INEI

Open source, sin login, sin trackers 👇
${URL}

#TransparenciaPerú #DataPerú`,
  ig: `🇵🇪💰 Dashboard de Finanzas Públicas del Perú · 1990-2025

📊 PBI · Deuda · Presupuesto · Mapa regional
🏛️ Datos oficiales BCRP / MEF / INEI
🆓 Open source, sin login

🔗 Link en bio (o búsquenlo: unimaurox-peru-finanzas-publicas)

#Perú #DataViz #Transparencia #FinanzasPúblicas #BCRP #MEF`,
};

export default function ShareModal({ abierto, onClose }) {
  const [plantilla, setPlantilla] = useState('largo');
  const [copiado, setCopiado] = useState(false);

  if (!abierto) return null;

  const texto = PLANTILLAS[plantilla];
  const textoEncoded = encodeURIComponent(texto);
  const urlEncoded = encodeURIComponent(URL);
  const tituloEncoded = encodeURIComponent('🇵🇪 Finanzas Públicas del Perú · 1990-2025');

  const enlaces = [
    {
      nombre: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white',
      url: `https://wa.me/?text=${textoEncoded}`,
    },
    {
      nombre: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc] hover:bg-[#0077b3] text-white',
      url: `https://t.me/share/url?url=${urlEncoded}&text=${textoEncoded}`,
    },
    {
      nombre: 'Twitter / X',
      icon: IconTwitter,
      color: 'bg-slate-900 hover:bg-slate-800 text-white',
      url: `https://twitter.com/intent/tweet?text=${textoEncoded}`,
    },
    {
      nombre: 'LinkedIn',
      icon: IconLinkedin,
      color: 'bg-[#0A66C2] hover:bg-[#085196] text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`,
    },
    {
      nombre: 'Email',
      icon: Mail,
      color: 'bg-slate-600 hover:bg-slate-700 text-white',
      url: `mailto:?subject=${tituloEncoded}&body=${textoEncoded}`,
    },
  ];

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {
      console.error('No se pudo copiar:', e);
    }
  };

  // Web Share API nativa (Android/iOS)
  const compartirNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Finanzas Públicas del Perú',
          text: texto,
          url: URL,
        });
      } catch (e) {
        // usuario canceló
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-peru-azul text-white">
            <Share2 size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Compartir dashboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Difunde la transparencia 💪
            </p>
          </div>
        </div>

        {/* Selector de plantilla */}
        <div className="mb-3 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          {[
            { v: 'corto', l: 'Corto' },
            { v: 'largo', l: 'Largo + emojis' },
            { v: 'ig', l: 'Instagram' },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setPlantilla(opt.v)}
              className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                plantilla === opt.v
                  ? 'bg-white text-peru-azul shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        {/* Preview del texto */}
        <div className="mb-3 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
          <pre className="whitespace-pre-wrap font-sans">{texto}</pre>
        </div>

        {/* Botón copiar */}
        <button
          onClick={copiar}
          className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {copiado ? (
            <>
              <Check size={16} className="text-emerald-600" /> ¡Copiado!
            </>
          ) : (
            <>
              <Copy size={16} /> Copiar mensaje
            </>
          )}
        </button>

        {/* Botón nativo (móvil) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={compartirNativo}
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-peru-azul px-4 py-2 text-sm font-semibold text-white hover:bg-peru-azulMedio"
          >
            <Share2 size={16} /> Compartir (sistema)
          </button>
        )}

        {/* Botones de red social */}
        <div className="grid grid-cols-2 gap-2">
          {enlaces.map(({ nombre, icon: Icon, color, url }) => (
            <a
              key={nombre}
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${color}`}
            >
              <Icon width={16} height={16} /> {nombre}
            </a>
          ))}
        </div>

          {/* Tip para Instagram */}
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-purple-50 p-3 text-xs text-purple-900 dark:bg-purple-950/40 dark:text-purple-200">
            <IconInstagram width={14} height={14} className="mt-0.5 shrink-0" />
            <div>
              <strong>Instagram / TikTok:</strong> copia el texto con el botón
              de arriba, pégalo en tu publicación o historia. La imagen del
              preview (favicon + 3 barras) se generará automáticamente al pegar
              el link.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
