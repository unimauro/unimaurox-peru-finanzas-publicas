"""Utilidades compartidas para el pipeline de datos."""
import json
import os
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_OUT = ROOT / "public" / "data"
DATA_RAW = ROOT / "data" / "raw"
DATA_OUT.mkdir(parents=True, exist_ok=True)
DATA_RAW.mkdir(parents=True, exist_ok=True)

ANIO_MIN = 1990
ANIO_MAX = 2025


def guardar_json(nombre: str, obj) -> Path:
    """Guarda un JSON formateado en public/data/{nombre}."""
    ruta = DATA_OUT / nombre
    with ruta.open("w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2, default=str)
    print(f"  → {ruta.relative_to(ROOT)} ({len(obj) if hasattr(obj, '__len__') else '?'} items)")
    return ruta


def metadata(extra: dict | None = None) -> dict:
    """Estructura común de metadata para los datasets."""
    meta = {
        "generado_en": datetime.utcnow().isoformat() + "Z",
        "rango_anios": [ANIO_MIN, ANIO_MAX],
        "fuentes": {
            "bcrp": "https://estadisticas.bcrp.gob.pe/estadisticas/series/api",
            "mef": "https://apps5.mineco.gob.pe/transparencia/Mensual/",
            "inei": "https://www.inei.gob.pe/",
        },
    }
    if extra:
        meta.update(extra)
    return meta
