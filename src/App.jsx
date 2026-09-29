import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import AuthPage from './pages/AuthPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskEditorPage from './pages/TaskEditorPage';
import TasksPage from './pages/TasksPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';

setupIonicReact();

const App = () => (
  <AuthProvider>
    <TaskProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/tasks/new" element={<ProtectedRoute><TaskEditorPage /></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
            <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskEditorPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </TaskProvider>
  </AuthProvider>
);

export default App;