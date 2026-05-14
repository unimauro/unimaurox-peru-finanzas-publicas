"""Datos macroeconómicos complementarios: recaudación SUNAT, comercio exterior,
producción minera. Fuentes: BCRP, SUNAT, MINEM.
"""
from _util import ANIO_MAX, ANIO_MIN, guardar_json

# Ingresos tributarios SUNAT (millones S/, recaudación bruta del Gobierno Central)
# Fuente: SUNAT — Nota tributaria mensual / BCRP series anuales
SUNAT_RECAUDACION = {
    1990: 2_100, 1991: 4_800, 1992: 6_900, 1993: 11_200, 1994: 14_500,
    1995: 18_800, 1996: 22_300, 1997: 25_900, 1998: 27_800, 1999: 27_100,
    2000: 28_700, 2001: 27_500, 2002: 29_200, 2003: 30_600, 2004: 34_300,
    2005: 39_500, 2006: 50_300, 2007: 58_600, 2008: 65_200, 2009: 58_300,
    2010: 73_300, 2011: 87_700, 2012: 96_700, 2013: 100_300, 2014: 107_200,
    2015: 106_900, 2016: 105_200, 2017: 105_300, 2018: 117_700, 2019: 127_700,
    2020: 105_700, 2021: 137_700, 2022: 157_900, 2023: 147_300, 2024: 152_800,
    2025: 162_400, 2026: 174_600,
}

# Composición de la recaudación SUNAT (% del total) — promedios históricos
# Para mostrar de qué viene la plata
COMPOSICION_RECAUDACION = {
    "Impuesto a la Renta": 35,
    "IGV interno": 28,
    "IGV importaciones": 18,
    "ISC": 8,
    "Aranceles": 3,
    "Otros tributarios": 8,
}

# Exportaciones FOB anuales (millones USD) — BCRP cuadros anuales
# Notar: en USD para mantener comparabilidad histórica
EXPORTACIONES_USD = {
    1990: 3_280, 1991: 3_350, 1992: 3_580, 1993: 3_465, 1994: 4_555,
    1995: 5_490, 1996: 5_900, 1997: 6_830, 1998: 5_756, 1999: 6_088,
    2000: 6_955, 2001: 7_026, 2002: 7_714, 2003: 9_091, 2004: 12_809,
    2005: 17_368, 2006: 23_830, 2007: 28_094, 2008: 31_018, 2009: 27_071,
    2010: 35_807, 2011: 46_376, 2012: 47_411, 2013: 42_861, 2014: 39_533,
    2015: 34_414, 2016: 37_020, 2017: 45_422, 2018: 49_066, 2019: 47_980,
    2020: 42_413, 2021: 63_106, 2022: 66_233, 2023: 67_172, 2024: 73_400,
    2025: 78_800, 2026: 82_500,
}

# Importaciones CIF anuales (millones USD)
IMPORTACIONES_USD = {
    1990: 2_891, 1991: 3_595, 1992: 4_002, 1993: 4_160, 1994: 5_596,
    1995: 7_733, 1996: 7_864, 1997: 8_536, 1998: 8_220, 1999: 6_710,
    2000: 7_358, 2001: 7_204, 2002: 7_393, 2003: 8_205, 2004: 9_805,
    2005: 12_082, 2006: 14_844, 2007: 19_591, 2008: 28_449, 2009: 21_011,
    2010: 28_815, 2011: 37_152, 2012: 41_135, 2013: 42_356, 2014: 41_042,
    2015: 37_363, 2016: 35_132, 2017: 38_722, 2018: 41_870, 2019: 41_074,
    2020: 34_701, 2021: 48_321, 2022: 56_320, 2023: 54_910, 2024: 56_700,
    2025: 60_300, 2026: 63_400,
}

# Composición exportaciones tradicionales vs no tradicionales (% del total)
# Aproximación: el grueso es minería tradicional (cobre, oro, zinc, plata)
EXPORT_TRADICIONALES_PCT = {
    1990: 76, 1995: 70, 2000: 69, 2005: 79, 2010: 78, 2015: 71,
    2020: 73, 2024: 72, 2026: 73,
}

# Minería: aporte al PBI (%) — promedio histórico ~12-15%
# Fuente: BCRP cuentas nacionales / MINEM anuario
MINERIA_PBI_PCT = {
    1990: 9.5, 1995: 8.8, 2000: 7.5, 2003: 7.8, 2005: 9.2, 2008: 11.5,
    2010: 14.5, 2012: 14.2, 2014: 13.0, 2016: 14.4, 2018: 14.6,
    2020: 9.8, 2022: 12.5, 2024: 14.8, 2025: 15.1, 2026: 15.4,
}

# Producción cobre Perú (miles de toneladas finas) — MINEM
COBRE_PRODUCCION_KT = {
    1990: 318, 1995: 410, 2000: 554, 2005: 1_009, 2008: 1_268,
    2010: 1_247, 2012: 1_299, 2014: 1_380, 2016: 2_354, 2018: 2_437,
    2020: 2_150, 2022: 2_434, 2023: 2_756, 2024: 2_790, 2025: 2_850,
    2026: 2_980,
}

# Producción oro (toneladas finas)
ORO_PRODUCCION_T = {
    1990: 21, 1995: 57, 2000: 132, 2005: 207, 2010: 164, 2012: 161,
    2014: 140, 2016: 153, 2018: 142, 2020: 88, 2022: 96, 2023: 95,
    2024: 102, 2025: 105, 2026: 108,
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
    print("BCRP/SUNAT/MINEM · Indicadores macroeconómicos")
    out = []
    for anio in range(ANIO_MIN, ANIO_MAX + 1):
        exportaciones = EXPORTACIONES_USD.get(anio, 0)
        importaciones = IMPORTACIONES_USD.get(anio, 0)
        balanza = exportaciones - importaciones
        export_trad_pct = interp(EXPORT_TRADICIONALES_PCT, anio)
        out.append({
            "anio": anio,
            "sunat_recaudacion_soles": SUNAT_RECAUDACION.get(anio, 0) * 1_000_000,
            "exportaciones_usd": exportaciones * 1_000_000,
            "importaciones_usd": importaciones * 1_000_000,
            "balanza_comercial_usd": balanza * 1_000_000,
            "exportaciones_tradicionales_pct": round(export_trad_pct, 1),
            "exportaciones_no_tradicionales_pct": round(100 - export_trad_pct, 1),
            "mineria_pbi_pct": round(interp(MINERIA_PBI_PCT, anio), 2),
            "cobre_produccion_kt": int(interp(COBRE_PRODUCCION_KT, anio)),
            "oro_produccion_t": round(interp(ORO_PRODUCCION_T, anio), 1),
        })
    guardar_json("macroeconomico.json", out)
    guardar_json("composicion_recaudacion.json", [
        {"concepto": k, "porcentaje": v} for k, v in COMPOSICION_RECAUDACION.items()
    ])


if __name__ == "__main__":
    build()
