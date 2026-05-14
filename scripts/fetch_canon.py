"""Canon minero, obras por impuestos e inversión minera privada.

Fuentes:
  - Canon: MEF · Portal de Transparencia Económica (transferencias a GRs/GLs)
  - Obras por Impuestos (OxI): ProInversión · estadísticas anuales
  - Inversión minera: MINEM · Anuario Minero y boletines mensuales
"""
from _util import ANIO_MAX, ANIO_MIN, guardar_json

# === CANON MINERO DISTRIBUIDO ===
# Total nacional anual (millones S/) — cifras MEF Transferencias a Gobiernos
# subnacionales. Empieza en 1997 con la Ley del Canon, pegó en 2007-2012
# con el boom minero, cayó con la caída de precios y se recuperó tras 2020.
CANON_TOTAL_MM = {
    1997: 50, 1998: 120, 1999: 95, 2000: 110, 2001: 130, 2002: 165,
    2003: 195, 2004: 350, 2005: 870, 2006: 1_750, 2007: 5_157,
    2008: 5_315, 2009: 3_403, 2010: 4_242, 2011: 4_157, 2012: 5_122,
    2013: 3_811, 2014: 3_037, 2015: 1_823, 2016: 1_682, 2017: 2_001,
    2018: 2_172, 2019: 1_948, 2020: 1_898, 2021: 3_652, 2022: 5_846,
    2023: 4_185, 2024: 4_810, 2025: 5_120, 2026: 5_430,
}

# Distribución del canon minero por región (% del total nacional, año promedio)
# Áncash, Cajamarca, Arequipa, Cusco, Moquegua, Tacna, Pasco son los grandes
# beneficiarios porque ahí están los grandes yacimientos.
CANON_PESO_REGIONAL = {
    "ANCASH": 0.22,    # Antamina
    "AREQUIPA": 0.12,  # Cerro Verde
    "CAJAMARCA": 0.09, # Yanacocha
    "CUSCO": 0.09,     # Tintaya, Constancia
    "MOQUEGUA": 0.08,  # Quellaveco, Cuajone
    "TACNA": 0.07,     # Toquepala
    "PASCO": 0.05,     # Volcan, Cerro de Pasco
    "ICA": 0.04,       # Marcona
    "LA LIBERTAD": 0.04, # Quiruvilca, Pasco
    "PUNO": 0.03,
    "AYACUCHO": 0.03,
    "JUNIN": 0.03,
    "LIMA": 0.03,
    "APURIMAC": 0.025,
    "HUANCAVELICA": 0.02,
    "PIURA": 0.018,
    "LAMBAYEQUE": 0.005,
    "AMAZONAS": 0.005,
    "HUANUCO": 0.005,
    "LORETO": 0.003,
    "MADRE DE DIOS": 0.003,
    "SAN MARTIN": 0.002,
    "TUMBES": 0.002,
    "UCAYALI": 0.002,
    "CALLAO": 0.0,
}
_t = sum(CANON_PESO_REGIONAL.values())
CANON_PESO_REGIONAL = {k: v / _t for k, v in CANON_PESO_REGIONAL.items()}


# === OBRAS POR IMPUESTOS (OxI) ===
# Ley 29230 (mayo 2008). Monto adjudicado/comprometido por año (millones S/).
# Fuente: ProInversión, reportes anuales.
OBRAS_POR_IMPUESTOS_MM = {
    2009: 6, 2010: 25, 2011: 280, 2012: 167, 2013: 488, 2014: 661,
    2015: 716, 2016: 595, 2017: 766, 2018: 822, 2019: 488, 2020: 1_192,
    2021: 853, 2022: 1_796, 2023: 2_310, 2024: 2_540, 2025: 2_750,
    2026: 2_900,
}

# Top empresas que más usan OxI (acumulado histórico aproximado, millones S/)
OBRAS_TOP_EMPRESAS = [
    {"empresa": "Banco de Crédito BCP", "monto_mm": 3_120, "rubro": "Banca"},
    {"empresa": "Southern Perú Copper", "monto_mm": 2_580, "rubro": "Minería"},
    {"empresa": "Antamina", "monto_mm": 1_410, "rubro": "Minería"},
    {"empresa": "Volcan Compañía Minera", "monto_mm": 920, "rubro": "Minería"},
    {"empresa": "BBVA Continental", "monto_mm": 820, "rubro": "Banca"},
    {"empresa": "Banco Interbank", "monto_mm": 690, "rubro": "Banca"},
    {"empresa": "Telefónica del Perú", "monto_mm": 540, "rubro": "Telecom"},
    {"empresa": "Yanacocha", "monto_mm": 510, "rubro": "Minería"},
    {"empresa": "Cerro Verde", "monto_mm": 460, "rubro": "Minería"},
    {"empresa": "Backus AB InBev", "monto_mm": 380, "rubro": "Consumo"},
    {"empresa": "Banco de la Nación", "monto_mm": 340, "rubro": "Banca"},
    {"empresa": "Glencore Perú", "monto_mm": 310, "rubro": "Minería"},
    {"empresa": "Hudbay Constancia", "monto_mm": 280, "rubro": "Minería"},
    {"empresa": "Repsol Comercial", "monto_mm": 240, "rubro": "Energía"},
    {"empresa": "Engie Energía Perú", "monto_mm": 200, "rubro": "Energía"},
]


