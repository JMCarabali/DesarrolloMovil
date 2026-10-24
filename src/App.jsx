import { useEffect, useState } from 'react'
import { IonApp, IonAvatar, IonButton, IonCheckbox, IonContent, IonIcon, IonInput, IonSpinner, IonToast } from '@ionic/react'
import { addOutline, cameraOutline, checkmarkDoneOutline, logOutOutline, pencilOutline, radioButtonOffOutline, trashOutline } from 'ionicons/icons'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { isSupabaseConfigured, supabase } from './lib/supabase.js'

const filters = [{ id: 'all', label: 'Todas' }, { id: 'pending', label: 'Pendientes' }, { id: 'done', label: 'Completadas' }]
const errorMessage = (error) => error?.message?.includes('Invalid login credentials') ? 'Correo o contraseña incorrectos.' : error?.message || 'Ocurrió un error. Inténtalo de nuevo.'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [avatar, setAvatar] = useState('')
  const [busy, setBusy] = useState(false)
  const [live, setLive] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined }
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user || !supabase) { setTasks([]); setAvatar(''); setLive(false); return undefined }
    let active = true
    const loadTasks = async () => {
      const { data, error } = await supabase.from('tareas').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (!active) return
      if (error) setToast(errorMessage(error))
      else setTasks(data ?? [])
    }
    const channel = supabase.channel(`tareas-${user.id}`).on('postgres_changes', {
      event: '*', schema: 'public', table: 'tareas', filter: `user_id=eq.${user.id}`,
    }, ({ eventType, new: next, old }) => {
      if (eventType === 'INSERT') setTasks((rows) => rows.some((row) => row.id === next.id) ? rows : [next, ...rows])
      if (eventType === 'UPDATE') setTasks((rows) => rows.map((row) => row.id === next.id ? next : row))
      if (eventType === 'DELETE') setTasks((rows) => rows.filter((row) => row.id !== old.id))
    }).subscribe((status) => setLive(status === 'SUBSCRIBED'))
    loadTasks()
    if (user.user_metadata?.avatar_path) loadAvatar(user.user_metadata.avatar_path)
    return () => { active = false; supabase.removeChannel(channel) }
  }, [user])

  async function loadAvatar(path) {
    const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 3600)
    if (error) setToast(errorMessage(error))
    else setAvatar(data.signedUrl)
  }

  async function authenticate(event) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
    setBusy(false)
    if (result.error) setToast(errorMessage(result.error))
    else if (mode === 'register' && !result.data.session) setToast('Cuenta creada. Revisa tu correo para confirmar el registro.')
  }

  async function addTask(event) {
    event.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    const { data, error } = await supabase.from('tareas').insert({ titulo: title.trim(), user_id: user.id }).select().single()
    setBusy(false)
    if (error) setToast(errorMessage(error))
    else { setTasks((rows) => rows.some((row) => row.id === data.id) ? rows : [data, ...rows]); setTitle('') }
  }

  async function updateTask(id, changes) {
    const { data, error } = await supabase.from('tareas').update(changes).eq('id', id).eq('user_id', user.id).select().single()
    if (error) setToast(errorMessage(error))
    else setTasks((rows) => rows.map((row) => row.id === id ? data : row))
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tareas').delete().eq('id', id).eq('user_id', user.id)
    if (error) setToast(errorMessage(error))
    else setTasks((rows) => rows.filter((row) => row.id !== id))
  }

  async function captureAvatar() {
    try {
      const photo = await Camera.getPhoto({ quality: 82, allowEditing: true, resultType: CameraResultType.Uri, source: CameraSource.Prompt })
      if (!photo.webPath) return
      setBusy(true)
      const blob = await (await fetch(photo.webPath)).blob()
      const ext = photo.format || 'jpeg'
      const path = `${user.id}/avatar-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: blob.type || `image/${ext}`, upsert: true })
      if (error) throw error
      const { error: profileError } = await supabase.auth.updateUser({ data: { avatar_path: path } })
      if (profileError) throw profileError
      await loadAvatar(path)
      setToast('Foto de perfil actualizada.')
    } catch (error) {
      if (!/cancel/i.test(error?.message || '')) setToast(errorMessage(error))
    } finally { setBusy(false) }
  }

  if (loading) return <IonApp><IonContent><div className="loading-screen"><IonSpinner name="crescent" /></div></IonContent></IonApp>

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Estudiante'
  const pending = tasks.filter((task) => !task.completada).length
  const completed = tasks.length - pending
  const shown = tasks.filter((task) => filter === 'all' || (filter === 'pending' && !task.completada) || (filter === 'done' && task.completada))

  return (
    <IonApp>
      <IonContent fullscreen>
        <main className="site-shell">
          <header className="topbar">
            <a className="brand" href="/"><span className="brand-mark"><span /></span><span>ritmo<span className="brand-period">.</span></span></a>
            {user ? <div className="account-tools">
              <button className="profile-button" onClick={captureAvatar} disabled={busy} aria-label="Tomar foto de perfil">
                <IonAvatar className="profile-avatar">{avatar ? <img src={avatar} alt="Foto de perfil" /> : <span>{name.slice(0, 1).toUpperCase()}</span>}</IonAvatar>
                <span className="camera-badge"><IonIcon icon={cameraOutline} /></span>
              </button>
              <span className="account-name">{name}</span>
              <button className="icon-button" onClick={() => supabase.auth.signOut()} aria-label="Cerrar sesión" title="Cerrar sesión"><IonIcon icon={logOutOutline} /></button>
            </div> : <span className="topbar-note">TU ESPACIO, A TU RITMO</span>}
          </header>

          {!user ? <section className="auth-layout">
            <div className="auth-copy">
              <p className="eyebrow"><span className="eyebrow-mark" /> CHALLENGE 08 · IONIC + SUPABASE</p>
              <h1>Haz espacio<br />para lo que <em>sigue.</em></h1>
              <p className="auth-description">Tus tareas, sincronizadas en tiempo real y listas para acompañarte donde estés.</p>
              <div className="auth-art" aria-hidden="true"><div className="art-sun" /><div className="art-line art-line-one" /><div className="art-line art-line-two" /><div className="art-note note-one"><IonIcon icon={checkmarkDoneOutline} /></div><div className="art-note note-two"><IonIcon icon={radioButtonOffOutline} /></div><div className="art-caption">UN PASO A LA VEZ</div></div>
            </div>
            <section className="auth-panel" aria-label={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}>
              <div className="auth-panel-heading"><span className="section-kicker">BIENVENIDO DE VUELTA</span><h2>{mode === 'login' ? 'Entrar a mi lista' : 'Crear mi cuenta'}</h2><p>{mode === 'login' ? 'Inicia sesión para continuar.' : 'Regístrate con tu correo y crea tu espacio.'}</p></div>
              <div className="auth-tabs" role="tablist" aria-label="Acceso">
                <button className={mode === 'login' ? 'is-selected' : ''} onClick={() => setMode('login')} role="tab" aria-selected={mode === 'login'}>Iniciar sesión</button>
                <button className={mode === 'register' ? 'is-selected' : ''} onClick={() => setMode('register')} role="tab" aria-selected={mode === 'register'}>Registrarme</button>
              </div>
              <form className="auth-form" onSubmit={authenticate}>
                <label className="field-label" htmlFor="email">Correo electrónico</label>
                <IonInput id="email" className="form-input" type="email" autocomplete="email" placeholder="tu@correo.com" value={email} onIonInput={(event) => setEmail(event.detail.value ?? '')} required />
                <label className="field-label" htmlFor="password">Contraseña</label>
                <IonInput id="password" className="form-input" type="password" autocomplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Mínimo 6 caracteres" value={password} onIonInput={(event) => setPassword(event.detail.value ?? '')} minlength={6} required />
                <IonButton className="primary-button auth-submit" type="submit" expand="block" disabled={busy || !isSupabaseConfigured}>{busy ? <IonSpinner name="crescent" /> : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</IonButton>
              </form>
              {!isSupabaseConfigured ? <div className="connect-hint"><span className="hint-icon">!</span><div><strong>Supabase aún no está conectado</strong><p>Copia `.env.example` como `.env` y agrega la URL y la clave pública del proyecto.</p></div></div> : <p className="auth-footnote">Tus tareas quedan protegidas por tu cuenta.</p>}
            </section>
          </section> : <section className="workspace">
            <div className="workspace-heading"><div><p className="eyebrow"><span className="eyebrow-mark" /> TU ESPACIO PERSONAL</p><h1>Hola, {name}<span className="title-period">.</span></h1><p className="workspace-subtitle">Una cosa a la vez. Vas muy bien.</p></div><div className={`live-pill ${live ? 'is-live' : ''}`}><span />{live ? 'EN VIVO' : 'CONECTANDO'}</div></div>
            <section className="summary-strip" aria-label="Resumen de tareas"><div className="summary-item"><span className="summary-number">{String(tasks.length).padStart(2, '0')}</span><span className="summary-label">TAREAS EN TOTAL</span></div><div className="summary-divider" /><div className="summary-item"><span className="summary-number">{String(pending).padStart(2, '0')}</span><span className="summary-label">POR HACER</span></div><div className="summary-divider" /><div className="summary-item"><span className="summary-number">{String(completed).padStart(2, '0')}</span><span className="summary-label">COMPLETADAS</span></div><div className="summary-decoration">✳</div></section>
            <section className="task-section">
              <div className="section-heading"><div><span className="section-kicker">TU TABLERO</span><h2>Lista de tareas</h2></div><div className="task-filters" role="tablist" aria-label="Filtrar tareas">{filters.map((option) => <button key={option.id} className={filter === option.id ? 'is-selected' : ''} onClick={() => setFilter(option.id)} role="tab" aria-selected={filter === option.id}>{option.label}</button>)}</div></div>
              <form className="add-task-form" onSubmit={addTask}><span className="add-mark"><IonIcon icon={addOutline} /></span><IonInput aria-label="Nueva tarea" placeholder="¿Qué necesitas hacer?" value={title} onIonInput={(event) => setTitle(event.detail.value ?? '')} maxlength={140} required /><IonButton className="add-button" type="submit" disabled={busy || !title.trim()}><IonIcon slot="start" icon={addOutline} />Agregar</IonButton></form>
              <div className="task-list" aria-live="polite">
                {shown.map((task, index) => <article className={`task-row ${task.completada ? 'is-complete' : ''}`} key={task.id} style={{ '--row-index': index }}>
                  <IonCheckbox className="task-checkbox" checked={task.completada} onIonChange={(event) => updateTask(task.id, { completada: event.detail.checked })} aria-label={task.completada ? 'Marcar pendiente' : 'Marcar completada'} />
                  {editing === task.id ? <form className="edit-form" onSubmit={async (event) => { event.preventDefault(); if (!editTitle.trim()) return; await updateTask(task.id, { titulo: editTitle.trim() }); setEditing(null) }}><IonInput aria-label="Editar tarea" value={editTitle} onIonInput={(event) => setEditTitle(event.detail.value ?? '')} autofocus /><button className="text-action" type="submit">Guardar</button><button className="text-action subtle-action" type="button" onClick={() => setEditing(null)}>Cancelar</button></form> : <><div className="task-copy"><span className="task-title">{task.titulo}</span><span className="task-date">{new Date(task.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span></div><div className="task-actions">{!task.completada && <button className="icon-button" title="Editar tarea" aria-label="Editar tarea" onClick={() => { setEditing(task.id); setEditTitle(task.titulo) }}><IonIcon icon={pencilOutline} /></button>}<button className="icon-button delete-action" title="Eliminar tarea" aria-label="Eliminar tarea" onClick={() => deleteTask(task.id)}><IonIcon icon={trashOutline} /></button></div></>}
                </article>)}
                {shown.length === 0 && <div className="empty-state"><div className="empty-icon"><IonIcon icon={filter === 'done' ? checkmarkDoneOutline : radioButtonOffOutline} /></div><h3>{filter === 'all' ? 'Tu lista empieza aquí' : filter === 'pending' ? 'Todo al día' : 'Aún no hay tareas completadas'}</h3><p>{filter === 'all' ? 'Agrega una tarea y dale forma a tu día.' : 'Cuando haya novedades, las verás aquí.'}</p></div>}
              </div>
              <footer className="task-footer"><span>{pending} {pending === 1 ? 'pendiente' : 'pendientes'}</span><span>Los cambios se sincronizan automáticamente <span className="footer-spark">✳</span></span></footer>
            </section>
            <div className="app-footer"><span>RITMO · CHALLENGE 08</span><span>HECHO PARA AVANZAR</span></div>
          </section>}
        </main>
        <IonToast isOpen={Boolean(toast)} message={toast} duration={3200} position="top" onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonApp>
  )
}
