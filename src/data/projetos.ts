import { Projeto, parse } from './schema.ts'
import numeros from '../generated/numeros.json' with { type: 'json' }

/**
 * O número de espetáculos vem do próprio primeiraplateia.pt, lido por
 * scripts/stamps.mjs e congelado em numeros.json. Publica-se por baixo,
 * arredondado à centena: «mais de 1 500» continua verdadeiro enquanto o
 * catálogo cresce, e nunca finge precisão que já não tem.
 */
const n = numeros as {
  primeiraplateiaEspetaculos?: number
  primeiraplateiaSalas?: number
  primeiraplateiaConcelhos?: number
}
const centena =
  n.primeiraplateiaEspetaculos && n.primeiraplateiaEspetaculos >= 100
    ? (Math.floor(n.primeiraplateiaEspetaculos / 100) * 100).toLocaleString('pt-PT')
    : null
const cobertura =
  n.primeiraplateiaSalas && n.primeiraplateiaConcelhos
    ? { salas: n.primeiraplateiaSalas, concelhos: n.primeiraplateiaConcelhos }
    : null

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
      pt:
        centena && cobertura
          ? `A agenda cultural de Portugal num sítio só: mais de ${centena} espetáculos em cartaz, em ${cobertura.salas} salas de ${cobertura.concelhos} concelhos.`
          : 'A agenda cultural de Portugal num sítio só: teatros, salas de concerto, museus e cinemas.',
      en:
        centena && cobertura
          ? `Portugal's cultural agenda in one place: over ${centena.replace(/\u00a0|\s/g, ',')} events on show, across ${cobertura.salas} venues in ${cobertura.concelhos} municipalities.`
          : "Portugal's cultural agenda in one place: theatres, concert halls, museums and cinemas.",
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
        pt: 'Fundei-o, giro-o e construí-o.',
        en: 'I founded it, I run it, I built it.',
      },
    ],
    stack: ['Next.js', 'Supabase', 'pipeline Python'],
    url: 'https://primeiraplateia.pt',
    codigo: 'https://github.com/fvsalgado/primeiraplateia',
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
        pt: 'Aplicação privada, atrás de autenticação — sem ligação pública. As capturas mostram dados de demonstração.',
        en: 'Private application, behind authentication — no public link. The screenshots show demo data.',
      },
    ],
    stack: ['Vite', 'Supabase (RLS)', 'PWA offline-first'],
    url: null,
    shot: 'travertina.webp',
  },
  {
    id: 'fado-today',
    dominio: 'fado.today',
    papel: { pt: 'autor', en: 'author' },
    estado: 'ativo',
    // Data de registo do domínio, via RDAP. Derivada, não inventada.
    periodo: { inicio: '2026-05', fim: null },
    linha: {
      pt: 'O fado em Lisboa, escolhido por um local: seis recomendações honestas para uma noite de fado, escritas de Alfama.',
      en: 'Fado in Lisbon, chosen by a local: six honest recommendations for a fado night, written from Alfama.',
    },
    detalhe: [],
    stack: [],
    url: 'https://fado.today',
    shot: 'fado-today.webp',
  },
  {
    id: 'pospopular',
    dominio: 'pospopular',
    papel: { pt: 'autor do produto', en: 'product author' },
    estado: 'privado',
    // Data de criação do projeto na Vercel. Derivada, não inventada.
    periodo: { inicio: '2026-04', fim: null },
    linha: {
      pt: 'Ponto de venda multi-tenant para eventos e angariação de fundos: comandas, mesas, cartão de consumo e talões de cozinha.',
      en: 'Multi-tenant point of sale for events and fundraising: order slips, tables, consumption cards and kitchen tickets.',
    },
    detalhe: [
      {
        pt: 'Feito para o balcão de um arraial: rápido, offline quando é preciso, e com contas certas no fim da noite.',
        en: 'Built for a street-party counter: fast, offline when needed, and with the books balanced at the end of the night.',
      },
      {
        pt: 'Aplicação privada, atrás de autenticação — sem ligação pública.',
        en: 'Private application, behind authentication — no public link.',
      },
    ],
    stack: ['React', 'Vite'],
    url: null,
    shot: null,
  },
  {
    id: 'salgado-zip',
    dominio: 'salgado.zip',
    papel: { pt: 'autor', en: 'author' },
    estado: 'ativo',
    periodo: { inicio: '2026-08', fim: null },
    linha: {
      pt: 'Este site. Uma fonte de dados, várias saídas, e uma bateria de verificações antes de cada publicação. O código é público.',
      en: 'This site. One data source, several outputs, and a battery of checks before every release. The code is public.',
    },
    detalhe: [
      {
        pt: 'Construído a meias com o Claude. O colofão conta o resto.',
        en: 'Built together with Claude. The colophon tells the rest.',
      },
    ],
    stack: ['Astro', 'TypeScript', 'Claude Code'],
    url: 'https://salgado.zip',
    codigo: 'https://github.com/fvsalgado/salgado.zip',
    shot: null,
  },
], 'projetos')
