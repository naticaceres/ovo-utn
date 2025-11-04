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
import AdminCategoryPage from '../pages/admin/AdminCategoryPage';
import CareerTypesPage from '../pages/admin/CareerTypesPage';
import AdminItemPage from '../pages/admin/AdminItemPage';
import PaisesPage from '../pages/admin/PaisesPage';
import ProvinciasPage from '../pages/admin/ProvinciasPage';
import LocalidadesPage from '../pages/admin/LocalidadesPage';
import GenerosPage from '../pages/admin/GenerosPage';
import ActionTypesPage from '../pages/admin/ActionTypesPage';
import AptitudesPage from '../pages/admin/AptitudesPage';
import BackupConfigPage from '../pages/admin/BackupConfigPage';
import RestoreBackupPage from '../pages/admin/RestoreBackupPage';
import ConsultarBackupsPage from '../pages/admin/ConsultarBackupsPage';
import CrearBackupPage from '../pages/admin/CrearBackupPage';
import StatsDashboardPage from '../pages/admin/StatsDashboardPage';
import SystemUsageStatsPage from '../pages/admin/SystemUsageStatsPage';
import UserBehaviorStatsPage from '../pages/admin/UserBehaviorStatsPage';
import InstitucionHomePage from '../pages/institucion/InstitucionHomePage';
import ProfilePageInstitucion from '../pages/institucion/ProfilePageInstitucion';
import InstitutionSignupPage from '@/pages/institucion/InstitutionSignupPage';
import ProfilePage from '../pages/student/ProfilePage';
import ConsultarCarrerasPage from '../pages/institucion/ConsultarCarrerasPage';
import DetalleCarreraPage from '../pages/institucion/DetalleCarreraPage';
import DetalleInstitucionPage from '../pages/institucion/DetalleInstitucionPage';
import ConsultarInstitucionPage from '../pages/institucion/ConsultarInstitucionPage';
import MisCarrerasPage from '../pages/institucion/MisCarrerasPage';
import InstitucionEstadisticas from '../pages/institucion/InstitucionEstadisticas';
import EstadisticasPage from '../pages/student/EstadisticasPage';
import FavoriteCareersPage from '../pages/student/FavoriteCareersPage';
import DetalleCarreraInstitucionPage from '../pages/student/DetalleCarreraInstitucionPage';
import { TestsHistoryPage } from '../pages/student/TestsHistoryPage';
import { AdminRoute } from '../components/AdminRoute';
import DebugPermissionsPage from '../pages/admin/DebugPermissionsPage';

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
    path: '/institution-signup',
    element: <InstitutionSignupPage />,
  },
  {
    path: '/app',
    element: <AppLayoutWrapper />,
    children: [
      { path: 'questionnaire', element: <QuestionnairePage /> },
      { path: 'results', element: <ResultsPage /> },
      { path: 'student', element: <StudentHomePage /> },
      { path: 'student/tests', element: <TestsHistoryPage /> },
      { path: 'student/tests/:testId', element: <ResultsPage /> },
      { path: 'student/favorites', element: <FavoriteCareersPage /> },
      {
        path: 'student/carrera-detalle/:carreraInstitucionId',
        element: <DetalleCarreraInstitucionPage />,
      },
      {
        path: 'student/carrera-institucion/:careerId/:institutionId',
        element: <DetalleCarreraInstitucionPage />,
      },
      { path: 'careers', element: <ConsultarCarrerasPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'statistics', element: <EstadisticasPage /> },
      { path: 'debug-permissions', element: <DebugPermissionsPage /> },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminHomePage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/career-types',
        element: (
          <AdminRoute>
            <CareerTypesPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/parametros/abm-paises',
        element: (
          <AdminRoute>
            <PaisesPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/parametros/abm-provincias',
        element: (
          <AdminRoute>
            <ProvinciasPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/parametros/abm-localidades',
        element: (
          <AdminRoute>
            <LocalidadesPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/parametros/abm-generos',
        element: (
          <AdminRoute>
            <GenerosPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/parametros/abm-tipos-acciones',
        element: (
          <AdminRoute>
            <ActionTypesPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/parametros/abm-aptitudes',
        element: (
          <AdminRoute>
            <AptitudesPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/backups/abm-config-backup',
        element: (
          <AdminRoute>
            <BackupConfigPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/backups/restaurar-backup',
        element: (
          <AdminRoute>
            <RestoreBackupPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/backups/consultar-backups',
        element: (
          <AdminRoute>
            <ConsultarBackupsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/backups/crear-backup',
        element: (
          <AdminRoute>
            <CrearBackupPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/estadisticas/tablero-estadisticas',
        element: (
          <AdminRoute>
            <StatsDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/estadisticas/uso-funcionamiento',
        element: (
          <AdminRoute>
            <SystemUsageStatsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/estadisticas/comportamiento-usuarios',
        element: (
          <AdminRoute>
            <UserBehaviorStatsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/:categoryId',
        element: (
          <AdminRoute>
            <AdminCategoryPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/:categoryId/:itemId',
        element: (
          <AdminRoute>
            <AdminItemPage />
          </AdminRoute>
        ),
      },
      { path: 'institucion', element: <InstitucionHomePage /> },
      { path: 'institucion/profile', element: <ProfilePageInstitucion /> },
      {
        path: 'institucion/estadisticas',
        element: <InstitucionEstadisticas />,
      },
      { path: 'institucion/mis-carreras', element: <MisCarrerasPage /> },
      { path: 'detalle-carrera', element: <DetalleCarreraPage /> },
      { path: 'detalle-institucion/:id', element: <DetalleInstitucionPage /> },
      { path: 'detalle-institucion', element: <DetalleInstitucionPage /> },
      { path: 'consultar-institucion', element: <ConsultarInstitucionPage /> },
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
