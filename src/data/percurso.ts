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
    cargo: { pt: 'Consultor de Assuntos Públicos', en: 'Public Affairs Consultant' },
    organizacao: 'ATREVIA',
    periodo: { inicio: '2022-06', fim: null },
    linhas: [
      {
        pt: 'Regulação, relação institucional e comunicação para clientes de vários setores — do aconselhamento à execução.',
        en: 'Regulation, institutional relations and communication for clients across sectors — from advice to delivery.',
      },
      {
        pt: 'Acompanho o processo legislativo e regulatório português e desenho a resposta: com quem falar, quando e com quê.',
        en: 'I follow the Portuguese legislative and regulatory process and design the response: whom to talk to, when, and with what.',
      },
      {
        pt: 'Mapeio quem decide e quem influencia, com equipas de várias disciplinas.',
        en: 'I map who decides and who influences, working with teams across disciplines.',
      },
    ],
  },
  {
    id: 'cml',
    cargo: { pt: 'Conselheiro Político', en: 'Political Adviser' },
    organizacao: 'Câmara Municipal de Lisboa',
    periodo: { inicio: '2018-03', fim: '2022-04' },
    linhas: [
      {
        pt: 'Assessoria ao vereador com os pelouros da Cultura, Habitação, Direitos Humanos e Direitos Sociais.',
        en: 'Adviser to the councillor for Culture, Housing, Human Rights and Social Rights.',
      },
      {
        pt: 'Análise legislativa, relatórios, moções e propostas — do enquadramento à letra final.',
        en: 'Legislative analysis, reports, motions and proposals — from framing to final wording.',
      },
      {
        pt: 'Em paralelo, a comunicação e as redes do gabinete, e a produção dos eventos do pelouro.',
        en: 'Alongside that, the office\'s communications and social media, and producing the events those areas ran.',
      },
    ],
  },
  {
    id: 'chapito',
    cargo: { pt: 'Barman', en: 'Barman' },
    organizacao: 'Bartô',
    periodo: { inicio: '2015-01', fim: '2017-12' },
    linhas: [
      {
        pt: 'No Bartô, o bar e sala de espetáculos que fica no Chapitô, em Lisboa. Ao balcão, e apoio de palco na própria sala.',
        en: 'At Bartô, the bar and small venue inside Chapitô, in Lisbon. Behind the counter, and stage-hand work in the room itself.',
      },
    ],
  },
  {
    id: 'lisbon-souvenir',
    cargo: { pt: 'Proprietário', en: 'Owner' },
    organizacao: 'Lisbon Souvenir',
    periodo: { inicio: '2010-02', fim: '2014-12' },
    linhas: [
      {
        pt: 'Loja própria em Lisboa: compras, vendas, contas e balcão.',
        en: 'My own shop in Lisbon: buying, selling, the books and the counter.',
      },
    ],
  },
], 'percurso.posicoes')

/**
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
    curso: { pt: 'Moral Foundations of Politics', en: 'Moral Foundations of Politics' },
    instituicao: 'Yale University',
    periodo: { inicio: '2024-11', fim: '2024-11' },
  },
  {
    id: 'itcilo-lobbying',
    curso: { pt: 'Lobbying and Advocacy', en: 'Lobbying and Advocacy' },
    instituicao: 'Centro Internacional de Formação da OIT (ITCILO)',
    periodo: { inicio: '2024-09', fim: '2024-09' },
  },
  {
    id: 'michigan-public-policy',
    curso: {
      pt: 'Using Public Policy for Social Change',
      en: 'Using Public Policy for Social Change',
    },
    instituicao: 'University of Michigan',
    periodo: { inicio: '2024-09', fim: '2024-09' },
  },
], 'percurso.formacao')
