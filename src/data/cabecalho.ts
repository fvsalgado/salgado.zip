import { Cabecalho, parse } from './schema.ts'

export const cabecalho = parse(Cabecalho, {
  nome: 'Fábio Salgado',
  cargo: {
    pt: 'Consultor de assuntos públicos',
    en: 'Public affairs consultant',
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
      pt: 'Nasci na Nazaré e foi lá que fui eleito pela primeira vez, em 2007, aos 21 anos. Divido-me hoje entre Alfama, em Lisboa, e Ribeira Branca, em Torres Novas.',
      en: 'I was born in Nazaré, and it was there that I was first elected, in 2007, at 21. Today I split my time between Alfama, in Lisbon, and Ribeira Branca, in Torres Novas.',
    },
    {
      pt: 'Desde então: uma loja minha, o balcão e o palco de uma sala de espetáculos, quatro anos num gabinete da Câmara de Lisboa, e hoje consultoria de assuntos públicos. Pelo meio comecei a construir software, e há pouco a produzir fado — sem largar nada.',
      en: 'Since then: a shop of my own, the counter and the stage of a small venue, four years in a Lisbon City Hall office, and today public affairs consulting. Somewhere in there I started building software, and more recently producing fado — without letting go of anything.',
    },
    {
      // Antes dizia «o que não está confirmado não entra», que soa a regra de
      // um sistema e não a uma pessoa: quem confirma sou eu, e a frase tem de
      // dizer isso. O método detalhado vive no colofão, que é o lugar dele.
      pt: 'Isto é o arquivo desse trabalho. Sou eu que o mantenho, e cada entrada diz o que é, quando foi e o que eu lá fiz.',
      en: 'This is the archive of that work. I keep it myself, and every entry says what it is, when it was, and what I did there.',
    },
    {
      // «isto» e não «este site»: a mesma linha sai em página e em PDF, e quem
      // tem o papel na mão pode nem saber de onde o papel veio.
      pt: 'Construo a meias com o Claude, entre outras ferramentas — isto incluído. Está tudo listado em baixo.',
      en: 'I build together with Claude, among other tools — this included. Everything is listed below.',
    },
  ],
}, 'cabecalho')
