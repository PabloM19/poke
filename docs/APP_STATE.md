# PokéApp — Estado del proyecto y rumbo

Documento orientado a agentes / generadores de código y a humanos. Resume arquitectura, lo implementado, convenciones, qué se puede hacer ahora y qué falta.

---

## Guía humana: qué puedes hacer ahora

### Cómo empezar

1. Arranca la app (`npm run dev`) y ábrela en el navegador.
2. Ve a **Ajustes** (icono de engranaje abajo / arriba en desktop).
3. En **Datos de Pokédex (Gen I–V)** pulsa **Construir índice**. Espera a que termine (hay progreso y puedes cancelar).
4. Cuando veas meta tipo “N especies · Gen 1–5 · Actualizado…”, ya puedes usar Buscar y Pokédex.

Sin ese índice, Buscar y Pokédex te piden ir a Ajustes.

### Qué puedes hacer hoy

| Qué | Dónde | Qué pasa |
|-----|--------|----------|
| **Buscar por nombre o número** | Buscar | Escribes (ej. “pika”, “25”) y salen hasta 20 sugerencias con sprite, nombre en español y `#001`. Tocas → ficha. |
| **Ver la Pokédex** | Pokédex | Lista/grid de especies Gen I–V. Cards con sprite, tipos, total de stats. **Cargar más** de 24 en 24. |
| **Cambiar vista** | Pokédex (icono grid/lista) | Alterna cuadrícula ↔ lista; se guarda en el navegador. |
| **Ver ficha de un Pokémon** | Desde Buscar o Pokédex | Sprite grande, nombre ES, `#ID`, tipos, stats base + total, nombres en otros idiomas (acordeón). |
| **Tema claro/oscuro** | Ajustes | Switch; se guarda. |
| **Vista por defecto grid/lista** | Ajustes | Preferencia; también se usa en Pokédex. |
| **Probar la API** | Ajustes → Diagnóstico | Botón “Probar API” (generation, type fire, pikachu…). |
| **Reconstruir / borrar índice** | Ajustes | Reconstruir o “Borrar datos locales” (no borra tema ni favoritos futuros). |

### Qué aún no puedes hacer

- **Favoritos**: pantalla placeholder; el botón en la ficha dice “próximamente”.
- **Comparar**: placeholder; el enlace existe pero no hay lógica.
- **Filtros** (tipo, total, generación): el Sheet de Pokédex dice “próximamente”.
- **Debilidades / resistencias** por generación: no implementado (previsto Fase 4).
- **Sprites en bulk al construir el índice**: el índice solo guarda especies; los sprites se piden al ver cards/resultados (con cache).

---

## Visión (para agentes)

App **mobile-first** (React + TypeScript + Vite) para consultar Pokémon **Gen I–V** vía **PokeAPI**, con **índice local** en `localStorage` para búsqueda y listados rápidos. Sin Next.js. UI con Tailwind v4 + shadcn/ui (estilo new-york, baseColor neutral). Estética neutra (grises). Textos en español para usuarios novatos.

**Stack:** React 19, Vite 7, TypeScript, React Router 7, Tailwind 4 (`@tailwindcss/vite`), shadcn/ui (radix-ui, CVA, clsx, tailwind-merge, lucide-react). Alias `@/` → `src/`.

## Arranque

```bash
npm install
npm run dev    # http://localhost:5173 → redirige a /search
npm run build
npm run lint
```

