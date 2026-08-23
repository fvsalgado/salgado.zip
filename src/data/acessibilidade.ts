import { z } from 'zod'
import { Lang, parse } from './schema.ts'

/**
 * O nó `acessibilidade/`.
 *
 * Esteve como sétimo campo da privacidade, e saiu de lá a 20/08/2026 por ter
 * deixado de caber: uma frase cabia num campo, uma declaração de conformidade
 * com nível, método, data e não-conformidades nomeadas não cabe.
 *
 * A frase que estava lá dizia «auditoria formal não há». Passou a haver, e é
 * esta. O que a torna diferente de um selo é o que a verificação 17 faz: o
 * axe-core corre sobre todas as rotas publicadas, nos dois temas, com a árvore
 * fechada e aberta, antes de cada publicação. Um relatório com data envelhece
 * no dia seguinte; uma verificação que bloqueia a publicação, não.
 *
 * A regra de sempre: só se afirma o que se pode conferir, e diz-se o que não
 * se cumpre. O vocabulário — «parcialmente conforme», e as não-conformidades
 * uma a uma com o critério e a razão — é o das declarações de acessibilidade
 * a sério, e é o que permite a quem lê saber com o que conta antes de entrar.
 *
 * O texto público não conta rotas nem combinações da bancada: esses números
 * são contabilidade interna e envelhecem — já foram «vinte e oito» e «cento e
 * dez focáveis», e ambos ficaram errados na página em dias. Diz-se O QUE se
 * verifica; o quanto vive no verify.mjs, que é o sítio que não mente.
 *
 * O que NÃO se afirma, e faz diferença: isto não é uma auditoria independente.
 * Foi feita por quem fez o sítio, e uma auditoria de terceiros é outra coisa.
 * Dizê-lo é o que separa esta página de um selo comprado.
 */

const Campo = z.object({ rotulo: Lang, texto: Lang })

export const notaAcessibilidade = parse(
  Lang,
  {
    pt: 'Auditado a 20 de agosto de 2026 contra a WCAG 2.2, nível AA. Parcialmente conforme: as exceções estão nomeadas em baixo, uma a uma.',
    en: 'Audited on 20 August 2026 against WCAG 2.2, level AA. Partially conformant: the exceptions are named below, one by one.',
    fr: 'Audité le 20 août 2026 selon les WCAG 2.2, niveau AA. Partiellement conforme : les exceptions sont nommées ci-dessous, une à une.',
    es: 'Auditado el 20 de agosto de 2026 contra las WCAG 2.2, nivel AA. Parcialmente conforme: las excepciones están nombradas abajo, una a una.',
  },
  'acessibilidade.nota'
)

