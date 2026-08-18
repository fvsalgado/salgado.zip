import { Contacto, parse } from './schema.ts'

export const contacto = parse(Contacto, {
  email: 'fabio@salgado.zip',
  // Encontrado por pesquisa pública: o nome, o cargo e o username batem certo
  // com o do GitHub. Confirma na mesma antes de o mandares para candidaturas.
  linkedin: 'https://www.linkedin.com/in/fvsalgado',
  concelho: { pt: 'Médio Tejo, Portugal', en: 'Médio Tejo, Portugal' },
}, 'contacto')
