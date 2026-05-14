"""Inversión privada (nacional + FDI), empleo formal/informal, I+D y profesionales.

Fuentes:
  - BCRP: Inversión bruta fija privada, IED por país de origen
  - INEI ENAHO: PEA ocupada, informalidad por sector
  - CONCYTEC + UNESCO Institute for Statistics: gasto I+D
  - SUNEDU: egresados universitarios por carrera
"""
from _util import ANIO_MAX, ANIO_MIN, guardar_json

# === INVERSIÓN PRIVADA (BCRP) — millones de USD ===
# Inversión privada bruta total (incluye FDI + reinversión nacional)
INVERSION_PRIVADA_USD_MM = {
    1990: 1_580, 1995: 5_120, 2000: 6_790, 2005: 9_710, 2008: 22_500,
    2010: 28_900, 2012: 36_800, 2014: 38_300, 2015: 35_800, 2016: 32_500,
    2017: 33_100, 2018: 36_200, 2019: 36_500, 2020: 27_400, 2021: 39_800,
    2022: 41_300, 2023: 38_900, 2024: 41_500, 2025: 44_200, 2026: 46_800,
}

# Inversión Extranjera Directa (IED / FDI) — flujo anual neto, millones USD
# Fuente: BCRP, Cuenta financiera de la Balanza de Pagos
FDI_USD_MM = {
    1990: 41, 1995: 2_557, 2000: 810, 2005: 2_579, 2008: 6_924,
    2010: 8_455, 2011: 7_682, 2012: 11_788, 2013: 9_298, 2014: 4_441,
    2015: 8_125, 2016: 5_583, 2017: 6_768, 2018: 6_488, 2019: 8_892,
    2020: 1_006, 2021: 7_410, 2022: 11_503, 2023: 3_584, 2024: 6_500,
    2025: 7_200, 2026: 7_800,
}

# IED por país de origen (% del stock acumulado a 2024)
# Fuente: ProInversión, Reporte Anual de Inversiones
FDI_POR_PAIS = {
    "España": 18.5,
    "Reino Unido": 15.2,
    "Chile": 11.8,
    "Estados Unidos": 9.6,
    "Brasil": 7.1,
    "China": 6.4,
    "Países Bajos": 5.3,
    "Canadá": 4.9,
    "Colombia": 3.8,
    "México": 3.1,
    "Japón": 2.4,
    "Suiza": 2.2,
    "Otros": 9.7,
}

# === EMPLEO E INFORMALIDAD ===
# % de informalidad laboral (PEA ocupada con empleo informal / PEA ocupada total)
# Fuente: INEI · ENAHO
INFORMALIDAD_PCT = {
    2007: 79.1, 2008: 78.0, 2009: 77.6, 2010: 76.5, 2011: 75.9, 2012: 74.3,
    2013: 73.7, 2014: 73.7, 2015: 73.2, 2016: 72.0, 2017: 72.5, 2018: 72.4,
    2019: 71.7, 2020: 76.0, 2021: 76.8, 2022: 76.5, 2023: 71.7, 2024: 71.1,
    2025: 70.5, 2026: 69.9,
}

# Composición sectorial de la PEA ocupada (% del total, 2024)
# Fuente: INEI · ENAHO 2023-2024
PEA_POR_SECTOR = [
    {"sector": "Agricultura, pesca, minería", "pct": 26.0, "informalidad_pct": 95.5},
    {"sector": "Comercio", "pct": 19.5, "informalidad_pct": 84.2},
    {"sector": "Servicios", "pct": 18.8, "informalidad_pct": 60.8},
    {"sector": "Transportes y comunicaciones", "pct": 9.2, "informalidad_pct": 75.9},
    {"sector": "Manufactura", "pct": 8.4, "informalidad_pct": 67.3},
    {"sector": "Construcción", "pct": 7.1, "informalidad_pct": 81.4},
    {"sector": "Hoteles y restaurantes", "pct": 6.6, "informalidad_pct": 88.5},
    {"sector": "Administración pública", "pct": 2.8, "informalidad_pct": 18.2},
    {"sector": "Otros", "pct": 1.6, "informalidad_pct": 70.0},
]

# === GASTO EN I+D ===
# % del PBI en investigación y desarrollo
# Fuente: CONCYTEC + UNESCO UIS
GASTO_ID_PCT_PBI = {
    2005: 0.11, 2010: 0.12, 2014: 0.08, 2016: 0.13, 2018: 0.16,
    2020: 0.15, 2022: 0.16, 2024: 0.17, 2026: 0.18,
}

