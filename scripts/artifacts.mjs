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
import { mkdirSync, writeFileSync } from 'node:fs'
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

      // Recusar o banner de cookies, quando existe: uma captura com banner por
      // cima lê-se como descuido. Recusa-se, não se aceita.
      for (const texto of ['Decline measurement', 'Decline', 'Recusar', 'Rejeitar', 'Only essential', 'Apenas essenciais']) {
        const b = p.getByRole('button', { name: texto, exact: false }).first()
        if (await b.isVisible().catch(() => false)) {
          await b.click({ timeout: 3000 }).catch(() => {})
          break
        }
      }

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
   Sobre /dossie/, nunca sobre a árvore. Quem recruta pede ficheiro, e o
   ficheiro que se manda é o dossiê. */
const qrSvg = await QRCode.toString(CANONICO, {
  type: 'svg',
  margin: 0,
  errorCorrectionLevel: 'M',
  color: { dark: '#14130f', light: '#00000000' },
})

async function pdf(nome, esconder, { comShots = false, rota = '/cv/' } = {}) {
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const p = await ctx.newPage()
  await p.goto(BASE + rota, { waitUntil: 'networkidle' })
  await p.emulateMedia({ media: 'print', colorScheme: 'light' })
  await p.evaluate(
    async ([svg, url, esconder, nome, shots]) => {
      document.documentElement.dataset.theme = 'light'
      for (const sel of esconder) document.querySelectorAll(sel).forEach((n) => n.remove())
      // O ficheiro de projetos leva as capturas; o CV não — num CV são ruído.
      const aDecodificar = []
      for (const [id, src] of shots) {
        const entrada = document.getElementById('d-' + id)
        if (!entrada) continue
        const img = document.createElement('img')
        img.src = src
        img.style.cssText =
          'margin-top:.6rem;width:100%;max-width:118mm;border:1px solid #ccc;border-radius:3px'
        entrada.append(img)
        aDecodificar.push(img)
      }
      // Sem isto o page.pdf() dispara antes de as capturas chegarem, e saem PDFs
      // sem imagem nenhuma — em silêncio.
      await Promise.all(aDecodificar.map((i) => i.decode().catch(() => {})))
      // O Chromium embute o bitmap descodificado: 4 capturas a 1440px dão um PDF
      // de 2,4 MB. Reamostrar para 900px em JPEG deixa-o em ~350 kB, e a 118 mm
      // de largura continua acima dos 190 dpi.
      for (const img of aDecodificar) {
        if (!img.naturalWidth) continue
        const c = document.createElement('canvas')
        c.width = 900
        c.height = Math.round((img.naturalHeight / img.naturalWidth) * 900)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        img.src = c.toDataURL('image/jpeg', 0.72)
        await img.decode().catch(() => {})
      }
      const pe = document.createElement('div')
      pe.style.cssText =
        'margin-top:2rem;padding-top:1rem;border-top:1px solid #bbb;display:flex;gap:.9rem;align-items:center;font-size:9pt;color:#333'
      const qr = document.createElement('div')
      qr.style.cssText = 'width:64px;height:64px;flex:0 0 64px'
      qr.innerHTML = svg
      const txt = document.createElement('div')
      txt.textContent = `${nome} · ${url}`
      pe.append(qr, txt)
      document.querySelector('main')?.append(pe)
    },
    [qrSvg, CANONICO, esconder, cabecalho.nome, comShots ? shotsDisponiveis : []]
  )
  await p.pdf({
    path: pub + 'docs/' + nome,
    format: 'A4',
    printBackground: false,
    margin: { top: '16mm', right: '15mm', bottom: '18mm', left: '15mm' },
  })
  await ctx.close()
  console.log(`· ${nome}`)
}

const shotsDisponiveis = comShot.map((p) => [p.id, `${BASE}/shots/${p.shot}`])

await pdf('Fabio-Salgado-CV-PT.pdf', ['.vista', '.controlos', '.rodape'])
await pdf('Fabio-Salgado-CV-EN.pdf', ['.vista', '.controlos', '.rodape'], { rota: '/en/cv/' })
// O ficheiro de projetos leva projetos e contacto; percurso e formação ficam
// para o CV, que é onde alguém os procura.
await pdf('Fabio-Salgado-Projetos-PT.pdf', [
  '.vista',
  '.controlos',
  '.rodape',
  '[data-seccao="percurso"]',
  '[data-seccao="formacao"]',
], { comShots: true })

await browser.close()
if (servidor) servidor.kill()
console.log('\nartefactos prontos. Corre `npm run build` para o site ler os tamanhos reais.')