export const acessibilidade = parse(
  Campo.array().min(1),
  [
    {
      rotulo: { pt: 'o que se verifica sozinho', en: 'checked automatically', fr: 'vérifié automatiquement', es: 'lo que se verifica por sí solo' },
      texto: {
        pt: 'Antes de cada publicação, uma bateria de verificações corre sobre todas as páginas, nos dois temas, com a árvore fechada e aberta, e bloqueia-a se encontrar alguma coisa: o axe-core de ponta a ponta, o contraste calculado a partir das cores, a árvore inteira a abrir e fechar sem JavaScript, as legendas dos vídeos conferidas contra a duração de cada um, o aviso de janela nova em todas as ligações que saem — na seta, para quem a vê, e no nome acessível, para quem não a vê —, e a página percorrida por tabulação, tecla a tecla, sem nenhum elemento a prender o foco.',
        en: 'Before every release, a battery of checks runs over every page, in both themes, with the tree closed and open, and blocks it if anything turns up: axe-core end to end, contrast computed from the colours, the whole tree opening and closing with JavaScript off, the video captions checked against each film’s length, the new-window warning on every link that leaves the site — in the arrow, for those who see it, and in the accessible name, for those who do not — and the page walked by tabbing, key by key, with no element holding the focus.',
        fr: 'Avant chaque publication, une batterie de vérifications parcourt toutes les pages, dans les deux thèmes, l’arbre fermé puis ouvert, et la bloque au moindre problème : axe-core de bout en bout, le contraste calculé à partir des couleurs, l’arbre entier qui s’ouvre et se ferme sans JavaScript, les sous-titres vérifiés contre la durée de chaque vidéo, l’avertissement de nouvelle fenêtre sur chaque lien qui sort du site — par la flèche, pour qui la voit, et par le nom accessible, pour qui ne la voit pas —, et la page parcourue à la tabulation, touche après touche, sans qu’aucun élément ne retienne le focus.',
        es: 'Antes de cada publicación, una batería de verificaciones recorre todas las páginas, en los dos temas, con el árbol cerrado y abierto, y la bloquea si encuentra algo: axe-core de punta a punta, el contraste calculado a partir de los colores, el árbol entero abriéndose y cerrándose sin JavaScript, los subtítulos comprobados contra la duración de cada vídeo, el aviso de ventana nueva en cada enlace que sale del sitio — en la flecha, para quien la ve, y en el nombre accesible, para quien no —, y la página recorrida por tabulación, tecla a tecla, sin ningún elemento que retenga el foco.',
      },
    },
    {
      rotulo: { pt: 'o que se mediu à mão', en: 'measured by hand', fr: 'mesuré à la main', es: 'lo que se midió a mano' },
      texto: {
        pt: 'O que uma ferramenta não vê: refluxo a 320px sem barra horizontal, o espaçamento de texto da norma sem nada a cortar, todos os alvos pequenos com a folga de 24px que a norma pede, e o anel de foco a 11:1 no tema claro e 8,9:1 no escuro.',
        en: 'What a tool cannot see: reflow at 320px with no horizontal bar, the standard’s text spacing with nothing clipped, every small target with the 24px separation the standard asks for, and the focus ring at 11:1 in the light theme and 8.9:1 in the dark.',
        fr: 'Ce qu’un outil ne voit pas : la redistribution à 320px sans barre horizontale, l’espacement de texte de la norme sans rien de coupé, chaque petite cible avec l’écart de 24px exigé, et l’anneau de focus à 11:1 en thème clair et 8,9:1 en sombre.',
        es: 'Lo que una herramienta no ve: reflujo a 320px sin barra horizontal, el espaciado de texto de la norma sin nada cortado, cada objetivo pequeño con la holgura de 24px que la norma pide, y el anillo de foco a 11:1 en el tema claro y 8,9:1 en el oscuro.',
      },
    },
    {
      rotulo: { pt: 'o que não cumpre', en: 'what does not conform', fr: 'ce qui n’est pas conforme', es: 'lo que no cumple' },
      texto: {
        pt: 'As nove leituras não têm transcrição (critério 1.2.1): são textos de outros autores, publicados pelo esquerda.net, e cada entrada liga à página de origem — pôr aqui o texto integral era republicá-lo. Os dois vídeos já levam legendas e a transcrição em texto, mas falta-lhes a descrição do que se vê (1.2.3 e 1.2.5): descrever imagem que não filmei é inventá-la.',
        en: 'The nine readings have no transcript (criterion 1.2.1): they are texts by other authors, published by esquerda.net, and every entry links to its source page — putting the full text here would be republishing it. The two films now carry captions and a written transcript, but not a description of what is on screen (1.2.3 and 1.2.5): describing footage I did not shoot would be inventing it.',
        fr: 'Les neuf lectures n’ont pas de transcription (critère 1.2.1) : ce sont des textes d’autres auteurs, publiés par esquerda.net, et chaque entrée renvoie à sa page d’origine — mettre ici le texte intégral reviendrait à le republier. Les deux vidéos portent désormais des sous-titres et une transcription écrite, mais pas la description de ce qui est à l’image (1.2.3 et 1.2.5) : décrire des images que je n’ai pas tournées, ce serait les inventer.',
        es: 'Las nueve lecturas no tienen transcripción (criterio 1.2.1): son textos de otros autores, publicados por esquerda.net, y cada entrada enlaza a su página de origen — poner aquí el texto íntegro sería republicarlo. Los dos vídeos ya llevan subtítulos y la transcripción en texto, pero les falta la descripción de lo que se ve (1.2.3 y 1.2.5): describir imágenes que no filmé sería inventarlas.',
      },
    },
    {
      rotulo: { pt: 'o que isto não é', en: 'what this is not', fr: 'ce que ceci n’est pas', es: 'lo que esto no es' },
      texto: {
        pt: 'Uma auditoria independente. Foi feita por quem fez o sítio, com ferramenta aberta e método descrito, e está toda no repositório para quem a quiser refazer ou desmentir. Uma auditoria de terceiros é outra coisa, e não a há.',
        en: 'An independent audit. It was done by the person who built the site, with an open tool and a described method, and all of it is in the repository for anyone who wants to repeat it or prove it wrong. A third-party audit is a different thing, and there is none.',
        fr: 'Un audit indépendant. Il a été fait par la personne qui a construit le site, avec un outil ouvert et une méthode décrite, et le tout est dans le dépôt pour qui voudrait le refaire ou le contredire. Un audit par un tiers est autre chose, et il n’y en a pas.',
        es: 'Una auditoría independiente. La hizo quien hizo el sitio, con herramienta abierta y método descrito, y está entera en el repositorio para quien quiera repetirla o desmentirla. Una auditoría de terceros es otra cosa, y no la hay.',
      },
    },
    {
      rotulo: { pt: 'se encontrares uma barreira', en: 'if you hit a barrier', fr: 'si vous rencontrez un obstacle', es: 'si encuentras una barrera' },
      texto: {
        pt: 'Escreve para o endereço do nó do contacto. Diz o que estavas a tentar fazer e com que ferramenta; corrijo e digo-te quando estiver.',
        en: 'Write to the address in the contact node. Say what you were trying to do and with what tool; I fix it and tell you when it is done.',
        fr: 'Écrivez à l’adresse du nœud contact. Dites ce que vous tentiez de faire et avec quel outil ; je corrige et je vous préviens.',
        es: 'Escribe a la dirección del nodo de contacto. Di qué intentabas hacer y con qué herramienta; lo corrijo y te aviso cuando esté.',
      },
    },
  ],
  'acessibilidade'
)
