import { useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'

const DEFAULT_CENTER = [3.4516, -76.532]

function MapUpdater({ center }) {
  const map = useMap()
  const latitude = center[0]
  const longitude = center[1]
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize({ pan: false })
      map.setView([latitude, longitude], map.getZoom())
    })
    return () => window.cancelAnimationFrame(frame)
  }, [latitude, longitude, map])

  useEffect(() => {
    const element = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [map])

  return null
}

export function WalkMap({ position, points }) {
  const center = position ? [position.latitude, position.longitude] : DEFAULT_CENTER
  const path = points.map((point) => [point.latitude, point.longitude])

  return (
    <>
      <div className="map-frame">
        <MapContainer center={center} zoom={15} scrollWheelZoom={false}>
          <MapUpdater center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {path.length > 1 && <Polyline positions={path} pathOptions={{ color: '#34785c', weight: 5 }} />}
          {position && (
            <CircleMarker
              center={center}
              radius={8}
              pathOptions={{ color: '#fff', weight: 3, fillColor: '#34785c', fillOpacity: 1 }}
            />
          )}
        </MapContainer>
      </div>
      <div className="map-credit">Mapa: OpenStreetMap</div>
    </>
  )
}
