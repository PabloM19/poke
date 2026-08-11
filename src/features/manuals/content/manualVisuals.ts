import type { ManualBlock, ManualFigureAspectRatio, ManualFigureData, ManualFigureKind } from './types'

function figure(
  id: string,
  placeholderDescription: string,
  caption: string,
  options: {
    src?: string
    alt?: string
    aspectRatio?: ManualFigureAspectRatio
    kind?: ManualFigureKind
    objectFit?: 'contain' | 'cover'
    credit?: string
  } = {},
): ManualFigureData {
  return {
    id,
    placeholderDescription,
    caption,
    alt: options.alt ?? placeholderDescription,
    aspectRatio: options.aspectRatio ?? '16:9',
    kind: options.kind ?? 'screenshot',
    objectFit: options.objectFit,
    src: options.src,
    credit: options.credit,
  }
}

function asBlock(data: ManualFigureData): Extract<ManualBlock, { type: 'figure' }> {
  return { type: 'figure', ...data }
}

function carousel(
  id: string,
  label: string,
  figures: readonly ManualFigureData[],
): Extract<ManualBlock, { type: 'carousel' }> {
  return { type: 'carousel', id, label, figures }
}

export const manualVisualCatalog = {
  worldPaths: figure('world-two-paths', 'Ruta ilustrada que se divide entre Entrenador y Pokémon explorador', 'Las aventuras comparten el vínculo con los Pokémon, aunque el punto de vista y las reglas cambien.'),
  trainerAndExplorer: figure('trainer-explorer-comparison', 'Comparación de una ruta de Entrenador y una expedición de Mundo Misterioso', 'Un Entrenador guía a su equipo por una región; en Mundo Misterioso, tú ocupas el lugar del Pokémon.'),
  growthCycle: figure('pokemon-growth-cycle', 'Secuencia visual: combatir, ganar experiencia, subir de nivel y evolucionar', 'La experiencia conecta los combates con nuevos movimientos, mejores características y posibles evoluciones.', { kind: 'diagram' }),
  typeTriangle: figure('starter-type-triangle', 'Diagrama Agua → Fuego → Planta → Agua con ejemplos visuales', 'Los tipos forman relaciones fáciles de recordar cuando se muestran como una cadena de ventajas.', { kind: 'diagram' }),
  bagPreparation: figure('bag-preparation', 'Bolsa de principiante con curación, Poké Balls y objeto de salida', 'Una preparación sencilla evita tener que abandonar una ruta antes de tiempo.'),
  environmentalClues: figure('environmental-clues', 'Ruta con cartel, personaje, entrada de cueva y objeto visible', 'Los carteles, personajes y cambios del escenario indican qué lugares se pueden explorar.'),
  routeChoice: figure('learning-routes', 'Mapa de aprendizaje con caminos: Entrenador, Mundo Misterioso y otros juegos', 'Elegir un recorrido permite aprender solo las reglas necesarias para la aventura que quieres comenzar.', { kind: 'diagram' }),
  dsControls: figure('ds-controls', 'Nintendo DS abierta con cruceta, botones, pantallas y lápiz señalados', 'La cruceta y los botones controlan muchas acciones; la pantalla táctil añade gestos según cada juego.', { aspectRatio: '4:3', kind: 'diagram' }),
  dsTopScreen: figure('ds-top-screen', 'Pantalla superior de Nintendo DS mostrando la escena principal', 'La pantalla superior suele reservarse para la acción, el combate o la información principal.', { aspectRatio: '4:3' }),
  dsTouchScreen: figure('ds-touch-screen', 'Pantalla inferior de Nintendo DS mostrando mapa y controles táctiles', 'La pantalla inferior suele reunir mapas, menús y acciones que se realizan con el lápiz.', { aspectRatio: '4:3' }),
  resourceMap: figure('manual-resource-map', 'Mapa visual que conecta capítulos del manual con R-01 a R-06', 'Los recursos reúnen consultas que conviene abrir durante la partida sin abandonar el capítulo principal.', { kind: 'diagram' }),
  starterChoice: figure('first-starter-choice', 'Tres Pokémon iniciales frente al jugador en una mesa de laboratorio', 'La elección inicial cambia los primeros combates, pero cualquiera de los tres compañeros permite completar la aventura.'),
  regionMap: figure('region-map-basics', 'Mapa de región con ciudad, ruta, cueva y conexión marítima señaladas', 'Leer las conexiones entre rutas y ciudades ayuda a anticipar el siguiente destino.', { kind: 'diagram' }),
  pokedexScreen: figure('pokedex-screen', 'Pantalla de Pokédex con una especie vista, otra capturada y su zona de aparición', 'La Pokédex diferencia lo que has visto de lo que ya has capturado y documentado.'),
  typeAdvantage: figure('battle-type-advantage', 'Comparación visual entre ataque neutral, supereficaz y poco eficaz', 'Los mensajes de eficacia enseñan progresivamente qué tipos funcionan mejor contra cada rival.', { kind: 'diagram' }),
  experienceScreen: figure('experience-screen', 'Pantalla posterior al combate mostrando experiencia y subida de nivel', 'La barra de experiencia permite anticipar cuándo llegará el siguiente nivel.'),
  evolutionSequence: figure('evolution-sequence', 'Secuencia visual de un Pokémon antes, durante y después de evolucionar', 'La evolución cambia el aspecto y normalmente mejora las características, pero no siempre ocurre solo por nivel.'),
  balancedTeam: figure('balanced-team', 'Equipo de seis Pokémon con funciones ofensiva, defensiva y de apoyo', 'Un equipo variado dispone de respuestas diferentes sin exigir una composición perfecta.', { kind: 'diagram' }),
  bagAndBoxes: figure('bag-boxes', 'Comparación visual entre equipo activo, Cajas y bolsillos de la Bolsa', 'Equipo, Cajas y Bolsa resuelven necesidades distintas y conviene reconocer sus pantallas.'),
  hungerMeter: figure('pmd-hunger-meter', 'Medidor de Tripa descendiendo durante una expedición y Manzana recuperándolo', 'La Tripa baja al desplazarse; llevar alimento evita perder PS durante una exploración larga.', { kind: 'diagram' }),
  moveReach: figure('pmd-move-reach', 'Cuadrícula que compara ataque frontal, a distancia y alrededor del usuario', 'La posición y la dirección determinan qué objetivos alcanza cada movimiento.', { kind: 'diagram' }),
  survivalBag: figure('pmd-survival-bag', 'Bolsa PMD con Manzana, Baya Aranja, Elixir Máx., Semilla Revivir y Orbe', 'Alimento, curación, PP y una salida de emergencia cubren los problemas más habituales.'),
  partnerTactics: figure('pmd-partner-tactics', 'Pantalla de tácticas con compañero siguiendo, esperando o evitando enemigos', 'Las tácticas cambian el comportamiento del equipo sin controlar directamente cada paso.'),
  missionBoard: figure('pmd-mission-board', 'Tablón con encargos agrupados por mazmorra y dificultad', 'Agrupar misiones del mismo territorio ahorra viajes y facilita preparar la Bolsa.'),
  pearlOverworld: figure('pearl-overworld', 'Captura de Pokémon Perla con el personaje recorriendo una ruta de Sinnoh', 'Las rutas conectan pueblos y ciudades; hablar con los personajes ayuda a confirmar el siguiente destino.', {
    src: '/manuals/visuals/pearl-overworld.jpg',
    alt: 'Captura real de Pokémon Perla con el personaje caminando junto a una casa y una zona de hierba',
    credit: 'Manual oficial de Pokémon Pearl Version · Nintendo',
    aspectRatio: '4:3',
  }),
  pearlMenu: figure('pearl-menu', 'Captura de Pokémon Perla con el menú principal abierto', 'El menú reúne la Pokédex, el equipo, la Bolsa, la ficha de Entrenador y el guardado.', {
    src: '/manuals/visuals/pearl-menu.jpg',
    alt: 'Captura real de Pokémon Perla con el menú principal superpuesto sobre una ciudad de Sinnoh',
    credit: 'Manual oficial de Pokémon Pearl Version · Nintendo',
    aspectRatio: '4:3',
  }),
  platinumDistortion: figure('platinum-distortion-world', 'Captura de Pokémon Platino dentro del Mundo Distorsión', 'El Mundo Distorsión altera la orientación y las reglas visuales del escenario; conviene observar cada plataforma antes de avanzar.', {
    src: '/manuals/visuals/platinum-distortion-world.jpg',
    alt: 'Captura oficial de Pokémon Platino con el personaje sobre una plataforma vertical del Mundo Distorsión',
    credit: 'Galería oficial de Pokémon Platinum Version · Nintendo',
    aspectRatio: '4:3',
  }),
  platinumGiratina: figure('platinum-giratina-cutscene', 'Captura de Pokémon Platino durante la aparición de Giratina', 'Giratina y el Mundo Distorsión son elementos propios de Platino y distinguen esta guía de Perla y Diamante.', {
    src: '/manuals/visuals/platinum-giratina-cutscene.jpg',
    alt: 'Captura oficial de Pokémon Platino mostrando la silueta de Giratina ante el protagonista',
    credit: 'Galería oficial de Pokémon Platinum Version · Nintendo',
    aspectRatio: '4:3',
  }),
  heartgoldMenu: figure('heartgold-touch-menu', 'Captura doble de Pokémon Oro HeartGold con el menú táctil', 'La pantalla inferior permite abrir Pokédex, equipo, Bolsa y guardado con controles táctiles.', {
    src: '/manuals/visuals/heartgold-menu.jpg',
    alt: 'Captura oficial vertical de Pokémon Oro HeartGold con una escena interior arriba y el menú táctil abajo',
    credit: 'Galería oficial de Pokémon HeartGold Version · Nintendo',
    aspectRatio: 'portrait',
  }),
  heartgoldPokedex: figure('heartgold-pokedex-map', 'Captura doble de Pokémon Oro HeartGold con el mapa de la Pokédex', 'La Pokédex muestra el área donde se encuentra una especie y permite recorrer el mapa de Johto.', {
    src: '/manuals/visuals/heartgold-pokedex-map.jpg',
    alt: 'Captura oficial vertical de Pokémon Oro HeartGold con Cyndaquil arriba y el mapa de Johto en la Pokédex abajo',
    credit: 'Galería oficial de Pokémon HeartGold Version · Nintendo',
    aspectRatio: 'portrait',
  }),
  blackFirstBattle: figure('black-first-battle', 'Captura de Pokémon Negro durante uno de los primeros combates', 'El combate mantiene visibles los PS, el nivel y los Pokémon activos antes de elegir la siguiente acción.', {
    src: '/manuals/visuals/black-first-battle.jpg',
    alt: 'Captura real de Pokémon Negro con Tepig frente a Purrloin en un combate inicial',
    credit: 'Manual oficial de Pokémon Black Version · Nintendo',
    aspectRatio: '4:3',
  }),
  blackBattle: figure('black-battle-screen', 'Captura de la pantalla de combate de Pokémon Negro', 'El menú de combate separa con claridad luchar, Bolsa, Pokémon y huir.', {
    src: '/manuals/visuals/black-battle.jpg',
    alt: 'Captura real de Pokémon Negro mostrando un combate y sus cuatro acciones principales',
    credit: 'Manual oficial de Pokémon Black Version · Nintendo',
    aspectRatio: '4:3',
  }),
  blackCapture: figure('black-capture-screen', 'Captura de Pokémon Negro durante un lanzamiento de Poké Ball', 'Debilitar al Pokémon salvaje antes de lanzar una Poké Ball mejora las opciones de captura.', {
    src: '/manuals/visuals/black-capture.jpg',
    alt: 'Captura real de Pokémon Negro con una Poké Ball envolviendo a un Pokémon salvaje',
    credit: 'Manual oficial de Pokémon Black Version · Nintendo',
    aspectRatio: '4:3',
  }),
  black2Battle: figure('black2-battle-menu', 'Captura de Pokémon Negro 2 con el menú de combate', 'Negro 2 conserva las cuatro decisiones fundamentales del combate: luchar, Bolsa, equipo y huir.', {
    src: '/manuals/visuals/black2-battle-menu.png',
    alt: 'Captura real de Pokémon Negro 2 mostrando el menú de combate en la pantalla inferior',
    credit: 'Manual oficial de Pokémon Black Version 2 · Nintendo',
    aspectRatio: '4:3',
  }),
  black2Menu: figure('black2-main-menu', 'Captura de Pokémon Negro 2 con el menú principal', 'El menú principal agrupa Pokédex, equipo, Bolsa, ficha de Entrenador, guardado y opciones.', {
    src: '/manuals/visuals/black2-main-menu.png',
    alt: 'Captura real de Pokémon Negro 2 con las seis opciones del menú principal',
    credit: 'Manual oficial de Pokémon Black Version 2 · Nintendo',
    aspectRatio: '4:3',
  }),
  pmdBlueBase: figure('pmd-blue-team-base', 'Captura de Equipo de Rescate Azul en la base del equipo', 'La base es el punto seguro para revisar misiones, equipo y objetos antes de salir.', {
    src: '/manuals/visuals/pmd-blue-team-base.jpg',
    alt: 'Captura real de Equipo de Rescate Azul con Squirtle y su compañero frente a la base',
    credit: 'Manual oficial de Pokémon Mystery Dungeon: Blue Rescue Team · Nintendo',
    aspectRatio: '4:3',
  }),
  pmdBlueDungeon: figure('pmd-blue-dungeon', 'Captura de Equipo de Rescate Azul dentro de una mazmorra', 'Dentro de la mazmorra, el menú muestra equipo, objetos y misiones mientras el escenario queda visible.', {
    src: '/manuals/visuals/pmd-blue-dungeon.jpg',
    alt: 'Captura real de Equipo de Rescate Azul con Pikachu y Squirtle dentro de Arboleda Chica',
    credit: 'Manual oficial de Pokémon Mystery Dungeon: Blue Rescue Team · Nintendo',
    aspectRatio: '4:3',
  }),
  pmdBlueMap: figure('pmd-blue-dungeon-map', 'Captura del mapa de una mazmorra en Equipo de Rescate Azul', 'El mapa revela habitaciones, pasillos y zonas todavía sin explorar.', {
    src: '/manuals/visuals/pmd-blue-map.jpg',
    alt: 'Captura real de Equipo de Rescate Azul mostrando el plano azul de una mazmorra',
    credit: 'Manual oficial de Pokémon Mystery Dungeon: Blue Rescue Team · Nintendo',
    aspectRatio: '4:3',
  }),
  pmdDarknessTown: figure('pmd-darkness-guild', 'El Pokégremio de Exploradores de la Oscuridad', 'El Pokégremio organiza el trabajo diario del equipo y sirve como punto de partida para las expediciones.', {
    src: '/manuals/visuals/pmd-darkness-guild.jpg',
    alt: 'Captura real de Exploradores de la Oscuridad con el exterior del Pokégremio al atardecer',
    credit: 'Captura real de Exploradores de la Oscuridad · Pokémon Dungeon',
    aspectRatio: 'portrait',
  }),
  pmdDarknessDungeon: figure('pmd-darkness-cave', 'Exploración de una cueva en Exploradores de la Oscuridad', 'La pantalla superior sitúa la expedición en el mapa; la inferior muestra el terreno que el equipo debe recorrer.', {
    src: '/manuals/visuals/pmd-darkness-cave.jpg',
    alt: 'Captura real de Exploradores de la Oscuridad con el mapa del mundo arriba y una cueva abajo',
    credit: 'Captura real de Exploradores de la Oscuridad · Pokémon Dungeon',
    aspectRatio: 'portrait',
  }),
  pmdDarknessMap: figure('pmd-darkness-region', 'Mapa real del mundo de Exploradores de la Oscuridad', 'El mapa de la pantalla superior permite entender cómo se conectan la base del equipo y los destinos de las expediciones.', {
    src: '/manuals/visuals/pmd-darkness-region.jpg',
    alt: 'Captura real de Exploradores de la Oscuridad con el mapa de la región en la pantalla superior',
    credit: 'Captura real de Exploradores de la Oscuridad · Pokémon Dungeon',
    aspectRatio: 'portrait',
  }),
  rangerCapture: figure('ranger-capture-bellsprout', 'Pokémon Ranger — Pokémon rodeado por un trazo continuo del Capturador', 'El Capturador registra círculos continuos; conviene detener el trazo antes de que un ataque lo alcance.', {
    src: '/manuals/visuals/ranger-capture-bellsprout.png',
    alt: 'Captura oficial de Pokémon Ranger con el Capturador dibujando un círculo alrededor de Bellsprout',
    credit: 'Galería oficial de Pokémon Ranger · Nintendo',
  }),
  rangerCaptureSecond: figure('ranger-capture-combusken', 'Pokémon Ranger — segundo ejemplo de captura continua', 'El trazo puede rodear al Pokémon sin tocarlo; la prioridad es mantener una trayectoria limpia.', {
    src: '/manuals/visuals/ranger-capture-combusken.png',
    alt: 'Captura oficial de Pokémon Ranger con un trazo circular alrededor de Combusken',
    credit: 'Galería oficial de Pokémon Ranger · Nintendo',
  }),
  dashRace: figure('dash-race', 'Pokémon Dash — Pikachu en carrera con ruta y puntos de control', 'En Pokémon Dash, el recorrido se controla con deslizamientos cortos mientras se siguen los puntos de control.', {
    src: '/manuals/visuals/dash-race.jpg',
    alt: 'Captura real vertical de Pokémon Dash con Pikachu corriendo hacia un punto de control',
    credit: 'Captura de juego · Nintendo Life',
    aspectRatio: 'portrait',
  }),
  dashTouchControl: figure('dash-touch-control', 'Pokémon Dash — indicación real del gesto táctil', 'Los trazos cortos y repetidos sobre la pantalla táctil impulsan a Pikachu en la dirección elegida.', {
    src: '/manuals/visuals/dash-touch-control.jpg',
    alt: 'Captura oficial de Pokémon Dash con un lápiz de Nintendo DS y una flecha que indica el gesto de deslizamiento',
    credit: 'Sitio oficial japonés de Pokémon Dash · Nintendo',
    aspectRatio: '4:3',
  }),
  dashAir: figure('dash-air', 'Pokémon Dash — tramo aéreo de una carrera', 'Algunas superficies y globos cambian el movimiento; la ruta sigue siendo más importante que deslizar sin dirección.', {
    src: '/manuals/visuals/dash-air.jpg',
    alt: 'Captura real vertical de Pokémon Dash con Pikachu avanzando por el aire mediante globos',
    credit: 'Captura de juego · Nintendo Life',
    aspectRatio: 'portrait',
  }),
  linkChain: figure('link-chain-chance', 'Pokémon Link! — tablero durante Link Chance', 'Tras enlazar cuatro fichas iguales se activa Link Chance y se abren cadenas de tres y de dos.', {
    src: '/manuals/visuals/link-chance.jpg',
    alt: 'Captura real vertical de Pokémon Link con el tablero lleno de fichas y el mensaje Trozei Chance',
    credit: 'Captura de juego · Nintendo Life',
    aspectRatio: 'portrait',
  }),
  linkBoard: figure('link-chain-board', 'Pokémon Link! — tablero después de mover fichas', 'Cada enlace altera la posición de las fichas restantes; mirar todo el tablero ayuda a preparar la siguiente cadena.', {
    src: '/manuals/visuals/link-board.jpg',
    alt: 'Captura real vertical de Pokémon Link mostrando fichas Pokémon distribuidas por la pantalla táctil',
    credit: 'Captura de juego · Nintendo Life',
    aspectRatio: 'portrait',
  }),
  conquestGrid: figure('conquest-lava-battlefield', 'Pokémon Conquest — combate sobre un terreno de lava', 'El terreno, el alcance y el objetivo del mapa importan tanto como el daño de cada ataque.', {
    src: '/manuals/visuals/conquest-lava-battlefield.jpg',
    alt: 'Captura oficial de Pokémon Conquest con cuatro Pokémon combatiendo en un campo dividido por lava',
    credit: 'Galería oficial de Pokémon Conquest · Nintendo',
    aspectRatio: '4:3',
  }),
  conquestTraining: figure('conquest-training-ground', 'Pokémon Conquest — posicionamiento en un campo de entrenamiento', 'Los desniveles y los obstáculos limitan el movimiento y cambian qué unidades pueden atacar.', {
    src: '/manuals/visuals/conquest-training-ground.jpg',
    alt: 'Captura oficial de Pokémon Conquest con tres unidades en un campo de entrenamiento con agua y desniveles',
    credit: 'Galería oficial de Pokémon Conquest · Nintendo',
    aspectRatio: '4:3',
  }),
  spinOffControls: figure('spin-off-controls', 'Comparación de controles: trazo circular, deslizamiento, movimiento de fichas y cuadrícula táctica', 'Cada spin-off cambia la interacción principal; reconocer el gesto básico evita aplicar reglas de la saga principal.', { kind: 'diagram' }),
  manualQuestions: figure('five-help-questions', 'Diagrama de cinco preguntas para decidir qué hacer cuando el jugador se atasca', 'Revisar diálogo, equipo, tipos, objetos y último punto seguro suele revelar el siguiente paso.', { kind: 'diagram' }),
} as const

