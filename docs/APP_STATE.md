# PokéApp — estado actual

Documento operativo para continuar el proyecto sin depender del historial del chat. Describe el build local verificado el **9 de agosto de 2026**.

## Resumen

PokéApp es una aplicación React 19 + TypeScript + Vite, mobile-first y en español. Combina:

- una Pokédex de las generaciones I–V con snapshots locales y enriquecimiento bajo demanda desde PokeAPI;
- Favoritos, Comparar, filtros históricos y contexto por juego;
- un manual editorial completo para once juegos de Nintendo DS;
- seis recursos de consulta y rutas cortas estables para unir la app con el manual impreso;
- instalación PWA y lectura offline del contenido editorial.

No hay despliegue remoto. El proyecto se construye, sirve y prueba exclusivamente en local por decisión expresa del propietario.

## Fuente editorial canónica

- Archivo: `docs/sources/manual-pokemon-ds-contenido-revisado.md`
- Extensión declarada por la última versión: **156 páginas**.
- Alcance distribuido en la app: páginas **21–156**, sin huecos.
- SHA-256: `b0f171fc829902ca182f0ca1cca224ea857d1cf6e568e549470d416533ad6d00`.
- Edición de contenido de la app: `ds-156-v1`.

La cifra procede del contenido maestro adjunto: el propio documento indica que la incorporación de iniciales, rivales y Medallas amplía la versión anterior a 156 páginas. Los números de página son metadatos visibles, nunca IDs de ruta.

## Funcionalidad terminada

### Pokédex y datos

- Cliente PokeAPI normalizado con deduplicación, límite de concurrencia, timeout, retry, cancelación y caché versionada.
- Índice reanudable de especies I–V y ficha directa aunque no exista índice.
- Snapshot distribuido de 649 especies, validado por hash.
- Snapshot histórico de las 18 relaciones de tipos.
- Búsqueda por nombre español o número.
- Pokédex paginada en grid/lista con filtros combinables por generación, uno o dos tipos, total y orden; estado canónico en URL.
- Detalle con tipos, estadísticas, total, defensa histórica y nombres alternativos.
- Favoritos persistentes con estados vacío/carga/error/reintento.
- Comparación compartible de 2–4 especies y comportamiento histórico según el juego activo.
- Contexto persistente para Perla, Platino, HeartGold, Negro y Negro 2.

### Manuales

- Conceptos generales y rutas de aprendizaje, páginas 21–86.
- Guías completas de Perla, Platino, Oro HeartGold, Negro y Negro 2, páginas 87–128.
- Guías completas de Equipo de Rescate Azul y Exploradores de la Oscuridad, páginas 129–144.
- Minifichas de Ranger, Dash, Link! y Conquest, páginas 145–152.
- Centro de recursos y cierre, páginas 153–156.
- Recursos locales R-01…R-06: tabla histórica de tipos, estados, iconos, kit PMD, captura Ranger y táctica Conquest.
- Búsqueda local, migas, anterior/siguiente, progreso de lectura y 404 editorial.
- Referencias exactas al manual físico en los 30 artículos.
- Retornos recurso → lección → juego → Pokémon y vuelta segura desde la ficha.
- Spoilers persistentes `none | mechanics | guide`, con `none` por defecto y revelado puntual reversible.
- Enriquecimiento PokeAPI solo cuando aporta datos verificables; las mecánicas editoriales permanecen locales.

### Integración física local

Hay 17 aliases estables bajo `/r/`:

- Recursos: `/r/r-01` … `/r/r-06`.
- Juegos: `/r/perla`, `/r/platino`, `/r/heartgold`, `/r/negro`, `/r/negro-2`, `/r/rescate-azul`, `/r/exploradores-oscuridad`, `/r/ranger`, `/r/dash`, `/r/link` y `/r/conquest`.

Los códigos desconocidos terminan en el 404 editorial. No se han generado QR absolutos: deben esperar a una URL HTTPS canónica para no imprimir localhost ni un dominio provisional.

### Cierre de producción local

