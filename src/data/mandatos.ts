import { Mandato, parse } from './schema.ts'

/**
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
    linhas: [],
  },
  {
    id: 'assembleia-nazare',
    cargo: { pt: 'Deputado Municipal', en: 'Municipal Assembly deputy' },
    organizacao: 'Assembleia Municipal da Nazaré',
    periodo: { inicio: '2007-10', fim: '2015-09' },
    linhas: [],
  },
], 'mandatos')
