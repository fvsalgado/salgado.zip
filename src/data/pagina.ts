import { cabecalho } from './cabecalho.ts'
import { t } from './formato.ts'
import { LINGUAS, RAIZES, type Idioma } from './idiomas.ts'

/**
 * O título, a descrição e as rotas equivalentes da página de arquivo, para a
 * língua pedida. Estavam escritos à mão em cada rota: com duas ainda eram
 * duas cópias, com quatro seriam quatro maneiras de a mesma frase divergir.
 */
export function paginaArquivo(idioma: Idioma) {
  const areas = t(cabecalho.areas, idioma)
  return {
    titulo: `${cabecalho.nome} — ${areas}`,
    descricao: `${cabecalho.nome} — ${areas}. ${t(cabecalho.linhas[0]!, idioma)}`,
    caminho: LINGUAS[idioma].raiz,
    alternos: RAIZES,
  }
}

/**
 * O mesmo, para a rota de um dossiê.
 *
 * Existe por duas razões que são a mesma. A fórmula estava copiada à letra nas
 * duas rotas de CV, e uma fórmula copiada é uma fórmula que diverge; e o que
 * ela dava era o título EXATO da página de arquivo, o que punha `/` e `/cv/`
 * com o mesmo `<title>` — dois separadores abertos e indistinguíveis, que é o
 * que o critério 2.4.2 existe para impedir.
 *
 * O «CV» vai à frente e não atrás porque um separador de browser corta o fim.
 * Um título que só se distingue na parte que não se lê não distingue nada.
 */
export function paginaDossie(idioma: Extract<Idioma, 'pt' | 'en'>) {
  const base = paginaArquivo(idioma)
  return {
    ...base,
    titulo: `CV — ${base.titulo}`,
    caminho: `${LINGUAS[idioma].raiz}cv/`,
  }
}