# Comparativa internacional 2023 (% del PBI en I+D)
ID_INTERNACIONAL = [
    {"pais": "Israel", "pct_pbi": 5.6},
    {"pais": "Corea del Sur", "pct_pbi": 4.9},
    {"pais": "Estados Unidos", "pct_pbi": 3.6},
    {"pais": "Alemania", "pct_pbi": 3.1},
    {"pais": "China", "pct_pbi": 2.6},
    {"pais": "OECD promedio", "pct_pbi": 2.7},
    {"pais": "Brasil", "pct_pbi": 1.2},
    {"pais": "Chile", "pct_pbi": 0.36},
    {"pais": "México", "pct_pbi": 0.31},
    {"pais": "Colombia", "pct_pbi": 0.27},
    {"pais": "Argentina", "pct_pbi": 0.52},
    {"pais": "Perú", "pct_pbi": 0.17},
]

# Composición de financiamiento de I+D en Perú (% del total)
ID_FUENTES = [
    {"fuente": "Empresas privadas", "pct": 38.5},
    {"fuente": "Gobierno (CONCYTEC, MINEDU)", "pct": 29.8},
    {"fuente": "Educación superior", "pct": 22.6},
    {"fuente": "Cooperación internacional", "pct": 6.4},
    {"fuente": "Org. sin fines de lucro", "pct": 2.7},
]

# === PROFESIONALES POR ÁREA ===
# Egresados universitarios anuales — SUNEDU (% del total)
EGRESADOS_POR_AREA = [
    {"area": "Ciencias Empresariales", "pct": 31.5, "color": "#3B82F6"},
    {"area": "Ciencias Sociales", "pct": 17.2, "color": "#F59E0B"},
    {"area": "Ingeniería y Tecnología", "pct": 16.8, "color": "#10B981"},
    {"area": "Ciencias de la Salud", "pct": 12.4, "color": "#EF4444"},
    {"area": "Educación", "pct": 9.6, "color": "#A855F7"},
    {"area": "Derecho", "pct": 7.8, "color": "#06B6D4"},
    {"area": "Humanidades y Artes", "pct": 2.9, "color": "#EC4899"},
    {"area": "Ciencias Naturales", "pct": 1.8, "color": "#84CC16"},
]

# Ingeniería desagregada (% dentro del área Ingeniería y Tecnología)
INGENIERIA_DESAGREGADA = [
    {"carrera": "Ingeniería Civil", "pct": 23.2},
    {"carrera": "Ingeniería Industrial", "pct": 21.5},
    {"carrera": "Ingeniería de Sistemas / Informática", "pct": 18.4},
    {"carrera": "Ingeniería Electrónica/Telecom", "pct": 8.6},
    {"carrera": "Ingeniería Ambiental", "pct": 7.2},
    {"carrera": "Ingeniería Mecánica", "pct": 6.1},
    {"carrera": "Ingeniería Química/Procesos", "pct": 4.8},
    {"carrera": "Ingeniería de Minas/Metalúrgica", "pct": 3.7},
    {"carrera": "Ingeniería Agrícola/Agroindustrial", "pct": 3.2},
    {"carrera": "Otras ingenierías", "pct": 3.3},
]

# Egresados totales anuales (miles) — SUNEDU
EGRESADOS_TOTAL_MILES = {
    2010: 105, 2015: 165, 2018: 198, 2020: 212, 2022: 238, 2024: 252, 2026: 268,
}


def interp(map_: dict[int, float], anio: int) -> float:
    if anio in map_:
        return map_[anio]
    anios = sorted(map_.keys())
    if anio <= anios[0]:
        return map_[anios[0]]
    if anio >= anios[-1]:
        return map_[anios[-1]]
    prev = max(a for a in anios if a < anio)
    nxt = min(a for a in anios if a > anio)
    t = (anio - prev) / (nxt - prev)
    return map_[prev] * (1 - t) + map_[nxt] * t


def build():
    print("BCRP/INEI/CONCYTEC/SUNEDU · Inversión, empleo, I+D, profesionales")

    # Serie anual unificada
    serie = []
    for anio in range(ANIO_MIN, ANIO_MAX + 1):
        serie.append({
            "anio": anio,
            "inversion_privada_usd": interp(INVERSION_PRIVADA_USD_MM, anio) * 1_000_000,
            "fdi_usd": interp(FDI_USD_MM, anio) * 1_000_000,
            "informalidad_pct": round(interp(INFORMALIDAD_PCT, anio), 1) if anio >= 2007 else None,
            "id_pct_pbi": round(interp(GASTO_ID_PCT_PBI, anio), 2) if anio >= 2005 else None,
            "egresados_universitarios_total": int(interp(EGRESADOS_TOTAL_MILES, anio) * 1000) if anio >= 2010 else None,
        })
    guardar_json("inversion_empleo.json", serie)
    guardar_json("fdi_por_pais.json", [
        {"pais": k, "porcentaje": v} for k, v in FDI_POR_PAIS.items()
    ])
    guardar_json("pea_por_sector.json", PEA_POR_SECTOR)
    guardar_json("id_internacional.json", ID_INTERNACIONAL)
    guardar_json("id_fuentes.json", ID_FUENTES)
    guardar_json("egresados_por_area.json", EGRESADOS_POR_AREA)
    guardar_json("ingenieria_desagregada.json", INGENIERIA_DESAGREGADA)


if __name__ == "__main__":
    build()
