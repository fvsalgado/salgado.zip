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
      pt: 'A agenda cultural de Portugal num sítio só: teatros, salas de concerto, museus e cinemas.',
      en: "Portugal's cultural agenda in one place: theatres, concert halls, museums and cinemas.",
    },
    detalhe: [
      {
        pt: 'Filtros por dia, por entrada livre e por acessibilidade. Seguir artistas e salas. Newsletter semanal.',
        en: 'Filter by day, by free admission and by accessibility. Follow artists and venues. Weekly newsletter.',
      },
      {
        pt: 'Nasceu em 2016 como EmCena.pt, agenda de teatro de Lisboa. Renomeado e relançado em 2026, agora de âmbito nacional.',
        en: 'Born in 2016 as EmCena.pt, a Lisbon theatre listing. Renamed and relaunched in 2026, now nationwide.',
      },
      {
        pt: 'Fundei-o, giro-o e construí-o. Código público.',
        en: 'I founded it, I run it, I built it. Public source code.',
      },
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
      pt: 'Fado: curadoria, produção e programação de espetáculos.',
      en: 'Fado: curation, production and programming.',
    },
    detalhe: [
      {
        pt: 'O nome vem de Maria Severa Onofriana. Quatro formatos: Severa, Mariquinhas, Guitarradas e Vimioso.',
        en: 'Named after Maria Severa Onofriana. Four formats: Severa, Mariquinhas, Guitarradas and Vimioso.',
      },
      { pt: 'Curadoria artística de Marta Rosa.', en: 'Artistic curation by Marta Rosa.' },
      {
        pt: 'Cofundei-o e produzo-o; o site também é meu.',
        en: 'I co-founded it and I produce it; the site is mine too.',
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
      pt: 'O percurso de uma atleta de golfe, época a época: rankings WAGR e europeu, parcerias, imprensa e WITB.',
      en: "A golfer's path, season by season: WAGR and European rankings, partnerships, press and WITB.",
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
      pt: 'O sítio de uma fadista que escreve o que canta: agenda, discografia, press kit e booking.',
      en: 'The site of a fado singer who writes what she sings: calendar, discography, press kit and booking.',
    },
    detalhe: [
      { pt: 'Voz, viola de fado e letra própria.', en: 'Voice, fado viola, and her own lyrics.' },
    ],
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
      pt: 'Uma casa gerida como uma empresa: agenda e tarefas, contactos e contratos, carteira e cash-flow, crédito, consumos, impostos, compras e transportes.',
      en: 'A house run like a company: calendar and tasks, contacts and contracts, wallet and cash flow, credit, utilities, taxes, shopping and transport.',
    },
    detalhe: [
      {
        pt: 'Módulo de obra: capítulos por fase, orçamento contra pago, registo de despesa e fichas por divisão.',
        en: 'Construction module: chapters by phase, budget versus paid, expense log and per-room sheets.',
      },
      {
        pt: 'Liga-se ao exterior por API: meteorologia, risco de incêndio, automações e alertas.',
        en: 'It reaches outside through APIs: weather, wildfire risk, automations and alerts.',
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
