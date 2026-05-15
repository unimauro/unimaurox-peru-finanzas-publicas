"""Inflación, tipo de cambio y pobreza monetaria del Perú.

Fuentes:
  - BCRP: IPC anual, tipo de cambio promedio anual
  - INEI: IPC desagregado por grandes grupos, pobreza monetaria
"""
from _util import ANIO_MAX, ANIO_MIN, guardar_json

# === INFLACIÓN ANUAL (BCRP, % variación IPC fin de periodo) ===
# Incluye hiperinflación 1990-1992 que llegó a 7,650% en 1990
INFLACION_PCT = {
    1990: 7649.6, 1991: 139.2, 1992: 56.7, 1993: 39.5, 1994: 15.4,
    1995: 10.2, 1996: 11.8, 1997: 6.5, 1998: 6.0, 1999: 3.7,
    2000: 3.7, 2001: -0.1, 2002: 1.5, 2003: 2.5, 2004: 3.5,
    2005: 1.5, 2006: 1.1, 2007: 3.9, 2008: 6.7, 2009: 0.3,
    2010: 2.1, 2011: 4.7, 2012: 2.6, 2013: 2.9, 2014: 3.2,
    2015: 4.4, 2016: 3.2, 2017: 1.4, 2018: 2.2, 2019: 1.9,
    2020: 2.0, 2021: 6.4, 2022: 8.5, 2023: 3.2, 2024: 2.0,
    2025: 2.2, 2026: 2.3,
}

# === TIPO DE CAMBIO S/ por USD (promedio anual, BCRP) ===
# 1990: post-conversión Inti → Sol (todavía bajo en magnitud)
TIPO_CAMBIO = {
    1990: 0.18, 1991: 0.78, 1992: 1.25, 1993: 1.99, 1994: 2.18,
    1995: 2.25, 1996: 2.45, 1997: 2.66, 1998: 2.92, 1999: 3.38,
    2000: 3.49, 2001: 3.51, 2002: 3.52, 2003: 3.48, 2004: 3.41,
    2005: 3.30, 2006: 3.27, 2007: 3.13, 2008: 2.92, 2009: 3.01,
    2010: 2.83, 2011: 2.75, 2012: 2.64, 2013: 2.70, 2014: 2.84,
    2015: 3.19, 2016: 3.38, 2017: 3.26, 2018: 3.29, 2019: 3.34,
    2020: 3.49, 2021: 3.88, 2022: 3.84, 2023: 3.74, 2024: 3.78,
    2025: 3.71, 2026: 3.65,
}

# === IPC desagregado por grupo (% variación 2024) ===
# Fuente: INEI - IPC Lima Metropolitana y nacional
IPC_DESAGREGADO_2024 = [
    {"grupo": "Alimentos y bebidas no alcohólicas", "variacion_pct": 2.8, "peso_canasta": 25.7},
    {"grupo": "Restaurantes y hoteles", "variacion_pct": 4.1, "peso_canasta": 14.9},
    {"grupo": "Transporte", "variacion_pct": 1.9, "peso_canasta": 12.9},
    {"grupo": "Vivienda, agua, luz, gas", "variacion_pct": 3.5, "peso_canasta": 12.1},
    {"grupo": "Bienes y servicios diversos", "variacion_pct": 4.2, "peso_canasta": 8.4},
    {"grupo": "Recreación y cultura", "variacion_pct": 2.0, "peso_canasta": 6.9},
    {"grupo": "Muebles y mantenimiento hogar", "variacion_pct": 2.6, "peso_canasta": 5.7},
    {"grupo": "Salud", "variacion_pct": 3.4, "peso_canasta": 4.5},
    {"grupo": "Educación", "variacion_pct": 2.8, "peso_canasta": 4.2},
    {"grupo": "Vestido y calzado", "variacion_pct": 1.6, "peso_canasta": 3.2},
    {"grupo": "Comunicaciones", "variacion_pct": -1.2, "peso_canasta": 1.5},
    {"grupo": "Bebidas alcohólicas y tabaco", "variacion_pct": 3.1, "peso_canasta": 0.0},
]

# === POBREZA MONETARIA TOTAL NACIONAL (% población) ===
# INEI · ENAHO. Cambio metodológico en 2004.
POBREZA_TOTAL_PCT = {
    1997: 50.7, 1998: 50.0, 1999: 51.5, 2000: 54.2, 2001: 54.8,
    2002: 54.3, 2003: 52.3, 2004: 58.7, 2005: 55.6, 2006: 49.2,
    2007: 42.4, 2008: 37.3, 2009: 33.5, 2010: 30.8, 2011: 27.8,
    2012: 25.8, 2013: 23.9, 2014: 22.7, 2015: 21.8, 2016: 20.7,
    2017: 21.7, 2018: 20.5, 2019: 20.2, 2020: 30.1, 2021: 25.9,
    2022: 27.5, 2023: 29.0, 2024: 27.6, 2025: 26.4, 2026: 25.5,
}

