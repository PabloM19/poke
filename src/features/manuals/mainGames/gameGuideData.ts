import type { PokemonReference } from '../content/types'

export interface GymGuide {
  badge: string
  leader: string
  type: string
  city: string
  lesson: string
}

export interface MainGameGuide {
  slug: 'perla'
  eyebrow: string
  title: string
  summary: string
  lead: string
  pages: readonly [number, number]
  starters: readonly (PokemonReference & { type: string })[]
  rival: { title: string; description: string; professor: string; assistant: string }
  gyms: readonly GymGuide[]
  systems: readonly { title: string; description: string }[]
  firstHour: readonly string[]
  firstHourTip: string
  reminders: readonly string[]
  resources: readonly string[]
  spoilerWarning: string
}

export const pearlGuide: MainGameGuide = {
  slug: 'perla',
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
  rival: {
    title: 'Tu amigo y rival',
    description: 'Es enérgico, impaciente y siempre parece ir un paso por delante. Su nombre se elige al comenzar la partida. Escogerá el inicial con ventaja de tipo frente al tuyo, por lo que sus combates enseñan a preparar respuestas y no depender de un solo Pokémon.',
    professor: 'El Profesor Serbal investiga la evolución Pokémon y te confía la Pokédex de Sinnoh.',
    assistant: 'Maya o León, ayudante del profesor, te orienta en los primeros pasos y muestra varias funciones del viaje.',
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
