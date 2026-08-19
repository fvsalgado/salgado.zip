# salgado.zip

Site pessoal de Fábio Salgado. Astro estático, sem CMS, sem cookies, sem publicidade.

## A ideia

Uma fonte, cinco saídas.

```
src/data/*.ts  ──┬──►  /  /en/  /fr/  /es/   a página: listagem com tudo à vista
 fonte única     ├──►  /docs/*.pdf           CV, impresso de /cv/ e /en/cv/ (internas)
                 ├──►  /resume.json          o mesmo em JSON Resume
                 └──►  /salgado.zip          os três empacotados
```

O áudio do nó `voz/` corre no sentido contrário — não sai dos dados, é medido
por eles:

```
public/voz/*.mp3  ──┬─►  src/generated/voz.json  ──►  duração, tamanho e
public/voz/*.mp4  ──┘     statSync + mp3-ler +           dimensões na página
 onze gravações            mp4-ler                       e no LEIA-ME do .zip
```

A página existe em quatro línguas — português, inglês, francês e espanhol —, e
o esquema de `src/data` exige as quatro: uma chave em falta é erro de build, e
não um parágrafo em português no meio da página francesa. Os documentos em PDF
continuam a ser dois, em português e em inglês, que são as línguas em que se
envia um CV; a ficha de contacto e o rodapé oferecem os dois em qualquer das
quatro páginas. Acrescentar uma quinta língua é mexer em `src/data/idiomas.ts`,
nas traduções e em mais nada.

Nenhum texto vive num componente e **nenhum número é escrito à mão**: os
tamanhos da listagem saem de um `statSync` sobre os ficheiros reais, as datas
saem do `git log`, as contagens saem do `.length` dos arrays. Um número que o
build não consegue derivar não entra.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | `voz.mjs` e `pack.mjs` (resume.json + salgado.zip), e depois o Astro |
| `npm run voz` | mede os mp3 de `public/voz/` para `src/generated/voz.json` |
| `npm run preview` | serve o `dist/` em `localhost:4321` |
| `npm run artifacts` | capturas, PDFs e `og.png` — precisa de browser |
| `npm run verify` | as dezasseis verificações |

`npm run artifacts` aceita `--sem-shots` (salta os sites externos), `--so=<id>`
(recaptura um só) e `DEBUG_TEMPO=1` (mostra o tempo de cada passo).

## Porque é que alguns ficheiros não estão no repositório

`public/resume.json`, `public/salgado.zip`, `public/llms.txt` e
`public/.well-known/security.txt` são gerados pelo `prebuild` a partir do que
está commitado, e ficam em `.gitignore`: assim o Astro consegue ler-lhes o
tamanho com `fs` no build e não há binários a inchar o histórico.

O `llms.txt` sai da mesma fonte que a página — acrescentar um projeto em
`src/data` acrescenta-o lá sozinho. Sem ilusões quanto ao que vale hoje:
nenhum grande fornecedor documentou que o consome, e a Google disse que a
Pesquisa não o usa. Custa um bloco no `pack.mjs` e a Perplexity lê-o.

As capturas, os PDFs, o `og.png`, o `favicon.ico` e o `apple-touch-icon.png`
**são** commitados, porque a Vercel não abre browsers no build. Os dois ícones
de mapa de bits saem do `favicon.svg` rasterizado pelo próprio Chromium — o SVG
continua a ser a fonte e o que os browsers modernos usam; os outros existem
para quem não o lê.

## O nó voz/, e a exceção que abre

O nó `voz/` traz nove leituras em voz alta para o **Alta Voz**, o podcast do
esquerda.net, entre 2018 e 2019. Os mp3 estão neste repositório — 107 MB de
binários, exatamente aquilo que a secção anterior diz que não se faz aqui. É
uma exceção deliberada, e a razão é esta: o feed do podcast é uma janela
rolante e só guarda os episódios mais recentes. Estas nove caíram fora dele.
Não estão no Spotify, nem na Apple Podcasts, nem no Deezer, nem no YouTube
— verificado a 19/08/2026 —, e o único sítio onde existiam era o esquerda.net
continuar a servir ficheiros de 2018. Isso não é salvaguarda nenhuma.

O que está guardado são os **originais byte a byte**, e não uma recodificação:
o `sha256` de cada entrada em `src/data/voz.ts` é o do ficheiro que o
esquerda.net serviu, e o `npm run voz` recusa-se a escrever o `voz.json` se
algum deixar de bater certo. A `origem` de cada leitura continua a apontar à
página do editor, que é onde está o texto e o resto dos créditos.

A voz é do Fábio. **Os textos não**: são de quem os escreveu e de quem os
traduziu — Galeano, Dostoiévski, Bensaïd, Itamar Vieira Junior, entre outros —,
e por isso cada entrada abre com a autoria, e não com o título.

