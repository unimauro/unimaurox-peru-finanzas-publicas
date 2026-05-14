"""Genera la imagen Open Graph (1200x630) para previews en WhatsApp/Twitter/etc.

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
ROJO = (217, 16, 35)        # #D91023
DORADO = (201, 160, 46)     # #C9A02E
BLANCO = (255, 255, 255)
GRIS = (200, 210, 220)


def find_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Intenta encontrar una fuente decente en el sistema."""
    candidatos = [
        # macOS
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        # Linux común
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for c in candidatos:
        try:
            return ImageFont.truetype(c, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def lerp(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def gradient_background(img: Image.Image):
    """Fondo con gradiente diagonal azul → azul medio."""
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        color = lerp(AZUL, AZUL_MEDIO, t)
        draw.line([(0, y), (W, y)], fill=color)


def draw_chart_bars(draw: ImageDraw.ImageDraw, x0: int, y_base: int):
    """Tres barras estilo dashboard."""
    bar_w = 90
    gap = 30
    alturas = [180, 250, 340]
    colores = [ROJO, DORADO, BLANCO]
    for i, (h, c) in enumerate(zip(alturas, colores)):
        x = x0 + i * (bar_w + gap)
        # Sombra suave
        for off in range(8, 0, -1):
            shadow = (0, 0, 0, max(0, 60 - off * 6))
            draw.rounded_rectangle(
                [x + 2, y_base - h + 2 + off, x + bar_w + 2, y_base + off],
                radius=10, fill=(0, 0, 0, 30),
            )
        draw.rounded_rectangle(
            [x, y_base - h, x + bar_w, y_base],
            radius=10, fill=c,
        )


def draw_text_with_shadow(draw, pos, text, font, fill, shadow=(0, 0, 0, 80)):
    x, y = pos
    draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0))
    draw.text(pos, text, font=font, fill=fill)


def main():
    img = Image.new("RGB", (W, H), AZUL)
    gradient_background(img)
    draw = ImageDraw.Draw(img, "RGBA")

    # Acento dorado decorativo arriba a la derecha
    for i in range(5):
        draw.ellipse(
            [W - 200 - i * 30, -100 - i * 20, W + 50 - i * 30, 200 - i * 20],
            outline=(DORADO[0], DORADO[1], DORADO[2], 25 + i * 5), width=2,
        )

    # Línea decorativa horizontal arriba
    draw.rectangle([60, 60, 60 + 8, 110], fill=ROJO)
    draw.rectangle([60 + 12, 60, 60 + 20, 110], fill=BLANCO)
    draw.rectangle([60 + 24, 60, 60 + 32, 110], fill=ROJO)

    # Chip "Perú · 1990-2025"
    font_chip = find_font(22, bold=True)
    chip_text = "PERÚ  ·  1990 – 2025"
    bbox = draw.textbbox((0, 0), chip_text, font=font_chip)
    cw = bbox[2] - bbox[0]
    ch = bbox[3] - bbox[1]
    chip_x, chip_y = 110, 70
    draw.rounded_rectangle(
        [chip_x - 14, chip_y - 8, chip_x + cw + 14, chip_y + ch + 12],
        radius=24, outline=(DORADO[0], DORADO[1], DORADO[2], 200), width=2,
    )
    draw.text((chip_x, chip_y), chip_text, font=font_chip,
              fill=(DORADO[0], DORADO[1], DORADO[2]))

    # Título grande
    font_title = find_font(82, bold=True)
    titulo_l1 = "Finanzas Públicas"
    titulo_l2 = "del Perú"
    draw_text_with_shadow(draw, (110, 145), titulo_l1, font_title, BLANCO)
    draw_text_with_shadow(draw, (110, 235), titulo_l2, font_title,
                          (DORADO[0], DORADO[1], DORADO[2]))

    # Subtítulo
    font_sub = find_font(28)
    subtitulo = "PBI · Deuda · Presupuesto · Mapa regional"
    draw.text((110, 345), subtitulo, font=font_sub, fill=GRIS)

    subtitulo2 = "Dashboard interactivo con datos oficiales de BCRP, MEF e INEI"
    font_sub2 = find_font(22)
    draw.text((110, 388), subtitulo2, font=font_sub2, fill=(180, 195, 215))

    # Barras decorativas (representan los KPIs)
    draw_chart_bars(draw, x0=760, y_base=480)

    # Footer URL
    font_url = find_font(20, bold=True)
    url = "unimauro.github.io/unimaurox-peru-finanzas-publicas"
    draw.text((110, H - 70), url, font=font_url, fill=BLANCO)

    # Pequeño autor
    font_autor = find_font(18)
    draw.text((110, H - 40), "por @unimauro · open source · MIT", font=font_autor,
              fill=(160, 180, 200))

    # Línea de color (banda inferior estilo banderín)
    band = 6
    draw.rectangle([0, H - band - 12, W // 3, H - band - 6], fill=ROJO)
    draw.rectangle([W // 3, H - band - 12, 2 * W // 3, H - band - 6], fill=BLANCO)
    draw.rectangle([2 * W // 3, H - band - 12, W, H - band - 6], fill=ROJO)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"✓ {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
