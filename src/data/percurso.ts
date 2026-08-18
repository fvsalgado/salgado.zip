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
        pt: 'Aconselhamento estratégico e execução de iniciativas de relações públicas para uma carteira diversificada de clientes.',
        en: 'Strategic advice and delivery of public relations work for a diverse client portfolio.',
      },
      {
        pt: 'Desenho e implementação de estratégias de comunicação para navegar ambientes regulatórios complexos, a partir do conhecimento do quadro regulatório português.',
        en: 'Design and implementation of communication strategies to navigate complex regulatory environments, grounded in the Portuguese regulatory framework.',
      },
      {
        pt: 'Identificação de partes interessadas e monitorização de desenvolvimentos legislativos, com equipas multidisciplinares.',
        en: 'Stakeholder mapping and monitoring of legislative developments, working across multidisciplinary teams.',
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
        pt: 'Assessoria a vereadores e deputados municipais em políticas de Cultura, Habitação, Direitos Humanos e Direitos Sociais.',
        en: 'Advice to city councillors and municipal deputies on Culture, Housing, Human Rights and Social Rights policy.',
      },
      {
        pt: 'Análise e enquadramento legislativo, político e social; redação de relatórios, projetos, moções e propostas.',
        en: 'Legislative, political and social analysis and framing; drafting of reports, projects, motions and proposals.',
      },
      {
        pt: 'Monitorização do impacto na imprensa e gestão das redes institucionais.',
        en: 'Press impact monitoring and management of institutional social channels.',
      },
    ],
  },
  {
    id: 'chapito',
    cargo: { pt: 'Barman e direção de cena', en: 'Barman and stage manager' },
    organizacao: 'Chapitô',
    periodo: { inicio: '2015-01', fim: '2017-12' },
    linhas: [
      {
        pt: 'Bartô, a sala do Chapitô: serviço de bar e direção de cena.',
        en: 'Bartô, the Chapitô venue: bar service and stage management.',
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
        pt: 'Loja própria em Lisboa. Atendimento e gestão corrente do negócio.',
        en: 'Own shop in Lisbon. Customer service and day-to-day management.',
      },
    ],
  },
], 'percurso.posicoes')

/**
 * Uma seleção curta das vinte e nove licenças e certificados do LinkedIn: as
 * que dizem respeito a assuntos públicos, política pública e comunicação.
 * Uma lista curta lê-se; uma lista de vinte e nove enterra as que contam
 * entre cursos de turismo sustentável e de Linux.
 */
export const formacao = parse(Formacao.array(), [
  {
    id: 'yale-moral-foundations',
    curso: { pt: 'Moral Foundations of Politics', en: 'Moral Foundations of Politics' },
    instituicao: 'Yale University',
    periodo: { inicio: '2024-11', fim: '2024-11' },
  },
  {
    id: 'uci-corporate-communications',
    curso: {
      pt: 'Corporate Communications (especialização)',
      en: 'Corporate Communications (specialization)',
    },
    instituicao: 'University of California, Irvine',
    periodo: { inicio: '2024-11', fim: '2024-11' },
  },
  {
    id: 'efset-c2',
    curso: { pt: 'EF SET English Certificate — C2 Proficient', en: 'EF SET English Certificate — C2 Proficient' },
    instituicao: 'EF SET',
    periodo: { inicio: '2024-11', fim: '2024-11' },
  },
  {
    id: 'microsoft-pr',
    curso: {
      pt: 'Public Relations and Communications Associate',
      en: 'Public Relations and Communications Associate',
    },
    instituicao: 'Microsoft',
    periodo: { inicio: '2024-10', fim: '2024-10' },
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
