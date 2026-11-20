# Giphy Search

App en React + Vite que busca GIFs con la API de Giphy mientras se escribe.

## Características
- Búsqueda con debounce (400 ms) y cancelación de peticiones con AbortController
- Cliente HTTP con Axios (`axios.create` + interceptor de errores)
- Paginación con botón "Cargar más" (`limit` / `offset`)
- API key en variables de entorno (`.env`)

## Cómo correrlo
1. `npm install`
2. Copia `.env.example` a `.env` y pon tu API key de https://developers.giphy.com/
3. `npm run dev`

## Estructura
- `src/api/giphy.js`: cliente Axios y función `searchGifs`
- `src/App.jsx`: interfaz, estado y búsqueda
