import { z } from 'zod'
import { Lang, parse } from './schema.ts'

/**
 * O colofão é a prova do método: como este site é feito. É aqui que o Claude
 * entra por extenso — mostrado no artefacto, não afirmado em adjetivos.
 */
export const colofao = parse(z.array(Lang).min(1), [
  {
    pt: 'Astro estático. Sem cookies, sem rastreio, sem um único pedido a terceiros. Tipografia IBM Plex, auto-alojada.',
    en: 'Static Astro. No cookies, no tracking, not a single third-party request. IBM Plex type, self-hosted.',
  },
  {
    pt: 'Uma fonte de dados, várias saídas: esta página, o CV e o portefólio em PDF, o resume.json e o próprio salgado.zip.',
    en: 'One data source, several outputs: this page, the CV and portfolio PDFs, the resume.json and salgado.zip itself.',
  },
  {
    pt: 'Uma bateria de verificações corre antes de cada publicação: contraste, ligações, navegação sem JavaScript, fugas de conteúdo privado.',
    en: 'A battery of checks runs before every release: contrast, links, JavaScript-free navigation, private-content leaks.',
  },
  {
    pt: 'Desenhado, escrito e construído a meias com o Claude — Claude Code, da Anthropic. Do primeiro plano ao deploy.',
    en: 'Designed, written and built together with Claude — Claude Code, by Anthropic. From first plan to deploy.',
  },
], 'textos.colofao')

/** O código deste site é público: a prova do colofão está no repositório. */
export const codigoDoSite = 'https://github.com/fvsalgado/salgado.zip'
