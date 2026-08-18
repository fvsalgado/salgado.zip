import type { APIRoute } from 'astro'
import { CANONICO } from '../data'

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /og/',
      'Disallow: /cv/',
      '',
      `Sitemap: ${CANONICO}/sitemap.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
