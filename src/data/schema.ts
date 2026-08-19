import { z } from 'zod'

/**
 * Texto traduzido. As quatro línguas são obrigatórias: chave em falta = erro
 * de build. Uma língua opcional é uma língua que fica a meio — a página
 * francesa acabaria com parágrafos em português no meio, e ninguém repara
 * até estar publicado.
 */
export const Lang = z.object({
  pt: z.string().min(1),
  en: z.string().min(1),
  fr: z.string().min(1),
  es: z.string().min(1),
})
export type Lang = z.infer<typeof Lang>

/** Período. `fim: null` significa "em curso". */
export const Periodo = z.object({
  inicio: z.string().regex(/^\d{4}(-\d{2})?$/, 'usa YYYY ou YYYY-MM'),
  fim: z.string().regex(/^\d{4}(-\d{2})?$/).nullable(),
})
export type Periodo = z.infer<typeof Periodo>

export const Estado = z.enum(['ativo', 'privado'])
export type Estado = z.infer<typeof Estado>

const Slug = z.string().regex(/^[a-z0-9-]+$/, 'slug em minúsculas, sem acentos')
const HttpsUrl = z.string().regex(/^https:\/\/[^\s]+$/, 'URL tem de começar por https://')

export const Cabecalho = z.object({
  nome: z.string().min(1),
  /** Os ofícios numa linha, para o <title>. */
  areas: Lang,
  /** A prosa por baixo do título. Duas a quatro linhas. */
  linhas: z.array(Lang).min(2).max(4),
  cargo: Lang,
})
export type Cabecalho = z.infer<typeof Cabecalho>

export const Projeto = z.object({
  id: Slug,
  /** O nome do nó na árvore. É o domínio, porque o arquivo lista domínios. */
  dominio: z.string().min(1),
  papel: Lang,
  estado: Estado,
  /**
   * `null` enquanto não estiver confirmado. Um período não confirmado não se
   * publica: é informação sobre o percurso de uma pessoa real, e uma data
   * errada num site que vai para candidaturas custa mais do que a data vale.
   */
  periodo: Periodo.nullable(),
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
  /** Repositório público, quando o código é aberto. */
  codigo: HttpsUrl.nullable().default(null),
  /** Ficheiro em public/shots/, ou `null`. */
  shot: z.string().regex(/^[a-z0-9-]+\.webp$/).nullable(),
})
export type Projeto = z.infer<typeof Projeto>

/**
 * Uma leitura em voz alta, publicada por outrem.
 *
 * O `titulo` fica fora do `Lang` de propósito: é o nome de uma peça publicada
 * com aquele nome, e traduzi-lo nas quatro páginas inventava obras que não
 * existem. O que se traduz é o que diz de onde saiu o texto, e o que foi meu.
 *
 * A `origem` continua a apontar à página do editor mesmo com o áudio alojado
 * aqui. O ficheiro nesta casa é uma cópia de arquivo, e uma cópia que esconde
 * de onde veio é uma cópia a fazer-se passar por original.
 *
 * Não há campo para o nome do ficheiro: é `${id}.mp3`, em public/voz/. Duas
 * chaves para a mesma coisa é uma a divergir da outra mais cedo ou mais tarde.
 */
export const Leitura = z.object({
  id: Slug,
  /** O título como foi publicado. Não traduz. */
  titulo: z.string().min(1),
  /** De quem é o texto. Nunca é de quem o lê — é esse o ponto deste campo. */
  autoria: z.string().min(1),
  /** A obra, o artigo ou a tradução de onde saiu. */
  fonte: Lang,
  /** O que foi meu nesta peça, e só isso. */
  papel: Lang,
  /** Data de publicação no editor, não do ficheiro: os mp3 foram todos
   *  remexidos numa migração de servidor em 2024 e trazem essa data. */
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'usa YYYY-MM-DD'),
  /** A página do editor: é a fonte, e é para onde vai quem quer o contexto. */
  origem: HttpsUrl,
  /** De onde a cópia veio, para se poder confrontar com o original. */
  origemAudio: HttpsUrl,
  /** Do ficheiro guardado. É o que prova que a cópia é a cópia. */
  sha256: z.string().regex(/^[0-9a-f]{64}$/, 'sha256 em minúsculas, 64 hex'),
})
export type Leitura = z.infer<typeof Leitura>

export const Posicao = z.object({
  id: Slug,
  cargo: Lang,
  organizacao: z.string().min(1),
  /**
   * O sítio da organização. Não aparece na página: serve o `worksFor` do
   * JSON-LD, que sem endereço não consegue ligar-me a uma empresa que o motor
   * de busca já conhece — e é essa ligação que faz de uma pessoa sem página na
   * Wikipédia uma entidade reconhecível.
   */
  organizacaoUrl: HttpsUrl.nullable().default(null),
  periodo: Periodo,
  /** Duas a quatro linhas: o que fizeste e com que resultado. */
  linhas: z.array(Lang).min(1).max(4),
})
export type Posicao = z.infer<typeof Posicao>

/**
 * Mandatos institucionais. Nó próprio, e não misturado com `percurso/`: são
 * cargos eletivos e não remunerados, e apresentá-los ao lado de empregos sem
 * os distinguir lê-se como currículo inflacionado.
 */
export const Mandato = z.object({
  id: Slug,
  cargo: Lang,
  organizacao: z.string().min(1),
  periodo: Periodo,
  linhas: z.array(Lang).max(2).default([]),
})
export type Mandato = z.infer<typeof Mandato>

export const Formacao = z.object({
  id: Slug,
  curso: Lang,
  instituicao: z.string().min(1),
  periodo: Periodo,
})
export type Formacao = z.infer<typeof Formacao>

export const Idioma = z.object({
  lingua: Lang,
  nivel: Lang,
})
export type IdiomaFalado = z.infer<typeof Idioma>

/**
 * Um lugar no mapa. Graus decimais, WGS 84 — a mesma convenção que qualquer
 * mapa aceita colado na caixa de pesquisa.
 */
export const Lugar = z.object({
  nome: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
})
export type Lugar = z.infer<typeof Lugar>

export const Contacto = z.object({
  /** `null` até estar confirmado. `verify.mjs` falha enquanto o for. */
  email: z.email().nullable(),
  linkedin: HttpsUrl.nullable(),
  /** Onde se está, para ler. Pode ser mais do que um sítio. */
  concelho: Lang,
  /** De onde se é. Não é a mesma pergunta. */
  naturalidade: Lang,
  /**
   * O ano de nascimento. É o único número da casa que o build não consegue
   * derivar de nada — não há ficheiro nem commit de onde o tirar —, e por isso
   * vive aqui, escrito uma vez, e não repetido em cada sítio onde aparece.
   *
   * Serve duas coisas: a linha de totais, e o `birthDate` do JSON-LD. A
   * segunda é a que interessa mais do que parece — há vários Fábio Salgado na
   * web, e uma data de nascimento com um lugar ao lado é o que diz a um motor
   * de busca qual deles é este.
   */
  nascimento: z.string().regex(/^\d{4}$/, 'usa YYYY'),
  /** A linha que abre o nó de contacto. É o convite, sem o dizer. */
  nota: Lang,
  /**
   * Região em forma canónica, só para o JSON-LD e o resume.json. Os dados
   * estruturados querem um nome de região, não a frase que se lê no ecrã.
   */
  regiao: z.string().min(1),
  /** Os lugares do rodapé, por ordem biográfica. Sem eles, o rodapé não os inventa. */
  lugares: z.array(Lugar).default([]),
  idiomas: z.array(Idioma).default([]),
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
