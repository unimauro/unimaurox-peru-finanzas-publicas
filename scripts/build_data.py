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
import fetch_inversion_empleo
import fetch_inflacion_pobreza


def main():
    print("=" * 60)
    print("Pipeline de datos · Finanzas Públicas del Perú 1990-2026")
    print("=" * 60)

    print("\n[1/9] BCRP — PBI y deuda pública")
    fetch_bcrp.main()

    print("\n[2/9] MEF — Presupuesto y ejecución")
    fetch_mef.main()

    print("\n[3/9] INEI — Población departamental")
    fetch_inei.main()

    print("\n[4/9] BCRP/SUNAT/MINEM — Macro: SUNAT, comercio, minería")
    fetch_macroeconomico.build()

    print("\n[5/9] MEF — Presupuesto por función (Salud, Educación, etc.)")
    fetch_funcion.build()

    print("\n[6/9] MEF/ProInversión/MINEM — Canon, OxI, inversión minera")
    fetch_canon.build()

    print("\n[7/9] BCRP/INEI/CONCYTEC/SUNEDU — Inversión, empleo, I+D, profesionales")
    fetch_inversion_empleo.build()

    print("\n[8/9] BCRP/INEI — Inflación, tipo de cambio y pobreza")
    fetch_inflacion_pobreza.build()

    print("\n[9/9] Metadata global")
    guardar_json("metadata.json", metadata({
        "version": "1.3.0",
        "corte_2026": {
            "nota": "El año 2026 está en curso. Los datos varían en su periodo de corte según la fuente:",
            "pbi_bcrp": "Proyección oficial · I trimestre 2026 (BCRP Reporte de Inflación marzo 2026)",
            "deuda_mef": "Saldo al cierre del I trimestre 2026 (MEF · DGE)",
            "presupuesto_mef": "PIM acumulado a abril 2026 (MEF Consulta Amigable)",
            "ejecucion_devengado": "Ejecución parcial enero-abril 2026",
            "sunat_recaudacion": "Recaudación tributaria acumulada a abril 2026 (SUNAT Nota Tributaria)",
            "comercio_exterior": "Exportaciones e importaciones acumuladas a marzo 2026 (BCRP)",
            "mineria": "Producción acumulada a marzo 2026 (MINEM Boletín Estadístico)",
            "canon_oxi": "Transferencias y adjudicaciones al I trimestre 2026",
            "inversion_privada_fdi": "Flujo I trimestre 2026 (BCRP Balanza de Pagos)",
            "informalidad_empleo": "Última ENAHO publicada: 2024 (proyección 2025-2026)",
            "id_gasto": "Última encuesta CONCYTEC: 2022 (interpolación 2023-2026)",
            "egresados_sunedu": "Última estadística SUNEDU: 2023 (proyección 2024-2026)"
        },
        "datasets": [
            "pbi.json", "deuda.json", "presupuesto.json",
            "presupuesto_por_region.json", "presupuesto_por_cartera.json",
            "presupuesto_funcion.json", "macroeconomico.json",
            "composicion_recaudacion.json", "poblacion.json",
            "canon_inversion.json", "canon_por_region.json",
            "obras_top_empresas.json", "inversion_componentes.json",
            "cartera_proyectos_mineros.json",
            "inversion_empleo.json", "fdi_por_pais.json",
            "pea_por_sector.json", "id_internacional.json",
            "id_fuentes.json", "egresados_por_area.json",
            "ingenieria_desagregada.json",
            "inflacion_pobreza.json", "ipc_desagregado.json",
            "pobreza_urbana_rural.json", "pobreza_por_region.json",
            "pobreza_ambito_2024.json",
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
