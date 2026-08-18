import { Cabecalho, parse } from './schema.ts'

export const cabecalho = parse(Cabecalho, {
  nome: 'Fábio Salgado',
  cargo: {
    pt: 'Consultor de assuntos públicos',
    en: 'Public affairs consultant',
  },
  linhas: [
    {
      // Sem o nome: no arquivo entra como prefixo, no dossiê é o <h1>.
      pt: 'Consultor de assuntos públicos: regulação, relação institucional e comunicação com decisores públicos.',
      en: 'Public affairs consultant: regulation, institutional relations and communication with public decision-makers.',
    },
    {
      pt: 'Divido-me entre Alfama, em Lisboa, e Ribeira Branca, em Torres Novas. Nasci na Nazaré.',
      en: 'I split my time between Alfama, in Lisbon, and Ribeira Branca, in Torres Novas. I was born in Nazaré.',
    },
    {
      pt: 'Também produzo eventos de fado e construo os sites que estão em baixo.',
      en: 'I also produce fado events and build the sites listed below.',
    },
  ],
}, 'cabecalho')
