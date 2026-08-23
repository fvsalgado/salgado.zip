#!/usr/bin/env node
/**
 * Um comando, dezoito verificações, código de saída não-zero em qualquer falha.
 *
 * A v2 deste plano tinha uma lista de onze pontos para lembrar à mão antes de
 * cada publicação. O que não é executável não se cumpre. Dezassete destas são
 * binárias; só uma — a revisão à vista das oito capturas — precisa de olho
 * humano.
 *
 *   npm run verify
 */
import { execFileSync, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { abrirBrowser, BASE } from './browser.mjs'
import { lerZip } from './zip-ler.mjs'
import { lerMp3 } from './mp3-ler.mjs'
import { lerMp4 } from './mp4-ler.mjs'
import { textoPorPagina, achatar } from './pdf-ler.mjs'
import { definicoes, ficheiros } from '../src/data/ficheiros.ts'
import { tamanho } from '../src/data/formato.ts'
import { IDIOMAS, LINGUAS } from '../src/data/idiomas.ts'
import { posicoes, formacao } from '../src/data/percurso.ts'
import { mandatos } from '../src/data/mandatos.ts'
import { cabecalho } from '../src/data/cabecalho.ts'
import { contacto } from '../src/data/contacto.ts'
import { projetos } from '../src/data/projetos.ts'
import { leituras } from '../src/data/voz.ts'
import { avisoJanelaNova } from '../src/data/textos.ts'

const CANONICO = 'https://salgado.zip'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const dist = raiz + 'dist/'
const pub = raiz + 'public/'
const revisao = raiz + '.verify/'

const falhas = []
const avisos = []
let n = 0

function ok(titulo, detalhe = '') {
  console.log(`  \x1b[32m✓\x1b[0m ${String(++n).padStart(2)} ${titulo}${detalhe ? `  \x1b[2m${detalhe}\x1b[0m` : ''}`)
}
function falhou(titulo, motivos) {
  const lista = Array.isArray(motivos) ? motivos : [motivos]
  console.log(`  \x1b[31m✗\x1b[0m ${String(++n).padStart(2)} ${titulo}`)
  for (const m of lista) console.log(`       \x1b[31m${m}\x1b[0m`)
  falhas.push(titulo)
}
function aviso(titulo, motivos) {
  const lista = Array.isArray(motivos) ? motivos : [motivos]
  console.log(`  \x1b[33m!\x1b[0m ${String(++n).padStart(2)} ${titulo}`)
  for (const m of lista) console.log(`       \x1b[33m${m}\x1b[0m`)
  avisos.push(titulo)
}
const decide = (titulo, problemas, detalhe = '') =>
  problemas.length ? falhou(titulo, problemas) : ok(titulo, detalhe)

/* ══ 1. astro check + build ══════════════════════════════════════════════ */
{
  const problemas = []
  try {
    const saida = execFileSync('npx', ['astro', 'check'], { cwd: raiz, encoding: 'utf8', stdio: 'pipe' })
    const erros = /- (\d+) errors?/.exec(saida)?.[1] ?? '?'
    const avisosTs = /- (\d+) warnings?/.exec(saida)?.[1] ?? '?'
    if (erros !== '0') problemas.push(`astro check: ${erros} erros`)
    if (avisosTs !== '0') problemas.push(`astro check: ${avisosTs} avisos`)
  } catch (e) {
    problemas.push(`astro check rebentou: ${(e.stdout || e.message).toString().trim().split('\n').slice(-3).join(' | ')}`)
  }
  try {
    execFileSync('npm', ['run', 'build'], { cwd: raiz, encoding: 'utf8', stdio: 'pipe' })
  } catch (e) {
    problemas.push(`build falhou: ${(e.stdout || e.message).toString().trim().split('\n').slice(-3).join(' | ')}`)
  }
  decide('astro check e build, sem erros nem avisos', problemas)
}

/* ── preview ─────────────────────────────────────────────────────────────── */
async function esperar(url, tentativas = 60) {
  for (let i = 0; i < tentativas; i++) {
    try {
      if ((await fetch(url)).ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

let servidor = null
if (!(await esperar(BASE + '/', 1))) {
  servidor = spawn('npx', ['astro', 'preview', '--port', '4321'], { cwd: raiz, stdio: 'ignore' })
  if (!(await esperar(BASE + '/'))) {
    console.error('preview não arrancou')
    process.exit(1)
  }
}

const browser = await abrirBrowser()

/**
 * TODAS as rotas publicadas, e derivadas do que o build escreveu em disco.
 *
 * Esteve aqui uma lista de quatro — uma por língua — com um comentário a dizer
 * «o que não se verifica nas quatro só está verificado numa». A frase estava
 * certa e a lista é que não: o sítio publica oito rotas, e as outras quatro
 * (os dois dossiês, o cartão e a página de erro) não eram varridas por
 * verificação nenhuma. Um script de terceiros no CV passava verde; uma ligação
 * interna morta no CV passava verde. Foi assim que se descobriu, a partir-se
 * de propósito uma coisa em `/cv/` e ninguém dar por ela.
 *
 * Derivada e não escrita, porque uma lista escrita à mão envelhece exatamente
 * como aquela envelheceu: quem acrescentar uma rota amanhã não tem de se
 * lembrar de a vir inscrever em três sítios diferentes deste ficheiro. O que
 * define «rota publicada» é ter saído um HTML dela, e é isso que isto lê.
 */
const ROTAS = (() => {
  const achadas = []
  const andar = (dir, prefixo) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) andar(`${dir}${e.name}/`, `${prefixo}${e.name}/`)
      else if (e.name === 'index.html') achadas.push(prefixo)
      else if (e.name === '404.html') achadas.push(`${prefixo}${e.name}`)
    }
  }
  andar(dist, '/')
  return achadas.sort()
})()

/**
 * A língua de cada rota, para quem precisa dela — o aviso da janela nova sai
 * daqui. Um dossiê herda a língua do prefixo: `/en/cv/` é inglês.
 */
const linguaDe = (rota) =>
  IDIOMAS.find((i) => LINGUAS[i].raiz !== '/' && rota.startsWith(LINGUAS[i].raiz)) ??
  IDIOMAS.find((i) => LINGUAS[i].raiz === '/')

function html(rota) {
  return readFileSync(dist + (rota.endsWith('.html') ? rota.slice(1) : rota.slice(1) + 'index.html'), 'utf8')
}

/**
 * As rotas que trazem a árvore do arquivo.
 *
 * Nem tudo o que se exige se exige em todo o lado: um `<track>` de legendas não
 * tem por que estar no dossiê, que não tem vídeo nenhum. Mas o âmbito também
 * não pode voltar a ser uma lista escrita à mão — deriva-se do próprio marcado,
 * perguntando a cada rota se tem árvore. Quem acrescentar uma quinta língua
 * ganha a exigência de graça.
 */
const ROTAS_ARVORE = ROTAS.filter((r) => /data-arvore/.test(html(r)))

/* ══ 2. Ligações internas ═══════════════════════════════════════════════ */
{
  const alvos = new Set()
  for (const rota of ROTAS) {
    for (const m of html(rota).matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) alvos.add(m[1])
  }
  const problemas = []
  for (const alvo of alvos) {
    const r = await fetch(BASE + alvo, { redirect: 'follow' }).catch(() => null)
    if (!r || !r.ok) problemas.push(`${alvo} → ${r ? r.status : 'sem resposta'}`)
  }

  /* E que as rotas varridas sejam mesmo as que os dados mandam publicar.
     Sem isto, o âmbito derivado tem o defeito oposto ao da lista escrita: em
     vez de envelhecer, encolhe sem dizer nada. Se o build deixasse de emitir
     o dossiê inglês, o `ROTAS` passava a ter sete e todas as verificações que
     o usam ficavam verdes sobre menos sítio — que é exatamente a falha que
     este ficheiro acabou de corrigir, com outra roupa.

     O esperado deriva-se: uma raiz por língua, um dossiê por cada CV que a
     listagem de ficheiros declara, a página de erro e o cartão. */
  const esperadas = [
    ...IDIOMAS.map((i) => LINGUAS[i].raiz),
    ...ficheiros
      .filter((f) => f.id.startsWith('cv-'))
      .map((f) => `${LINGUAS[f.id.slice(3)].raiz}cv/`),
    '/404.html',
    '/og/',
  ].sort()
  for (const r of esperadas) {
    if (!ROTAS.includes(r)) problemas.push(`a rota ${r} devia estar publicada e não saiu do build`)
  }
  if (ROTAS_ARVORE.length !== IDIOMAS.length) {
    problemas.push(`${ROTAS_ARVORE.length} rotas com árvore e ${IDIOMAS.length} línguas — devia ser uma por língua`)
  }

  decide(
    'todas as ligações internas devolvem 200, em todas as rotas publicadas',
    problemas,
    `${alvos.size} alvos · ${ROTAS.length} rotas · ${ROTAS_ARVORE.length} com árvore`
  )
}

/* ══ 3. Ligações externas (aviso, não bloqueia) ═════════════════════════ */
{
  const externas = new Set()
  for (const rota of ROTAS) {
    for (const m of html(rota).matchAll(/href="(https:\/\/[^"]+)"/g)) {
      if (!m[1].startsWith(CANONICO)) externas.add(m[1])
    }
  }
  const mortas = []
  for (const url of externas) {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow' }).catch(() => null)
    // Nem toda a gente responde a HEAD: uns devolvem 405, outros — a gnu.org
    // entre eles — fecham a ligação sem dizer nada. Nos dois casos a segunda
    // tentativa é com GET, que é como um leitor a abriria.
    if (!r || r.status === 405) {
      r = await fetch(url, { redirect: 'follow' }).catch(() => null)
    }
    // 999 é o bloqueio a leitura automática do LinkedIn e 403 é o equivalente
    // noutros sítios. Significam "não falo com robôs", não "estou morto".
    if (r && (r.status === 999 || r.status === 403)) continue
    if (!r || r.status >= 400) mortas.push(`${url} → ${r ? r.status : 'sem resposta'}`)
  }
  if (mortas.length) aviso('ligações externas vivas', mortas)
  else ok('ligações externas vivas', `${externas.size} alvos`)
}

/* ══ 4. Passagem sem JavaScript ═════════════════════════════════════════ */
{
  const problemas = []
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const p = await ctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })

  let nos = 0
  const testar = async (escopo) => {
    const lista = escopo.locator(':scope > li.no > details')
    for (let i = 0; i < (await lista.count()); i++) {
      const d = lista.nth(i)
      const s = d.locator(':scope > summary')
      const aberto = async () => (await d.getAttribute('open')) !== null
      const inicial = await aberto()
      const nome = (await d.locator('.linha__nome').first().innerText()).trim()

      await s.click()
      if ((await aberto()) === inicial) {
        problemas.push(`${nome}: não alternou sem JS`)
        continue
      }
      nos++

      if (!(await aberto())) await s.click()
      const filhos = d.locator(':scope > .no__corpo > ul.arvore--filha')
      if (await filhos.count()) await testar(filhos)
      if ((await aberto()) !== inicial) await s.click()
    }
  }
  await testar(p.locator('[data-arvore]').first())

  if (nos === 0) problemas.push('não encontrei nós na árvore')

  // Os controlos que só funcionam com JS não podem aparecer sem JS.
  if (await p.locator('[data-controlos]').first().isVisible().catch(() => false)) {
    problemas.push('os controlos de JS estão visíveis sem JS')
  }
  await ctx.close()
  decide('tudo abre e fecha sem JavaScript', problemas, `${nos} nós`)
}

/* ══ 5. Contraste WCAG calculado a partir dos tokens ════════════════════ */
{
  const css = readFileSync(raiz + 'src/styles/tokens.css', 'utf8')
  const bloco = (re) => {
    const m = re.exec(css)
    if (!m) return null
    return Object.fromEntries([...m[1].matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1], x[2]]))
  }
  const claro = bloco(/:root\s*\{([\s\S]*?)\}/)
  const escuro = bloco(/:root\[data-theme='dark'\]\s*\{([\s\S]*?)\}/)

  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const razao = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }

  // texto: 4.5 · elementos de interface e guias: 3.0
  const pares = [
    ['ink', 'paper', 4.5],
    ['ink', 'paper-fundo', 4.5],
    ['ink-soft', 'paper', 4.5],
    ['ink-soft', 'paper-fundo', 4.5],
    ['accent', 'paper', 4.5],
    ['accent', 'paper-fundo', 4.5],
    // O marcador de abrir/fechar usa --rule-forte: é afordância, cumpre 3:1.
    // --guia (as linhas da árvore) fica de fora: é decorativo, e a hierarquia
    // está igualmente no recuo e na estrutura do documento.
    ['rule-forte', 'paper', 3.0],
  ]
  const problemas = []
  let pior = Infinity
  for (const [tema, t] of [['claro', claro], ['escuro', escuro]]) {
    if (!t) {
      problemas.push(`não consegui ler os tokens do tema ${tema}`)
      continue
    }
    for (const [a, b, min] of pares) {
      if (!t[a] || !t[b]) {
        problemas.push(`${tema}: token em falta (--${a} ou --${b})`)
        continue
      }
      const r = razao(t[a], t[b])
      pior = Math.min(pior, r)
      if (r < min) problemas.push(`${tema}: --${a} sobre --${b} = ${r.toFixed(2)}:1, mínimo ${min}:1`)
    }
  }
  decide('contraste AA nos dois temas', problemas, `pior par ${pior.toFixed(2)}:1`)
}

