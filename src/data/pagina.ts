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
