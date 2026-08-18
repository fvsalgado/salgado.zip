import { Projeto, parse } from './schema.ts'
import { IDIOMAS, LINGUAS, type Idioma } from './idiomas.ts'
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
const espetaculos = n.primeiraplateiaEspetaculos
const centena =
  espetaculos && espetaculos >= 100
    ? (Object.fromEntries(
        IDIOMAS.map((i) => [
          i,
          (Math.floor(espetaculos / 100) * 100).toLocaleString(LINGUAS[i].bcp47),
        ])
      ) as Record<Idioma, string>)
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
 * ele; onde não houver motivo confirmado, não se inventa nenhum. E um motivo
 * não pode trazer atrás de si o que a ficha protege: no Travertina diz-se
 * porque foi feito, nunca de quem é a casa.
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
    papel: {
      pt: 'fundador e criador · produto',
      en: 'founder and maker · product',
      fr: 'fondateur et créateur · produit',
      es: 'fundador y creador · producto',
    },
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
      fr:
        centena && cobertura
          ? `L’agenda culturel du Portugal en un seul endroit : plus de ${centena.fr} spectacles à l’affiche, dans ${cobertura.salas} salles de ${cobertura.concelhos} communes — tous les districts et régions autonomes.`
          : 'L’agenda culturel du Portugal en un seul endroit, de tous les districts et régions autonomes : théâtres, salles de concert, musées et cinémas.',
      es:
        centena && cobertura
          ? `La agenda cultural de Portugal en un solo sitio: más de ${centena.es} espectáculos en cartel, en ${cobertura.salas} salas de ${cobertura.concelhos} municipios — todos los distritos y regiones autónomas.`
          : 'La agenda cultural de Portugal en un solo sitio, de todos los distritos y regiones autónomas: teatros, salas de conciertos, museos y cines.',
    },
    detalhe: [
      {
        // O tempo verbal é que faz a afirmação: «vivia». O que este projeto é
        // está dito no passado do problema que resolveu.
        pt: 'Fi-lo porque gosto de teatro e não conseguia saber o que estava em cena: a agenda nacional vivia espalhada pelo sítio de cada estrutura e de cada sala.',
        en: "I made it because I love theatre and could never find out what was on: the national listings used to live scattered across each company's and each venue's own site.",
        fr: 'Je l’ai fait parce que j’aime le théâtre et que je n’arrivais pas à savoir ce qui se jouait : l’agenda national vivait éparpillé sur le site de chaque compagnie et de chaque salle.',
        es: 'Lo hice porque me gusta el teatro y no conseguía saber qué había en cartel: la agenda nacional vivía dispersa por el sitio de cada estructura y de cada sala.',
      },
      {
        pt: 'Filtros por dia, por entrada livre e por acessibilidade. Seguir artistas e salas. Newsletter semanal.',
        en: 'Filter by day, by free admission and by accessibility. Follow artists and venues. Weekly newsletter.',
        fr: 'Filtres par jour, par entrée libre et par accessibilité. Suivre des artistes et des salles. Infolettre hebdomadaire.',
        es: 'Filtros por día, por entrada libre y por accesibilidad. Seguir a artistas y salas. Boletín semanal.',
      },
      {
        pt: 'Nasceu em 2016 como EmCena.pt, agenda de teatro de Lisboa. Renomeado e relançado em 2026, agora de âmbito nacional.',
        en: 'Born in 2016 as EmCena.pt, a Lisbon theatre listing. Renamed and relaunched in 2026, now nationwide.',
        fr: 'Né en 2016 sous le nom d’EmCena.pt, agenda du théâtre de Lisbonne. Renommé et relancé en 2026, désormais à l’échelle nationale.',
        es: 'Nació en 2016 como EmCena.pt, agenda de teatro de Lisboa. Renombrado y relanzado en 2026, ahora de ámbito nacional.',
      },
      {
        pt: 'Um pipeline próprio recolhe e normaliza o cartaz, sala a sala; a revisão final passa por mim.',
        en: 'A pipeline of my own collects and normalises the listings, venue by venue; the final pass is mine.',
        fr: 'Un pipeline maison récolte et normalise l’affiche, salle par salle ; la relecture finale passe par moi.',
        es: 'Un pipeline propio recoge y normaliza la cartelera, sala a sala; la revisión final pasa por mí.',
      },
      {
        pt: 'Fundei-o, giro-o e construí-o.',
        en: 'I founded it, I run it, I built it.',
        fr: 'Je l’ai fondé, je le gère, je l’ai construit.',
        es: 'Lo fundé, lo gestiono y lo construí.',
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
    papel: {
      pt: 'cofundador e produtor · site',
      en: 'co-founder and producer · site',
      fr: 'cofondateur et producteur · site',
      es: 'cofundador y productor · sitio',
    },
    estado: 'ativo',
    periodo: { inicio: '2026-07', fim: null },
    linha: {
      pt: 'Fado: curadoria, produção e programação de espetáculos.',
      en: 'Fado: curation, production and programming.',
      fr: 'Fado : curation, production et programmation de spectacles.',
      es: 'Fado: curaduría, producción y programación de espectáculos.',
    },
    detalhe: [
      {
        pt: 'O nome vem de Maria Severa Onofriana. Quatro formatos: Severa, Mariquinhas, Guitarradas e Vimioso.',
        en: 'Named after Maria Severa Onofriana. Four formats: Severa, Mariquinhas, Guitarradas and Vimioso.',
        fr: 'Le nom vient de Maria Severa Onofriana. Quatre formats : Severa, Mariquinhas, Guitarradas et Vimioso.',
        es: 'El nombre viene de Maria Severa Onofriana. Cuatro formatos: Severa, Mariquinhas, Guitarradas y Vimioso.',
      },
      {
        pt: 'Representamos artistas e organizamos os concertos. Edição discográfica, pontualmente.',
        en: 'We represent artists and put on the concerts. Record releases, now and then.',
        fr: 'Nous représentons les artistes et montons les concerts. Édition discographique, ponctuellement.',
        es: 'Representamos a los artistas y organizamos los conciertos. Edición discográfica, puntualmente.',
      },
      {
        pt: 'A curadoria artística é da Marta Rosa, minha companheira. Fundámo-lo os dois.',
        en: 'Artistic curation is by Marta Rosa, my partner. We founded it together.',
        fr: 'La curation artistique est de Marta Rosa, ma compagne. Nous l’avons fondé à deux.',
        es: 'La curaduría artística es de Marta Rosa, mi compañera. Lo fundamos los dos.',
      },
      {
        pt: 'Produzo-o, e o site também é meu.',
        en: 'I produce it, and the site is mine too.',
        fr: 'Je le produis, et le site est de moi aussi.',
        es: 'Lo produzco, y el sitio también es mío.',
      },
    ],
    stack: [],
    url: 'https://onofriana.pt',
    shot: 'onofriana.webp',
  },
  {
    id: 'franciscasalgado',
    dominio: 'franciscasalgado.golf',
    papel: { pt: 'autor do site', en: 'site author', fr: 'auteur du site', es: 'autor del sitio' },
    estado: 'ativo',
    periodo: { inicio: '2026', fim: null },
    linha: {
      pt: 'O percurso de uma atleta de golfe, época a época: rankings WAGR e europeu, parcerias, imprensa e WITB.',
      en: "A golfer's path, season by season: WAGR and European rankings, partnerships, press and WITB.",
      fr: 'Le parcours d’une golfeuse, saison après saison : classements WAGR et européen, partenariats, presse et WITB.',
      es: 'La trayectoria de una golfista, temporada a temporada: rankings WAGR y europeo, colaboraciones, prensa y WITB.',
    },
    detalhe: [
      {
        pt: 'A Francisca é minha sobrinha.',
        en: 'Francisca is my niece.',
        fr: 'Francisca est ma nièce.',
        es: 'Francisca es mi sobrina.',
      },
      {
        pt: 'Os rankings atualizam-se sozinhos: por API onde há API, por recolha da página onde não há.',
        en: 'The rankings keep themselves up to date: by API where there is one, by scraping the page where there is not.',
        fr: 'Les classements se mettent à jour tout seuls : par API là où il y en a une, par récupération de la page là où il n’y en a pas.',
        es: 'Los rankings se actualizan solos: por API donde la hay, por recogida de la página donde no la hay.',
      },
      {
        pt: 'Desenhei-o e construí-o.',
        en: 'I designed it and built it.',
        fr: 'Je l’ai dessiné et construit.',
        es: 'Lo diseñé y lo construí.',
      },
    ],
    stack: [],
    url: 'https://franciscasalgado.golf',
    shot: 'franciscasalgado.webp',
  },
  {
    id: 'martarosa',
    dominio: 'martarosa.pt',
    papel: { pt: 'autor do site', en: 'site author', fr: 'auteur du site', es: 'autor del sitio' },
    estado: 'ativo',
    periodo: { inicio: '2026', fim: null },
    linha: {
      pt: 'O sítio de uma fadista que escreve o que canta: agenda, discografia, press kit e booking.',
      en: 'The site of a fado singer who writes what she sings: calendar, discography, press kit and booking.',
      fr: 'Le site d’une chanteuse de fado qui écrit ce qu’elle chante : agenda, discographie, dossier de presse et booking.',
      es: 'El sitio de una fadista que escribe lo que canta: agenda, discografía, press kit y contratación.',
    },
    detalhe: [
      {
        pt: 'Voz, viola de fado e letra própria.',
        en: 'Voice, fado viola, and her own lyrics.',
        fr: 'Voix, viola de fado et ses propres textes.',
        es: 'Voz, viola de fado y letras propias.',
      },
      {
        pt: 'A Marta é a minha companheira, e é com ela que produzo fado.',
        en: "Marta is my partner, and she's who I produce fado with.",
        fr: 'Marta est ma compagne, et c’est avec elle que je produis du fado.',
        es: 'Marta es mi compañera, y es con ella con quien produzco fado.',
      },
      {
        pt: 'Desenhei-o e construí-o; as canções são dela.',
        en: 'I designed it and built it; the songs are hers.',
        fr: 'Je l’ai dessiné et construit ; les chansons sont d’elle.',
        es: 'Lo diseñé y lo construí; las canciones son suyas.',
      },
    ],
    stack: [],
    url: 'https://martarosa.pt',
    shot: 'martarosa.webp',
  },
  {
    id: 'travertina',
    dominio: 'travertina.casa',
    papel: { pt: 'autor do produto', en: 'product author', fr: 'auteur du produit', es: 'autor del producto' },
    estado: 'privado',
    periodo: { inicio: '2026', fim: null },
    linha: {
      pt: 'Uma casa gerida como uma empresa: agenda e tarefas, contactos e contratos, carteira e cash-flow, crédito, consumos, impostos, compras e transportes.',
      en: 'A house run like a company: calendar and tasks, contacts and contracts, wallet and cash flow, credit, utilities, taxes, shopping and transport.',
      fr: 'Une maison gérée comme une entreprise : agenda et tâches, contacts et contrats, portefeuille et trésorerie, crédit, consommations, impôts, courses et transports.',
      es: 'Una casa gestionada como una empresa: agenda y tareas, contactos y contratos, cartera y flujo de caja, crédito, consumos, impuestos, compras y transportes.',
    },
    detalhe: [
      {
        // O motivo entra; o dono não. Esta é a única ficha em que a regra de
        // despersonalização se aplica ao próprio autor: um motivo em primeira
        // pessoa é assinatura, mas «as vacinas dos meus animais» é morada.
        pt: 'Fi-lo como resposta a um problema de autonomia: pôr obra, manutenção de equipamentos, compromissos dos animais — vacinas e afins — e domótica no mesmo sítio, e no telemóvel. Cada módulo funciona como uma aplicação; estão todos ligados.',
        en: 'I made it as an answer to a problem of autonomy: putting building work, equipment upkeep, animal appointments — vaccines and the like — and home automation in one place, and on the phone. Each module works like an app; they are all connected.',
        fr: 'Je l’ai fait en réponse à un problème d’autonomie : mettre les travaux, l’entretien des équipements, les rendez-vous des animaux — vaccins et compagnie — et la domotique au même endroit, et sur le téléphone. Chaque module fonctionne comme une application ; ils sont tous reliés.',
        es: 'Lo hice como respuesta a un problema de autonomía: poner la obra, el mantenimiento de los equipos, los compromisos de los animales — vacunas y demás — y la domótica en el mismo sitio, y en el móvil. Cada módulo funciona como una aplicación; están todos conectados.',
      },
      {
        pt: 'Módulo de obra: capítulos por fase, orçamento contra pago, registo de despesa e fichas por divisão.',
        en: 'Construction module: chapters by phase, budget versus paid, expense log and per-room sheets.',
        fr: 'Module travaux : chapitres par phase, budget contre payé, journal des dépenses et fiches par pièce.',
        es: 'Módulo de obra: capítulos por fase, presupuesto frente a pagado, registro de gastos y fichas por estancia.',
      },
      {
        pt: 'CRM integrado para gerir uma microempresa, com gerador de propostas e orçamentos.',
        en: 'Built-in CRM for running a micro-business, with a proposal and quote generator.',
        fr: 'CRM intégré pour gérer une micro-entreprise, avec générateur de propositions et de devis.',
        es: 'CRM integrado para gestionar una microempresa, con generador de propuestas y presupuestos.',
      },
      {
        pt: 'Liga-se ao exterior por API: meteorologia, transportes, rádio, risco de incêndio, alertas de calor, automações e domótica.',
        en: 'It reaches outside through APIs: weather, transport, radio, wildfire risk, heat alerts, automations and home control.',
        fr: 'Il se relie à l’extérieur par API : météo, transports, radio, risque d’incendie, alertes de chaleur, automatisations et domotique.',
        es: 'Se conecta al exterior por API: meteorología, transportes, radio, riesgo de incendio, alertas de calor, automatizaciones y domótica.',
      },
      {
        pt: 'Aplicação privada, atrás de autenticação — sem ligação pública. As capturas mostram dados de demonstração.',
        en: 'Private application, behind authentication — no public link. The screenshots show demo data.',
        fr: 'Application privée, derrière une authentification — sans lien public. Les captures montrent des données de démonstration.',
        es: 'Aplicación privada, tras autenticación — sin enlace público. Las capturas muestran datos de demostración.',
      },
      {
        pt: 'Desenhei-o e construí-o, módulo a módulo.',
        en: 'I designed it and built it, module by module.',
        fr: 'Je l’ai dessiné et construit, module après module.',
        es: 'Lo diseñé y lo construí, módulo a módulo.',
      },
    ],
    stack: ['Vite', 'Supabase (RLS)', 'PWA offline-first'],
    url: null,
    shot: 'travertina.webp',
  },
  {
    id: 'fado-today',
    dominio: 'fado.today',
    papel: { pt: 'autor', en: 'author', fr: 'auteur', es: 'autor' },
    estado: 'ativo',
    // Data de registo do domínio, via RDAP. Derivada, não inventada.
    periodo: { inicio: '2026-05', fim: null },
    linha: {
      pt: 'Venda de experiências de fado em Lisboa: seis casas, escolhidas por quem vive em Alfama.',
      en: 'Selling fado experiences in Lisbon: six houses, chosen by someone who lives in Alfama.',
      fr: 'Vente d’expériences de fado à Lisbonne : six maisons, choisies par quelqu’un qui vit à Alfama.',
      es: 'Venta de experiencias de fado en Lisboa: seis casas, elegidas por quien vive en Alfama.',
    },
    detalhe: [
      {
        pt: 'A reserva passa pelas plataformas de experiências que vendem a cidade.',
        en: 'Booking goes through the experience platforms that sell the city.',
        fr: 'La réservation passe par les plateformes d’expériences qui vendent la ville.',
        es: 'La reserva pasa por las plataformas de experiencias que venden la ciudad.',
      },
      {
        pt: 'Escolhi as casas, desenhei o sítio e construí-o.',
        en: 'I chose the houses, designed the site and built it.',
        fr: 'J’ai choisi les maisons, dessiné le site et je l’ai construit.',
        es: 'Elegí las casas, diseñé el sitio y lo construí.',
      },
    ],
    stack: [],
    url: 'https://fado.today',
    shot: 'fado-today.webp',
  },
  {
    id: 'pospopular',
    dominio: 'pospopular',
    papel: { pt: 'autor do produto', en: 'product author', fr: 'auteur du produit', es: 'autor del producto' },
    estado: 'privado',
    // Data de criação do projeto na Vercel. Derivada, não inventada.
    periodo: { inicio: '2026-04', fim: null },
    linha: {
      pt: 'Ponto de venda multi-tenant para eventos e angariação de fundos: comandas, mesas, cartão de consumo e talões de cozinha.',
      en: 'Multi-tenant point of sale for events and fundraising: order slips, tables, consumption cards and kitchen tickets.',
      fr: 'Point de vente multi-tenant pour événements et collectes de fonds : commandes, tables, carte de consommation et tickets de cuisine.',
      es: 'Punto de venta multi-tenant para eventos y recaudación de fondos: comandas, mesas, tarjeta de consumo y tickets de cocina.',
    },
    detalhe: [
      {
        pt: 'Nasceu de uma necessidade real: uma organização comunitária precisava de controlar a faturação por dentro. Está em uso, e fica disponível para outras.',
        en: 'It came out of a real need: a community organisation had to keep its own billing under control. It is in use, and it is available to others.',
        fr: 'Né d’un besoin réel : une organisation communautaire devait contrôler sa facturation de l’intérieur. Il est en service, et il reste disponible pour d’autres.',
        es: 'Nació de una necesidad real: una organización comunitaria necesitaba controlar su facturación desde dentro. Está en uso, y queda disponible para otras.',
      },
      {
        pt: 'Aplicação privada, atrás de autenticação — sem ligação pública.',
        en: 'Private application, behind authentication — no public link.',
        fr: 'Application privée, derrière une authentification — sans lien public.',
        es: 'Aplicación privada, tras autenticación — sin enlace público.',
      },
      {
        pt: 'Desenhei-o e construí-o. Já estive do outro lado deste balcão.',
        en: 'I designed it and built it. I have stood on the other side of this counter.',
        fr: 'Je l’ai dessiné et construit. Je me suis déjà tenu de l’autre côté de ce comptoir.',
        es: 'Lo diseñé y lo construí. Ya he estado del otro lado de esta barra.',
      },
    ],
    stack: ['React', 'Vite'],
    url: null,
    shot: null,
  },
  {
    id: 'salgado-zip',
    dominio: 'salgado.zip',
    papel: { pt: 'autor', en: 'author', fr: 'auteur', es: 'autor' },
    estado: 'ativo',
    periodo: { inicio: '2026-08', fim: null },
    linha: {
      pt: 'Sítio pessoal e arquivo de projetos: uma fonte de dados e várias saídas — página, PDF, resume.json e um zip —, com uma bateria de verificações antes de cada publicação.',
      en: 'Personal site and project archive: one data source and several outputs — page, PDFs, resume.json and a zip — with a battery of checks before every release.',
      fr: 'Site personnel et archive de projets : une source de données et plusieurs sorties — page, PDF, resume.json et un zip —, avec une batterie de vérifications avant chaque publication.',
      es: 'Sitio personal y archivo de proyectos: una fuente de datos y varias salidas — página, PDF, resume.json y un zip —, con una batería de verificaciones antes de cada publicación.',
    },
    detalhe: [
      {
        pt: 'Código aberto. Escrevi-o e construí-o a meias com o Claude, entre outras ferramentas.',
        en: 'Open source. I wrote it and built it together with Claude, among other tools.',
        fr: 'Code ouvert. Je l’ai écrit et construit à deux avec Claude, parmi d’autres outils.',
        es: 'Código abierto. Lo escribí y lo construí a medias con Claude, entre otras herramientas.',
      },
    ],
    stack: ['Astro', 'TypeScript', 'Claude Code'],
    url: 'https://salgado.zip',
    codigo: 'https://github.com/fvsalgado/salgado.zip',
    shot: null,
  },
], 'projetos')