/* ══ 6. Sem marcadores por preencher ════════════════════════════════════ */
{
  const marcadores = [
    /POR PREENCHER/i,
    /\bTODO\b/,
    /\bFIXME\b/,
    /\bXXX\b/,
    /lorem ipsum/i,
  ]
  const problemas = []
  const varrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const caminho = dir + e.name
      if (e.isDirectory()) varrer(caminho + '/')
      else if (/\.(ts|astro|css|json)$/.test(e.name)) {
        const texto = readFileSync(caminho, 'utf8')
        for (const re of marcadores) {
          if (re.test(texto)) problemas.push(`${caminho.replace(raiz, '')}: contém ${re}`)
        }
      }
    }
  }
  varrer(raiz + 'src/')
  decide('nenhum marcador por preencher em src/', problemas)
}

/* ══ 7. Fuga do projeto privado ═════════════════════════════════════════ */
{
  const privados = projetos.filter((p) => p.estado === 'privado')
  const problemas = []
  const suspeito = (texto, onde) => {
    for (const p of privados) {
      const d = p.dominio.replace('.', '\\.')
      for (const re of [
        new RegExp(`href="[^"]*${d}`, 'i'),
        new RegExp(`src="[^"]*${d}`, 'i'),
        new RegExp(`https?://[^"'\\s]*${d}`, 'i'),
        new RegExp(`"url"\\s*:\\s*"[^"]*${d}`, 'i'),
      ]) {
        if (re.test(texto)) problemas.push(`${onde}: ${p.dominio} exposto como endereço (${re.source})`)
      }
    }
  }
  const varrerDist = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) varrerDist(dir + e.name + '/')
      else if (/\.(html|json|xml|txt)$/.test(e.name)) {
        suspeito(readFileSync(dir + e.name, 'utf8'), 'dist/' + (dir + e.name).replace(dist, ''))
      }
    }
  }
  varrerDist(dist)
  if (existsSync(pub + 'salgado.zip')) {
    const z = lerZip(readFileSync(pub + 'salgado.zip'))
    for (const entrada of z.entradas) {
      if (/\.(txt|json)$/.test(entrada.nome)) suspeito(z.ler(entrada.nome).toString('utf8'), `zip:${entrada.nome}`)
    }
  }
  // Capturas de projetos privados são permitidas desde que mostrem dados de
  // demonstração — decisão do Fábio a 18/08/2026. O que continua proibido é
  // qualquer endereço que lhes aponte.
  decide(
    'projetos privados sem endereço nem captura em lado nenhum',
    problemas,
    privados.map((p) => p.dominio).join(', ')
  )
}

