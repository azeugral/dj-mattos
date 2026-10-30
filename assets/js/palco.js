/* Luz de palco do hero e do "Consultar uma data": feixes de moving head varrendo devagar uma
   névoa de fumaça, tudo no shader, sem imagem. Os ângulos usam frequências inteiras da fase e a
   névoa anda em círculo, então o quadro da fase 2π é igual ao da fase 0 e o vídeo fecha sem emenda.
   Desenha sobre preto: a tela entra com mix-blend-mode: screen, o preto some e só a luz clareia.
   palcoGL(canvas, {modo, forca}) -> {tamanho(w,h), desenhar(fase)}
   modo 0 = hero (feixes de cima, mais fortes à esquerda); modo 1 = calma (dois feixes nas bordas).
   O mesmo arquivo gera os MP4 das telas de toque em tools/gerar_palco.py. */
(function (g) {
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uFase; uniform float uModo; uniform float uForca;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*ruido(p);p=rot(.6)*p*2.02+vec2(3.1,7.7);a*=.5;}return s;}

/* um feixe: cone que nasce em o, aponta para baixo girado de ang e abre conforme desce */
float feixe(vec2 p, vec2 o, float ang, float abre){
  vec2 d=p-o;
  vec2 dir=vec2(sin(ang),-cos(ang));
  float ao=dot(d,dir);
  float lado=abs(d.x*dir.y-d.y*dir.x);
  float larg=.012+ao*abre;
  float b=exp(-pow(lado/larg,2.)*1.6)*smoothstep(0.,.06,ao);
  float nucleo=exp(-pow(lado/(larg*.28),2.))*.5;
  return (b+nucleo*b)*exp(-ao*.75);
}

void main(){
  vec2 fc=gl_FragCoord.xy;
  vec2 c01=fc/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=vec2(c01.x*asp,c01.y);
  vec2 c=vec2(cos(uFase),sin(uFase));
  float f=uFase;

  /* névoa: dois andares de ruído torcido andando em círculo (fecha o loop) */
  vec2 q=p*vec2(1.6,2.2);
  vec2 w=vec2(fbm(q+c*.55),fbm(q+vec2(4.3,1.7)-c.yx*.55));
  float nevoa=fbm(q*1.2+w*1.6+vec2(c.x,-c.y)*.35);
  float denso=smoothstep(.28,.85,nevoa);

  vec3 prata=vec3(.84,.87,1.), azul=vec3(.30,.42,1.), violeta=vec3(.56,.36,1.);
  vec3 col=vec3(0.);
  float topo=1.06;
  if(uModo<.5){
    /* hero: três cabeças móveis no alto, a do meio mais lenta */
    col+=prata  *feixe(p,vec2(asp*.10,topo), .42+.22*sin(f+.4)    ,.16)*1.05;
    col+=azul   *feixe(p,vec2(asp*.38,topo),-.10+.30*sin(f*2.+1.9),.14)*1.25;
    col+=violeta*feixe(p,vec2(asp*.70,topo),-.35+.20*sin(f+3.3)    ,.18)*.85;
    col+=azul   *feixe(p,vec2(asp*.95,topo),-.55+.16*sin(f*2.+.7) ,.12)*.55;
    /* lado direito (onde está a foto) fica mais calmo */
    col*=mix(1.,.55,smoothstep(.45,1.,c01.x));
  }else{
    /* calma: um feixe em cada borda, cruzando devagar */
    col+=azul   *feixe(p,vec2(asp*.02,topo), .38+.14*sin(f+.9) ,.15)*.9;
    col+=violeta*feixe(p,vec2(asp*.98,topo),-.38+.14*sin(f+2.6),.15)*.8;
  }
  /* o feixe só aparece onde tem fumaça; a névoa clareia de leve em volta */
  col*=.28+denso*1.25;
  vec3 amb=mix(azul,violeta,c01.x)*denso*.05*(.4+.6*c01.y);
  col+=amb;
  /* brilho da lente lá em cima */
  col*=uForca;
  col=col/(1.+col*.55);
  col+=(fract(52.9829189*fract(dot(fc,vec2(.06711056,.00583715))))-.5)*.006;
  gl_FragColor=vec4(max(col,0.),1.);
}`;

  g.palcoGL = function (cv, op = {}) {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.preserveDrawingBuffer, powerPreference: 'low-power' });
    if (!gl) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const u = n => gl.getUniformLocation(pr, n);
    const uR = u('uRes'), uF = u('uFase');
    gl.uniform1f(u('uModo'), op.modo || 0);
    gl.uniform1f(u('uForca'), op.forca ?? 1);
    return {
      tamanho(w, h) { cv.width = w; cv.height = h; },
      desenhar(fase) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uF, fase);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  };
})(window);
