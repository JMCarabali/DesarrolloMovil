import { useEffect, useState } from 'react'
import { Network } from '@capacitor/network'

export function useNetwork() {
  const [connected, setConnected] = useState(navigator.onLine)

  useEffect(() => {
    let listener
    Network.getStatus()
      .then((status) => setConnected(status.connected))
      .catch((error) => console.error('No se pudo consultar la red:', error))
    Network.addListener('networkStatusChange', (status) => setConnected(status.connected))
      .then((handle) => {
        listener = handle
      })
      .catch((error) => console.error('No se pudo escuchar el estado de red:', error))

    return () => {
      if (listener) listener.remove()
    }
  }, [])

  return connected
}
