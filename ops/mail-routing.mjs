#!/usr/bin/env node
/**
 * Põe as regras de encaminhamento da Purelymail no estado desejado.
 *
 * O CORREIO EM DUAS CAIXAS (11/11/2026). Cada site divulga o seu endereço, e
 * tudo vem dar a uma de duas caixas:
 *   - fado@onofriana.pt — a Onofriana, a Marta Rosa e o fado.today;
 *   - fabio@stineta.pt  — a Stineta, o Coreto, a Paragem, o Em Cada Esquina,
 *     a Primeira Plateia, o salgado.zip e o resto do travertina.casa.
 * Ficam de fora a casa@travertina.casa (o automatismo da Casa Travertina), a
 * dmarc@salgado.zip (os relatórios do dns-mail.mjs) e a da Francisca. Uma
 * região licenciada do Coreto que queira caixa própria terá-a no domínio dela.
 *
 * DOIS TIPOS DE REGRA DE DOMÍNIO, e a versão anterior deste script tinha-os
 * trocados. Medido a 11/11/2026, com correio a sério para cada caso:
 *   - `catchall:false` (`prefix:true`, `matchUser:''`) apanha TODOS os
 *     endereços do domínio, incluindo os das caixas: a regra ganha à caixa;
 *   - `catchall:true` apanha só os endereços que NÃO são caixa.
 * Por isso cada domínio diz o que quer (`soSemCaixa`), em vez de o script
 * «corrigir» todos para o mesmo — que era o que a versão anterior fazia, e
 * teria desviado a caixa dos relatórios e a do automatismo.
 *
 * Não existe endpoint de actualização — só `createRoutingRule` e
 * `deleteRoutingRule`. Converter uma regra é apagar e recriar, por essa ordem:
 * criar primeiro deixaria duas regras a competir pelo mesmo padrão. Se a
 * criação falhar, o original é reposto. Regras que não estão aqui ficam em
 * paz, e as caixas a mais só se mostram: nada aqui apaga uma caixa.
 *
 * Sem PURELYMAIL_API_KEY imprime só o estado desejado. Com chave, compara com
 * o que lá está; escreve mesmo com `--aplicar`.
 *
 * Vive em ops/ pela mesma razão que o dns-mail.mjs: não é código do site.
 */
const APLICAR = process.argv.includes('--aplicar')
const CHAVE = process.env.PURELYMAIL_API_KEY

const ONOFRIANA = 'fado@onofriana.pt'
const STINETA = 'fabio@stineta.pt'
const CASA = 'casa@travertina.casa'

// Para onde vai o correio de cada domínio. `soSemCaixa` = só os endereços que
// não são caixa (catchall:true): o domínio tem uma caixa que tem de continuar
// a receber.
const DOMINIOS = {
  'onofriana.pt': { para: ONOFRIANA },
  'onofreana.pt': { para: ONOFRIANA },
  'martarosa.pt': { para: ONOFRIANA },
  'fado.today': { para: ONOFRIANA },
  'stineta.pt': { para: STINETA },
  'coreto.org': { para: STINETA },
  'paragem.pt': { para: STINETA },
  'emcadaesquina.app': { para: STINETA },
  'primeiraplateia.pt': { para: STINETA },
  // a dmarc@salgado.zip é caixa e recebe os relatórios
  'salgado.zip': { para: STINETA, soSemCaixa: true },
  // a casa@travertina.casa é caixa e é o automatismo
  'travertina.casa': { para: STINETA, soSemCaixa: true },
  'franciscasalgado.golf': { para: 'birdie@franciscasalgado.golf' },
}

// Endereços exactos, que ganham sempre à regra do domínio.
const EXACTAS = ['compras', 'documentos', 'facturas', 'faturas', 'notas', 'papeis', 'tarefas']
  .map((user) => ({ dominio: 'travertina.casa', user, para: CASA }))

// As caixas que devem existir. As outras mostram-se, para se apagarem no painel.
const CAIXAS = [ONOFRIANA, STINETA, CASA, 'dmarc@salgado.zip', 'birdie@franciscasalgado.golf', 'fvsalgado@purelymail.com']

const querido = [
  ...Object.entries(DOMINIOS).map(([dominio, { para, soSemCaixa = false }]) => ({
    dominio, prefix: true, matchUser: '', para, catchall: soSemCaixa,
  })),
  ...EXACTAS.map(({ dominio, user, para }) => ({
    dominio, prefix: false, matchUser: user, para, catchall: false,
  })),
]

const tipo = (catchall, prefix) => (!prefix ? '' : catchall ? '   [só sem caixa]' : '   [todos, caixas incluídas]')
const rotulo = (r) =>
  (r.prefix ? `*@${r.dominio}` : `${r.matchUser}@${r.dominio}`).padEnd(28) + '-> ' + r.para + tipo(r.catchall, r.prefix)

if (!CHAVE) {
  console.log('Sem PURELYMAIL_API_KEY: só o estado desejado.\n')
  for (const r of querido) console.log('  ' + rotulo(r))
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
  const motivo = c.de.catchall !== c.para.catchall ? `era${tipo(c.de.catchall, c.de.prefix)}` : 'destino diferente'
  console.log(`  ~ ${rotulo(c.para)}   (${motivo}; ia para ${c.de.targetAddresses.join(',')})`)
}

console.log(`\nNÃO PREVISTAS, deixadas em paz (${sobram.length})`)
for (const r of sobram) {
  const alvo = r.prefix ? `*@${r.domainName}` : `${r.matchUser}@${r.domainName}`
  console.log(`  ? ${alvo.padEnd(28)}-> ${r.targetAddresses.join(',')}${tipo(r.catchall, r.prefix)}`)
}

// As caixas sem método de recuperação são um risco silencioso: perdida a
// palavra-passe, não há caminho de volta. A API aceita `resetMethods` no
// modifyUser, responde success, e não escreve nada — só o painel web o faz.
const users = (await api('listUser')).result.users
const aMais = users.filter((u) => !CAIXAS.includes(u))
const emFalta = CAIXAS.filter((u) => !users.includes(u))
if (aMais.length) {
  console.log(`\nCAIXAS A MAIS (${aMais.length}) — o correio delas já vai para outra; apagam-se no painel`)
  for (const u of aMais) console.log('  - ' + u)
}
if (emFalta.length) {
  console.log(`\nCAIXAS EM FALTA (${emFalta.length})`)
  for (const u of emFalta) console.log('  ! ' + u)
}
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
console.log(`Regras no fim: ${fim.length}   só sem caixa: ${fim.filter((r) => r.catchall).length}`)
if (falhas.length) {
  console.log(`\n${falhas.length} falha(s):`)
  console.log(JSON.stringify(falhas, null, 2))
  process.exit(1)
}
console.log('Sem falhas.')
