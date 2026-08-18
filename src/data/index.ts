import { cabecalho } from './cabecalho.ts'
import { projetos } from './projetos.ts'
import { posicoes, formacao } from './percurso.ts'
import { mandatos } from './mandatos.ts'
import { contacto } from './contacto.ts'
import { ficheiros } from './ficheiros.ts'
import stamps from '../generated/stamps.json' with { type: 'json' }

export { cabecalho, projetos, posicoes, mandatos, formacao, contacto, ficheiros }
export * from './schema.ts'
export { IDIOMAS, LINGUAS, RAIZES, PADRAO } from './idiomas.ts'
export type { Idioma, Lingua } from './idiomas.ts'

/** Datas de modificação, do `git log`, congeladas em src/generated/stamps.json. */
export const datas: Record<string, string> = stamps

export const CANONICO = 'https://salgado.zip'
