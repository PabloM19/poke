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
  gymGroups?: readonly { title: string; start: number; end: number }[]
  gymNote?: string
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

export const heartGoldGuide: MainGameGuide = {
  slug: 'oro-heartgold',
  region: 'Johto',
  eyebrow: 'Generación IV · Johto',
  title: 'Pokémon Edición Oro HeartGold',
  summary: 'Dos regiones y un compañero que camina a tu lado.',
  lead: 'Tu aventura comienza en Pueblo Primavera, en la región de Johto. Recibirás un Pokémon del Profesor Elm, investigarás un hallazgo inesperado y emprenderás un viaje por Gimnasios, bosques, torres y ciudades unidas por antiguas tradiciones.',
  pages: [103, 112],
  starters: [
    { speciesId: 152, name: 'Chikorita', type: 'Planta', description: 'Resistente y orientada al apoyo. Sus primeros Gimnasios pueden ser exigentes, pero aprende herramientas defensivas muy valiosas.' },
    { speciesId: 155, name: 'Cyndaquil', type: 'Fuego', description: 'Rápido y ofensivo. Resulta sencillo de comprender y obtiene buenas ventajas durante la primera parte de Johto.' },
    { speciesId: 158, name: 'Totodile', type: 'Agua', description: 'Fuerte físicamente y muy fiable. Aprende ataques variados y encaja con facilidad en equipos diferentes.' },
  ],
  starterTitle: 'Tu compañero de Johto',
  starterTip: 'En HeartGold tu primer Pokémon caminará detrás de ti. Habla con él para ver cómo reacciona a cada lugar.',
  rival: {
    title: 'El misterioso chico pelirrojo',
    description: 'Observa desde fuera el laboratorio del Profesor Elm y pronto se cruza en tu camino. Su nombre se elige durante la partida; habitualmente se le conoce como Silver. Se apropia del Pokémon inicial con ventaja frente al tuyo. Al principio considera a los Pokémon simples herramientas, pero su relación con el equipo evoluciona a lo largo de la historia.',
    supporters: [
      { title: 'Profesor Elm', description: 'Investiga la crianza y los Huevos Pokémon y te entrega tu primer compañero.' },
    ],
  },
  gyms: [
    { badge: 'Medalla Céfiro', leader: 'Pegaso', type: 'Volador', city: 'Ciudad Malva', lesson: 'Enseña a responder a Pokémon veloces y ataques desde el aire.' },
    { badge: 'Medalla Colmena', leader: 'Antón', type: 'Bicho', city: 'Pueblo Azalea', lesson: 'Fuego, Volador y Roca ayudan a detener un equipo rápido y ofensivo.' },
    { badge: 'Medalla Planicie', leader: 'Blanca', type: 'Normal', city: 'Ciudad Trigal', lesson: 'Su aparente sencillez es engañosa: exige resistencia, estados y una respuesta al tipo Normal.' },
    { badge: 'Medalla Niebla', leader: 'Morti', type: 'Fantasma', city: 'Ciudad Iris', lesson: 'Introduce inmunidades y movimientos que alteran el estado o dificultan el cambio.' },
    { badge: 'Medalla Tormenta', leader: 'Aníbal', type: 'Lucha', city: 'Ciudad Orquídea', lesson: 'Volador y Psíquico ofrecen ventaja frente a sus potentes ataques físicos.' },
    { badge: 'Medalla Mineral', leader: 'Yasmina', type: 'Acero', city: 'Ciudad Olivo', lesson: 'Fuego, Lucha y Tierra son claves contra las numerosas resistencias del Acero.' },
    { badge: 'Medalla Glaciar', leader: 'Fredo', type: 'Hielo', city: 'Pueblo Caoba', lesson: 'Premia el uso de Fuego, Lucha, Roca y Acero, además de una buena preparación contra estados.' },
    { badge: 'Medalla Dragón', leader: 'Débora', type: 'Dragón', city: 'Ciudad Endrino', lesson: 'Es la prueba final de Johto y exige un equipo equilibrado, resistente y bien entrenado.' },
    { badge: 'Medalla Roca', leader: 'Brock', type: 'Roca', city: 'Ciudad Plateada', lesson: 'Agua, Planta, Lucha, Tierra y Acero permiten superar sus defensas.' },
    { badge: 'Medalla Cascada', leader: 'Misty', type: 'Agua', city: 'Ciudad Celeste', lesson: 'Planta y Eléctrico son buenas respuestas, pero conviene prever coberturas.' },
    { badge: 'Medalla Trueno', leader: 'Teniente Surge', type: 'Eléctrico', city: 'Ciudad Carmín', lesson: 'Tierra ayuda tanto por su ventaja como por su inmunidad.' },
    { badge: 'Medalla Arcoíris', leader: 'Erika', type: 'Planta', city: 'Ciudad Azulona', lesson: 'Fuego, Hielo, Veneno, Volador y Bicho ofrecen múltiples caminos.' },
    { badge: 'Medalla Alma', leader: 'Sachiko', type: 'Veneno', city: 'Ciudad Fucsia', lesson: 'Tierra y Psíquico ayudan, pero sus estados y tácticas evasivas pueden alargar el combate.' },
    { badge: 'Medalla Pantano', leader: 'Sabrina', type: 'Psíquico', city: 'Ciudad Azafrán', lesson: 'Bicho, Fantasma y Siniestro deben emplearse con cuidado frente a su gran poder especial.' },
    { badge: 'Medalla Volcán', leader: 'Blaine', type: 'Fuego', city: 'Islas Espuma', lesson: 'Agua, Tierra y Roca apagan su ofensiva, aunque sus ataques pueden causar quemaduras.' },
    { badge: 'Medalla Tierra', leader: 'Azul', type: 'Varios tipos', city: 'Ciudad Verde', lesson: 'No se especializa en un único tipo: funciona como examen general del equipo construido durante todo el viaje.' },
  ],
  gymGroups: [
    { title: 'Las ocho Medallas de Johto', start: 0, end: 8 },
    { title: 'Las ocho Medallas de Kanto', start: 8, end: 16 },
  ],
  gymNote: 'En Kanto varios Gimnasios pueden abordarse con mayor libertad que en Johto.',
  systems: [
    { title: 'Pokémon acompañante', description: 'El primer Pokémon del equipo camina detrás de ti.' },
    { title: 'Pokégear', description: 'Reúne mapa, teléfono y radio.' },
    { title: 'Día y noche', description: 'Modifican encuentros y acontecimientos.' },
    { title: 'Bonguri', description: 'Se convierten en Poké Balls especiales.' },
    { title: 'Kanto', description: 'Amplía el viaje después de la Liga.' },
    { title: 'Pokéwalker', description: 'Añade actividades con el accesorio y un cartucho original compatible; no funciona mediante una R4 convencional.' },
  ],
  systemsTitle: 'Un mundo que acompaña al reloj',
  systemsNote: 'El reloj, las llamadas y el Pokémon acompañante hacen que volver a una ruta pueda ofrecer algo distinto.',
  firstHour: [
    'Elige a Chikorita, Cyndaquil o Totodile.',
    'Completa el primer encargo del Profesor Elm.',
    'Recibe la Pokédex y regresa cuando la historia lo indique.',
    'Captura compañeros para cubrir los tipos que te falten.',
    'Aprende a utilizar mapa y teléfono.',
    'Visita las casas y rutas opcionales antes del primer Gimnasio.',
  ],
  firstHourTip: 'El nivel de los rivales puede variar mucho entre zonas; reparte experiencia con regularidad.',
  reminders: [
    'Algunos Pokémon aparecen solo a determinadas horas.',
    'Guarda Bonguri y prueba diferentes Poké Balls.',
    'Las llamadas pueden abrir revanchas y pequeños acontecimientos.',
    'La Liga no es el final: reserva ganas de explorar Kanto.',
  ],
  resources: ['Pokédex de Johto', 'Encuentros por horario', 'Mapa de ambas regiones', 'Bonguri y Balls'],
  spoilerWarning: 'Las guías de Kanto suelen revelar el contenido posterior a la Liga.',
}

