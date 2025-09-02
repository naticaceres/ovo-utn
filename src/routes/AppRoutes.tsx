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
    element: <AppLayoutWrapper />, // Asegura que AuthProvider envuelva AppLayout
    children: [
      { path: 'questionnaire', element: <QuestionnairePage /> },
      { path: 'results', element: <ResultsPage /> },
      { path: 'student', element: <StudentHomePage /> },
    ],
  },
  {
    path: '/contact',
    element: <Contacto />,
  },
]);

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
