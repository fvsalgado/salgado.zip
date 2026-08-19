import { Mandato, parse } from './schema.ts'

/**
 * Uma linha por mandato, e não zero: dois cargos eleitos são a prova mais
 * antiga de «sala onde se decide» que há neste arquivo, e uma entrada vazia
 * num sítio com tão pouco texto é prova deitada fora.
 *
 * Só os cargos institucionais eleitos. O LinkedIn tem mais voluntariado, e a
 * decisão de o publicar ou não é do Fábio: num site que vai para candidaturas
 * em assuntos públicos, o associativismo político sinaliza alinhamento e isso
 * corta para os dois lados. Estes dois entram porque mostram experiência do
 * lado de quem decide, que é o que o cargo pede.
 */
export const mandatos = parse(Mandato.array(), [
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
    id: 'assembleia-nazare',
    cargo: {
      pt: 'Deputado Municipal',
      en: 'Municipal Assembly Deputy',
      fr: 'Élu à l’assemblée municipale',
      es: 'Diputado Municipal',
    },
    organizacao: 'Assembleia Municipal da Nazaré',
    periodo: { inicio: '2007-10', fim: '2015-09' },
    // As idades são derivadas do ano de nascimento, confirmado pelo Fábio; a
    // data completa fica de fora, que é dado de identidade e não de percurso.
    //
    // Dizia «Eleito aos 21 anos, para dois mandatos consecutivos», e errava nas
    // duas metades. Não houve eleição aos 21: houve candidatura aos 19 e posse
    // por substituição aos 21. E não foram dois mandatos: foi o resto de um,
    // um inteiro, e um terceiro deixado a meio. O período — 2007-10 a 2015-09 —
    // sempre esteve certo; era a frase por baixo que o contava mal.
    linhas: [
      {
        pt: 'Número dois da lista e mandatário da candidatura, aos 19 anos.',
        en: 'Number two on the list and election agent for the candidacy, at 19.',
        fr: 'Numéro deux de la liste et mandataire de la candidature, à 19 ans.',
        es: 'Número dos de la lista y mandatario de la candidatura, a los 19 años.',
      },
      {
        pt: 'Entrei por substituição em 2007, aos 21. Fiz depois um mandato completo, e um terceiro que interrompi a meio.',
        en: 'I took office by substitution in 2007, at 21. I then served one full term, and a third that I cut short halfway.',
        fr: 'Je suis entré par substitution en 2007, à 21 ans. J’ai ensuite fait un mandat complet, et un troisième que j’ai interrompu à mi-parcours.',
        es: 'Entré por sustitución en 2007, a los 21. Hice después un mandato completo, y un tercero que interrumpí a mitad.',
      },
    ],
  },
], 'mandatos')
