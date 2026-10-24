import { IonContent, IonIcon, IonPage } from '@ionic/react'
import { arrowForward, hardwareChipOutline } from 'ionicons/icons'
import { Link } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { capabilities } from '../data/capabilities.js'

export default function HomePage() {
  const platform = Capacitor.isNativePlatform()
    ? Capacitor.getPlatform()
    : 'vista web'

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="app-frame">
          <header className="topbar">
            <Link className="brand" to="/" aria-label="Sensor Lab, inicio">
              <span className="brand-mark"><IonIcon icon={hardwareChipOutline} /></span>
              <span>SENSOR<span className="brand-light">LAB</span></span>
            </Link>
            <div className="platform-indicator">
              <span className="status-dot" />
              <span>{platform}</span>
            </div>
          </header>

          <main>
            <section className="hero-panel">
              <div className="hero-copy">
                <p className="eyebrow">DESARROLLO MÓVIL / CHALLENGE 07</p>
                <h1>El teléfono,<br /><em>en movimiento.</em></h1>
                <p className="hero-description">
                  Explora los sensores y servicios nativos desde una sola app.
                  Elige una herramienta para empezar.
                </p>
                <a className="hero-link" href="#instrumentos">
                  Explorar instrumentos <span aria-hidden="true">↓</span>
                </a>
              </div>
              <div className="device-diagram" aria-hidden="true">
                <div className="diagram-coordinate">03 / 08</div>
                <div className="device-ring ring-one" />
                <div className="device-ring ring-two" />
                <div className="device-core"><IonIcon icon={hardwareChipOutline} /></div>
                <span className="diagram-axis axis-x">X</span>
                <span className="diagram-axis axis-y">Y</span>
                <span className="diagram-axis axis-z">Z</span>
                <div className="diagram-caption">CAPACITOR SENSOR ARRAY</div>
              </div>
            </section>

            <section className="instrument-section" id="instrumentos">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">SUITE DE PRUEBAS</p>
                  <h2>Instrumentos</h2>
                </div>
                <span className="item-count">08 MÓDULOS</span>
              </div>

              <div className="capability-grid">
                {capabilities.map((capability) => (
                  <Link
                    className={`capability-link accent-${capability.color}`}
                    key={capability.id}
                    to={`/${capability.id}`}
                  >
                    <span className="capability-number">{capability.number}</span>
                    <span className="capability-icon">
                      <IonIcon icon={capability.icon} />
                    </span>
                    <span className="capability-copy">
                      <strong>{capability.title}</strong>
                      <small>{capability.subtitle}</small>
                    </span>
                    <IonIcon className="capability-arrow" icon={arrowForward} />
                  </Link>
                ))}
              </div>
            </section>
          </main>

          <footer className="app-footer">
            <span>UAO · PLATAFORMAS MÓVILES</span>
            <span>REACT + IONIC + CAPACITOR</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  )
}