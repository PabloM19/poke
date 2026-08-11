import type { MainGameContext } from '@/features/games'
import type { EvolutionChain, EvolutionDetail, EvolutionNode } from '@/features/manuals/mainGames/gameDataModels'
import { getEvolutionChain, selectEvolutionForGame, speciesId } from '@/features/manuals/mainGames/gameDataServices'
import { pokemonSummarySnapshot, type PokemonSummaryItem } from '@/features/pokedex/summary'
import { getPokemonSpecies, type PokemonSpecies, type ServiceOptions } from '@/lib/pokeapi'
import type { EvolutionFamilySnapshot, EvolutionStageSnapshot, GeneratedEvolutionRound } from './model'

type SpeciesLoader = (id: number, options?: ServiceOptions) => Promise<PokemonSpecies>
type ChainLoader = (url: string, options?: ServiceOptions) => Promise<EvolutionChain>

const EVOLUTION_ITEM_NAMES: Readonly<Record<string, string>> = {
  'dawn-stone': 'Piedra Alba',
  'dragon-scale': 'Escama Dragón',
  'dubious-disc': 'Disco Extraño',
  electrizer: 'Electrizador',
  'dusk-stone': 'Piedra Noche',
  'fire-stone': 'Piedra Fuego',
  'kings-rock': 'Roca del Rey',
  'leaf-stone': 'Piedra Hoja',
  magmarizer: 'Magmatizador',
  'metal-coat': 'Revestimiento Metálico',
  'moon-stone': 'Piedra Lunar',
  'oval-stone': 'Piedra Oval',
  protector: 'Protector',
  'razor-claw': 'Garra Afilada',
  'razor-fang': 'Colmillo Agudo',
  'reaper-cloth': 'Tela Terrible',
  'shiny-stone': 'Piedra Día',
  'sun-stone': 'Piedra Solar',
  'thunder-stone': 'Piedra Trueno',
  upgrade: 'Mejora',
  'water-stone': 'Piedra Agua',
}

function humanize(value: string): string {
  if (!value) return 'condición especial'
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

function itemName(name: string): string {
  return EVOLUTION_ITEM_NAMES[name] ?? humanize(name)
}

export function evolutionMethodLabel(detail: EvolutionDetail | undefined): string | null {
  if (!detail) return null
  const parts: string[] = []
  if (detail.item) parts.push(`Usar ${itemName(detail.item.name)}`)
  if (detail.trigger.name === 'trade') parts.push('Intercambio')
  if (detail.minLevel != null) parts.push(`Nivel ${detail.minLevel}`)
  if (detail.minHappiness != null) parts.push('Amistad alta')
  if (detail.minBeauty != null) parts.push('Belleza alta')
  if (detail.heldItem) parts.push(`con ${itemName(detail.heldItem.name)}`)
  if (detail.knownMove) parts.push(`conociendo ${humanize(detail.knownMove.name)}`)
  if (detail.location) parts.push(`en ${humanize(detail.location.name)}`)
  if (detail.timeOfDay === 'day') parts.push('de día')
  if (detail.timeOfDay === 'night') parts.push('de noche')
  if (parts.length > 0) return parts.join(' · ')
  if (detail.trigger.name === 'level-up') return 'Subir de nivel'
  if (detail.trigger.name === 'use-item') return 'Usar objeto evolutivo'
  return humanize(detail.trigger.name)
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function chainIdFromUrl(url: string): number {
  const match = /\/evolution-chain\/(\d+)\/?$/.exec(url)
  return match ? Number(match[1]) : 0
}

function pruneToGeneration(
  node: EvolutionNode,
  generation: 4 | 5,
  summaryById: ReadonlyMap<number, PokemonSummaryItem>,
): EvolutionNode | null {
  const summary = summaryById.get(speciesId(node.species))
  if (!summary || summary.generationId > generation) return null
  return {
    ...node,
    evolvesTo: node.evolvesTo
      .map((child) => pruneToGeneration(child, generation, summaryById))
      .filter((child): child is EvolutionNode => child != null),
  }
}

export function linearFamilyFromChain(
  chain: EvolutionChain,
  game: MainGameContext,
  summaries: readonly PokemonSummaryItem[],
): EvolutionFamilySnapshot | null {
  const summaryById = new Map(summaries.map((item) => [item.id, item]))
  const selected = selectEvolutionForGame(chain, game)
  const root = pruneToGeneration(selected.chain, game.generation, summaryById)
  if (!root) return null

  const nodes: EvolutionNode[] = []
  let current: EvolutionNode | undefined = root
  while (current) {
    if (current.evolvesTo.length > 1) return null
    nodes.push(current)
    current = current.evolvesTo[0]
  }
  if (nodes.length < 2 || nodes.length > 3) return null

  const stages: EvolutionStageSnapshot[] = nodes.map((node, index) => {
    const summary = summaryById.get(speciesId(node.species))
    if (!summary) throw new Error(`Falta ${node.species.name} en el snapshot Pokédex`)
    return {
      id: summary.id,
      name: summary.nameEs,
      sprite: summary.sprite,
      method: index === 0 ? null : evolutionMethodLabel(node.details[0]),
    }
  })
  return { chainId: chain.id, stages }
}

function presentedOrderFor(stages: readonly EvolutionStageSnapshot[], random: () => number): number[] {
  const correct = stages.map((stage) => stage.id)
  const shuffledOrder = shuffled(correct, random)
  if (shuffledOrder.every((id, index) => id === correct[index])) {
    shuffledOrder.push(shuffledOrder.shift() as number)
  }
  return shuffledOrder
}

export interface GenerateEvolutionRoundOptions {
  items: readonly PokemonSummaryItem[]
  game: MainGameContext
  excludedChainIds?: ReadonlySet<number>
  random?: () => number
  loadSpecies?: SpeciesLoader
  loadChain?: ChainLoader
  signal?: AbortSignal
}

export async function generateEvolutionRound({
  items,
  game,
  excludedChainIds = new Set(),
  random = Math.random,
  loadSpecies = getPokemonSpecies,
  loadChain = getEvolutionChain,
  signal,
}: GenerateEvolutionRoundOptions): Promise<GeneratedEvolutionRound> {
  if (items.length === 0) throw new Error('La Pokédex seleccionada no tiene Pokémon disponibles')
  const candidates = shuffled(items, random)
  const summaries = pokemonSummarySnapshot.items

  for (const candidate of candidates.slice(0, Math.min(candidates.length, 60))) {
    if (signal?.aborted) throw new DOMException('Solicitud cancelada', 'AbortError')
    const species = await loadSpecies(candidate.id, { signal })
    const chainUrl = species.evolution_chain?.url
    if (!chainUrl) continue
    const knownChainId = chainIdFromUrl(chainUrl)
    if (knownChainId > 0 && excludedChainIds.has(knownChainId)) continue
    const family = linearFamilyFromChain(await loadChain(chainUrl, { signal }), game, summaries)
    if (!family || excludedChainIds.has(family.chainId)) continue
    return { family, presentedOrder: presentedOrderFor(family.stages, random) }
  }
  throw new Error('No encontramos otra familia evolutiva lineal para esta Pokédex')
}
