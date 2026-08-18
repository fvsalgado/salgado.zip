import { Contacto, parse } from './schema.ts'

export const contacto = parse(Contacto, {
  email: 'fabio@salgado.zip',
  linkedin: 'https://www.linkedin.com/in/fvsalgado',
  concelho: { pt: 'Médio Tejo, Portugal', en: 'Médio Tejo, Portugal' },
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
