"""Gera og.jpg (1200x630, conteúdo centrado porque o WhatsApp recorta quadrado), apple-touch-icon.png e
favicon-32.png com as barras do logo. Fontes: converte os woff2 do site para TTF temporário."""
import os, io
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
FON = os.path.join(SITE, 'assets', 'fontes')

def fonte(arq, tam, peso=None):
    f = TTFont(os.path.join(FON, arq)); f.flavor = None
    if peso and 'fvar' in f:
        from fontTools.varLib.instancer import instantiateVariableFont
        f = instantiateVariableFont(f, {'wght': peso})
    b = io.BytesIO(); f.save(b); b.seek(0)
    return ImageFont.truetype(b, tam)

NOITE = (8, 8, 12); OSSO = (241, 240, 236); PRATA = (185, 187, 200); AZUL = (111, 132, 255)

def barras(d, x, y, esc, cor):
    for bx, by, bh in [(0, 12, 10), (8.5, 0, 22), (17, 8, 14), (25.5, 3, 19)]:
        d.rectangle([x + bx * esc, y + by * esc, x + (bx + 4) * esc, y + (by + bh) * esc], fill=cor)

def og():
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), NOITE)
    foto = Image.open(os.path.join(SITE, 'assets', 'img', 'hero', 'mattos-1080.webp')).convert('RGB')
    fw = 640; fh = round(foto.height * fw / foto.width); foto = foto.resize((fw, fh), Image.LANCZOS).crop((0, 40, fw, 40 + H))
    m = Image.new('L', (fw, H), 255); md = ImageDraw.Draw(m)
    for x in range(260):
        md.line([(x, 0), (x, H)], fill=round(255 * (x / 260) ** 1.4))
    # brilho azul atrás do nome, por baixo da foto
    fundo = Image.new('RGB', (W, H), NOITE); ImageDraw.Draw(fundo).ellipse([-200, 160, 700, 760], fill=(26, 28, 66))
    im = fundo.filter(ImageFilter.GaussianBlur(120))
    im.paste(foto, (W - fw, 0), m)
    d = ImageDraw.Draw(im)
    cap = fonte('cinzel-normal-500-latin.woff2', 112, 500); cap2 = fonte('cinzel-normal-500-latin.woff2', 40, 500)
    ser = fonte('cormorant-garamond-italic-500-latin.woff2', 40); sans = fonte('manrope-normal-300_700-latin.woff2', 20, 500)
    x = 150
    barras(d, x, 150, 2.2, OSSO)
    d.text((x, 222), 'D J', font=cap2, fill=PRATA)
    d.text((x - 6, 262), 'MATTOS', font=cap, fill=OSSO)
    d.text((x, 400), 'É curadoria personalizada.', font=ser, fill=(216, 220, 255))
    d.text((x, 470), 'CASAMENTOS  ·  CELEBRAÇÕES  ·  CORPORATIVOS', font=sans, fill=PRATA)
    im.save(os.path.join(SITE, 'og.jpg'), quality=86)

def icones():
    for nome, tam in [('apple-touch-icon.png', 180), ('favicon-32.png', 32)]:
        im = Image.new('RGB', (tam, tam), NOITE); d = ImageDraw.Draw(im)
        esc = tam * .56 / 29.5
        barras(d, (tam - 29.5 * esc) / 2, (tam - 22 * esc) / 2, esc, OSSO)
        im.save(os.path.join(SITE, nome))

if __name__ == '__main__':
    og(); icones()
