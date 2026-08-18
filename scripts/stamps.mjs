#!/usr/bin/env node
/**
 * Congela a data do último commit que tocou cada ficheiro de conteúdo em
 * src/generated/stamps.json.
 *
 * Porque é congelado e não lido no build: a Vercel faz clone raso e o
 * histórico pode não estar disponível. Correr antes de commitar conteúdo —
 * as datas referem-se ao commit anterior, que é o comportamento correto.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const alvos = [
  'src/data/cabecalho.ts',
  'src/data/projetos.ts',
  'src/data/percurso.ts',
  'src/data/contacto.ts',
]

const stamps = {}
for (const alvo of alvos) {
  let data = null
  try {
    data = execFileSync('git', ['log', '-1', '--format=%cI', '--', alvo], {
      cwd: raiz,
      encoding: 'utf8',
    }).trim() || null
  } catch {
    data = null
  }
  if (data) stamps[alvo] = data
}

mkdirSync(raiz + 'src/generated', { recursive: true })
writeFileSync(raiz + 'src/generated/stamps.json', JSON.stringify(stamps, null, 2) + '\n')
console.log(`stamps: ${Object.keys(stamps).length} entradas`)