/* ══ 8. Zero pedidos a terceiros ════════════════════════════════════════ */
{
  const externos = []
  const ctx = await browser.newContext()
  const p = await ctx.newPage()
  p.on('request', (r) => {
    if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) externos.push(r.url())
  })
  for (const rota of ROTAS) {
    await p.goto(BASE + rota, { waitUntil: 'networkidle' })
  }
  await ctx.close()
  decide('zero pedidos a terceiros', [...new Set(externos)])
}

/* ══ 9. Orçamento de JavaScript ═════════════════════════════════════════ */
{
  const LIMITE = 10 * 1024
  let total = 0
  const ficheiros = []
  const varrer = (dir) => {
    if (!existsSync(dir)) return
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) varrer(dir + e.name + '/')
      else if (e.name.endsWith('.js')) {
        const tam = statSync(dir + e.name).size
        total += tam
        ficheiros.push(`${e.name} ${tam}B`)
      }
    }
  }
  /* O dist INTEIRO, e não só o `_astro/`.

     Varria-se `_astro/` mais um caso especial para o `tema.js`, e um ficheiro
     de meio megabyte posto em qualquer outra pasta de `dist/` não contava para
     o orçamento — provado, com um `dist/js/app.js` de 500 kB carregado pela
     home: passava verde a dizer «1591 B». Um orçamento que só conta o
     JavaScript de uma pasta não é um orçamento. */
  varrer(dist)
  // Scripts executáveis inline são incompatíveis com a CSP (`script-src 'self'`
  // sem 'unsafe-inline'): morreriam em produção sem erro visível. Os blocos
  // JSON-LD não contam — não são executáveis.
  const problemas9 = []
  const varrerHtml = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) varrerHtml(dir + e.name + '/')
      else if (e.name.endsWith('.html')) {
        const h = readFileSync(dir + e.name, 'utf8')
        for (const m of h.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)) {
          const attrs = m[1]
          const tipo = /type="([^"]*)"/.exec(attrs)?.[1] ?? 'text/javascript'
          if (tipo === 'module' || /javascript/.test(tipo)) {
            problemas9.push(`${(dir + e.name).replace(dist, 'dist/')}: <script> inline (${tipo}) — a CSP vai bloqueá-lo`)
          }
        }
      }
    }
  }
  varrerHtml(dist)
  if (total > LIMITE) problemas9.push(`${total} B em ${ficheiros.length} ficheiros: ${ficheiros.join(', ')}`)
  decide(`orçamento de JS abaixo de ${LIMITE / 1024} kB, sem scripts inline`, problemas9, `${total} B`)
}

/* ══ 10. hreflang ═══════════════════════════════════════════════════════
   Simétrico: cada página aponta a todas as línguas, a própria incluída, mais
   o x-default. Uma língua que só é apontada por metade das páginas é uma
   língua que os motores de busca tratam como acidente. */
{
  const problemas = []
  const esperados = [...IDIOMAS.map((i) => LINGUAS[i].html), 'x-default']

  /* Etiquetas a sério, e não a palavra «hreflang» algures no ficheiro.

     Testava-se `h.includes('hreflang="fr"')` — uma substring. Passava com a
     etiqueta inteira dentro de um comentário HTML, e passava com o `href` a
     apontar para um domínio que não existe. Provado nas duas maneiras. Agora
     lê-se a etiqueta, exige-se que seja `rel="alternate"`, e o destino tem de
     ser uma das rotas que o sítio publica de facto. */
  for (const i of IDIOMAS) {
    const rota = LINGUAS[i].raiz
    const h = html(rota)
    const marcadas = new Map()
    for (const m of h.matchAll(/<link\b([^>]*\bhreflang="([^"]+)"[^>]*)>/g)) {
      if (!/\brel="alternate"/.test(m[1])) continue
      const destino = /\bhref="([^"]+)"/.exec(m[1])?.[1]
      if (destino !== undefined) marcadas.set(m[2], destino)
    }
    for (const esperado of esperados) {
      const destino = marcadas.get(esperado)
      if (destino === undefined) {
        problemas.push(`${rota}: sem <link rel="alternate" hreflang="${esperado}"> com href`)
        continue
      }
      if (!destino.startsWith(CANONICO)) {
        problemas.push(`${rota}: o hreflang="${esperado}" aponta para fora do sítio (${destino})`)
        continue
      }
      const alvo = destino.slice(CANONICO.length) || '/'
      if (!ROTAS.includes(alvo)) {
        problemas.push(`${rota}: o hreflang="${esperado}" aponta para ${alvo}, que não é rota publicada`)
      }
    }
  }
  decide(
    'hreflang simétrico com x-default, e cada um a apontar a uma rota que existe',
    problemas,
    `${IDIOMAS.length} línguas`
  )
}

/**
 * Quantas imagens cada página do PDF declara nos seus recursos.
 *
 * Não descodifica nada e não pretende ser um leitor de PDF: encontra os objetos
 * indiretos, apanha os que são `/Type /Page`, segue-lhes o `/Resources` e conta
 * os `/XObject` cujo objeto apontado é `/Subtype /Image`. Chega para saber em
 * que folha caiu o quê, que é a única pergunta que aqui se faz.
 *
 * Devolve `null` se não conseguir ler a estrutura, para a verificação poder
 * dizer que não sabe em vez de dizer que está tudo bem.
 */
function imagensPorPagina(buf) {
  const bruto = buf.toString('latin1')
  const objs = new Map()
  for (const m of bruto.matchAll(/(\d+)\s+\d+\s+obj\b([\s\S]*?)\bendobj/g)) {
    objs.set(Number(m[1]), m[2])
  }
  if (objs.size === 0) return null
  const paginas = []
  for (const [num, corpo] of objs) {
    if (/\/Type\s*\/Page[^s]/.test(corpo)) paginas.push([num, corpo])
  }
  if (paginas.length === 0) return null
  return paginas.map(([, corpo]) => {
    const mr = /\/Resources\s*(\d+)\s+\d+\s+R/.exec(corpo)
    const rec = mr ? (objs.get(Number(mr[1])) ?? '') : corpo
    let n = 0
    for (const x of rec.matchAll(/\/\w+\s+(\d+)\s+\d+\s+R/g)) {
      const alvo = objs.get(Number(x[1])) ?? ''
      if (alvo.includes('/Subtype') && alvo.includes('/Image')) n += 1
    }
    return n
  })
}

