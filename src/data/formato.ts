import type { Lang, Periodo, Idioma } from './index.ts'

/**
 * Na fase 6 o `.optional()` sai do esquema e o `?? v.pt` passa a código morto,
 * porque o build deixa de aceitar uma chave `en` em falta.
 */
export function t(v: Lang, idioma: Idioma): string {
  return (idioma === 'en' ? v.en : v.pt) ?? v.pt
}

const EM_CURSO: Record<Idioma, string> = { pt: 'em curso', en: 'ongoing' }

export function periodo(p: Periodo): string {
  const ano = (s: string) => s.slice(0, 4)
  if (p.fim === null) return `${ano(p.inicio)} →`
  if (ano(p.fim) === ano(p.inicio)) return ano(p.inicio)
  return `${ano(p.inicio)}–${ano(p.fim)}`
}

export function periodoLongo(p: Periodo, idioma: Idioma): string {
  const ano = (s: string) => s.slice(0, 4)
  return p.fim === null ? `${ano(p.inicio)} – ${EM_CURSO[idioma]}` : periodo(p)
}

/** Tamanhos em SI, a partir do valor real em bytes lido no build. */
export function tamanho(bytes: number | null): string {
  if (bytes === null) return '—'
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1000 * 1000) return `${(bytes / 1000).toFixed(bytes < 10000 ? 1 : 0)} kB`
  return `${(bytes / 1e6).toFixed(1)} MB`
}

export function dataCurta(iso: string | undefined, idioma: Idioma): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat(idioma === 'en' ? 'en-GB' : 'pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

const ESTADOS: Record<string, Record<Idioma, string>> = {
  ativo: { pt: 'ativo', en: 'live' },
  arquivado: { pt: 'arquivado', en: 'archived' },
  privado: { pt: 'privado', en: 'private' },
}
export function estado(e: string, idioma: Idioma): string {
  return ESTADOS[e]?.[idioma] ?? e
}
