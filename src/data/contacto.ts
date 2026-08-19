import { Contacto, parse } from './schema.ts'

export const contacto = parse(Contacto, {
  email: 'fabio@salgado.zip',
  linkedin: 'https://www.linkedin.com/in/fvsalgado',
  concelho: {
    pt: 'Alfama, Lisboa · Ribeira Branca, Torres Novas',
    en: 'Alfama, Lisbon · Ribeira Branca, Torres Novas',
    fr: 'Alfama, Lisbonne · Ribeira Branca, Torres Novas',
    es: 'Alfama, Lisboa · Ribeira Branca, Torres Novas',
  },
  naturalidade: {
    pt: 'natural da Nazaré',
    en: 'born in Nazaré',
    fr: 'né à Nazaré',
    es: 'natural de Nazaré',
  },

  nascimento: '1986',
  regiao: 'Lisboa e Torres Novas',
  /**
   * Os três lugares, por ordem biográfica: onde nasci, e os dois onde vivo.
   * Vão para o rodapé em coordenadas e mais nada — os nomes já estão aqui em
   * cima, e quem quiser sabe o que fazer com um par de graus decimais.
   *
   * Fonte: OpenStreetMap, via Nominatim (18/08/2026). Quatro casas decimais
   * chegam para acertar num bairro e não chegam para acertar numa porta, que
   * é exatamente a precisão que isto deve ter.
   */
  lugares: [
    { nome: 'Nazaré', lat: 39.6029, lon: -9.0702 },
    { nome: 'Alfama', lat: 38.7118, lon: -9.1284 },
    { nome: 'Ribeira Branca', lat: 39.4908, lon: -8.5759 },
  ],
  nota: {
    pt: 'Projetos, parcerias e conversas começam por aqui.',
    en: 'Projects, partnerships and conversations start here.',
    fr: 'Projets, partenariats et conversations commencent ici.',
    es: 'Proyectos, alianzas y conversaciones empiezan por aquí.',
  },
  idiomas: [
    {
      lingua: { pt: 'Português', en: 'Portuguese', fr: 'Portugais', es: 'Portugués' },
      nivel: { pt: 'nativo', en: 'native', fr: 'langue maternelle', es: 'nativo' },
    },
    {
      lingua: { pt: 'Inglês', en: 'English', fr: 'Anglais', es: 'Inglés' },
      nivel: {
        pt: 'avançado, EF SET C2',
        en: 'advanced, EF SET C2',
        fr: 'avancé, EF SET C2',
        es: 'avanzado, EF SET C2',
      },
    },
    {
      lingua: { pt: 'Espanhol', en: 'Spanish', fr: 'Espagnol', es: 'Español' },
      nivel: { pt: 'intermédio', en: 'intermediate', fr: 'intermédiaire', es: 'intermedio' },
    },
    {
      lingua: { pt: 'Francês', en: 'French', fr: 'Français', es: 'Francés' },
      nivel: { pt: 'intermédio', en: 'intermediate', fr: 'intermédiaire', es: 'intermedio' },
    },
    {
      lingua: {
        pt: 'Língua Gestual Portuguesa',
        en: 'Portuguese Sign Language',
        fr: 'Langue des signes portugaise',
        es: 'Lengua de Signos Portuguesa',
      },
      nivel: { pt: 'básico', en: 'basic', fr: 'notions', es: 'básico' },
    },
  ],
}, 'contacto')
