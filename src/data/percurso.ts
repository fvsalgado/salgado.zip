import { Posicao, Formacao, parse } from './schema.ts'

/**
 * Fonte: exportar o perfil do LinkedIn em PDF (Mais → Guardar como PDF no
 * próprio perfil) ou escrever de memória. Não tentar leitura automática.
 *
 * Por posição: cargo, organização, período, duas a quatro linhas do que
 * fizeste e com que resultado. Clientes apenas onde a relação é pública.
 *
 * Vazio por agora — `verify.mjs` (verificação 14) falha enquanto o for.
 */
export const posicoes = parse(Posicao.array(), [], 'percurso.posicoes')

export const formacao = parse(Formacao.array(), [], 'percurso.formacao')
