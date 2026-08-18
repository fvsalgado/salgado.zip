import { z } from 'zod'
import { Lang, parse } from './schema.ts'
import linhas from '../generated/linhas.json' with { type: 'json' }

const n = (linhas as { total: number }).total.toLocaleString('pt-PT')
const m = (linhas as { ficheiros: number }).ficheiros

/**
 * O colofão é a prova do método: como este site é feito. É aqui que o Claude
 * entra por extenso — mostrado no artefacto, não afirmado em adjetivos.
 */
export const colofao = parse(z.array(Lang).min(1), [
  {
    pt: 'Astro estático, sem cookies e sem rastreio. Tipografia IBM Plex, auto-alojada.',
    en: 'Static Astro, no cookies and no tracking. IBM Plex type, self-hosted.',
  },
  {
    pt: `${n} linhas de código em ${m} ficheiros. Uma fonte de dados; a página, os PDF, o resume.json e o zip saem dela.`,
    en: `${n.replace(/\u00a0|\s/g, ',')} lines of code across ${m} files. One data source; the page, the PDFs, the resume.json and the zip come out of it.`,
  },
  {
    pt: 'Desenhado, escrito e construído a meias com o Claude — Claude Code, da Anthropic.',
    en: 'Designed, written and built together with Claude — Claude Code, by Anthropic.',
  },
], 'textos.colofao')

/** O código deste site é público: a prova do colofão está no repositório. */
export const codigoDoSite = 'https://github.com/fvsalgado/salgado.zip'
