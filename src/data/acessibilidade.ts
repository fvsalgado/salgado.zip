import { z } from 'zod'
import { Lang, parse } from './schema.ts'
import { contacto } from './contacto.ts'

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
 * verifica; o quanto vive no verify.mjs, que é o sítio que não mente. Desde
 * 10/11/2026 di-lo também sem o vocabulário da bancada — a «árvore», o
 * axe-core, as razões de contraste —, que é de quem a fez e não de quem lê.
 *
 * O que NÃO se afirma, e faz diferença: isto não é uma auditoria independente.
 * Foi feita por quem fez o sítio, e uma auditoria de terceiros é outra coisa.
 * Dizê-lo é o que separa esta página de um selo comprado.
 */

const Campo = z.object({ rotulo: Lang, texto: Lang })

/* O endereço vem do contacto, e não escrito outra vez: dizia «o endereço do nó
   do contacto», que é a página a falar de si própria. */
const email = contacto.email
if (email === null) throw new Error('acessibilidade: a barreira precisa do email do contacto')

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
        pt: 'Antes de cada publicação, verificações automáticas percorrem todas as páginas, nos dois temas, e travam a publicação se encontrarem um problema: contraste, navegação por teclado sem armadilhas de foco, legendas dos vídeos e o aviso nas ligações que abrem numa janela nova.',
        en: 'Before every release, automated checks go through every page, in both themes, and stop the release if they find a problem: contrast, keyboard navigation with no focus traps, captions on the videos, and the warning on links that open in a new window.',
        fr: 'Avant chaque publication, des vérifications automatiques parcourent toutes les pages, dans les deux thèmes, et bloquent la publication si elles trouvent un problème : contraste, navigation au clavier sans piège à focus, sous-titres des vidéos et l’avertissement sur les liens qui s’ouvrent dans une nouvelle fenêtre.',
        es: 'Antes de cada publicación, unas verificaciones automáticas recorren todas las páginas, en los dos temas, y detienen la publicación si encuentran un problema: contraste, navegación por teclado sin trampas de foco, subtítulos de los vídeos y el aviso en los enlaces que se abren en una ventana nueva.',
      },
    },
    {
      rotulo: { pt: 'o que se mediu à mão', en: 'measured by hand', fr: 'mesuré à la main', es: 'lo que se midió a mano' },
      texto: {
        pt: 'O que uma ferramenta não vê: a página a 320 px de largura sem barra horizontal, o espaçamento de texto da norma sem nada a cortar, alvos com a folga que a norma pede, e o foco sempre visível nos dois temas.',
        en: 'What a tool cannot see: the page at 320 px wide with no horizontal bar, the standard’s text spacing with nothing clipped, targets with the spacing the standard asks for, and the focus always visible in both themes.',
        fr: 'Ce qu’un outil ne voit pas : la page à 320 px de large sans barre horizontale, l’espacement de texte de la norme sans rien de coupé, des cibles avec l’écart que la norme exige, et le focus toujours visible dans les deux thèmes.',
        es: 'Lo que una herramienta no ve: la página a 320 px de ancho sin barra horizontal, el espaciado de texto de la norma sin nada cortado, objetivos con la holgura que la norma pide, y el foco siempre visible en los dos temas.',
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
        pt: 'Uma auditoria independente: foi feita por quem fez o sítio. O método e os resultados estão no código, que é aberto.',
        en: 'An independent audit: it was done by the person who built the site. The method and the results are in the code, which is open.',
        fr: 'Un audit indépendant : il a été fait par la personne qui a construit le site. La méthode et les résultats sont dans le code, qui est ouvert.',
        es: 'Una auditoría independiente: la hizo quien hizo el sitio. El método y los resultados están en el código, que es abierto.',
      },
    },
    {
      rotulo: { pt: 'se encontrares uma barreira', en: 'if you hit a barrier', fr: 'si vous rencontrez un obstacle', es: 'si encuentras una barrera' },
      texto: {
        pt: `Escreve para ${email}. Diz o que estavas a tentar fazer e com que ferramenta; corrijo e digo-te quando estiver.`,
        en: `Write to ${email}. Say what you were trying to do and with what tool; I fix it and tell you when it is done.`,
        fr: `Écrivez à ${email}. Dites ce que vous tentiez de faire et avec quel outil ; je corrige et je vous préviens.`,
        es: `Escribe a ${email}. Di qué intentabas hacer y con qué herramienta; lo corrijo y te aviso cuando esté.`,
      },
    },
  ],
  'acessibilidade'
)
