import { z } from 'zod'
import { Lang, parse } from './schema.ts'
import linhas from '../generated/linhas.json' with { type: 'json' }

/** Cada língua agrupa os milhares à sua maneira; nenhuma delas à mão. */
const num = (l: string) => (linhas as { total: number }).total.toLocaleString(l)
const m = (linhas as { ficheiros: number }).ficheiros

/**
 * O colofão do SÍTIO: como esta página é feita. É aqui que o Claude entra por
 * extenso — mostrado no artefacto, não afirmado em adjetivos.
 */
export const colofaoSite = parse(z.array(Lang).min(1), [
  {
    pt: 'Astro estático, sem cookies e sem rastreio. Tipografia IBM Plex, auto-alojada.',
    en: 'Static Astro, no cookies and no tracking. IBM Plex type, self-hosted.',
  },
  {
    pt: `${num('pt-PT')} linhas de código em ${m} ficheiros. Uma fonte de dados; a página, os PDF, o resume.json e o zip saem dela.`,
    en: `${num('en-GB')} lines of code across ${m} files. One data source; the page, the PDFs, the resume.json and the zip come out of it.`,
  },
  {
    pt: 'Desenhado, escrito e construído a meias com o Claude — Claude Code, da Anthropic.',
    en: 'Designed, written and built together with Claude — Claude Code, by Anthropic.',
  },
], 'textos.colofaoSite')

/**
 * O colofão do DOCUMENTO, e não do sítio. Um colofão fala do objeto em que
 * está impresso: com que letra foi composto, como foi produzido e de onde veio.
 *
 * Quem tem o PDF na mão pode não saber de onde o papel veio — daí a
 * proveniência ser explícita, e não uma remissão para «este site». A data de
 * geração vai no rodapé de todas as páginas, que é onde sobrevive a uma folha
 * solta.
 */
export const colofaoDocumento = parse(z.array(Lang).min(1), [
  {
    pt: 'Composto em IBM Plex Serif e IBM Plex Mono. Paginado em HTML e impresso em PDF.',
    en: 'Set in IBM Plex Serif and IBM Plex Mono. Paginated in HTML and printed to PDF.',
  },
  {
    pt: 'Gerado a partir de salgado.zip, onde esta informação é mantida e verificada antes de cada publicação. Escrito e construído a meias com o Claude — Claude Code, da Anthropic.',
    en: 'Generated from salgado.zip, where this information is maintained and checked before every release. Written and built together with Claude — Claude Code, by Anthropic.',
  },
], 'textos.colofaoDocumento')

/**
 * A ressalva dos certificados. Vive aqui, e não dentro de um componente, porque
 * aparece nas duas renderizações: estava copiada à letra no Archive e no
 * Dossier, e duas cópias da mesma frase são duas frases à espera de divergir.
 */
export const notaCertificados = parse(Lang, {
  pt: 'Cursos online, feitos por conta própria. Não são graus destas instituições.',
  en: 'Online courses, taken independently. Not degrees from these institutions.',
}, 'textos.notaCertificados')

/** O código deste site é público: a prova do colofão está no repositório. */
export const codigoDoSite = 'https://github.com/fvsalgado/salgado.zip'