/* ══ 11. PDFs ═══════════════════════════════════════════════════════════ */
{
  const problemas = []
  const conta = (buf, re) => (buf.toString('latin1').match(re) ?? []).length
  const esperadas = projetos.filter((x) => x.shot !== null).length
  const capas = leituras.filter((l) => l.capa !== null).length
  /* O dossiê leva uma imagem por vídeo (o fotograma) e a PRIMEIRA imagem de
     cada leitura em palco que tenha alguma. A regra vive no Dossier.astro; a
     conta tem de a repetir, senão a verificação passa a medir o que houver em
     vez do que devia haver. */
  const registos = leituras.filter(
    (l) => l.formato === 'video' || (l.formato === 'presencial' && l.imagens.length > 0)
  ).length
  const FOLHAS = 4
  /* Os nomes trazem o mês da revisão e vêm das definições, não escritos aqui:
     uma verificação que abre um caminho fixo deixa de verificar o documento no
     dia em que o documento muda de nome — passa a verificar um fantasma. */
  const documentos = definicoes.filter((d) => d.id === 'cv-pt' || d.id === 'cv-en')
  if (documentos.length !== 2) problemas.push('faltam definições dos dois CV')
  for (const nome of documentos.map((d) => d.nome)) {
    const caminho = pub + 'docs/' + nome
    if (!existsSync(caminho)) {
      problemas.push(`${nome} não existe — corre \`npm run artifacts\``)
      continue
    }
    const buf = readFileSync(caminho)
    if (buf.subarray(0, 5).toString() !== '%PDF-') problemas.push(`${nome} não é um PDF`)
    const paginas = conta(buf, /\/Type\s*\/Page[^s]/g)
    /* EXATAMENTE quatro. Estiveram aqui dois limites — «pelo menos 2» e «no
       máximo 4» — e no meio deles cabia um documento de 3 folhas que passava
       verde enquanto o título prometia 4. Pior: tudo o que vem a seguir vive
       dentro de guardas `=== FOLHAS`, por isso um PDF de 3 folhas não só
       passava como não verificava mais nada — nem o retrato, nem as capturas,
       nem os mandatos a abrir a última. Provado a sério, gerando os dois PDF
       com `scale: 0.45`: 3 folhas, tudo verde. */
    if (paginas !== FOLHAS) problemas.push(`${nome} tem ${paginas} página(s) e devia ter ${FOLHAS}`)
    /* Quatro folhas, e é um teto. Não é gosto: é a diferença entre um documento
       que se imprime numa folha A4 frente e verso duas vezes e um que obriga a
       uma terceira quase vazia. O limite paga-se em desenho e ganha-se em
       leitura, e sem uma verificação a defendê-lo o primeiro parágrafo que
       alguém acrescentar empurra-o para cinco sem ninguém dar por isso.
       Quem quiser passar daqui muda este número de propósito, não por descuido. */
    /* Onde é que cada imagem caiu. Uma quebra forçada e uma proibição de corte
       seguram a paginação: os projetos abrem folha, e a secção da voz não se
       parte. Sem esta conta, a paginação voltava a depender do comprimento de
       um parágrafo e ninguém dava por isso — foi exatamente o que aconteceu
       quando a apresentação encolheu sessenta pixels.

       O que se exige é que TUDO o que é imagem caiba na penúltima folha: as
       capturas que fecham os projetos, e logo a seguir a voz inteira, com os
       registos e as capas. É a maneira de verificar, contando, aquilo que a
       vista vê — uma folha com as imagens todas e a última só com texto. Se
       um dia a voz se partir em duas folhas, as capas caem para a última e
       esta conta acusa, que é exatamente o caso que se quer impedir.

       Conta-se por página, sem descodificar nada: segue-se o /Resources de cada
       /Type /Page e contam-se os /XObject que são /Subtype /Image. O QR é
       vetorial e não entra. */
    const porPagina = imagensPorPagina(buf)
    const penultima = esperadas + registos + capas
    if (porPagina === null) {
      problemas.push(`${nome}: não consegui ler a árvore de páginas para contar as imagens`)
    } else if (porPagina.length === FOLHAS) {
      if (porPagina[0] < 1) problemas.push(`${nome}: a primeira folha não leva o retrato`)
      if (porPagina[FOLHAS - 2] < penultima) {
        problemas.push(`${nome}: as ${esperadas} capturas, os ${registos} registos e as ${capas} capas deviam ficar todos na folha ${FOLHAS - 1}; encontrei ${porPagina[FOLHAS - 2]} imagens`)
      }
      if (porPagina[FOLHAS - 1] > 0) {
        problemas.push(`${nome}: a última folha é a da cauda em texto e apareceram-lhe ${porPagina[FOLHAS - 1]} imagens — a voz partiu-se`)
      }
    }

    /* A cauda inteira na última folha. Contar imagens não responde a isto: os
       mandatos, os certificados, os idiomas e o colofão não levam imagem
       nenhuma, e por isso a conta de cima nunca soube onde estavam. Souberam-no
       os olhos do Fábio, e antes de mim: os mandatos ficavam no pé da folha 3,
       separados do resto da cauda de que fazem parte.

       As frases procuradas saem dos dados — a casa do primeiro mandato e a
       instituição do último certificado — e não escritas aqui: assim a
       verificação continua a apontar ao sítio certo no dia em que o conteúdo
       mudar. As duas juntas fazem de parênteses à cauda: se a primeira está na
       última folha e a penúltima não a tem, a secção abre onde deve.

       O texto sai do `scripts/pdf-ler.mjs`, que traduz os identificadores de
       glifo pelo `/ToUnicode` embutido — procurar as palavras no ficheiro cru
       dá zero em todas as folhas, e foi o que me aconteceu à primeira. */
    const texto = textoPorPagina(buf)
    if (texto === null) {
      problemas.push(`${nome}: não consegui ler o texto das folhas`)
    } else if (texto.length === FOLHAS) {
      const abre = mandatos[0]?.organizacao
      const fecha = formacao[formacao.length - 1]?.instituicao
      const ultima = achatar(texto[FOLHAS - 1])
      const penultima = achatar(texto[FOLHAS - 2])
      if (abre !== undefined) {
        if (!ultima.includes(achatar(abre))) {
          problemas.push(`${nome}: os mandatos deviam abrir a folha ${FOLHAS}; não encontrei lá «${abre}»`)
        }
        if (penultima.includes(achatar(abre))) {
          problemas.push(`${nome}: os mandatos estão a começar na folha ${FOLHAS - 1}, separados do resto da cauda`)
        }
      }
      if (fecha !== undefined && !ultima.includes(achatar(fecha))) {
        problemas.push(`${nome}: os certificados deviam fechar na folha ${FOLHAS}; não encontrei lá «${fecha}»`)
      }
    }
    // Retrato, QR, uma captura por projeto que a tenha, os registos da voz e as
    // capas dos livros. O Chromium pode codificar uma imagem como par
    // imagem+máscara, por isso a conta é um mínimo, não uma igualdade.
    const imagens = conta(buf, /\/Subtype\s*\/Image/g)
    if (imagens < esperadas + capas + registos + 1) {
      problemas.push(
        `${nome} devia levar o retrato, as ${esperadas} capturas, os ${registos} registos da voz e as ${capas} capas; tem ${imagens} imagens`
      )
    }
  }
  if (existsSync(pub + 'docs/Fabio-Salgado-Projetos-PT.pdf')) {
    problemas.push('Fabio-Salgado-Projetos-PT.pdf ainda existe — foi fundido nos dois documentos')
  }
  /* Nenhum documento de uma revisão anterior fica para trás. Um PDF que o site
     já não nomeia continua a ser servido a quem tiver o endereço, e passa a ser
     uma versão do currículo a circular sem ninguém saber que existe. */
  if (existsSync(pub + 'docs')) {
    const publicados = new Set(documentos.map((d) => d.nome))
    for (const f of readdirSync(pub + 'docs')) {
      if (/^Fabio-Salgado-CV-/.test(f) && !publicados.has(f)) {
        problemas.push(`${f} é de uma revisão anterior e ninguém lhe aponta — corre \`npm run artifacts\``)
      }
    }
  }
  decide('os dois documentos abrem, com retrato e capturas, em 4 folhas', problemas)
}

