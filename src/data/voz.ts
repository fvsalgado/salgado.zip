import { Leitura, parse } from './schema.ts'

/**
 * As leituras em voz alta para o Alta Voz, o podcast do esquerda.net, entre
 * julho de 2018 e setembro de 2019.
 *
 * Porque é que o áudio vive nesta casa e não no editor
 * ───────────────────────────────────────────────────
 * Porque em nenhum outro sítio vive. O Alta Voz está no Spotify e na Apple
 * Podcasts, mas o feed é uma janela rolante de dez episódios: tudo o que é
 * anterior a novembro de 2024 caiu fora, e com ele estas nove. No Deezer o
 * programa não existe; no YouTube não há rasto. Verificado a 19/08/2026.
 *
 * O que restava era o esquerda.net continuar a servir nove ficheiros de 2018.
 * Não é salvaguarda nenhuma. Os mp3 aqui guardados são os originais byte a
 * byte — o `sha256` de cada um é o do ficheiro que o esquerda.net serviu — e
 * a `origem` continua a mandar quem lê para a página do editor, que é onde
 * está o texto, o contexto e o resto dos créditos.
 *
 * O que é meu nisto é a voz. Os textos são de quem os escreveu e de quem os
 * traduziu, e é por isso que cada entrada abre com a autoria e não com o
 * título: numa lista de leituras, o nome que interessa primeiro não é o de
 * quem lê.
 */

/**
 * Os dois vídeos são de outra proveniência: promoções do Transborda, a mostra
 * de artes performativas de Almada, publicadas na página do festival.
 *
 * Vieram em VP9 dentro de um MP4 — a combinação que o Facebook serve e que o
 * Safari não reproduz, o que deixava todos os iPhones com um vídeo partido.
 * Foram recodificados uma vez para H.264 com áudio AAC, a 24 de CRF, que toca
 * em tudo e ficou no mesmo tamanho do original. O `sha256` de cada um é o do
 * ficheiro publicado, não o do original: aqui o que se guarda é uma cópia que
 * funciona, e não uma cópia exata de um ficheiro que meio mundo não abria.
 */

/** Quando as cópias foram tiradas do esquerda.net. */
export const RECOLHA = '2026-08-19'

/** A rubrica do editor. Não é um projeto meu, e o nó tem de o dizer. */
export const RUBRICA = { nome: 'Alta Voz', editor: 'esquerda.net' }

const VOZ = {
  pt: 'voz',
  en: 'voice',
  fr: 'voix',
  es: 'voz',
}
const LEITURA = {
  pt: 'leitura',
  en: 'reading',
  fr: 'lecture',
  es: 'lectura',
}
const NARRACAO = {
  pt: 'narração',
  en: 'narration',
  fr: 'narration',
  es: 'narración',
}

