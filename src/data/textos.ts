import { z } from 'zod'
import { Lang, parse } from './schema.ts'
import { LINGUAS, type Idioma } from './idiomas.ts'
import linhas from '../generated/linhas.json' with { type: 'json' }

/** Cada língua agrupa os milhares à sua maneira; nenhuma delas à mão. */
const num = (i: Idioma) => (linhas as { total: number }).total.toLocaleString(LINGUAS[i].bcp47)
const m = (linhas as { ficheiros: number }).ficheiros

/**
 * O colofão do SÍTIO: como esta página é feita. É aqui que o Claude entra por
 * extenso — mostrado no artefacto, não afirmado em adjetivos.
 */
export const colofaoSite = parse(z.array(Lang).min(1), [
  {
    pt: 'Astro estático, sem cookies e sem publicidade. A medição de visitas é anónima e sai do próprio domínio. Tipografia IBM Plex, auto-alojada.',
    en: 'Static Astro, no cookies and no advertising. Visit measurement is anonymous and served from this domain. IBM Plex type, self-hosted.',
    fr: 'Astro statique, sans cookies et sans publicité. La mesure de fréquentation est anonyme et servie depuis ce domaine. Typographie IBM Plex, auto-hébergée.',
    es: 'Astro estático, sin cookies y sin publicidad. La medición de visitas es anónima y se sirve del propio dominio. Tipografía IBM Plex, autoalojada.',
  },
  {
    pt: `${num('pt')} linhas de código em ${m} ficheiros. Uma fonte de dados; a página, os PDF, o resume.json e o zip saem dela.`,
    en: `${num('en')} lines of code across ${m} files. One data source; the page, the PDFs, the resume.json and the zip come out of it.`,
    fr: `${num('fr')} lignes de code dans ${m} fichiers. Une seule source de données ; la page, les PDF, le resume.json et le zip en sortent.`,
    es: `${num('es')} líneas de código en ${m} ficheros. Una sola fuente de datos; la página, los PDF, el resume.json y el zip salen de ella.`,
  },
  {
    pt: 'Desenhado, escrito e construído a meias com o Claude — Claude Code, da Anthropic —, entre outras ferramentas.',
    en: 'Designed, written and built together with Claude — Claude Code, by Anthropic — among other tools.',
    fr: 'Conçu, écrit et construit à deux avec Claude — Claude Code, d’Anthropic —, parmi d’autres outils.',
    es: 'Diseñado, escrito y construido a medias con Claude — Claude Code, de Anthropic —, entre otras herramientas.',
  },
], 'textos.colofaoSite')

/**
 * O colofão do DOCUMENTO, e não do sítio. Um colofão fala do objeto em que
 * está impresso: com que letra foi composto, como foi produzido e de onde veio.
 *
 * Quem tem o PDF na mão pode não saber de onde o papel veio — daí a
 * proveniência ser explícita, e não uma remissão para «este site». A data de
 * geração vai no rodapé de todas as páginas, que é onde sobrevive a uma folha
 * solta.
 *
 * Fala do objeto e não do ecrã: composição, imposição, tiragem, e o caminho de
 * volta ao original. Um colofão que se lesse igual num site não era um colofão.
 *
 * Sai em português e em inglês, que são as línguas dos dois documentos. As
 * outras duas existem porque o esquema pede as quatro — e porque o dia em que
 * houver um PDF em francês, o texto já cá está.
 */
