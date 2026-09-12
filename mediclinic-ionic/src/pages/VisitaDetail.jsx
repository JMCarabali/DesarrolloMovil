import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonItem, IonLabel, IonButton } from '@ionic/react';

const SIGUIENTE_ESTADO = { pendiente: 'en_camino', en_camino: 'finalizada', finalizada: null };
const TEXTO_ESTADO = { pendiente: 'Pendiente', en_camino: 'En camino', finalizada: 'Finalizada' };

function VisitaDetail() {
  const { id } = useParams();
  const [visita, setVisita] = useState(null);

  useEffect(() => {
    const visitas = JSON.parse(localStorage.getItem('ionic_visitas')) || [];
    setVisita(visitas.find((v) => String(v.id) === id) || null);
  }, [id]);

  const avanzarEstado = () => {
    const siguiente = SIGUIENTE_ESTADO[visita.estado];
    if (!siguiente) return;

    const visitas = JSON.parse(localStorage.getItem('ionic_visitas')) || [];
    const actualizadas = visitas.map((v) => (v.id === visita.id ? { ...v, estado: siguiente } : v));

    localStorage.setItem('ionic_visitas', JSON.stringify(actualizadas));
    setVisita({ ...visita, estado: siguiente });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/visitas" />
          </IonButtons>
          <IonTitle>Detalle de visita</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {visita ? (
          <>
            <IonItem>
              <IonLabel>
                <h2>{visita.paciente}</h2>
                <p>Hora: {visita.hora}</p>
                <p>Estado actual: {TEXTO_ESTADO[visita.estado]}</p>
              </IonLabel>
            </IonItem>

            {SIGUIENTE_ESTADO[visita.estado] ? (
              <IonButton expand="block" className="ion-margin-top" onClick={avanzarEstado}>
                Cambiar a "{TEXTO_ESTADO[SIGUIENTE_ESTADO[visita.estado]]}"
              </IonButton>
            ) : (
              <p className="ion-margin-top">Esta visita ya fue finalizada.</p>
            )}
          </>
        ) : (
          <p>No se encontró la visita.</p>
        )}
      </IonContent>
    </IonPage>
  );
}

export default VisitaDetail;