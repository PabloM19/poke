import type { PokemonReference } from '../content/types'
import type { MainGameSlug } from '@/features/games/gameCatalog'

export interface GymGuide {
  badge: string
  leader: string
  type: string
  city: string
  lesson: string
}

export interface MainGameGuide {
  slug: MainGameSlug
  region: string
  eyebrow: string
  title: string
  summary: string
  lead: string
  pages: readonly [number, number]
  starters: readonly (PokemonReference & { type: string })[]
  starterTitle: string
  starterTip: string
  rival: {
    title: string
    description: string
    supporters: readonly { title: string; description: string }[]
  }
  gyms: readonly GymGuide[]
  systems: readonly { title: string; description: string }[]
  systemsTitle: string
  systemsNote: string
  firstHour: readonly string[]
  firstHourTip: string
  reminders: readonly string[]
  resources: readonly string[]
  spoilerWarning: string
}

export const pearlGuide: MainGameGuide = {
  slug: 'perla',
  region: 'Sinnoh',
  eyebrow: 'Generación IV · Sinnoh',
  title: 'Pokémon Edición Perla',
  summary: 'Un viaje clásico de descubrimiento, entrenamiento y mitología.',
  lead: 'La región de Sinnoh está llena de antiguas leyendas, grandes lagos y montañas que dividen el territorio. Tu viaje comienza en Pueblo Hojaverde y pronto te llevará a conocer al Profesor Serbal, completar la Pokédex y desafiar a los Gimnasios.',
  pages: [87, 94],
  starters: [
    { speciesId: 387, name: 'Turtwig', type: 'Planta', description: 'Resistente y paciente. Su evolución desarrolla una gran capacidad defensiva y termina incorporando el tipo Tierra.' },
    { speciesId: 390, name: 'Chimchar', type: 'Fuego', description: 'Rápido y ofensivo. Más adelante combina Fuego y Lucha, una pareja muy útil durante gran parte de Sinnoh.' },
    { speciesId: 393, name: 'Piplup', type: 'Agua', description: 'Equilibrado y fiable. Su evolución final añade el tipo Acero y obtiene numerosas resistencias.' },
  ],
  starterTitle: 'Tres compañeros para comenzar',
  starterTip: 'Elige por afinidad. Los tres pueden completar la aventura y tendrás oportunidades de cubrir los tipos restantes.',
  rival: {
    title: 'Tu amigo y rival',
    description: 'Es enérgico, impaciente y siempre parece ir un paso por delante. Su nombre se elige al comenzar la partida. Escogerá el inicial con ventaja de tipo frente al tuyo, por lo que sus combates enseñan a preparar respuestas y no depender de un solo Pokémon.',
    supporters: [
      { title: 'Profesor Serbal', description: 'Investiga la evolución Pokémon y te confía la Pokédex de Sinnoh.' },
      { title: 'Ayudante del profesor', description: 'Maya o León te orienta en los primeros pasos y muestra varias funciones del viaje.' },
    ],
  },
  gyms: [
    { badge: 'Medalla Lignito', leader: 'Roco', type: 'Roca', city: 'Ciudad Pirita', lesson: 'Primer examen de tipos, curación y preparación antes de un combate importante.' },
    { badge: 'Medalla Bosque', leader: 'Gardenia', type: 'Planta', city: 'Ciudad Vetusta', lesson: 'Enseña a aprovechar Fuego, Volador, Bicho o Hielo y a responder a movimientos de estado.' },
    { badge: 'Medalla Adoquín', leader: 'Brega', type: 'Lucha', city: 'Ciudad Rocavelo', lesson: 'Sus ataques físicos castigan equipos frágiles; Volador y Psíquico ofrecen ventaja.' },
    { badge: 'Medalla Ciénaga', leader: 'Mananti', type: 'Agua', city: 'Ciudad Pradera', lesson: 'Obliga a combinar Planta o Eléctrico con una respuesta para sus coberturas.' },
    { badge: 'Medalla Reliquia', leader: 'Fantina', type: 'Fantasma', city: 'Ciudad Corazón', lesson: 'Introduce inmunidades y exige utilizar Siniestro, Fantasma u opciones que sí puedan alcanzar al rival.' },
    { badge: 'Medalla Mina', leader: 'Acerón', type: 'Acero', city: 'Ciudad Canal', lesson: 'Acero resiste muchos ataques; Fuego, Lucha y Tierra son las respuestas más directas.' },
    { badge: 'Medalla Carámbano', leader: 'Inverna', type: 'Hielo', city: 'Ciudad Puntaneva', lesson: 'Premia un equipo capaz de golpear con Fuego, Lucha, Roca o Acero.' },
    { badge: 'Medalla Faro', leader: 'Lectro', type: 'Eléctrico', city: 'Ciudad Marina', lesson: 'Tierra es esencial, pero sus movimientos de cobertura impiden confiarse.' },
  ],
  systems: [
    { title: 'Poké-reloj', description: 'Aplicaciones útiles en la pantalla táctil.' },
    { title: 'Subsuelo', description: 'Excavación, tesoros y bases secretas.' },
    { title: 'Superconcursos', description: 'Pruebas de apariencia, danza y actuación.' },
    { title: 'Día y noche', description: 'Algunos encuentros cambian con la hora.' },
    { title: 'Palkia', description: 'Pokémon legendario estrechamente ligado a esta edición.' },
  ],
  systemsTitle: 'Una región para explorar con calma',
  systemsNote: 'Utiliza las Máquinas Ocultas para superar obstáculos y revisa el equipo antes de una cueva o ruta larga.',
  firstHour: [
    'Elige a Turtwig, Chimchar o Piplup.',
    'Visita al Profesor Serbal y recibe la Pokédex.',
    'Compra o recibe Poké Balls antes de buscar nuevos compañeros.',
    'Captura dos o tres tipos diferentes.',
    'Aprende a utilizar el Poké-reloj.',
    'Prepara el equipo para el primer Gimnasio.',
  ],
  firstHourTip: 'Chimchar facilita algunos enfrentamientos tempranos, pero cualquiera de los tres iniciales puede completar la aventura.',
  reminders: [
    'Habla con los habitantes: muchas funciones se obtienen mediante personajes secundarios.',
    'Revisa los movimientos necesarios para atravesar rutas y cuevas.',
    'Lleva Repelentes y Cuerdas Huida en exploraciones largas.',
    'Consulta R-01 cuando un Líder utilice un tipo que no conozcas.',
  ],
  resources: ['Pokédex de Sinnoh', 'Tabla de tipos', 'Mapa de rutas', 'Guía del Subsuelo'],
  spoilerWarning: 'Cualquier guía de la Columna Lanza puede revelar momentos centrales de la historia.',
}

