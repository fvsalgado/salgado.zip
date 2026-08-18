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
      /**
       * Só a idade, e «tomou posse» em vez de «eleito».
       *
       * As autárquicas foram em 2005, 2009 e 2013: outubro de 2007 não é
       * eleição nenhuma, e setembro de 2015 também não. O período confirmado
       * — 2007-10 a 2015-09 — começa e acaba a meio de mandatos e sobrepõe-se
       * a três, não a dois. Dizer «eleito» ou contar mandatos era acrescentar
       * duas afirmações por cima de uma data, e ambas convidavam à
       * verificação que falha. A idade é aritmética e aguenta-se sozinha.
       */
      {
        pt: `Tomou posse aos ${idadeEm(NAZARE.inicio)} anos.`,
        en: `Took office at ${idadeEm(NAZARE.inicio)}.`,
      },
    ],
  },
], 'mandatos')
