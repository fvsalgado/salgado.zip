import { cabecalho } from './cabecalho.ts'
import { projetos } from './projetos.ts'
import { leituras, RUBRICA, RECOLHA } from './voz.ts'
import { posicoes, formacao } from './percurso.ts'
import { mandatos } from './mandatos.ts'
import { contacto } from './contacto.ts'
import { ficheiros } from './ficheiros.ts'
import stamps from '../generated/stamps.json' with { type: 'json' }
import medidas from '../generated/voz.json' with { type: 'json' }

export { cabecalho, projetos, leituras, posicoes, mandatos, formacao, contacto, ficheiros }
export { RUBRICA, RECOLHA }
export * from './schema.ts'
export { IDIOMAS, LINGUAS, RAIZES, PADRAO } from './idiomas.ts'
export type { Idioma, Lingua } from './idiomas.ts'

/** Datas de modificação, do `git log`, congeladas em src/generated/stamps.json. */
export const datas: Record<string, string> = stamps

export const CANONICO = 'https://salgado.zip'

/**
 * Bytes e duração de cada leitura, medidos por scripts/voz.mjs sobre os mp3
 * reais. Nada aqui é escrito à mão — nem sequer a duração, que sai da
 * contagem de frames do próprio ficheiro.
 */
export const medidasVoz: Record<string, { bytes: number; segundos: number }> = medidas
