import { IonIcon, IonText } from '@ionic/react';
import { cloudOfflineOutline, wifiOutline } from 'ionicons/icons';
import { useNetwork } from '../hooks/useNetwork';

const NetworkStatus = () => {
  const { isOnline, connectionType } = useNetwork();
  return <div className={`network-status ${isOnline ? 'online' : 'offline'}`}><IonIcon icon={isOnline ? wifiOutline : cloudOfflineOutline} /><IonText>{isOnline ? `Conectado${connectionType ? ` · ${connectionType}` : ''}` : 'Sin conexion'}</IonText></div>;
};

export default NetworkStatus;
