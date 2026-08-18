#!/usr/bin/env node
/**
 * Compõe a captura de um projeto privado a partir de fotogramas de ecrã.
 *
 * Os projetos públicos são capturados pelo scripts/artifacts.mjs, que abre o
 * site com o Chromium. Os privados estão atrás de autenticação e não têm
 * endereço, por isso os fotogramas vêm de fora — do telemóvel — e ficam em
 * `private/`, que está no .gitignore. O que se publica é o mosaico; os
 * fotogramas em bruto não entram no repositório.
 *
 * A receita fica aqui, e não num script descartável, pelo mesmo motivo que
 * tudo o resto neste sítio: uma imagem que ninguém consegue voltar a gerar é
 * uma imagem que ninguém consegue voltar a corrigir.
 *
 *   npm run mosaico
 *
 * Os retângulos de `tapar` estão em percentagem do fotograma, não em pixels:
 * assim sobrevivem a um telemóvel com outra resolução.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const fonte = raiz + 'private/travertina/'

/** Duas por mosaico, e não três: a célula da grelha do PDF tem 56 mm de
 *  largura, e três telemóveis lá dentro ficam ilegíveis. */
const ecras = [
  { ficheiro: 'inicio.jpg' },
  {
    ficheiro: 'credito.jpg',
    // Valores da simulação. São fictícios, mas não precisam de estar à vista.
    tapar: [
      { x: 16.5, y: 48, w: 30, h: 2.6 },
      { x: 77.5, y: 46.3, w: 18.5, h: 6.4 },
    ],
  },
]

const emFalta = ecras.filter((e) => !existsSync(fonte + e.ficheiro))
if (emFalta.length) {
  console.error(`falta ${emFalta.map((e) => e.ficheiro).join(', ')} em private/travertina/`)
  process.exit(1)
}

const LARG = 1600
const ALT = 1000

const painel = (e) => `
  <div class="tel">
    <img src="data:image/jpeg;base64,${readFileSync(fonte + e.ficheiro).toString('base64')}" />
    ${(e.tapar ?? [])
      .map((r) => `<span class="tapa" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%"></span>`)
      .join('')}
  </div>`

const html = `<!doctype html><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box }
  #palco {
    width: ${LARG}px; height: ${ALT}px;
    display: flex; align-items: center; justify-content: center; gap: 64px;
    background: radial-gradient(120% 90% at 30% 0%, #f0eee7 0%, #e7e3da 55%, #ded9cf 100%);
  }
  .tel {
    position: relative; height: 900px; aspect-ratio: 1280 / 2772;
    border-radius: 30px; overflow: hidden;
    box-shadow: 0 24px 48px -18px rgba(40, 34, 24, .34), 0 4px 12px -6px rgba(40, 34, 24, .24);
    outline: 1px solid rgba(0, 0, 0, .06);
  }
  .tel img { width: 100%; height: 100%; display: block; object-fit: cover }
  .tapa { position: absolute; border-radius: 6px; background: #d9ddd4 }
</style>
<div id="palco">${ecras.map(painel).join('')}</div>`

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await browser.newPage({ viewport: { width: LARG, height: ALT }, deviceScaleFactor: 2 })
await p.setContent(html, { waitUntil: 'load' })
await p.waitForTimeout(400)
const png = await p.locator('#palco').screenshot({ type: 'png' })

// webp pelo próprio Chromium, como no artifacts.mjs: uma dependência nativa a menos.
const dataUrl = await p.evaluate(
  async ([b64, w, h]) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    c.getContext('2d').drawImage(img, 0, 0, w, h)
    return c.toDataURL('image/webp', 0.9)
  },
  [png.toString('base64'), LARG, ALT]
)
writeFileSync(raiz + 'public/shots/travertina.webp', Buffer.from(dataUrl.split(',')[1], 'base64'))
await browser.close()
console.log(`· travertina.webp · ${ecras.length} ecrãs`)
