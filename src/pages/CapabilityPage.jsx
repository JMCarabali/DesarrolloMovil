import { useEffect, useRef, useState } from 'react'
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
} from '@ionic/react'
import { arrowForward, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons'
import { useParams } from 'react-router-dom'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Device } from '@capacitor/device'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Geolocation } from '@capacitor/geolocation'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Motion } from '@capacitor/motion'
import { PushNotifications } from '@capacitor/push-notifications'
import { capabilities } from '../data/capabilities.js'

const errorMessage = (error) => error?.message || 'Ocurrió un error al acceder a esta función.'

function DataRow({ label, value }) {
  return (
    <div className="data-row">
      <span>{label}</span>
      <strong>{value ?? 'No disponible'}</strong>
    </div>
  )
}

function ActionButton({ children, onClick, disabled = false, secondary = false }) {
  return (
    <button
      className={`action-button${secondary ? ' action-secondary' : ''}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}<IonIcon icon={arrowForward} />
    </button>
  )
}

export default function CapabilityPage() {
  const { capabilityId } = useParams()
  const capability = capabilities.find((item) => item.id === capabilityId)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [position, setPosition] = useState(null)
  const [tracking, setTracking] = useState(false)
  const [photo, setPhoto] = useState('')
  const [motionData, setMotionData] = useState({ x: 0, y: 0, z: 0, alpha: 0, beta: 0, gamma: 0 })
  const [motionActive, setMotionActive] = useState(false)
  const [deviceData, setDeviceData] = useState(null)
  const [filePath, setFilePath] = useState('sensor-lab-nota.txt')
  const [fileContent, setFileContent] = useState('Mi primera nota desde Sensor Lab.')
  const [fileOutput, setFileOutput] = useState('')
  const [fileList, setFileList] = useState([])
  const [permission, setPermission] = useState('Sin consultar')
  const [scheduledId, setScheduledId] = useState(null)
  const [pushToken, setPushToken] = useState('')
  const [pushMessage, setPushMessage] = useState(null)
  const watchId = useRef(null)
  const motionListeners = useRef([])

  const execute = async (action) => {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await action()
    } catch (actionError) {
      setError(errorMessage(actionError))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch({ id: watchId.current })
    }
    motionListeners.current.forEach((listener) => listener.remove())
  }, [])

  useEffect(() => {
    if (capabilityId !== 'push-notifications') return undefined

    let active = true
    const handles = []
    const addListeners = async () => {
      handles.push(await PushNotifications.addListener('registration', (token) => {
        if (active) setPushToken(token.value)
      }))
      handles.push(await PushNotifications.addListener('registrationError', (event) => {
        if (active) setError(errorMessage(event))
      }))
      handles.push(await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        if (active) setPushMessage(notification)
      }))
      handles.push(await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        if (active) setPushMessage(action.notification)
      }))
    }
    addListeners().catch((listenerError) => {
      if (active) setError(errorMessage(listenerError))
    })

    return () => {
      active = false
      handles.forEach((handle) => handle.remove())
    }
  }, [capabilityId])

  if (!capability) {
    return (
      <IonPage>
        <IonContent><div className="app-frame"><p>Esta herramienta no existe.</p></div></IonContent>
      </IonPage>
    )
  }

  const getLocation = () => execute(async () => {
    const result = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
    setPosition(result.coords)
    setNotice('Ubicación actualizada.')
  })

  const startTracking = () => execute(async () => {
    if (watchId.current !== null) return
    watchId.current = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      (result, watchError) => {
        if (watchError) {
          setError(errorMessage(watchError))
          return
        }
        if (result) setPosition(result.coords)
      },
    )
    setTracking(true)
    setNotice('Seguimiento GPS activo.')
  })

  const stopTracking = () => execute(async () => {
    if (watchId.current !== null) {
      await Geolocation.clearWatch({ id: watchId.current })
      watchId.current = null
    }
    setTracking(false)
    setNotice('Seguimiento detenido.')
  })

  const takePhoto = () => execute(async () => {
    const result = await Camera.getPhoto({
      quality: 88,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    })
    setPhoto(result.dataUrl || result.webPath || '')
    setNotice('Imagen cargada correctamente.')
  })

  const startMotion = () => execute(async () => {
    if (motionListeners.current.length) return
    const accelerometer = await Motion.addListener('accel', (event) => {
      const acceleration = event.accelerationIncludingGravity || event.acceleration || {}
      setMotionData((current) => ({
        ...current,
        x: acceleration.x || 0,
        y: acceleration.y || 0,
        z: acceleration.z || 0,
      }))
    })
    const orientation = await Motion.addListener('orientation', (event) => {
      setMotionData((current) => ({
        ...current,
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      }))
    })
    motionListeners.current = [accelerometer, orientation]
    setMotionActive(true)
    setNotice('Sensores de movimiento activos.')
  })

  const stopMotion = () => execute(async () => {
    await Promise.all(motionListeners.current.map((listener) => listener.remove()))
    motionListeners.current = []
    setMotionActive(false)
    setNotice('Sensores detenidos.')
  })

  const loadDevice = () => execute(async () => {
    const results = await Promise.allSettled([
      Device.getInfo(),
      Device.getBatteryInfo(),
      Device.getId(),
    ])
    const [info, battery, id] = results.map((result) => result.status === 'fulfilled' ? result.value : null)
    setDeviceData({ info, battery, id })
    setNotice('Información del dispositivo actualizada.')
  })

  const writeFile = () => execute(async () => {
    await Filesystem.writeFile({
      path: filePath,
      data: fileContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    })
    setNotice(`Archivo guardado: ${filePath}`)
  })

  const readFile = () => execute(async () => {
    const result = await Filesystem.readFile({
      path: filePath,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    })
    setFileOutput(result.data)
    setNotice('Archivo leído correctamente.')
  })

  const listFiles = () => execute(async () => {
    const result = await Filesystem.readdir({ path: '', directory: Directory.Documents })
    setFileList(result.files)
    setNotice(`${result.files.length} elemento(s) encontrado(s).`)
  })

  const deleteFile = () => execute(async () => {
    await Filesystem.deleteFile({ path: filePath, directory: Directory.Documents })
    setFileOutput('')
    setNotice(`Archivo eliminado: ${filePath}`)
  })

  const requestLocalPermission = () => execute(async () => {
    const result = await LocalNotifications.requestPermissions()
    setPermission(result.display)
    if (result.display !== 'granted') throw new Error('No se concedió el permiso de notificaciones.')
    setNotice('Permiso concedido.')
  })

  const sendLocalNotification = () => execute(async () => {
    const id = Date.now() % 2147483647
    await LocalNotifications.schedule({
      notifications: [{ id, title: 'Sensor Lab', body: 'Tu notificación local está funcionando.', schedule: { at: new Date(Date.now() + 1000) } }],
    })
    setNotice('Notificación enviada. Revisa el centro de notificaciones.')
  })

  const scheduleLocalNotification = () => execute(async () => {
    const id = Date.now() % 2147483647
    await LocalNotifications.schedule({
      notifications: [{ id, title: 'Recordatorio Sensor Lab', body: 'La notificación programada ya llegó.', schedule: { at: new Date(Date.now() + 10000) } }],
    })
    setScheduledId(id)
    setNotice('Recordatorio programado para dentro de 10 segundos.')
  })

  const cancelLocalNotification = () => execute(async () => {
    if (scheduledId === null) throw new Error('Primero programa un recordatorio.')
    await LocalNotifications.cancel({ notifications: [{ id: scheduledId }] })
    setScheduledId(null)
    setNotice('Recordatorio cancelado.')
  })

  const registerPush = () => execute(async () => {
    const result = await PushNotifications.requestPermissions()
    setPermission(result.receive)
    if (result.receive !== 'granted') throw new Error('No se concedió el permiso para notificaciones push.')
    await PushNotifications.register()
    setNotice('Registro iniciado. El token aparecerá cuando Firebase responda.')
  })

  const renderTool = () => {
    switch (capabilityId) {
      case 'geolocation':
        return (
          <>
            <p className="tool-intro">Consulta tu posición actual o deja activo el GPS para seguir sus cambios.</p>
            <div className="action-row">
              <ActionButton disabled={busy} onClick={getLocation}>Obtener ubicación</ActionButton>
              {!tracking
                ? <ActionButton disabled={busy} onClick={startTracking} secondary>Iniciar seguimiento</ActionButton>
                : <ActionButton disabled={busy} onClick={stopTracking} secondary>Detener seguimiento</ActionButton>}
            </div>
            <div className="data-panel">
              <DataRow label="Latitud" value={position?.latitude?.toFixed(6)} />
              <DataRow label="Longitud" value={position?.longitude?.toFixed(6)} />
              <DataRow label="Precisión" value={position?.accuracy ? `${Math.round(position.accuracy)} m` : null} />
              <DataRow label="Altitud" value={position?.altitude != null ? `${Math.round(position.altitude)} m` : null} />
              <DataRow label="Velocidad" value={position?.speed != null ? `${position.speed.toFixed(1)} m/s` : null} />
            </div>
            <p className="live-state"><span className={`status-dot${tracking ? ' is-live' : ''}`} />{tracking ? 'Seguimiento en vivo' : 'GPS en espera'}</p>
          </>
        )
      case 'camera':
        return (
          <>
            <p className="tool-intro">Abre la cámara o la galería del dispositivo. La imagen se muestra aquí al regresar.</p>
            <ActionButton disabled={busy} onClick={takePhoto}>Abrir cámara o galería</ActionButton>
            {photo && <div className="photo-result"><img src={photo} alt="Imagen capturada o seleccionada" /><button className="text-button" onClick={() => setPhoto('')} type="button">Quitar imagen</button></div>}
          </>
        )
      case 'motion':
        return (
          <>
            <p className="tool-intro">Activa la lectura del acelerómetro y la orientación. Los valores se actualizan mientras el listener está activo.</p>
            <ActionButton disabled={busy} onClick={motionActive ? stopMotion : startMotion}>{motionActive ? 'Detener sensores' : 'Iniciar sensores'}</ActionButton>
            <div className="motion-grid">
              {[['Aceleración X', motionData.x], ['Aceleración Y', motionData.y], ['Aceleración Z', motionData.z], ['Alpha', motionData.alpha], ['Beta', motionData.beta], ['Gamma', motionData.gamma]].map(([label, value]) => (
                <div className="motion-value" key={label}><span>{label}</span><strong>{Number(value).toFixed(2)}<small>{label.startsWith('Aceleración') ? ' m/s²' : '°'}</small></strong></div>
              ))}
            </div>
            <p className="live-state"><span className={`status-dot${motionActive ? ' is-live' : ''}`} />{motionActive ? 'Lectura activa' : 'Sensores en espera'}</p>
          </>
        )
      case 'device':
        return (
          <>
            <p className="tool-intro">Consulta los datos que el sistema operativo expone sobre este dispositivo.</p>
            <ActionButton disabled={busy} onClick={loadDevice}>Leer información del dispositivo</ActionButton>
            {deviceData && <div className="data-panel device-panel">
              <DataRow label="Modelo" value={deviceData.info?.model} />
              <DataRow label="Fabricante" value={deviceData.info?.manufacturer} />
              <DataRow label="Plataforma" value={deviceData.info?.platform} />
              <DataRow label="Sistema operativo" value={deviceData.info?.operatingSystem} />
              <DataRow label="Versión" value={deviceData.info?.osVersion} />
              <DataRow label="Batería" value={deviceData.battery?.batteryLevel != null ? `${Math.round(deviceData.battery.batteryLevel * 100)}%` : null} />
              <DataRow label="Cargando" value={deviceData.battery?.isCharging == null ? null : deviceData.battery.isCharging ? 'Sí' : 'No'} />
              <DataRow label="Identificador" value={deviceData.id?.identifier} />
            </div>}
          </>
        )
      case 'haptics':
        return (
          <>
            <p className="tool-intro">Prueba intensidades de impacto y patrones de vibración. El efecto depende del hardware disponible.</p>
            <div className="control-group"><h3>Impacto</h3><div className="action-row">
              <ActionButton disabled={busy} onClick={() => execute(() => Haptics.impact({ style: ImpactStyle.Light }))}>Suave</ActionButton>
              <ActionButton disabled={busy} onClick={() => execute(() => Haptics.impact({ style: ImpactStyle.Medium }))} secondary>Medio</ActionButton>
              <ActionButton disabled={busy} onClick={() => execute(() => Haptics.impact({ style: ImpactStyle.Heavy }))} secondary>Fuerte</ActionButton>
            </div></div>
            <div className="control-group"><h3>Respuesta</h3><div className="action-row">
              <ActionButton disabled={busy} onClick={() => execute(() => Haptics.notification({ type: NotificationType.Success }))}>Éxito</ActionButton>
              <ActionButton disabled={busy} onClick={() => execute(() => Haptics.notification({ type: NotificationType.Warning }))} secondary>Aviso</ActionButton>
              <ActionButton disabled={busy} onClick={() => execute(() => Haptics.vibrate({ duration: 350 }))} secondary>Vibrar</ActionButton>
            </div></div>
            <div className="selection-control" onTouchStart={() => Haptics.selectionStart()} onTouchMove={() => Haptics.selectionChanged()} onTouchEnd={() => Haptics.selectionEnd()}>
              Mantén y desliza aquí para probar selección háptica
            </div>
          </>
        )
      case 'filesystem':
        return (
          <>
            <p className="tool-intro">Guarda y administra un archivo en el directorio Documentos de la app.</p>
            <label className="field-label" htmlFor="file-path">Nombre del archivo</label>
            <input className="text-field" id="file-path" onChange={(event) => setFilePath(event.target.value)} value={filePath} />
            <label className="field-label" htmlFor="file-content">Contenido</label>
            <textarea className="text-field text-area" id="file-content" onChange={(event) => setFileContent(event.target.value)} value={fileContent} />
            <div className="action-row">
              <ActionButton disabled={busy} onClick={writeFile}>Guardar</ActionButton>
              <ActionButton disabled={busy} onClick={readFile} secondary>Leer</ActionButton>
              <ActionButton disabled={busy} onClick={listFiles} secondary>Listar</ActionButton>
              <ActionButton disabled={busy} onClick={deleteFile} secondary>Eliminar</ActionButton>
            </div>
            {fileOutput && <pre className="file-output">{fileOutput}</pre>}
            {fileList.length > 0 && <ul className="file-list">{fileList.map((file) => <li key={file.name}>{file.name}<span>{file.type}</span></li>)}</ul>}
          </>
        )
      case 'local-notifications':
        return (
          <>
            <p className="tool-intro">Solicita permiso y prueba una notificación inmediata o un recordatorio programado.</p>
            <div className="permission-line"><span>Permiso</span><strong>{permission}</strong></div>
            <div className="action-row">
              <ActionButton disabled={busy} onClick={requestLocalPermission}>Solicitar permiso</ActionButton>
              <ActionButton disabled={busy} onClick={sendLocalNotification} secondary>Enviar ahora</ActionButton>
              <ActionButton disabled={busy} onClick={scheduleLocalNotification} secondary>Programar 10 s</ActionButton>
              <ActionButton disabled={busy || scheduledId === null} onClick={cancelLocalNotification} secondary>Cancelar</ActionButton>
            </div>
            {scheduledId !== null && <p className="small-note">Recordatorio activo · ID {scheduledId}</p>}
          </>
        )
      case 'push-notifications':
        return (
          <>
            <p className="tool-intro">Solicita permiso y registra este dispositivo para recibir notificaciones push enviadas desde Firebase Cloud Messaging.</p>
            <div className="permission-line"><span>Permiso</span><strong>{permission}</strong></div>
            <ActionButton disabled={busy} onClick={registerPush}>Solicitar permiso y registrar</ActionButton>
            {pushToken && <div className="token-panel"><span>FCM DEVICE TOKEN</span><code>{pushToken}</code></div>}
            {pushMessage && <div className="data-panel"><DataRow label="Última notificación" value={pushMessage.title} /><DataRow label="Mensaje" value={pushMessage.body} /></div>}
            <p className="small-note">Para probar push necesitas Firebase configurado, archivos nativos y un dispositivo físico. El navegador no genera un token FCM nativo.</p>
          </>
        )
      default:
        return null
    }
  }

  return (
    <IonPage>
      <IonHeader className="detail-header">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/" text="Instrumentos" /></IonButtons>
          <span className="toolbar-brand">SENSOR<span>LAB</span></span>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="detail-frame">
          <div className="detail-heading">
            <div className={`detail-icon accent-${capability.color}`}><IonIcon icon={capability.icon} /></div>
            <div>
              <p className="eyebrow">MÓDULO {capability.number} / 08</p>
              <h1>{capability.title}</h1>
              <p className="plugin-name">{capability.plugin}</p>
            </div>
          </div>
          <section className="tool-surface">
            <div className="tool-surface-heading"><span>CONSOLA DEL SENSOR</span><span>CAPACITOR API</span></div>
            {renderTool()}
            {busy && <p className="feedback feedback-neutral">Conectando con el dispositivo…</p>}
            {notice && <p className="feedback feedback-success"><IonIcon icon={checkmarkCircleOutline} />{notice}</p>}
            {error && <p className="feedback feedback-error"><IonIcon icon={closeCircleOutline} />{error}</p>}
          </section>
          <div className="detail-footnote"><span>Sensor Lab · UAO</span><span>Challenge 07</span></div>
        </div>
      </IonContent>
    </IonPage>
  )
}