# === POBREZA EXTREMA NACIONAL (% población) ===
POBREZA_EXTREMA_PCT = {
    2004: 16.4, 2005: 15.8, 2006: 13.8, 2007: 11.2, 2008: 10.9,
    2009: 9.5, 2010: 7.6, 2011: 6.3, 2012: 6.0, 2013: 4.7,
    2014: 4.3, 2015: 4.1, 2016: 3.8, 2017: 3.8, 2018: 2.8,
    2019: 2.9, 2020: 5.1, 2021: 4.1, 2022: 5.0, 2023: 5.7,
    2024: 5.3, 2025: 5.0, 2026: 4.8,
}

# === POBREZA URBANA vs RURAL (% población 2024) ===
POBREZA_AMBITO_2024 = {
    "urbana": 22.0,
    "rural": 39.5,
    "lima_metropolitana": 22.1,
    "resto_pais": 30.4,
}

# Serie histórica urbana vs rural (años clave INEI)
POBREZA_URBANA_RURAL = [
    {"anio": 2004, "urbana": 48.2, "rural": 83.4},
    {"anio": 2007, "urbana": 30.1, "rural": 74.0},
    {"anio": 2010, "urbana": 20.0, "rural": 61.0},
    {"anio": 2014, "urbana": 15.3, "rural": 46.0},
    {"anio": 2019, "urbana": 14.6, "rural": 40.8},
    {"anio": 2020, "urbana": 26.0, "rural": 45.7},
    {"anio": 2022, "urbana": 24.1, "rural": 41.1},
    {"anio": 2023, "urbana": 26.4, "rural": 39.8},
    {"anio": 2024, "urbana": 22.0, "rural": 39.5},
    {"anio": 2025, "urbana": 20.9, "rural": 38.6},
    {"anio": 2026, "urbana": 20.0, "rural": 37.7},
]

# === POBREZA MONETARIA POR REGIÓN (% población, 2024 INEI) ===
POBREZA_POR_REGION_2024 = {
    "CAJAMARCA": 41.5, "LORETO": 38.0, "PASCO": 37.8, "HUANCAVELICA": 36.0,
    "PUNO": 35.5, "AMAZONAS": 33.0, "AYACUCHO": 32.5, "UCAYALI": 32.2,
    "HUANUCO": 31.8, "APURIMAC": 31.0, "PIURA": 28.5, "SAN MARTIN": 27.8,
    "LA LIBERTAD": 27.0, "JUNIN": 26.2, "ANCASH": 25.8, "CUSCO": 24.5,
    "TUMBES": 24.0, "LAMBAYEQUE": 23.4, "LIMA": 22.1, "AREQUIPA": 18.5,
    "TACNA": 12.5, "ICA": 11.0, "MOQUEGUA": 10.8, "MADRE DE DIOS": 8.8,
    "CALLAO": 21.5,
}

# Línea de pobreza monetaria nacional (S/ por persona por mes, INEI)
LINEA_POBREZA_SOLES_MES = {
    2010: 256, 2015: 315, 2018: 344, 2020: 360, 2022: 415,
    2023: 446, 2024: 458, 2025: 471, 2026: 485,
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
    print("BCRP/INEI · Inflación, tipo de cambio y pobreza")

    serie = []
    for anio in range(ANIO_MIN, ANIO_MAX + 1):
        serie.append({
            "anio": anio,
            "inflacion_pct": INFLACION_PCT.get(anio),
            "tipo_cambio_sol_usd": TIPO_CAMBIO.get(anio),
            "pobreza_total_pct": POBREZA_TOTAL_PCT.get(anio),
            "pobreza_extrema_pct": POBREZA_EXTREMA_PCT.get(anio),
            "linea_pobreza_soles_mes": int(interp(LINEA_POBREZA_SOLES_MES, anio)) if anio >= 2010 else None,
        })
    guardar_json("inflacion_pobreza.json", serie)
    guardar_json("ipc_desagregado.json", IPC_DESAGREGADO_2024)
    guardar_json("pobreza_urbana_rural.json", POBREZA_URBANA_RURAL)
    guardar_json("pobreza_por_region.json", [
        {"region": k, "pobreza_pct": v} for k, v in POBREZA_POR_REGION_2024.items()
    ])
    guardar_json("pobreza_ambito_2024.json", POBREZA_AMBITO_2024)


if __name__ == "__main__":
    build()
