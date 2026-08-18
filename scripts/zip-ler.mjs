/**
 * Leitor mínimo de ZIP: nomes, tamanhos e conteúdo de uma entrada.
 *
 * Escrito à mão em vez de mais uma dependência — são quarenta linhas e evita
 * pôr um pacote no `verify` só para confirmar que o `.zip` abre.
 */
import { inflateRawSync } from 'node:zlib'

const FIM_CD = 0x06054b50
const CD = 0x02014b50

export function lerZip(buf) {
  let i = buf.length - 22
  for (; i >= 0; i--) if (buf.readUInt32LE(i) === FIM_CD) break
  if (i < 0) throw new Error('não encontrei o fim do diretório central: o .zip está corrompido')

  const total = buf.readUInt16LE(i + 10)
  let p = buf.readUInt32LE(i + 16)
  const entradas = []

  for (let n = 0; n < total; n++) {
    if (buf.readUInt32LE(p) !== CD) throw new Error('entrada inválida no diretório central')
    const metodo = buf.readUInt16LE(p + 10)
    const comprimido = buf.readUInt32LE(p + 20)
    const original = buf.readUInt32LE(p + 24)
    const nLen = buf.readUInt16LE(p + 28)
    const eLen = buf.readUInt16LE(p + 30)
    const cLen = buf.readUInt16LE(p + 32)
    const desloc = buf.readUInt32LE(p + 42)
    const nome = buf.toString('utf8', p + 46, p + 46 + nLen)
    entradas.push({ nome, metodo, comprimido, original, desloc })
    p += 46 + nLen + eLen + cLen
  }

  const ler = (nome) => {
    const e = entradas.find((x) => x.nome === nome)
    if (!e) throw new Error(`entrada ausente: ${nome}`)
    const nLen = buf.readUInt16LE(e.desloc + 26)
    const eLen = buf.readUInt16LE(e.desloc + 28)
    const inicio = e.desloc + 30 + nLen + eLen
    const dados = buf.subarray(inicio, inicio + e.comprimido)
    return e.metodo === 0 ? dados : inflateRawSync(dados)
  }

  return { entradas, ler }
}
