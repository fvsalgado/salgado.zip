/**
 * Leitor mínimo de MP4: quanto tempo dura e que tamanho tem a imagem.
 *
 * O irmão do `mp3-ler.mjs`, pela mesma razão: o `voz.mjs` precisa disto para
 * escrever o `voz.json` e o `verify.mjs` precisa do mesmo para confirmar que o
 * número publicado é o número do ficheiro. Um leitor partilhado é uma resposta.
 *
 * Lê duas caixas e mais nada. A `mvhd` traz a escala de tempo e a duração; a
 * `tkhd` de cada faixa traz a largura e a altura, nos últimos oito bytes, em
 * vírgula fixa 16.16 — a faixa de som tem-nas a zero, e é assim que se sabe
 * qual das faixas é a imagem.
 */

/** Percorre a árvore de caixas, descendo só nas que contêm outras. */
function caixas(b, inicio, fim, visita, nivel = 0) {
  let i = inicio
  while (i + 8 <= fim) {
    const tamanho32 = b.readUInt32BE(i)
    const tipo = b.subarray(i + 4, i + 8).toString('latin1')
    let tamanho = tamanho32
    let cabeca = 8
    if (tamanho32 === 1) {
      // Caixa grande: o tamanho real vem a seguir, em 64 bits.
      tamanho = Number(b.readBigUInt64BE(i + 8))
      cabeca = 16
    } else if (tamanho32 === 0) {
      tamanho = fim - i // vai até ao fim do ficheiro
    }
    if (tamanho < cabeca) break
    visita(tipo, i + cabeca, Math.min(i + tamanho, fim))
    if (['moov', 'trak', 'mdia', 'minf', 'stbl'].includes(tipo) && nivel < 6) {
      caixas(b, i + cabeca, Math.min(i + tamanho, fim), visita, nivel + 1)
    }
    i += tamanho
  }
}

/**
 * @returns {{ segundos: number, largura: number, altura: number }}
 */
export function lerMp4(b) {
  let segundos = null
  let largura = 0
  let altura = 0

  caixas(b, 0, b.length, (tipo, inicio, fim) => {
    if (tipo === 'mvhd') {
      const versao = b[inicio]
      const escala = versao === 1 ? b.readUInt32BE(inicio + 20) : b.readUInt32BE(inicio + 12)
      const duracao =
        versao === 1 ? Number(b.readBigUInt64BE(inicio + 24)) : b.readUInt32BE(inicio + 16)
      if (escala > 0) segundos = duracao / escala
    }
    if (tipo === 'tkhd' && fim - inicio >= 8) {
      const w = b.readUInt32BE(fim - 8) >>> 16
      const h = b.readUInt32BE(fim - 4) >>> 16
      // A faixa de som traz zeros aqui. Fica a maior, que é a da imagem.
      if (w * h > largura * altura) {
        largura = w
        altura = h
      }
    }
  })

  if (segundos === null) throw new Error('não encontrei a caixa mvhd: o ficheiro não é um mp4 legível')
  if (!largura || !altura) throw new Error('não encontrei as dimensões da imagem')
  return { segundos: Math.round(segundos), largura, altura }
}
