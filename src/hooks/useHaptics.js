import { Haptics, ImpactStyle } from '@capacitor/haptics'

export function useHaptics() {
  return async function tapFeedback() {
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch (error) {
      console.error('No se pudo activar la respuesta háptica:', error)
    }
  }
}