/* ══ 12. O .zip e os tamanhos publicados ════════════════════════════════ */
{
  const problemas = []
  const caminho = pub + 'salgado.zip'
  if (!existsSync(caminho)) {
    problemas.push('public/salgado.zip não existe — corre `npm run pack`')
  } else {
    const z = lerZip(readFileSync(caminho))
    const nomes = z.entradas.map((e) => e.nome)
    /* Os dois CV entram pelo nome que as definições dizem, que traz o mês da
       revisão: um nome fixo aqui deixava esta verificação a procurar no zip um
       ficheiro que o zip deixou de ter, e a falhar por razão errada. */
    const noZip = ['cv-pt', 'cv-en'].map((id) => definicoes.find((d) => d.id === id)?.nome ?? id)
    for (const esperado of ['LEIA-ME.txt', ...noZip, 'resume.json']) {
      if (!nomes.includes(esperado)) problemas.push(`o .zip não traz ${esperado}`)
    }
    try {
      JSON.parse(z.ler('resume.json').toString('utf8'))
    } catch {
      problemas.push('o resume.json dentro do .zip não abre')
    }
  }
  /* O contador de linhas: duas coisas distintas, e nenhuma era a que estava cá.

     O QUE ESTAVA: uma recontagem, aqui, comparada com o `linhas.json`. Parecia
     uma verificação e eram duas cópias do mesmo algoritmo — o bloco de contagem
     do `pack.mjs` está copiado à letra neste ficheiro — a correrem sobre os
     mesmos ficheiros, com o `prebuild` a reescrever o `linhas.json` segundos
     antes. Não podiam discordar. Provado: três linhas a mais num ficheiro de
     dados, e verde à mesma desde que houvesse um build pelo meio, que há
     sempre, porque é a verificação 1 que o corre.

     O RISCO A SÉRIO, que isso escondia: o `pack.mjs` escreve o `linhas.json`
     dentro de `if (!process.env.VERCEL)`. Em produção NÃO o reescreve — usa o
     que está commitado. Quem mexa no código e publique sem correr o `pack`
     publica um número errado, e era precisamente esse o caso que a recontagem
     dizia cobrir e não cobria, porque se refrescava a si própria primeiro.

     Passam a ser duas asserções, cada uma com o seu trabalho. */

  /* 1. O número chega à página. Compara-se o que a página imprime com o
        `linhas.json` de onde ele sai — o que isto prova é o caminho do dado
        até ao texto, e apanha o dia em que o componente deixar de o mostrar
        ou passar a mostrar outro campo. */
  {
    const congeladas = JSON.parse(readFileSync(raiz + 'src/generated/linhas.json', 'utf8'))
    const publicado = /([\d\u00a0.,\s]+)linhas de código em ([\d\u00a0.,\s]+)ficheiros/.exec(html('/'))
    if (publicado === null) {
      problemas.push('a página não publica a contagem de linhas — o padrão deixou de casar')
    } else {
      const numero = (t) => Number(t.replace(/[^\d]/g, ''))
      if (numero(publicado[1]) !== congeladas.total || numero(publicado[2]) !== congeladas.ficheiros) {
        problemas.push(
          `a página publica ${numero(publicado[1])} linhas em ${numero(publicado[2])} ficheiros e o linhas.json diz ${congeladas.total} em ${congeladas.ficheiros}`
        )
      }
    }
  }

  /* 2. O que está commitado é o que os geradores produzem.

        Esta é a que cobre a produção. Depois do build — que já correu, na
        verificação 1, e que regenera tudo — nenhum ficheiro gerado e seguido
        por git pode ficar por commeter: se ficou, o que o Vercel vai publicar
        está velho.

        Em CI é falha, porque é o CI que guarda o que se publica. Na máquina de
        quem trabalha é aviso: enquanto se edita, é normal e certo que o
        `linhas.json` fique sujo — o que não pode é ir assim para o remoto. */
  let porCommeter = null
  {
    let sujos = ''
    try {
      sujos = execFileSync('git', ['status', '--porcelain', '--', 'src/generated', 'public/voz'], {
        cwd: raiz,
        encoding: 'utf8',
      }).trim()
    } catch (e) {
      /* Sem git não se sabe o que está commitado, e não saber não é o mesmo
         que estar mal — uma cópia exportada em tarball não tem repositório e
         não tem culpa. Em CI é outra coisa: aí há sempre checkout, e um git
         que falha é sinal de que o ambiente não é o que se julga. */
      const recado = `não consegui perguntar ao git pelos ficheiros gerados (${e.message.split('\n')[0]})`
      if (process.env.CI) problemas.push(recado)
      else porCommeter = recado
    }
    if (sujos !== '') {
      const lista = sujos.split('\n').map((l) => l.trim().split(/\s+/).pop())
      const recado = `o build mexeu em ficheiros gerados que estão por commeter: ${lista.join(', ')} — em produção publica-se o que está commitado`
      if (process.env.CI) problemas.push(recado)
      else porCommeter = recado
    }
  }

  /* E os tamanhos, pela mesma razão e pelo mesmo caminho: lia-se o
     `tamanhos.json`, que o `pack.mjs` escreve com o mesmo `statSync` que isto
     usava para o conferir. Duas leituras do mesmo número não são uma
     verificação. Confere-se contra a coluna que a página imprime, formatada
     como quem lê a vê. */
  const pagina = html('/')
  for (const d of definicoes) {
    if (!existsSync(pub + d.caminho)) {
      problemas.push(`${d.caminho} não existe`)
      continue
    }
    /* Pelo `id` da linha e não pelo `href`: o mesmo endereço aparece três vezes
       na página — no campo `cv` do contacto, na linha da árvore e no rodapé —,
       e das três só a da árvore traz a coluna do tamanho. Procurar pelo `href`
       apanhava a primeira e lia «—» de uma linha que nunca teve o número.
       A primeira versão disto fazia isso, e falhou à primeira execução. */
    const linha = new RegExp(`<a class="linha" id="${d.id}"([^>]*)>([\\s\\S]*?)</a>`).exec(pagina)
    if (linha === null) {
      problemas.push(`${d.caminho}: a árvore não tem linha com id="${d.id}"`)
      continue
    }
    const destino = /\bhref="([^"]*)"/.exec(linha[1])?.[1]
    if (destino !== `/${d.caminho}`) {
      problemas.push(`${d.id}: a linha aponta para ${destino} e o ficheiro está em /${d.caminho}`)
    }
    const esperado = tamanho(statSync(pub + d.caminho).size)
    const col = /linha__col--tam"[^>]*>([^<]*)</.exec(linha[2])?.[1].trim()
    if (col !== esperado) {
      problemas.push(`${d.caminho}: a página diz «${col ?? '—'}» e o disco dá «${esperado}»`)
    }
  }

  decide(
    'o .zip abre, as linhas e os tamanhos chegam à página, e o que está gerado está commitado',
    problemas,
    `${definicoes.length} ficheiros`
  )
  /* Debaixo da 12 e não ao lado dela: é uma ressalva a esta verificação, não
     uma verificação a mais, e um número na lista é coisa que se ganha. */
  if (porCommeter !== null) {
    console.log(`       \x1b[33m! ${porCommeter}\x1b[0m`)
    avisos.push('ficheiros gerados por commeter')
  }
}

