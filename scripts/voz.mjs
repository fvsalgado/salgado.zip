#!/usr/bin/env node
/**
 * Corre ANTES do `astro build`, e antes do pack.mjs.
 *
 * Mede as gravações de public/voz/ e escreve src/generated/voz.json: bytes do
 * `statSync` e duração lida do próprio ficheiro. A listagem publica esses dois
 * números e mais nenhum — a mesma regra do resto da casa, agora aplicada a
 * áudio: se o build não o consegue derivar, não entra.
 *
 * A duração sai do scripts/mp3-ler.mjs, que a lê do próprio ficheiro. De
 * caminho confirma-se o sha256 declarado em src/data/voz.ts: um mp3 trocado
 * por outro pára o build aqui, e não três verificações mais à frente.
 *
 * As leituras presenciais não têm ficheiro nenhum e não entram no voz.json;
 * delas só se verifica que as imagens declaradas existem em disco.
 *
 *   node scripts/voz.mjs
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { lerMp3 } from './mp3-ler.mjs'
import { lerMp4 } from './mp4-ler.mjs'
import { leituras } from '../src/data/voz.ts'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const pub = raiz + 'public/'

/* ── voz.json ─────────────────────────────────────────────────────────────
   Uma entrada por leitura, com o id como chave: é o mesmo id do ficheiro em
   public/voz/ e da entrada em src/data/voz.ts, e assim uma leitura sem
   ficheiro ou um ficheiro sem leitura dão pela falta. */

const medidas = {}
const problemas = []

for (const l of leituras) {
  /* As presenciais não têm ficheiro para medir: o que se verifica é que as
     imagens que a página promete estão mesmo em disco. Não entram no voz.json
     — não têm bytes nem segundos, e uma entrada a zeros seria pior do que
     entrada nenhuma: a soma dos totais passava a contá-las. */
  if (l.formato === 'presencial') {
    for (const img of l.imagens) {
      if (!existsSync(pub + `voz/${img.ficheiro}`)) {
        problemas.push(`${l.id}: falta a imagem public/voz/${img.ficheiro}`)
      }
    }
    continue
  }
  const ext = l.formato === 'video' ? 'mp4' : 'mp3'
  const caminho = pub + `voz/${l.id}.${ext}`
  if (!existsSync(caminho)) {
    problemas.push(`${l.id}: public/voz/${l.id}.${ext} não existe`)
    continue
  }
  const bytes = statSync(caminho).size
  const b = readFileSync(caminho)
  const sha = createHash('sha256').update(b).digest('hex')
  if (sha !== l.sha256) {
    problemas.push(`${l.id}: o sha256 do ficheiro não é o declarado em src/data/voz.ts`)
  }
  if (l.formato === 'video') {
    // A capa é obrigatória: com `preload="none"` um vídeo sem `poster` é um
    // retângulo preto na listagem, e a listagem é onde ele é visto.
    if (!existsSync(pub + `voz/${l.id}.webp`)) {
      problemas.push(`${l.id}: falta a capa public/voz/${l.id}.webp`)
    }
    const d = lerMp4(b)
    medidas[l.id] = { bytes, segundos: d.segundos, largura: d.largura, altura: d.altura }
  } else {
    medidas[l.id] = { bytes, segundos: lerMp3(b).segundos }
  }
}

if (problemas.length) {
  console.error('voz: ' + problemas.join('\n     '))
  process.exit(1)
}

mkdirSync(raiz + 'src/generated', { recursive: true })
writeFileSync(raiz + 'src/generated/voz.json', JSON.stringify(medidas, null, 2) + '\n')

const total = Object.values(medidas).reduce((s, m) => s + m.segundos, 0)
const bytes = Object.values(medidas).reduce((s, m) => s + m.bytes, 0)
const conta = (f) => leituras.filter((l) => l.formato === f).length
console.log(
  `voz: ${leituras.length} peças (${conta('audio')} áudio, ${conta('video')} vídeo, ${conta('presencial')} em palco) · ${Math.floor(total / 3600)}h${String(Math.floor((total % 3600) / 60)).padStart(2, '0')} · ${(bytes / 1e6).toFixed(1)} MB`
)
