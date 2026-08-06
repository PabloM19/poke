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

- Construcción de un índice local de especies Gen I–V.
- Búsqueda por nombre español o número.
- Pokédex en cuadrícula o lista.
- Ficha básica de Pokémon.
- Tema claro/oscuro.
- Diagnóstico local de PokeAPI.

En ejecución según el plan maestro:

- Fiabilidad de caché, red e índice.
- Manuales generales y por juego.
- Favoritos, comparación y filtros.
- Tipos históricos y recursos digitales.
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
npm run check        # lint + typecheck + tests + build
```

## Arquitectura

```text
src/
  app/          router, layout y providers
  components/   componentes compartidos y UI
  hooks/        integración de datos con React
  lib/
    pokeapi/    HTTP, modelos y servicios PokeAPI
    pokedex/    índice de especies
    storage/    preferencias y caché local
  pages/        pantallas por ruta
  test/         setup y fixtures
docs/
  sources/      fuente editorial versionada del manual
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