/* ══ 16. As gravações batem certo com os ficheiros em disco ═════════════
   O nó `voz/` publica quatro coisas que ninguém escreveu à mão — o tamanho, a
   duração, as dimensões da imagem e o sha256 — e duas que ninguém deve poder
   desfazer sem dar por isso: nada pré-carrega, e todo o vídeo leva capa.

   As leituras em palco não têm nada disso, e é justamente por não terem que
   precisam de guarda própria: sem ficheiro para as ancorar, o que as prova são
   as imagens, e uma imagem que desapareça do disco não daria erro em lado
   nenhum. */
{
  const problemas = []
  const dirVoz = pub + 'voz/'
  const medidas = JSON.parse(readFileSync(raiz + 'src/generated/voz.json', 'utf8'))

  for (const l of leituras) {
    /* As leituras em palco não têm ficheiro: o que se lhes verifica é que as
       imagens declaradas existem, e que nenhuma passou sem crédito. O `alt` e
       o crédito são obrigatórios no schema; aqui confirma-se o que o schema não
       alcança, que é o disco. */
    if (l.formato === 'presencial') {
      if (medidas[l.id]) problemas.push(`${l.id}: é presencial e mesmo assim tem medida em voz.json`)
      for (const img of l.imagens) {
        if (!existsSync(dirVoz + img.ficheiro)) problemas.push(`${l.id}: falta a imagem ${img.ficheiro}`)
      }
      continue
    }
    const video = l.formato === 'video'
    const caminho = dirVoz + `${l.id}.${video ? 'mp4' : 'mp3'}`
    if (!existsSync(caminho)) {
      problemas.push(`${l.id}: ${caminho.replace(raiz, '')} não existe`)
      continue
    }
    const b = readFileSync(caminho)
    if (createHash('sha256').update(b).digest('hex') !== l.sha256) {
      problemas.push(`${l.id}: o sha256 do ficheiro não é o declarado em src/data/voz.ts`)
    }
    const m = medidas[l.id]
    if (!m) {
      problemas.push(`${l.id}: sem medida em voz.json — corre \`npm run voz\``)
      continue
    }
    if (m.bytes !== b.length) problemas.push(`${l.id}: voz.json diz ${m.bytes} B, o disco diz ${b.length} B`)
    const lido = video ? lerMp4(b) : lerMp3(b)
    if (m.segundos !== lido.segundos) {
      problemas.push(`${l.id}: voz.json diz ${m.segundos} s, o ficheiro diz ${lido.segundos} s`)
    }
    if (video) {
      // Sem capa, um vídeo que não pré-carrega é um retângulo preto na listagem.
      if (!existsSync(dirVoz + `${l.id}.webp`)) problemas.push(`${l.id}: falta a capa ${l.id}.webp`)
      if (m.largura !== lido.largura || m.altura !== lido.altura) {
        problemas.push(`${l.id}: voz.json diz ${m.largura}×${m.altura}, o ficheiro diz ${lido.largura}×${lido.altura}`)
      }
    }
  }

  // Um ficheiro sem entrada é som ou imagem publicados que não dizem de quem são.
  const declarados = new Set(
    leituras.flatMap((l) => {
      // O .vtt não é declarado em lado nenhum: é derivado da transcrição, e por
      // isso a lista de ficheiros esperados também tem de o derivar dela.
      const legenda = l.transcricao.length > 0 ? [`${l.id}.vtt`] : []
      if (l.formato === 'presencial') return [...l.imagens.map((i) => i.ficheiro), ...legenda]
      return l.formato === 'video'
        ? [`${l.id}.mp4`, `${l.id}.webp`, ...legenda]
        : [`${l.id}.mp3`, ...legenda]
    })
  )
  if (existsSync(dirVoz)) {
    for (const f of readdirSync(dirVoz)) {
      if (!declarados.has(f)) problemas.push(`public/voz/${f}: ficheiro sem entrada em src/data/voz.ts`)
    }
  }

  // O áudio fica fora do .zip por decisão tomada, e não por esquecimento. Se um
  // dia entrar, que entre porque alguém o quis.
  if (existsSync(pub + 'salgado.zip')) {
    const z = lerZip(readFileSync(pub + 'salgado.zip'))
    const dentro = z.entradas.filter((e) => /\.(mp3|mp4)$/.test(e.nome)).map((e) => e.nome)
    if (dentro.length) problemas.push(`o .zip traz som ou imagem: ${dentro.join(', ')}`)
  }

  // Sem `preload="none"` a página abria mais de cem megabytes de pedidos a quem
  // só passou por lá — e a verificação 8 não o apanha, porque o áudio é nosso.
  for (const rota of ROTAS_ARVORE) {
    const h = html(rota)
    for (const l of leituras) {
      // Uma leitura em palco não tem leitor porque não tem ficheiro. O que se
      // exige é que as imagens dela estejam mesmo na página: uma entrada sem
      // gravação e sem imagem não mostrava nada a ninguém.
      if (l.formato === 'presencial') {
        for (const img of l.imagens) {
          if (!h.includes(`/voz/${img.ficheiro}`)) problemas.push(`${rota}: ${l.id} sem a imagem ${img.ficheiro}`)
        }
        continue
      }
      const video = l.formato === 'video'
      const tag = video ? 'video' : 'audio'
      const ext = video ? 'mp4' : 'mp3'
      const achado = new RegExp(`<${tag}[^>]*src="/voz/${l.id}\\.${ext}"[^>]*>`).exec(h)
      if (!achado) problemas.push(`${rota}: sem leitor para ${l.id}`)
      else if (!/preload="none"/.test(achado[0])) {
        problemas.push(`${rota}: o leitor de ${l.id} não tem preload="none"`)
      } else if (video && !/poster="/.test(achado[0])) {
        problemas.push(`${rota}: o vídeo ${l.id} não tem capa`)
      }
    }
  }

  /* As legendas. Três coisas, e cada uma já falhou nalgum sítio na vida real:
     que o ficheiro exista, que seja WebVTT (sem o cabeçalho `WEBVTT` o browser
     recusa-o em silêncio e ninguém dá por nada), e que o último tempo seja
     exatamente a duração medida do vídeo — uma legenda que sobrevive ao fim do
     vídeo fica presa no ecrã. E que o marcado a vá buscar: um .vtt publicado
     que nenhum `<track>` aponta é um ficheiro a mais, não umas legendas. */
  let legendas = 0
  for (const l of leituras.filter((x) => x.transcricao.length > 0)) {
    const vtt = pub + `voz/${l.id}.vtt`
    if (!existsSync(vtt)) {
      problemas.push(`${l.id}: falta public/voz/${l.id}.vtt — corre \`npm run voz\``)
      continue
    }
    const texto = readFileSync(vtt, 'utf8')
    if (!texto.startsWith('WEBVTT')) problemas.push(`${l.id}.vtt não começa por WEBVTT`)
    const tempos = [...texto.matchAll(/(\d\d):(\d\d):(\d\d)\.(\d\d\d) --> (\d\d):(\d\d):(\d\d)\.(\d\d\d)/g)]
    if (tempos.length !== l.transcricao.length) {
      problemas.push(`${l.id}.vtt tem ${tempos.length} falas e a transcrição tem ${l.transcricao.length}`)
    } else {
      const u = tempos[tempos.length - 1]
      const fim = Number(u[5]) * 3600 + Number(u[6]) * 60 + Number(u[7]) + Number(u[8]) / 1000
      if (Math.abs(fim - medidas[l.id].segundos) > 0.001) {
        problemas.push(`${l.id}.vtt acaba aos ${fim}s e o vídeo tem ${medidas[l.id].segundos}s`)
      }
    }
    for (const rota of ROTAS_ARVORE) {
      if (!new RegExp(`<track[^>]*src="/voz/${l.id}\\.vtt"`).test(html(rota))) {
        problemas.push(`${rota}: o vídeo ${l.id} tem legendas em disco e nenhum <track> a apontar-lhes`)
      }
    }
    legendas += 1
  }

  const totalSegundos = Object.values(medidas).reduce((s, m) => s + m.segundos, 0)
  decide(
    'as gravações batem certo com os ficheiros em disco, e nada pré-carrega',
    problemas,
    `${Object.keys(medidas).length} gravações · ${Math.floor(totalSegundos / 3600)}h${String(Math.round((totalSegundos % 3600) / 60)).padStart(2, '0')} · ${leituras.filter((l) => l.formato === 'presencial').length} em palco`
  )
}

/* ══ 15. A página 404 é nossa ═══════════════════════════════════════════
   Sem 404.astro, um URL errado servia a página do Astro em dev e a da Vercel
   em produção — logótipos alheios, inglês, tema alheio. Qualquer caminho
   errado quebrava o site inteiro. */
{
  const problemas = []
  if (!existsSync(dist + '404.html')) {
    problemas.push('dist/404.html não existe')
  } else {
    const h = readFileSync(dist + '404.html', 'utf8')
    if (!h.includes('salgado.zip')) problemas.push('a 404 não parece ser a nossa')
    if (!/href="\/"/.test(h)) problemas.push('a 404 não liga de volta ao arquivo')
  }
  decide('a página 404 é a do site, com caminho de volta', problemas)
}

/* ══ 13. Oito capturas para revisão à vista ═════════════════════════════ */
{
  mkdirSync(revisao, { recursive: true })
  let feitas = 0
  for (const [rota, nome] of [['/', 'arquivo'], ['/cv/', 'cv']]) {
    for (const [w, h, ecra] of [[1440, 900, 'largo'], [390, 844, 'estreito']]) {
      for (const tema of ['light', 'dark']) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: tema })
        const p = await ctx.newPage()
        await p.goto(BASE + rota, { waitUntil: 'networkidle' })
        await p.screenshot({ path: `${revisao}${nome}-${ecra}-${tema}.png`, fullPage: true })
        await ctx.close()
        feitas++
      }
    }
  }
  ok('oito capturas para revisão à vista', `.verify/ · ${feitas} ficheiros`)
}

