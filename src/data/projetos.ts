import { Projeto, parse } from './schema.ts'

/**
 * Regra de enquadramento: descreve-se o que o produto faz, não quem o usa.
 * Vale para todos, e para o Travertina em particular — entra como plataforma
 * de gestão com módulos e integrações, a mesma linguagem com que se
 * descreveria um projeto entregue a terceiros. É despersonalização, não
 * invenção: o papel continua a ser autor e em lado nenhum se afirma ou
 * insinua um cliente que não existe.
 *
 * O `papel` separa as duas dimensões, porque não são a mesma coisa e a
 * distinção é o que interessa a quem lê: no Primeira Plateia e no Onofriana
 * ele funda e gere o projeto além de construir o produto; nos outros três
 * construiu o produto e mais nada.
 *
 * `periodo: null` significa ano por confirmar. Não se publica por adivinhação:
 * são datas do percurso de uma pessoa real, num site que vai para
 * candidaturas. A verificação 14 bloqueia enquanto houver algum por confirmar.
 */
export const projetos = parse(Projeto.array().min(1), [
  {
    id: 'primeiraplateia',
    dominio: 'primeiraplateia.pt',
    papel: { pt: 'fundador e criador · produto', en: 'founder and maker · product' },
    estado: 'ativo',
    periodo: { inicio: '2016-11', fim: null },
    linha: {
      pt: 'Agregador de eventos culturais em Portugal: teatros, salas de concerto, museus, cinemas.',
      en: 'Aggregator of cultural events in Portugal: theatres, concert halls, museums, cinemas.',
    },
    detalhe: [
      {
        pt: 'Filtros por dia, por eventos gratuitos e por acessibilidade; seguir artistas e salas; newsletter semanal.',
        en: 'Filters by day, by free admission and by accessibility; follow artists and venues; weekly newsletter.',
      },
      {
        pt: 'Nasceu em 2016 como EmCena.pt, agenda de teatro de Lisboa. Renomeado e reanimado em 2026, agora de âmbito nacional.',
        en: 'Started in 2016 as EmCena.pt, a Lisbon theatre listing. Renamed and relaunched in 2026, now nationwide.',
      },
      {
        pt: 'Duas dimensões: fundar e gerir o projeto, e construir o produto.',
        en: 'Two dimensions: founding and running the project, and building the product.',
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
    papel: { pt: 'cofundador e produtor · site', en: 'co-founder and producer · site' },
    estado: 'ativo',
    periodo: { inicio: '2026-07', fim: null },
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
      {
        pt: 'Duas dimensões: cofundar e produzir a programação, e construir o site.',
        en: 'Two dimensions: co-founding and producing the programme, and building the site.',
      },
    ],
    stack: [],
    url: 'https://onofriana.pt',
    shot: 'onofriana.webp',
  },
  {
    id: 'franciscasalgado',
    dominio: 'franciscasalgado.golf',
    papel: { pt: 'autor do site', en: 'site author' },
    estado: 'ativo',
    periodo: { inicio: '2026', fim: null },
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
    papel: { pt: 'autor do site', en: 'site author' },
    estado: 'ativo',
    periodo: { inicio: '2026', fim: null },
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
    papel: { pt: 'autor do produto', en: 'product author' },
    estado: 'privado',
    periodo: { inicio: '2026', fim: null },
    linha: {
      pt: 'Aplicação de gestão por módulos, com mais de vinte áreas: agenda, tarefas e calendário; contactos, contratos e alojamento; carteira, cash-flow, crédito, consumos e obrigações fiscais; compras e transportes.',
      en: 'Modular management application spanning more than twenty areas: calendar, tasks and agenda; contacts, contracts and lodging; wallet, cash flow, credit, utilities and tax obligations; shopping and transport.',
    },
    detalhe: [
      {
        pt: 'Módulo de gestão de obra: capítulos por fase, orçamento contra pago em burndown, registo de despesa e fichas por divisão.',
        en: 'Construction module: chapters by phase, budget-versus-paid burndown, expense logging and per-room sheets.',
      },
      {
        pt: 'Integrações por API com serviços externos, incluindo avisos meteorológicos e de risco de incêndio, com automações e alertas.',
        en: 'API integrations with external services, including weather and wildfire-risk warnings, with automations and alerts.',
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