- Error Boundary global, 404 general/editorial, aviso de desconexión y reintentos aislados.
- Documento `lang="es"`, título, descripción, colores, favicon e icono propios.
- `/demo` retirado de producción.
- Todas las páginas no estructurales cargan de forma diferida. El JS inicial pasó de 455,03 kB a 344,16 kB; gzip, de 143,32 kB a 110,68 kB.
- Salto al contenido, foco visible, un `h1` por vista, targets de 44 px o más y `prefers-reduced-motion`.
- PWA en español con manifiesto, icono, service worker versionado por contenido y precaché de chunks, snapshots y manuales.
- Fallback SPA incluido en el artefacto: `_redirects`, `404.html` equivalente a `index.html` y `_headers` para actualizar el worker sin caché obsoleta.
- El build funciona offline desde una recarga directa de una ruta editorial profunda.

## Rutas públicas principales

| Ruta | Contenido |
|---|---|
| `/search` | Buscador predictivo |
| `/pokedex` | Catálogo y filtros I–V |
| `/pokemon/:speciesId` | Ficha independiente |
| `/favorites` | Favoritos persistentes |
| `/compare?ids=25,150` | Comparación compartible |
| `/settings` | Apariencia, datos, spoilers y diagnóstico |
| `/more` | Hub móvil para Comparar y Ajustes |
| `/manuales` | Portada, búsqueda e índice editorial |
| `/manuales/empezar/:tema` | Conceptos iniciales |
| `/manuales/entrenador/:tema` | Saga principal |
| `/manuales/mundo-misterioso/:tema` | Conceptos PMD |
| `/manuales/juegos/:juego` | Guías por juego |
| `/manuales/recursos` | Centro actualizable |
| `/manuales/recursos/r-01`…`r-06` | Referencias locales |
| `/r/:shortCode` | Alias estable del manual |

## Arquitectura

```text
src/
  app/             router, layout, resiliencia y providers
  assets/          identidad visual propia
  components/      UI compartida y navegación responsive
  data/            snapshots distribuidos
  features/
    compare/       selección, URL y resultados históricos
    favorites/     store y tarjetas persistentes
    games/         contexto de los cinco juegos principales
    historical/    tipos, stats y defensa por generación
    manuals/       contenido, rutas, recursos, búsqueda y progreso
    pokedex/       snapshot y filtros compartibles
  lib/
    pokeapi/       red, DTOs, servicios y normalizadores
    pokedex/       construcción y persistencia del índice
    storage/       caché, migraciones y preferencias
  pages/           pantallas de ruta
  pwa/             manifiesto, registro y service worker
  test/            configuración e integridad documental
scripts/           generadores deterministas
docs/sources/      fuente editorial canónica
```

Reglas que deben mantenerse:

1. La UI no llama directamente a PokeAPI; usa servicios y normalizadores.
2. El manual no depende del índice ni de la red.
3. Los datos externos nunca definen mecánicas de spin-offs.
4. Las preferencias usan el prefijo `pokeapp:` y validación al leer.
5. Las rutas no se identifican por páginas impresas.
6. Cada cambio funcional termina con `npm run check` y verificación responsive proporcional al riesgo.

## Verificación de cierre

- `npm run check`: **55 archivos y 229 pruebas** verdes, además de snapshots, ESLint, TypeScript estricto y build.
- Snapshot Pokédex: 649 entradas, SHA-256 `7a6348b0c922e8d640ecee0f877235d28e79860eab991b71e3f2691551db144c`.
- Snapshot de tipos: 18 entradas, SHA-256 `0b90be9dc4650fd159f0b496d5c957c0d2d103771a3765e3c1fe5cd39d396529`.
- E2E local de producción en 390×844 y 1280×900: navegación, búsqueda, ficha, favorito, Favoritos, Comparar, Pokédex, filtros, manuales, recursos y ruta corta; cero errores de consola, un `h1` y cero overflow.
- Offline real en Chromium a 390×844: recarga directa de `/manuales/recursos/r-01`, sin peticiones fallidas ni desbordamiento.
- Accesibilidad comprobada en ambos viewports: salto de contenido, targets visibles mínimos 54 px en móvil/44 px en escritorio y movimiento reducido efectivo.

## Trabajo pendiente que necesita estado externo

El alcance local de las fases 0–9 está terminado. Solo quedan bloqueados deliberadamente:

1. elegir la URL HTTPS canónica;
2. desplegar el artefacto en el hosting elegido;
3. generar los QR absolutos con ese origen;
4. probarlos con cámara y teléfono reales.

No ejecutar esos cuatro puntos sin una decisión explícita de dominio/hosting. El artefacto local ya incluye los fallbacks SPA necesarios para el futuro proveedor.
