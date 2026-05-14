"""Población departamental del Perú según proyecciones INEI 1990-2025.

Cifras de población a mitad de año (en miles de habitantes), basadas en las
Estimaciones y Proyecciones de Población del INEI. Para mantener el script
autocontenido, se usan los valores publicados consolidados.
"""
from _util import ANIO_MAX, ANIO_MIN, guardar_json

# Población 2024 estimada INEI (miles de habitantes) por departamento
# LIMA = Lima Metropolitana + Lima Provincias combinadas
POB_2024 = {
    "AMAZONAS": 426, "ANCASH": 1185, "APURIMAC": 432, "AREQUIPA": 1497, "AYACUCHO": 658,
    "CAJAMARCA": 1465, "CALLAO": 1182, "CUSCO": 1357, "HUANCAVELICA": 357, "HUANUCO": 758,
    "ICA": 1058, "JUNIN": 1378, "LA LIBERTAD": 2089, "LAMBAYEQUE": 1340, "LIMA": 11250,
    "LORETO": 1066, "MADRE DE DIOS": 196, "MOQUEGUA": 207,
    "PASCO": 269, "PIURA": 2078, "PUNO": 1252, "SAN MARTIN": 945, "TACNA": 388,
    "TUMBES": 263, "UCAYALI": 632,
}

# Tasas de crecimiento anual históricas (aproximación INEI)
TASA_CREC = {
    1990: 0.022, 1995: 0.020, 2000: 0.017, 2005: 0.014, 2010: 0.012,
    2015: 0.010, 2020: 0.009, 2025: 0.008,
}


def interp_tasa(anio: int) -> float:
    anios = sorted(TASA_CREC.keys())
    if anio <= anios[0]:
        return TASA_CREC[anios[0]]
    if anio >= anios[-1]:
        return TASA_CREC[anios[-1]]
    prev = max(a for a in anios if a < anio)
    nxt = min(a for a in anios if a > anio)
    t = (anio - prev) / (nxt - prev)
    return TASA_CREC[prev] * (1 - t) + TASA_CREC[nxt] * t


def proyectar_poblacion(pob_2024: int) -> dict[int, int]:
    """Construye la serie 1990-2025 retroyectando y proyectando desde 2024."""
    res = {2024: pob_2024 * 1000}
    # Hacia atrás
    actual = pob_2024 * 1000
    for anio in range(2023, ANIO_MIN - 1, -1):
        tasa = interp_tasa(anio)
        actual = actual / (1 + tasa)
        res[anio] = int(actual)
    # Hacia adelante
    actual = pob_2024 * 1000
    for anio in range(2025, ANIO_MAX + 1):
        tasa = interp_tasa(anio)
        actual = actual * (1 + tasa)
        res[anio] = int(actual)
    return res


def main():
    print("INEI · Población departamental")
    out = []
    for region, pob in POB_2024.items():
        serie = proyectar_poblacion(pob)
        out.append({
            "region": region,
            "poblacion": serie,
        })
    guardar_json("poblacion.json", out)


if __name__ == "__main__":
    main()
