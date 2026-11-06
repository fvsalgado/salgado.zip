import { Projeto, parse } from './schema.ts'

/**
 * Números, nesta listagem, não há — e não é esquecimento.
 *
 * A ficha do Primeira Plateia publicava as contagens do próprio site («mais de
 * 1 500 espetáculos em cartaz, em 77 salas de 33 concelhos»), lidas pelo
 * scripts/stamps.mjs e congeladas num numeros.json. O endereço passou a
 * redirecionar para o coreto.org (decisão do Fábio, 5/11/2026), e o coreto.org
 * não publica contagens comparáveis: as que lá estão são as da demonstração,
 * que é um território inventado. Uma contagem de eventos inventados num
 * currículo seria um número a fingir. Sem fonte, a linha sai sem números —
 * que é o que esta casa faz a um número que não consegue derivar.
 */

/**
 * Regra de enquadramento: descreve-se o que o produto faz, não quem o usa.
 * Vale para todos, e para o Travertina em particular — entra como plataforma
 * de gestão com módulos e integrações, a mesma linguagem com que se
 * descreveria um projeto entregue a terceiros. É despersonalização, não
 * invenção: o papel continua a ser autor e em lado nenhum se afirma ou
 * insinua um cliente que não existe.
 *
 * O `papel` separa as duas dimensões, porque não são a mesma coisa e a
 * distinção é o que interessa a quem lê: no Coreto, no Onofriana e no Em Cada
 * Esquina ele funda e gere o projeto além de construir o produto; nos
 * restantes construiu o produto e mais nada. Sem contagem escrita aqui: o
 * comentário dizia «os outros três» quando já eram seis, e um comentário que
 * conta mal é pior do que um que não conta.
 *
 * A ORDEM segue o papel: primeiro os projetos que ele fundou, depois os sítios
 * feitos para outras pessoas, por fim os produtos de que é autor. Dentro de
 * cada grupo, pela ordem em que entraram na listagem. O Coreto fica no lugar
 * que era do Primeira Plateia.
 *
 * O próprio salgado.zip saiu da listagem a 19/08/2026. Uma ficha de projeto
 * dentro do projeto que a mostra é um espelho: quem está a ler a página já
 * tem a prova à frente, e o colofão continua a dizer como é feita e a apontar
 * para o código.
 *
 * Cada entrada que tem um motivo diz o motivo, na primeira pessoa. É a parte
 * que faltava: a listagem provava competência à exaustão e não provava
 * apetite, e ninguém funda nada sem um. Os motivos são do Fábio, ditos por
 * ele; onde não houver motivo confirmado, não se inventa nenhum. E um motivo
 * não pode trazer atrás de si o que a ficha protege: no Travertina diz-se
 * porque foi feito, nunca de quem é a casa.
 *
 * As LINHAS DE ASSINATURA — «desenhei-o e construí-o», «produzo-o», «fundámo-lo
 * os dois» — saíram todas por decisão do Fábio a 19/08/2026. Diziam em prosa o
 * que o campo `papel` já diz por cima de cada ficha, e diziam-no oito vezes
 * seguidas: lidas em fila, a repetição roubava-lhes a força que tinham uma a
 * uma. O papel continua a separar quem fundou de quem só construiu, que é a
 * distinção que interessa a quem lê.
 *
 * Uma nota sobre as RELAÇÕES PESSOAIS, porque este comentário já disse mais do
 * que era verdade. Dizia que tinham saído todas; saiu uma — «a Marta é minha
 * companheira», da ficha da martarosa, que o Fábio mandou tirar a 19/08/2026.
 * A da onofriana fica: «a curadoria artística é da Marta Rosa, minha
 * companheira». Ele leu as duas fichas e pediu coisas diferentes de cada uma —
 * dali só mandou tirar «Fundámo-lo os dois» —, e a diferença é deliberada. A
 * sobrinha permanece por ser o motivo da ficha.
 *
 * Os MOTIVOS ficam, e são agora a única primeira pessoa da listagem: «fi-lo
 * porque gosto de teatro», «fi-lo como resposta a um problema de autonomia».
 *
 * `periodo: null` significa ano por confirmar. Não se publica por adivinhação:
 * são datas do percurso de uma pessoa real, num site que vai para
 * candidaturas. A verificação 16 bloqueia enquanto houver algum por confirmar.
 */
