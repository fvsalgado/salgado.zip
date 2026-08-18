import { Cabecalho, parse } from './schema.ts'

export const cabecalho = parse(Cabecalho, {
  nome: 'Fábio Salgado',
  cargo: {
    pt: 'Consultor de assuntos públicos',
    en: 'Public affairs consultant',
  },
  /** Para o <title> e pouco mais. O cargo fica para o JSON-LD. */
  areas: {
    pt: 'políticas públicas, cultura e produtos digitais',
    en: 'public policy, culture and digital products',
  },
  linhas: [
    {
      // Sem o nome: no arquivo entra como prefixo, no dossiê é o <h1>.
      pt: 'Trabalho entre políticas públicas, produção cultural e produtos digitais.',
      en: 'I work across public policy, cultural production and digital products.',
    },
    {
      pt: 'Divido-me entre Alfama, em Lisboa, e Ribeira Branca, em Torres Novas. Nasci na Nazaré.',
      en: 'I split my time between Alfama, in Lisbon, and Ribeira Branca, in Torres Novas. I was born in Nazaré.',
    },
    {
      pt: 'Construo em par com o Claude — este site incluído. Está tudo listado em baixo.',
      en: 'I build in pair with Claude — this site included. Everything is listed below.',
    },
  ],
}, 'cabecalho')
