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
      pt: 'Baseado no Médio Tejo.',
      en: 'Based in Médio Tejo, Portugal.',
    },
    {
      pt: 'Também produzo eventos de fado e construo os sites que estão em baixo.',
      en: 'I also produce fado events and build the sites listed below.',
    },
  ],
}, 'cabecalho')
