import { z } from 'zod'

/**
 * Texto bilingue.
 *
 * `en` é opcional na fase 5. Na fase 6 remove-se o `.optional()` e o `build`
 * enumera, com caminho exato, todas as chaves por traduzir. O EN nunca é um
 * refactor — é uma lista de erros a resolver.
 */
export const Lang = z.object({
  pt: z.string().min(1),
  en: z.string().min(1).optional(),
})
export type Lang = z.infer<typeof Lang>

/** Período. `fim: null` significa "em curso". */
export const Periodo = z.object({
  inicio: z.string().regex(/^\d{4}(-\d{2})?$/, 'usa YYYY ou YYYY-MM'),
  fim: z.string().regex(/^\d{4}(-\d{2})?$/).nullable(),
})
export type Periodo = z.infer<typeof Periodo>

export const Estado = z.enum(['ativo', 'arquivado', 'privado'])
export type Estado = z.infer<typeof Estado>

const Slug = z.string().regex(/^[a-z0-9-]+$/, 'slug em minúsculas, sem acentos')
const HttpsUrl = z.string().regex(/^https:\/\/[^\s]+$/, 'URL tem de começar por https://')

export const Cabecalho = z.object({
  nome: z.string().min(1),
  /** Três linhas em prosa. Quem és → o que fazes → onde estás e o que procuras. */
  linhas: z.array(Lang).min(3).max(3),
  cargo: Lang,
})
export type Cabecalho = z.infer<typeof Cabecalho>

export const Projeto = z.object({
  id: Slug,
  /** O nome do nó na árvore. É o domínio, porque o arquivo lista domínios. */
  dominio: z.string().min(1),
  papel: Lang,
  estado: Estado,
  periodo: Periodo,
  linha: Lang,
  /** Parágrafos extra, só visíveis no nó expandido e no dossiê. */
  detalhe: z.array(Lang).default([]),
  /**
   * A stack vive aqui dentro, nunca numa coluna do nível superior: uma coluna
   * de stack na listagem é a causa direta da leitura "programador com
   * passatempos culturais".
   */
  stack: z.array(z.string().min(1)).default([]),
  /** `null` em projetos privados. Sem ligação, sem captura. */
  url: HttpsUrl.nullable(),
  /** Ficheiro em public/shots/, ou `null`. */
  shot: z.string().regex(/^[a-z0-9-]+\.webp$/).nullable(),
})
export type Projeto = z.infer<typeof Projeto>

export const Posicao = z.object({
  id: Slug,
  cargo: Lang,
  organizacao: z.string().min(1),
  periodo: Periodo,
  /** Duas a quatro linhas: o que fizeste e com que resultado. */
  linhas: z.array(Lang).min(1).max(4),
})
export type Posicao = z.infer<typeof Posicao>

export const Formacao = z.object({
  id: Slug,
  curso: Lang,
  instituicao: z.string().min(1),
  periodo: Periodo,
})
export type Formacao = z.infer<typeof Formacao>

export const Contacto = z.object({
  /** `null` até estar confirmado. `verify.mjs` falha enquanto o for. */
  email: z.email().nullable(),
  linkedin: HttpsUrl.nullable(),
  concelho: Lang,
})
export type Contacto = z.infer<typeof Contacto>

/**
 * Falha o build com o caminho exato da chave em falta, em vez do despejo
 * ilegível do zod.
 */
export function parse<T extends z.ZodType>(schema: T, valor: unknown, origem: string): z.infer<T> {
  const r = schema.safeParse(valor)
  if (r.success) return r.data
  const linhas = r.error.issues.map((i) => `  ${origem}${i.path.length ? '.' + i.path.join('.') : ''}: ${i.message}`)
  throw new Error(`Conteúdo inválido em ${origem}\n${linhas.join('\n')}`)
}
