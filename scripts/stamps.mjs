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
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
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

/* O número de espetáculos do Primeira Plateia vem do próprio site, que o
   publica no cabeçalho. Congelado aqui como as datas: lido da fonte quando
   este script corre, nunca escrito à mão. Se a leitura falhar, fica o valor
   anterior — um número antigo verdadeiro vale mais do que um atual inventado. */
const numerosPath = raiz + 'src/generated/numeros.json'
let numeros = {}
try {
  numeros = JSON.parse(readFileSync(numerosPath, 'utf8'))
} catch {}
try {
  const r = await fetch('https://primeiraplateia.pt', { redirect: 'follow' })
  const html = await r.text()
  const ler = (rotulo) => {
    const m = html.match(new RegExp('>([\\d\\s.,]{1,9})</span>\\s*(?:<[^>]+>)*\\s*' + rotulo, 'i'))
    if (!m) return null
    const n = parseInt(m[1].replace(/[^\d]/g, ''), 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const esp = ler('espet[áa]culos')
  const salas = ler('salas')
  const concelhos = ler('concelhos')
  if (esp) numeros.primeiraplateiaEspetaculos = esp
  if (salas) numeros.primeiraplateiaSalas = salas
  if (concelhos) numeros.primeiraplateiaConcelhos = concelhos
  if (esp || salas || concelhos) numeros.lidoEm = stamps[alvos[0]] ?? null
} catch {}
writeFileSync(numerosPath, JSON.stringify(numeros, null, 2) + '\n')
console.log(`numeros: espetáculos = ${numeros.primeiraplateiaEspetaculos ?? '—'}`)
