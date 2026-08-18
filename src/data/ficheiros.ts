import type { Lang } from './schema.ts'
import tamanhos from '../generated/tamanhos.json' with { type: 'json' }

/**
 * Os artefactos do nó `ficheiros/`.
 *
 * Os tamanhos não são lidos aqui: `scripts/pack.mjs` corre antes do build,
 * é quem escreve o .zip e o resume.json, e é quem faz o `statSync` sobre os
 * ficheiros reais para src/generated/tamanhos.json. Assim o build do Astro não
 * toca no sistema de ficheiros e a verificação 12 confirma que o que está
 * publicado corresponde ao que está em disco.
 */
export const definicoes = [
  {
    id: 'cv-pt',
    nome: 'Fabio-Salgado-CV-PT.pdf',
    caminho: 'docs/Fabio-Salgado-CV-PT.pdf',
    descricao: {
      pt: 'O percurso completo, pronto a enviar. Com QR de volta a este endereço.',
      en: 'The full track record, ready to send. With a QR code back to this address.',
    },
  },
  {
    id: 'cv-en',
    nome: 'Fabio-Salgado-CV-EN.pdf',
    caminho: 'docs/Fabio-Salgado-CV-EN.pdf',
    descricao: {
      pt: 'O mesmo percurso, em inglês.',
      en: 'The same track record, in English.',
    },
  },
  {
    id: 'projetos-pt',
    nome: 'Fabio-Salgado-Projetos-PT.pdf',
    caminho: 'docs/Fabio-Salgado-Projetos-PT.pdf',
    descricao: {
      pt: 'Os projetos, com capturas, em ficheiro.',
      en: 'The projects, with screenshots, as a file.',
    },
  },
  {
    id: 'resume-json',
    nome: 'resume.json',
    caminho: 'resume.json',
    descricao: {
      pt: 'O mesmo conteúdo em JSON Resume, para quem lê por máquina.',
      en: 'The same content in JSON Resume format, for machines.',
    },
  },
  {
    id: 'salgado-zip',
    nome: 'salgado.zip',
    caminho: 'salgado.zip',
    descricao: {
      pt: 'Tudo o que está acima, num arquivo. O domínio a cumprir o que promete.',
      en: 'Everything above, in one archive. The domain doing what it says.',
    },
  },
] as const satisfies ReadonlyArray<{ id: string; nome: string; caminho: string; descricao: Lang }>

export type Ficheiro = {
  id: string
  nome: string
  href: string
  descricao: Lang
  /** Bytes reais. `null` enquanto o artefacto não existir. */
  bytes: number | null
}

const mapa: Record<string, number> = tamanhos

export const ficheiros: Ficheiro[] = definicoes.map((d) => ({
  id: d.id,
  nome: d.nome,
  href: '/' + d.caminho,
  descricao: d.descricao,
  bytes: mapa[d.caminho] ?? null,
}))
