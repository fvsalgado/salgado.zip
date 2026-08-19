#!/usr/bin/env node
/**
 * Gera os artefactos que a Vercel não consegue gerar: a Vercel não abre
 * browsers no build, por isso capturas, PDFs e og.png são commitados.
 *
 * O Chromium já está instalado. Nunca correr `playwright install`.
 *
 *   npm run artifacts              tudo
 *   npm run artifacts -- --sem-shots   salta as capturas dos sites externos
 */
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

import { abrirBrowser, BASE } from './browser.mjs'
import { projetos } from '../src/data/projetos.ts'
import { cabecalho } from '../src/data/cabecalho.ts'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const pub = raiz + 'public/'
const CANONICO = 'https://salgado.zip'
const semShots = process.argv.includes('--sem-shots')
/** `--so=onofriana` recaptura um site só, sem repetir os outros. */
const so = process.argv.find((a) => a.startsWith('--so='))?.slice(5) ?? null

mkdirSync(pub + 'shots', { recursive: true })
mkdirSync(pub + 'docs', { recursive: true })

/* ── Servidor de pré-visualização ─────────────────────────────────────────── */
async function esperar(url, tentativas = 60) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url)
      if (r.ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

let servidor = null
if (!(await esperar(BASE + '/', 1))) {
  console.log('· a arrancar o preview…')
  servidor = spawn('npx', ['astro', 'preview', '--port', '4321'], { cwd: raiz, stdio: 'ignore' })
  if (!(await esperar(BASE + '/'))) {
    servidor.kill()
    throw new Error(`preview não respondeu em ${BASE}. Corre \`npm run build\` primeiro.`)
  }
}

const browser = await abrirBrowser()

/**
 * O Chromium não atravessa o proxy deste ambiente, mas o `fetch` do Node
 * atravessa — e verifica o certificado contra o mesmo bundle. Relaia-se cada
 * pedido externo por ele. A verificação TLS mantém-se intacta.
 */
async function relay(ctx) {
  await ctx.route('**/*', async (rota) => {
    const req = rota.request()
    if (req.url().startsWith(BASE)) return rota.continue()
    try {
      const r = await fetch(req.url(), {
        method: req.method(),
        headers: req.headers(),
        body: ['GET', 'HEAD'].includes(req.method()) ? undefined : (req.postDataBuffer() ?? undefined),
        redirect: 'follow',
      })
      const headers = Object.fromEntries(r.headers)
      delete headers['content-encoding']
      delete headers['content-length']
      delete headers['content-security-policy']
      await rota.fulfill({ status: r.status, headers, body: Buffer.from(await r.arrayBuffer()) })
    } catch {
      await rota.abort()
    }
  })
}

/** Converte um PNG em webp usando o próprio Chromium: uma dependência nativa a menos. */
async function paraWebp(pngBuffer, largura, altura) {
  const p = await browser.newPage()
  const b64 = pngBuffer.toString('base64')
  const dataUrl = await p.evaluate(
    async ([b64, w, h]) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + b64
      await img.decode()
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      return c.toDataURL('image/webp', 0.82)
    },
    [b64, largura, altura]
  )
  await p.close()
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

/* ── 1. Capturas dos sites ────────────────────────────────────────────────
   Quatro. O Travertina não entra, e a decisão não se revisita por
   conveniência: está atrás de autenticação. Uma captura só podia mostrar um
   ecrã de acesso — inútil — ou registos reais — inaceitável. */
// O que se CAPTURA são os sites públicos; o que se EMBEBE no PDF são todas
// as capturas que existem — incluindo as de projetos privados, compostas a
// partir de prints com dados de demonstração.
const comCaptura = projetos.filter((p) => p.shot !== null && p.url !== null && (so === null || p.id === so))
const comShot = projetos.filter((p) => p.shot !== null)

/**
 * Recusa o banner de cookies, quando existe. Recusa-se, não se aceita — e
 * procura-se em `button`, `a` e `[role=button]`, porque metade destes banners
 * não usa um <button> nenhum e o getByRole('button') não lhes toca.
 */
async function recusarCookies(p) {
  for (const texto of ['Decline measurement', 'Decline', 'Recusar', 'Rejeitar', 'Only essential', 'Apenas essenciais']) {
    const b = p.locator('button, a, [role="button"]').filter({ hasText: texto }).first()
    if (await b.isVisible().catch(() => false)) {
      await b.click({ timeout: 3000 }).catch(() => {})
      await p.waitForTimeout(400)
      return
    }
  }
}

if (semShots) {
  console.log('· capturas: saltadas (--sem-shots)')
} else {
  // deviceScaleFactor 1: a saída é 1440×900 de qualquer forma, e a 2 o PNG
  // intermédio passa dos 4 MB — o suficiente para o Chromium ficar sem memória
  // ao quarto site.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  await relay(ctx)
  for (const proj of comCaptura) {
    const p = await ctx.newPage()
    const limite = setTimeout(() => p.close().catch(() => {}), 240000)
    try {
      await p.goto(proj.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await p.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})

      await recusarCookies(p)

      // Descer um pouco e voltar a subir dispara carregamento diferido e
      // animações de entrada. Limitado a 8 passos: há páginas muito longas e
      // uma captura do topo não precisa de percorrer a página toda.
      await p.evaluate(async () => {
        const passo = window.innerHeight / 2
        for (let i = 1; i <= 4 && passo * i < document.body.scrollHeight; i++) {
          window.scrollTo(0, passo * i)
          await new Promise((r) => setTimeout(r, 120))
        }
        window.scrollTo(0, 0)
      })
      await p.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
      // As animações de entrada destes sites demoram alguns segundos.
      await p.waitForTimeout(5000)
      // Segunda tentativa: há banners que só aparecem passados uns segundos,
      // e um deles por cima da captura lê-se como descuido.
      await recusarCookies(p)
      // Voltar ao topo já depois das animações: há páginas com cabeçalho
      // preso ao scroll que não voltam ao sítio com o primeiro scrollTo.
      await p.evaluate(() => window.scrollTo(0, 0))
      await p.waitForTimeout(700)
      // Esperar que as imagens do primeiro ecrã estejam descodificadas — com
      // limite: `decode()` numa <img> com carregamento diferido que nunca
      // chega a arrancar não resolve nem rejeita, e fica pendurado para sempre.
      await p
        .evaluate(() =>
          Promise.race([
            Promise.all(
              Array.from(document.images)
                .filter((i) => i.getBoundingClientRect().top < window.innerHeight)
                .map((i) => i.decode().catch(() => {}))
            ),
            new Promise((r) => setTimeout(r, 4000)),
          ])
        )
        .catch(() => {})
      const png = await p.screenshot({ type: 'png' })
      writeFileSync(pub + 'shots/' + proj.shot, await paraWebp(png, 1440, 900))
      console.log(`· captura ${proj.shot}`)
    } catch (e) {
      console.log(`· captura ${proj.shot} FALHOU: ${e.message.split('\n')[0]}`)
    } finally {
      clearTimeout(limite)
      await p.close().catch(() => {})
    }
  }
  await ctx.close()
}

