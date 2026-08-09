import type { ManualArticle, ManualBlock } from '../content/types'
import { Badge } from '@/components/ui/badge'
import {
  LessonCallout,
  LessonSteps,
  LessonTable,
  PhysicalReference,
  TypeExample,
} from './LessonBlocks'
import { InlineManualText } from './InlineManualText'
import { BentoCard } from '@/components/ui/card'

function Block({ block, index }: { block: ManualBlock; index: number }) {
  if (block.type === 'heading') {
    return <h2 className="mb-3 mt-8 text-xl font-semibold" id={`seccion-${index}`}><InlineManualText text={block.text} /></h2>
  }
  if (block.type === 'paragraph') {
    return <p className="my-4 leading-7 text-foreground/90"><InlineManualText text={block.text} /></p>
  }
  if (block.type === 'list') {
    const List = block.ordered ? 'ol' : 'ul'
    return <List className="my-4 ml-5 list-outside list-disc space-y-2 leading-7">{block.items.map((item) => <li key={item}><InlineManualText text={item} /></li>)}</List>
  }
  if (block.type === 'steps') {
    return <LessonSteps title={block.title} items={block.items} />
  }
  if (block.type === 'tip' || block.type === 'note' || block.type === 'warning') {
    return <LessonCallout kind={block.type} title={block.title}><InlineManualText text={block.text} /></LessonCallout>
  }
  if (block.type === 'type-example') {
    return <TypeExample title={block.title} matchups={block.matchups} />
  }
  if (block.type === 'table') {
    return <LessonTable caption={block.headers.join(' · ')} headers={block.headers} rows={block.rows} />
  }
  if (block.type === 'print-reference') return <PhysicalReference reference={block.reference} />
  return null
}

const spoilerLabels = {
  none: 'Sin spoilers',
  mechanics: 'Mecánicas',
  guide: 'Guía',
} as const

export function ManualArticleContent({ article }: { article: ManualArticle }) {
  return (
    <article>
      <BentoCard tone="yellow" className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{spoilerLabels[article.spoilerLevel]}</Badge>
          <Badge variant="secondary">Páginas {article.printReference.pages[0]}–{article.printReference.pages.at(-1)}</Badge>
        </div>
        <h1 className="page-title">{article.title}</h1>
        <p className="mt-3 text-lg leading-8 text-foreground/75">{article.summary}</p>
      </BentoCard>
      <div>
        {article.blocks.map((block, index) => <Block key={`${index}-${block.type}`} block={block} index={index} />)}
      </div>
      <PhysicalReference reference={article.printReference} />
    </article>
  )
}
