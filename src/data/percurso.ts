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
 * Vazio: o que o LinkedIn traz é a secção de licenças e certificados, não a
 * de formação académica. São vinte e nove, e escolher quais entram é decisão
 * do Fábio, não minha.
 */
export const formacao = parse(Formacao.array(), [], 'percurso.formacao')