export const platinumGuide: MainGameGuide = {
  slug: 'platino',
  region: 'Sinnoh',
  eyebrow: 'Generación IV · Sinnoh',
  title: 'Pokémon Edición Platino',
  summary: 'La versión más amplia y misteriosa del viaje por Sinnoh.',
  lead: 'Sinnoh vuelve con cambios en sus rutas, su clima y su historia. El Equipo Galaxia continúa buscando un poder capaz de transformar el mundo, mientras la presencia de Giratina conduce la aventura hacia un lugar donde las reglas habituales dejan de funcionar.',
  pages: [95, 102],
  starters: [
    { speciesId: 387, name: 'Turtwig', type: 'Planta', description: 'Una opción resistente que crece hacia funciones defensivas. Su evolución final combina Planta y Tierra.' },
    { speciesId: 390, name: 'Chimchar', type: 'Fuego', description: 'Veloz y ofensivo. Al evolucionar añade el tipo Lucha y ofrece una cobertura muy útil en Sinnoh.' },
    { speciesId: 393, name: 'Piplup', type: 'Agua', description: 'Equilibrado durante el comienzo. Su evolución final combina Agua y Acero, con numerosas resistencias.' },
  ],
  starterTitle: 'El compañero que recorrerá Sinnoh contigo',
  starterTip: 'No existe una elección «canónica». El mejor inicial es el que quieras conservar en tu equipo.',
  rival: {
    title: 'Tu vecino y rival',
    description: 'Impulsivo, competitivo y siempre con prisa. Escoge el inicial con ventaja frente al tuyo. Sus equipos cambian a medida que avanza la aventura y sirven para comprobar si el tuyo está realmente equilibrado.',
    supporters: [
      { title: 'Profesor Serbal', description: 'Te entrega la Pokédex y estudia la evolución Pokémon.' },
      { title: 'Handsome', description: 'Investiga las actividades del Equipo Galaxia y aparece en distintos puntos del viaje.' },
    ],
  },
  gyms: [
    { badge: 'Medalla Lignito', leader: 'Roco', type: 'Roca', city: 'Ciudad Pirita', lesson: 'Enseña a preparar una ventaja de tipo antes de entrar en un Gimnasio.' },
    { badge: 'Medalla Bosque', leader: 'Gardenia', type: 'Planta', city: 'Ciudad Vetusta', lesson: 'Premia Fuego, Volador, Bicho o Hielo y el control de los estados.' },
    { badge: 'Medalla Reliquia', leader: 'Fantina', type: 'Fantasma', city: 'Ciudad Corazón', lesson: 'En Platino es el tercer desafío y presenta inmunidades que pueden desconcertar a un principiante.' },
    { badge: 'Medalla Adoquín', leader: 'Brega', type: 'Lucha', city: 'Ciudad Rocavelo', lesson: 'Sus atacantes físicos exigen resistencia y una buena respuesta Volador o Psíquico.' },
    { badge: 'Medalla Ciénaga', leader: 'Mananti', type: 'Agua', city: 'Ciudad Pradera', lesson: 'Combina resistencia con movimientos variados; no dependas de una única respuesta.' },
    { badge: 'Medalla Mina', leader: 'Acerón', type: 'Acero', city: 'Ciudad Canal', lesson: 'Sus numerosas resistencias convierten Fuego, Lucha y Tierra en aliados esenciales.' },
    { badge: 'Medalla Carámbano', leader: 'Inverna', type: 'Hielo', city: 'Ciudad Puntaneva', lesson: 'Fuego, Lucha, Roca y Acero permiten romper su ofensiva helada.' },
    { badge: 'Medalla Faro', leader: 'Lectro', type: 'Eléctrico', city: 'Ciudad Marina', lesson: 'Tierra ofrece inmunidad, pero conviene vigilar los movimientos de cobertura.' },
  ],
  systems: [
    { title: 'Pokédex ampliada', description: 'Mayor variedad de especies y equipos posibles.' },
    { title: 'Mundo Distorsión', description: 'Giratina conduce la historia a un lugar con reglas propias.' },
    { title: 'Nuevas formas', description: 'Determinados Pokémon presentan formas distintas.' },
    { title: 'Sinnoh renovada', description: 'Cambios visuales y climatológicos en varias zonas.' },
    { title: 'Frente Batalla', description: 'Un gran desafío opcional posterior a la Liga.' },
  ],
  systemsTitle: 'Una historia alterada',
  systemsNote: 'Explora el Mundo Distorsión despacio. La perspectiva y el recorrido forman parte de la experiencia.',
  firstHour: [
    'Elige a Turtwig, Chimchar o Piplup.',
    'Recibe la Pokédex y aprende el recorrido entre pueblos.',
    'Captura compañeros con funciones distintas.',
    'Revisa los nuevos encuentros disponibles frente a Perla.',
    'Familiarízate con el Poké-reloj.',
    'Guarda antes de entrar en zonas largas o desconocidas.',
  ],
  firstHourTip: 'Permite que varios miembros combatan desde el principio; la variedad de Sinnoh recompensa un equipo flexible.',
  reminders: [
    'Lleva curación y movimientos variados antes de enfrentarte al Equipo Galaxia.',
    'No necesitas comprender el Frente Batalla para terminar la historia.',
    'Algunas formas y apariciones dependen del lugar o de condiciones concretas.',
    'Guarda antes de encuentros únicos.',
  ],
  resources: ['Pokédex ampliada', 'Mapa de Sinnoh', 'Guía de formas', 'Introducción al Frente Batalla'],
  spoilerWarning: 'Evita consultar el Mundo Distorsión antes de llegar si quieres conservar la sorpresa.',
}

export const publishedMainGameGuides: ReadonlyMap<MainGameSlug, MainGameGuide> = new Map([
  [pearlGuide.slug, pearlGuide],
  [platinumGuide.slug, platinumGuide],
])
