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
 */

const Campo = z.object({ rotulo: Lang, texto: Lang })

export const notaPrivacidade = parse(Lang, {
  pt: 'Sem cookies, sem publicidade, sem perfis e sem partilha com terceiros para publicidade. O que se segue é o que existe mesmo.',
  en: 'No cookies, no advertising, no profiles, and nothing shared with third parties for advertising. What follows is what actually exists.',
  fr: 'Sans cookies, sans publicité, sans profilage et sans partage à des fins publicitaires. Ce qui suit est ce qui existe réellement.',
  es: 'Sin cookies, sin publicidad, sin perfiles y sin compartir con terceros con fines publicitarios. Lo que sigue es lo que existe de verdad.',
}, 'privacidade.nota')

export const privacidade = parse(Campo.array().min(1), [
  {
    rotulo: { pt: 'responsável', en: 'controller', fr: 'responsable', es: 'responsable' },
    texto: {
      pt: 'Fábio Salgado, a título pessoal. O contacto está no nó acima.',
      en: 'Fábio Salgado, in a personal capacity. The contact is in the node above.',
      fr: 'Fábio Salgado, à titre personnel. Le contact se trouve dans le nœud ci-dessus.',
      es: 'Fábio Salgado, a título personal. El contacto está en el nodo de arriba.',
    },
  },
  {
    rotulo: { pt: 'que dados', en: 'what data', fr: 'quelles données', es: 'qué datos' },
    texto: {
      pt: 'Registos do servidor, que incluem o endereço IP, o agente do navegador e a hora — é o que existe em qualquer sítio da internet. Uma medição de visitas sem cookies, que guarda a página, o referenciador, o país, o sistema e o tipo de aparelho, e identifica a visita por um resumo criptográfico do pedido. E o que escreveres, se me escreveres.',
      en: 'Server logs, which include the IP address, the browser agent and the time — what exists on any site on the internet. A cookieless measurement of visits, keeping the page, the referrer, the country, the system and the device type, identifying a visit by a cryptographic digest of the request. And whatever you write, if you write to me.',
      fr: 'Les journaux du serveur, qui contiennent l’adresse IP, l’agent du navigateur et l’heure — ce qui existe sur n’importe quel site. Une mesure de fréquentation sans cookies, qui garde la page, le référent, le pays, le système et le type d’appareil, et identifie la visite par une empreinte de la requête. Et ce que vous m’écrivez, le cas échéant.',
      es: 'Registros del servidor, que incluyen la dirección IP, el agente del navegador y la hora — lo que existe en cualquier sitio de internet. Una medición de visitas sin cookies, que guarda la página, el referente, el país, el sistema y el tipo de aparato, e identifica la visita por un resumen criptográfico de la petición. Y lo que escribas, si me escribes.',
    },
  },
  {
    rotulo: { pt: 'para quê', en: 'what for', fr: 'pourquoi', es: 'para qué' },
    texto: {
      pt: 'Servir a página, mantê-la de pé, e saber quantas pessoas a leem. Nada disto alimenta publicidade, perfis ou decisões automatizadas sobre ninguém.',
      en: 'To serve the page, keep it up, and know how many people read it. None of it feeds advertising, profiles or automated decisions about anyone.',
      fr: 'Servir la page, la maintenir en ligne, et savoir combien de personnes la lisent. Rien de tout cela n’alimente la publicité, le profilage ou des décisions automatisées.',
      es: 'Servir la página, mantenerla en pie, y saber cuántas personas la leen. Nada de esto alimenta publicidad, perfiles ni decisiones automatizadas sobre nadie.',
    },
  },
  {
    rotulo: { pt: 'quanto tempo', en: 'how long', fr: 'combien de temps', es: 'cuánto tiempo' },
    texto: {
      pt: 'A identificação de uma visita é descartada ao fim de 24 horas e não sobrevive de um dia para o outro. Os registos do servidor seguem a retenção de quem aloja. O que me escreveres fica enquanto a conversa fizer sentido.',
      en: 'A visit’s identifier is discarded after 24 hours and does not survive from one day to the next. Server logs follow the host’s retention. Whatever you write to me stays for as long as the conversation makes sense.',
      fr: 'L’identifiant d’une visite est supprimé au bout de 24 heures et ne survit pas d’un jour à l’autre. Les journaux suivent la rétention de l’hébergeur. Ce que vous m’écrivez reste tant que la conversation a du sens.',
      es: 'La identificación de una visita se descarta a las 24 horas y no sobrevive de un día para otro. Los registros del servidor siguen la retención de quien aloja. Lo que me escribas queda mientras la conversación tenga sentido.',
    },
  },
  {
    rotulo: { pt: 'quem mais lhes toca', en: 'who else handles it', fr: 'qui d’autre y touche', es: 'quién más los toca' },
    texto: {
      pt: 'A Vercel, que aloja o site e faz a medição, na qualidade de subcontratante. Mais ninguém: a página não faz um único pedido a terceiros, e a verificação 8 do repositório falha se algum dia fizer.',
      en: 'Vercel, which hosts the site and does the measurement, as a processor. Nobody else: the page makes not a single third-party request, and check 8 in the repository fails if it ever does.',
      fr: 'Vercel, qui héberge le site et effectue la mesure, en tant que sous-traitant. Personne d’autre : la page ne fait aucune requête à des tiers, et la vérification 8 du dépôt échoue si cela arrive.',
      es: 'Vercel, que aloja el sitio y hace la medición, como subencargado. Nadie más: la página no hace ni una sola petición a terceros, y la verificación 8 del repositorio falla si algún día la hiciera.',
    },
  },
  {
    rotulo: { pt: 'os teus direitos', en: 'your rights', fr: 'vos droits', es: 'tus derechos' },
    texto: {
      pt: 'Acesso, retificação, apagamento, limitação, oposição e portabilidade. Escreve para o endereço acima. Se achares que não resolvi, podes reclamar à CNPD.',
      en: 'Access, rectification, erasure, restriction, objection and portability. Write to the address above. If you think I did not resolve it, you may complain to the Portuguese data protection authority (CNPD).',
      fr: 'Accès, rectification, effacement, limitation, opposition et portabilité. Écrivez à l’adresse ci-dessus. Si vous estimez que je n’ai pas résolu la question, vous pouvez saisir la CNPD.',
      es: 'Acceso, rectificación, supresión, limitación, oposición y portabilidad. Escribe a la dirección de arriba. Si crees que no lo resolví, puedes reclamar ante la CNPD.',
    },
  },
], 'privacidade')
