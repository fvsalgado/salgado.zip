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
    periodo: { inicio: '2007-10', fim: '2015-09' },
    linhas: [
      // A idade é derivada do ano de nascimento, confirmado pelo Fábio; a data
      // completa fica de fora, que é dado de identidade e não de percurso.
      {
        pt: 'Eleito aos 21 anos, para dois mandatos consecutivos.',
        en: 'Elected at 21, for two consecutive terms.',
      },
    ],
  },
], 'mandatos')
