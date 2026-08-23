#!/usr/bin/env node
/**
 * Põe o DMARC e o TLS-RPT em pé nos seis domínios de correio.
 *
 * O que existia antes: cada domínio tinha `_dmarc` como CNAME para o registo
 * partilhado da Purelymail (`dmarcroot.purelymail.com`). Esse registo é
 * `p=reject` sem `rua=` nenhum — ou seja, a política era severa e os
 * relatórios agregados não vinham para lado nenhum. Não dá para corrigir por
 * cima: um CNAME não coexiste com um TXT no mesmo nome, por isso o CNAME é
 * apagado antes de o TXT ser escrito.
 *
 * Os relatórios dos seis domínios vão todos para uma caixa em salgado.zip.
 * Como isso é entrega cruzada entre domínios, o RFC 7489 §7.1 exige que o
 * domínio que recebe publique uma autorização por cada domínio que reporta —
 * daí os cinco `<domínio>._report._dmarc` em salgado.zip. O salgado.zip não
 * se autoriza a si próprio, por isso são cinco e não seis.
 *
 * Por omissão só mostra o plano. Escreve mesmo com `--aplicar`.
 *
 * Precisa de VERCEL_TOKEN e VERCEL_TEAM_ID no ambiente. O TEAM_ID não é
 * opcional: os domínios estão todos na equipa, e sem ele a API responde 200
 * com uma lista vazia — o que parece sucesso e não é.
 */
const APLICAR = process.argv.includes('--aplicar')

const TOKEN = process.env.VERCEL_TOKEN
const EQUIPA = process.env.VERCEL_TEAM_ID
if (!TOKEN) { console.error('Falta VERCEL_TOKEN no ambiente.'); process.exit(1) }
if (!EQUIPA) { console.error('Falta VERCEL_TEAM_ID no ambiente.'); process.exit(1) }

// A caixa que recebe os relatórios agregados. É um user real em salgado.zip.
const CAIXA = 'dmarc@salgado.zip'

// p=none enquanto se recolhem os primeiros relatórios. Endurecer para
// quarantine e depois reject só depois de os relatórios mostrarem que os
// remetentes legítimos alinham — subir antes disso rejeita correio bom.
const POLITICA = 'none'

const DOMINIOS = [
  'salgado.zip',
  'primeiraplateia.pt',
  'martarosa.pt',
  'franciscasalgado.golf',
  'fado.today',
  'travertina.casa',
]

// O domínio onde a caixa de relatórios vive, e que por isso publica as
// autorizações para os outros.
const ANFITRIAO = 'salgado.zip'

const api = async (caminho, opcoes = {}) => {
  const juncao = caminho.includes('?') ? '&' : '?'
  const r = await fetch(`https://api.vercel.com${caminho}${juncao}teamId=${EQUIPA}`, {
    ...opcoes,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...opcoes.headers },
  })
  const texto = await r.text()
  let corpo = null
  try { corpo = texto ? JSON.parse(texto) : null } catch { corpo = { raw: texto } }
  return { ok: r.ok, estado: r.status, corpo }
}

const registos = async (dominio) => {
  const r = await api(`/v4/domains/${dominio}/records?limit=100`)
  if (!r.ok) throw new Error(`${dominio}: HTTP ${r.estado} ao listar — ${JSON.stringify(r.corpo).slice(0, 200)}`)
  return r.corpo.records
}

// O que deve existir em cada domínio.
const querido = (dominio) => {
  const lista = [
    { nome: '_dmarc', tipo: 'TXT', valor: `v=DMARC1; p=${POLITICA}; rua=mailto:${CAIXA}` },
    { nome: '_smtp._tls', tipo: 'TXT', valor: `v=TLSRPTv1; rua=mailto:${CAIXA}` },
  ]
  if (dominio === ANFITRIAO) {
    for (const outro of DOMINIOS.filter((d) => d !== ANFITRIAO)) {
      lista.push({ nome: `${outro}._report._dmarc`, tipo: 'TXT', valor: 'v=DMARC1' })
    }
  }
  return lista
}

