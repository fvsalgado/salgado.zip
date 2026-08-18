#!/usr/bin/env node
/**
 * Extrai de @fontsource apenas os subconjuntos `latin` e `latin-ext`, em
 * woff2, e escreve src/styles/fonts.css com caminhos para /fonts/.
 *
 * Zero pedidos a terceiros — e o `latin-ext` não é opcional: sem ele os
 * diacríticos portugueses caem numa fonte de sistema a meio de uma palavra.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const mods = raiz + 'node_modules/@fontsource/'
const destino = raiz + 'public/fonts/'

const querido = [
  { pkg: 'ibm-plex-mono', familia: 'IBM Plex Mono', pesos: ['400', '500'] },
  { pkg: 'ibm-plex-serif', familia: 'IBM Plex Serif', pesos: ['400', '400-italic', '600'] },
]

rmSync(destino, { recursive: true, force: true })
mkdirSync(destino, { recursive: true })

const blocos = []
const copiados = []

for (const { pkg, familia, pesos } of querido) {
  for (const peso of pesos) {
    const css = readFileSync(`${mods}${pkg}/${peso}.css`, 'utf8')
    for (const bruto of css.split('@font-face').slice(1)) {
      const bloco = bruto.slice(0, bruto.indexOf('}') + 1)
      const m = bloco.match(/files\/([a-z0-9-]+\.woff2)/)
      if (!m) continue
      const ficheiro = m[1]
      // Só latin e latin-ext. Cirílico, grego e vietnamita ficam de fora.
      if (!/-latin(-ext)?-\d/.test(ficheiro)) continue
      copyFileSync(`${mods}${pkg}/files/${ficheiro}`, destino + ficheiro)
      copiados.push(ficheiro)
      blocos.push(
        '@font-face' +
          bloco
            .replace(/src:[^;]+;/, `src: url('/fonts/${ficheiro}') format('woff2');`)
            .replace(/font-family: '[^']+'/, `font-family: '${familia}'`)
      )
    }
  }
}

copyFileSync(`${mods}ibm-plex-mono/LICENSE`, destino + 'OFL.txt')

const cabecalho = `/* Gerado por scripts/fonts.mjs. Não editar à mão.
   IBM Plex Mono e IBM Plex Serif, SIL Open Font License 1.1.
   Licença em /fonts/OFL.txt. Subconjuntos latin + latin-ext, woff2. */\n\n`

writeFileSync(raiz + 'src/styles/fonts.css', cabecalho + blocos.join('\n\n') + '\n')
console.log(`fontes: ${copiados.length} ficheiros woff2, ${blocos.length} blocos @font-face`)
