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
 * Bytes e duração de cada gravação, medidos por scripts/voz.mjs sobre os
 * ficheiros reais. Nada aqui é escrito à mão — nem a duração, que sai do
 * cabeçalho Xing do mp3 ou da caixa `mvhd` do mp4, nem as dimensões, que saem
 * da `tkhd`.
 *
 * `largura` e `altura` só existem no vídeo. São opcionais no tipo porque são
 * opcionais no ficheiro: quem as ler num áudio tem de o dizer no código.
 */
export const medidasVoz: Record<
  string,
  { bytes: number; segundos: number; largura?: number; altura?: number }
> = medidas