const pageVisuals: Partial<Record<number, readonly ManualBlock[]>> = {
  21: [asBlock(manualVisualCatalog.worldPaths)],
  23: [asBlock(manualVisualCatalog.trainerAndExplorer)],
  24: [asBlock(manualVisualCatalog.growthCycle)],
  25: [asBlock(manualVisualCatalog.typeTriangle)],
  28: [asBlock(manualVisualCatalog.bagPreparation)],
  29: [asBlock(manualVisualCatalog.environmentalClues)],
  32: [asBlock(manualVisualCatalog.routeChoice)],
  34: [asBlock(manualVisualCatalog.dsControls)],
  36: [carousel('ds-two-screens', 'Qué aporta cada pantalla', [manualVisualCatalog.dsTopScreen, manualVisualCatalog.dsTouchScreen])],
  39: [asBlock(manualVisualCatalog.resourceMap)],
  41: [carousel('trainer-games-tour', 'El viaje de Entrenador en distintos juegos', [manualVisualCatalog.pearlOverworld, manualVisualCatalog.heartgoldMenu, manualVisualCatalog.blackFirstBattle])],
  43: [asBlock(manualVisualCatalog.starterChoice)],
  45: [asBlock(manualVisualCatalog.regionMap)],
  47: [asBlock(manualVisualCatalog.pokedexScreen)],
  49: [carousel('battle-screen-tour', 'Aprende a leer un combate', [manualVisualCatalog.blackBattle, manualVisualCatalog.black2Battle])],
  53: [asBlock(manualVisualCatalog.typeAdvantage)],
  55: [asBlock(manualVisualCatalog.blackCapture)],
  57: [asBlock(manualVisualCatalog.experienceScreen)],
  59: [asBlock(manualVisualCatalog.evolutionSequence)],
  60: [asBlock(manualVisualCatalog.balancedTeam)],
  61: [asBlock(manualVisualCatalog.bagAndBoxes)],
  63: [asBlock(manualVisualCatalog.pmdBlueBase)],
  65: [asBlock(manualVisualCatalog.pmdDarknessTown)],
  66: [asBlock(manualVisualCatalog.pmdBlueMap)],
  67: [asBlock(manualVisualCatalog.pmdBlueDungeon)],
  69: [carousel('pmd-screen-tour', 'Lee la pantalla de la mazmorra', [manualVisualCatalog.pmdBlueDungeon, manualVisualCatalog.pmdDarknessDungeon])],
  70: [asBlock(manualVisualCatalog.hungerMeter)],
  72: [asBlock(manualVisualCatalog.moveReach)],
  73: [asBlock(manualVisualCatalog.survivalBag)],
  75: [asBlock(manualVisualCatalog.partnerTactics)],
  77: [asBlock(manualVisualCatalog.missionBoard)],
  81: [carousel('ranger-capture-tour', 'Así funciona el Capturador', [manualVisualCatalog.rangerCapture, manualVisualCatalog.rangerCaptureSecond])],
  82: [carousel('dash-race-tour', 'Aprende a dirigir a Pikachu', [manualVisualCatalog.dashTouchControl, manualVisualCatalog.dashRace, manualVisualCatalog.dashAir])],
  83: [carousel('link-chain-tour', 'Del primer enlace a la cadena', [manualVisualCatalog.linkChain, manualVisualCatalog.linkBoard])],
  84: [carousel('conquest-tactics-tour', 'Lee un campo de batalla táctico', [manualVisualCatalog.conquestGrid, manualVisualCatalog.conquestTraining])],
  85: [asBlock(manualVisualCatalog.spinOffControls)],
  155: [asBlock(manualVisualCatalog.manualQuestions)],
}

export function insertManualVisuals(page: number, blocks: readonly ManualBlock[]): readonly ManualBlock[] {
  const visuals = pageVisuals[page]
  if (!visuals?.length) return blocks
  const firstParagraph = blocks.findIndex((block) => block.type === 'paragraph')
  const insertionIndex = firstParagraph >= 0 ? firstParagraph + 1 : Math.min(1, blocks.length)
  return [...blocks.slice(0, insertionIndex), ...visuals, ...blocks.slice(insertionIndex)]
}

export const manualVisualStats = {
  pagePlacements: Object.values(pageVisuals).reduce((total, blocks) => total + (blocks?.length ?? 0), 0),
  realAssets: Object.values(manualVisualCatalog).filter((visual) => 'src' in visual && Boolean(visual.src)).length,
} as const