/* ── 2. og.png ───────────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  await p.goto(BASE + '/og/', { waitUntil: 'networkidle' })
  await p.screenshot({ path: pub + 'og.png' })
  await ctx.close()
  console.log('· og.png')
}

/* ── 3. PDFs ─────────────────────────────────────────────────────────────
   Um documento por língua, sobre /cv/ e /en/cv/. Quem recruta descarrega um
   ficheiro, não três, e o que abre vem paginado e numerado.

   A numeração é do Chromium (`displayHeaderFooter`): as caixas de margem do
   @page não existem em motores WebKit, e o modelo do rodapé é um documento à
   parte — sem acesso às fontes da página, e com corpo 0 por omissão, o que
   obriga a declarar o estilo à mão. */
/**
 * Uma folha solta deste PDF tem de dizer sozinha de quem é, de onde veio,
 * de quando é e que lugar ocupa. É isso, e nada mais, que o rodapé leva.
 */
const rodape = (idioma) => {
  const data = new Intl.DateTimeFormat(idioma === 'en' ? 'en-GB' : 'pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  return `<div style="width:100%;margin:0 16mm;font:7pt Georgia,serif;color:#8c8577;display:flex;justify-content:space-between">
  <span>${cabecalho.nome} · ${CANONICO.replace('https://', '')}</span>
  <span>${data} · <span class="pageNumber"></span>/<span class="totalPages"></span></span>
</div>`
}

async function pdf(nome, rota, idioma) {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const p = await ctx.newPage()
  await p.goto(BASE + rota, { waitUntil: 'networkidle' })
  await p.emulateMedia({ media: 'print', colorScheme: 'light' })
  await p.evaluate(async () => {
    document.documentElement.dataset.theme = 'light'
    // As capturas estão no marcado a 1440px e o Chromium embute o bitmap
    // descodificado: seis delas davam um PDF de vários MB. Reamostrar para
    // 760px em JPEG deixa-o abaixo de 400 kB, e a 84 mm de largura continua
    // acima dos 220 dpi. Sem o decode() o pdf() dispara antes das imagens
    // chegarem e sai um documento sem capturas nenhumas, em silêncio.
    const imgs = Array.from(document.querySelectorAll('.captura img'))
    await Promise.all(imgs.map((i) => i.decode().catch(() => {})))
    for (const img of imgs) {
      if (!img.naturalWidth) continue
      const c = document.createElement('canvas')
      c.width = 760
      c.height = Math.round((img.naturalHeight / img.naturalWidth) * 760)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      img.src = c.toDataURL('image/jpeg', 0.72)
      await img.decode().catch(() => {})
    }
  })
  await p.pdf({
    path: pub + 'docs/' + nome,
    format: 'A4',
    printBackground: false,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: rodape(idioma),
    margin: { top: '17mm', right: '16mm', bottom: '16mm', left: '16mm' },
  })
  await ctx.close()
  console.log(`· ${nome}`)
}

/* ── 4. Favicons de mapa de bits ──────────────────────────────────────────
   O favicon.svg é a fonte e continua a ser o que os browsers modernos usam —
   inclusive a inverter-se sozinho no tema escuro. Mas o /favicon.ico devolvia
   404, e quem guarda o site no ecrã inicial de um iPhone ficava com uma
   miniatura da página em vez de uma marca.

   Rasteriza-se com o próprio Chromium, em esquema claro, que é a versão que
   um ícone estático deve ter: fundo escuro, marca clara. Sem dependência
   nativa e sem um segundo desenho a manter — se o SVG mudar, estes mudam. */
{
  const svg = readFileSync(pub + 'favicon.svg', 'utf8')
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const p = await ctx.newPage()
  const png = async (lado) => {
    const dataUrl = await p.evaluate(
      async ([svg, n]) => {
        const img = new Image()
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
        await img.decode()
        const c = document.createElement('canvas')
        c.width = n
        c.height = n
        const g = c.getContext('2d')
        g.drawImage(img, 0, 0, n, n)
        return c.toDataURL('image/png')
      },
      [svg, lado]
    )
    return Buffer.from(dataUrl.split(',')[1], 'base64')
  }

  const png180 = await png(180)
  writeFileSync(pub + 'apple-touch-icon.png', png180)

  /**
   * Um .ico com um só PNG lá dentro. O formato aceita PNG desde o Vista e o
   * contentor são 22 bytes de cabeçalho — escrevê-los à mão é mais honesto do
   * que juntar um codificador de ícones às dependências por causa disto.
   */
  const png48 = await png(48)
  const cabeca = Buffer.alloc(22)
  cabeca.writeUInt16LE(0, 0) // reservado
  cabeca.writeUInt16LE(1, 2) // 1 = ícone
  cabeca.writeUInt16LE(1, 4) // uma imagem
  cabeca.writeUInt8(48, 6) // largura
  cabeca.writeUInt8(48, 7) // altura
  cabeca.writeUInt8(0, 8) // cores da paleta: nenhuma
  cabeca.writeUInt8(0, 9) // reservado
  cabeca.writeUInt16LE(1, 10) // planos
  cabeca.writeUInt16LE(32, 12) // bits por pixel
  cabeca.writeUInt32LE(png48.length, 14)
  cabeca.writeUInt32LE(22, 18) // onde começa a imagem
  writeFileSync(pub + 'favicon.ico', Buffer.concat([cabeca, png48]))

  await ctx.close()
  console.log(`· favicon.ico (48px, ${png48.length} B) e apple-touch-icon.png (180px, ${png180.length} B)`)
}

await pdf('Fabio-Salgado-CV-PT.pdf', '/cv/', 'pt')
await pdf('Fabio-Salgado-CV-EN.pdf', '/en/cv/', 'en')

await browser.close()
if (servidor) servidor.kill()
console.log('\nartefactos prontos. Corre `npm run build` para o site ler os tamanhos reais.')
