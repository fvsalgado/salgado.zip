import type { Lang, Periodo, Idioma, Lugar } from './index.ts'
import { LINGUAS } from './idiomas.ts'

export function t(v: Lang, idioma: Idioma): string {
  return v[idioma]
}

const EM_CURSO: Record<Idioma, string> = {
  pt: 'em curso',
  en: 'ongoing',
  fr: 'en cours',
  es: 'en curso',
}

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

/**
 * Duração de uma leitura, para a coluna da listagem: `mm:ss`, ou `h:mm:ss`
 * quando passa da hora. É a notação de qualquer leitor de áudio, e lê-se igual
 * nas quatro línguas — um «17 min 52 s» traduzido quatro vezes era trabalho a
 * mais para dizer o mesmo.
 */
export function duracao(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  const dois = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${dois(m)}:${dois(s)}` : `${m}:${dois(s)}`
}

/** O total do nó: horas e minutos, que é a grandeza em que se pensa 1h53. */
export function duracaoLonga(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.round((segundos % 3600) / 60)
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`
}

/**
 * A mesma duração em ISO 8601, para o JSON-LD. O schema.org quer `PT17M52S`,
 * e não `17:52` — são o mesmo número em duas notações, e nenhuma das duas é
 * escrita à mão.
 */
export function duracaoISO(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`
}

export function dataCurta(iso: string | undefined, idioma: Idioma): string | null {
  if (!iso) return null
  // Data parcial — «2025», «2025-04» — devolve-se como está. Passá-la ao Intl
  // dava 01/01/2025, que é um dia que ninguém confirmou.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat(LINGUAS[idioma].bcp47, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

const ESTADOS: Record<string, Record<Idioma, string>> = {
  ativo: { pt: 'ativo', en: 'live', fr: 'en ligne', es: 'activo' },
  privado: { pt: 'privado', en: 'private', fr: 'privé', es: 'privado' },
}
export function estado(e: string, idioma: Idioma): string {
  return ESTADOS[e]?.[idioma] ?? e
}

/**
 * Graus decimais com sinal, WGS 84 — a forma que qualquer mapa aceita colada
 * na caixa de pesquisa, e a única que se lê igual nas quatro línguas (o oeste
 * é «O» em português, «W» em inglês, «O» em francês; um sinal menos não tem
 * língua).
 *
 * Quatro casas chegam para acertar num bairro e não chegam para acertar numa
 * porta. É a precisão que isto deve ter.
 */
export function coordenadas(lugares: readonly Lugar[]): string {
  return lugares.map((l) => `${l.lat.toFixed(4)}, ${l.lon.toFixed(4)}`).join(' · ')
}
