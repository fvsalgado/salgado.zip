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
      // «Public Affairs» e não «Assuntos Públicos» em português: é o nome por
      // que o ofício é conhecido cá, e é assim que ele se apresenta.
      pt: 'Consultor de Public Affairs',
      en: 'Public affairs consultant',
      fr: 'Consultant en affaires publiques',
      es: 'Consultor de asuntos públicos',
    },
    organizacao: 'ATREVIA',
    organizacaoUrl: 'https://www.atrevia.com',
    logo: 'atrevia.webp',
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
    /* «Conselheiro Político» não é designação de gabinete autárquico português:
       soava a tradução de «Political Adviser», e o corpo da entrada — que começa
       em «Assessoria ao vereador» — desmentia o próprio título. Em francês,
       «conseiller» sozinho confunde-se com o eleito: «de cabinet» diz que é do
       gabinete e não da assembleia. */
    cargo: {
      pt: 'Assessor',
      en: 'Adviser',
      fr: 'Conseiller de cabinet',
      es: 'Asesor',
    },
    organizacao: 'Câmara Municipal de Lisboa',
    organizacaoUrl: 'https://www.lisboa.pt',
    logo: 'cml.webp',
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
    // A página oficial da casa é no Facebook e não num domínio próprio. Fica
    // registada, mas hoje não vai a lado nenhum: o `organizacaoUrl` só é lido
    // para o cargo atual, que é o do `worksFor`. E ainda que fosse lido, valia
    // menos do que os outros dois — quem não tem sessão iniciada é mandado para
    // um ecrã de login, e um motor de busca não passa daí.
    organizacaoUrl: 'https://www.facebook.com/obarbarto/',
    // A única marca do percurso com cor: o chapéu do «o» é vermelho, e vem em
    // ficheiro à parte para não ser invertido com o resto. Ver `logoCor`.
    logo: 'barto.webp',
    logoCor: 'barto-chapeu.webp',
    periodo: { inicio: '2015-01', fim: '2017-12' },
    linhas: [
      {
        // A terceira frase é a única do percurso inteiro que diz um ponto de
        // vista em vez de uma tarefa. Tinha-se perdido numa reescrita que
        // estava a corrigir outra coisa; volta, porque era o que humanizava.
        pt: 'No Bartô, o bar e sala de espetáculos que fica no Chapitô, em Lisboa. Ao balcão, e apoio de palco na própria sala. A cultura vista do lado de quem monta e desmonta.',
        en: 'At Bartô, the bar and small venue inside Chapitô, in Lisbon. Behind the counter, and stage-hand work in the room itself. Culture seen from the side that sets up and tears down.',
        fr: 'Au Bartô, le bar et la petite salle de spectacle qui se trouvent au Chapitô, à Lisbonne. Derrière le comptoir, et un coup de main au plateau dans la salle même. La culture vue du côté de ceux qui montent et démontent.',
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
/**
 * Os certificados, escolhidos e não despejados.
 *
 * O LinkedIn tem vinte e nove, e vinte e sete deles foram tirados entre
 * setembro e novembro de 2024. Publicados todos, é isso que se lê primeiro —
 * uma maratona de três meses — e os que valem alguma coisa desaparecem no
 * meio. Oito lidos como escolha dizem mais do que vinte e nove lidos como
 * pilha, e as datas continuam à vista para quem as quiser somar.
 *
 * O critério foi um só: fazem o ofício que está no topo da página.
 * POLÍTICA PÚBLICA E ADVOCACIA — Yale, o centro de formação da OIT, e
 * Michigan. COMUNICAÇÃO INSTITUCIONAL — UC Irvine, o certificado profissional
 * de relações públicas, e a IESE. GERIR O QUE SE DEFENDE — a gestão de
 * projetos da Google e a organização da London Business School: uma campanha
 * de assuntos públicos é um programa com prazos, riscos e gente, e essa parte
 * também se aprende.
 *
 * As duas últimas entraram por decisão do Fábio a 20/08/2026, depois de eu
 * lhas ter apontado como as duas exclusões mais discutíveis das vinte e três.
 * Eu tinha-as cortado por competirem com prova vivida — quem funda e gere
 * projetos há dez anos não precisa de um certificado que diga que sabe geri-los
 * —, e o argumento do outro lado é bom: são as duas de emissores de topo, as
 * duas são programas de vários cursos, e nomeiam uma competência que um júri
 * de recrutamento procura por escrito mesmo quando a vê provada em obra. Fica
 * escrito quem decidiu, que é o que separa uma escolha de um acidente.
 *
 * Cinco dos oito são programas de vários cursos e não cursos soltos, e todos
 * os emissores são casas que quem lê reconhece sem ter de procurar.
 *
 * O que ficou de fora, e porquê: turismo, gentrificação, gestão de eventos,
 * Linux, dois da Adobe, dois de IA, cibersegurança, três do KAICIID, dois da
 * Fundação Aga Khan, género na educação, desinformação, governação. Nenhum é
 * mau; todos ou saem do eixo, ou provam pior o que o resto da página já prova
 * melhor — quem produz espetáculos há dez anos não precisa de um certificado
 * de gestão de eventos, e quem construiu este sítio não precisa de um de
 * fundamentos de design.
 *
 * Dois casos à parte: o EF SET C2 não está aqui porque já está no nó do
 * contacto, que é onde uma língua pertence; e a formação de delegado de
 * segurança contra incêndio, de 2019, é uma qualificação a sério mas serve um
 * perfil que esta página já não apresenta.
 *
 * As credenciais foram conferidas uma a uma a 20/08/2026, e o teste não foi
 * «a página responde» — foi «a página nomeia-o». Uma credencial inventada na
 * Coursera devolve 200 e uma página bonita; o que ela não devolve é o nome.
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
    credencial: 'https://www.coursera.org/account/accomplishments/verify/TNN97YY02RWX',
  },
  {
    id: 'uci-corporate-communications',
    curso: {
      pt: 'Corporate Communications',
      en: 'Corporate Communications',
      fr: 'Corporate Communications',
      es: 'Corporate Communications',
    },
    instituicao: 'University of California, Irvine',
    periodo: { inicio: '2024-11', fim: '2024-11' },
    credencial: 'https://www.coursera.org/account/accomplishments/specialization/ZX91VP5BF59S',
  },
  {
    id: 'microsoft-public-relations',
    curso: {
      pt: 'Public Relations and Communications Associate',
      en: 'Public Relations and Communications Associate',
      fr: 'Public Relations and Communications Associate',
      es: 'Public Relations and Communications Associate',
    },
    instituicao: 'Microsoft',
    periodo: { inicio: '2024-10', fim: '2024-10' },
    credencial: 'https://www.coursera.org/account/accomplishments/professional-cert/YQ0ZB227GS6L',
  },
  {
    id: 'itcilo-lobbying',
    curso: {
      pt: 'Lobbying and Advocacy',
      en: 'Lobbying and Advocacy',
      fr: 'Lobbying and Advocacy',
      es: 'Lobbying and Advocacy',
    },
    /* Pelo nome próprio, como os outros sete. Estava traduzido para português
       — e, sendo `instituicao` uma cadeia só, saía assim também no CV inglês,
       entre a Yale e a Google. Mas a tradução era o desvio nas DUAS línguas:
       nesta lista ninguém está traduzido, nem o «University of California,
       Irvine» nem a «IESE Business School». «International Training Centre of
       the ILO» é como a própria casa se nomeia — conferido em itcilo.org. */
    instituicao: 'International Training Centre of the ILO (ITCILO)',
    periodo: { inicio: '2024-09', fim: '2024-09' },
    /* Havia página, e eu não a tinha encontrado: o LinkedIn guardara o
       endereço do curso e não o da credencial. Este veio do Fábio.
       Sem o fragmento `#acc.…` que o endereço original trazia — os dois
       devolvem exatamente os mesmos bytes, porque um fragmento nunca chega ao
       servidor, e um endereço mais curto é mais fácil de copiar.

       É a única das oito que a verificação NÃO consegue conferir pelo nome:
       a página é uma aplicação que só se preenche no browser, e o servidor só
       a pré-renderiza para agentes de robô conhecidos. Confirmei-a uma vez por
       esse caminho, à mão, e não o pus na verificação — dizer a um servidor
       alheio que se é o Googlebot, a cada publicação e para sempre, é mentir a
       alguém que não tem como saber. O que a verificação faz, e diz que faz,
       está no scripts/verify.mjs. */
    credencial: 'https://credentials.itcilo.org/81ebaf6f-012a-4df7-b1ef-631f25e3fa09',
  },
  {
    id: 'iese-communicating-presence',
    curso: {
      pt: 'Communicating with Presence',
      en: 'Communicating with Presence',
      fr: 'Communicating with Presence',
      es: 'Communicating with Presence',
    },
    instituicao: 'IESE Business School',
    periodo: { inicio: '2024-09', fim: '2024-09' },
    credencial: 'https://www.coursera.org/account/accomplishments/specialization/IK0J8UUOCWOQ',
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
    credencial: 'https://www.coursera.org/account/accomplishments/verify/7TNLCAUMTMAH',
  },
  {
    id: 'google-project-management',
    curso: {
      pt: 'Project Management',
      en: 'Project Management',
      fr: 'Project Management',
      es: 'Project Management',
    },
    // Sem «Google» no nome do curso: a coluna do lado já diz de quem é, e
    // «Google Project Management · Google» gagueja. A mesma razão que tirou o
    // «Microsoft» ao certificado de relações públicas.
    instituicao: 'Google',
    periodo: { inicio: '2024-09', fim: '2024-09' },
    credencial: 'https://www.coursera.org/account/accomplishments/professional-cert/XF2W2PIEBHSB',
  },
  {
    id: 'lbs-future-ready',
    curso: {
      pt: 'Future Ready Company',
      en: 'Future Ready Company',
      fr: 'Future Ready Company',
      es: 'Future Ready Company',
    },
    instituicao: 'London Business School',
    periodo: { inicio: '2024-09', fim: '2024-09' },
    credencial: 'https://www.coursera.org/account/accomplishments/specialization/2WP0O96SG206',
  },
], 'percurso.formacao')
