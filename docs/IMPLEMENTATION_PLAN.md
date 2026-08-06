# PokéApp — Plan maestro de finalización e integración con el manual

**Estado:** canónico para la ejecución; fases 0–3 completadas
**Fecha:** 6 de agosto de 2026  
**Regla principal:** no se empieza una fase hasta que la anterior cumpla todos sus criterios de salida.

## 1. Fuentes de verdad

Este plan se basa en cuatro fuentes:

1. `docs/APP_STATE.md`, que describe la intención y el rumbo original de la app.
2. El código real de `src/`, que prevalece cuando el documento de estado no coincide con la implementación.
3. `/Users/bleras/Documents/Codex/2026-07-28/new-chat/output/manual-pokemon-ds-contenido-revisado.md`, que es la fuente editorial canónica del manual.
4. La documentación oficial de PokeAPI REST v2.

Referencias técnicas primarias: [REST v2 y política de uso](https://pokeapi.co/docs/v2), [alcance y carencias reconocidas](https://pokeapi.co/about) y [OpenAPI oficial](https://github.com/PokeAPI/pokeapi/blob/master/openapi.yml).

### Corrección de alcance del manual

El handoff anterior de 112 páginas queda obsoleto. El archivo canónico más reciente declara de forma explícita **156 páginas**:

- 1–20: apertura personal.
- 21–40: introducción al mundo Pokémon y Nintendo DS.
- 41–62: módulo «Ser Entrenador Pokémon».
- 63–78: módulo «Pokémon Mundo Misterioso».
- 79–86: otras formas de jugar.
- 87–128: cinco juegos de la saga principal.
- 129–144: dos juegos de Mundo Misterioso.
- 145–152: cuatro minifichas de spin-offs.
- 153–156: recursos y cierre.

Los números de página se guardarán como metadatos de edición. No formarán parte de las URLs ni de la identidad del contenido, porque una futura remaquetación podría cambiarlos.

## 2. Resultado final esperado

La app estará terminada cuando:

- Buscar, Pokédex y ficha de Pokémon sean fiables y no puedan publicar datos incompletos como válidos.
- Favoritos, Comparar y todos los filtros del documento de estado estén implementados.
- Las debilidades, resistencias e inmunidades respeten la generación o el juego seleccionado.
- Exista un apartado principal **Manuales**, accesible sin construir el índice y utilizable sin conexión una vez cargado.
- Manuales enseñe primero conceptos generales, después los dos grandes recorridos —Entrenador y Mundo Misterioso— y finalmente los juegos.
- Estén representados los once juegos con el peso editorial de la versión canónica: cinco principales, dos PMD y cuatro minifichas.
- Los recursos `R-01…R-06` tengan rutas digitales estables y puedan enlazarse desde QR impresos.
- PokeAPI enriquezca los datos verificables, pero nunca sea necesaria para leer el contenido editorial.
- La app pase lint, TypeScript, tests unitarios, tests de interfaz, build y pruebas E2E móviles/escritorio.
- Exista una URL de producción con soporte de deep links.

## 3. Reglas inmutables de ejecución

1. **Orden estricto.** Las fases se ejecutan en el orden de este documento.
2. **Puerta de calidad.** Cada fase termina con sus tests, build y documentación actualizados.
3. **Contenido local primero.** La prosa, los consejos y la estructura del manual viven en el repositorio.
4. **PokeAPI solo enriquece.** Si falla la red, el manual sigue siendo legible y navegable.
5. **REST v2, no GraphQL en el MVP.** Se mantiene una sola capa de datos estable.
6. **Nunca cachear JSON bruto grande.** Toda respuesta se transforma inmediatamente en un DTO mínimo.
7. **Exactitud por juego.** `generation`, `version-group` y `version` no son intercambiables.
8. **Sin recorridos exhaustivos.** El manual enseña sistemas y primeros pasos; no se convierte en un walkthrough.
9. **Spoilers explícitos.** Todo enlace o bloque se etiqueta como `sin spoilers`, `mecánicas` o `guía`.
10. **Cambios de alcance documentados.** Si nueva evidencia obliga a variar el plan, se modifica primero este archivo y se explica la razón.

## 4. Diagnóstico de partida

### Implementado

- Shell responsive, tema claro/oscuro y vista grid/lista.
- Índice local Gen I–V en el camino feliz.
- Búsqueda por nombre español o número.
- Pokédex por lotes de 24.
- Ficha básica con sprite, tipos, estadísticas y nombres.
- Cliente PokeAPI con caché TTL.

### Pendiente funcional

- Favoritos reales.
- Comparación real.
- Filtros por generación, tipo y total.
- Tipos y matchups históricos.
- Manuales, recursos digitales, búsqueda editorial y deep links.
- Despliegue y soporte de rutas directas.

### Fallos que bloquean nuevas funcionalidades

- Las interfaces TypeScript mínimas no recortan el JSON en ejecución; se cachean respuestas completas de cientos de KB.
- Los errores de cuota de almacenamiento se silencian.
- El constructor puede saltarse especies fallidas y publicar un índice incompleto como `ready`.
- Cancelar el constructor puede mostrarse como una finalización correcta.
- No hay deduplicación de peticiones, timeout, retry limitado ni cola global.
- La búsqueda puede disparar hasta veinte cargas de sprite por pulsación y la Pokédex veinticuatro peticiones simultáneas.
- ESLint falla actualmente con seis errores.
- No hay infraestructura de tests.
- La carpeta no es un repositorio Git y no existe una configuración de despliegue.
- La barra móvil ya contiene cinco destinos; añadir un sexto haría la navegación demasiado densa.

## 5. Arquitectura de Manuales

### 5.1 Traducción del libro físico a la app

La app no creará 156 pantallas ni reproducirá cada doble página. Agrupará las lecciones en artículos consultables:

| Manual físico | Área digital | Tratamiento |
|---|---|---|
| 1–20 | Apertura personal | Se conserva en el libro; fuera del recorrido funcional de la app salvo una dedicatoria opcional. |
| 21–40 | Empieza aquí | Conceptos, consola, guardado, comunicación y mapa de contenidos. |
| 41–62 | Ser Entrenador | Exploración, Pokédex, combate, captura, evolución, equipo y Medallas. |
| 63–78 | Mundo Misterioso | Turnos, mazmorras, hambre, objetos, compañeros, misiones y fracaso. |
| 79–86 | Otras formas de jugar | Hub compacto para Ranger, Dash, Link! y Conquest. |
| 87–128 | Cinco juegos principales | Una ficha digital rica por juego, dividida en secciones internas. |
| 129–144 | Dos juegos PMD | Una ficha digital rica por juego. |
| 145–152 | Cuatro spin-offs | Minifichas de lectura breve. |
| 153–156 | Recursos y cierre | Centro de recursos, ayuda y enlaces estables. |

### 5.2 Rutas estables

- `/manuales` — portada y elección de recorrido.
- `/manuales/empezar/:tema` — conceptos generales.
- `/manuales/entrenador/:tema` — módulo de saga principal.
- `/manuales/mundo-misterioso/:tema` — módulo PMD.
- `/manuales/otros` — comparador de las otras formas de jugar.
- `/manuales/juegos/:juego` — ficha de cada título.
- `/manuales/recursos/:codigo` — `R-01…R-06`.
- `/r/:codigo` — redirect corto y permanente para los QR físicos.
- `/more` — hub móvil para Comparar y Ajustes; no forma parte del manual.

Las subsecciones de una ficha usan anclas estables como `#iniciales`, `#rival`, `#medallas`, `#primera-hora` o `#recursos`.

### 5.3 Decisión de navegación

La navegación principal móvil mantendrá cinco destinos:

1. Buscar.
2. Pokédex.
3. Manuales.
4. Favoritos.
5. Más.

`Más` reúne accesos a Comparar y Ajustes. Comparar conserva `/compare` y también se abre desde fichas, resultados, favoritos y artículos del manual. En escritorio pueden mostrarse Comparar y Ajustes directamente. Así Manuales pasa a ser una función principal sin perder ninguno de los destinos actuales ni saturar la barra inferior.

La detección de ruta activa debe funcionar por segmento, no solo por igualdad exacta, para que `/manuales/juegos/perla` mantenga activa la pestaña Manuales.

### 5.4 Organización digital del contenido

#### Empieza aquí

- Qué es un Pokémon y las dos formas de vivir la aventura.
- Crecimiento, tipos, movimientos, PS, PP, objetos y exploración.
- Guardado, recuperación ante errores y elección de recorrido.
- Controles, pantalla táctil, dos pantallas, menús y comunicación.

#### Ser Entrenador

- Primer compañero y primeros minutos.
- Región, rutas, ciudades y Pokédex.
- Combate, turnos, daño, estado y afinidad.
- Captura y Poké Balls.
- Experiencia, movimientos y evolución.
- Equipo, cajas, bolsa, Medallas y Liga.

#### Mundo Misterioso

- Protagonista, compañero y ciclo diario.
- Mazmorras, turnos, habitaciones, pasillos y minimapa.
- Hambre, PP, alcance y dirección.
- Objetos, tácticas, reclutamiento y crecimiento.
- Misiones, rango, comunidad, fracaso y preparación.

#### Juegos

- Saga principal: Perla, Platino, Oro HeartGold, Negro y Negro 2.
- Mundo Misterioso: Equipo de Rescate Azul y Exploradores de la Oscuridad.
- Minifichas: Ranger, Dash, Link! y Conquest.

### 5.5 Modelo de contenido

El repositorio conservará una copia versionada de la fuente editorial y generará registros tipados. Como mínimo:

- `ManualArticle`: id, slug, título, resumen, orden, familia, rango de páginas físicas y bloques.
- `ManualBlock`: párrafo, lista, pasos, ejemplo, consejo, nota, advertencia, tabla o widget.
- `GameDefinition`: slug, familia, generación, versión, grupo de versión, Pokédex regional y secciones.
- `ResourceDefinition`: código `R-xx`, título, ruta, nivel de spoiler y juegos relacionados.
- `SpoilerLevel`: `none`, `mechanics` o `guide`.
- `PrintReference`: edición estable —inicialmente `ds-156-v1`— y páginas físicas asociadas.

La importación de la fuente debe ser reproducible. Un generador extraerá páginas y encabezados del Markdown canónico; un manifiesto editorial agrupará esas páginas en artículos. Un test de integridad comprobará que todo el rango 21–156 está contabilizado y que ningún artículo enlaza una página inexistente.

## 6. Reparto entre contenido local y PokeAPI

### Siempre local

- Explicaciones para principiantes.
- Estructura de aprendizaje y primeros pasos.
- Iniciales como decisión editorial, rivales, Líderes, Medallas y ciudades.
- Historia sin spoilers, consejos, errores habituales y avisos.
- Sistemas de Mundo Misterioso, Ranger, Dash, Link! y Conquest.
- Traducciones o aclaraciones que PokeAPI no ofrece en español.
- Overrides documentados cuando PokeAPI no tenga el dato o no sea histórico.

### Dinámico mediante PokeAPI

- Nombres, sprites y tipos de Pokémon.
- Pokédex regional y numeración.
- Estadísticas y tipos históricos cuando estén disponibles.
- Tabla de tipos por generación.
- Cadenas de evolución filtradas al juego.
- Learnsets filtrados por `version-group`.
- Encuentros filtrados por `version`.
- Datos estructurados de movimientos, habilidades y objetos, cargados bajo demanda.

### Mapeo de los cinco juegos principales

| Juego | Generación | `version` | `version-group` | Pokédex |
|---|---:|---|---|---|
| Pokémon Perla | IV | `pearl` | `diamond-pearl` | `original-sinnoh` |
| Pokémon Platino | IV | `platinum` | `platinum` | `extended-sinnoh` |
| Oro HeartGold | IV | `heartgold` | `heartgold-soulsilver` | `updated-johto` |
| Pokémon Negro | V | `black` | `black-white` | `original-unova` |
| Pokémon Negro 2 | V | `black-2` | `black-2-white-2` | `updated-unova` |

PMD y los cuatro spin-offs no tienen un contexto de juego equivalente en PokeAPI. En ellos solo se reutilizarán datos seguros de especies —por ejemplo, nombres, tipos y sprites—; las mecánicas permanecerán locales.

## 7. Fases de ejecución

| Fase | Estado | Resultado principal |
|---:|---|---|
| 0 | Completada | Fuente canónica, tests base y calidad inicial bajo control. |
| 1 | Completada | Red, caché e índice fiables. |
| 2 | Completada | Manuales 21–86 publicados y accesibles offline. |
| 3 | Completada | Favoritos y Comparar completos. |
| 4 | En curso | Filtros sobre todo Gen I–V sin ráfagas de red. |
| 5 | Pendiente | Motor histórico y recursos `R-01/R-02`. |
| 6 | Pendiente | Cinco fichas de saga principal. |
| 7 | Pendiente | Dos fichas PMD, cuatro minifichas y `R-03…R-06`. |
| 8 | Pendiente | QR y vínculo bidireccional con el manual físico. |
| 9 | Pendiente | Accesibilidad, offline, E2E, despliegue y cierre. |

### Fase 0 — Congelar la fuente y crear la red de seguridad

**Objetivo:** poder trabajar sin perder contenido ni introducir regresiones invisibles.

#### Trabajo

- Crear control de versiones o, si no se autoriza, una copia de recuperación verificable.
- Incorporar al proyecto una copia exacta del Markdown canónico y registrar fecha/hash de origen.
- Marcar el handoff de 112 páginas como obsoleto en la documentación interna.
- Añadir scripts `typecheck` y `test`.
- Instalar/configurar Vitest y Testing Library; reservar E2E para la fase final.
- Corregir los seis errores actuales de ESLint.
- Añadir fixtures pequeños de PokeAPI para trabajar sin red en tests.
- Actualizar README con arranque, scripts y arquitectura real.

#### Criterio de salida

- `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` terminan correctamente.
- La fuente canónica está dentro del proyecto y su verificación declara 156 páginas.
- No se ha cambiado todavía el comportamiento funcional.

### Fase 1 — Hacer fiable la capa de datos

**Objetivo:** eliminar los fallos P0 antes de añadir endpoints o pantallas.

#### Trabajo

- Separar modelos de transporte de DTOs de aplicación.
- Proyectar cada respuesta antes de cachearla; nunca persistir el JSON completo de `/pokemon` o `/pokemon-species`.
- Versionar el caché nuevo y migrar/descartar las entradas antiguas de forma segura.
- Hacer que los fallos de cuota sean observables y recuperables.
- Añadir deduplicación de promesas en vuelo, concurrencia limitada, timeout y hasta dos reintentos para red/5xx.
- Distinguir `AbortError` de error de red.
- Corregir cancelación, reanudación y cleanup al salir de Ajustes.
- Registrar IDs fallidos; un índice solo es `ready` si índice, metadata y recuento esperado coinciden.
- Reducir las tormentas de peticiones de Buscar y Pokédex.
- Validar IDs de ruta de forma estricta y evitar resultados atrasados en la ficha.
- Desacoplar la ficha de Pokémon del Species Index: una ruta válida debe poder cargar especie y variedad por defecto directamente, para que los enlaces desde Manuales funcionen desde el primer arranque.

#### Criterio de salida

- Cancelar nunca muestra éxito.
- Un fallo parcial nunca publica un índice completo.
- Cuota, caché corrupta, aborto, retry y deduplicación están cubiertos por tests.
- Repetir una consulta concurrente produce una única llamada de red.
- La UI muestra estados claros de error y reintento.

### Fase 2 — Crear Manuales y publicar el recorrido general

**Objetivo:** entregar cuanto antes un manual digital útil, aunque la red no esté disponible.

#### Trabajo

- Implementar la nueva navegación móvil de cinco destinos y el hub `Más`; en escritorio, exponer directamente Comparar y Ajustes.
- Crear rutas anidadas, breadcrumbs, índice lateral/plegable, anterior/siguiente y 404.
- Crear el modelo tipado, generador y tests de integridad editorial.
- Implementar componentes de lección: pasos, consejo, nota, atención, ejemplo de tipo, tabla, cuadrícula de Pokémon y referencia física.
- Crear una tarjeta de referencia Pokémon independiente de `SpeciesIndexItem`, reutilizable dentro de los artículos.
- Publicar en la app el contenido agrupado de las páginas 21–86:
  - Empieza aquí.
  - Ser Entrenador.
  - Mundo Misterioso.
  - Otras formas de jugar.
- Añadir búsqueda interna por títulos, conceptos, juegos y códigos `R-xx`.
- Guardar localmente último artículo y progreso de lectura opcional.
- Cargar Manuales mediante code splitting y sin depender del Species Index.

#### Criterio de salida

- Todo el contenido 21–86 es navegable en móvil y escritorio.
- Funciona con el índice ausente y con PokeAPI bloqueada.
- Los enlaces a una ficha Pokémon no obligan a construir antes el índice.
- No hay enlaces rotos ni callejones sin salida.
- Los artículos muestran su correspondencia con páginas físicas sin usarla como URL.
- La pestaña Manuales permanece activa en todas sus rutas hijas.

### Fase 3 — Completar Favoritos y Comparar

**Objetivo:** cerrar los dos placeholders principales del documento de estado.

#### Favoritos

- Store versionado y validado por ID de especie.
- Toggle accesible en ficha y cards.
- Página con vacío, carga, error, quitar y enlace a detalle.
- Favoritos independientes del caché de respuestas brutas.

#### Comparar

- Selector reutilizable para 2–4 Pokémon.
- Estado compartible en URL, por ejemplo `?ids=25,150`.
- Tabla/gráfico accesible de stats, tipos y total.
- Entrada desde ficha, Pokédex, Favoritos y bloques del manual.
- Estado móvil legible sin scroll horizontal obligatorio.

#### Criterio de salida

- Favoritos sobreviven a recarga y datos inválidos se limpian sin romper la app.
- Una comparación puede abrirse desde URL y recuperarse tras recarga.
- Hay tests de almacenamiento, selección, límites, duplicados y estados vacíos.

### Fase 4 — Implementar filtros completos sin abusar de PokeAPI

**Objetivo:** resolver generación, tipo y total para las 649 especies, no solo para cards ya vistas.

#### Trabajo

- Implementar primero el filtro de generación con el índice actual.
- Crear un índice resumen versionado con `{ id, nombre, generación, tipos, stats, total, sprite }`.
- Generar ese snapshot de forma controlada durante desarrollo/build y distribuir solo el DTO normalizado; no hacer 649 llamadas `/pokemon` en cada navegador.
- Mantener una tarea explícita de actualización de datos, separada del arranque de la app.
- Implementar filtros por uno/dos tipos, rango de total, generación y orden.
- Mostrar contador, chips activos, limpiar todo y estado sin resultados.
- Sincronizar filtros útiles con query params para poder compartirlos.

#### Criterio de salida

- Los filtros consideran siempre el conjunto completo Gen I–V.
- Aplicar filtros no dispara cientos de peticiones.
- Los resultados son deterministas offline.
- Los filtros combinados y sus parámetros URL están cubiertos por tests.

### Fase 5 — Motor histórico de tipos y fichas enriquecidas

**Objetivo:** hacer correcta la información para Generación IV y V y reutilizarla en toda la app.

#### Trabajo

- Tipar `past_types`, `past_stats` y `past_damage_relations` con selectores separados.
- Crear una matriz pura de multiplicadores `0`, `¼`, `½`, `1`, `2`, `4`.
- Resolver el tipo del Pokémon y las relaciones defensivas para el juego elegido.
- Crear un `GameContext` compartido por Pokédex, detalle, Comparar y Manuales.
- Localizar al español tipos, stats, métodos y etiquetas técnicas.
- Añadir a la ficha: debilidades, resistencias, inmunidades y contexto de juego.
- Ampliar Comparar con contexto histórico.
- Implementar `R-01` como tabla de tipos generacional y `R-02` como referencia editorial de estados.

#### Criterio de salida

- Casos conocidos de doble tipo e inmunidad pasan fixtures Gen IV/V.
- Acero y cambios de tipos históricos se muestran según la generación correcta.
- Ninguna pantalla presenta relaciones modernas como si fueran históricas.
- `R-01` y `R-02` funcionan offline tras la primera carga.

### Fase 6 — Publicar las cinco fichas de la saga principal

**Objetivo:** transformar las páginas 87–128 en cinco guías digitales completas.

#### Orden de entrega

1. Perla.
2. Platino.
3. Oro HeartGold.
4. Negro.
5. Negro 2.

#### Estructura común

- Presentación sin spoilers.
- Iniciales.
- Rival o rivales.
- Medallas y aprendizaje de cada Gimnasio.
- Sistemas propios.
- Primera hora.
- Antes de continuar.
- Recursos y avisos de spoilers.

HeartGold añade bloques separados para las Medallas de Johto y Kanto.

#### Widgets PokeAPI bajo demanda

- Tarjetas de iniciales y especies.
- Pokédex regional.
- Evolución filtrada al juego.
- «Dónde aparece» por `version`.
- «Qué aprende» por `version-group`.
- Debilidades en su generación.

#### Criterio de salida

- Las cinco fichas contienen todo el alcance editorial 87–128.
- Cada widget conserva contexto de versión/grupo/generación y tiene fallback editorial.
- Rivales, Medallas y recorrido proceden del contenido local, no de inferencias de PokeAPI.
- Los avisos aparecen antes de enlaces con spoilers.

### Fase 7 — Publicar Mundo Misterioso y las cuatro minifichas

**Objetivo:** completar los once juegos respetando la jerarquía editorial.

#### Trabajo

- Equipo de Rescate Azul: protagonista, compañero, equipos, rangos, vida del equipo y primera misión.
- Exploradores de la Oscuridad: protagonista, compañero, Equipo Calavera, gremio, rangos y primera expedición.
- Cuadrículas de protagonistas/compañeros con datos de especie seguros.
- Minifichas compactas para Ranger, Dash, Link! y Conquest.
- Implementar `R-03…R-06` como contenido local reutilizable.
- Evitar presentar datos de la saga principal como si describieran las mecánicas de los spin-offs.

#### Criterio de salida

- Todo el alcance 129–152 está publicado.
- Los once juegos aparecen, pero la app conserva dos recorridos principales y un apéndice.
- Las listas de protagonistas y compañeros PMD tienen validaciones editoriales propias.
- Los recursos `R-03…R-06` son accesibles por código y desde sus juegos.

### Fase 8 — Unir la app con el manual físico

**Objetivo:** convertir la app en el complemento actualizable del libro.

#### Trabajo

- Definir la URL canónica de producción antes de crear códigos QR.
- Implementar redirects cortos `/r/r-01…r-06` y rutas cortas por juego si son necesarias.
- Generar QR maestro y QRs de recursos como SVG/PNG verificables.
- Añadir a cada artículo «En el manual físico: páginas X–Y».
- Añadir enlaces de vuelta: recurso → lección → juego → Pokémon.
- Guardar preferencia de spoilers y ocultar por defecto niveles superiores.
- Crear un centro de recursos actualizable sin reimprimir el libro.
- Probar todos los QR desde cámara/teléfono y desde una URL directa nueva.

#### Criterio de salida

- Cada QR resuelve a HTTPS y a una ruta estable.
- Ningún QR depende de localhost, IDs de Canva o números de página como identidad.
- Un cambio de paginación del libro solo exige actualizar metadatos visibles.
- El centro de recursos indica última revisión y nivel de spoilers.

### Fase 9 — Cierre de producción

**Objetivo:** entregar una app instalable, robusta y mantenible.

#### Trabajo

- Error boundary, 404, reintento y estados offline.
- `lang="es"`, título, iconos, metadata y favicon propios.
- Eliminar `/demo` del bundle de producción o aislarlo en desarrollo.
- Lazy routes y revisión de tamaño del bundle.
- Accesibilidad: teclado, lector de pantalla, contraste, targets táctiles y reduced motion.
- PWA/offline para el contenido editorial y snapshots esenciales.
- Configurar hosting con fallback SPA para deep links.
- E2E en 390×844 y 1280×900: navegación, índice, búsqueda, favorito, comparación, filtros, manuales, recursos y rutas QR.
- Actualizar `APP_STATE.md`, README y este plan con el estado final.

#### Criterio de salida

- Lint, TypeScript, unitarios, componentes, E2E y build están verdes.
- La app funciona desde una recarga directa en cualquier ruta pública.
- Manuales abre sin red; los widgets dinámicos degradan correctamente.
- No hay placeholders «próximamente» en el alcance acordado.
- La documentación describe exactamente lo que está desplegado.

## 8. Matriz mínima de pruebas

| Área | Casos obligatorios |
|---|---|
| Storage | corrupción, expiración, cuota, migración y datos inválidos. |
| Índice | éxito completo, fallo parcial, retry, cancelación y reanudación. |
| Red | deduplicación, timeout, abort, 4xx sin retry y 5xx con retry limitado. |
| Favoritos | añadir, quitar, persistir, duplicado y limpieza de dato inválido. |
| Comparar | 2–4 IDs, URL, duplicados, límite y móvil. |
| Filtros | generación, doble tipo, total, combinaciones, reset y URL. |
| Histórico | tipos pasados, Acero Gen V, doble tipo, inmunidad y multiplicadores. |
| Manuales | integridad 21–156, enlaces, orden, búsqueda, anterior/siguiente y offline. |
| Juegos | mapping exacto de `version`, `version-group` y Pokédex. |
| PokeAPI | learnset por grupo, encuentros por versión, evolución filtrada y fallback ES. |
| QR | ruta corta, redirect, deep link, HTTPS y 404 controlado. |
| Responsive | 390×844, tablet y 1280×900. |

Las pruebas unitarias usan fixtures locales. Un smoke test real de PokeAPI puede existir fuera del CI bloqueante, pero el CI nunca dependerá de la disponibilidad externa.

## 9. Riesgos y decisiones pendientes

- **Dominio/hosting:** no bloquea las fases 0–7, pero debe cerrarse antes de generar QRs.
- **Activos visuales:** PokeAPI aporta sprites; rivales, Medallas, Líderes y material PMD requieren activos locales y una revisión de uso antes de un despliegue público.
- **Cambios en el manual:** la fuente se sincroniza mediante snapshot + hash; los números se actualizan como metadatos.
- **Datos ausentes en PokeAPI:** se resuelven con overrides locales documentados, nunca con inferencias silenciosas.
- **Volumen de encuentros/learnsets:** se cargan bajo demanda o mediante snapshots; no se precargan en masa en el navegador.

## 10. Registro de ejecución y próxima acción

- **Fase 0 cerrada:** fuente de 156 páginas copiada y verificada, Git local, lint/tipos/tests/build y documentación base.
- **Fase 1 cerrada:** DTOs normalizados antes de caché, caché v2 y migración, cuota observable, cliente con deduplicación/concurrencia/timeout/retry/abort, índice íntegro y reanudable, rutas estrictas y ficha independiente del índice.
- **Verificación de cierre de Fase 1:** 43 pruebas automatizadas, lint, TypeScript y build correctos; smoke local real de PokeAPI y UI a 390×844 sin errores de consola.
- **Fase 2 cerrada:** navegación responsive y hub Más, rutas anidadas, migas, índice, anterior/siguiente y 404; modelo y generador determinista de las páginas 21–156; componentes editoriales; contenido 21–86, búsqueda local, progreso opcional y code splitting.
- **Verificación de cierre de Fase 2:** 74 pruebas automatizadas, `manual:check`, lint, TypeScript y build correctos; build local profundo a 390×844 sin errores, PokeAPI bloqueada sin impedir la lectura y paquete inicial reducido de 540 kB a 423 kB.
- **Fase 3 cerrada:** store validado de Favoritos, toggles accesibles, pantalla con vacío/carga/error/retry y Comparar con selector 2–4, URL compartible, carga directa, stats móviles y entradas desde las superficies previstas.
- **Verificación de cierre de Fase 3:** 91 pruebas automatizadas y `npm run check` correcto; Favoritos persiste tras recarga y Comparar funciona con datos reales a 390×844 sin desbordamiento ni errores de consola.
- **Restricción de entrega:** por instrucción del usuario no se hará ningún despliegue remoto. Los puntos de las fases 8–9 que exijan un dominio HTTPS o publicar hosting quedarán sin ejecutar salvo autorización posterior; el resto se implementará y verificará en local.

La próxima acción autorizada es exclusivamente el primer punto de la **Fase 4**: implementar el filtro de generación con el Species Index actual.
