import { Cabecalho, parse } from './schema.ts'
import { idadeEm } from './contacto.ts'

/* O ano da candidatura que deu a estreia na política. A idade sai dele e do
   ano de nascimento, e deixa de estar escrita à letra em quatro línguas: era
   a MESMA idade que os mandatos já derivavam, e mudar o ano de nascimento
   fazia a mesma página dizer duas coisas. */
const ESTREIA = 2005

export const cabecalho = parse(Cabecalho, {
  nome: 'Fábio Salgado',
  cargo: {
    pt: 'Consultor de Public Affairs',
    en: 'Public affairs consultant',
    fr: 'Consultant en affaires publiques',
    es: 'Consultor de asuntos públicos',
  },
  /**
   * Para o <title> e pouco mais. O cargo fica para o JSON-LD.
   *
   * «assuntos públicos» e não «políticas públicas»: é o nome do ofício, o
   * mesmo que está no cargo. «software» e não «produtos digitais»: uma das
   * duas é uma palavra e a outra é uma categoria de brochura.
   */
  areas: {
    pt: 'assuntos públicos, cultura e software',
    en: 'public affairs, culture and software',
    // «logiciel» e não «tech»: em francês a palavra existe, e a outra é uma
    // categoria de brochura na mesma. Em espanhol «software» é a palavra
    // corrente, e traduzi-la seria escrever mais claro do que se fala.
    fr: 'affaires publiques, culture et logiciel',
    es: 'asuntos públicos, cultura y software',
  },
  /**
   * O nome é o <h1> e `areas` é a linha de ofício por baixo. As linhas abaixo
   * são a prosa, e são a mesma prosa em quatro sítios: a página, o cabeçalho
   * do PDF ao lado do retrato, o `summary` do resume.json (concatenadas) e o
   * LEIA-ME.txt do zip. Têm de se ler como um parágrafo, não como tópicos.
   *
   * Pessoa, percurso, método — por esta ordem, e a ordem é o argumento. A
   * versão anterior abria por «isto é um arquivo de trabalho»: punha o objeto
   * à frente de quem o fez, e quem lia ficava a saber o que a página era antes
   * de saber quem lá estava. Um arquivo continua a ser a moldura — é ela que
   * deixa entrar a cronologia sem que a página se leia como candidatura — mas
   * chega na terceira linha, depois do corpo e do percurso, não antes.
   */
  linhas: [
    {
      /**
       * Dizia «fui eleito pela primeira vez, em 2007, aos 21 anos», e isso
       * fundia dois momentos diferentes num só que não aconteceu: aos 19 fui
       * número dois de uma lista à assembleia municipal, e em 2007 entrei por
       * substituição. Dar a posse como eleição é errado, e ainda por cima
       * apagava o mais invulgar dos dois — o que se passou na estreia.
       *
       * A entrada fica com o começo; o detalhe do que veio depois vive em
       * `mandatos.ts`, que é a linha do próprio cargo.
       */
      pt: `Nasci na Nazaré e foi lá que entrei na política, aos ${idadeEm(ESTREIA)} anos, como número dois de uma lista à assembleia municipal. Divido-me hoje entre Alfama, em Lisboa, e Ribeira Branca, em Torres Novas.`,
      en: `I was born in Nazaré, and it was there that I entered politics, at ${idadeEm(ESTREIA)}, as number two on a list for the municipal assembly. Today I split my time between Alfama, in Lisbon, and Ribeira Branca, in Torres Novas.`,
      fr: `Je suis né à Nazaré, et c’est là que je suis entré en politique, à ${idadeEm(ESTREIA)} ans, comme numéro deux d’une liste à l’assemblée municipale. Aujourd’hui je partage mon temps entre Alfama, à Lisbonne, et Ribeira Branca, à Torres Novas.`,
      es: `Nací en Nazaré, y allí entré en política, a los ${idadeEm(ESTREIA)} años, como número dos de una lista a la asamblea municipal. Hoy reparto mi tiempo entre Alfama, en Lisboa, y Ribeira Branca, en Torres Novas.`,
    },
    {
      pt: 'Desde então: uma loja minha, o balcão e o palco de uma sala de espetáculos, quatro anos num gabinete da Câmara de Lisboa, e hoje consultoria de assuntos públicos. Pelo meio comecei a construir software, e há pouco a produzir fado — sem largar nada.',
      en: 'Since then: a shop of my own, the counter and the stage of a small venue, four years in a Lisbon City Hall office, and today public affairs consulting. Somewhere in there I started building software, and more recently producing fado — without letting go of anything.',
      fr: 'Depuis lors : une boutique à moi, le comptoir et la scène d’une petite salle de spectacle, quatre ans dans un cabinet de la Mairie de Lisbonne, et aujourd’hui le conseil en affaires publiques. Entre-temps je me suis mis à construire des logiciels, et depuis peu à produire du fado — sans rien lâcher.',
      es: 'Desde entonces: una tienda propia, la barra y el escenario de una sala de espectáculos, cuatro años en un gabinete del Ayuntamiento de Lisboa, y hoy consultoría de asuntos públicos. Por el camino empecé a construir software, y hace poco a producir fado — sin soltar nada.',
    },
    {
      // Antes dizia «o que não está confirmado não entra», que soa a regra de
      // um sistema e não a uma pessoa: quem confirma sou eu, e a frase tem de
      // dizer isso. O método detalhado vive no colofão, que é o lugar dele.
      pt: 'Isto é o arquivo desse trabalho. Sou eu que o mantenho, e cada entrada diz o que é, quando foi e o que eu lá fiz.',
      en: 'This is the archive of that work. I keep it myself, and every entry says what it is, when it was, and what I did there.',
      fr: 'Ceci est l’archive de ce travail. C’est moi qui la tiens, et chaque entrée dit ce qu’elle est, quand c’était et ce que j’y ai fait.',
      es: 'Este es el archivo de ese trabajo. Lo mantengo yo, y cada entrada dice qué es, cuándo fue y qué hice allí.',
    },
    {
      // «isto» e não «este site»: a mesma linha sai em página e em PDF, e quem
      // tem o papel na mão pode nem saber de onde o papel veio.
      pt: 'Construo a meias com o Claude, entre outras ferramentas — isto incluído. Está tudo listado em baixo.',
      en: 'I build together with Claude, among other tools — this included. Everything is listed below.',
      fr: 'Je construis à deux avec Claude, parmi d’autres outils — ceci compris. Tout est listé ci-dessous.',
      es: 'Construyo a medias con Claude, entre otras herramientas — esto incluido. Está todo listado abajo.',
    },
  ],
}, 'cabecalho')
