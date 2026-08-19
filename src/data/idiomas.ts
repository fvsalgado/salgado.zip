/**
 * As línguas do sítio, num sítio só.
 *
 * A página existe em quatro; os documentos, não. O CV em PDF continua a sair
 * em português e em inglês — é o que se envia numa candidatura, e um PDF por
 * língua que ninguém pede é papel a mais para manter afinado. O francês e o
 * espanhol servem quem lê a página, e a página leva tudo.
 *
 * Tudo o que distingue uma língua da outra — o rótulo, o `lang` do HTML, o
 * locale para o Intl, o `og:locale` e a raiz da rota — vive aqui. Quem
 * acrescentar uma quinta mexe neste ficheiro e nas traduções, e em mais nada.
 */
export const IDIOMAS = ['pt', 'en', 'fr', 'es'] as const
export type Idioma = (typeof IDIOMAS)[number]

/** A língua da raiz: também é o `x-default` e a que o LEIA-ME.txt fala. */
export const PADRAO: Idioma = 'pt'

export interface Lingua {
  /**
   * O nome da língua na própria língua. Ninguém procura «Portuguese» num menu.
   *
   * Tudo em minúsculas, incluindo o inglês. A ortografia inglesa pedia
   * «English» com maiúscula, mas o alternador é uma linha de mono ao lado da
   * marca — e uma palavra em maiúscula no meio de três em minúscula lê-se como
   * destaque de uma língua sobre as outras, que é exatamente o que não é.
   */
  etiqueta: string
  /** O atributo `lang` do documento e o `hreflang` das alternativas. */
  html: string
  /** Locale completo para o Intl: datas e milhares agrupam-se por país. */
  bcp47: string
  og: string
  /** A raiz da rota. O português fica na raiz do domínio, as outras num prefixo. */
  raiz: string
}

export const LINGUAS: Record<Idioma, Lingua> = {
  pt: { etiqueta: 'português', html: 'pt-PT', bcp47: 'pt-PT', og: 'pt_PT', raiz: '/' },
  en: { etiqueta: 'english', html: 'en', bcp47: 'en-GB', og: 'en_GB', raiz: '/en/' },
  fr: { etiqueta: 'français', html: 'fr', bcp47: 'fr-FR', og: 'fr_FR', raiz: '/fr/' },
  es: { etiqueta: 'español', html: 'es', bcp47: 'es-ES', og: 'es_ES', raiz: '/es/' },
}

/** As rotas equivalentes, para o hreflang e para o alternador de língua. */
export const RAIZES: Record<Idioma, string> = Object.fromEntries(
  IDIOMAS.map((i) => [i, LINGUAS[i].raiz])
) as Record<Idioma, string>