Ao lado das nove leituras estão **dois vídeos** de promoção do Transborda, a
mostra de artes performativas de Almada, de 2023 e 2025. Vieram da página do
festival em **VP9 dentro de um MP4** — a combinação que o Facebook serve e que
o Safari não reproduz, o que deixaria todos os iPhones com um vídeo partido.
Foram recodificados uma vez para H.264 com áudio AAC, a 24 de CRF, e ficaram no
mesmo tamanho do original. Aqui o `sha256` é o do ficheiro publicado e não o do
original: o que se guarda é uma cópia que funciona, e não uma cópia exata de um
ficheiro que meio mundo não abria. A recodificação foi feita uma vez, à mão; o
repositório não ganhou um codificador de vídeo por causa de dois ficheiros.

Cada vídeo leva uma capa em `.webp`, tirada do cartão final. Sem ela, um
`<video preload="none">` é um retângulo preto na listagem — e a listagem é onde
ele é visto.

Duas decisões que se leem no código e vale a pena dizer por extenso:

- O leitor é o `<audio controls>` ou o `<video controls>` nativo, com
  `preload="none"`. São os únicos que funcionam com o JavaScript desligado e
  dentro de uma CSP sem `'unsafe-inline'`, e sem o `preload` a página abria mais
  de cem megabytes de pedidos a quem só passou por lá. A verificação 13 falha se
  algum leitor perder o atributo ou se um vídeo perder a capa.
- O áudio **não entra no `salgado.zip`**. Quem quer o CV não quer 1h53 de
  leituras com ele; o `LEIA-ME.txt` do arquivo diz onde estão e quanto pesam, e
  a verificação 13 falha se um mp3 aparecer lá dentro.

## Verificação

`npm run verify` corre dezasseis verificações e devolve código de saída
não-zero em qualquer falha. Quinze são binárias; só uma — a revisão à vista das
oito capturas em `.verify/` — precisa de olho humano.

Entre elas: contraste WCAG calculado a partir de `tokens.css` nos dois temas,
passagem completa com `javaScriptEnabled: false`, orçamento de 10 kB de
JavaScript, zero pedidos a terceiros, e a confirmação de que os tamanhos
publicados na listagem batem certo com os ficheiros em disco.

A verificação 16 falha enquanto houver conteúdo por confirmar — é o que impede
o PR de sair de rascunho, em vez de um marcador `[POR PREENCHER]` no código.

## Medição, e o que ela custou dizer

O site mede visitas com o Web Analytics da Vercel, e a escolha foi feita por
números: o script do PostHog são 82 kB comprimidos — cinquenta e duas vezes
todo o JavaScript deste site e oito vezes o orçamento — enquanto este são
2 495 bytes servidos **do próprio domínio**, script e ponto de recolha. Por
isso a CSP continua `script-src 'self'`, e a verificação 8 continua a ver zero
pedidos a terceiros: não há nenhum. Sem cookies, sem `localStorage`; a visita é
identificada por um resumo do pedido, descartado ao fim de 24 horas.

O `<script>` só sai no build da Vercel. Fora de lá o caminho não existe, e a
verificação 2 falharia num ficheiro que o preview local não tem para servir —
o que significa que estes 2 495 bytes não passam pelo `dist/` e não entram no
orçamento de 10 kB. Ficam contados aqui para não serem um custo escondido.

O que isto custou foi uma frase. O rodapé dizia «sem cookies, sem rastreio» e o
`humans.txt` dizia «sem analytics»: as duas saíram no mesmo commit em que a
medição entrou, porque deixaram de ser verdade. Um sítio que se apresenta como
auditável não pode ter no rodapé uma afirmação que o próprio código desmente.
No lugar delas ficou uma ligação ao nó `privacidade/`, que diz por extenso que
dados existem, para quê, quanto tempo e quem lhes toca.

## Segurança e privacidade

`vercel.json` serve uma CSP sem `'unsafe-inline'`: não há um único `<script>` ou
`<style>` inline no site, nem um atributo `style=`. O tema é aplicado antes do
primeiro paint por `/tema.js`, síncrono e mesmo-origem.

Projetos privados entram na listagem pelo que fazem, sem endereço e sem
captura. A verificação 7 confirma que não há `href`, `src` nem `"url"` a
apontar-lhes — no site, no `resume.json` e dentro do `.zip`.

## Licença

O código está sob **AGPL-3.0** — o ficheiro `LICENSE` é byte a byte o do
[primeiraplateia.pt](https://github.com/fvsalgado/primeiraplateia), por opção:
os dois projetos servem-se pela rede, e a AGPL é a licença que fecha essa
porta — quem correr este código num servidor tem de dar o código a quem o usa,
e não só a quem o descarrega.

As fontes IBM Plex não entram nesse âmbito: têm licença própria, a SIL Open
Font License 1.1, em `public/fonts/OFL.txt`.

## Tipografia

IBM Plex Mono e IBM Plex Serif, SIL Open Font License 1.1, auto-alojadas.
`scripts/fonts.mjs` extrai de `@fontsource` só os subconjuntos `latin` e
`latin-ext` em woff2 — o `latin-ext` não é opcional: sem ele os diacríticos
portugueses caem numa fonte de sistema a meio de uma palavra.
