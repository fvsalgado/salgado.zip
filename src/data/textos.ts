import { z } from 'zod'
import { Lang, parse } from './schema.ts'

/**
 * O leia-me dá voz ao arquivo. Primeira pessoa, frases curtas, zero adjetivos:
 * o texto afirma factos que o resto do site cumpre.
 */
export const leiaMe = parse(z.array(Lang).min(1), [
  {
    pt: 'Isto é um arquivo, não um cartão de visita. Cada linha diz o que é, desde quando e em que estado. Os tamanhos dos ficheiros são reais, as datas vêm do repositório, as contagens são calculadas.',
    en: 'This is an archive, not a business card. Each line says what it is, since when, and in what state. File sizes are real, dates come from the repository, counts are computed.',
  },
  {
    pt: 'Faço três coisas que parecem distantes e não são: aconselho quem lida com regulação, produzo fado, construo sites e aplicações. O que as junta é o mesmo gesto — perceber um sistema, encontrar-lhe as regras e fazer alguma coisa com isso.',
    en: 'I do three things that look far apart and are not: I advise people who deal with regulation, I produce fado, I build sites and applications. What joins them is the same move — understand a system, find its rules, and make something with it.',
  },
  {
    pt: 'O resto explica-se sozinho.',
    en: 'The rest explains itself.',
  },
], 'textos.leiaMe')

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
    pt: 'Uma fonte de dados, cinco saídas: este arquivo, o dossiê, dois PDF, o resume.json e o próprio salgado.zip.',
    en: 'One data source, five outputs: this archive, the dossier, two PDFs, the resume.json and salgado.zip itself.',
  },
  {
    pt: 'Catorze verificações correm antes de cada publicação: contraste, ligações, navegação sem JavaScript, fugas de conteúdo privado.',
    en: 'Fourteen checks run before every release: contrast, links, JavaScript-free navigation, private-content leaks.',
  },
  {
    pt: 'Desenhado, escrito e construído a meias com o Claude — Claude Code, da Anthropic. Do primeiro plano ao deploy.',
    en: 'Designed, written and built together with Claude — Claude Code, by Anthropic. From first plan to deploy.',
  },
], 'textos.colofao')
