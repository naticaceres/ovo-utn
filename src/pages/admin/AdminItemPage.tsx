import { useParams } from 'react-router-dom';
import CareerTypesPage from './CareerTypesPage';
import ModalidadesPage from './ModalidadesPage';
import EstadosCarreraInstPage from './EstadosCarreraInstPage';
import CarrerasBasePage from './CarrerasBasePage';
import SolicitudesInstitucionPage from './SolicitudesInstitucionPage';
import InstitutionTypesPage from './InstitutionTypesPage';
import InstitutionStatesPage from './InstitutionStatesPage';
import UsuariosPage from './UsuariosPage';
import PermisosPage from './PermisosPage';
import UserStatesPage from './UserStatesPage';
import GruposPage from './GruposPage';
import UserPermissionsPage from './UserPermissionsPage';
import AccessHistoryPage from './AccessHistoryPage';
import SystemAuditPage from './SystemAuditPage';
import AdminCategoryPage from './AdminCategoryPage';

export default function AdminItemPage() {
  const { categoryId, itemId } = useParams<{
    categoryId: string;
    itemId: string;
  }>();

  if (!categoryId || !itemId) return null;

  // Map known itemIds to dedicated pages
  if (categoryId === 'carreras' && itemId === 'abm-tipos-carrera') {
    return <CareerTypesPage />;
  }

  if (categoryId === 'carreras' && itemId === 'abm-carreras-base') {
    return <CarrerasBasePage />;
  }

  if (categoryId === 'carreras' && itemId === 'abm-modalidades-carrera') {
    return <ModalidadesPage />;
  }

  if (categoryId === 'carreras' && itemId === 'abm-estados-carrera-inst') {
    return <EstadosCarreraInstPage />;
  }

  if (
    categoryId === 'instituciones' &&
    itemId === 'solicitudes-instituciones'
  ) {
    return <SolicitudesInstitucionPage />;
  }

  if (categoryId === 'instituciones' && itemId === 'abm-tipos-institucion') {
    return <InstitutionTypesPage />;
  }

  if (categoryId === 'instituciones' && itemId === 'abm-estados-institucion') {
    return <InstitutionStatesPage />;
  }

  if (categoryId === 'seguridad' && itemId === 'gestionar-usuarios') {
    return <UsuariosPage />;
  }

  if (categoryId === 'seguridad' && itemId === 'permisos') {
    return <PermisosPage />;
  }

  if (categoryId === 'seguridad' && itemId === 'asignar-permisos-dinamicos') {
    return <UserPermissionsPage />;
  }

  if (categoryId === 'seguridad' && itemId === 'ver-historial-accesos') {
    return <AccessHistoryPage />;
  }

  if (categoryId === 'seguridad' && itemId === 'abm-estados-usuario') {
    return <UserStatesPage />;
  }

  if (categoryId === 'seguridad' && itemId === 'abm-grupos-usuarios') {
    return <GruposPage />;
  }

  if (categoryId === 'seguridad' && itemId === 'historial-acciones') {
    return <SystemAuditPage />;
  }

  // Fallback: show the category page (user can reselect)
  return <AdminCategoryPage />;
}
