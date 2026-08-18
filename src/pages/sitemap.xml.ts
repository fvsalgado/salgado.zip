import type { APIRoute } from 'astro'
import { CANONICO, datas } from '../data'

/** Escrito à mão porque são duas rotas. Uma dependência a menos. */
const rotas = ['/', '/dossie/']

export const GET: APIRoute = () => {
  const lastmod = Object.values(datas).sort().at(-1)
  const urls = rotas
    .map(
      (r) =>
        `  <url><loc>${CANONICO}${r}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    )
    .join('\n')
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  )
}
