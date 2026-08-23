#!/usr/bin/env node
/**
 * Põe as regras de encaminhamento da Purelymail no estado desejado.
 *
 * O problema que isto resolve: uma regra de catch-all *pura* (`catchall:true`)
 * corresponde a todos os endereços do domínio, incluindo os que pertencem a
 * caixas a sério. A documentação da Purelymail é explícita — «the routing rule
 * takes precedence and moves the email away from the mailbox». Na prática, com
 * um catch-all puro, qualquer caixa nova nasce morta: o correio dela é
 * desviado antes de lá chegar, e nada no painel diz que isso está a acontecer.
 *
 * O tipo certo é «qualquer endereço excepto endereços de user válidos», que na
 * API é o mesmo `prefix:true` + `matchUser:''` mas com `catchall:false`.
 *
 * Não existe endpoint de actualização — só `createRoutingRule` e
 * `deleteRoutingRule`. Converter uma regra é apagar e recriar, por essa ordem:
 * criar primeiro deixaria duas regras a competir pelo mesmo padrão. A janela
 * sem regra afecta apenas endereços desconhecidos; as caixas reais continuam a
 * receber. Se a criação falhar, o original é reposto.
 *
 * Sem PURELYMAIL_API_KEY imprime só o estado desejado. Com chave, compara com
 * o que lá está; escreve mesmo com `--aplicar`.
 *
 * Vive em ops/ pela mesma razão que o dns-mail.mjs: `scripts/*.mjs` conta para
 * o contador de linhas do colofão, e a verificação 12 falha se o total
 * congelado deixar de bater certo.
 */
const APLICAR = process.argv.includes('--aplicar')
const CHAVE = process.env.PURELYMAIL_API_KEY

// Para onde vai o correio que não bate certo com nenhuma caixa do domínio.
// O travertina.casa não tem caixa própria, por isso cai no salgado.zip.
const DESTINOS = {
  'salgado.zip': 'fabio@salgado.zip',
  'primeiraplateia.pt': 'fabio@primeiraplateia.pt',
  'martarosa.pt': 'book@martarosa.pt',
  'franciscasalgado.golf': 'birdie@franciscasalgado.golf',
  'fado.today': 'hello@fado.today',
  'travertina.casa': 'fabio@salgado.zip',
}

// Reencaminhamentos de endereço exacto, que ganham sempre ao padrão geral.
const EXACTAS = [
  { dominio: 'martarosa.pt', user: 'fabio', para: 'book@martarosa.pt' },
]

const querido = [
  ...Object.entries(DESTINOS).map(([dominio, para]) => ({
    dominio, prefix: true, matchUser: '', para, catchall: false,
  })),
  ...EXACTAS.map(({ dominio, user, para }) => ({
    dominio, prefix: false, matchUser: user, para, catchall: false,
  })),
]

const rotulo = (r) =>
  (r.prefix ? `*@${r.dominio}` : `${r.matchUser}@${r.dominio}`).padEnd(28) + '-> ' + r.para

if (!CHAVE) {
  console.log('Sem PURELYMAIL_API_KEY: só o estado desejado.\n')
  for (const r of querido) console.log('  ' + rotulo(r) + '   [excepto users válidos]')
  console.log(`\n${querido.length} regras desejadas. Define PURELYMAIL_API_KEY para comparares.`)
  process.exit(0)
}

