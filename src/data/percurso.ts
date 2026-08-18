import { Posicao, Formacao, parse } from './schema.ts'

/**
 * Fonte: o perfil do LinkedIn, lido a partir do que o Fábio exportou.
 *
 * Por posição: cargo, organização, período, e duas a quatro linhas do que
 * fez e com que resultado. Ordem cronológica inversa.
 *
 * O Onofriana e o Primeira Plateia não entram aqui apesar de estarem no
 * LinkedIn como experiência: vivem em `projetos/`, e repetir a mesma coisa
 * em dois nós faz o arquivo parecer maior do que é.
 *
 * A pausa de carreira de dois meses em 2018 também não entra. É um artefacto
 * do LinkedIn, não um cargo.
 */
export const posicoes = parse(Posicao.array(), [
  {
    id: 'atrevia',
    cargo: {
      pt: 'Consultor de Assuntos Públicos',
      en: 'Public Affairs Consultant',
      fr: 'Consultant en affaires publiques',
      es: 'Consultor de Asuntos Públicos',
    },
    organizacao: 'ATREVIA',
    periodo: { inicio: '2022-06', fim: null },
    linhas: [
      // O gesto próprio primeiro. «Regulação e relação institucional para
      // clientes de vários setores» escreve-o qualquer consultor de qualquer
      // consultora: é enquadramento, e enquadramento vem depois do que se faz.
      {
        pt: 'Acompanho o processo legislativo e regulatório português e desenho a resposta: com quem falar, quando e com quê.',
        en: 'I follow the Portuguese legislative and regulatory process and design the response: whom to talk to, when, and with what.',
        fr: 'Je suis le processus législatif et réglementaire portugais et je conçois la réponse : à qui parler, quand et avec quoi.',
        es: 'Sigo el proceso legislativo y regulatorio portugués y diseño la respuesta: con quién hablar, cuándo y con qué.',
      },
      {
        pt: 'Do aconselhamento à execução, para clientes de vários setores — regulação, relação institucional, comunicação com decisores.',
        en: 'From advice to delivery, for clients across sectors — regulation, institutional relations, communication with decision-makers.',
        fr: 'Du conseil à l’exécution, pour des clients de plusieurs secteurs — réglementation, relations institutionnelles, communication avec les décideurs.',
        es: 'Del asesoramiento a la ejecución, para clientes de varios sectores — regulación, relación institucional, comunicación con decisores.',
      },
      {
        pt: 'Mapeio quem decide e quem influencia, com equipas de várias disciplinas.',
        en: 'I map who decides and who influences, working with teams across disciplines.',
        fr: 'Je cartographie qui décide et qui influence, avec des équipes de plusieurs disciplines.',
        es: 'Mapeo quién decide y quién influye, con equipos de varias disciplinas.',
      },
    ],
  },
  {
    id: 'cml',
    cargo: {
      pt: 'Conselheiro Político',
      en: 'Political Adviser',
      fr: 'Conseiller politique',
      es: 'Asesor Político',
    },
    organizacao: 'Câmara Municipal de Lisboa',
    periodo: { inicio: '2018-03', fim: '2022-04' },
    linhas: [
      {
        pt: 'Assessoria ao vereador com os pelouros da Cultura, Habitação, Direitos Humanos e Direitos Sociais.',
        en: 'Adviser to the councillor for Culture, Housing, Human Rights and Social Rights.',
        fr: 'Conseil auprès de l’adjoint chargé de la Culture, du Logement, des Droits humains et des Droits sociaux.',
        es: 'Asesoría al concejal con las áreas de Cultura, Vivienda, Derechos Humanos y Derechos Sociales.',
      },
      {
        pt: 'Análise legislativa, relatórios, moções e propostas — do enquadramento à letra final.',
        en: 'Legislative analysis, reports, motions and proposals — from framing to final wording.',
        fr: 'Analyse législative, rapports, motions et propositions — du cadrage à la rédaction finale.',
        es: 'Análisis legislativo, informes, mociones y propuestas — del encuadre a la redacción final.',
      },
      {
        pt: 'Em paralelo, a comunicação e as redes do gabinete, e a produção dos eventos do pelouro.',
        en: 'Alongside that, the office\'s communications and social media, and producing the events those areas ran.',
        fr: 'En parallèle, la communication et les réseaux du cabinet, et la production des événements de ces domaines.',
        es: 'En paralelo, la comunicación y las redes del gabinete, y la producción de los eventos del área.',
      },
    ],
  },
  {
    id: 'chapito',
    cargo: { pt: 'Barman', en: 'Barman', fr: 'Barman', es: 'Barman' },
    organizacao: 'Bartô',
    periodo: { inicio: '2015-01', fim: '2017-12' },
    linhas: [
      {
        // A terceira frase é a única do percurso inteiro que diz um ponto de
        // vista em vez de uma tarefa. Tinha-se perdido numa reescrita que
        // estava a corrigir outra coisa; volta, porque era o que humanizava.
        pt: 'No Bartô, o bar e sala de espetáculos que fica no Chapitô, em Lisboa. Ao balcão, e apoio de palco na própria sala. A cultura vista do lado de quem monta e desmonta.',
        en: 'At Bartô, the bar and small venue inside Chapitô, in Lisbon. Behind the counter, and stage-hand work in the room itself. Culture seen from the side that sets up and tears down.',
        fr: 'Au Bartô, le bar et la petite salle de spectacle qui se trouvent au Chapitô, à Lisbonne. Derrière le comptoir, et à la régie de plateau dans la salle même. La culture vue du côté de ceux qui montent et démontent.',
        es: 'En el Bartô, el bar y sala de espectáculos que está en el Chapitô, en Lisboa. En la barra, y apoyo de escenario en la propia sala. La cultura vista desde el lado de quien monta y desmonta.',
      },
    ],
  },
  {
    id: 'lisbon-souvenir',
    cargo: { pt: 'Proprietário', en: 'Owner', fr: 'Propriétaire', es: 'Propietario' },
    organizacao: 'Lisbon Souvenir',
    periodo: { inicio: '2010-02', fim: '2014-12' },
    linhas: [
      {
        pt: 'O primeiro negócio próprio, em Lisboa: compras, vendas, contas e balcão.',
        en: 'The first business of my own, in Lisbon: buying, selling, the books and the counter.',
        fr: 'La première affaire à moi, à Lisbonne : achats, ventes, les comptes et le comptoir.',
        es: 'El primer negocio propio, en Lisboa: compras, ventas, las cuentas y el mostrador.',
      },
    ],
  },
], 'percurso.posicoes')