/* ══ 14. Conteúdo confirmado ════════════════════════════════════════════
   O plano proíbe marcadores "[POR PREENCHER]" em commit. A regra só é real
   se houver quem a imponha: é esta verificação que impede o PR de sair de
   rascunho enquanto faltar conteúdo que só o Fábio pode confirmar. */
{
  const problemas = []
  if (posicoes.length === 0) problemas.push('src/data/percurso.ts: sem posições')
  const semPeriodo = projetos.filter((p) => p.periodo === null).map((p) => p.dominio)
  if (semPeriodo.length) {
    problemas.push(`src/data/projetos.ts: período por confirmar em ${semPeriodo.join(', ')}`)
  }
  if (contacto.email === null) problemas.push('src/data/contacto.ts: email por confirmar')
  if (contacto.linkedin === null) problemas.push('src/data/contacto.ts: linkedin por confirmar')
  /* As credenciais dos certificados, em dois níveis — e a diferença entre eles
     é dita aqui para ninguém pensar que são o mesmo.

     O NÍVEL FORTE é o normal: a página tem de nomear quem tirou a credencial.
     Não basta responder — a Coursera é uma aplicação de página única e devolve
     200 com uma página bonita a qualquer código inventado; testei com um, e o
     que ela não devolve é o nome.

     O NÍVEL FRACO é para páginas que só se preenchem no browser. A do ITCILO é
     uma delas: o HTML que chega é uma casca, e o servidor só a pré-renderiza
     para agentes de robô conhecidos. Podia obter o nome dizendo-lhe que sou o
     Googlebot — funciona, experimentei — e não o faço: uma verificação que
     mente sobre quem é, a cada publicação e para sempre, não é uma coisa que
     se deixe escrita num repositório aberto.

     O que o nível fraco prova, ao certo: que o DOMÍNIO responde. E mais nada.
     Dizia aqui que dava «para saber o dia em que a credencial desaparecer», e
     não dá — medi as quatro respostas e são a mesma casca de 26 317 bytes:

       /81ebaf6f-012a-4df7-b1ef-631f25e3fa09   200   26317 B
       /00000000-0000-0000-0000-000000000000   200   26317 B
       /isto-nao-e-um-uuid                     200   26317 B
       /                                       200   26317 B

     Trocar o UUID por lixo deixa isto verde. É uma credencial que ninguém
     confere sozinho, e fica dito em vez de ficar prometido.

     A lista é de hospedeiros e não de certificados: assim, no dia em que a
     Coursera passar a esconder o nome, a conta acusa em vez de se calar. */
  const SO_NO_BROWSER = ['credentials.itcilo.org']
  const apelido = cabecalho.nome.split(' ').pop()

  /* Quantas se esperava conferir, contadas ANTES do ciclo.

     Sem isto o ciclo é o seu próprio critério: pus todas as `credencial` a
     `null` e a verificação ficou verde de imediato — lista vazia, ciclo vazio,
     zero problemas, e o comentário aqui em baixo a dizer que «a conta acusa em
     vez de se calar». Não havia conta nenhuma. Um certificado que perca a
     credencial passa a ser uma falha, e não um silêncio. */
  const comCredencial = formacao.filter((x) => x.credencial !== null)
  if (comCredencial.length === 0) {
    problemas.push('nenhum certificado tem credencial — ou os dados esvaziaram-se, ou o filtro parou de casar')
  }
  let conferidas = 0

  for (const f of comCredencial) {
    const hospedeiro = new URL(f.credencial).host
    try {
      const r = await fetch(f.credencial, { redirect: 'follow' })
      if (!r.ok) {
        problemas.push(`${f.id}: a credencial devolveu ${r.status}`)
        continue
      }
      if (SO_NO_BROWSER.includes(hospedeiro)) continue
      const corpo = await r.text()
      if (!corpo.includes(apelido)) {
        problemas.push(`${f.id}: a credencial responde mas não nomeia «${apelido}» — pode ter deixado de existir`)
      } else {
        conferidas += 1
      }
    } catch (e) {
      problemas.push(`${f.id}: não consegui abrir a credencial (${e.message})`)
    }
  }
  /* E quantas passaram mesmo pelo nível forte. Sem isto, um dia em que o
     SO_NO_BROWSER crescesse — ou em que a Coursera mudasse de domínio — a
     verificação continuava verde sem conferir uma única credencial a sério. */
  const noBrowser = comCredencial.filter((f) => SO_NO_BROWSER.includes(new URL(f.credencial).host)).length
  if (conferidas !== comCredencial.length - noBrowser) {
    problemas.push(
      `${conferidas} credenciais conferidas pelo nome e esperavam-se ${comCredencial.length - noBrowser}`
    )
  }

  decide(
    'conteúdo confirmado (percurso e contacto)',
    problemas,
    `${conferidas} credenciais nomeiam-no · ${noBrowser} só no browser`
  )
}

/* ══ 17. Acessibilidade: auditoria a cada publicação ════════════════════
   A nota de acessibilidade do site dizia «auditoria formal não há». Passou a
   haver, e a maneira de ela continuar verdadeira não é um relatório com data —
   é isto, a correr antes de cada publicação.

   Duas exigências, e as duas saem do que a auditoria de 20/08/2026 encontrou.

   A PRIMEIRA é o axe-core com o conjunto WCAG 2.0/2.1/2.2 até AA, em todas as
   rotas publicadas, nos dois temas, com a árvore fechada e aberta. Fechada e
   aberta porque metade do conteúdo do sítio vive dentro de `<details>`, e o
   que está fechado não existe para quem audita — auditar só o estado inicial
   era auditar a casca.

   A SEGUNDA é o que o axe não vê, e foi o achado que interessou. O texto
   alternativo de uma imagem dentro de um `<summary>` entra no NOME ACESSÍVEL
   do controlo. As miniaturas repetiam ali a descrição que o resumo já dava em
   texto, e sete controlos ficaram com nomes de 143 a 276 caracteres: quem
   navega por teclado ouvia um parágrafo por linha antes de saber onde estava.
   Agora são decorativas, e esta conta impede que voltem a não ser.

   O axe é dependência de desenvolvimento e corre no browser da verificação:
   não vai para o sítio, não entra no orçamento de JavaScript, e não faz um
   pedido a terceiros — a verificação 8 continua a valer. */
{
  const problemas = []
  const axe = readFileSync(raiz + 'node_modules/axe-core/axe.min.js', 'utf8')
  const REGRAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']
  const rotas = ['/', '/en/', '/fr/', '/es/', '/cv/', '/en/cv/', '/404.html']
  let combinacoes = 0
  let controlos = 0
  for (const tema of ['light', 'dark']) {
    for (const rota of rotas) {
      for (const aberta of [false, true]) {
        const ctx = await browser.newContext({ colorScheme: tema })
        const p = await ctx.newPage()
        await p.goto(BASE + rota, { waitUntil: 'networkidle' })
        await p.evaluate((t) => { document.documentElement.dataset.theme = t }, tema)
        if (aberta) {
          await p.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)))
        }
        await p.addScriptTag({ content: axe })
        const r = await p.evaluate(
          (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] }),
          REGRAS
        )
        for (const v of r.violations) {
          const onde = v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')
          problemas.push(`${rota} ${tema}${aberta ? ' aberta' : ''}: [${v.impact}] ${v.id} — ${v.help} (${onde})`)
        }
        if (aberta) {
          const falantes = await p.evaluate(() =>
            [...document.querySelectorAll('summary img[alt]')]
              .filter((i) => i.getAttribute('alt').trim() !== '')
              .map((i) => i.getAttribute('src') + ' → «' + i.getAttribute('alt').slice(0, 40) + '»')
          )
          controlos += await p.evaluate(() => document.querySelectorAll('summary').length)
          for (const f of falantes) {
            problemas.push(`${rota}: imagem com texto alternativo dentro de um <summary> — entra no nome do controlo: ${f}`)
          }
        }
        combinacoes += 1
        await ctx.close()
      }
    }
  }
  /* A TERCEIRA, e entrou depois de o Fábio a apanhar num telemóvel: a largura
     do valor de cada campo, num ecrã estreito.

     A auditoria de 20/08/2026 mediu refluxo — se alguma coisa transborda para
     fora da janela — e passou. Mas caber não é ler: a coluna dos rótulos é
     fixa no mais longo, e no nó da acessibilidade, com dois recuos, o valor
     ficava com TRÊS caracteres a 320px. Nada transbordava; simplesmente não se
     lia. Uma medição que só pergunta «cabe?» deixa passar exatamente isto.

     Vinte e quatro caracteres é um mínimo folgado — depois de os campos
     passarem a empilhar-se abaixo de 28rem de corpo, o pior caso dá trinta e
     dois. Está aqui para o dia em que um rótulo novo, mais comprido, empurrar
     a coluna outra vez. */
  {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 900 } })
    const p = await ctx.newPage()
    for (const rota of rotas.slice(0, 4)) {
      await p.goto(BASE + rota, { waitUntil: 'networkidle' })
      await p.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)))
      const estreitos = await p.evaluate(() => {
        const primeiro = document.querySelector('.no__campos dd')
        if (primeiro === null) return []
        const s = getComputedStyle(primeiro)
        const regua = document.createElement('span')
        regua.style.font = s.font
        regua.style.position = 'absolute'
        regua.style.whiteSpace = 'pre'
        regua.textContent = '0'.repeat(50)
        document.body.append(regua)
        const car = regua.getBoundingClientRect().width / 50
        regua.remove()
        return [...document.querySelectorAll('.no__campos dd')]
          .map((dd) => ({
            car: Math.round(dd.getBoundingClientRect().width / car),
            rotulo: (dd.previousElementSibling?.textContent ?? '').trim().slice(0, 28),
          }))
          .filter((x) => x.car < 24)
      })
      for (const e of estreitos) {
        problemas.push(`${rota} a 360px: o campo «${e.rotulo}» tem ${e.car} caracteres de largura — abaixo dos 24 que se leem`)
      }
    }
    await ctx.close()
  }

  decide(
    'auditoria de acessibilidade: WCAG 2.2 AA em todas as rotas, nos dois temas',
    problemas,
    `axe-core · ${combinacoes} combinações · ${controlos} controlos`
  )
}