const api = async (ep, corpo = {}) => {
  const r = await fetch('https://purelymail.com/api/v0/' + ep, {
    method: 'POST',
    headers: { 'Purelymail-Api-Token': CHAVE, 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
  const t = await r.text()
  try { return JSON.parse(t) } catch { return { type: 'erro', message: t.slice(0, 200) } }
}

const listar = async () => {
  const r = await api('listRoutingRules')
  if (r.type !== 'success') throw new Error('listRoutingRules: ' + r.message)
  return r.result.rules
}

const actuais = await listar()

// Uma regra corresponde à desejada quando o padrão e o destino coincidem E o
// catchall está como deve. Se só o catchall diferir, é conversão, não criação.
const mesmoPadrao = (a, b) =>
  a.domainName === b.dominio && a.prefix === b.prefix && a.matchUser === b.matchUser

const criar = [], converter = [], sobram = []

for (const q of querido) {
  const existe = actuais.find((a) => mesmoPadrao(a, q))
  if (!existe) { criar.push(q); continue }
  const destinoIgual = existe.targetAddresses.length === 1 && existe.targetAddresses[0] === q.para
  if (existe.catchall !== q.catchall || !destinoIgual) converter.push({ de: existe, para: q })
}

for (const a of actuais) {
  if (!querido.some((q) => mesmoPadrao(a, q))) sobram.push(a)
}

console.log('='.repeat(72))
console.log('PLANO — regras de encaminhamento')
console.log('='.repeat(72))

console.log(`\nA CRIAR (${criar.length})`)
for (const r of criar) console.log('  + ' + rotulo(r))

console.log(`\nA CONVERTER (${converter.length})`)
for (const c of converter) {
  const motivo = c.de.catchall ? 'catch-all puro -> excepto users válidos' : 'destino diferente'
  console.log(`  ~ ${rotulo(c.para)}   (${motivo}; era ${c.de.targetAddresses.join(',')})`)
}

console.log(`\nNÃO PREVISTAS, deixadas em paz (${sobram.length})`)
for (const r of sobram) {
  const alvo = r.prefix ? `*@${r.domainName}` : `${r.matchUser}@${r.domainName}`
  console.log(`  ? ${alvo.padEnd(28)}-> ${r.targetAddresses.join(',')}${r.catchall ? '  [CATCH-ALL PURO]' : ''}`)
}

// As caixas sem método de recuperação são um risco silencioso: perdida a
// palavra-passe, não há caminho de volta. A API aceita `resetMethods` no
// modifyUser, responde success, e não escreve nada — só o painel web o faz.
const users = (await api('listUser')).result.users
const semRecuperacao = []
for (const u of users) {
  const d = (await api('getUser', { userName: u })).result
  if (d && d.resetMethods.length === 0) semRecuperacao.push(u)
}
if (semRecuperacao.length) {
  console.log(`\nSEM MÉTODO DE RECUPERAÇÃO (${semRecuperacao.length}) — só se resolve no painel web`)
  for (const u of semRecuperacao) console.log('  ! ' + u)
}

if (!APLICAR) {
  console.log(`\n${'='.repeat(72)}`)
  console.log(`Simulação. ${criar.length} a criar, ${converter.length} a converter.`)
  console.log('Nada foi escrito. Corre outra vez com --aplicar para aplicar.')
  process.exit(0)
}

console.log(`\n${'='.repeat(72)}\nA APLICAR\n${'='.repeat(72)}`)
const falhas = []

const criarRegra = (r) => api('createRoutingRule', {
  domainName: r.dominio, prefix: r.prefix, matchUser: r.matchUser,
  targetAddresses: [r.para], catchall: r.catchall,
})

for (const c of converter) {
  const del = await api('deleteRoutingRule', { routingRuleId: c.de.id })
  if (del.type !== 'success') {
    console.log(`  FALHOU a apagar ${rotulo(c.para)}: ${del.message}`)
    falhas.push({ fase: 'apagar', regra: rotulo(c.para), erro: del.message })
    continue
  }
  const cre = await criarRegra(c.para)
  if (cre.type !== 'success') {
    console.log(`  FALHOU a criar ${rotulo(c.para)}: ${cre.message} -> a repor o original`)
    const volta = await api('createRoutingRule', {
      domainName: c.de.domainName, prefix: c.de.prefix, matchUser: c.de.matchUser,
      targetAddresses: c.de.targetAddresses, catchall: c.de.catchall,
    })
    console.log(`      reposição: ${volta.type === 'success' ? 'OK' : 'FALHOU ' + volta.message}`)
    falhas.push({ fase: 'criar', regra: rotulo(c.para), erro: cre.message, reposto: volta.type === 'success' })
    continue
  }
  console.log(`  convertida  ${rotulo(c.para)}`)
}

for (const r of criar) {
  const cre = await criarRegra(r)
  if (cre.type !== 'success') {
    console.log(`  FALHOU a criar ${rotulo(r)}: ${cre.message}`)
    falhas.push({ fase: 'criar', regra: rotulo(r), erro: cre.message })
    continue
  }
  console.log(`  criada      ${rotulo(r)}`)
}

const fim = await listar()
console.log(`\n${'='.repeat(72)}`)
console.log(`Regras no fim: ${fim.length}   catch-all puros: ${fim.filter((r) => r.catchall).length}`)
if (falhas.length) {
  console.log(`\n${falhas.length} falha(s):`)
  console.log(JSON.stringify(falhas, null, 2))
  process.exit(1)
}
console.log('Sem falhas.')
