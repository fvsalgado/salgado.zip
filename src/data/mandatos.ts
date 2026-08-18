import { Mandato, parse } from './schema.ts'

/**
 * Uma linha por mandato, e não zero: dois cargos eleitos são a prova mais
 * antiga de «sala onde se decide» que há neste arquivo, e uma entrada vazia
 * num sítio com tão pouco texto é prova deitada fora.
 *
 * Só os cargos institucionais eleitos. O LinkedIn tem mais voluntariado, e a
 * decisão de o publicar ou não é do Fábio: num site que vai para candidaturas
 * em assuntos públicos, o associativismo político sinaliza alinhamento e isso
 * corta para os dois lados. Estes dois entram porque mostram experiência do
 * lado de quem decide, que é o que o cargo pede.
 */
/**
 * Nascimento, com a granularidade mínima que serve o cálculo: ano e mês, a
 * mesma de todos os períodos deste sítio.
 *
 * O dia não acrescenta nada ao que se publica — a idade sai igual sem ele — e
 * acrescenta bastante a quem queira passar por outra pessoa: nome completo mais
 * data de nascimento exata é o par que abre contas. Guarda-se o mínimo,
 * publica-se o derivado, e a verificação 16 confirma que nem esta linha nem o
 * ano em bruto chegam a sair para lado nenhum.
 */
const NASCIMENTO = '1986-04'

/** Anos completos à data indicada. */
function idadeEm(iso: string): number {
  const [anoN, mesN] = NASCIMENTO.split('-').map(Number) as [number, number]
  const [ano, mes] = iso.split('-').map(Number) as [number, number]
  return ano - anoN - (mes < mesN ? 1 : 0)
}

/** Mandatos autárquicos completos, de quatro anos cada. */
function mandatosEntre(inicio: string, fim: string): number {
  const meses =
    (Number(fim.slice(0, 4)) - Number(inicio.slice(0, 4))) * 12 +
    (Number(fim.slice(5, 7)) - Number(inicio.slice(5, 7)))
  return Math.round(meses / 48)
}

/**
 * Um número derivado continua derivado escrito por extenso, e «dois mandatos»
 * é português onde «2 mandatos» é um formulário.
 */
const EXTENSO: Record<'pt' | 'en', readonly string[]> = {
  pt: ['zero', 'um', 'dois', 'três', 'quatro', 'cinco'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five'],
}
const extenso = (n: number, l: 'pt' | 'en') => EXTENSO[l][n] ?? String(n)

const NAZARE = { inicio: '2007-10', fim: '2015-09' }

export const mandatos = parse(Mandato.array(), [
  {
    id: 'santa-maria-maior',
    cargo: { pt: 'Membro', en: 'Member' },
    organizacao: 'Assembleia de Freguesia de Santa Maria Maior, Lisboa',
    periodo: { inicio: '2017-10', fim: '2021-09' },
    linhas: [
      {
        pt: 'A freguesia do centro histórico de Lisboa — Alfama incluída.',
        en: "The parish of Lisbon's historic centre — Alfama included.",
      },
    ],
  },
  {
    id: 'assembleia-nazare',
    cargo: { pt: 'Deputado Municipal', en: 'Municipal Assembly Deputy' },
    organizacao: 'Assembleia Municipal da Nazaré',
    periodo: NAZARE,
    linhas: [
      {
        pt: `Eleito aos ${idadeEm(NAZARE.inicio)} anos, para ${extenso(mandatosEntre(NAZARE.inicio, NAZARE.fim), 'pt')} mandatos consecutivos.`,
        en: `Elected at ${idadeEm(NAZARE.inicio)}, for ${extenso(mandatosEntre(NAZARE.inicio, NAZARE.fim), 'en')} consecutive terms.`,
      },
    ],
  },
], 'mandatos')
