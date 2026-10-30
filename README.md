# DJ Mattos

Site do Rodolpho Mattos, o DJ Mattos (@djmattos_), curadoria musical para casamentos, destination weddings, festas sociais e eventos corporativos. Base em Alphaville, São Paulo. Prévia: https://azeugral.github.io/dj-mattos/ (com `noindex` até a aprovação).

## Estrutura

- `index.html`: página única. Seções: hero, números, manifesto, sobre, celebrações (com a faixa de locais), como funciona, na pista (reels com som e galeria), faixa de foto, repertório (playlists do Spotify e sets do Mixcloud/SoundCloud), consultar uma data (ficha que monta a mensagem do WhatsApp), dúvidas e rodapé com todas as plataformas do Linktree.
- `assets/css/mattos.css`: noite `#08080c`, prata `#b9bbc8`, osso `#f1f0ec` e a luz de palco azul `#6f84ff` / violeta `#9a7cff`. Fontes self-hosted: Cinzel (nome, como as capitulares do logo dele), Cormorant Garamond (títulos) e Manrope (texto).
- `assets/js/palco.js`: shader dos feixes de moving head numa névoa. No desktop roda ao vivo em WebGL; nas telas de toque entram os MP4 de `assets/video/palco-*.mp4`.
- `assets/js/pista.js`: lista da galeria, gerada por `tools/processar.py`.

## Ferramentas

- `python tools/processar.py [fotos|reels]`: gera os WebP e os reels a partir de `../_ref` (Instagram extraído).
- `python tools/gerar_palco.py`: renderiza os MP4 da luz de palco (`--quadro saida.png` para um quadro de teste).
- `python tools/gerar_og.py`: gera `og.jpg`, `apple-touch-icon.png` e `favicon-32.png`.

## Fontes usadas

Instagram (@djmattos_, 704 posts), Linktree (linktr.ee/djmattos), Spotify (mrmattos10), Mixcloud (mrmattos), SoundCloud (mr-mattos), YouTube, Twitch (djmrmattos) e Facebook (rodolpho.mattos).

## CONFIRMAR com o cliente

1. **25 anos:** a bio do SoundCloud e do Mixcloud diz "DJ há 25 anos", mas não tem data. Confirmar o número atual.
2. **WhatsApp:** (11) 98245-6366, o do Linktree. Confirmar se é o número de atendimento.
3. **Reverb Audiovisual:** o site diz que é a parceira de som, luz e imagem. Confirmar a relação (sócio? parceiro?) e se som e luz entram no pacote.
4. **Locais da faixa:** Casa Fasano, Terraço Itália, Fazenda Vassoural, Fazenda da Mata, Bisutti, Dona Inês, Villa Dangelo, Sheraton Santos, Felicità, Casamarela e Fazenda Alvorada, tirados das legendas. Confirmar se pode citar todos.
5. **Recorde de 12 h:** legenda de dez/2023. Confirmar se quer destacar.
6. **Vídeos:** os reels são do Instagram, em 720p. Se houver os originais, trocar. Confirmar a autorização de imagem dos casais e da criança do vídeo mais visto.
7. **Logo:** o site recria o logo (barras + "DJ MATTOS" em capitulares). Se houver o arquivo vetorial oficial, trocar no topo, no rodapé e no og.
8. **Noivado de Ana Hickmann e Edu Guedes:** está nas legendas, mas não foi citado no site. Pode virar destaque se ele quiser.
9. **Domínio:** ainda não há. Quando houver, tirar o `noindex`, trocar `og:url`/`og:image` e criar `robots.txt`/`sitemap.xml`.

---

Site por [L R G Z](https://lrgz.com.br)
