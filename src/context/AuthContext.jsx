import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { seedDemoWalksIfNeeded } from '../helpers/storage'

const DEMO_SESSION_KEY = 'patas-en-ruta-demo-user'
const AuthContext = createContext(null)

function getDemoUser() {
  if (typeof localStorage === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null')
  } catch (error) {
    console.error('No se pudo recuperar la sesión de demostración:', error)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getDemoUser())
  const [isDemo, setIsDemo] = useState(() => Boolean(getDemoUser()))
  const [loading, setLoading] = useState(() => Boolean(supabase && !getDemoUser()))

  useEffect(() => {
    if (!supabase || getDemoUser()) return undefined

    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('No se pudo recuperar la sesión:', error.message)
      if (active) {
        const demoUser = getDemoUser()
        setUser(demoUser || data.session?.user || null)
        setIsDemo(Boolean(demoUser))
        setLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const demoUser = getDemoUser()
      setUser(demoUser || session?.user || null)
      setIsDemo(Boolean(demoUser))
      setLoading(false)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    if (!supabase) throw new Error('Configura Supabase para usar el inicio de sesión real.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, petName) {
    if (!supabase) throw new Error('Configura Supabase para registrar una cuenta real.')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { pet_name: petName.trim() } },
    })
    if (error) throw error
    return data
  }

  function continueAsDemo() {
    const demoUser = { id: 'demo-user', email: 'demo@patasenruta.app' }
    seedDemoWalksIfNeeded()
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
    setIsDemo(true)
  }

  async function signOut() {
    if (isDemo) {
      localStorage.removeItem(DEMO_SESSION_KEY)
      setUser(null)
      setIsDemo(false)
      return
    }
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isDemo, loading, isConfigured: Boolean(supabase), signIn, signUp, signOut, continueAsDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.')
  return context
}
