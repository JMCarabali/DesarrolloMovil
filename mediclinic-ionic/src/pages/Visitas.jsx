// src/pages/Visitas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge } from '@ionic/react';

const VISITAS_INICIALES = [
  { id: 1, paciente: 'Laura Gomez', hora: '09:00', estado: 'pendiente' },
  { id: 2, paciente: 'Carlos Perez', hora: '10:30', estado: 'en_camino' },
  { id: 3, paciente: 'Ana Torres', hora: '11:15', estado: 'finalizada' },
];

const colorPorEstado = { pendiente: 'warning', en_camino: 'primary', finalizada: 'success' };

function Visitas() {
  const [visitas, setVisitas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const guardadas = JSON.parse(localStorage.getItem('ionic_visitas'));
    if (guardadas) {
      setVisitas(guardadas);
    } else {
      setVisitas(VISITAS_INICIALES);
      localStorage.setItem('ionic_visitas', JSON.stringify(VISITAS_INICIALES));
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Visitas de hoy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {visitas.map((v) => (
            <IonItem key={v.id} button onClick={() => navigate(`/app/visitas/${v.id}`)}>
              <IonLabel>
                <h2>{v.paciente}</h2>
                <p>{v.hora}</p>
              </IonLabel>
              <IonBadge color={colorPorEstado[v.estado]} slot="end">
                {v.estado}
              </IonBadge>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}

export default Visitas;