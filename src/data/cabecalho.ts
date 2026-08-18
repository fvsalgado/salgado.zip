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
   * A voz é a do arquivo, não a do candidato: começa por dizer o que isto é, e
   * só depois quem o mantém. Um arquivo não anda à procura de nada — é a
   * diferença entre um percurso contado e um percurso arquivado, e é ela que
   * deixa a cronologia entrar sem que a página passe a carta de candidatura.
   *
   * A geografia saiu daqui e não se perdeu: está na tarja de contacto do PDF,
   * no nó `contacto/` e, em coordenadas, no rodapé. Dizê-la aqui era dizê-la
   * duas vezes na mesma página de papel.
   */
  linhas: [
    {
      // «Começa em 2007» e não «a entrada mais antiga é de 2007»: a linha de
      // totais, seis linhas abaixo, já diz a segunda versão, e contada pelo
      // build. Dizer as duas era a mesma frase duas vezes à distância de um
      // parágrafo.
      pt: 'Isto é um arquivo de trabalho, e sou eu que o mantenho. Começa em 2007, quando fui eleito para a Assembleia Municipal da Nazaré, aos 21 anos.',
      en: "This is a working archive, and I'm the one who keeps it. It starts in 2007, when I was elected to the Nazaré municipal assembly, at 21.",
    },
    {
      pt: 'Desde então: uma loja minha, o balcão e o palco de uma sala de espetáculos, quatro anos num gabinete da Câmara de Lisboa, e hoje consultoria de assuntos públicos. Pelo meio comecei a construir software, e há pouco a produzir fado — sem largar nada.',
      en: "Since then: a shop of my own, the counter and the stage of a small venue, four years in a Lisbon City Hall office, and today public affairs consulting. Somewhere in there I started building software, and more recently producing fado — without letting go of anything.",
    },
    {
      // A regra do arquivo é verdade a sério: a verificação 14 bloqueia a
      // publicação enquanto houver um período por confirmar. Diz mais sobre
      // quem escreve do que qualquer adjetivo que se pudesse pôr aqui.
      pt: 'Cada entrada diz o que é, quando foi e o que eu lá fiz. O que não está confirmado não entra.',
      en: "Every entry says what it is, when it was, and what I did there. What isn't confirmed doesn't go in.",
    },
    {
      // «isto» e não «este site»: a mesma linha sai em página e em PDF, e quem
      // tem o papel na mão pode nem saber de onde o papel veio.
      pt: 'Construo a meias com o Claude, entre outras ferramentas — isto incluído. Está tudo listado em baixo.',
      en: 'I build together with Claude, among other tools — this included. Everything is listed below.',
    },
  ],
}, 'cabecalho')
