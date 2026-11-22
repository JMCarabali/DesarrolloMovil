import { DEMO_DOG_PHOTO } from '../constants'

const WALKS_KEY = 'patas-en-ruta-walks'

function dateDaysAgo(days, hour) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 15, 0, 0)
  return date.toISOString()
}

function demoCoordinates(offset = 0) {
  return [
    { latitude: 3.4516 + offset, longitude: -76.532 },
    { latitude: 3.4521 + offset, longitude: -76.5313 },
    { latitude: 3.4528 + offset, longitude: -76.5318 },
    { latitude: 3.4525 + offset, longitude: -76.5327 },
  ]
}

export function createDemoWalks() {
  return [
    {
      id: 'demo-walk-lake',
      title: 'Vuelta al lago',
      started_at: dateDaysAgo(0, 7),
      created_at: dateDaysAgo(0, 7),
      duration_seconds: 2280,
      distance_m: 2500,
      note: 'Luna saludó a tres perritos y bebió agua en la fuente del sendero norte.',
      photo_url: DEMO_DOG_PHOTO,
      coordinates: demoCoordinates(),
    },
    {
      id: 'demo-walk-forest',
      title: 'Sendero del bosque',
      started_at: dateDaysAgo(1, 18),
      created_at: dateDaysAgo(1, 18),
      duration_seconds: 3240,
      distance_m: 3600,
      note: 'Atardecer precioso. Tiró un poco de la correa al ver ardillas.',
      photo_url: DEMO_DOG_PHOTO,
      coordinates: demoCoordinates(0.001),
    },
    {
      id: 'demo-walk-morning',
      title: 'Paseo corto de la mañana',
      started_at: dateDaysAgo(2, 8),
      created_at: dateDaysAgo(2, 8),
      duration_seconds: 1800,
      distance_m: 1800,
      note: 'Un paseo tranquilo antes de empezar el día.',
      photo_url: null,
      coordinates: demoCoordinates(0.002),
    },
    {
      id: 'demo-walk-park',
      title: 'Vuelta por el parque',
      started_at: dateDaysAgo(4, 17),
      created_at: dateDaysAgo(4, 17),
      duration_seconds: 2700,
      distance_m: 2900,
      note: 'Exploramos un camino nuevo.',
      photo_url: null,
      coordinates: demoCoordinates(0.003),
    },
    {
      id: 'demo-walk-neighborhood',
      title: 'Paseo del vecindario',
      started_at: dateDaysAgo(6, 9),
      created_at: dateDaysAgo(6, 9),
      duration_seconds: 1500,
      distance_m: 1600,
      note: 'Luna disfrutó del aire fresco.',
      photo_url: null,
      coordinates: demoCoordinates(0.004),
    },
  ]
}

export function seedDemoWalksIfNeeded() {
  if (typeof localStorage === 'undefined') return []
  if (localStorage.getItem(WALKS_KEY) !== null) return readLocalWalks()
  const walks = createDemoWalks()
  writeLocalWalks(walks)
  return walks
}

export function readLocalWalks() {
  try {
    const walks = JSON.parse(localStorage.getItem(WALKS_KEY) || '[]')
    return Array.isArray(walks) ? walks : []
  } catch (error) {
    console.error('No se pudo leer el historial local:', error)
    return []
  }
}

export function writeLocalWalks(walks) {
  localStorage.setItem(WALKS_KEY, JSON.stringify(walks))
}

export function formatDuration(seconds = 0) {
  const minutes = Math.max(0, Math.round(seconds / 60))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours > 0 ? `${hours} h ${remainingMinutes} min` : `${minutes} min`
}

export function formatDistance(meters = 0) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(meters / 1000)} km`
}

export function distanceBetween(first, second) {
  const radians = (value) => (value * Math.PI) / 180
  const earthRadius = 6371000
  const latitudeDifference = radians(second.latitude - first.latitude)
  const longitudeDifference = radians(second.longitude - first.longitude)
  const arc =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2
  return 2 * earthRadius * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc))
}
