import { z } from 'zod'
import { Lang, parse } from './schema.ts'

/**
 * O nó `privacidade/`.
 *
 * Existe por duas razões, e a segunda é a que obriga. A primeira: o site
 * passou a medir visitas, e medir visitas é tratar dados de quem visita. A
 * segunda: mesmo sem medição nenhuma, servir uma página é registar um endereço
 * IP no servidor de quem a aloja — o dever de informação do artigo 13.º do RGPD
 * não espera por cookies para existir.
 *
 * Escrito como o resto da casa: campos curtos, sem prosa de advogado, e sem
 * afirmar nada que não se possa verificar. A frase «sem rastreio» saiu do
 * rodapé no mesmo commit em que a medição entrou, porque deixou de ser verdade
 * — e um sítio que se apresenta como auditável não pode ter no rodapé uma
 * afirmação que o próprio código desmente.
 *
 * Os textos encolheram a 19/08/2026 sem perder um único dever do artigo 13.º:
 * os seis campos são os seis que a lei obriga a dizer, e o que saiu foi a
 * repetição — «é o que existe em qualquer sítio da internet» a explicar o que
 * já se percebia, «e não sobrevive de um dia para o outro» a dizer segunda vez
 * o que «24 horas» diz.
 *
 * A ACESSIBILIDADE esteve aqui como sétimo campo e mudou-se para nó próprio a
 * 20/08/2026, quando a frase «auditoria formal não há» deixou de ser verdade.
 * Uma frase cabia num campo; uma declaração de conformidade com nível, método,
 * data e não-conformidades nomeadas, não. Ficam os seis deveres do artigo 13.º,
 * que é o que este nó é.
 */

const Campo = z.object({ rotulo: Lang, texto: Lang })

export const notaPrivacidade = parse(Lang, {
  pt: 'Sem cookies, sem publicidade e sem perfis. O que se segue é o que existe mesmo.',
  en: 'No cookies, no advertising, no profiles. What follows is what actually exists.',
  fr: 'Sans cookies, sans publicité, sans profilage. Ce qui suit est ce qui existe réellement.',
  es: 'Sin cookies, sin publicidad, sin perfiles. Lo que sigue es lo que existe de verdad.',
}, 'privacidade.nota')

export const privacidade = parse(Campo.array().min(1), [
  {
    rotulo: { pt: 'responsável', en: 'controller', fr: 'responsable', es: 'responsable' },
    texto: {
      pt: 'Fábio Salgado, a título pessoal. O contacto está no nó do contacto.',
      en: 'Fábio Salgado, in a personal capacity. The contact is in the contact node.',
      fr: 'Fábio Salgado, à titre personnel. Le contact se trouve dans le nœud contact.',
      es: 'Fábio Salgado, a título personal. El contacto está en el nodo de contacto.',
    },
  },
  {
    rotulo: { pt: 'que dados', en: 'what data', fr: 'quelles données', es: 'qué datos' },
    texto: {
      pt: 'Registos do servidor: endereço IP, navegador e hora. Uma medição de visitas sem cookies: página, referenciador, país, sistema e tipo de aparelho, com a visita identificada por um resumo criptográfico do pedido. E o que me escreveres.',
      en: 'Server logs: IP address, browser and time. A cookieless measurement of visits: page, referrer, country, system and device type, with the visit identified by a cryptographic digest of the request. And whatever you write to me.',
      fr: 'Les journaux du serveur : adresse IP, navigateur et heure. Une mesure de fréquentation sans cookies : page, référent, pays, système et type d’appareil, la visite étant identifiée par une empreinte cryptographique de la requête. Et ce que vous m’écrivez.',
      es: 'Registros del servidor: dirección IP, navegador y hora. Una medición de visitas sin cookies: página, referente, país, sistema y tipo de aparato, con la visita identificada por un resumen criptográfico de la petición. Y lo que me escribas.',
    },
  },
  {
    rotulo: { pt: 'para quê', en: 'what for', fr: 'pourquoi', es: 'para qué' },
    texto: {
      pt: 'Servir a página, mantê-la de pé e saber quantas pessoas a leem. Nada disto alimenta publicidade, perfis ou decisões automatizadas.',
      en: 'To serve the page, keep it up and know how many people read it. None of it feeds advertising, profiles or automated decisions.',
      fr: 'Servir la page, la maintenir en ligne et savoir combien de personnes la lisent. Rien de cela n’alimente la publicité, le profilage ou des décisions automatisées.',
      es: 'Servir la página, mantenerla en pie y saber cuántas personas la leen. Nada de esto alimenta publicidad, perfiles ni decisiones automatizadas.',
    },
  },
  {
    rotulo: { pt: 'quanto tempo', en: 'how long', fr: 'combien de temps', es: 'cuánto tiempo' },
    texto: {
      pt: 'A identificação de uma visita dura 24 horas. Os registos do servidor seguem a retenção de quem aloja. O que me escreveres fica enquanto a conversa fizer sentido.',
      en: 'A visit’s identifier lasts 24 hours. Server logs follow the host’s retention. Whatever you write to me stays as long as the conversation makes sense.',
      fr: 'L’identifiant d’une visite dure 24 heures. Les journaux suivent la rétention de l’hébergeur. Ce que vous m’écrivez reste tant que la conversation a du sens.',
      es: 'La identificación de una visita dura 24 horas. Los registros del servidor siguen la retención de quien aloja. Lo que me escribas queda mientras la conversación tenga sentido.',
    },
  },
  {
    rotulo: { pt: 'quem mais lhes toca', en: 'who else handles it', fr: 'qui d’autre y touche', es: 'quién más los toca' },
    texto: {
      pt: 'A Vercel, que aloja e mede, como subcontratante. Mais ninguém: a página não faz um único pedido a terceiros.',
      en: 'Vercel, which hosts and measures, as a processor. Nobody else: the page makes not a single third-party request.',
      fr: 'Vercel, qui héberge et mesure, en tant que sous-traitant. Personne d’autre : la page ne fait aucune requête à des tiers.',
      es: 'Vercel, que aloja y mide, como subencargado. Nadie más: la página no hace ni una sola petición a terceros.',
    },
  },
  {
    rotulo: { pt: 'os teus direitos', en: 'your rights', fr: 'vos droits', es: 'tus derechos' },
    texto: {
      pt: 'Acesso, retificação, apagamento, limitação, oposição e portabilidade: escreve para o endereço acima. Se não resolver, podes reclamar à CNPD.',
      en: 'Access, rectification, erasure, restriction, objection and portability: write to the address above. If I do not resolve it, you may complain to the Portuguese data protection authority (CNPD).',
      fr: 'Accès, rectification, effacement, limitation, opposition et portabilité : écrivez à l’adresse ci-dessus. Si je ne règle pas la question, vous pouvez saisir la CNPD.',
      es: 'Acceso, rectificación, supresión, limitación, oposición y portabilidad: escribe a la dirección de arriba. Si no lo resuelvo, puedes reclamar ante la CNPD.',
    },
  },
], 'privacidade')