## Rutas

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/` | Redirect | → `/search` |
| `/search` | **Activo** | Buscador predictivo sobre Species Index |
| `/pokedex` | **Activo** | Grid/lista + cards + “Cargar más” |
| `/pokemon/:speciesId` | **Activo** | Ficha detalle (species + pokemon) |
| `/favorites` | Placeholder | Solo título + copy |
| `/compare` | Placeholder | Solo título + copy |
| `/settings` | **Activo** | Tema, vista, índice Pokédex, diagnóstico API |
| `/demo` | Dev | Demo componentes shadcn |

Layout: header “PokéApp”, nav inferior (móvil) / superior (desktop ≥ md). Tabs: Buscar, Pokédex, Favoritos, Comparar, Ajustes (`AppNav` + lucide).

## Estructura `src/`

```
src/
  app/           Layout, Router, Providers, ThemeProvider
  pages/         Pantallas por ruta
  components/    AppHeader, AppNav, PokedexCard, ui/* (shadcn), ui-demo
  hooks/         useSpeciesIndex, usePokemonSummary
  lib/
    config.ts           POKEAPI_BASE_URL, APP_STORAGE_PREFIX, CACHE_VERSION
    types/common.ts     Nullable, Result
    storage/            settings + localCache (TTL + versión)
    pokeapi/            http, errors, models, services, constants
    pokedex/            indexTypes, indexStore, indexBuilder (Species Index)
    utils.ts            cn()
  styles/globals.css    Tailwind + tema shadcn light/dark
```

**Convenciones:**

- API solo en `src/lib/pokeapi/`
- Storage/cache solo en `src/lib/storage/` (+ índice en `src/lib/pokedex/`)
- UI no mezcla lógica de red: usa hooks + services

## Capa de datos

### Config (`lib/config.ts`)

- `POKEAPI_BASE_URL = "https://pokeapi.co/api/v2"`
- `APP_STORAGE_PREFIX = "pokeapp:"`
- `CACHE_VERSION = "v1"`

### HTTP (`lib/pokeapi/http.ts` + `errors.ts`)

- `buildUrl`, `fetchJson<T>`
- `PokeApiError` con `kind: "http"|"parse"|"network"`, `status?`, `path`

### Modelos mínimos (`lib/pokeapi/models.ts`)

NamedAPIResource, PokemonSprites, PokemonType, PokemonStat, Pokemon, LanguageName, PokemonSpecies, TypeRelations, Type, Generation.  
**No** se modela toda la API.

### Services (`lib/pokeapi/services.ts`)

- `getGeneration`, `getType`, `getPokemon`, `getPokemonSpecies` → `fetchJson` + **localCache** (TTL: Gen/Type 7d, Pokemon/Species 30d)
- Helpers: `getSpanishName(species)`, `getSpeciesIdFromUrl(url)`
- `GEN_RANGE = [1,2,3,4,5]`

### Cache (`lib/storage/localCache.ts`)

- `makeKey(parts)` → `pokeapp:v1:part1:part2`
- `getCache` / `setCache` / `removeCache` / `clearCacheByPrefix`
- JSON inválido → borra key; QuotaExceeded → limpia expiradas y reintenta 1 vez

### Settings (`lib/storage/settings.ts`)

- Keys: `pokeapp:theme` (`light`|`dark`), `pokeapp:defaultView` (`grid`|`list`)
- `getSetting` / `setSetting` con validación

### Species Index (`lib/pokedex/`)

Índice local Gen I–V (solo `/generation` + `/pokemon-species`, **no** bulk `/pokemon` al construir).

**SpeciesIndexItem:** speciesId, speciesName, nameEs, generationId, defaultPokemonName, speciesUrl

**Build:** `buildSpeciesIndex({ maxGen=5, concurrency=6, onProgress, signal })`

- Carga generaciones, dedupe species, fetch species en paralelo (pool), guarda partial cada 20, al final índice ordenado + meta
- Reanudable vía partial + AbortController

**Store keys (localStorage):**

- `pokeapp:index:species:v1` — array completo
- `pokeapp:index:species:meta:v1` — timestamp, maxGen, counts, version
- `pokeapp:index:species:partial:v1` — progreso para reanudar

**API store:** `getSpeciesIndex`, `getSpeciesIndexMeta`, `clearSpeciesIndex`, `ensureSpeciesIndex` (no auto-build)

**Hook:** `useSpeciesIndex()` → `{ index, meta, status: "missing"|"ready", error: null, refresh }` — **no** dispara builds.

### Cache de totales en cards

- `pokeapp:pokedex:totalStat:v1:{speciesId}` — número (total base stats)

## Features UI implementadas

### Tema

ThemeProvider + clase `.dark` en `<html>`. Script en `index.html` evita flash. Switch en Settings.

### Buscar (`/search`)

- Índice missing → callout + “Ir a Ajustes”
- Listo → input “Busca un Pokémon (en español)…”, matching normalizado (lowercase + sin tildes), prioridad startsWith luego includes, max 20
- Resultados: sprite (lazy `usePokemonSummary`), nameEs, `#001` → `/pokemon/:speciesId`

### Pokédex (`/pokedex`)

- Callout si missing
- Toolbar: título, Sheet “Filtros” (placeholder), toggle Grid/List (`defaultView` persistido)
- Grid 2 / 3 / 4 cols o lista; chunks 24 + “Cargar más”
- `PokedexCard` + `usePokemonSummary` (sprite, badges tipos, Total)

### Detalle (`/pokemon/:speciesId`)

- Missing / id inválido / no en índice → error amable + link Pokédex
- Carga: `getPokemonSpecies` + `getPokemon(defaultPokemonName)`
- UI: sprite, nameEs, #ID, tipos, stats + “Total = suma de las estadísticas base.”, acordeón nombres (top 10), Favoritos deshabilitado, Comparar → `/compare`

### Ajustes

- Apariencia (tema), Vista por defecto, Datos de Pokédex (construir/reconstruir/cancelar/borrar índice + progreso), Diagnóstico PokeAPI

## Qué NO está implementado (rumbo)

| Fase / feature | Estado |
|----------------|--------|
| Favoritos reales | Pendiente |
| Comparar stats | Pendiente |
| Filtros Pokédex (tipo, total, gen) | Sheet placeholder |
| Debilidades / resistencias por generación | Fase 4 (Type + past_damage_relations) |
| Motor defensivo / matchups | Pendiente |
| Bulk fetch índice de búsqueda extra | No (el Species Index ya cubre Gen I–V) |
| IndexedDB | No; solo localStorage |

**Rumbo sugerido:** completar Favoritos y Comparar → filtros en Sheet → Fase 4 (tipos por gen / past_types) → pulido UX mobile.

## Reglas para agentes futuros

1. No Next.js; solo Vite + React TS.
2. No mezclar UI en `lib/`; API en `pokeapi/`, persistencia en `storage/` / `pokedex/`.
3. Antes de listar/buscar: el usuario debe haber construido el Species Index (UI en Settings).
4. No descargar `/pokemon` para todas las especies al build del índice; lazy-fetch en cards/detalle.
5. Mantener estética neutra; reutilizar shadcn.
6. Preferencias: siempre `APP_STORAGE_PREFIX` + validación.
7. Cache API: `makeKey` + TTL; índice: keys `index:species:*`.
8. Textos novatos en español; no PokeAPI en copy de usuario salvo diagnóstico.

## Checklist rápido “¿está listo el índice?”

1. Settings → Construir índice → progreso → meta con N especies.
2. Local Storage: `pokeapp:index:species:v1` y `pokeapp:index:species:meta:v1`.
3. `/search` muestra input; `/pokedex` muestra cards.
