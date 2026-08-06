# PokéApp

Aplicación local, mobile-first y en español para consultar Pokémon de las
generaciones I–V y acompañar un manual personal de juegos Pokémon para Nintendo
DS.

La app usa React, TypeScript, Vite, Tailwind CSS y PokeAPI REST v2. El contenido
editorial del manual se mantiene local; PokeAPI se utiliza únicamente para
enriquecer datos verificables como especies, tipos, estadísticas, evoluciones o
encuentros.

## Estado actual

Disponible:

- Cliente PokeAPI normalizado con caché v3, retry, timeout y concurrencia limitada.
- Construcción reanudable de un índice local íntegro de especies Gen I–V.
- Búsqueda por nombre español o número.
- Pokédex en cuadrícula o lista con snapshot local de 649 especies.
- Filtros combinables y compartibles por generación, uno/dos tipos, total y orden.
- Ficha básica de Pokémon accesible directamente sin índice.
- Contexto persistente de Perla, Platino, HeartGold, Negro y Negro 2.
- Tipos, estadísticas y relaciones defensivas históricas en ficha y Comparar.
- Manuales 21–86 con rutas profundas, búsqueda, progreso y referencias físicas.
- Recursos locales R-01 (tabla de tipos) y R-02 (estados y efectos).
- Guías completas de Perla, Platino, HeartGold y Negro (87–120) con exploradores regionales por versión.
- Favoritos persistentes con carga, error, retry y eliminación.
- Comparación compartible de 2–4 Pokémon, adaptada a móvil.
- Navegación móvil de cinco destinos y hub Más.
- Tema claro/oscuro.
- Diagnóstico local de PokeAPI.

En ejecución según el plan maestro:

- Manuales por juego y recursos digitales.
- Integración con el manual físico mediante rutas QR estables.

Consulta [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) para el orden,
las decisiones y las puertas de calidad.

## Requisitos

- Node.js 22 recomendado.
- npm 10 o compatible.

## Desarrollo local

```bash
npm install
npm run dev
```

Vite muestra la URL local en la terminal, normalmente
`http://localhost:5173`.

No existe despliegue remoto configurado. El proyecto se ejecuta y verifica en
local.

## Comandos

```bash
npm run dev          # servidor local
npm run lint         # ESLint
npm run typecheck    # TypeScript estricto
npm test             # Vitest + Testing Library
npm run test:watch   # tests en modo watch
npm run build        # build local de producción
npm run preview      # previsualizar el build local
npm run manual:generate # regenerar snapshot tipado desde el Markdown
npm run manual:check # comprobar que el snapshot editorial está sincronizado
npm run pokedex:summary:generate # actualizar el snapshot Pokédex desde PokeAPI
npm run pokedex:summary:check # validar las 649 entradas distribuidas
npm run pokedex:types:generate # actualizar el snapshot de relaciones de tipos
npm run pokedex:types:check # validar las 18 relaciones distribuidas
npm run check        # snapshots + lint + typecheck + tests + build
```

## Arquitectura

```text
src/
  app/          router, layout y providers
  components/   componentes compartidos y UI
  features/
    manuals/    contenido, generador, rutas, búsqueda y progreso
    games/      contexto persistente de los cinco juegos principales
    historical/ selectores y matriz histórica de tipos y estadísticas
    localization/ terminología técnica en español
    pokedex/    filtros, URL y snapshot resumen versionado
  hooks/        integración de datos con React
  lib/
    pokeapi/    HTTP, modelos y servicios PokeAPI
    pokedex/    índice de especies
    storage/    preferencias y caché local
  pages/        pantallas por ruta
  test/         setup y fixtures
docs/
  sources/      fuente editorial versionada del manual
scripts/        generadores locales reproducibles
```

Reglas principales:

- La UI no llama directamente a la red.
- Las respuestas externas se normalizan antes de persistirse.
- El manual debe funcionar sin haber construido el índice.
- Los textos se escriben para usuarios principiantes y en español.
- Cada fase debe terminar con `npm run check` correctamente.

## Fuente del manual

La copia canónica se encuentra en
`docs/sources/manual-pokemon-ds-contenido-revisado.md`. Declara una edición de
156 páginas y sustituye al handoff anterior de 112 páginas.

Los números de página se tratan como referencias de impresión, nunca como IDs
de ruta permanentes.

`npm run manual:generate` extrae exactamente las páginas 21–156 y genera un
snapshot determinista. `npm run manual:check` falla si la fuente y el snapshot
dejan de coincidir.
