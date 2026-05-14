# `data/` — Pipeline de datos

Esta carpeta y `public/data/` contienen los datasets que alimentan el dashboard.

## Estructura

```
data/
├── raw/      # Archivos CSV/XLSX descargados manualmente (NO se commitean)
└── README.md # Este archivo

public/data/  # Salida del pipeline (JSON que carga el frontend)
├── pbi.json
├── deuda.json
├── presupuesto.json
├── presupuesto_por_region.json
├── presupuesto_por_cartera.json
├── poblacion.json
├── peru.geojson
└── metadata.json
```

## Regenerar datasets

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r scripts/requirements.txt
python scripts/build_data.py
```

## Fuentes y notas

### BCRP — Banco Central de Reserva del Perú
- API pública JSON: `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/{codigo}/json/{anioIni}/{anioFin}/ing`
- Series usadas:
  - `PM04863AA` — PBI nominal anual (millones S/)
  - `PM05625AA` — Deuda pública (puede dar 403 en algunos rangos, fallback aplicado)

### MEF — Consulta Amigable (SIAF)
- Sin API pública estable. Hay dos rutas para datos reales:
  1. **Descarga mensual** desde `https://apps5.mineco.gob.pe/transparencia/Mensual/`
     (CSV por nivel de gobierno, sector, pliego, función, etc.)
  2. **Scraping** con Selenium del frontend SPA.
- El script `fetch_mef.py` actualmente distribuye los totales anuales públicos
  del MEF entre las 25 regiones y los sectores ministeriales usando pesos
  históricos. Para reemplazar con cifras oficiales, ver instrucciones en
  el docstring del script.

### INEI — Instituto Nacional de Estadística e Informática
- Proyecciones poblacionales 1995-2025 publicadas como tablas Excel.
- Se usa la base 2024 oficial y se retroyecta/proyecta con tasas de crecimiento
  por quinquenios.

### Mapa
- GeoJSON departamental tomado de
  [juaneladio/peru-geojson](https://github.com/juaneladio/peru-geojson).
- 25 features incluyendo Callao separado.
- Lima Provincias y Lima Metropolitana van fusionadas en una sola feature
  `LIMA` (limitación del GeoJSON estándar).

## Limitaciones conocidas

- La separación visual entre Lima Metropolitana y Lima Provincias requiere un
  GeoJSON custom (no disponible públicamente). Pendiente.
- Algunas series del BCRP devuelven 403 cuando el rango es muy amplio; el
  script reintenta con códigos alternativos y, si fallan, usa cifras
  consolidadas publicadas en los reportes anuales.
- Inflación / ajustes reales no aplicados; toda la serie es nominal en soles
  corrientes del año respectivo.
