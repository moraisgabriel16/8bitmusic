# 8bitmusic · Pixel Rave

Groovebox em pixel art para House, Techno, Trance e Drum & Bass. Sequenciador de 16 passos, bateria, baixo, synth, filtros, delay e osciloscópio. HTML, CSS e JavaScript com Web Audio, sem dependências de runtime.

## Rodar localmente

Requer Node.js 22 ou superior.

```sh
npm install
npm run dev
```

Abra http://127.0.0.1:4173. `npm run build` verifica a sintaxe; os arquivos estáticos prontos para publicação ficam em `dist/`.

## Deploy na Vercel

Importe este repositório em um novo projeto na Vercel. O arquivo `vercel.json` configura o projeto como site estático:

- Framework Preset: Other
- Root Directory: raiz do repositório
- Build Command: `npm run build`
- Output Directory: `dist`
- Sem variáveis de ambiente ou chaves de API.

O servidor `server.mjs` serve apenas para desenvolvimento local; a Vercel publica os arquivos de `dist/` diretamente.

## Como tocar

Play ou espaço inicia/pausa; Stop volta ao início. Escolha um estilo, altere o BPM e clique nos pads. Nas pistas de baixo e synth, cliques sucessivos percorrem oito notas e desligam o pad. M silencia cada pista; clicar no nome da pista toca seu timbre.

Punch controla a duração do kick, Cutoff afeta os filtros das notas seguintes, Space controla o delay do synth e Master controla a saída. A reprodução pausa ao deixar a página em segundo plano.

Sessões são preservadas no armazenamento local do navegador e podem ser baixadas/reabertas em JSON. A exportação WAV renderiza quatro compassos e dois segundos de cauda, em estéreo PCM de 16 bits a 44,1 kHz.

## Estrutura

- `dist/index.html`, `style.css` e `app.js`: interface, sequenciador, sessões e animações.
- `dist/audio.js`: síntese, scheduler Web Audio, efeitos e exportação offline.
- `dist/assets/machines.png`: atlas RGBA 1254×1254 com quatro máquinas e quatro quadros por máquina, gerado com imagegen.
- `dist/assets/atlas.json`: retângulos dos quadros; renderização em canvas sem suavização.
- `dist/assets/atlas-prompt.txt`: prompt utilizado para gerar a arte.

O motor sintetiza os sons no navegador, sem carregar amostras externas. O scheduler antecipa 120 ms, com atualização a cada 25 ms, e sincroniza os sprites pelo relógio do áudio.

Protótipo com um padrão de um compasso em Fá menor, sem roteamento por cabos ou arranger.

## Verificação

`npm run build` verifica a sintaxe dos módulos. O protótipo foi testado em navegador real: reprodução, carregamento do atlas, presets, edição de pads, mute, salvamento e recuperação de sessão, exportação WAV e console sem erros. O WAV foi inspecionado para formato PCM, taxa de amostragem e sinal não nulo.