export const blackGuide: MainGameGuide = {
  slug: 'negro',
  region: 'Teselia',
  eyebrow: 'Generación V · Teselia',
  title: 'Pokémon Edición Negra',
  summary: 'Una nueva generación con una historia especialmente presente.',
  lead: 'Teselia es una región extensa y urbana, habitada inicialmente por Pokémon diferentes a los conocidos en regiones anteriores. Tu viaje comienza junto a Cheren y Bel, dos amigos que crecerán contigo y se plantearán qué significa ser Entrenador.',
  pages: [113, 120],
  starters: [
    { speciesId: 495, name: 'Snivy', type: 'Planta', description: 'Veloz y técnico. Sus movimientos permiten controlar el combate y su línea evolutiva mantiene el tipo Planta.' },
    { speciesId: 498, name: 'Tepig', type: 'Fuego', description: 'Ofensivo y resistente. Al evolucionar incorpora el tipo Lucha y destaca por su fuerza física.' },
    { speciesId: 501, name: 'Oshawott', type: 'Agua', description: 'Equilibrado y flexible. Aprende opciones físicas y especiales y resulta fácil de integrar en distintos equipos.' },
  ],
  starterTitle: 'Tres nuevas especies de Teselia',
  starterTip: 'La Pokédex de Teselia presenta especies nuevas durante la historia. Elegir sin conocer sus evoluciones forma parte del descubrimiento.',
  rival: {
    title: 'Cheren',
    description: 'Busca hacerse más fuerte y elige el inicial con ventaja frente al tuyo. Sus combates ponen a prueba la construcción del equipo.',
    supporters: [
      { title: 'Bel', description: 'Elige el inicial débil frente al tuyo. Su viaje trata de descubrir qué quiere hacer y cómo relacionarse con sus Pokémon.' },
      { title: 'N', description: 'Es un rival ideológico vinculado al Equipo Plasma. Utiliza Pokémon distintos según el lugar y cuestiona la relación entre humanos y Pokémon.' },
    ],
  },
  gyms: [
    { badge: 'Medalla Trío', leader: 'Millo, Zeo o Maíz', type: 'Planta, Fuego o Agua', city: 'Ciudad Gres', lesson: 'Te enfrentarás al tipo con ventaja frente a tu inicial: una lección directa sobre afinidades.' },
    { badge: 'Medalla Base', leader: 'Aloe', type: 'Normal', city: 'Ciudad Esmalte', lesson: 'Sus Pokémon golpean con fuerza y demuestran que un tipo sin muchas ventajas también puede ser peligroso.' },
    { badge: 'Medalla Élitro', leader: 'Camus', type: 'Bicho', city: 'Ciudad Porcelana', lesson: 'Fuego, Volador y Roca ayudan, pero algunos dobles tipos cubren las debilidades habituales.' },
    { badge: 'Medalla Voltio', leader: 'Camila', type: 'Eléctrico', city: 'Ciudad Mayólica', lesson: 'La Velocidad y los cambios frecuentes exigen algo más que llevar un Pokémon de tipo Tierra.' },
    { badge: 'Medalla Temblor', leader: 'Yakón', type: 'Tierra', city: 'Ciudad Fayenza', lesson: 'Agua, Planta y Hielo ofrecen ventaja; evita depender de ataques Eléctricos.' },
    { badge: 'Medalla Jet', leader: 'Gerania', type: 'Volador', city: 'Ciudad Loza', lesson: 'Eléctrico, Hielo y Roca son buenas respuestas frente a rivales rápidos.' },
    { badge: 'Medalla Candelizo', leader: 'Junco', type: 'Hielo', city: 'Ciudad Teja', lesson: 'Fuego, Lucha, Roca y Acero permiten presionar a su equipo antes de que controle el combate.' },
    { badge: 'Medalla Leyenda', leader: 'Lirio', type: 'Dragón', city: 'Ciudad Caolín', lesson: 'Hielo y Dragón son las respuestas principales de esta generación; necesitarás resistencia y buena cobertura.' },
  ],
  systems: [
    { title: 'Pokédex de especies nuevas', description: 'Durante la historia regional conocerás un reparto completamente nuevo.' },
    { title: 'Estaciones', description: 'Cambian cada mes dentro del juego.' },
    { title: 'Combates múltiples', description: 'Introduce Combates Triples y Rotatorios.' },
    { title: 'C-Gear', description: 'Reúne funciones de comunicación.' },
    { title: 'Mayor escala', description: 'Grandes ciudades, puentes y escenarios.' },
    { title: 'Ciudad Negra', description: 'Una ubicación propia de esta edición.' },
  ],
  systemsTitle: 'Teselia cambia con el tiempo',
  systemsNote: 'En Combates Triples importa la posición; en Rotatorios, qué Pokémon se encuentra al frente.',
  firstHour: [
    'Elige a Snivy, Tepig u Oshawott.',
    'Combate con Cheren y Bel para aprender lo básico.',
    'Recibe la Pokédex y visita el primer Centro Pokémon.',
    'Captura especies de tipos diferentes.',
    'Ajusta velocidad del texto y estilo de combate en Opciones.',
    'Escucha las explicaciones sobre el Equipo Plasma sin consultar guías externas.',
  ],
  firstHourTip: 'Al ser especies nuevas, utiliza la Pokédex y los mensajes de eficacia para aprender sus tipos.',
  reminders: [
    'Experimenta: no necesitas conocer previamente a los Pokémon de Teselia.',
    'Revisa la estación cuando explores zonas opcionales.',
    'Aprende la colocación antes de un Combate Triple.',
    'Guarda antes de acontecimientos importantes o encuentros únicos.',
  ],
  resources: ['Pokédex de Teselia', 'Tipos y evoluciones', 'Calendario de estaciones', 'Guía de combates múltiples'],
  spoilerWarning: 'La historia de N y la Liga merece descubrirse sin walkthrough.',
}

