import { Contacto, parse } from './schema.ts'

export const contacto = parse(Contacto, {
  email: 'fabio@salgado.zip',
  linkedin: 'https://www.linkedin.com/in/fvsalgado',
  concelho: {
    pt: 'Alfama, Lisboa · Ribeira Branca, Torres Novas',
    en: 'Alfama, Lisbon · Ribeira Branca, Torres Novas',
  },
  naturalidade: { pt: 'natural da Nazaré', en: 'born in Nazaré' },
  regiao: 'Lisboa e Torres Novas',
  idiomas: [
    { lingua: { pt: 'Português', en: 'Portuguese' }, nivel: { pt: 'nativo', en: 'native' } },
    { lingua: { pt: 'Inglês', en: 'English' }, nivel: { pt: 'avançado, EF SET C2', en: 'advanced, EF SET C2' } },
    { lingua: { pt: 'Espanhol', en: 'Spanish' }, nivel: { pt: 'intermédio', en: 'intermediate' } },
    { lingua: { pt: 'Francês', en: 'French' }, nivel: { pt: 'intermédio', en: 'intermediate' } },
    {
      lingua: { pt: 'Língua Gestual Portuguesa', en: 'Portuguese Sign Language' },
      nivel: { pt: 'básico', en: 'basic' },
    },
  ],
}, 'contacto')
