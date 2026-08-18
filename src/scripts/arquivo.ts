/**
 * Camada JS progressiva. Nada aqui é necessário para a página funcionar: os
 * nós abrem com <details> nativo, o alternador de vista é um link e a
 * impressão tem regra CSS de recurso. Orçamento: < 10 kB no total, verificado
 * pela verificação 9 do verify.mjs.
 */

const raiz = document.documentElement

/* ── Tema ─────────────────────────────────────────────────────────────────
   O pré-paint vive em /tema.js, síncrono no <head>. Aqui só se alterna. */
function temaAtual(): 'light' | 'dark' {
  if (raiz.dataset.theme === 'dark' || raiz.dataset.theme === 'light') return raiz.dataset.theme
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-tema]')) {
  b.addEventListener('click', () => {
    const novo = temaAtual() === 'dark' ? 'light' : 'dark'
    raiz.dataset.theme = novo
    try {
      localStorage.setItem('tema', novo)
    } catch {
      /* modo privado: o tema vale só para esta página */
    }
  })
}

/* ── Abrir tudo / fechar tudo ─────────────────────────────────────────────── */
const todos = () => Array.from(document.querySelectorAll<HTMLDetailsElement>('[data-arvore] details'))

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-abrir-tudo]')) {
  b.addEventListener('click', () => todos().forEach((d) => (d.open = true)))
}
for (const b of document.querySelectorAll<HTMLButtonElement>('[data-fechar-tudo]')) {
  b.addEventListener('click', () => todos().forEach((d) => (d.open = false)))
}

/* ── Deep-link ────────────────────────────────────────────────────────────
   Abrir TODOS os ascendentes, não só o alvo. O Chrome já expande em navegação
   por fragmento; os outros não, e a assunção não é segura. */
function revelar(hash: string): void {
  if (!hash || hash.length < 2) return
  let alvo: Element | null = null
  try {
    alvo = document.querySelector(`#${CSS.escape(hash.slice(1))}`)
  } catch {
    return
  }
  if (!alvo) return

  for (let n: Element | null = alvo; n; n = n.parentElement) {
    if (n instanceof HTMLDetailsElement) n.open = true
  }
  const detalhe = alvo.closest('details')
  ;(detalhe ?? alvo).scrollIntoView({ block: 'start', behavior: 'auto' })
}

revelar(location.hash)
addEventListener('hashchange', () => revelar(location.hash))

/* ── Impressão ────────────────────────────────────────────────────────────
   O CSS não abre um <details> fechado de forma fiável: `[open]` é seletor,
   não atribuidor, e o conteúdo está atrás do slot do shadow DOM do agente de
   utilizador. Abre-se aqui e restaura-se a seguir. */
let fechadosAntes: HTMLDetailsElement[] = []

addEventListener('beforeprint', () => {
  fechadosAntes = todos().filter((d) => !d.open)
  fechadosAntes.forEach((d) => (d.open = true))
})

addEventListener('afterprint', () => {
  fechadosAntes.forEach((d) => (d.open = false))
  fechadosAntes = []
})

/* ── Revelar os controlos ─────────────────────────────────────────────────
   Nascem com `hidden` no HTML: sem JS não aparecem, porque sem JS não fazem
   nada. */
for (const c of document.querySelectorAll<HTMLElement>('[data-controlos]')) {
  c.hidden = false
}

/* ── Filtro ───────────────────────────────────────────────────────────────
   `/` foca, escrever filtra, Esc limpa e repõe o estado anterior. Sem JS o
   campo nem aparece, portanto nada disto é promessa que o HTML não cumpra. */
const filtro = document.querySelector<HTMLInputElement>('[data-filtro]')
const arvore = document.querySelector<HTMLElement>('[data-arvore]')

if (filtro && arvore) {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  let antes: Map<HTMLDetailsElement, boolean> | null = null
  const en = document.documentElement.lang.startsWith('en')

  // O resultado do filtro é anunciado — a quem vê e a quem ouve. Sem isto,
  // uma pesquisa sem resultados deixava a página aparentemente vazia.
  const estado = document.createElement('p')
  estado.className = 'filtro-estado'
  estado.setAttribute('aria-live', 'polite')
  estado.hidden = true
  arvore.after(estado)

  const anunciar = (q: string, n: number) => {
    if (!q) {
      estado.hidden = true
      estado.textContent = ''
      return
    }
    estado.hidden = false
    estado.textContent =
      n === 0
        ? en
          ? `nothing matches “${q}” — Esc clears`
          : `nada corresponde a «${q}» — Esc limpa`
        : en
          ? `${n} ${n === 1 ? 'result' : 'results'} for “${q}”`
          : `${n} ${n === 1 ? 'resultado' : 'resultados'} para «${q}»`
  }

  const aplicar = (bruto: string) => {
    const q = norm(bruto.trim())
    const nos = Array.from(arvore.querySelectorAll<HTMLLIElement>('li.no'))

    if (!q) {
      nos.forEach((li) => li.classList.remove('no--oculto'))
      if (antes) {
        antes.forEach((aberto, d) => (d.open = aberto))
        antes = null
      }
      anunciar('', 0)
      return
    }

    if (!antes) {
      antes = new Map(todos().map((d) => [d, d.open]))
    }

    // O texto próprio de um nó é a linha mais o corpo direto — sem os filhos
    // aninhados, senão «fado» acenderia projetos/ inteiro e nada se filtrava.
    const textoProprio = (li: HTMLLIElement) =>
      Array.from(
        li.querySelectorAll(
          ':scope > details > summary .linha, :scope > .linha, :scope > a.linha, ' +
            ':scope > details > .no__corpo > .no__texto, :scope > details > .no__corpo > .no__campos'
        )
      )
        .map((n) => n.textContent ?? '')
        .join(' ')

    nos.forEach((li) => li.classList.add('no--oculto'))
    let acertos = 0
    for (const li of nos) {
      if (!norm(textoProprio(li)).includes(q)) continue
      acertos++
      li.classList.remove('no--oculto')
      // Descendentes visíveis, ascendentes visíveis e abertos.
      li.querySelectorAll('li.no').forEach((filho) => filho.classList.remove('no--oculto'))
      for (let n: HTMLElement | null = li.parentElement; n && n !== arvore; n = n.parentElement) {
        if (n instanceof HTMLLIElement) n.classList.remove('no--oculto')
        if (n instanceof HTMLDetailsElement) n.open = true
      }
    }
    anunciar(bruto.trim(), acertos)
  }

  filtro.addEventListener('input', () => aplicar(filtro.value))
  filtro.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      filtro.value = ''
      aplicar('')
      filtro.blur()
    }
  })

  addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
    const alvo = e.target as HTMLElement
    if (alvo instanceof HTMLInputElement || alvo instanceof HTMLTextAreaElement) return
    e.preventDefault()
    filtro.focus()
  })
}
