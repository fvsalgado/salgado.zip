#!/usr/bin/env node
/**
 * Um comando, dezasseis verificações, código de saída não-zero em qualquer falha.
 *
 * A v2 deste plano tinha uma lista de onze pontos para lembrar à mão antes de
 * cada publicação. O que não é executável não se cumpre. Quinze destas são
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
import { definicoes } from '../src/data/ficheiros.ts'
import { IDIOMAS, LINGUAS } from '../src/data/idiomas.ts'
import { posicoes, formacao } from '../src/data/percurso.ts'
import { cabecalho } from '../src/data/cabecalho.ts'
import { contacto } from '../src/data/contacto.ts'
import { projetos } from '../src/data/projetos.ts'
import { leituras } from '../src/data/voz.ts'

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
/** Uma rota por língua: o que não se verifica nas quatro só está verificado numa. */
const paginas = IDIOMAS.map((i) => LINGUAS[i].raiz)

function html(rota) {
  return readFileSync(dist + (rota === '/' ? 'index.html' : rota.slice(1) + 'index.html'), 'utf8')
}

/* ══ 2. Ligações internas ═══════════════════════════════════════════════ */
{
  const alvos = new Set()
  for (const rota of [...paginas, '/og/']) {
    for (const m of html(rota).matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) alvos.add(m[1])
  }
  const problemas = []
  for (const alvo of alvos) {
    const r = await fetch(BASE + alvo, { redirect: 'follow' }).catch(() => null)
    if (!r || !r.ok) problemas.push(`${alvo} → ${r ? r.status : 'sem resposta'}`)
  }
  decide('todas as ligações internas devolvem 200', problemas, `${alvos.size} alvos`)
}

/* ══ 3. Ligações externas (aviso, não bloqueia) ═════════════════════════ */
{
  const externas = new Set()
  for (const rota of paginas) {
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
  for (const rota of paginas) {
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
  varrer(dist + '_astro/')
  if (existsSync(dist + 'tema.js')) {
    total += statSync(dist + 'tema.js').size
    ficheiros.push(`tema.js ${statSync(dist + 'tema.js').size}B`)
  }
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
  const esperados = [...IDIOMAS.map((i) => `hreflang="${LINGUAS[i].html}"`), 'hreflang="x-default"']
  for (const i of IDIOMAS) {
    const rota = LINGUAS[i].raiz
    const ficheiro = dist + (rota === '/' ? 'index.html' : rota.slice(1) + 'index.html')
    if (!existsSync(ficheiro)) {
      problemas.push(`${rota} não foi gerada`)
      continue
    }
    const h = html(rota)
    for (const esperado of esperados) {
      if (!h.includes(esperado)) problemas.push(`${rota} sem ${esperado}`)
    }
  }
  decide('hreflang simétrico com x-default', problemas, `${IDIOMAS.length} línguas`)
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
    if (paginas < 2) problemas.push(`${nome} tem ${paginas} página(s) — o documento completo tem mais`)
    /* Quatro folhas, e é um teto. Não é gosto: é a diferença entre um documento
       que se imprime numa folha A4 frente e verso duas vezes e um que obriga a
       uma terceira quase vazia. O limite paga-se em desenho e ganha-se em
       leitura, e sem uma verificação a defendê-lo o primeiro parágrafo que
       alguém acrescentar empurra-o para cinco sem ninguém dar por isso.
       Quem quiser passar daqui muda este número de propósito, não por descuido. */
    if (paginas > FOLHAS) {
      problemas.push(`${nome} tem ${paginas} páginas; o limite são ${FOLHAS}`)
    }
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
  // O contador de linhas congelado tem de bater certo com o código: se
  // divergir, alguém mexeu no código sem correr `npm run pack`.
  {
    const contaveis = []
    const apanhar = (dir, aceita) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const c = dir + e.name
        if (e.isDirectory()) apanhar(c + '/', aceita)
        else if (aceita(c)) contaveis.push(c)
      }
    }
    apanhar(raiz + 'src/', (f) => /\.(astro|ts|css)$/.test(f) && !f.includes('/generated/') && !f.endsWith('fonts.css'))
    apanhar(raiz + 'scripts/', (f) => f.endsWith('.mjs'))
    for (const f of ['public/tema.js', 'astro.config.mjs', 'tsconfig.json', 'vercel.json', 'package.json', '.github/workflows/verify.yml']) {
      if (existsSync(raiz + f)) contaveis.push(raiz + f)
    }
    let frescas = 0
    for (const f of contaveis) {
      const texto = readFileSync(f, 'utf8')
      frescas += texto.split('\n').length - (texto.endsWith('\n') ? 1 : 0)
    }
    const congeladas = JSON.parse(readFileSync(raiz + 'src/generated/linhas.json', 'utf8'))
    if (congeladas.total !== frescas || congeladas.ficheiros !== contaveis.length) {
      problemas.push(
        `linhas.json diz ${congeladas.total} linhas em ${congeladas.ficheiros} ficheiros; a recontagem dá ${frescas} em ${contaveis.length} — corre npm run pack`
      )
    }
  }

  // Nenhum número é escrito à mão: o que a listagem publica tem de bater
  // certo com o ficheiro em disco, byte a byte.
  const publicados = JSON.parse(readFileSync(raiz + 'src/generated/tamanhos.json', 'utf8'))
  for (const d of definicoes) {
    const real = existsSync(pub + d.caminho) ? statSync(pub + d.caminho).size : null
    if (real === null) problemas.push(`${d.caminho} não existe`)
    else if (publicados[d.caminho] !== real) {
      problemas.push(`${d.caminho}: a listagem diz ${publicados[d.caminho] ?? '—'} B, o disco diz ${real} B`)
    }
  }
  decide('o .zip abre e os tamanhos publicados batem certo com o disco', problemas)
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
  for (const rota of paginas) {
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
    for (const rota of paginas) {
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
  /* As credenciais dos certificados. Não basta a página responder: a Coursera
     é uma aplicação de página única e devolve 200 com uma página bonita a
     qualquer código inventado — testei com um. O que distingue uma credencial
     real de uma inventada é o NOME de quem a tirou, e é isso que se procura.

     Conferidas à mão a 20/08/2026 e agora a cada publicação, porque um sítio
     que publica uma ligação de prova tem de saber o dia em que ela morrer. */
  for (const f of formacao.filter((x) => x.credencial !== null)) {
    try {
      const r = await fetch(f.credencial, { redirect: 'follow' })
      if (!r.ok) {
        problemas.push(`${f.id}: a credencial devolveu ${r.status}`)
        continue
      }
      const corpo = await r.text()
      const apelido = cabecalho.nome.split(' ').pop()
      if (!corpo.includes(apelido)) {
        problemas.push(`${f.id}: a credencial responde mas não nomeia «${apelido}» — pode ter deixado de existir`)
      }
    } catch (e) {
      problemas.push(`${f.id}: não consegui abrir a credencial (${e.message})`)
    }
  }
  decide('conteúdo confirmado (percurso e contacto)', problemas)
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

await browser.close()
if (servidor) servidor.kill()

console.log('')
if (falhas.length) {
  console.log(`\x1b[31m${falhas.length} verificação(ões) a falhar.\x1b[0m O PR não sai de rascunho.`)
  if (avisos.length) console.log(`\x1b[33m${avisos.length} aviso(s).\x1b[0m`)
  process.exit(1)
}
console.log(`\x1b[32mTudo verde.\x1b[0m${avisos.length ? ` \x1b[33m${avisos.length} aviso(s).\x1b[0m` : ''}`)
