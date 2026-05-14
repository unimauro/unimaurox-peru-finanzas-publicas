# 🇵🇪 Dashboard de Finanzas Públicas del Perú · 1990-2025

![Status](https://img.shields.io/badge/status-MVP-2ea44f)
![License](https://img.shields.io/badge/license-MIT-blue)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20D3-0B2545)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-181717)

Dashboard interactivo, 100 % estático, que visualiza **35 años de gasto público,
presupuesto, deuda y PBI** del Perú. Desagregación por las 25 regiones
(con Callao separado) y por cartera ministerial.

> 🌐 **Demo en vivo:** https://unimauro.github.io/unimaurox-peru-finanzas-publicas/

## ✨ Características

- **5 vistas** integradas con filtros globales (año + unidad monetaria)
  1. **Panorama General** — KPIs · PBI vs Deuda (dual axis) · composición de deuda · YoY
  2. **Presupuesto y Ejecución** — PIA/PIM/Devengado por año · heatmap año × sector · drill-down
  3. **Mapa Regional** — coroplético D3 interactivo · 4 métricas (PIM, ejecución %, per cápita, total)
  4. **Por Cartera Ministerial** — treemap proporcional · comparador multi-sector (hasta 5) · tabla
  5. **Análisis de Deuda Pública** — stock total / interna / externa · % PBI · nueva deuda anual · composición
- **Modo claro/oscuro** persistente
- **Exportar CSV** desde cualquier gráfico
- **Mobile-first** y responsive
- Datos servidos como JSON estáticos en `/public/data` → sin backend

## 🛠 Stack

| Capa | Herramienta |
|------|-------------|
| Build | Vite 8 + React 18 |
| Styling | Tailwind CSS 3 + paleta institucional peruana |
| Charts | Recharts (líneas, barras, treemap, pie, área) |
| Mapa | D3 + GeoJSON departamental del Perú |
| Iconos | Lucide React |
| Pipeline de datos | Python 3.10+ (requests, pandas) |

## 🚀 Correr localmente

```bash
git clone https://github.com/unimauro/unimaurox-peru-finanzas-publicas.git
cd unimaurox-peru-finanzas-publicas
npm install
npm run dev          # http://localhost:5173
```

Los JSON con datos ya están versionados en `public/data/`. Para regenerarlos:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/build_data.py
```

## 📦 Estructura

```
unimaurox-peru-finanzas-publicas/
├── .github/workflows/deploy.yml       # CI/CD a GitHub Pages
├── public/data/
│   ├── pbi.json                       # PBI nominal anual 1990-2025
│   ├── deuda.json                     # Stock deuda + % PBI + composición
│   ├── presupuesto.json               # PIA / PIM / Devengado agregado
│   ├── presupuesto_por_region.json    # Desagregado por 25 regiones
│   ├── presupuesto_por_cartera.json   # Desagregado por sector
│   ├── poblacion.json                 # INEI por departamento
│   ├── peru.geojson                   # Polígonos departamentales
│   └── metadata.json
├── scripts/
│   ├── build_data.py                  # Orquestador
│   ├── fetch_bcrp.py                  # API BCRP (PBI, deuda)
│   ├── fetch_mef.py                   # Datos MEF (presupuesto)
│   └── fetch_inei.py                  # Proyecciones de población
├── src/
│   ├── App.jsx
│   ├── views/                         # 5 vistas (lazy-loaded)
│   ├── components/                    # Sidebar, Topbar, KpiCard, ChartContainer
│   ├── context/                       # ThemeContext, FilterContext
│   └── utils/                         # format.js (S/), csv.js, data.js
└── vite.config.js                     # base path para GitHub Pages
```

## 📊 Fuentes de datos

| Fuente | Qué aporta | URL |
|--------|------------|-----|
| **BCRP** | PBI nominal anual, deuda pública | https://estadisticas.bcrp.gob.pe/ |
| **MEF · Consulta Amigable** | PIA, PIM, Devengado por entidad/sector | https://apps5.mineco.gob.pe/transparencia/ |
| **MEF · DGE** | Composición deuda por moneda y acreedor | https://www.mef.gob.pe/ |
| **INEI** | Proyecciones de población departamental | https://www.inei.gob.pe/ |
| **GeoJSON** | Polígonos de los 25 departamentos | [juaneladio/peru-geojson](https://github.com/juaneladio/peru-geojson) |

## ⚠️ Notas metodológicas

- El **PBI** se consume vía API JSON pública del BCRP cuando responde; si la API
  está caída se usa la serie publicada en sus reportes (cifras idénticas).
- La **Consulta Amigable** del MEF no expone un endpoint estable, por lo que el
  desglose por región/sector se construye distribuyendo los totales anuales
  públicos del MEF según pesos históricos conocidos. Para reemplazar con datos
  100 % oficiales, descargar los CSV mensuales del portal y adaptar
  `scripts/fetch_mef.py` (instrucciones dentro del archivo).
- **Lima Metropolitana** y **Lima Provincias** se agregan en `"LIMA"` para
  coincidir con el polígono del GeoJSON. **Callao** sí está separado.
- Año fiscal del Perú = año calendario.
- Variaciones en términos nominales (no ajustadas por inflación).

## 🤝 Contribuir

Los aportes son bienvenidos. Issues y PRs en
https://github.com/unimauro/unimaurox-peru-finanzas-publicas/issues.

Para reemplazar el dataset MEF con cifras 100 % oficiales:
1. Descargar mensualmente los CSV desde
   https://apps5.mineco.gob.pe/transparencia/Mensual/
2. Colocarlos en `data/raw/`
3. Adaptar `cargar_mef_raw()` en `scripts/fetch_mef.py`

## 📄 Licencia

MIT · Construido con datos públicos del Estado peruano.

---

*Hecho por [Carlos Mauro Quiroz](https://github.com/unimauro) — visualizando dinero público porque sí.*
