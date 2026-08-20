/**
 * O texto de um PDF, folha a folha.
 *
 * Serve uma pergunta que a contagem de imagens não responde: em QUE FOLHA cai
 * cada secção do dossiê. As secções de texto — mandatos, certificados, idiomas,
 * colofão — não levam imagem nenhuma, e por isso a verificação 11 nunca soube
 * onde estavam. Souberam-no os olhos do Fábio, duas vezes, antes de mim.
 *
 * O Chromium escreve o texto em IDENTIFICADORES DE GLIFO, não em letras: cada
 * `<0023> Tj` é o glifo 0x23 de um subconjunto de tipo de letra embutido, e o
 * mesmo número quer dizer letras diferentes em tipos diferentes. Procurar
 * «Mandatos» no ficheiro cru não dá nada — tentei, e dá zero em todas as
 * folhas. O que traduz os números é o `/ToUnicode` de cada tipo, um CMap que o
 * próprio PDF traz para que o texto se possa copiar. É isso que isto lê.
 *
 * Não é um extrator de texto a sério: ignora posições, ordem de colunas e
 * espaços entre palavras — devolve as letras pela ordem em que foram
 * desenhadas. Chega e sobra para responder «esta frase está nesta folha?»,
 * que é a única pergunta que aqui se faz, desde que se compare sem espaços.
 *
 * Devolve `null` se não conseguir ler a estrutura, para quem chama poder dizer
 * «não sei» em vez de deixar passar.
 */
import { inflateSync } from 'node:zlib'

/** Os objetos do ficheiro, por número. */
function objetos(buf) {
  const bruto = buf.toString('latin1')
  const mapa = new Map()
  for (const m of bruto.matchAll(/(\d+)\s+0\s+obj([\s\S]*?)\bendobj/g)) {
    mapa.set(Number(m[1]), m[2])
  }
  return mapa
}

/** O conteúdo de um objeto-fluxo, descomprimido quando é Flate. */
function fluxo(obj) {
  const m = /stream\r?\n([\s\S]*?)\r?\nendstream/.exec(obj ?? '')
  if (m === null) return ''
  const cru = Buffer.from(m[1], 'latin1')
  if (!/\/Filter\s*\/FlateDecode/.test(obj)) return cru.toString('latin1')
  try {
    return inflateSync(cru).toString('latin1')
  } catch {
    return cru.toString('latin1')
  }
}

/** O CMap `/ToUnicode`: de identificador de glifo para letra. */
function paraUnicode(dados) {
  const mapa = new Map()
  const letra = (hex) => {
    let s = ''
    for (let i = 0; i < hex.length; i += 4) s += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16))
    return s
  }
  for (const bloco of dados.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const par of bloco[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      mapa.set(parseInt(par[1], 16), letra(par[2]))
    }
  }
  for (const bloco of dados.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const t of bloco[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const [ini, fim, base] = [parseInt(t[1], 16), parseInt(t[2], 16), parseInt(t[3], 16)]
      for (let k = ini; k <= fim; k += 1) mapa.set(k, String.fromCharCode(base + k - ini))
    }
  }
  return mapa
}

/**
 * O texto de cada folha, pela ordem das folhas no ficheiro, ou `null`.
 */
export function textoPorPagina(buf) {
  const objs = objetos(buf)
  if (objs.size === 0) return null
  const paginas = [...objs.values()].filter((c) => /\/Type\s*\/Page[^s]/.test(c))
  if (paginas.length === 0) return null

  return paginas.map((corpo) => {
    /* Os tipos de letra desta folha, cada um com o seu mapa. O mesmo número de
       glifo dá letras diferentes em tipos diferentes, e por isso o mapa tem de
       trocar quando o `Tf` troca. */
    const tipos = new Map()
    for (const f of corpo.matchAll(/\/(F\d+)\s+(\d+)\s+0\s+R/g)) {
      const fonte = objs.get(Number(f[2])) ?? ''
      const mt = /\/ToUnicode\s+(\d+)\s+0\s+R/.exec(fonte)
      tipos.set(f[1], mt === null ? new Map() : paraUnicode(fluxo(objs.get(Number(mt[1])))))
    }
    const mc = /\/Contents\s+(\d+)\s+0\s+R/.exec(corpo)
    if (mc === null) return ''
    const dados = fluxo(objs.get(Number(mc[1])))

    let atual = new Map()
    const letras = []
    for (const m of dados.matchAll(/\/(F\d+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f]+)>\s*Tj/g)) {
      if (m[1] !== undefined) {
        atual = tipos.get(m[1]) ?? new Map()
        continue
      }
      const hex = m[2]
      for (let i = 0; i < hex.length; i += 4) {
        letras.push(atual.get(parseInt(hex.slice(i, i + 4), 16)) ?? '')
      }
    }
    return letras.join('')
  })
}

/** Sem espaços e em minúsculas: o desenho não guarda os espaços entre palavras. */
export const achatar = (s) => s.replace(/\s+/g, '').toLowerCase()
