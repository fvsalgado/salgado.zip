#!/usr/bin/env node
/**
 * Um comando, catorze verificações, código de saída não-zero em qualquer falha.
 *
 * A v2 deste plano tinha uma lista de onze pontos para lembrar à mão antes de
 * cada publicação. O que não é executável não se cumpre. Treze destas são
 * binárias; só a última — a revisão à vista das oito capturas — precisa de
 * olho humano.
 *
 *   npm run verify
 */
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { abrirBrowser, BASE } from './browser.mjs'
import { lerZip } from './zip-ler.mjs'
import { definicoes } from '../src/data/ficheiros.ts'
import { posicoes } from '../src/data/percurso.ts'
import { contacto } from '../src/data/contacto.ts'
import { projetos } from '../src/data/projetos.ts'

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
const paginas = ['/']

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
    // Nem toda a gente responde a HEAD: 405 pede uma segunda tentativa com GET.
    if (r && r.status === 405) {
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

/* ══ 10. hreflang ═══════════════════════════════════════════════════════ */
{
  const temEn = existsSync(dist + 'en/index.html')
  if (!temEn) {
    aviso('hreflang e x-default', ['/en/ ainda não existe: fase EN por fazer'])
  } else {
    const problemas = []
    for (const rota of [...paginas, '/en/']) {
      const h = html(rota)
      for (const esperado of ['hreflang="pt-PT"', 'hreflang="en"', 'hreflang="x-default"']) {
        if (!h.includes(esperado)) problemas.push(`${rota} sem ${esperado}`)
      }
    }
    decide('hreflang simétrico com x-default', problemas)
  }
}

/* ══ 11. PDFs ═══════════════════════════════════════════════════════════ */
{
  const problemas = []
  const conta = (buf, re) => (buf.toString('latin1').match(re) ?? []).length
  for (const nome of ['Fabio-Salgado-CV-PT.pdf', 'Fabio-Salgado-CV-EN.pdf', 'Fabio-Salgado-Projetos-PT.pdf']) {
    const caminho = pub + 'docs/' + nome
    if (!existsSync(caminho)) {
      problemas.push(`${nome} não existe — corre \`npm run artifacts\``)
      continue
    }
    const buf = readFileSync(caminho)
    if (!buf.subarray(0, 5).toString() === '%PDF-') problemas.push(`${nome} não é um PDF`)
    const paginas = conta(buf, /\/Type\s*\/Page[^s]/g)
    if (paginas < 1) problemas.push(`${nome} sem páginas`)
    const imagens = conta(buf, /\/Subtype\s*\/Image/g)
    // No CV entra o retrato e nada mais — as capturas de projetos são ruído
    // num CV. O Chromium pode codificar uma imagem como par imagem+máscara,
    // por isso o limite é 2 objetos, não 1. No ficheiro de projetos as quatro
    // capturas são o conteúdo: menos do que isso é regressão.
    if (nome.includes('CV') && imagens > 2) problemas.push(`${nome} tem ${imagens} imagens — só o retrato devia lá estar`)
    if (nome.includes('CV') && imagens === 0) problemas.push(`${nome} devia levar o retrato e não leva imagem nenhuma`)
    const esperadas = projetos.filter((x) => x.shot !== null).length
    if (nome.includes('Projetos') && imagens < esperadas) {
      problemas.push(`${nome} devia levar as ${esperadas} capturas e tem ${imagens} imagens`)
    }
  }
  decide('PDFs legíveis, CV com retrato, projetos com capturas', problemas)
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
    for (const esperado of ['LEIA-ME.txt', 'Fabio-Salgado-CV-PT.pdf', 'Fabio-Salgado-CV-EN.pdf', 'Fabio-Salgado-Projetos-PT.pdf', 'resume.json']) {
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
  decide('conteúdo confirmado (percurso e contacto)', problemas)
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
