#!/usr/bin/env node
/**
 * Publica no Vercel DNS os registos de autenticação de mail dos seis domínios:
 * DMARC próprio (com relatórios), autorização de relatórios entre domínios, e
 * TLS-RPT. Tudo a reportar para dmarc@salgado.zip.
 *
 * O DMARC vive hoje num CNAME para a Purelymail. Um CNAME não coexiste com um
 * TXT no mesmo nome, por isso o CNAME antigo é apagado antes de criar o TXT.
 *
 *   VERCEL_TOKEN=... node ops/dns-mail.mjs            só mostra o plano
 *   VERCEL_TOKEN=... node ops/dns-mail.mjs --aplicar  escreve
 *
 * O token precisa de permissão sobre os domínios, que são recursos ao nível
 * da conta: um token limitado a um projeto não chega. Se os domínios estiverem
 * numa equipa, juntar VERCEL_TEAM_ID=team_...
 *
 * Vive em ops/ e não em scripts/ porque não constrói nada: scripts/*.mjs entra
 * no contador de linhas do colofão, e este ficheiro não é código do site.
 */

const TOKEN = process.env.VERCEL_TOKEN ?? ''
const EQUIPA = process.env.VERCEL_TEAM_ID ?? ''
const aplicar = process.argv.includes('--aplicar')

const DOMINIOS = [
  'salgado.zip',
  'primeiraplateia.pt',
  'martarosa.pt',
  'franciscasalgado.golf',
  'fado.today',
  'travertina.casa',
]
/** Onde aterram os relatórios. É um endereço, não tem de ser uma caixa. */
const RELATOR = 'dmarc@salgado.zip'
const ZONA_RELATOR = RELATOR.split('@')[1]
const TTL = 3600

const DMARC = `v=DMARC1; p=reject; rua=mailto:${RELATOR}; ruf=mailto:${RELATOR}; fo=1`
const TLSRPT = `v=TLSRPTv1; rua=mailto:${RELATOR}`

/** Os registos que devem existir no fim, por zona. */
const plano = []
for (const dominio of DOMINIOS) {
  plano.push({ dominio, name: '_dmarc', type: 'TXT', value: DMARC })
  plano.push({ dominio, name: '_smtp._tls', type: 'TXT', value: TLSRPT })
  // O DMARC não deixa um domínio despejar relatórios noutro sem consentimento:
  // a zona que recebe tem de autorizar cada domínio que reporta para ela.
  if (dominio !== ZONA_RELATOR) {
    plano.push({
      dominio: ZONA_RELATOR,
      name: `${dominio}._report._dmarc`,
      type: 'TXT',
      value: 'v=DMARC1',
    })
  }
}

const q = EQUIPA ? `?teamId=${EQUIPA}` : ''
const sep = EQUIPA ? '&' : '?'

async function api(caminho, opcoes = {}) {
  const r = await fetch(`https://api.vercel.com${caminho}`, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
  })
  const corpo = await r.text()
  if (!r.ok) throw new Error(`${r.status} ${caminho} — ${corpo.slice(0, 300)}`)
  return corpo ? JSON.parse(corpo) : {}
}

const listar = (dominio) =>
  api(`/v5/domains/${dominio}/records${q}${sep}limit=100`).then((r) => r.records ?? [])

const criar = (dominio, { name, type, value }) =>
  api(`/v2/domains/${dominio}/records${q}`, {
    method: 'POST',
    body: JSON.stringify({ name, type, value, ttl: TTL }),
  })

const apagar = (dominio, id) =>
  api(`/v2/domains/${dominio}/records/${id}${q}`, { method: 'DELETE' })

/** Vercel devolve o TXT com aspas às vezes, e o nome pode vir absoluto. */
const limpo = (v) => String(v ?? '').replace(/^"|"$/g, '').trim()
const igual = (r, alvo) =>
  r.type === alvo.type && limpo(r.name) === alvo.name && limpo(r.value) === alvo.value

if (!TOKEN) {
  console.log('Sem VERCEL_TOKEN — só o plano:\n')
  for (const r of plano) console.log(`  ${r.dominio.padEnd(23)} ${r.name.padEnd(42)} ${r.type}  ${r.value}`)
  console.log(`\n${plano.length} registos. Falta ainda apagar o CNAME _dmarc de cada um dos ${DOMINIOS.length} domínios.`)
  process.exit(0)
}

const zonas = [...new Set(plano.map((r) => r.dominio))]
const existente = new Map()
for (const zona of zonas) existente.set(zona, await listar(zona))

let criados = 0
let apagados = 0
let saltados = 0

// Primeiro os CNAME _dmarc: enquanto lá estiverem, o TXT no mesmo nome é recusado.
for (const dominio of DOMINIOS) {
  const velhos = (existente.get(dominio) ?? []).filter(
    (r) => r.type === 'CNAME' && limpo(r.name) === '_dmarc',
  )
  for (const r of velhos) {
    console.log(`  ${aplicar ? 'apaga ' : 'apagaria'} ${dominio}  _dmarc CNAME ${limpo(r.value)}`)
    if (aplicar) await apagar(dominio, r.id)
    apagados++
  }
}

for (const r of plano) {
  if ((existente.get(r.dominio) ?? []).some((e) => igual(e, r))) {
    saltados++
    continue
  }
  console.log(`  ${aplicar ? 'cria  ' : 'criaria'} ${r.dominio.padEnd(23)} ${r.name.padEnd(42)} ${r.type}`)
  if (aplicar) await criar(r.dominio, r)
  criados++
}

console.log(
  `\n${aplicar ? 'Feito' : 'Simulação'}: ${criados} a criar, ${apagados} a apagar, ${saltados} já certos.`,
)
if (!aplicar) console.log('Correr outra vez com --aplicar para escrever.')