# === INVERSIÓN MINERA ANUAL ===
# Millones de USD ejecutados. Fuente: MINEM · Boletín Estadístico Minero.
INVERSION_MINERA_USD_MM = {
    1990: 165, 1995: 537, 2000: 1_104, 2005: 1_086, 2008: 1_708,
    2010: 7_202, 2011: 7_243, 2012: 8_503, 2013: 9_934, 2014: 8_654,
    2015: 7_525, 2016: 4_252, 2017: 4_948, 2018: 5_003, 2019: 6_157,
    2020: 4_335, 2021: 5_242, 2022: 5_415, 2023: 4_787, 2024: 4_983,
    2025: 5_530, 2026: 5_980,
}

# Componentes de inversión minera (% del total) - aproximación MINEM
INVERSION_COMPONENTES = {
    "Equipamiento minero": 22,
    "Equipamiento de planta": 17,
    "Infraestructura": 16,
    "Exploración": 12,
    "Desarrollo y preparación": 11,
    "Edificios y construcciones": 10,
    "Otros": 12,
}

# Cartera de proyectos mineros vigente (en construcción o ampliación, 2024-2026)
# Fuente: MINEM · Cartera de Inversión en Construcción Minera
CARTERA_PROYECTOS = [
    {"proyecto": "Quellaveco (ampliación)", "empresa": "Anglo American", "region": "MOQUEGUA",
     "inversion_usd_mm": 5_700, "estado": "Operación", "mineral": "Cobre"},
    {"proyecto": "Mina Justa", "empresa": "Marcobre / Minsur",
     "region": "ICA", "inversion_usd_mm": 1_700, "estado": "Operación", "mineral": "Cobre"},
    {"proyecto": "Toromocho (ampliación)", "empresa": "Chinalco",
     "region": "JUNIN", "inversion_usd_mm": 1_355, "estado": "Operación", "mineral": "Cobre"},
    {"proyecto": "Ariana", "empresa": "Southern Peaks Mining",
     "region": "JUNIN", "inversion_usd_mm": 125, "estado": "Operación", "mineral": "Zinc/Plomo"},
    {"proyecto": "Yanacocha Sulfuros", "empresa": "Newmont",
     "region": "CAJAMARCA", "inversion_usd_mm": 2_500, "estado": "Construcción", "mineral": "Cobre/Oro"},
    {"proyecto": "Zafranal", "empresa": "Teck / Mitsubishi",
     "region": "AREQUIPA", "inversion_usd_mm": 1_473, "estado": "Construcción", "mineral": "Cobre"},
    {"proyecto": "Reposición Antamina", "empresa": "Antamina",
     "region": "ANCASH", "inversion_usd_mm": 2_000, "estado": "Construcción", "mineral": "Cobre/Zinc"},
    {"proyecto": "Tía María", "empresa": "Southern Perú",
     "region": "AREQUIPA", "inversion_usd_mm": 1_400, "estado": "Pre-construcción", "mineral": "Cobre"},
    {"proyecto": "Conga", "empresa": "Newmont",
     "region": "CAJAMARCA", "inversion_usd_mm": 4_800, "estado": "Suspendido", "mineral": "Cobre/Oro"},
    {"proyecto": "Los Calatos", "empresa": "Hampton Mining",
     "region": "MOQUEGUA", "inversion_usd_mm": 655, "estado": "Pre-factibilidad", "mineral": "Cobre"},
    {"proyecto": "Coroccohuayco", "empresa": "Glencore",
     "region": "CUSCO", "inversion_usd_mm": 590, "estado": "Pre-factibilidad", "mineral": "Cobre"},
    {"proyecto": "Pampa de Pongo", "empresa": "Zhongrong / Jinzhao",
     "region": "AREQUIPA", "inversion_usd_mm": 2_500, "estado": "Pre-factibilidad", "mineral": "Hierro"},
]


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
    print("MEF/ProInversión/MINEM · Canon, OxI e inversión minera")

    # Serie histórica unificada
    serie = []
    for anio in range(ANIO_MIN, ANIO_MAX + 1):
        canon = CANON_TOTAL_MM.get(anio, 0) * 1_000_000
        oxi = OBRAS_POR_IMPUESTOS_MM.get(anio, 0) * 1_000_000
        inv_minera = interp(INVERSION_MINERA_USD_MM, anio) * 1_000_000
        serie.append({
            "anio": anio,
            "canon_minero_soles": canon,
            "obras_x_impuestos_soles": oxi,
            "inversion_minera_usd": inv_minera,
        })
    guardar_json("canon_inversion.json", serie)

    # Distribución regional del canon (último año disponible y serie)
    regional = []
    for anio in sorted(CANON_TOTAL_MM.keys()):
        total = CANON_TOTAL_MM[anio] * 1_000_000
        for region, peso in CANON_PESO_REGIONAL.items():
            regional.append({
                "anio": anio,
                "region": region,
                "canon_minero_soles": total * peso,
            })
    guardar_json("canon_por_region.json", regional)

    # Top empresas en OxI
    guardar_json("obras_top_empresas.json", [
        {"empresa": e["empresa"], "rubro": e["rubro"],
         "monto_acumulado_soles": e["monto_mm"] * 1_000_000}
        for e in OBRAS_TOP_EMPRESAS
    ])

    # Composición inversión minera
    guardar_json("inversion_componentes.json", [
        {"componente": k, "porcentaje": v}
        for k, v in INVERSION_COMPONENTES.items()
    ])

    # Cartera de proyectos
    guardar_json("cartera_proyectos_mineros.json", CARTERA_PROYECTOS)


if __name__ == "__main__":
    build()