/** Ordem cronológica inversa, como em `percurso/` e `projetos/`. */
export const leituras = parse(Leitura.array(), [
  {
    id: 'transborda-2025',
    titulo: 'Transborda 2025',
    autoria: 'Casa da Dança, Almada',
    fonte: {
      pt: 'Vídeo de promoção da 5.ª Mostra Internacional de Artes Performativas de Almada, de 17 de abril a 11 de maio de 2025.',
      en: 'Promotional film for the 5th International Performing Arts Festival of Almada, 17 April to 11 May 2025.',
      fr: 'Vidéo de promotion de la 5ᵉ Mostra internationale des arts performatifs d’Almada, du 17 avril au 11 mai 2025.',
      es: 'Vídeo de promoción de la 5.ª Muestra Internacional de Artes Performativas de Almada, del 17 de abril al 11 de mayo de 2025.',
    },
    papel: VOZ,
    rubrica: null,
    editor: 'Transborda, Almada',
    formato: 'video',
    data: '2025',
    origem: 'https://www.facebook.com/reel/1567148937283493',
    origemAudio: null,
    sha256: 'c192d38bf2a429584d08b0828e8e36f7bfe45090408c70ab4ebe00ce0569c75d',
  },
  {
    id: 'transborda-2023',
    titulo: 'Transborda 2023',
    autoria: 'Casa da Dança, Almada',
    fonte: {
      pt: 'Vídeo de promoção da 3.ª Mostra Internacional de Artes Performativas de Almada, de 29 de abril a 14 de maio de 2023.',
      en: 'Promotional film for the 3rd International Performing Arts Festival of Almada, 29 April to 14 May 2023.',
      fr: 'Vidéo de promotion de la 3ᵉ Mostra internationale des arts performatifs d’Almada, du 29 avril au 14 mai 2023.',
      es: 'Vídeo de promoción de la 3.ª Muestra Internacional de Artes Performativas de Almada, del 29 de abril al 14 de mayo de 2023.',
    },
    papel: VOZ,
    rubrica: null,
    editor: 'Transborda, Almada',
    formato: 'video',
    data: '2023',
    origem: 'https://www.facebook.com/reel/259311793127459',
    origemAudio: null,
    sha256: 'dcee08eb75e92e45fe91e485b46773b4f51375694bfb26ed2d2795dbeef3616f',
  },
  {
    id: 'alucinar-o-estrume',
    titulo: 'Alucinar o estrume',
    autoria: 'Júlio Henriques',
    fonte: {
      pt: 'Conto de Júlio Henriques.',
      en: 'A short story by Júlio Henriques.',
      fr: 'Nouvelle de Júlio Henriques.',
      es: 'Cuento de Júlio Henriques.',
    },
    papel: LEITURA,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2019-09-09',
    origem: 'https://www.esquerda.net/audio/alucinar-o-estrume-julio-henriques',
    origemAudio: 'https://www.esquerda.net/sites/default/files/alucinar_o_estrume_julio_henriques_conto.mp3',
    sha256: '8005eda6700f5c19e0c07017692c933c60a9643be371603a178d68b68ec21486',
    capa: { ficheiro: 'alucinar-o-estrume.webp', obra: 'Alucinar o Estrume' },
  },
  {
    id: 'vazio-estrategico',
    titulo: 'Vazio estratégico: o governo como objetivo',
    autoria: 'Manolo Monereo',
    fonte: {
      pt: 'Artigo de Manolo Monereo, na tradução de Carlos Santos.',
      en: 'An article by Manolo Monereo, in the Portuguese translation by Carlos Santos.',
      fr: 'Article de Manolo Monereo, dans la traduction portugaise de Carlos Santos.',
      es: 'Artículo de Manolo Monereo, en la traducción portuguesa de Carlos Santos.',
    },
    papel: LEITURA,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2019-07-09',
    origem: 'https://www.esquerda.net/audio/vazio-estrategico-o-governo-como-objetivo',
    origemAudio: 'https://www.esquerda.net/sites/default/files/vazio_estrategico_monereo.mp3',
    sha256: '4c985256bf1442b65c03ea9940a130ef9e4858e12c267a5e4031cd3cb3a4ca86',
  },
  {
    id: 'torto-arado',
    titulo: 'Torto Arado',
    autoria: 'Itamar Vieira Junior',
    fonte: {
      pt: 'Excerto do romance de Itamar Vieira Junior.',
      en: 'An excerpt from the novel by Itamar Vieira Junior.',
      fr: 'Extrait du roman d’Itamar Vieira Junior.',
      es: 'Fragmento de la novela de Itamar Vieira Junior.',
    },
    papel: LEITURA,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2019-02-18',
    origem: 'https://www.esquerda.net/audio/podcast-torto-arado',
    origemAudio: 'https://www.esquerda.net/sites/default/files/torto_arado.mp3',
    sha256: 'a3d638e467dc2c25404c1abaeba86e8d20ee761471567dfb125466175a8b130b',
    capa: { ficheiro: 'torto-arado.webp', obra: 'Torto Arado' },
  },
  {
    id: 'revolucao-esquecida',
    titulo: 'A Revolução esquecida',
    autoria: 'Carlos Carujo',
    fonte: {
      pt: 'Artigo de Carlos Carujo sobre Rosa Luxemburgo.',
      en: 'An article by Carlos Carujo on Rosa Luxemburg.',
      fr: 'Article de Carlos Carujo sur Rosa Luxemburg.',
      es: 'Artículo de Carlos Carujo sobre Rosa Luxemburgo.',
    },
    papel: NARRACAO,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2019-01-22',
    origem: 'https://www.esquerda.net/audio/podcast-revolucao-esquecida',
    origemAudio: 'https://www.esquerda.net/sites/default/files/rosa.mp3',
    sha256: '4411a5109de176c206ba3c30f5174a0b40717aad7cbdf3094a3308f5295d3fbe',
  },
  {
    id: 'arvore-de-natal',
    titulo: 'Uma árvore de Natal e um casamento',
    autoria: 'Fiódor Dostoiévski',
    fonte: {
      pt: 'Conto de Dostoiévski, na tradução de Ruth Guimarães.',
      en: 'A short story by Dostoevsky, in the Portuguese translation by Ruth Guimarães.',
      fr: 'Nouvelle de Dostoïevski, dans la traduction portugaise de Ruth Guimarães.',
      es: 'Cuento de Dostoievski, en la traducción portuguesa de Ruth Guimarães.',
    },
    papel: NARRACAO,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2018-12-17',
    origem: 'https://www.esquerda.net/audio/uma-arvore-de-natal-e-um-casamento-de-dostoievski',
    origemAudio: 'https://www.esquerda.net/sites/default/files/dostoievski.mp3',
    sha256: '531f57e1602d73a920309a9cfc00879d2e75bbb88aa2e52db7ccfa0c649b1537',
  },
  {
    id: 'tres-criticas-de-marx',
    titulo: 'As três críticas de Marx',
    autoria: 'Daniel Bensaïd',
    fonte: {
      pt: 'De «Marx, o Intempestivo», de Daniel Bensaïd.',
      en: 'From “Marx, o Intempestivo”, by Daniel Bensaïd.',
      fr: 'De « Marx l’intempestif », de Daniel Bensaïd.',
      es: 'De «Marx, o Intempestivo», de Daniel Bensaïd.',
    },
    papel: LEITURA,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2018-12-03',
    origem: 'https://www.esquerda.net/audio/tres-criticas-de-marx',
    origemAudio: 'https://www.esquerda.net/sites/default/files/marx.mp3',
    sha256: 'a45d48acef473adc3be9ef2cf1ebfb617b27e9a3d7dc2fcce7fc4586ae3293f6',
  },
  {
    id: 'uma-grande-familia',
    titulo: 'Uma grande família',
    autoria: 'Jorge Costa et al.',
    fonte: {
      pt: 'Trecho de «Os Donos de Portugal», de Jorge Costa, Luís Fazenda, Cecília Honório, Francisco Louçã e Fernando Rosas.',
      en: 'An excerpt from “Os Donos de Portugal”, by Jorge Costa, Luís Fazenda, Cecília Honório, Francisco Louçã and Fernando Rosas.',
      fr: 'Extrait de « Os Donos de Portugal », de Jorge Costa, Luís Fazenda, Cecília Honório, Francisco Louçã et Fernando Rosas.',
      es: 'Fragmento de «Os Donos de Portugal», de Jorge Costa, Luís Fazenda, Cecília Honório, Francisco Louçã y Fernando Rosas.',
    },
    papel: LEITURA,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2018-10-08',
    origem: 'https://www.esquerda.net/audio/uma-grande-familia-trecho-de-os-donos-de-portugal',
    origemAudio: 'https://www.esquerda.net/sites/default/files/uma_grande_familia.mp3',
    sha256: '643164d10c92145ceffe164f8d638da54b9a6461893d62164a31f0fdcad835cd',
    capa: { ficheiro: 'uma-grande-familia.webp', obra: 'Os Donos de Portugal' },
  },
  {
    id: 'documentos-do-pentagono',
    titulo: '«Documentos do Pentágono» influenciaram desfecho no Vietname',
    autoria: 'Luís Leiria',
    fonte: {
      pt: 'Artigo de Luís Leiria, publicado no esquerda.net em 2010.',
      en: 'An article by Luís Leiria, first published on esquerda.net in 2010.',
      fr: 'Article de Luís Leiria, publié sur esquerda.net en 2010.',
      es: 'Artículo de Luís Leiria, publicado en esquerda.net en 2010.',
    },
    papel: LEITURA,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2018-07-31',
    origem: 'https://www.esquerda.net/audio/documentos-do-pentagono-influenciaram-desfecho-no-vietname',
    origemAudio: 'https://www.esquerda.net/sites/default/files/documentos_do_pentagono_influenciaram_desfecho_no_vietname.mp3',
    sha256: '565631aa9ae6d29fa9604c029e06cd62a1ef50f3511e1e44e62e7f967e146dbd',
  },
  {
    id: 'futebol-origens',
    titulo: 'Futebol: As origens',
    autoria: 'Eduardo Galeano',
    fonte: {
      pt: 'De «Futebol ao Sol e à Sombra», de Eduardo Galeano, na tradução de Eric Nepomuceno e Maria do Carmo Brito.',
      en: 'From “Football in Sun and Shadow”, by Eduardo Galeano, in the Portuguese translation by Eric Nepomuceno and Maria do Carmo Brito.',
      fr: 'De « Football, ombre et lumière », d’Eduardo Galeano, dans la traduction portugaise d’Eric Nepomuceno et Maria do Carmo Brito.',
      es: 'De «Fútbol a sol y sombra», de Eduardo Galeano, en la traducción portuguesa de Eric Nepomuceno y Maria do Carmo Brito.',
    },
    papel: LEITURA,
    rubrica: RUBRICA.nome,
    editor: RUBRICA.editor,
    data: '2018-07-09',
    origem: 'https://www.esquerda.net/audio/futebol-origens',
    origemAudio: 'https://www.esquerda.net/sites/default/files/eduardo_galeano.mp3',
    sha256: '2d0d77c9fbb33d3a4ed548c91cf2cb4ebb0f020166de7a8d8e1f71c396c08370',
    capa: { ficheiro: 'futebol-origens.webp', obra: 'Futebol ao Sol e à Sombra' },
  },
], 'voz.leituras')
