import { describe, expect, it } from 'vitest'
import { bundledTypeRelations, bundledTypesByName } from './typeRelationsData'

describe('bundled type relations', () => {
  it('incluye los 18 tipos normalizados', () => {
    expect(bundledTypeRelations).toHaveLength(18)
    expect(bundledTypeRelations[0]).toMatchObject({ id: 1, name: 'normal' })
    expect(bundledTypeRelations.at(-1)).toMatchObject({ id: 18, name: 'fairy' })
  })

  it('conserva el cambio histórico de Acero hasta Gen V', () => {
    const steel = bundledTypesByName.get('steel')
    const old = steel?.past_damage_relations.find((entry) => entry.generation.name === 'generation-v')
    expect(old?.damage_relations.half_damage_from.map((entry) => entry.name))
      .toEqual(expect.arrayContaining(['ghost', 'dark']))
  })
})
