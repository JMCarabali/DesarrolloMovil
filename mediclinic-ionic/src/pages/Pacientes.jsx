import { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';

const PACIENTES_INICIALES = [
  { id: 1, nombre: 'Laura Gomez', cc: '1002003000' },
  { id: 2, nombre: 'Carlos Perez', cc: '1003004000' },
  { id: 3, nombre: 'Ana Torres', cc: '1004005000' },
];

function Pacientes() {
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('ionic_pacientes'));
    if (guardados) {
      setPacientes(guardados);
    } else {
      setPacientes(PACIENTES_INICIALES);
      localStorage.setItem('ionic_pacientes', JSON.stringify(PACIENTES_INICIALES));
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pacientes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {pacientes.map((p) => (
            <IonItem key={p.id}>
              <IonLabel>
                <h2>{p.nombre}</h2>
                <p>CC: {p.cc}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}

export default Pacientes;