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
  /**
   * De quem é a peça: o texto, nas leituras; quem a produziu, nos vídeos.
   * Nunca é de quem lhe põe a voz — é esse o ponto deste campo.
   */
  autoria: z.string().min(1),
  /** A obra, o artigo ou a tradução de onde saiu. */
  fonte: Lang,
  /** O que foi meu nesta peça, e só isso. */
  papel: Lang,
  /**
   * A rubrica onde saiu, quando há uma, e quem a publicou.
   *
   * Estavam numa constante do módulo, o que funcionou enquanto tudo era do
   * Alta Voz — e passou a mentir no dia em que entraram dois vídeos de outra
   * casa, que apareciam na página com a rubrica do podcast por baixo.
   */
  rubrica: z.string().nullable().default(null),
  editor: z.string().min(1),
  /**
   * Áudio, vídeo, ou uma leitura de que só há a memória e as fotografias.
   *
   * O nó chama-se `voz/` e não `audio/` de propósito: o que o junta é a voz,
   * não o contentor — e uma leitura em palco é voz tanto como um mp3. O
   * `formato` decide a extensão do ficheiro em public/voz/ e se a página monta
   * um `<audio>`, um `<video>`, ou nenhum dos dois.
   *
   * Em `presencial` não há ficheiro para medir nem para verificar, e é por isso
   * que o `sha256` deixa de ser obrigatório — ver o `superRefine` no fim.
   */
  formato: z.enum(['audio', 'video', 'presencial']).default('audio'),
  /**
   * Data de publicação no editor, não do ficheiro: os mp3 foram todos remexidos
   * numa migração de servidor em 2024 e trazem essa data.
   *
   * Aceita ano só. Das nove leituras sei o dia, porque a página do esquerda.net
   * o diz; dos dois vídeos sei o ano, e escrever um dia inventado para o campo
   * ficar bonito era pior do que publicar o que se sabe.
   */
  data: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'usa YYYY, YYYY-MM ou YYYY-MM-DD'),
  /**
   * A casa e a morada onde a leitura aconteceu. Só nas presenciais: numa
   * gravação o sítio onde se gravou não é facto publicado em lado nenhum, e
   * escrevê-lo era inventar.
   */
  local: z.string().min(1).nullable().default(null),
  /** A página do editor: é a fonte, e é para onde vai quem quer o contexto. */
  origem: HttpsUrl,
  /**
   * De onde a cópia veio, para se poder confrontar com o original. `null`
   * quando não há endereço direto — os dois vídeos vieram da página, que só
   * serve o ficheiro a quem tem sessão iniciada.
   */
  origemAudio: HttpsUrl.nullable().default(null),
  /**
   * Do ficheiro guardado. É o que prova que a cópia é a cópia. `null` só nas
   * leituras presenciais, onde não há ficheiro nenhum para provar.
   */
  sha256: z
    .string()
    .regex(/^[0-9a-f]{64}$/, 'sha256 em minúsculas, 64 hex')
    .nullable()
    .default(null),
  /**
   * A capa da edição de onde saiu o texto, ou `null`.
   *
   * Só existe onde a edição é a que está creditada em `fonte` — a do Galeano é
   * a da tradução de Nepomuceno e Brito, e não uma capa espanhola qualquer com
   * o mesmo título. Onde não houver a edição certa fica `null`: uma capa errada
   * é uma citação errada, e vale menos do que capa nenhuma.
   *
   * Aparece na listagem e na página. Não entra nos CV: um currículo com capas
   * de livros de outros lê-se como se os livros fossem meus.
   *
   * Ficheiro e obra andam juntos num objeto porque um sem o outro não serve:
   * sem o nome da obra, o texto alternativo teria de usar o `titulo` da
   * entrada — e «Futebol: As origens» é o capítulo, não o livro que está na
   * imagem. Quem não vê a capa merece saber de que livro ela é.
   */
  capa: z
    .object({
      /** Em public/capas/. */
      ficheiro: z.string().regex(/^[a-z0-9-]+\.webp$/),
      /** O título da obra que a imagem mostra, como está na capa. */
      obra: z.string().min(1),
    })
    .nullable()
    .default(null),
  /**
   * O que sobrou da leitura, em public/voz/, por ordem de importância.
   *
   * Só as presenciais as têm: nas gravações o que há para mostrar é o ficheiro.
   * A primeira ilustra a linha fechada; todas aparecem dentro do nó, porque
   * numa leitura sem gravação a imagem não é enfeite — é o registo.
   *
   * Podem faltar. Havia aqui uma regra a exigir pelo menos uma, com o argumento
   * de que uma presencial sem imagens «não tem o que mostrar» — e a regra
   * confundia duas coisas. O que uma entrada tem de ter é como ser verificada
   * por outra pessoa, e disso trata a `origem`, que é obrigatória em todas. A
   * imagem é como aquilo se via, não é a prova de que aconteceu: a noite no
   * Sagrada Família não tem cartaz à mão e tem uma crítica assinada e publicada
   * — a prova mais forte de todo o nó.
   *
   * Chama-se `imagens` e não `fotos` porque nem todas o são: há fotografias de
   * quem lá esteve a fotografar, e há cartazes, que são de quem organizou.
   *
   * Cada uma leva crédito próprio e obrigatório. Publicar o trabalho de um
   * fotógrafo sem o nome dele é o que esta casa recusa fazer aos autores dos
   * textos, e um cartaz sem dono lê-se como se fosse meu. Onde não se sabe o
   * nome de quem desenhou, credita-se a casa que o publicou — que é o que se
   * sabe, e é verificável no próprio cartaz.
   */
  imagens: z
    .array(
      z.object({
        /** Em public/voz/, ao lado das gravações. */
        ficheiro: z.string().regex(/^[a-z0-9-]+\.webp$/),
        /** O que se vê. Não é o crédito: é para quem não vê a imagem. */
        alt: Lang,
        /** «Fotografia de Fulano», «Cartaz de Sicrano». A linha inteira. */
        credito: z.string().min(1),
      })
    )
    .default([]),
})
  /**
   * O que cada formato obriga. Sem isto, uma entrada presencial passava sem
   * fotografias — e uma gravação passava sem `sha256`, que é a única coisa que
   * prova que o ficheiro guardado é o ficheiro publicado.
   */
  .superRefine((l, ctx) => {
    const erro = (message: string, path: string[]) => ctx.addIssue({ code: 'custom', message, path })
    if (l.formato === 'presencial') {
      if (l.sha256 !== null) erro('leitura presencial não tem ficheiro, logo não tem sha256', ['sha256'])
      if (l.origemAudio !== null) erro('leitura presencial não tem ficheiro para descarregar', ['origemAudio'])
      if (l.local === null) erro('uma leitura presencial aconteceu nalgum sítio', ['local'])
    } else {
      if (l.sha256 === null) erro('uma gravação tem de trazer o sha256 do ficheiro', ['sha256'])
      if (l.imagens.length > 0) erro('as imagens são só das leituras presenciais', ['imagens'])
      if (l.local !== null) erro('o local é só das leituras presenciais', ['local'])
    }
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
   *
   * Só é lido para o cargo atual, porque `worksFor` é presente do indicativo.
   * Nos cargos passados fica como registo — não há em schema.org um campo para
   * «trabalhou aqui», e pôr um antigo emprego em `affiliation` diria a uma
   * máquina que ainda lá estou.
   */
  organizacaoUrl: HttpsUrl.nullable().default(null),
  /**
   * Marca da organização em public/logos/, ou `null`. Só existe onde houve um
   * ficheiro de proveniência limpa: o da Câmara é domínio público e vem da
   * página de identidade gráfica do próprio município; o da ATREVIA e o do
   * Bartô são os logótipos das casas, usados aqui para as identificar como
   * empregadores.
   *
   * Todos são transparentes e monocromáticos: é isso que lhes permite inverter
   * no tema escuro sem um segundo desenho. No Bartô, a cor foi separada para
   * um ficheiro próprio — ver `logoCor`.
   */
  logo: z.string().regex(/^[a-z0-9-]+\.webp$/).nullable().default(null),
  /**
   * A camada a cores da marca, em public/logos/, ou `null`.
   *
   * O `invert(1)` que serve as marcas monocromáticas roda a matiz: no Bartô, o
   * chapéu vermelho saía ciano. E os filtros do CSS não desfazem isso — o
   * `hue-rotate(180deg)` a seguir ao `invert` é uma aproximação linear e devolve
   * um rosa lavado, não o vermelho.
   *
   * Por isso a marca vem partida em duas: o `logo` leva só o traço a preto e
   * inverte com o tema; este leva só a cor e nunca inverte. Os dois são
   * exportados da mesma origem, com a mesma caixa e as mesmas dimensões, e
   * ficam sobrepostos — o registo é exato porque a geometria é a mesma.
   */
  logoCor: z.string().regex(/^[a-z0-9-]+\.webp$/).nullable().default(null),
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
