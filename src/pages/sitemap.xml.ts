import type { APIRoute } from 'astro'
import { CANONICO, datas, IDIOMAS, LINGUAS, PADRAO } from '../data'

/**
 * Uma rota por língua, derivadas do registo de línguas. Escrito à mão eram
 * duas linhas; passando a quatro, seria a lista que se esquece de crescer.
 * Uma dependência a menos e nenhuma rota a menos.
 */
const rotas = IDIOMAS.map((i) => ({ caminho: LINGUAS[i].raiz, hreflang: LINGUAS[i].html }))

/** As alternativas de língua repetem-se em cada URL, como o protocolo exige. */
const alternativas = [...rotas, { caminho: LINGUAS[PADRAO].raiz, hreflang: 'x-default' }]
  .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${CANONICO}${a.caminho}"/>`)
  .join('\n')

export const GET: APIRoute = () => {
  const lastmod = Object.values(datas).sort().at(-1)
  const urls = rotas
    .map((r) =>
      [
        '  <url>',
        `    <loc>${CANONICO}${r.caminho}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        alternativas,
        '  </url>',
      ]
        .filter((l) => l !== null)
        .join('\n')
    )
    .join('\n')
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  )
}
