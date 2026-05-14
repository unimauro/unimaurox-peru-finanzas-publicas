"""Orquestador del pipeline de datos.

Ejecuta:
  python scripts/build_data.py

Genera todos los JSON en public/data/ que consume el frontend.
"""
import sys
from pathlib import Path

# Asegurar que los scripts hermanos sean importables
sys.path.insert(0, str(Path(__file__).resolve().parent))

from _util import guardar_json, metadata
import fetch_bcrp
import fetch_mef
import fetch_inei
import fetch_macroeconomico
import fetch_funcion
import fetch_canon


def main():
    print("=" * 60)
    print("Pipeline de datos · Finanzas Públicas del Perú 1990-2026")
    print("=" * 60)

    print("\n[1/7] BCRP — PBI y deuda pública")
    fetch_bcrp.main()

    print("\n[2/7] MEF — Presupuesto y ejecución")
    fetch_mef.main()

    print("\n[3/7] INEI — Población departamental")
    fetch_inei.main()

    print("\n[4/7] BCRP/SUNAT/MINEM — Macro: SUNAT, comercio, minería")
    fetch_macroeconomico.build()

    print("\n[5/7] MEF — Presupuesto por función (Salud, Educación, etc.)")
    fetch_funcion.build()

    print("\n[6/7] MEF/ProInversión/MINEM — Canon, OxI, inversión minera")
    fetch_canon.build()

    print("\n[7/7] Metadata global")
    guardar_json("metadata.json", metadata({
        "version": "1.2.0",
        "datasets": [
            "pbi.json", "deuda.json", "presupuesto.json",
            "presupuesto_por_region.json", "presupuesto_por_cartera.json",
            "presupuesto_funcion.json", "macroeconomico.json",
            "composicion_recaudacion.json", "poblacion.json",
            "canon_inversion.json", "canon_por_region.json",
            "obras_top_empresas.json", "inversion_componentes.json",
            "cartera_proyectos_mineros.json",
        ],
        "nota": (
            "El PBI y la deuda pública se obtienen del BCRP cuando la API responde; "
            "el detalle de presupuesto por región/sector se construye a partir de "
            "totales públicos del MEF distribuidos según pesos históricos conocidos. "
            "Para reemplazar con cifras 100% oficiales del SIAF Consulta Amigable, "
            "ver scripts/fetch_mef.py."
        ),
    }))

    print("\n✓ Pipeline completado")


if __name__ == "__main__":
    main()
