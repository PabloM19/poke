# PokéApp — estado actual

Documento operativo para continuar el proyecto sin depender del historial del chat. Describe el build local verificado el **9 de agosto de 2026**.

## Resumen

PokéApp es una aplicación React 19 + TypeScript + Vite, mobile-first y en español. Combina:

- una Pokédex de las generaciones I–V con snapshots locales y enriquecimiento bajo demanda desde PokeAPI;
- Favoritos, Comparar, filtros históricos y contexto por juego;
- un manual editorial completo para once juegos de Nintendo DS;
- seis recursos de consulta y rutas cortas estables para unir la app con el manual impreso;
- instalación PWA y lectura offline del contenido editorial.

La interfaz utiliza el sistema **Pokédex Soft Bento**: modo claro exclusivo, superficies crema, acentos pastel de interfaz, profundidad Soft Clay 2D y color Pokémon reservado para significado semántico.

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

### Sistema visual y responsive

- Tokens globales para canvas, superficies, texto, bordes, cuatro familias pastel de interfaz, radios, spacing, sombras, movimiento y estados.
- Registro único `TYPE_STYLES` para los 18 tipos, con slug PokeAPI, etiqueta española, color canónico, superficie soft derivada y variante sólida accesible.
- `TypeChip` compartido en ficha, Pokédex, guardados, comparador, manuales, filtros y tabla de tipos.
- Iconografía general unificada con Phosphor; la dependencia y los imports de Lucide se han retirado.
- Primitives comunes para Bento, mini cards, chips, controles de icono, búsqueda, estados, skeletons y accordions accesibles.
- Navegación principal de cinco áreas: Inicio, Pokédex, Manuales, Herramientas y Guardados; barra inferior segura en móvil y navegación horizontal en escritorio.
- Ficha Pokémon convertida en Bento con artwork oficial cuando existe, métricas rápidas, estadísticas monocromas y matchup desplegable.
- Manuales migrados de forma completa al mismo lenguaje visual, con búsqueda, progreso, spoilers, guías, recursos y enlaces de 44 px.
- Tema oscuro, demo visual antigua, logo React y componentes de tema sin uso eliminados. La clave histórica de tema permanece únicamente en las migraciones de almacenamiento para no invalidar datos antiguos.

### Onboarding y continuidad local

- Recorrido contextual de siete pasos, multirruta y versionado, con bienvenida, spotlight, scroll automático, progreso, anterior/siguiente, salto, cierre con Escape y tolerancia a objetivos ausentes.
- Estado del recorrido en `pokeapp:onboarding:v1`; distingue `in-progress`, `completed` y `skipped` y conserva el paso actual.
- Reinicio voluntario desde Ajustes. El tour no genera actividad reciente falsa mientras visita sus rutas de demostración.
- Actividad reciente versionada en `pokeapp:recent-activity:v1`, validada al leer, deduplicada y limitada por categoría.
- Se registran fichas Pokémon abiertas de forma significativa, comparaciones con al menos dos especies y lecturas reales del manual.
- Inicio crece progresivamente con un Bento para reanudar, Pokémon recientes y lecturas en curso; no renderiza módulos vacíos.
- Progreso editorial en `pokeapp:manuals:reading:v2`, con migración desde v1, heading/anchor estable, porcentaje aproximado y escritura limitada a cambios de sección o intervalos de scroll.
- Al reanudar se prioriza el anchor guardado; si desaparece tras una actualización editorial, se utiliza el porcentaje como fallback.
- Ajustes permite borrar la actividad reciente sin eliminar las lecciones marcadas como leídas.

## Rutas públicas principales

| Ruta | Contenido |
|---|---|
| `/search` | Buscador predictivo |
| `/pokedex` | Catálogo y filtros I–V |
| `/pokemon/:speciesId` | Ficha independiente |
| `/favorites` | Favoritos persistentes |
| `/compare?ids=25,150` | Comparación compartible |
| `/settings` | Datos, spoilers y diagnóstico |
| `/more` | Hub de Herramientas para Comparar, recursos y Ajustes |
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

- `npm run check`: **60 archivos y 240 pruebas** verdes, además de snapshots, ESLint, TypeScript estricto y build.
- Snapshot Pokédex: 649 entradas, SHA-256 `7a6348b0c922e8d640ecee0f877235d28e79860eab991b71e3f2691551db144c`.
- Snapshot de tipos: 18 entradas, SHA-256 `0b90be9dc4650fd159f0b496d5c957c0d2d103771a3765e3c1fe5cd39d396529`.
- Auditoría local en 320×800, 390×844, 768×1024 y 1440×1000: navegación, búsqueda, ficha, guardados, Comparar, Pokédex, filtros, las 37 rutas del manual, recursos y 404; cero errores o avisos de consola, un `h1`, cero overflow y controles principales de al menos 44 px.
- Onboarding verificado en 390×844, 844×390 y 1440×1000: primera visita, avance/retroceso, siete pasos, cambios de ruta, salto, finalización, refresh, segunda visita y reinicio desde Ajustes; sin overflow ni avisos de consola.
- Continuidad verificada en 320×800: orden y deduplicación de Pokémon, persistencia entre rutas, ausencia de módulos vacíos, limpieza desde Ajustes y restauración de una guía a su heading guardado incluso después del control de spoilers.
- Offline real en Chromium a 390×844: recarga directa de `/manuales/recursos/r-01`, sin peticiones fallidas ni desbordamiento.
- Accesibilidad comprobada en ambos viewports: salto de contenido, targets visibles mínimos 54 px en móvil/44 px en escritorio y movimiento reducido efectivo.

## Trabajo pendiente que necesita estado externo

El alcance local de las fases 0–9 está terminado. Solo quedan bloqueados deliberadamente:

1. elegir la URL HTTPS canónica;
2. desplegar el artefacto en el hosting elegido;
3. generar los QR absolutos con ese origen;
4. probarlos con cámara y teléfono reales.

No ejecutar esos cuatro puntos sin una decisión explícita de dominio/hosting. El artefacto local ya incluye los fallbacks SPA necesarios para el futuro proveedor.
