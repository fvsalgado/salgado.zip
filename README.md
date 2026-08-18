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
| `npm run build` | `pack.mjs` (resume.json + salgado.zip) e depois o Astro |
| `npm run preview` | serve o `dist/` em `localhost:4321` |
| `npm run artifacts` | capturas, PDFs e `og.png` — precisa de browser |
| `npm run verify` | as quinze verificações |

`npm run artifacts` aceita `--sem-shots` (salta os sites externos), `--so=<id>`
(recaptura um só) e `DEBUG_TEMPO=1` (mostra o tempo de cada passo).

## Porque é que alguns ficheiros não estão no repositório

`public/resume.json` e `public/salgado.zip` são gerados pelo `prebuild` a partir
do que está commitado, e ficam em `.gitignore`: assim o Astro consegue ler-lhes
o tamanho com `fs` no build e não há binários a inchar o histórico.

As capturas, os PDFs e o `og.png` **são** commitados, porque a Vercel não abre
browsers no build.

## Verificação

`npm run verify` corre quinze verificações e devolve código de saída não-zero
em qualquer falha. Treze são binárias; só a última — a revisão à vista das oito
capturas em `.verify/` — precisa de olho humano.

Entre elas: contraste WCAG calculado a partir de `tokens.css` nos dois temas,
passagem completa com `javaScriptEnabled: false`, orçamento de 10 kB de
JavaScript, zero pedidos a terceiros, e a confirmação de que os tamanhos
publicados na listagem batem certo com os ficheiros em disco.

A verificação 14 falha enquanto houver conteúdo por confirmar — é o que impede
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
