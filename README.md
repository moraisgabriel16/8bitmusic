# 8bitmusic · Pixel Rave

Sintetizador modular no navegador, com 10 módulos, cabos funcionais, teclado e sequenciador de 64 passos (quatro compassos). 25 presets de House, Techno, Trance, Drum & Bass e Funk Brasileiro. HTML, CSS e JavaScript com Web Audio, sem dependências de runtime. A groovebox original em pixel art continua disponível em `groovebox.html`.

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

Para conectar, toque em duas portas em qualquer ordem ou arraste entre elas. Portas compatíveis ficam iluminadas e o arraste exibe um cabo provisório. O painel de conexões oferece seletores filtrados para ligar módulos distantes no celular. Conexões repetidas são idempotentes; entradas podem somar vários sinais. A lista permite inspecionar cada rota e removê-la explicitamente pelo ×. Os cabos desenhados não capturam cliques sobre os controles. Cada cabo CV tem intensidade de −100% a +100%, incluindo inversão de modulação. Áudio segue estágios crescentes sem ciclos; delay tem realimentação própria. A bateria entra diretamente na saída.

Patches v3 preservam parâmetros, cabos, sequência e bateria em JSON e localStorage. Os patches antigos da groovebox continuam usando seu formato v1 e a página original. Exportar WAV renderiza quatro compassos e pelo menos três segundos de cauda, em estéreo PCM de 16 bits a 44,1 kHz.

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
- `dist/audio.js`: bateria e motor da groovebox original.
- `tests/patches.test.mjs`: integridade dos presets, independência dos estados, validação de importação e compatibilidade de rotas.
- `dist/assets/machines.png`: atlas RGBA 1254×1254 com quatro máquinas e quatro quadros por máquina, gerado com imagegen.
- `dist/assets/atlas.json`: retângulos dos quadros; renderização em canvas sem suavização.
- `dist/assets/atlas-prompt.txt`: prompt utilizado para gerar a arte.

O motor sintetiza os sons no navegador, sem carregar amostras externas. O scheduler modular antecipa 110 ms, com atualização a cada 25 ms. A interface acompanha o relógio do AudioContext. A renderização offline usa o mesmo motor e as mesmas conexões da reprodução ao vivo.

O rack é monofônico, possui módulos fixos e um padrão de quatro compassos. Não inclui MIDI, gravação de microfone, arranger ou criação de novos módulos.

## Verificação

`npm run build` verifica sintaxe e executa 12 testes de estado, roteamento, edição, biblioteca e geração de percussão. Testes de navegador cobrem reprodução, presets, knobs, teclado, conexões, salvar/abrir patches e WAV. O áudio exportado foi verificado: sinal não nulo com o patch conectado; silêncio digital ao desconectar a saída com a bateria desligada.

## Biblioteca v3 e celular

Cada estilo oferece cinco grooves com BPM, swing, síntese, oito vozes de bateria, intensidade dos golpes e viradas de quatro compassos. House: Deep, Chicago, Jackin, Acid e Afro; Techno: Minimal, Dub, Detroit, Acid e Industrial; Trance: Classic, Progressive, Uplifting, Goa e Psy; D&B: Liquid, Jungle, Jump Up, Neuro e Deep; Funk: Tamborzão, Volt Mix, Beatbox, 150 BPM e Mandelão.

Selecionar um preset permite ouvir uma prévia de quatro compassos sem substituir o patch. Carregar aplica a escolha; trocar o estilo carrega sua primeira base. Os botões de compasso escolhem os 16 passos editáveis. Desmarque Acompanhar reprodução para editar um compasso fixo. Na bateria, cada toque alterna pausa, suave, médio e forte. O gate controla a duração das notas do synth.

A percussão em `dist/synth/drums.js` usa sons originais sintetizados (membranas, ruído, transientes e saturação). Os grooves de funk são interpretações, não transcrições ou samples de gravações. O tamborzão usa bumbo, dois toms, conga e slap; beatbox usa ataques sintetizados. A referência de instrumentação foi a figura de Carlos Palombini em [A Danceable Shower of Bullets](https://www.researchgate.net/figure/The-tamborzao-loop-on-the-lower-line-ambo-kick-K01-on-the-middle-lines-attack-tom-1_fig4_337172234).

Importação e recuperação automática de patches modulares v2 preservam as edições, repetindo seu compasso em quatro e adicionando canais vazios. Novas gravações usam a chave v3; a chave antiga permanece intacta.

Em telas estreitas, o rack vira uma coluna, com seletor fixo para navegar pelos módulos, knobs maiores e sequência em grade de quatro colunas. Tablets usam duas colunas de módulos. Bateria e teclado têm rolagem horizontal independente. Layout verificado em larguras de 320 e 390 pixels no navegador desktop; ainda não testado em aparelho físico/iOS.

## Interações de edição

Desfazer/refazer mantém até 80 estados completos durante a sessão, incluindo presets carregados, cabos, parâmetros, notas, bypass e bateria. Movimentos contínuos de um mesmo controle são agrupados. Os atalhos são Ctrl/Cmd+Z e Ctrl/Cmd+Shift+Z (ou Ctrl+Y), exceto dentro de campos de edição.

No compasso atual: copiar/colar inclui synth e oito vozes de bateria; duplicar envia para o compasso seguinte (o quarto volta ao primeiro); as setas deslocam o groove por um passo; Notas ± transpõe um semitom preservando pausas e limites. Limpar compasso apaga suas notas e bateria. Limpar notas continua apagando apenas o synth dos quatro compassos. Editar passos congela o acompanhamento automático para evitar mudanças de página durante a edição.

Toque no valor abaixo de um knob para digitar uma medida exata ou restaurar o preset. Os módulos Filter, Drive e Delay têm bypass. O teclado permite alterar oitavas; nomes e notas acompanham a seleção. Na bateria, o nome da peça serve para ouvi-la e M silencia o canal no groove. Passos de bateria e notas também oferecem escuta ao editar com o sequenciador parado. Swing é ajustável de 0% a 30%.

Stop silencia e descarta a instância de áudio após uma breve queda de volume para evitar que ecos anteriores reapareçam ao reiniciar. Editar o patch encerra uma prévia de preset independente.

### Regressão de áudio no navegador

Além dos testes Node, `tests/audio.browser.html` verifica o motor real com OfflineAudioContext: sinal conectado, bypass de filtro, CV zerado e invertido, silêncio sem saída, percussão e mute dos oito canais. Para executar localmente, copie-o temporariamente para `dist/__audio-check.html`, abra essa página no servidor e clique em Executar testes de áudio. Remova a cópia antes de publicar. Os sete cenários passaram nesta revisão; os testes de interação também cobriram arraste real, conexão começando pela entrada, repetição sem remoção, histórico e layout de 320/390 pixels. Teste em aparelho físico continua pendente.
