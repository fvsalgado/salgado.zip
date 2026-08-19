/**
 * Leitor mínimo de MP3: quanto tempo dura, e nada mais.
 *
 * Escrito à mão em vez de mais uma dependência — o `voz.mjs` precisa disto
 * para escrever o voz.json e o `verify.mjs` precisa do mesmo para confirmar
 * que o número publicado é o número do ficheiro. Um leitor partilhado é uma
 * resposta; dois leitores iguais em sítios diferentes são duas respostas à
 * espera de discordarem.
 *
 * A duração não é uma etiqueta que alguém escreveu no ficheiro: sai do
 * cabeçalho Xing/Info quando existe — a contagem de frames, exata mesmo em
 * bitrate variável — e do tamanho a dividir pelo bitrate quando não existe,
 * que é exato em bitrate constante. Os nove ficheiros de public/voz/ trazem
 * cabeçalho, e quatro deles são mesmo VBR: sem ler o cabeçalho, a conta pelo
 * bitrate dava-lhes menos um minuto do que duram.
 */

const BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0], // MPEG 1 Layer III
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0], // MPEG 2 / 2.5 Layer III
}
const AMOSTRAGENS = {
  3: [44100, 48000, 32000], // MPEG 1
  2: [22050, 24000, 16000], // MPEG 2
  0: [11025, 12000, 8000], // MPEG 2.5
}

/** Onde acaba a etiqueta ID3v2, se houver: o áudio começa a seguir. */
function inicioDoAudio(b) {
  if (b.length < 10 || b.subarray(0, 3).toString('latin1') !== 'ID3') return 0
  const tamanho = (b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]
  const rodape = (b[5] & 0x10) === 0x10 ? 10 : 0
  return 10 + tamanho + rodape
}

/** Onde começa a etiqueta ID3v1, se houver: 128 bytes que não são áudio. */
function fimDoAudio(b) {
  if (b.length >= 128 && b.subarray(b.length - 128, b.length - 125).toString('latin1') === 'TAG') {
    return b.length - 128
  }
  return b.length
}

/**
 * @returns {{ segundos: number, kbps: number, hz: number, fonte: 'Xing'|'Info'|'cbr' }}
 */
export function lerMp3(b) {
  const inicio = inicioDoAudio(b)
  const fim = fimDoAudio(b)

  for (let i = inicio; i < Math.min(b.length - 4, inicio + 200000); i++) {
    if (b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) continue

    const versao = (b[i + 1] >> 3) & 3 // 3 = MPEG1, 2 = MPEG2, 0 = MPEG2.5
    const camada = (b[i + 1] >> 1) & 3 // 1 = Layer III
    if (versao === 1 || camada !== 1) continue

    const kbps = BITRATES[versao === 3 ? 1 : 2][(b[i + 2] >> 4) & 15]
    const hz = AMOSTRAGENS[versao]?.[(b[i + 2] >> 2) & 3]
    if (!kbps || !hz) continue

    const mono = ((b[i + 3] >> 6) & 3) === 3
    const amostrasPorFrame = versao === 3 ? 1152 : 576

    // O cabeçalho Xing/Info vive dentro do primeiro frame, a seguir à
    // informação lateral, cujo tamanho depende da versão e do número de canais.
    const desvio = versao === 3 ? (mono ? 21 : 36) : mono ? 13 : 21
    const marca = b.subarray(i + desvio, i + desvio + 4).toString('latin1')
    if (marca === 'Xing' || marca === 'Info') {
      const bandeiras = b.readUInt32BE(i + desvio + 4)
      if (bandeiras & 0x1) {
        const frames = b.readUInt32BE(i + desvio + 8)
        if (frames > 0) {
          return { segundos: Math.round((frames * amostrasPorFrame) / hz), kbps, hz, fonte: marca }
        }
      }
    }

    return { segundos: Math.round(((fim - i) * 8) / (kbps * 1000)), kbps, hz, fonte: 'cbr' }
  }
  throw new Error('não encontrei um frame MPEG Layer III: o ficheiro não é um mp3 legível')
}
