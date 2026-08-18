/**
 * Um só sítio a resolver o Chromium.
 *
 * Em ambientes onde o browser já está instalado (CI, contentores), aponta-se
 * o caminho por CHROMIUM_PATH ou usa-se o link em /opt/pw-browsers/chromium.
 * Nunca correr `playwright install` — o browser já lá está.
 */
import { existsSync } from 'node:fs'
import { chromium } from 'playwright'

const PADRAO = '/opt/pw-browsers/chromium'

export function abrirBrowser() {
  const caminho = process.env.CHROMIUM_PATH || (existsSync(PADRAO) ? PADRAO : undefined)
  return chromium.launch(caminho ? { executablePath: caminho } : {})
}

export const BASE = process.env.BASE_URL || 'http://localhost:4321'
