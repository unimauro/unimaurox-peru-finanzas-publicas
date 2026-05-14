"""Genera la imagen Open Graph (1200x630) con cifras clave del dashboard.

Salida: public/og-image.png
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og-image.png"

W, H = 1200, 630

# Paleta institucional
AZUL = (11, 37, 69)         # #0B2545
AZUL_MEDIO = (27, 58, 107)  # #1B3A6B
AZUL_OSCURO = (6, 24, 46)
ROJO = (217, 16, 35)
DORADO = (201, 160, 46)
DORADO_CLARO = (242, 201, 76)
BLANCO = (255, 255, 255)
GRIS = (200, 210, 220)
GRIS_OSCURO = (140, 155, 175)
EMERALD = (34, 197, 94)


def find_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidatos = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for c in candidatos:
        try:
            return ImageFont.truetype(c, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def gradient_background(img):
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        color = lerp(AZUL_OSCURO, AZUL_MEDIO, t)
        draw.line([(0, y), (W, y)], fill=color)


def draw_kpi_box(draw, x, y, w, h, etiqueta, valor, sub, color_valor, color_accento):
    # Card con borde sutil
    draw.rounded_rectangle([x, y, x + w, y + h], radius=18,
                           fill=(255, 255, 255, 12),
                           outline=(255, 255, 255, 40), width=2)
    # Línea de acento arriba
    draw.rounded_rectangle([x + 18, y + 14, x + 60, y + 18], radius=2,
                           fill=color_accento)
    # Etiqueta
    font_lbl = find_font(20, bold=True)
    draw.text((x + 18, y + 28), etiqueta.upper(), font=font_lbl, fill=GRIS_OSCURO)
    # Valor grande
    font_val = find_font(56, bold=True)
    draw.text((x + 18, y + 60), valor, font=font_val, fill=color_valor)
    # Subtitle
    font_sub = find_font(20)
    draw.text((x + 18, y + h - 38), sub, font=font_sub, fill=GRIS)


def main():
    img = Image.new("RGB", (W, H), AZUL_OSCURO)
    gradient_background(img)
    draw = ImageDraw.Draw(img, "RGBA")

    # Decoración: curvas suaves en esquina superior derecha
    for i in range(6):
        draw.ellipse(
            [W - 220 - i * 25, -120 - i * 18, W + 60 - i * 25, 220 - i * 18],
            outline=(DORADO[0], DORADO[1], DORADO[2], 22 + i * 4), width=2,
        )

    # Banderín peruano (3 franjas verticales) decorativo a la izquierda
    band_w = 5
    band_h = 70
    draw.rectangle([60, 70, 60 + band_w, 70 + band_h], fill=ROJO)
    draw.rectangle([60 + band_w + 3, 70, 60 + 2 * band_w + 3, 70 + band_h], fill=BLANCO)
    draw.rectangle([60 + 2 * band_w + 6, 70, 60 + 3 * band_w + 6, 70 + band_h], fill=ROJO)

    # Chip "Perú · 1990-2025"
    font_chip = find_font(18, bold=True)
    chip_text = "DASHBOARD CIUDADANO · 1990–2025"
    bbox = draw.textbbox((0, 0), chip_text, font=font_chip)
    cw = bbox[2] - bbox[0]
    chip_x, chip_y = 110, 78
    draw.rounded_rectangle(
        [chip_x - 14, chip_y - 6, chip_x + cw + 14, chip_y + 30],
        radius=20, fill=(DORADO[0], DORADO[1], DORADO[2], 35),
        outline=(DORADO[0], DORADO[1], DORADO[2], 180), width=2,
    )
    draw.text((chip_x, chip_y + 2), chip_text, font=font_chip,
              fill=(DORADO_CLARO[0], DORADO_CLARO[1], DORADO_CLARO[2]))

    # Título principal
    font_title = find_font(64, bold=True)
    draw.text((60, 145), "Finanzas Públicas", font=font_title, fill=BLANCO)
    draw.text((60, 215), "del Perú", font=font_title,
              fill=(DORADO_CLARO[0], DORADO_CLARO[1], DORADO_CLARO[2]))

    # KPI Cards en grid 4 columnas
    card_y = 320
    card_h = 175
    card_w = 250
    card_gap = 25
    start_x = (W - (4 * card_w + 3 * card_gap)) // 2

    kpis = [
        {
            "etiqueta": "PBI 2025",
            "valor": "S/ 1.07",
            "sub": "billones · BCRP",
            "color_valor": BLANCO,
            "accento": (96, 165, 250),  # azul claro
        },
        {
            "etiqueta": "Deuda Pública",
            "valor": "34.0%",
            "sub": "del PBI · MEF",
            "color_valor": (DORADO_CLARO[0], DORADO_CLARO[1], DORADO_CLARO[2]),
            "accento": DORADO,
        },
        {
            "etiqueta": "Presupuesto",
            "valor": "S/ 258",
            "sub": "mil millones · PIM",
            "color_valor": BLANCO,
            "accento": (244, 114, 182),  # rosa
        },
        {
            "etiqueta": "Ejecución",
            "valor": "88%",
            "sub": "Devengado / PIM",
            "color_valor": (134, 239, 172),  # verde claro
            "accento": EMERALD,
        },
    ]
    for i, k in enumerate(kpis):
        x = start_x + i * (card_w + card_gap)
        draw_kpi_box(draw, x, card_y, card_w, card_h,
                     k["etiqueta"], k["valor"], k["sub"],
                     k["color_valor"], k["accento"])

    # Subtitle debajo de las cards
    font_sub = find_font(22)
    sub = "PBI · Deuda · Presupuesto · Ejecución · Mapa regional"
    bbox = draw.textbbox((0, 0), sub, font=font_sub)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, 525), sub, font=font_sub, fill=GRIS)

    # Footer: URL + autor
    font_url = find_font(20, bold=True)
    url = "unimauro.github.io/unimaurox-peru-finanzas-publicas"
    bbox = draw.textbbox((0, 0), url, font=font_url)
    uw = bbox[2] - bbox[0]
    draw.text(((W - uw) // 2, H - 75), url, font=font_url, fill=BLANCO)

    font_autor = find_font(16)
    autor = "Datos oficiales · BCRP · MEF · INEI  ·  por @unimauro  ·  Open source MIT"
    bbox = draw.textbbox((0, 0), autor, font=font_autor)
    aw = bbox[2] - bbox[0]
    draw.text(((W - aw) // 2, H - 48), autor, font=font_autor,
              fill=GRIS_OSCURO)

    # Banderín peruano horizontal en el footer
    band = 6
    third = W // 3
    draw.rectangle([0, H - band - 18, third, H - band - 12], fill=ROJO)
    draw.rectangle([third, H - band - 18, 2 * third, H - band - 12], fill=BLANCO)
    draw.rectangle([2 * third, H - band - 18, W, H - band - 12], fill=ROJO)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"✓ {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
