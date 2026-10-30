"""Gera as imagens (WebP) e os reels (MP4 leves + pôster) do site a partir de ../_ref.
Uso: python tools/processar.py [fotos|reels]"""
import os, sys, glob, json, subprocess
from PIL import Image, ImageOps
import imageio_ffmpeg

AQUI = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(AQUI)
REF = os.path.join(os.path.dirname(SITE), '_ref')
IMG = os.path.join(SITE, 'assets', 'img'); VID = os.path.join(SITE, 'assets', 'video')
FF = imageio_ffmpeg.get_ffmpeg_exe()

def ig(cod):
    return Image.open(glob.glob(os.path.join(REF, 'ig', cod + '_*.jpg'))[0]).convert('RGB')

def salvar(im, nome, larguras, q=80):
    os.makedirs(os.path.dirname(os.path.join(IMG, nome)), exist_ok=True)
    for w in larguras:
        t = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        t.save(os.path.join(IMG, f'{nome}-{w}.webp'), 'WEBP', quality=q, method=6)

# id, foto do IG, legenda (alt), foco vertical do recorte 4:5 (0 = topo, .5 = centro)
PISTA = [
    ('pista-01', '088_3', 'Noiva de braços para cima no meio da pista, sob os feixes de luz', .4),
    ('pista-02', '069_2', 'Convidados pulando com a garrafa no alto', .3),
    ('pista-03', '089_3', 'Noiva e amigos cantando juntos na pista', .4),
    ('pista-04', '060_0', 'Noivos dançando sob a luz branca, em preto e branco', .4),
    ('pista-05', '096_5', 'Noiva cercada de amigas com as mãos para o alto', .4),
    ('pista-06', '081_0', 'Globo espelhado e feixes sobre a pista cheia', .5),
    ('pista-07', '088_0', 'A primeira dança, com o globo brilhando ao fundo', .4),
    ('pista-08', '140_4', 'Noiva no chão da pista, rodeada pelos convidados', .5),
    ('pista-09', '069_1', 'Pista cheia em preto e branco, com os copos no alto', .4),
    ('pista-10', '089_4', 'Amigas abraçadas e cantando na pista', .4),
    ('pista-11', '094_0', 'Noiva entrando na pista entre os convidados', .5),
    ('pista-12', '052_0', 'Brinde no meio da pista, contra a luz alaranjada', .5),
]

def fotos():
    h = ig('098_0')                      # nos pratos, paletó claro, fundo escuro
    salvar(h, 'hero/mattos', [720, 1080, 1440], 82)
    for cod, nome in [('088_5', 'sobre/palco'), ('053_0', 'sobre/retrato'),
                      ('018_0', 'processo/notebook'), ('083_0', 'servicos/cerimonia'), ('140_3', 'servicos/social'),
                      ('032_1', 'servicos/corporativo'), ('117_3', 'servicos/destination')]:
        salvar(ig(cod), nome, [640, 1080])
    # faixa de braços abertos: a versão vertical em 1440 (a horizontal do IG tem só 1065 px), recortada em 16:10
    b = ig('096_4'); ch = round(b.width * 900 / 1440); top = max(0, min(b.height - ch, round(b.height * .56) - ch // 2))
    salvar(b.crop((0, top, b.width, top + ch)), 'faixa/bracos', [900, 1440])
    lista = []
    for id_, cod, alt, foco in PISTA:
        im = ImageOps.fit(ig(cod), (1080, 1350), Image.LANCZOS, centering=(.5, foco))
        salvar(im, 'pista/' + id_, [640, 1080])
        lista.append({'id': id_, 'a': alt})
    with open(os.path.join(SITE, 'assets', 'js', 'pista.js'), 'w', encoding='utf-8') as f:
        f.write('/* gerado por tools/processar.py */\nwindow.PISTA = ' + json.dumps(lista, ensure_ascii=False) + ';\n')

# reels: nome, arquivo em _ref, segundo do pôster
REELS = [('crianca', 'videos/014_Dd2UlEEJuXz.mp4', 9), ('casal', 'videos/082_DQNbDYLCcAk.mp4', 6),
         ('amigas', 'videos/159_DA3SCENvd4x.mp4', 22), ('pista', 'videos/074_DRvHw1MCX4S.mp4', 14)]

def reels():
    os.makedirs(VID, exist_ok=True)
    for nome, src, seg in REELS:
        src = os.path.join(REF, src); mp4 = os.path.join(VID, f'reel-{nome}.mp4')
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-vf', 'scale=-2:min(960\\,ih)', '-c:v', 'libx264', '-preset', 'slow',
                        '-crf', '29', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4], check=True)
        png = os.path.join(VID, 'tmp.png')
        subprocess.run([FF, '-y', '-loglevel', 'error', '-ss', str(seg), '-i', src, '-frames:v', '1', png], check=True)
        os.makedirs(os.path.join(IMG, 'reels'), exist_ok=True)
        Image.open(png).convert('RGB').resize((540, 960), Image.LANCZOS).save(os.path.join(IMG, 'reels', nome + '.webp'), 'WEBP', quality=72)
        os.remove(png)
        print(mp4, round(os.path.getsize(mp4) / 1e6, 2), 'MB')

if __name__ == '__main__':
    so = set(sys.argv[1:]) or {'fotos', 'reels'}
    if 'fotos' in so: fotos()
    if 'reels' in so: reels()
