import { describe, expect, it, vi } from 'vitest'
import { getMainGameContext } from '@/features/games'
import type { EvolutionChain, EvolutionDetail, EvolutionNode } from '@/features/manuals/mainGames/gameDataModels'
import { pokemonSummarySnapshot, type PokemonSummaryItem } from '@/features/pokedex/summary'
import type { PokemonSpecies } from '@/lib/pokeapi'
import { evolutionMethodLabel, generateEvolutionRound, linearFamilyFromChain } from './generator'

const resource = (name: string, kind = 'pokemon-species', id = 1) => ({ name, url: `https://pokeapi.co/api/v2/${kind}/${id}/` })

function detail(overrides: Partial<EvolutionDetail> = {}): EvolutionDetail {
  return {
    trigger: resource('level-up', 'evolution-trigger'), versionGroup: null, minLevel: 16, minHappiness: null,
    minBeauty: null, timeOfDay: '', item: null, heldItem: null, knownMove: null, location: null, ...overrides,
  }
}

function node(id: number, name: string, evolvesTo: EvolutionNode[] = [], details: EvolutionDetail[] = []): EvolutionNode {
  return { species: resource(name, 'pokemon-species', id), details, evolvesTo }
}

function summaries(ids: readonly number[]): PokemonSummaryItem[] {
  return ids.map((id) => pokemonSummarySnapshot.items.find((item) => item.id === id) as PokemonSummaryItem)
}

const bulbasaurChain: EvolutionChain = {
  id: 1,
  chain: node(1, 'bulbasaur', [node(2, 'ivysaur', [node(3, 'venusaur', [], [detail({ minLevel: 32 })])], [detail()])]),
}

describe('familias de Cadena evolutiva', () => {
  it('convierte una cadena lineal de tres etapas y conserva los métodos', () => {
    const family = linearFamilyFromChain(bulbasaurChain, getMainGameContext('platino'), summaries([1, 2, 3]))
    expect(family?.stages.map((stage) => stage.name)).toEqual(['Bulbasaur', 'Ivysaur', 'Venusaur'])
    expect(family?.stages.map((stage) => stage.method)).toEqual([null, 'Nivel 16', 'Nivel 32'])
  })

  it('acepta familias de dos etapas', () => {
    const chain: EvolutionChain = { id: 7, chain: node(19, 'rattata', [node(20, 'raticate', [], [detail({ minLevel: 20 })])]) }
    expect(linearFamilyFromChain(chain, getMainGameContext('platino'), summaries([19, 20]))?.stages).toHaveLength(2)
  })

  it('excluye familias ramificadas y Pokémon sin evolución', () => {
    const branched: EvolutionChain = { id: 67, chain: node(133, 'eevee', [node(134, 'vaporeon', [], [detail()]), node(135, 'jolteon', [], [detail()])]) }
    const single: EvolutionChain = { id: 25, chain: node(25, 'pikachu') }
    expect(linearFamilyFromChain(branched, getMainGameContext('platino'), summaries([133, 134, 135]))).toBeNull()
    expect(linearFamilyFromChain(single, getMainGameContext('platino'), summaries([25]))).toBeNull()
  })

  it('poda especies posteriores a la generación activa', () => {
    const futureSummary: PokemonSummaryItem = { ...pokemonSummarySnapshot.items[0], id: 700, name: 'future', nameEs: 'Futura', generationId: 6 }
    const chain: EvolutionChain = { id: 1000, chain: node(25, 'pikachu', [node(700, 'future', [], [detail()])]) }
    expect(linearFamilyFromChain(chain, getMainGameContext('platino'), [pokemonSummarySnapshot.items[24], futureSummary])).toBeNull()
  })

  it('explica métodos por nivel, piedra, amistad e intercambio', () => {
    expect(evolutionMethodLabel(detail({ item: resource('thunder-stone', 'item'), minLevel: null }))).toBe('Usar Piedra Trueno')
    expect(evolutionMethodLabel(detail({ minLevel: null, minHappiness: 220, timeOfDay: 'day' }))).toBe('Amistad alta · de día')
    expect(evolutionMethodLabel(detail({ trigger: resource('trade', 'evolution-trigger'), minLevel: null, heldItem: resource('metal-coat', 'item') }))).toBe('Intercambio · con Revestimiento Metálico')
  })

  it('genera una pregunta desordenada sin reutilizar una cadena excluida', async () => {
    const candidates = summaries([133, 1])
    const loadSpecies = vi.fn(async (id: number): Promise<PokemonSpecies> => ({
      id, name: id === 133 ? 'eevee' : 'bulbasaur', names: [], generation: resource('generation-i', 'generation'), varieties: [],
      evolution_chain: { url: `https://pokeapi.co/api/v2/evolution-chain/${id === 133 ? 67 : 1}/` },
    }))
    const loadChain = vi.fn(async () => bulbasaurChain)
    const generated = await generateEvolutionRound({ items: candidates, game: getMainGameContext('platino'), excludedChainIds: new Set([67]), random: () => 0.999, loadSpecies, loadChain })
    expect(generated.family.chainId).toBe(1)
    expect(generated.presentedOrder).not.toEqual(generated.family.stages.map((stage) => stage.id))
    expect(loadChain).toHaveBeenCalledTimes(1)
  })
})