export const projetos = parse(Projeto.array().min(1), [
  {
    // Era a ficha do primeiraplateia.pt. Uma entrada e não duas: o endereço do
    // Primeira Plateia redireciona para o coreto.org (308), e o repositório
    // dele está arquivado e privado — a ligação ao código saiu por isso.
    id: 'coreto',
    dominio: 'coreto.org',
    papel: {
      pt: 'fundador e criador · produto',
      en: 'founder and maker · product',
      fr: 'fondateur et créateur · produit',
      es: 'fundador y creador · producto',
    },
    estado: 'ativo',
    // A linha que o Fábio fundou começa no EmCena.pt, em Novembro de 2016, e é
    // essa a data (decisão dele, 6/11/2026). O código do Coreto é novo — o
    // primeiro commit é de 26/08/2026 —, e a linhagem diz-se no detalhe.
    periodo: { inicio: '2016-11', fim: null },
    // «Toda a programação cultural do seu território, numa agenda só.» abre a
    // linha nas quatro línguas e não se traduz: é a frase da casa — o título e
    // o h1 do coreto.org —, e uma frase da casa traduzida deixa de ser a frase
    // da casa. A mesma regra dos títulos das leituras em `voz.ts`. Entrou no
    // lugar de «A Cultura no melhor lugar», que o coreto.org não usa.
    linha: {
      pt: 'Toda a programação cultural do seu território, numa agenda só. Recolhe uma vez por dia o que câmaras, teatros, bibliotecas e coletividades já publicam, e devolve-o em página, mapa, calendário, feed e numa caixa para outros sítios.',
      en: 'Toda a programação cultural do seu território, numa agenda só. Once a day it gathers what councils, theatres, libraries and local associations already publish, and gives it back as a page, a map, a calendar, a feed and an embeddable widget.',
      fr: 'Toda a programação cultural do seu território, numa agenda só. Une fois par jour, il recueille ce que les mairies, les théâtres, les bibliothèques et les associations publient déjà, et le restitue en page, carte, calendrier, flux et widget à intégrer.',
      es: 'Toda a programação cultural do seu território, numa agenda só. Una vez al día recoge lo que ayuntamientos, teatros, bibliotecas y asociaciones ya publican, y lo devuelve como página, mapa, calendario, feed y un widget para otros sitios.',
    },
    detalhe: [
      {
        // O motivo é o do projeto que veio a ser o Coreto, e fica como o Fábio
        // o disse. O tempo verbal é que faz a afirmação: «vivia». O que este
        // projeto é está dito no passado do problema que resolveu.
        pt: 'Fi-lo porque gosto de teatro e não conseguia saber o que estava em cena: a agenda nacional vivia espalhada pelo sítio de cada estrutura e de cada sala.',
        en: "I made it because I love theatre and could never find out what was on: the national listings used to live scattered across each company's and each venue's own site.",
        fr: 'Je l’ai fait parce que j’aime le théâtre et que je n’arrivais pas à savoir ce qui se jouait : l’agenda national vivait éparpillé sur le site de chaque compagnie et de chaque salle.',
        es: 'Lo hice porque me gusta el teatro y no conseguía saber qué había en cartel: la agenda nacional vivía dispersa por el sitio de cada estructura y de cada sala.',
      },
      {
        // O último passo diz só o que as fontes dão. O Coreto não é o Primeira
        // Plateia com outro nome: é um código novo (o primeiro commit é de
        // 26/08/2026), escrito depois de ler o dele, e o NOTES.md do Coreto
        // diz o que veio de lá — o motor de normalização e deduplicação. O
        // resto é o redirecionamento do endereço, verificado a 6/11/2026.
        pt: 'Nasceu em 2016 como EmCena.pt, agenda de teatro de Lisboa, e em 2026 passou a Primeira Plateia, de âmbito nacional. O Coreto herdou-lhe o motor e o endereço.',
        en: 'Born in 2016 as EmCena.pt, a listings site for Lisbon theatre; in 2026 it became Primeira Plateia, nationwide. Coreto inherited its engine and its address.',
        fr: 'Né en 2016 sous le nom d’EmCena.pt, agenda du théâtre de Lisbonne ; en 2026 il devient Primeira Plateia, à l’échelle nationale. Le Coreto en a hérité le moteur et l’adresse.',
        es: 'Nació en 2016 como EmCena.pt, agenda de teatro de Lisboa; en 2026 pasó a ser Primeira Plateia, de ámbito nacional. El Coreto heredó de él el motor y la dirección.',
      },
    ],
    stack: ['Next.js', 'Supabase', 'TypeScript'],
    url: 'https://coreto.org',
    shot: 'coreto.webp',
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
        pt: 'A curadoria artística é da Marta Rosa, minha companheira.',
        en: 'Artistic curation is by Marta Rosa, my partner.',
        fr: 'La curation artistique est de Marta Rosa, ma compagne.',
        es: 'La curaduría artística es de Marta Rosa, mi compañera.',
      },
    ],
    stack: [],
    url: 'https://onofriana.pt',
    shot: 'onofriana.webp',
  },
  {
    id: 'emcadaesquina',
    dominio: 'emcadaesquina.app',
    // «Um projeto de Fábio Salgado» é como o próprio sítio o assina, no rodapé
    // e no «Sobre»: é ele o promotor, e é ele quem edita os textos. Por isso
    // fundador, e não só autor do produto.
    papel: {
      pt: 'fundador e criador · produto',
      en: 'founder and maker · product',
      fr: 'fondateur et créateur · produit',
      es: 'fundador y creador · producto',
    },
    estado: 'ativo',
    // O mês do primeiro commit (2/10/2026), pelo `git log --reverse`.
    periodo: { inicio: '2026-10', fim: null },
    // A primeira frase é a descrição do próprio sítio, nas traduções dele.
    linha: {
      pt: 'Percursos a pé pela Lisboa da resistência à ditadura, do 25 de Abril e das mulheres que lutaram pela liberdade: lugares, pessoas e datas, cada facto com a sua fonte.',
      en: 'Walking routes through the Lisbon of the resistance to the dictatorship, of 25 April and of the women who fought for freedom: places, people and dates, every fact with its source.',
      fr: 'Parcours à pied dans la Lisbonne de la résistance à la dictature, du 25 Avril et des femmes qui se sont battues pour la liberté : lieux, personnes et dates, chaque fait avec sa source.',
      es: 'Recorridos a pie por la Lisboa de la resistencia a la dictadura, del 25 de Abril y de las mujeres que lucharon por la libertad: lugares, personas y fechas, cada hecho con su fuente.',
    },
    detalhe: [
      {
        pt: 'As mulheres estão no centro da história: pelo menos metade das pessoas são mulheres, e quem o garante é um teste, não uma intenção.',
        en: 'Women are at the centre of the story: at least half of the people are women, and a test guarantees it, not an intention.',
        fr: 'Les femmes sont au centre de l’histoire : au moins la moitié des personnes sont des femmes, et c’est un test qui le garantit, pas une intention.',
        es: 'Las mujeres están en el centro de la historia: al menos la mitad de las personas son mujeres, y lo garantiza una prueba, no una intención.',
      },
    ],
    stack: ['Next.js', 'MapLibre + PMTiles', 'PWA offline-first'],
    url: 'https://emcadaesquina.app',
    shot: 'emcadaesquina.webp',
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
        pt: 'Fi-lo como resposta a um problema de autonomia: pôr obra, manutenção de equipamentos, compromissos dos animais — vacinas e afins — e domótica no mesmo sítio, e no telemóvel.',
        en: 'I made it as an answer to a problem of autonomy: putting building work, equipment upkeep, animal appointments — vaccines and the like — and home automation in one place, and on the phone.',
        fr: 'Je l’ai fait en réponse à un problème d’autonomie : mettre les travaux, l’entretien des équipements, les rendez-vous des animaux — vaccins et compagnie — et la domotique au même endroit, et sur le téléphone.',
        es: 'Lo hice como respuesta a un problema de autonomía: poner la obra, el mantenimiento de los equipos, los compromisos de los animales — vacunas y demás — y la domótica en el mismo sitio, y en el móvil.',
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
    detalhe: [],
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
    ],
    stack: ['React', 'Vite'],
    url: null,
    shot: null,
  },
  {
    id: 'paragem',
    dominio: 'paragem.pt',
    // O produto é dele — o nome, o código e o desenho, como diz o paragem.pt —,
    // mas não há projeto que ele funde e gira por cima: o sítio de cada região
    // publica-se em nome da autoridade de transportes, e nenhuma está em
    // serviço. Autor do produto, como o Travertina e o POS Popular.
    papel: { pt: 'autor do produto', en: 'product author', fr: 'auteur du produit', es: 'autor del producto' },
    estado: 'ativo',
    // O mês do primeiro commit, 19/09/2026, no repositório privado onde foi
    // desenvolvido. O público nasceu a 22/09/2026 com histórico novo, no mesmo
    // mês — e uma cópia rasa dele começa em outubro, que é a data errada.
    periodo: { inicio: '2026-09', fim: null },
    linha: {
      pt: 'Os transportes de um território num sítio só, seja quem for que os gere: autocarros, comboios, transporte a pedido, bicicletas, expressos e táxis, com planeador de viagens e a página de cada paragem e de cada linha.',
      en: "A territory's transport in one place, whoever runs it: buses, trains, demand-responsive transport, shared bikes, coaches and taxis, with a journey planner and a page for every stop and every line.",
      fr: 'Les transports d’un territoire en un seul endroit, quel qu’en soit le gestionnaire : bus, trains, transport à la demande, vélos partagés, cars et taxis, avec un calculateur d’itinéraires et une page pour chaque arrêt et chaque ligne.',
      es: 'Los transportes de un territorio en un solo sitio, los gestione quien los gestione: autobuses, trenes, transporte a demanda, bicicletas compartidas, autobuses exprés y taxis, con planificador de viajes y una página para cada parada y cada línea.',
    },
    detalhe: [
      {
        // Licenciado por região, e mais nada sobre quem o licencia: não há
        // cliente, e a região com dados reais está publicada como proposta.
        pt: 'Licencia-se por região, a cada autoridade de transportes, e uma região nova entra por declaração, sem código. As de demonstração, como demo.paragem.pt, são inventadas de fio a pavio.',
        en: 'Licensed per region, to each transport authority; a new region comes in by declaration, without code. The demo regions, such as demo.paragem.pt, are invented from scratch.',
        fr: 'Il se licencie par région, à chaque autorité organisatrice des transports, et une nouvelle région entre par déclaration, sans code. Celles de démonstration, comme demo.paragem.pt, sont inventées de toutes pièces.',
        es: 'Se licencia por región, a cada autoridad de transporte, y una región nueva entra por declaración, sin código. Las de demostración, como demo.paragem.pt, están inventadas de principio a fin.',
      },
    ],
    stack: ['Next.js', 'pipeline Python', 'OpenTripPlanner', 'MapLibre + PMTiles'],
    url: 'https://paragem.pt',
    codigo: 'https://github.com/fvsalgado/paragem',
    shot: 'paragem.webp',
  },
], 'projetos')
