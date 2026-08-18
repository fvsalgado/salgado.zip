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
  // O nome é o <h1> e `areas` é a linha de ofício por baixo — a abertura que o
  // cartão social já fazia bem. As linhas abaixo são a prosa, não o título.
  linhas: [
    {
      pt: 'Acompanho processos legislativos, produzo espetáculos de fado e faço os sites e os produtos que assino.',
      en: 'I follow legislative processes, produce fado shows, and make the sites and products I put my name to.',
    },
    {
      pt: 'Divido-me entre Alfama, em Lisboa, e Ribeira Branca, em Torres Novas. Nasci na Nazaré.',
      en: 'I split my time between Alfama, in Lisbon, and Ribeira Branca, in Torres Novas. I was born in Nazaré.',
    },
    {
      pt: 'Construo a meias com o Claude — este site incluído. Está tudo listado em baixo.',
      en: 'I build together with Claude — this site included. Everything is listed below.',
    },
  ],
}, 'cabecalho')
