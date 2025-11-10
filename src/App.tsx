import { AppRoutes } from '@/routes/AppRoutes';
import './App.css';
import { ToastProvider } from './components/ui/toast/ToastProvider';
import ApiGlobalHandler from './components/ApiGlobalHandler';
import { GoogleOAuthProvider } from '@react-oauth/google';

// TODO: Mover el CLIENT_ID a variables de entorno
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <ApiGlobalHandler />
        <AppRoutes />
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
