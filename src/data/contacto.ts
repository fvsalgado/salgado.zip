import { Contacto, parse } from './schema.ts'

export const contacto = parse(Contacto, {
  // Por confirmar. `verify.mjs` (verificação 14) falha enquanto for null,
  // e é por isso que o PR não sai de rascunho. Nunca um marcador em texto.
  email: null,
  linkedin: null,
  concelho: { pt: 'Médio Tejo, Portugal', en: 'Médio Tejo, Portugal' },
}, 'contacto')
