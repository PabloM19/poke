import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = path.join(projectRoot, 'docs/sources/manual-pokemon-ds-contenido-revisado.md')
const outputPath = path.join(projectRoot, 'src/features/manuals/content/manual-pages.generated.json')

function extractPages(source) {
  const headingPattern = /^### Página (\d+) · (.+)$/gm
  const matches = [...source.matchAll(headingPattern)]
  return matches.map((match, index) => {
    const page = Number(match[1])
    const bodyStart = match.index + match[0].length
    const bodyEnd = matches[index + 1]?.index ?? source.length
    const rawBody = source.slice(bodyStart, bodyEnd)
    const sectionBreak = rawBody.search(/\n---\s*\n\n## /)
    const pageBody = sectionBreak >= 0 ? rawBody.slice(0, sectionBreak) : rawBody
    const markdown = pageBody.replace(/\n---\s*$/, '').trim()
    const title = /^\*\*Título:\*\*\s*(.+)$/m.exec(markdown)?.[1]?.trim() ?? null
    return { page, heading: match[2].trim(), title, markdown }
  }).filter((record) => record.page >= 21 && record.page <= 156)
}

function validatePages(pages) {
  if (pages.length !== 136) throw new Error(`Se esperaban 136 páginas (21–156), recibidas: ${pages.length}`)
  for (let page = 21; page <= 156; page += 1) {
    const matches = pages.filter((record) => record.page === page)
    if (matches.length !== 1) throw new Error(`La página ${page} aparece ${matches.length} veces`)
  }
}

const source = await readFile(sourcePath, 'utf8')
const pages = extractPages(source)
validatePages(pages)
const output = `${JSON.stringify({
  edition: 'ds-156-v1',
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  pages,
}, null, 2)}\n`

if (process.argv.includes('--check')) {
  const current = await readFile(outputPath, 'utf8').catch(() => '')
  if (current !== output) {
    throw new Error('El contenido generado no está sincronizado. Ejecuta npm run manual:generate.')
  }
} else {
  await writeFile(outputPath, output, 'utf8')
}