export const colofaoDocumento = parse(z.array(Lang).min(1), [
  {
    pt: 'Composto em IBM Plex Serif e IBM Plex Mono, ambas de licença aberta. Paginado em HTML, imposto em A4 e impresso em PDF.',
    en: 'Set in IBM Plex Serif and IBM Plex Mono, both openly licensed. Paginated in HTML, imposed on A4 and printed to PDF.',
    fr: 'Composé en IBM Plex Serif et IBM Plex Mono, toutes deux sous licence ouverte. Paginé en HTML, imposé en A4 et imprimé en PDF.',
    es: 'Compuesto en IBM Plex Serif e IBM Plex Mono, ambas de licencia abierta. Paginado en HTML, impuesto en A4 e impreso en PDF.',
  },
  {
    pt: 'Tirado de salgado.zip, onde esta informação é mantida e verificada antes de cada publicação. A data desta tiragem está no rodapé de cada página, e o código QR da primeira leva ao original.',
    en: 'Drawn from salgado.zip, where this information is maintained and checked before every release. The date of this impression is in the footer of every page, and the QR code on the first leads back to the original.',
    fr: 'Tiré de salgado.zip, où cette information est tenue à jour et vérifiée avant chaque publication. La date de ce tirage figure au pied de chaque page, et le code QR de la première ramène à l’original.',
    es: 'Sacado de salgado.zip, donde esta información se mantiene y se verifica antes de cada publicación. La fecha de esta tirada está al pie de cada página, y el código QR de la primera lleva al original.',
  },
  {
    pt: 'Escrito e construído a meias com o Claude — Claude Code, da Anthropic —, entre outras ferramentas.',
    en: 'Written and built together with Claude — Claude Code, by Anthropic — among other tools.',
    fr: 'Écrit et construit à deux avec Claude — Claude Code, d’Anthropic —, parmi d’autres outils.',
    es: 'Escrito y construido a medias con Claude — Claude Code, de Anthropic —, entre otras herramientas.',
  },
], 'textos.colofaoDocumento')

/**
 * A ressalva dos certificados. Vive aqui, e não dentro de um componente, porque
 * aparece nas duas renderizações: estava copiada à letra no Archive e no
 * Dossier, e duas cópias da mesma frase são duas frases à espera de divergir.
 */
export const notaCertificados = parse(Lang, {
  pt: 'Cursos online, feitos por conta própria. Não são graus destas instituições.',
  en: 'Online courses, taken independently. Not degrees from these institutions.',
  fr: 'Cours en ligne, suivis de ma propre initiative. Ce ne sont pas des diplômes de ces institutions.',
  es: 'Cursos en línea, hechos por cuenta propia. No son títulos de estas instituciones.',
}, 'textos.notaCertificados')

/**
 * O aviso que acompanha uma ligação que sai do sítio.
 *
 * Vive aqui, e não dentro do componente que o usa, porque são dois a usá-lo —
 * o `Externo.astro` e a linha de ficheiro do `Node.astro` — e um aviso escrito
 * em dois sítios acaba a dizer duas coisas diferentes. A seta ↗ é o mesmo
 * aviso para quem vê; este é para quem ouve.
 */
export const avisoJanelaNova = parse(Lang, {
  pt: 'abre numa janela nova',
  en: 'opens in a new window',
  fr: 'ouvre dans une nouvelle fenêtre',
  es: 'abre en una ventana nueva',
}, 'textos.avisoJanelaNova')

/** O código deste site é público: a prova do colofão está no repositório. */
export const codigoDoSite = 'https://github.com/fvsalgado/salgado.zip'

/**
 * O perfil, derivado do repositório e não escrito outra vez. Serve o `sameAs`
 * do JSON-LD e o ícone do rodapé — e derivá-lo é o que garante que os dois
 * apontam sempre ao mesmo sítio.
 */
export const perfilGithub = codigoDoSite.replace(/\/[^/]+$/, '')

/**
 * A mesma licença do Primeira Plateia — o ficheiro LICENSE deste repositório é
 * byte a byte o de lá. A AGPL é a escolha coerente para software que se serve
 * pela rede: quem o correr por cima de um servidor tem de dar o código a quem o
 * usa, e não só a quem o descarrega.
 *
 * A ligação não vai ao ficheiro no GitHub — dependia do nome do ramo e morria
 * se o repositório mudasse de sítio — nem à gnu.org, que não responde de forma
 * fiável à verificação 3 e por isso não passa a regra da casa: uma ligação que
 * o build não consegue confirmar não se publica. Vai à Open Source Initiative,
 * que é quem aprova a licença e responde sempre.
 */
export const licenca = {
  nome: 'AGPL-3.0',
  url: 'https://opensource.org/license/agpl-v3',
}
