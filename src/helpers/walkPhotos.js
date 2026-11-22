import { supabase } from '../lib/supabase'

const BUCKET = 'walk-photos'

export async function uploadWalkPhoto(userId, walkId, dataUrl) {
  if (!dataUrl) return null
  const response = await fetch(dataUrl)
  const image = await response.blob()
  const path = `${userId}/${walkId}.jpg`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, image, { contentType: 'image/jpeg', upsert: true })
  if (error) throw error
  return path
}

export async function addSignedPhotoUrl(walk) {
  if (!walk.photo_path) return { ...walk, photo_url: null }
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(walk.photo_path, 60 * 60 * 24)
  if (error) throw error
  return { ...walk, photo_url: data.signedUrl }
}
