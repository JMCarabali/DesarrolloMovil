import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export function useCamera() {
  async function takePhoto() {
    const photo = await Camera.getPhoto({
      quality: 65,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      width: 1200,
    })
    if (!photo.dataUrl) throw new Error('La cámara no devolvió una imagen.')
    return photo.dataUrl
  }

  return { takePhoto }
}
