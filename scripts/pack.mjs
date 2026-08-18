#!/usr/bin/env node
/**
 * Corre ANTES do `astro build`.
 *
 * Escreve public/resume.json e public/salgado.zip a partir da mesma fonte que
 * o site — src/data/*.ts, importados diretamente com o type-stripping do Node.
 * Não há um segundo modelo de dados a manter em paralelo.
 *
 * Os dois ficheiros ficam em .gitignore: assim o Astro consegue ler-lhes o
 * tamanho com fs no build e não há binários a inchar o histórico.
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ZipArchive } from 'archiver'

import { cabecalho } from '../src/data/cabecalho.ts'
import { projetos } from '../src/data/projetos.ts'
import { posicoes, formacao } from '../src/data/percurso.ts'
import { mandatos } from '../src/data/mandatos.ts'
import { contacto } from '../src/data/contacto.ts'
import { definicoes } from '../src/data/ficheiros.ts'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const pub = raiz + 'public/'
const CANONICO = 'https://salgado.zip'

/** Data fixa vinda dos stamps: um .zip com a data de hoje mudaria a cada build. */
function dataFixa() {
  try {
    const s = JSON.parse(readFileSync(raiz + 'src/generated/stamps.json', 'utf8'))
    const ultima = Object.values(s).sort().at(-1)
    if (ultima) return new Date(ultima)
  } catch {}
  return new Date('2020-01-01T00:00:00Z')
}

/* ── resume.json ──────────────────────────────────────────────────────────
   Esquema JSON Resume (jsonresume.org/schema). Mesma fonte, quarta saída. */
const resume = {
  $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
  basics: {
    name: cabecalho.nome,
    label: cabecalho.cargo.en ?? cabecalho.cargo.pt,
    ...(contacto.email ? { email: contacto.email } : {}),
    url: CANONICO,
    summary: cabecalho.linhas.map((l) => l.en ?? l.pt).join(' '),
    location: { region: contacto.regiao, countryCode: 'PT' },
    profiles: contacto.linkedin
      ? [{ network: 'LinkedIn', url: contacto.linkedin, username: cabecalho.nome }]
      : [],
  },
  languages: contacto.idiomas.map((i) => ({
    language: i.lingua.en ?? i.lingua.pt,
    fluency: i.nivel.en ?? i.nivel.pt,
  })),
  volunteer: mandatos.map((m) => ({
    organization: m.organizacao,
    position: m.cargo.en ?? m.cargo.pt,
    startDate: m.periodo.inicio,
    ...(m.periodo.fim ? { endDate: m.periodo.fim } : {}),
    ...(m.linhas.length ? { highlights: m.linhas.map((l) => l.en ?? l.pt) } : {}),
  })),
  certificates: formacao.map((f) => ({
    name: f.curso.en ?? f.curso.pt,
    issuer: f.instituicao,
    date: f.periodo.inicio,
  })),
  work: posicoes.map((p) => ({
    name: p.organizacao,
    position: p.cargo.en ?? p.cargo.pt,
    startDate: p.periodo.inicio,
    ...(p.periodo.fim ? { endDate: p.periodo.fim } : {}),
    highlights: p.linhas.map((l) => l.en ?? l.pt),
  })),
  education: [],
  projects: projetos.map((p) => ({
    name: p.dominio,
    description: p.linha.en ?? p.linha.pt,
    highlights: p.detalhe.map((d) => d.en ?? d.pt),
    keywords: p.stack,
    ...(p.periodo ? { startDate: p.periodo.inicio } : {}),
    ...(p.periodo?.fim ? { endDate: p.periodo.fim } : {}),
    roles: [p.papel.en ?? p.papel.pt],
    // Projetos privados entram sem `url`. A entrada é legítima; o endereço não sai.
    ...(p.url ? { url: p.url } : {}),
  })),
  meta: {
    canonical: `${CANONICO}/resume.json`,
    version: '1.0.0',
    lastModified: dataFixa().toISOString(),
  },
}

mkdirSync(pub, { recursive: true })
writeFileSync(pub + 'resume.json', JSON.stringify(resume, null, 2) + '\n')

/* ── salgado.zip ──────────────────────────────────────────────────────────
   Lista explícita de ficheiros. Nunca empacotar public/ inteiro: o próprio
   .zip vive lá dentro. */
const leiaMe = [
  `${cabecalho.nome} — ${cabecalho.cargo.pt}`,
  cabecalho.linhas.map((l) => l.pt).join(' '),
  '',
  `Tudo isto vive em ${CANONICO}`,
  contacto.email ? `Contacto: ${contacto.email}` : null,
  contacto.linkedin ? `LinkedIn: ${contacto.linkedin}` : null,
  '',
  'Conteúdo deste arquivo:',
  '  Fabio-Salgado-CV-PT.pdf        o dossiê, impresso',
  '  Fabio-Salgado-Projetos-PT.pdf  os projetos, em ficheiro',
  '  resume.json                    o mesmo conteúdo em formato JSON Resume',
  '',
  'Gerado a partir da mesma fonte que o site. Nenhum número foi escrito à mão.',
  '',
]
  .filter((l) => l !== null)
  .join('\n')

const entradas = [
  { origem: null, conteudo: leiaMe, nome: 'LEIA-ME.txt' },
  { origem: pub + 'docs/Fabio-Salgado-CV-PT.pdf', nome: 'Fabio-Salgado-CV-PT.pdf' },
  { origem: pub + 'docs/Fabio-Salgado-Projetos-PT.pdf', nome: 'Fabio-Salgado-Projetos-PT.pdf' },
  { origem: pub + 'resume.json', nome: 'resume.json' },
]

const data = dataFixa()
const saida = createWriteStream(pub + 'salgado.zip')
const zip = new ZipArchive({ zlib: { level: 9 } })

const pronto = new Promise((resolve, reject) => {
  saida.on('close', resolve)
  zip.on('warning', reject)
  zip.on('error', reject)
})

zip.pipe(saida)

let emFalta = []
for (const e of entradas) {
  if (e.origem === null) {
    zip.append(e.conteudo, { name: e.nome, date: data })
  } else if (existsSync(e.origem)) {
    zip.append(readFileSync(e.origem), { name: e.nome, date: data })
  } else {
    emFalta.push(e.nome)
  }
}

await zip.finalize()
await pronto

/* ── tamanhos.json ────────────────────────────────────────────────────────
   Nenhum número é escrito à mão: os tamanhos da listagem saem daqui, de um
   statSync sobre os ficheiros reais, depois de o .zip estar fechado. */
const tamanhos = {}
for (const d of definicoes) {
  try {
    tamanhos[d.caminho] = statSync(pub + d.caminho).size
  } catch {
    /* artefacto ainda não gerado: a listagem mostra "—" e a verificação apanha */
  }
}
mkdirSync(raiz + 'src/generated', { recursive: true })
writeFileSync(raiz + 'src/generated/tamanhos.json', JSON.stringify(tamanhos, null, 2) + '\n')

console.log(`pack: resume.json + salgado.zip (${entradas.length - emFalta.length}/${entradas.length} entradas)`)
if (emFalta.length) {
  console.log(`      em falta, corre \`npm run artifacts\`: ${emFalta.join(', ')}`)
}
