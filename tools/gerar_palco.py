"""Renderiza a luz de palco (assets/js/palco.js) quadro a quadro num Edge headless e gera os MP4
das telas de toque: palco-hero-pe / palco-hero-deitado (topo) e palco-calma-pe / palco-calma-deitado
(seção Consultar uma data). O loop fecha sem emenda (fase 0 -> 2π).
Os valores de modo/força/ciclo têm que bater com os data-* das caixas .palco do index.html.
Uso: python tools/gerar_palco.py [nome ...]   |   python tools/gerar_palco.py --quadro saida.png [modo] [fase]"""
import os, sys, subprocess, base64
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
VID = os.path.join(SITE, 'assets', 'video')
FPS = 24
# nome, largura, altura, modo, força, ciclo em segundos
VERSOES = [
    ('palco-hero-pe', 720, 1560, 0, 1.25, 36),
    ('palco-hero-deitado', 1280, 720, 0, 1.25, 36),
    ('palco-calma-pe', 720, 1280, 1, .9, 48),
    ('palco-calma-deitado', 1280, 720, 1, .9, 48),
]

def preparar(pg, w, h, modo, forca):
    pg.set_viewport_size({'width': w, 'height': h})
    pg.evaluate(f"""(() => {{ document.body.innerHTML = '<canvas id="c"></canvas>';
        window.T = palcoGL(document.getElementById('c'), {{preserveDrawingBuffer: true, modo: {modo}, forca: {forca}}}); T.tamanho({w}, {h}); }})()""")

def quadro(pg, fase):
    return base64.b64decode(pg.evaluate(f"(T.desenhar({fase}), document.getElementById('c').toDataURL('image/png'))").split(',', 1)[1])

def renderizar(pg, nome, w, h, modo, forca, ciclo):
    q = FPS * ciclo
    mp4 = os.path.join(VID, nome + '.mp4')
    enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-an', mp4], stdin=subprocess.PIPE)
    preparar(pg, w, h, modo, forca)
    for i in range(q):
        enc.stdin.write(quadro(pg, i / q * 6.283185307179586))
    enc.stdin.close(); enc.wait()
    print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB', flush=True)

if __name__ == '__main__':
    args = sys.argv[1:]
    os.makedirs(VID, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(channel='msedge', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = b.new_page()
        pg.set_content('<body style="margin:0;background:#000"></body>')
        pg.add_script_tag(content=open(os.path.join(SITE, 'assets', 'js', 'palco.js'), encoding='utf-8').read())
        if args and args[0] == '--quadro':
            modo = int(args[2]) if len(args) > 2 else 0
            preparar(pg, 1280, 720, modo, 1.25)
            open(args[1], 'wb').write(quadro(pg, float(args[3]) if len(args) > 3 else 1.0))
        else:
            for v in VERSOES:
                if not args or v[0] in args: renderizar(pg, *v)
        b.close()
