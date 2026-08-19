# salgado.zip

Site pessoal de Fábio Salgado. Astro estático, sem CMS, sem analytics, sem cookies.

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
public/voz/*.mp3  ──►  src/generated/voz.json  ──►  duração e tamanho na página
 nove originais         statSync + cabeçalho          e no LEIA-ME do .zip
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

`public/resume.json` e `public/salgado.zip` são gerados pelo `prebuild` a partir
do que está commitado, e ficam em `.gitignore`: assim o Astro consegue ler-lhes
o tamanho com `fs` no build e não há binários a inchar o histórico.

As capturas, os PDFs e o `og.png` **são** commitados, porque a Vercel não abre
browsers no build.

## As leituras, e a exceção que abrem

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

Duas decisões que se leem no código e vale a pena dizer por extenso:

- O leitor é o `<audio controls>` nativo, com `preload="none"`. É o único que
  funciona com o JavaScript desligado e dentro de uma CSP sem `'unsafe-inline'`,
  e sem o `preload` a página abria 107 MB de pedidos a quem só passou por lá. A
  verificação 13 falha se algum leitor perder o atributo.
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
