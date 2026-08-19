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
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ZipArchive } from 'archiver'
import QRCode from 'qrcode'

import { cabecalho } from '../src/data/cabecalho.ts'
import { projetos } from '../src/data/projetos.ts'
import { posicoes, formacao } from '../src/data/percurso.ts'
import { mandatos } from '../src/data/mandatos.ts'
import { contacto } from '../src/data/contacto.ts'
import { definicoes } from '../src/data/ficheiros.ts'
import { leituras, RUBRICA } from '../src/data/voz.ts'

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
  /**
   * As leituras entram em `publications`, que é o campo do JSON Resume mais
   * próximo do que elas são. O `summary` diz o papel primeiro e de propósito:
   * uma entrada com o título do livro e o meu nome por cima, sem mais nada,
   * lê-se como se eu o tivesse escrito.
   */
  publications: leituras.map((l) => {
    const papel = l.papel.en ?? l.papel.pt
    return {
      name: l.titulo,
      publisher: `${RUBRICA.nome}, ${RUBRICA.editor}`,
      releaseDate: l.data,
      url: l.origem,
      summary: `${papel[0].toUpperCase()}${papel.slice(1)} for ${RUBRICA.nome} (${RUBRICA.editor}). ${l.fonte.en ?? l.fonte.pt}`,
    }
  }),
  meta: {
    canonical: `${CANONICO}/resume.json`,
    version: '1.0.0',
    lastModified: dataFixa().toISOString(),
  },
}

mkdirSync(pub, { recursive: true })
writeFileSync(pub + 'resume.json', JSON.stringify(resume, null, 2) + '\n')

/* ── qr.svg ───────────────────────────────────────────────────────────────
   O caminho de volta ao site a partir do papel. Vive na tarja de contacto do
   dossiê e sai do mesmo endereço canónico, portanto é sempre o mesmo ficheiro
   para o mesmo destino. */
writeFileSync(
  pub + 'qr.svg',
  await QRCode.toString(CANONICO, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#14130f', light: '#00000000' },
  })
)

/* ── O que fica de fora do .zip ───────────────────────────────────────────
   O áudio não entra no arquivo, e por isso o arquivo tem de dizer onde está e
   quanto pesa. Os dois números saem do voz.json, medido em disco pelo
   scripts/voz.mjs — nem o tamanho nem a duração são escritos à mão. */
const medidasVoz = JSON.parse(readFileSync(raiz + 'src/generated/voz.json', 'utf8'))
const vozBytes = Object.values(medidasVoz).reduce((s, m) => s + m.bytes, 0)
const vozSegundos = Object.values(medidasVoz).reduce((s, m) => s + m.segundos, 0)
const vozMB = (vozBytes / 1e6).toFixed(0)
const vozHoras = `${Math.floor(vozSegundos / 3600)}h${String(Math.round((vozSegundos % 3600) / 60)).padStart(2, '0')}`

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
  '  Fabio-Salgado-CV-PT.pdf  o documento completo, em português',
  '  Fabio-Salgado-CV-EN.pdf  the same document, in English',
  '  resume.json              o mesmo conteúdo em formato JSON Resume',
  '',
  // O áudio fica de fora, e o arquivo tem de o dizer: um zip que promete
  // «tudo» e cala 100 MB de leituras é um zip que mente por omissão.
  `As ${leituras.length} leituras do ${RUBRICA.nome} não vêm aqui dentro: são ${vozHoras} de áudio,`,
  `${vozMB} MB, e quem quer o CV não quer o arquivo sonoro com ele.`,
  `Estão em ${CANONICO}/, no nó voz/, uma a uma e com o tamanho à vista.`,
  '',
  'Gerado a partir da mesma fonte que o site. Nenhum número foi escrito à mão.',
  '',
]
  .filter((l) => l !== null)
  .join('\n')

const entradas = [
  { origem: null, conteudo: leiaMe, nome: 'LEIA-ME.txt' },
  { origem: pub + 'docs/Fabio-Salgado-CV-PT.pdf', nome: 'Fabio-Salgado-CV-PT.pdf' },
  { origem: pub + 'docs/Fabio-Salgado-CV-EN.pdf', nome: 'Fabio-Salgado-CV-EN.pdf' },
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

/* ── linhas.json ──────────────────────────────────────────────────────────
   O contador de linhas do colofão: ficheiros autorados (componentes, dados,
   estilos, scripts, configuração), excluindo o gerado e os assets, contados
   à maneira do wc -l.

   Conta-se LOCALMENTE e congela-se no commit — no build da Vercel usa-se o
   valor congelado, porque o ambiente de lá produziu contagens diferentes da
   mesma árvore. A verificação 12 reconta e falha se o valor congelado não
   bater certo com o código: o número publicado é sempre um número auditado. */
const contaveis = []
const apanhar = (dir, aceita) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const caminho = dir + e.name
    if (e.isDirectory()) apanhar(caminho + '/', aceita)
    else if (aceita(caminho)) contaveis.push(caminho)
  }
}
apanhar(raiz + 'src/', (f) => /\.(astro|ts|css)$/.test(f) && !f.includes('/generated/') && !f.endsWith('fonts.css'))
apanhar(raiz + 'scripts/', (f) => f.endsWith('.mjs'))
for (const f of ['public/tema.js', 'astro.config.mjs', 'tsconfig.json', 'vercel.json', 'package.json', '.github/workflows/verify.yml']) {
  if (existsSync(raiz + f)) contaveis.push(raiz + f)
}
let linhas = 0
for (const f of contaveis) {
  const texto = readFileSync(f, 'utf8')
  linhas += texto.split('\n').length - (texto.endsWith('\n') ? 1 : 0)
}
if (!process.env.VERCEL) {
  mkdirSync(raiz + 'src/generated', { recursive: true })
  writeFileSync(
    raiz + 'src/generated/linhas.json',
    JSON.stringify({ total: linhas, ficheiros: contaveis.length }, null, 2) + '\n'
  )
}

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

/* ── og.json ──────────────────────────────────────────────────────────────
   As dimensões do cartão social, lidas do cabeçalho IHDR do próprio PNG. O
   WhatsApp e o LinkedIn reservam o espaço da imagem antes de a descarregar
   quando as recebem na meta — e continuam a ser números que ninguém escreve. */
const og = {}
try {
  const png = readFileSync(pub + 'og.png')
  if (png.subarray(12, 16).toString('latin1') === 'IHDR') {
    og.largura = png.readUInt32BE(16)
    og.altura = png.readUInt32BE(20)
  }
} catch {
  /* cartão ainda não gerado: as meta de dimensão não saem, o resto sai */
}
writeFileSync(raiz + 'src/generated/og.json', JSON.stringify(og, null, 2) + '\n')

console.log(`pack: resume.json + salgado.zip (${entradas.length - emFalta.length}/${entradas.length} entradas) · ${linhas} linhas em ${contaveis.length} ficheiros`)
if (emFalta.length) {
  console.log(`      em falta, corre \`npm run artifacts\`: ${emFalta.join(', ')}`)
}