// Normaliza para comparar: a Vercel devolve TXT sem aspas, mas há resolvers
// e importações que as deixam ficar.
const limpo = (v) => String(v).trim().replace(/^"|"$/g, '').replace(/\s+/g, ' ')

const criar = [], apagar = [], jaLa = []

for (const dominio of DOMINIOS) {
  const atuais = await registos(dominio)

  // Os CNAME em _dmarc têm de sair: bloqueiam o TXT que vai no lugar deles.
  for (const r of atuais) {
    if (r.name === '_dmarc' && r.type === 'CNAME') {
      apagar.push({ dominio, id: r.id, nome: r.name, tipo: r.type, valor: r.value })
    }
  }

  for (const q of querido(dominio)) {
    const igual = atuais.find((r) => r.name === q.nome && r.type === q.tipo && limpo(r.value) === limpo(q.valor))
    if (igual) { jaLa.push({ dominio, ...q }); continue }
    criar.push({ dominio, ...q })
  }
}

console.log('='.repeat(76))
console.log(`PLANO  —  caixa de relatórios ${CAIXA}  —  DMARC p=${POLITICA}`)
console.log('='.repeat(76))

console.log(`\nA APAGAR  (${apagar.length})`)
for (const r of apagar) console.log(`  - ${r.dominio.padEnd(22)} ${r.nome.padEnd(34)} ${r.tipo.padEnd(6)} ${r.valor}`)

console.log(`\nA CRIAR  (${criar.length})`)
for (const r of criar) console.log(`  + ${r.dominio.padEnd(22)} ${r.nome.padEnd(34)} ${r.tipo.padEnd(6)} ${r.valor}`)

if (jaLa.length) {
  console.log(`\nJÁ CORRECTOS  (${jaLa.length}, ignorados)`)
  for (const r of jaLa) console.log(`  = ${r.dominio.padEnd(22)} ${r.nome.padEnd(34)} ${r.tipo}`)
}

if (!APLICAR) {
  console.log(`\n${'='.repeat(76)}`)
  console.log(`Simulação. ${criar.length} a criar, ${apagar.length} a apagar.`)
  console.log('Nada foi escrito. Corre outra vez com --aplicar para aplicar.')
  process.exit(0)
}

console.log(`\n${'='.repeat(76)}`)
console.log('A APLICAR')
console.log('='.repeat(76))

const falhas = []

// Apagar primeiro. Enquanto o CNAME lá estiver, o TXT no mesmo nome é
// recusado — a ordem aqui não é estética.
for (const r of apagar) {
  const res = await api(`/v2/domains/${r.dominio}/records/${r.id}`, { method: 'DELETE' })
  if (res.ok) console.log(`  apagado  ${r.dominio.padEnd(22)} ${r.nome} ${r.tipo}`)
  else {
    console.log(`  FALHOU   ${r.dominio.padEnd(22)} ${r.nome} ${r.tipo}  HTTP ${res.estado}`)
    falhas.push({ acao: 'apagar', ...r, estado: res.estado, corpo: res.corpo })
  }
}

for (const r of criar) {
  const res = await api(`/v2/domains/${r.dominio}/records`, {
    method: 'POST',
    body: JSON.stringify({ name: r.nome, type: r.tipo, value: r.valor, ttl: 60 }),
  })
  if (res.ok) console.log(`  criado   ${r.dominio.padEnd(22)} ${r.nome.padEnd(34)} ${r.tipo}`)
  else {
    console.log(`  FALHOU   ${r.dominio.padEnd(22)} ${r.nome.padEnd(34)} ${r.tipo}  HTTP ${res.estado}`)
    falhas.push({ acao: 'criar', ...r, estado: res.estado, corpo: res.corpo })
  }
}

console.log(`\n${'='.repeat(76)}`)
console.log(`Apagados ${apagar.length - falhas.filter((f) => f.acao === 'apagar').length}/${apagar.length}   ` +
            `Criados ${criar.length - falhas.filter((f) => f.acao === 'criar').length}/${criar.length}`)
if (falhas.length) {
  console.log(`\n${falhas.length} falha(s):`)
  console.log(JSON.stringify(falhas, null, 2))
  process.exit(1)
}
console.log('Sem falhas.')
