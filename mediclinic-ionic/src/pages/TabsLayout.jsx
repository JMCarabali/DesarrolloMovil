import { Navigate, Route, Routes } from 'react-router-dom';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { calendarOutline, peopleOutline, personCircleOutline } from 'ionicons/icons';

import Visitas from './Visitas';
import VisitaDetail from './VisitaDetail';
import Pacientes from './Pacientes';
import Perfil from './Perfil';

function TabsLayout({ onLogout }) {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Routes>
          <Route path="visitas" element={<Visitas />} />
          <Route path="visitas/:id" element={<VisitaDetail />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="perfil" element={<Perfil onLogout={onLogout} />} />
          <Route path="*" element={<Navigate to="visitas" />} />
        </Routes>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="visitas" href="/app/visitas">
          <IonIcon icon={calendarOutline} />
          <IonLabel>Visitas</IonLabel>
        </IonTabButton>
        <IonTabButton tab="pacientes" href="/app/pacientes">
          <IonIcon icon={peopleOutline} />
          <IonLabel>Pacientes</IonLabel>
        </IonTabButton>
        <IonTabButton tab="perfil" href="/app/perfil">
          <IonIcon icon={personCircleOutline} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}

export default TabsLayout;