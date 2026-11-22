import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { createDemoWalks, readLocalWalks, writeLocalWalks } from '../helpers/storage'
import { addSignedPhotoUrl, uploadWalkPhoto } from '../helpers/walkPhotos'

const WalksContext = createContext(null)

export function WalksProvider({ children }) {
  const { user, isDemo } = useAuth()
  const sessionKey = `${user?.id || 'guest'}-${isDemo ? 'demo' : 'account'}`

  return (
    <WalksStateProvider key={sessionKey} user={user} isDemo={isDemo}>
      {children}
    </WalksStateProvider>
  )
}

function WalksStateProvider({ children, user, isDemo }) {
  const [walks, setWalks] = useState(() => user && isDemo ? readLocalWalks() : [])
  const [loading, setLoading] = useState(Boolean(user && !isDemo && supabase))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || isDemo || !supabase) return undefined

    let active = true
    supabase
      .from('walks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(async ({ data, error: requestError }) => {
        if (!active) return
        if (requestError) {
          setError(requestError.message)
        } else {
          try {
            setWalks(await Promise.all((data || []).map(addSignedPhotoUrl)))
          } catch (photoError) {
            setError(photoError.message)
          }
        }
        setLoading(false)
      })

    const channel = supabase
      .channel(`walks-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'walks', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          let updatedWalk
          if (payload.eventType !== 'DELETE') {
            try {
              updatedWalk = await addSignedPhotoUrl(payload.new)
            } catch (photoError) {
              setError(photoError.message)
              return
            }
          }
          setWalks((current) => {
            if (payload.eventType === 'INSERT') {
              return [updatedWalk, ...current.filter((walk) => walk.id !== updatedWalk.id)]
            }
            if (payload.eventType === 'UPDATE') {
              return current.map((walk) => (walk.id === updatedWalk.id ? updatedWalk : walk))
            }
            return current.filter((walk) => walk.id !== payload.old.id)
          })
        },
      )
      .subscribe((status, subscriptionError) => {
        if (subscriptionError) setError(subscriptionError.message)
        if (status === 'CHANNEL_ERROR') setError('No se pudo iniciar la sincronización en tiempo real.')
      })

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [user, isDemo])

  async function addWalk(walk) {
    setError('')
    if (isDemo) {
      const { photo_data, ...walkData } = walk
      const savedWalk = {
        ...walkData,
        photo_url: photo_data || walk.photo_url || null,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      }
      const nextWalks = [savedWalk, ...readLocalWalks()]
      writeLocalWalks(nextWalks)
      setWalks(nextWalks)
      return savedWalk
    }

    if (!supabase || !user) throw new Error('Inicia sesión para guardar el paseo.')
    const id = crypto.randomUUID()
    const photo_path = await uploadWalkPhoto(user.id, id, walk.photo_data)
    const walkData = { ...walk }
    delete walkData.photo_data
    delete walkData.title
    const { data, error: insertError } = await supabase
      .from('walks')
      .insert({ ...walkData, id, photo_path, user_id: user.id })
      .select()
      .single()
    if (insertError) throw insertError
    const savedWalk = await addSignedPhotoUrl(data)
    setWalks((current) => [savedWalk, ...current.filter((item) => item.id !== savedWalk.id)])
    return savedWalk
  }

  async function updateWalk(id, changes) {
    setError('')
    if (isDemo) {
      const nextWalks = readLocalWalks().map((walk) =>
        walk.id === id ? { ...walk, ...changes } : walk,
      )
      writeLocalWalks(nextWalks)
      setWalks(nextWalks)
      return
    }
    if (!supabase || !user) throw new Error('Inicia sesión para editar el paseo.')
    const { data, error: updateError } = await supabase
      .from('walks')
      .update(changes)
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError
    const updatedWalk = await addSignedPhotoUrl(data)
    setWalks((current) => current.map((walk) => (walk.id === id ? updatedWalk : walk)))
  }

  async function deleteWalk(id) {
    setError('')
    if (isDemo) {
      const nextWalks = readLocalWalks().filter((walk) => walk.id !== id)
      writeLocalWalks(nextWalks)
      setWalks(nextWalks)
      return
    }
    if (!supabase || !user) throw new Error('Inicia sesión para eliminar el paseo.')
    const { error: deleteError } = await supabase.from('walks').delete().eq('id', id)
    if (deleteError) throw deleteError
    setWalks((current) => current.filter((walk) => walk.id !== id))
  }

  function restoreDemoWalks() {
    if (!isDemo) throw new Error('Los ejemplos solo están disponibles en modo demostración.')
    const examples = createDemoWalks()
    writeLocalWalks(examples)
    setWalks(examples)
  }

  function clearDemoWalks() {
    if (!isDemo) throw new Error('El historial local solo está disponible en modo demostración.')
    writeLocalWalks([])
    setWalks([])
  }

  return (
    <WalksContext.Provider value={{ walks, loading, error, addWalk, updateWalk, deleteWalk, restoreDemoWalks, clearDemoWalks }}>
      {children}
    </WalksContext.Provider>
  )
}

export function useWalks() {
  const context = useContext(WalksContext)
  if (!context) throw new Error('useWalks debe usarse dentro de WalksProvider.')
  return context
}