/**
 * Os nomes dos cursos não se traduzem: são o nome próprio do certificado, e
 * um certificado traduzido é um certificado que não se encontra. As quatro
 * chaves repetem a mesma cadeia por isso mesmo.
 *
 * Três das vinte e nove licenças do LinkedIn, e só as que dizem respeito ao
 * cargo: política pública, lobbying e advocacia.
 *
 * São cursos online, feitos por conta própria, e o nó chama-se `certificados/`
 * e não `formacao/` por isso mesmo: uma lista com "Yale" e "University of
 * Michigan" debaixo de um nó chamado formação lê-se como se lá tivesse
 * estudado, e não foi isso que aconteceu. O rótulo tem de dizer a verdade
 * sozinho, sem depender de quem lê abrir e reparar.
 */
export const formacao = parse(Formacao.array(), [
  {
    id: 'yale-moral-foundations',
    curso: {
      pt: 'Moral Foundations of Politics',
      en: 'Moral Foundations of Politics',
      fr: 'Moral Foundations of Politics',
      es: 'Moral Foundations of Politics',
    },
    instituicao: 'Yale University',
    periodo: { inicio: '2024-11', fim: '2024-11' },
  },
  {
    id: 'itcilo-lobbying',
    curso: {
      pt: 'Lobbying and Advocacy',
      en: 'Lobbying and Advocacy',
      fr: 'Lobbying and Advocacy',
      es: 'Lobbying and Advocacy',
    },
    instituicao: 'Centro Internacional de Formação da OIT (ITCILO)',
    periodo: { inicio: '2024-09', fim: '2024-09' },
  },
  {
    id: 'michigan-public-policy',
    curso: {
      pt: 'Using Public Policy for Social Change',
      en: 'Using Public Policy for Social Change',
      fr: 'Using Public Policy for Social Change',
      es: 'Using Public Policy for Social Change',
    },
    instituicao: 'University of Michigan',
    periodo: { inicio: '2024-09', fim: '2024-09' },
  },
], 'percurso.formacao')
