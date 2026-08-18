import { Projeto, parse } from './schema.ts'

/**
 * Regra de enquadramento: descreve-se o que o produto faz, não quem o usa.
 * Vale para todos, e para o Travertina em particular — entra como plataforma
 * de gestão com módulos e integrações, a mesma linguagem com que se
 * descreveria um projeto entregue a terceiros. É despersonalização, não
 * invenção: o papel continua a ser autor e em lado nenhum se afirma ou
 * insinua um cliente que não existe.
 *
 * `periodo: null` em todos: os anos ainda não estão confirmados e não se
 * publicam por adivinhação. Entram quando o percurso entrar.
 */
export const projetos = parse(Projeto.array().min(1), [
  {
    id: 'primeiraplateia',
    dominio: 'primeiraplateia.pt',
    papel: { pt: 'fundador, criador', en: 'founder, maker' },
    estado: 'ativo',
    periodo: null,
    linha: {
      pt: 'Agregador de eventos culturais em Portugal: teatros, salas de concerto, museus, cinemas.',
      en: 'Aggregator of cultural events in Portugal: theatres, concert halls, museums, cinemas.',
    },
    detalhe: [
      {
        pt: 'Filtros por dia, por eventos gratuitos e por acessibilidade; seguir artistas e salas; newsletter semanal.',
        en: 'Filters by day, by free admission and by accessibility; follow artists and venues; weekly newsletter.',
      },
      { pt: 'Código público.', en: 'Public source code.' },
    ],
    stack: [],
    url: 'https://primeiraplateia.pt',
    shot: 'primeiraplateia.webp',
  },
  {
    id: 'onofriana',
    dominio: 'onofriana.pt',
    papel: { pt: 'cofundador, produtor', en: 'co-founder, producer' },
    estado: 'ativo',
    periodo: null,
    linha: {
      pt: 'Curadoria, produção e programação de fado.',
      en: 'Fado curation, production and programming.',
    },
    detalhe: [
      {
        pt: 'O nome vem de Maria Severa Onofriana. Quatro formatos: Severa, Mariquinhas, Guitarradas e Vimioso.',
        en: 'Named after Maria Severa Onofriana. Four formats: Severa, Mariquinhas, Guitarradas and Vimioso.',
      },
      { pt: 'Curadoria artística de Marta Rosa.', en: 'Artistic curation by Marta Rosa.' },
    ],
    stack: [],
    url: 'https://onofriana.pt',
    shot: 'onofriana.webp',
  },
  {
    id: 'franciscasalgado',
    dominio: 'franciscasalgado.golf',
    papel: { pt: 'autor', en: 'author' },
    estado: 'ativo',
    periodo: null,
    linha: {
      pt: 'Site de atleta: época a época, rankings WAGR e europeu, parcerias, imprensa e WITB.',
      en: 'Athlete site: season by season, WAGR and European rankings, partnerships, press and WITB.',
    },
    detalhe: [],
    stack: [],
    url: 'https://franciscasalgado.golf',
    shot: 'franciscasalgado.webp',
  },
  {
    id: 'martarosa',
    dominio: 'martarosa.pt',
    papel: { pt: 'autor', en: 'author' },
    estado: 'ativo',
    periodo: null,
    linha: {
      pt: 'Fadista, viola de fado e letrista. Agenda, discografia, press kit e booking.',
      en: 'Fado singer, fado viola player and lyricist. Calendar, discography, press kit and booking.',
    },
    detalhe: [],
    stack: [],
    url: 'https://martarosa.pt',
    shot: 'martarosa.webp',
  },
  {
    id: 'travertina',
    dominio: 'travertina.casa',
    papel: { pt: 'autor', en: 'author' },
    estado: 'privado',
    periodo: null,
    linha: {
      pt: 'Plataforma de gestão por módulos: agenda e tarefas, ativos e manutenção, orçamentos e despesa, e um CRM de microempresa com contactos, propostas e faturação.',
      en: 'Modular management platform: calendar and tasks, assets and maintenance, budgets and spending, plus a micro-business CRM with contacts, proposals and invoicing.',
    },
    detalhe: [
      {
        pt: 'Integrações por API com serviços externos, automações e alertas.',
        en: 'API integrations with external services, automations and alerts.',
      },
      {
        pt: 'Aplicação privada, atrás de autenticação. Sem ligação e sem captura: um ecrã de acesso não mostra nada e os registos reais não se mostram.',
        en: 'Private application, behind authentication. No link and no screenshot: a login screen shows nothing, and real records are not shown.',
      },
    ],
    stack: ['Vite', 'Supabase (RLS)', 'PWA offline-first'],
    url: null,
    shot: null,
  },
], 'projetos')