/* ══ 18. As ligações que saem do sítio dizem que saem ═══════════════════
   Uma ligação que sai leva quatro coisas, e o que aqui se garante é que levam
   as quatro SEMPRE, e não só onde alguém se lembrou: janela nova, `noopener`,
   a seta que se vê, e o mesmo aviso escrito no nome acessível para quem não a
   vê. É a técnica G201 da WCAG — avisar antes de abrir uma janela — e é uma
   promessa que só vale se for de todas.

   Não chega o componente existir. Um `<a href="https://…">` escrito à mão em
   qualquer ficheiro .astro passa ao lado dele sem dar erro nenhum, e ninguém
   dá por isso a olhar para a página. Quem dá por isso é isto, que lê o HTML
   publicado — o resultado, não a intenção.

   A SETA é a única das quatro que tem exceção, e a exceção deriva-se do próprio
   HTML em vez de ser uma lista de endereços à parte: uma ligação SEM TEXTO
   VISÍVEL — os três ícones do rodapé — não leva seta, porque não há palavra
   nenhuma a que ela se encoste e uma seta ao lado de um ícone de dezasseis
   pixels lê-se como sujidade. Tem texto, leva seta. Não tem, não leva. As duas
   metades verificam-se, e por isso a exceção também não se pode espalhar.

   O ESPELHO conta tanto como a regra: uma ligação que NÃO sai do sítio não pode
   ter seta nem abrir janela. A seta só quer dizer alguma coisa enquanto quiser
   dizer uma coisa só, e uma que aparecesse numa ligação interna transformava o
   aviso em ruído — que é como se estraga um sinal destes, a pouco e pouco. */
{
  const problemas = []
  let fora = 0
  let dentro = 0

  for (const rota of ROTAS) {
    const aviso = avisoJanelaNova[linguaDe(rota)]
    const pagina = html(rota)

    /* Quantas âncoras há, contadas por fora do que se segue. Se o padrão de
       baixo deixasse de casar — uma âncora escrita de outra maneira, um
       `</a>` a mais —, este ciclo passava a olhar para menos ligações e a
       verificação ficava verde sobre o que já não via. «0 para fora» não pode
       ser um resultado aceitável. */
    const quantas = (pagina.match(/<a\b[^>]*\bhref=/g) ?? []).length
    const casadas = [...pagina.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter((m) =>
      /\bhref=/.test(m[1])
    ).length
    if (casadas !== quantas) {
      problemas.push(`${rota}: há ${quantas} âncoras na página e o padrão só apanhou ${casadas}`)
    }
    /* As âncoras não se aninham, e por isso o `<\/a>` mais próximo é sempre o
       fecho desta. Lá dentro há `<span>` e `<svg>`, que não interessam. */
    for (const m of pagina.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
      const [, atributos, dentroDela] = m
      const href = (/\bhref="([^"]*)"/.exec(atributos) ?? [])[1] ?? ''
      const sai = /^https?:\/\//.test(href) && !href.startsWith(CANONICO)
      const temSeta = /class="seta-fora"/.test(dentroDela)
      const onde = `${rota} → ${href.slice(0, 52)}`

      if (!sai) {
        dentro += 1
        if (temSeta) problemas.push(`${onde}: não sai do sítio e tem seta`)
        if (/target="_blank"/.test(atributos)) problemas.push(`${onde}: não sai do sítio e abre janela nova`)
        continue
      }

      fora += 1
      if (!/target="_blank"/.test(atributos)) problemas.push(`${onde}: sai do sítio sem target="_blank"`)
      if (!/\brel="[^"]*\bnoopener\b/.test(atributos)) problemas.push(`${onde}: sai do sítio sem rel="noopener"`)

      /* O texto que se vê, sem as etiquetas, sem a seta e sem o que só o leitor
         de ecrã ouve. Vazio quer dizer ligação de ícone — as três do rodapé, e
         mais nenhuma. */
      const texto = dentroDela
        .replace(/<span class="seta-fora"[\s\S]*?<\/span>/g, '')
        .replace(/<span class="so-leitor"[\s\S]*?<\/span>/g, '')
        .replace(/<[^>]*>/g, '')
        .trim()
      if (texto !== '' && !temSeta) problemas.push(`${onde}: sai do sítio, tem texto visível e não tem seta`)
      if (texto === '' && temSeta) problemas.push(`${onde}: é uma ligação de ícone e tem seta`)

      /* O NOME ACESSÍVEL, montado como o browser o monta: se há `aria-label`,
         é ele e mais nada; se não há, é o texto de dentro — o que se vê mais o
         que só se ouve. É essa distinção que interessa aqui, porque um
         `aria-label` não acrescenta ao nome: SUBSTITUI-O. */
      const rotulo = (/\baria-label="([^"]*)"/.exec(atributos) ?? [])[1] ?? null
      const escondido = /<span class="so-leitor">([^<]*)</.exec(dentroDela)?.[1] ?? ''
      const nomeAcessivel = rotulo ?? `${texto} ${escondido}`
      if (!nomeAcessivel.includes(aviso)) {
        problemas.push(`${onde}: o nome acessível não avisa da janela nova («${aviso}»)`)
      }

      /* E o critério 2.5.3, escrito à custa de um erro cometido aqui.

         Substituir o nome é legítimo quando o que lá se põe CONTÉM o que se vê:
         é o que faz uma ligação cujo texto visível diz «visitar» e cujo nome
         diz «visitar primeiraplateia.pt» — quem vê e quem ouve recebem a mesma
         palavra, e quem ouve recebe mais. Deixa de ser legítimo quando o nome
         deita fora alguma coisa que está na linha: as linhas de certificado
         chamaram-se «Moral Foundations of Politics — abre numa janela nova» e
         perderam o «Yale University» e o «2024» que quem vê lê ao lado. Esteve
         assim em produção, publicado por um PR que era sobre acessibilidade.

         Compara-se sem espaços repetidos, que o HTML construído traz aos molhos
         entre as colunas e que ninguém vê nem ouve. */
      const limpo = (s) => s.replace(/\s+/g, ' ').trim()
      if (rotulo !== null && texto !== '' && !limpo(rotulo).includes(limpo(texto))) {
        problemas.push(
          `${onde}: o aria-label («${limpo(rotulo).slice(0, 44)}») não contém o texto que se vê («${limpo(texto).slice(0, 44)}»)`
        )
      }
    }
  }

  decide(
    'as ligações que saem do sítio avisam — janela nova, noopener, seta e nome acessível',
    problemas,
    `${fora} para fora · ${dentro} cá dentro · ${ROTAS.length} rotas`
  )
}

await browser.close()
if (servidor) servidor.kill()

console.log('')
if (falhas.length) {
  console.log(`\x1b[31m${falhas.length} verificação(ões) a falhar.\x1b[0m O PR não sai de rascunho.`)
  if (avisos.length) console.log(`\x1b[33m${avisos.length} aviso(s).\x1b[0m`)
  process.exit(1)
}
console.log(`\x1b[32mTudo verde.\x1b[0m${avisos.length ? ` \x1b[33m${avisos.length} aviso(s).\x1b[0m` : ''}`)
