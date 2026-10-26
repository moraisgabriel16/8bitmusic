# 8bitmusic · Pixel Rave

Sintetizador modular no navegador, com 10 módulos, cabos funcionais, teclado e sequenciador de 16 passos. Presets de House, Techno, Trance, Drum & Bass e Funk Brasileiro. HTML, CSS e JavaScript com Web Audio, sem dependências de runtime. A groovebox original em pixel art continua disponível em `groovebox.html`.

## Rodar localmente

Requer Node.js 22 ou superior.

```sh
npm install
npm run dev
```

Abra http://127.0.0.1:4173. `npm run build` verifica a sintaxe e executa os testes de patches/roteamento. Os arquivos estáticos prontos para publicação ficam em `dist/`.

## Deploy na Vercel

Importe este repositório em um novo projeto na Vercel. O arquivo `vercel.json` configura o projeto como site estático:

- Framework Preset: Other
- Root Directory: raiz do repositório
- Build Command: `npm run build`
- Output Directory: `dist`
- Sem variáveis de ambiente ou chaves de API.

O servidor `server.mjs` serve apenas para desenvolvimento local; a Vercel publica os arquivos de `dist/` diretamente.

## Como tocar

Play ou espaço inicia/para o sequenciador; Stop e Escape param todos os sons. Trocar a vibe carrega parâmetros, cabos, notas, BPM e bateria do preset. Se estiver tocando, o novo groove reinicia no primeiro passo. O volume master é preservado.

Arraste os knobs para cima/baixo, use Shift para precisão ou ajuste com as setas do teclado. Duplo clique restaura o valor inicial do preset. Toque com mouse, touch ou teclas `A W S E D F T G Y H U J K O L P ;`. O synth é monofônico, com prioridade para a última nota. Tocar manualmente pausa o sequenciador; sair da aba interrompe o áudio.

Para conectar, clique numa saída e depois numa entrada, ou arraste entre jacks. Clique em um cabo para removê-lo; clicar numa entrada sem saída selecionada remove os cabos daquela entrada. Os sinais são reais: desconectar a saída silencia o sintetizador. Áudio e CV são tipados; o grafo de áudio segue estágios crescentes, sem ciclos entre módulos. Delay possui realimentação interna controlada. A bateria opcional entra diretamente na saída.

Patches v2 preservam parâmetros, cabos, sequência e bateria em JSON e localStorage. Os patches antigos da groovebox continuam usando seu formato v1 e a página original. Exportar WAV renderiza quatro compassos e pelo menos três segundos de cauda, em estéreo PCM de 16 bits a 44,1 kHz.

## Módulos

- OSC A / OSC B: seno, triângulo, serra e quadrada; afinação, detune e entrada de pitch CV.
- Mixer: volumes dos osciladores, suboscilador e ruído branco.
- Filter: low-pass, band-pass e high-pass, cutoff, ressonância e quantidade de envelope.
- VCA: amplitude controlada pelo envelope, nível e portamento.
- Envelope: attack, decay, sustain e release; saída CV para VCA/filtro.
- LFO: quatro ondas, velocidade e profundidade; modula pitch ou cutoff.
- Saturation: waveshaper com oversampling 2×, filtro de tone e blend.
- Tape Echo: delay, feedback e mix.
- Output: master, osciloscópio, medidor de nível e compressor/limitador.

## Estrutura

- `dist/index.html` e `dist/synth/`: rack modular, motor Web Audio, presets, teclado, roteamento e exportação.
- `dist/groovebox.html`, `style.css` e `app.js`: groovebox original em pixel art.
- `dist/audio.js`: bateria sintetizada compartilhada e motor da groovebox.
- `tests/patches.test.mjs`: integridade dos presets, independência dos estados, validação de importação e compatibilidade de rotas.
- `dist/assets/machines.png`: atlas RGBA 1254×1254 com quatro máquinas e quatro quadros por máquina, gerado com imagegen.
- `dist/assets/atlas.json`: retângulos dos quadros; renderização em canvas sem suavização.
- `dist/assets/atlas-prompt.txt`: prompt utilizado para gerar a arte.

O motor sintetiza os sons no navegador, sem carregar amostras externas. O scheduler modular antecipa 110 ms, com atualização a cada 25 ms. A interface acompanha o relógio do AudioContext. A renderização offline usa o mesmo motor e as mesmas conexões da reprodução ao vivo.

O rack é monofônico, possui módulos fixos e um padrão de um compasso. Não inclui MIDI, gravação de microfone, arranger ou criação de novos módulos.

## Verificação

`npm run build` verifica sintaxe e executa quatro testes de estado/roteamento. Testes de navegador cobrem reprodução, presets, knobs, teclado, conexões, salvar/abrir patches e WAV. O áudio exportado foi verificado: sinal não nulo com o patch conectado; silêncio digital ao desconectar a saída com a bateria desligada.
