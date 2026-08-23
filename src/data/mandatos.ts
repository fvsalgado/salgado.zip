import { Mandato, parse } from './schema.ts'
import { idadeEm } from './contacto.ts'

/**
 * Uma linha por mandato, e agora é literal: quatro mandatos, quatro entradas.
 *
 * Estiveram dois, e um deles somava três mandatos numa linha só — «2007-10 a
 * 2015-09» com a explicação por baixo. O período estava certo e a contagem
 * também, mas quem lê uma listagem conta linhas, não lê explicações: via dois
 * mandatos onde houve quatro. Divididos, contam-se pelos olhos.
 *
 * As fronteiras entre eles são as das autárquicas, que são facto público: 2005,
 * 2009 e 2013, com a assembleia a instalar-se em outubro de cada uma. Os dois
 * extremos são os que o Fábio confirmou — entrada por substituição em outubro
 * de 2007, saída em setembro de 2015 — e são também os dois que não coincidem
 * com uma eleição, que é precisamente o que faz deles meios mandatos.
 *
 * Só os cargos institucionais eleitos. O LinkedIn tem mais voluntariado, e a
 * decisão de o publicar ou não é do Fábio: num site que vai para candidaturas
 * em assuntos públicos, o associativismo político sinaliza alinhamento e isso
 * corta para os dois lados. Estes entram porque mostram experiência do lado de
 * quem decide, que é o que o cargo pede.
 */


/**
 * O cargo, e o francês foi o que deu trabalho.
 *
 * Dizia «Élu à l’assemblée municipale» — «eleito». As outras três línguas usam
 * um nome de cargo neutro, e o francês afirmava a forma de entrada. Na entrada
 * de 2007-2009 isso ficava por cima da frase «et non par une élection»: o
 * rótulo desmentia, na mesma linha, a ressalva mais cuidada desta listagem.
 *
 * «Membre» espelha o da freguesia e não afirma nada sobre como se entrou.
 */
const DEPUTADO = {
  pt: 'Deputado Municipal',
  en: 'Municipal Assembly Deputy',
  fr: 'Membre de l’assemblée municipale',
  es: 'Diputado Municipal',
}
const NAZARE = 'Assembleia Municipal da Nazaré'

export const mandatos = parse(
  Mandato.array(),
  [
    {
      id: 'santa-maria-maior',
      cargo: { pt: 'Membro', en: 'Member', fr: 'Membre', es: 'Miembro' },
      organizacao: 'Assembleia de Freguesia de Santa Maria Maior, Lisboa',
      periodo: { inicio: '2017-10', fim: '2021-09' },
      linhas: [
        {
          pt: 'A freguesia do centro histórico de Lisboa — Alfama incluída.',
          en: "The parish of Lisbon's historic centre — Alfama included.",
          fr: 'La paroisse du centre historique de Lisbonne — Alfama comprise.',
          es: 'La parroquia del centro histórico de Lisboa — Alfama incluida.',
        },
      ],
    },
    {
      id: 'nazare-2013',
      cargo: DEPUTADO,
      organizacao: NAZARE,
      periodo: { inicio: '2013-10', fim: '2015-09' },
      linhas: [
        {
          pt: 'Terceira candidatura, e o mandato que interrompi a meio.',
          en: 'A third candidacy, and the term I cut short halfway.',
          fr: 'Troisième candidature, et le mandat que j’ai interrompu à mi-parcours.',
          es: 'Tercera candidatura, y el mandato que interrumpí a mitad.',
        },
      ],
    },
    {
      id: 'nazare-2009',
      cargo: DEPUTADO,
      organizacao: NAZARE,
      periodo: { inicio: '2009-10', fim: '2013-10' },
      linhas: [
        /* «Recandidatura» é um ato; «reeleito» é um resultado. O inglês e o
           francês diziam o segundo e o português e o espanhol o primeiro — e é
           precisamente a distinção que a entrada de baixo existe para guardar,
           onde se diz que a entrada foi por substituição e não por eleição.
           As quatro passam a dizer o que o português diz. */
        {
          pt: 'Recandidatura, e o único dos três que cumpri do princípio ao fim.',
          en: 'A new candidacy, and the only one of the three I served from start to finish.',
          fr: 'Nouvelle candidature, et le seul des trois que j’ai fait du début à la fin.',
          es: 'Recandidatura, y el único de los tres que cumplí de principio a fin.',
        },
      ],
    },
    {
      id: 'nazare-2005',
      cargo: DEPUTADO,
      organizacao: NAZARE,
      periodo: { inicio: '2007-10', fim: '2009-10' },
      linhas: [
        {
          /* O ano vai na frase. Esta entrada está rotulada 2007–2009 e abria com
             um facto de 2005 sem data nenhuma: quem lia via «19 anos» e «aos
             21» na mesma ficha sem saber que são dois atos com dois anos de
             intervalo. O 2005 só existia no `id`, que ninguém lê. */
          pt: `Número dois da lista e mandatário da candidatura de 2005, aos ${idadeEm(2005)} anos.`,
          en: `Number two on the list and election agent for the 2005 candidacy, at ${idadeEm(2005)}.`,
          fr: `Numéro deux de la liste et mandataire de la candidature de 2005, à ${idadeEm(2005)} ans.`,
          es: `Número dos de la lista y mandatario de la candidatura de 2005, a los ${idadeEm(2005)} años.`,
        },
        {
          pt: `Entrei por substituição em 2007, aos ${idadeEm(2007)} — a meio do mandato, e não por eleição.`,
          en: `I took office by substitution in 2007, at ${idadeEm(2007)} — halfway through the term, and not by election.`,
          fr: `Je suis entré par substitution en 2007, à ${idadeEm(2007)} ans — à mi-mandat, et non par une élection.`,
          es: `Entré por sustitución en 2007, a los ${idadeEm(2007)} — a mitad del mandato, y no por elección.`,
        },
      ],
    },
  ],
  'mandatos'
)
