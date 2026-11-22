import { useCallback, useEffect, useRef, useState } from 'react'
import { Geolocation } from '@capacitor/geolocation'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState('')
  const watchId = useRef(null)

  const getCurrentPosition = useCallback(async () => {
    setError('')
    try {
      const result = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
      })
      const next = { latitude: result.coords.latitude, longitude: result.coords.longitude }
      setPosition(next)
      return next
    } catch (locationError) {
      setError(locationError.message || 'No se pudo obtener la ubicación.')
      throw locationError
    }
  }, [])

  const startWatching = useCallback(async (onPosition) => {
    setError('')
    watchId.current = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 },
      (result, locationError) => {
        if (locationError) {
          setError(locationError.message || 'Se perdió la señal GPS.')
          return
        }
        if (!result) return
        const next = { latitude: result.coords.latitude, longitude: result.coords.longitude }
        setPosition(next)
        onPosition(next)
      },
    )
  }, [])

  const stopWatching = useCallback(async () => {
    if (watchId.current) {
      await Geolocation.clearWatch({ id: watchId.current })
      watchId.current = null
    }
  }, [])

  useEffect(() => () => {
    if (watchId.current) Geolocation.clearWatch({ id: watchId.current })
  }, [])

  return { position, setPosition, error, getCurrentPosition, startWatching, stopWatching }
}
