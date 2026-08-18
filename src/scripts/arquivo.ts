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
