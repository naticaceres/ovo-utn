import { AppRoutes } from '@/routes/AppRoutes';
import './App.css';
import { ToastProvider } from './components/ui/toast/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
