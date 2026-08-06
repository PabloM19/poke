import type { ManualBlock, ManualSourcePage } from './types'

const HIDDEN_EDITORIAL_LABELS = ['Título:', 'Antetítulo:', 'Texto:', 'Visual sugerido:']

function cleanInline(value: string): string {
  return value.trim().replace(/\s{2,}/g, ' ')
}

function parseTable(lines: readonly string[]): Extract<ManualBlock, { type: 'table' }> {
  const rows = lines.map((line) => line.split('|').slice(1, -1).map((cell) => cleanInline(cell)))
  return { type: 'table', headers: rows[0] ?? [], rows: rows.slice(2) }
}

function calloutKind(label: string): 'tip' | 'note' | 'warning' | null {
  if (/^Atención/i.test(label)) return 'warning'
  if (/^(Consejo|Idea clave|Atajo|Ventaja|Rutina útil|Ritmo recomendado|Busca|Gestiona|No malgastes)/i.test(label)) return 'tip'
  if (/^(Nota|Referencia|Diferencia esencial|En Mundo Misterioso|Mundo Misterioso|No es solo)/i.test(label)) return 'note'
  return null
}

function nextParagraph(lines: readonly string[], start: number): { text: string; end: number } {
  let cursor = start
  while (cursor < lines.length && !lines[cursor].trim()) cursor += 1
  const content: string[] = []
  while (cursor < lines.length && lines[cursor].trim() &&
      !/^[-|]\s?/.test(lines[cursor]) && !/^\d+\.\s/.test(lines[cursor])) {
    content.push(lines[cursor].trim())
    cursor += 1
  }
  return { text: cleanInline(content.join(' ')), end: cursor - 1 }
}

export function parseManualPage(page: ManualSourcePage): readonly ManualBlock[] {
  const lines = page.markdown.split('\n')
  const blocks: ManualBlock[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) continue

    const boldLabel = /^\*\*([^*]+)\*\*(?:\s*(.*))?$/.exec(line)
    if (boldLabel) {
      const label = boldLabel[1].trim()
      let remainder = boldLabel[2]?.trim() ?? ''
      if (HIDDEN_EDITORIAL_LABELS.includes(label)) continue
      if (label === 'Pie:') {
        if (remainder) blocks.push({ type: 'note', title: 'Para continuar', text: remainder })
        continue
      }

      const kind = calloutKind(label)
      if (kind) {
        if (!remainder) {
          const following = nextParagraph(lines, index + 1)
          remainder = following.text
          if (remainder) index = following.end
        }
        if (remainder) blocks.push({ type: kind, title: label.replace(/:$/, ''), text: remainder })
        continue
      }
      if (/^Ejemplo visual:?$/i.test(label)) {
        const following = nextParagraph(lines, index + 1)
        if (following.text) {
          blocks.push({
            type: 'type-example',
            title: 'Ejemplo de tipos',
            matchups: following.text.split(/\s*·\s*/).filter(Boolean),
          })
          index = following.end
        }
        continue
      }
      blocks.push({ type: 'heading', text: label.replace(/:$/, ''), level: 3 })
      if (remainder) blocks.push({ type: 'paragraph', text: remainder })
      continue
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index].trim())
        index += 1
      }
      index -= 1
      if (tableLines.length >= 2) blocks.push(parseTable(tableLines))
      continue
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^-\s+/.test(lines[index].trim())) {
        items.push(cleanInline(lines[index].trim().replace(/^-\s+/, '')))
        index += 1
      }
      index -= 1
      blocks.push({ type: 'list', items })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(cleanInline(lines[index].trim().replace(/^\d+\.\s+/, '')))
        index += 1
      }
      index -= 1
      blocks.push({ type: 'steps', items })
      continue
    }

    const paragraph: string[] = [line]
    while (index + 1 < lines.length && lines[index + 1].trim()) {
      const next = lines[index + 1].trim()
      if (/^(\*\*|\||-\s+|\d+\.\s+)/.test(next)) break
      paragraph.push(next)
      index += 1
    }
    blocks.push({ type: 'paragraph', text: cleanInline(paragraph.join(' ')) })
  }

  return blocks
}
