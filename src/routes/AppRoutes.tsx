import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayoutWrapper } from '@/layouts/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { QuestionnairePage } from '@/pages/questionnaire/QuestionnairePage';
import { ResultsPage } from '@/pages/questionnaire/ResultsPage';
import StudentHomePage from '../pages/student/StudentHomePage';
import Contacto from '../pages/legal/Contacto';
import AvisoLegal from '../pages/legal/AvisoLegalPage';
import TerminosYCondiciones from '../pages/legal/TerminosYCondicionesPage';
import PoliticasDePrivacidad from '../pages/legal/PoliticasDePrivacidadPage';
import AdminHomePage from '../pages/admin/AdminHomePage';
import InstitucionHomePage from '../pages/institucion/InstitucionHomePage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/app/login',
    element: <LoginPage />,
  },
  {
    path: '/app/signup',
    element: <SignupPage />,
  },
  {
    path: '/app',
    element: <AppLayoutWrapper />,
    children: [
      { path: 'questionnaire', element: <QuestionnairePage /> },
      { path: 'results', element: <ResultsPage /> },
      { path: 'student', element: <StudentHomePage /> },
      { path: 'admin', element: <AdminHomePage /> },
      { path: 'institucion', element: <InstitucionHomePage /> },
    ],
  },
  {
    path: '/contact',
    element: <Contacto />,
  },
  {
    path: '/legal',
    element: <AvisoLegal />,
  },
  {
    path: '/terms',
    element: <TerminosYCondiciones />,
  },
  {
    path: '/privacy',
    element: <PoliticasDePrivacidad />,
  },
]);

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
