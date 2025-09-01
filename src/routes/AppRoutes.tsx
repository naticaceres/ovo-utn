import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/layouts/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { QuestionnairePage } from '@/pages/QuestionnairePage';
import { ResultsPage } from '@/pages/ResultsPage';

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
    element: <AppLayout />,
    children: [
      { path: 'questionnaire', element: <QuestionnairePage /> },
      { path: 'results', element: <ResultsPage /> },
    ],
  },
]);

export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
