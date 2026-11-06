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
  'src/data/voz.ts',
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

/* Lia-se aqui o número de espetáculos, de salas e de concelhos do
   primeiraplateia.pt, para um numeros.json. Saiu a 6/11/2026: o endereço
   redireciona para o coreto.org, que só publica as contagens da demonstração —
   um território inventado —, e uma contagem inventada não entra num
   currículo. A razão inteira está no topo do src/data/projetos.ts. */