export const blackTwoGuide: MainGameGuide = {
  slug: 'negro-2',
  region: 'Teselia',
  eyebrow: 'Generación V · Teselia',
  title: 'Pokémon Edición Negra 2',
  summary: 'Una continuación más abierta, variada y llena de actividades.',
  lead: 'Han pasado dos años desde los acontecimientos de Pokémon Negro. Teselia ha cambiado: aparecen nuevas ciudades, rutas transformadas y Pokémon de otras regiones desde el comienzo. Un nuevo Entrenador parte desde Ciudad Engobe para descubrir qué está ocurriendo.',
  pages: [121, 128],
  starters: [
    { speciesId: 495, name: 'Snivy', type: 'Planta', description: 'Rápido y técnico. Destaca cuando se aprovechan sus movimientos de apoyo y control.' },
    { speciesId: 498, name: 'Tepig', type: 'Fuego', description: 'Potente y resistente. Su evolución añade el tipo Lucha y refuerza su ofensiva física.' },
    { speciesId: 501, name: 'Oshawott', type: 'Agua', description: 'Equilibrado y versátil. Aprende movimientos variados y funciona bien en equipos muy distintos.' },
  ],
  starterTitle: 'Un nuevo comienzo en Teselia',
  starterTip: 'Bel te entrega el Pokémon en nombre de la Profesora Encina. Desde las primeras rutas encontrarás especies de otras generaciones para acompañarlo.',
  rival: {
    title: 'Matís, una búsqueda personal',
    description: 'Matís es tu vecino y amigo de la infancia. Ya posee el inicial con ventaja frente al tuyo y combate con gran intensidad. Años atrás el Equipo Plasma robó el Purrloin de su hermana; esa búsqueda explica su impaciencia y lo convierte en algo más que un rival competitivo.',
    supporters: [
      { title: 'Bel', description: 'Actúa como ayudante de la Profesora Encina y te entrega el inicial y la Pokédex.' },
      { title: 'Cheren', description: 'Ha encontrado un nuevo papel en Teselia y será parte de tu recorrido desde el primer Gimnasio.' },
    ],
  },
  gyms: [
    { badge: 'Medalla Base', leader: 'Cheren', type: 'Normal', city: 'Ciudad Engobe', lesson: 'Un primer combate sin grandes ventajas: céntrate en nivel, estado y decisiones sencillas.' },
    { badge: 'Medalla Ponzoña', leader: 'Hiedra', type: 'Veneno', city: 'Ciudad Hormigón', lesson: 'Tierra y Psíquico ayudan; lleva curación para el envenenamiento.' },
    { badge: 'Medalla Élitro', leader: 'Camus', type: 'Bicho', city: 'Ciudad Porcelana', lesson: 'Fuego, Volador y Roca son útiles, aunque los dobles tipos cambian algunas relaciones.' },
    { badge: 'Medalla Voltio', leader: 'Camila', type: 'Eléctrico', city: 'Ciudad Mayólica', lesson: 'Los cambios y la Velocidad obligan a preparar algo más que un único Pokémon de Tierra.' },
    { badge: 'Medalla Temblor', leader: 'Yakón', type: 'Tierra', city: 'Ciudad Fayenza', lesson: 'Agua, Planta y Hielo son eficaces; los ataques Eléctricos no causan daño.' },
    { badge: 'Medalla Jet', leader: 'Gerania', type: 'Volador', city: 'Ciudad Loza', lesson: 'Eléctrico, Hielo y Roca permiten responder a un equipo rápido y móvil.' },
    { badge: 'Medalla Leyenda', leader: 'Lirio', type: 'Dragón', city: 'Ciudad Caolín', lesson: 'Hielo y Dragón son las respuestas principales, pero la resistencia será igual de importante.' },
    { badge: 'Medalla Ola', leader: 'Ciprián', type: 'Agua', city: 'Ciudad Marga', lesson: 'El último Gimnasio exige una respuesta sólida a Agua y a sus posibles tipos secundarios.' },
  ],
  systems: [
    { title: 'Pokédex multigeneracional', description: 'Incluye especies de varias generaciones desde el comienzo.' },
    { title: 'Lista de Hábitats', description: 'Permite comprobar capturas por zona.' },
    { title: 'Pokémon World Tournament', description: 'Una instalación de combates con reglas propias.' },
    { title: 'Pokéwood', description: 'Rodajes cinematográficos y objetivos especiales.' },
    { title: 'Galería Unión', description: 'Un espacio que crece con tiendas y visitantes.' },
    { title: 'Nueva Teselia', description: 'Ciudades, rutas y Gimnasios diferentes.' },
  ],
  systemsTitle: 'Mucho que hacer fuera de la ruta principal',
  systemsNote: 'La Lista de Hábitats permite explorar con menos ayuda externa y comprobar qué especies quedan por encontrar.',
  firstHour: [
    'Elige a Snivy, Tepig u Oshawott.',
    'Aprende a utilizar la Lista de Hábitats.',
    'Captura un equipo variado: hay más tipos disponibles desde el principio.',
    'Visita cada nueva instalación al menos una vez.',
    'Revisa los cambios de rutas respecto a Pokémon Negro.',
    'Mantén varios integrantes a un nivel semejante.',
  ],
  firstHourTip: 'La gran variedad puede distraer; cambia el equipo con intención, no después de cada captura.',
  reminders: [
    'La secuela recompensa la curiosidad y el regreso a zonas antiguas.',
    'La Lista de Hábitats evita depender tanto de una Pokédex externa.',
    'Algunas actividades opcionales tienen reglas propias; lee sus tutoriales.',
    'El contenido posterior a la Liga es especialmente amplio.',
  ],
  resources: ['Pokédex regional', 'Lista de Hábitats', 'Mapa de cambios', 'Introducción al PWT'],
  spoilerWarning: 'Las guías sobre el Equipo Plasma pueden revelar conexiones con el primer juego.',
}

export const publishedMainGameGuides: ReadonlyMap<MainGameSlug, MainGameGuide> = new Map([
  [pearlGuide.slug, pearlGuide],
  [platinumGuide.slug, platinumGuide],
  [heartGoldGuide.slug, heartGoldGuide],
  [blackGuide.slug, blackGuide],
  [blackTwoGuide.slug, blackTwoGuide],
])
