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
/** Cada língua agrupa os milhares à sua maneira; nenhuma delas à mão. */
const centena =
  n.primeiraplateiaEspetaculos && n.primeiraplateiaEspetaculos >= 100
    ? {
        pt: (Math.floor(n.primeiraplateiaEspetaculos / 100) * 100).toLocaleString('pt-PT'),
        en: (Math.floor(n.primeiraplateiaEspetaculos / 100) * 100).toLocaleString('en-GB'),
      }
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
 * Cada entrada que tem um motivo diz o motivo, na primeira pessoa. É a parte
 * que faltava: a listagem provava competência à exaustão e não provava
 * apetite, e ninguém funda nada sem um. Os motivos são do Fábio, ditos por
 * ele; onde não houver motivo confirmado, não se inventa nenhum.
 *
 * Cada entrada fecha com uma LINHA DE ASSINATURA: uma frase curta, na
 * primeira pessoa, que diz o papel real em verbos conjugados e sem um único
 * adjetivo. É o que separa uma ficha de produto de uma prova sobre a pessoa —
 * a listagem descreve o que o produto faz, e a última linha diz quem o fez.
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
    // A cobertura nacional — todos os distritos e regiões autónomas — é facto
    // confirmado pelo Fábio (18/08/2026); a homepage não expõe um contador de
    // distritos que se possa ler à máquina, ao contrário dos três números.
    linha: {
      pt:
        centena && cobertura
          ? `A agenda cultural de Portugal num sítio só: mais de ${centena.pt} espetáculos em cartaz, em ${cobertura.salas} salas de ${cobertura.concelhos} concelhos — todos os distritos e regiões autónomas.`
          : 'A agenda cultural de Portugal num sítio só, de todos os distritos e regiões autónomas: teatros, salas de concerto, museus e cinemas.',
      en:
        centena && cobertura
          ? `Portugal's cultural agenda in one place: over ${centena.en} events on show, across ${cobertura.salas} venues in ${cobertura.concelhos} municipalities — every district and autonomous region.`
          : "Portugal's cultural agenda in one place, from every district and autonomous region: theatres, concert halls, museums and cinemas.",
    },
    detalhe: [
      {
        pt: 'Fi-lo porque gosto de teatro e não conseguia saber o que estava em cena: a agenda nacional vive espalhada pelo sítio de cada estrutura e de cada sala.',
        en: "I made it because I love theatre and could never find out what was on: the national listings live scattered across each company's and each venue's own site.",
      },
      {
        pt: 'Filtros por dia, por entrada livre e por acessibilidade. Seguir artistas e salas. Newsletter semanal.',
        en: 'Filter by day, by free admission and by accessibility. Follow artists and venues. Weekly newsletter.',
      },
      {
        pt: 'Nasceu em 2016 como EmCena.pt, agenda de teatro de Lisboa. Renomeado e relançado em 2026, agora de âmbito nacional.',
        en: 'Born in 2016 as EmCena.pt, a Lisbon theatre listing. Renamed and relaunched in 2026, now nationwide.',
      },
      {
        pt: 'Um pipeline próprio recolhe e normaliza o cartaz, sala a sala; a revisão final passa por mim.',
        en: 'A pipeline of my own collects and normalises the listings, venue by venue; the final pass is mine.',
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
      {
        pt: 'Representamos artistas e organizamos os concertos. Edição discográfica, pontualmente.',
        en: 'We represent artists and put on the concerts. Record releases, now and then.',
      },
      {
        pt: 'A curadoria artística é da Marta Rosa, minha companheira. Fundámo-lo os dois.',
        en: 'Artistic curation is by Marta Rosa, my partner. We founded it together.',
      },
      { pt: 'Produzo-o, e o site também é meu.', en: 'I produce it, and the site is mine too.' },
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
    detalhe: [
      { pt: 'A Francisca é minha sobrinha.', en: 'Francisca is my niece.' },
      {
        pt: 'Os rankings atualizam-se sozinhos: por API onde há API, por recolha da página onde não há.',
        en: 'The rankings keep themselves up to date: by API where there is one, by scraping the page where there is not.',
      },
      { pt: 'Desenhei-o e construí-o.', en: 'I designed it and built it.' },
    ],
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
      {
        pt: 'A Marta é a minha companheira, e é com ela que produzo fado.',
        en: "Marta is my partner, and she's who I produce fado with.",
      },
      {
        pt: 'Desenhei-o e construí-o; as canções são dela.',
        en: 'I designed it and built it; the songs are hers.',
      },
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
        pt: 'Fi-lo por autonomia: a obra, a manutenção dos equipamentos, as vacinas dos animais e a domótica no mesmo sítio — e no telemóvel. Cada módulo funciona como uma aplicação; estão todos ligados.',
        en: 'I made it for autonomy: the building work, equipment upkeep, the animals\u2019 vaccines and the home automation in one place — and on the phone. Each module works like an app; they are all connected.',
      },
      {
        pt: 'Módulo de obra: capítulos por fase, orçamento contra pago, registo de despesa e fichas por divisão.',
        en: 'Construction module: chapters by phase, budget versus paid, expense log and per-room sheets.',
      },
      {
        pt: 'CRM integrado para gerir uma microempresa, com gerador de propostas e orçamentos.',
        en: 'Built-in CRM for running a micro-business, with a proposal and quote generator.',
      },
      {
        pt: 'Liga-se ao exterior por API: meteorologia, transportes, rádio, risco de incêndio, alertas de calor, automações e domótica.',
        en: 'It reaches outside through APIs: weather, transport, radio, wildfire risk, heat alerts, automations and home control.',
      },
      {
        pt: 'Aplicação privada, atrás de autenticação — sem ligação pública. As capturas mostram dados de demonstração.',
        en: 'Private application, behind authentication — no public link. The screenshots show demo data.',
      },
      { pt: 'Desenhei-o e construí-o, módulo a módulo.', en: 'I designed it and built it, module by module.' },
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
      pt: 'Venda de experiências de fado em Lisboa: seis casas, escolhidas por quem vive em Alfama.',
      en: 'Selling fado experiences in Lisbon: six houses, chosen by someone who lives in Alfama.',
    },
    detalhe: [
      {
        pt: 'A reserva passa pelas plataformas de experiências que vendem a cidade.',
        en: 'Booking goes through the experience platforms that sell the city.',
      },
      {
        pt: 'Escolhi as casas, desenhei o sítio e construí-o.',
        en: 'I chose the houses, designed the site and built it.',
      },
    ],
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
        pt: 'Nasceu de uma necessidade real: uma organização comunitária precisava de controlar a faturação por dentro. Está em uso, e fica disponível para outras.',
        en: 'It came out of a real need: a community organisation had to keep its own billing under control. It is in use, and it is available to others.',
      },
      {
        pt: 'Aplicação privada, atrás de autenticação — sem ligação pública.',
        en: 'Private application, behind authentication — no public link.',
      },
      {
        pt: 'Desenhei-o e construí-o. Já estive do outro lado deste balcão.',
        en: 'I designed it and built it. I have stood on the other side of this counter.',
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
      pt: 'Sítio pessoal e arquivo de projetos: uma fonte de dados e várias saídas — página, PDF, resume.json e um zip —, com uma bateria de verificações antes de cada publicação.',
      en: 'Personal site and project archive: one data source and several outputs — page, PDFs, resume.json and a zip — with a battery of checks before every release.',
    },
    detalhe: [
      {
        pt: 'Código aberto. Escrevi-o e construí-o a meias com o Claude, entre outras ferramentas.',
        en: 'Open source. I wrote it and built it together with Claude, among other tools.',
      },
    ],
    stack: ['Astro', 'TypeScript', 'Claude Code'],
    url: 'https://salgado.zip',
    codigo: 'https://github.com/fvsalgado/salgado.zip',
    shot: null,
  },
], 'projetos')
