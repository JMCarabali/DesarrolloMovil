import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

export const useNetwork = () => {
  const [status, setStatus] = useState({ connected: navigator.onLine, connectionType: null });

  useEffect(() => {
    let listener;
    const loadStatus = async () => setStatus(await Network.getStatus());
    loadStatus();
    Network.addListener('networkStatusChange', setStatus).then((handle) => { listener = handle; });
    return () => { listener?.remove(); };
  }, []);

  return { isOnline: status.connected, connectionType: status.connectionType };
};
