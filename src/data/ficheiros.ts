import type { Lang } from './schema.ts'
import tamanhos from '../generated/tamanhos.json' with { type: 'json' }
import revisao from '../generated/revisao.json' with { type: 'json' }

/**
 * Os artefactos do nó `ficheiros/`.
 *
 * Os tamanhos não são lidos aqui: `scripts/pack.mjs` corre antes do build,
 * é quem escreve o .zip e o resume.json, e é quem faz o `statSync` sobre os
 * ficheiros reais para src/generated/tamanhos.json. Assim o build do Astro não
 * toca no sistema de ficheiros e a verificação 12 confirma que o que está
 * publicado corresponde ao que está em disco.
 *
 * ── O mês no nome dos dois CV ────────────────────────────────────────────
 * Os documentos trazem a data de revisão no nome. É por causa de cache, e a
 * cache que interessa não é a do site: os PDF já saem com
 * `max-age=0, must-revalidate` e um ETag, e nenhum browser mostra um deles
 * velho. Quem guarda cópia é outra gente — a pré-visualização de quem recebeu
 * o endereço, o filtro de correio, o proxy de uma empresa — e a esses só um
 * endereço novo os manda buscar outra vez.
 *
 * O mês vem de `src/generated/revisao.json`, que o `scripts/artifacts.mjs`
 * escreve no momento em que gera os PDF, a partir da data do último commit.
 * CONGELADO e versionado, e não recalculado a cada build: se fosse lido do
 * relógio a cada compilação, no dia 1 de setembro o nome mudava sozinho, os
 * ficheiros em disco continuavam a dizer agosto, e a verificação 12 ficava
 * vermelha sem ninguém ter tocado em nada. Assim o nome só muda quando alguém
 * corre `npm run artifacts`, que é o ato de rever o documento.
 *
 * A regra de composição vive numa função só, `nomeCV`, porque quem escreve os
 * ficheiros e quem os publica têm de concordar sobre o nome — e um nome
 * composto em dois sítios é um nome que mais tarde ou mais cedo diverge.
 */

/** O nome de um dos dois documentos, no mês em que foi revisto. */
export function nomeCV(lingua: 'PT' | 'EN', mes: string): string {
  return `Fabio-Salgado-CV-${lingua}-${mes}.pdf`
}

/** O mês da última revisão dos documentos, `AAAA-MM`. */
export const mesRevisao: string = revisao.mes
export const definicoes = [
  {
    id: 'cv-pt',
    nome: nomeCV('PT', mesRevisao),
    caminho: 'docs/' + nomeCV('PT', mesRevisao),
    descricao: {
      pt: 'O documento completo, em português: percurso, projetos, voz, mandatos, certificados, idiomas e contacto.',
      en: 'The full document, in Portuguese: career, projects, voice, elected office, certificates, languages and contact.',
      fr: 'Le document complet, en portugais : parcours, projets, voix, mandats, certificats, langues et contact.',
      es: 'El documento completo, en portugués: trayectoria, proyectos, voz, mandatos, certificados, idiomas y contacto.',
    },
  },
  {
    id: 'cv-en',
    nome: nomeCV('EN', mesRevisao),
    caminho: 'docs/' + nomeCV('EN', mesRevisao),
    descricao: {
      pt: 'O mesmo documento, em inglês.',
      en: 'The same document, in English.',
      fr: 'Le même document, en anglais.',
      es: 'El mismo documento, en inglés.',
    },
  },
  {
    id: 'resume-json',
    nome: 'resume.json',
    caminho: 'resume.json',
    descricao: {
      pt: 'O mesmo conteúdo em JSON Resume, para quem lê por máquina.',
      en: 'The same content in JSON Resume format, for machines.',
      fr: 'Le même contenu au format JSON Resume, pour la lecture machine.',
      es: 'El mismo contenido en formato JSON Resume, para lectura automática.',
    },
  },
  {
    id: 'salgado-zip',
    nome: 'salgado.zip',
    caminho: 'salgado.zip',
    descricao: {
      pt: 'Tudo o que está acima, num arquivo. O domínio a cumprir o que promete.',
      en: 'Everything above, in one archive. The domain doing what it says.',
      fr: 'Tout ce qui précède, en une seule archive. Le domaine qui tient sa promesse.',
      es: 'Todo lo anterior, en un solo archivo. El dominio cumpliendo lo que promete.',
    },
  },
] satisfies ReadonlyArray<{ id: string; nome: string; caminho: string; descricao: Lang }>

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
