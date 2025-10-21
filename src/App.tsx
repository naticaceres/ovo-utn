import { AppRoutes } from '@/routes/AppRoutes';
import './App.css';
import { ToastProvider } from './components/ui/toast/ToastProvider';
import ApiGlobalHandler from './components/ApiGlobalHandler';

function App() {
  return (
    <ToastProvider>
      <ApiGlobalHandler />
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
