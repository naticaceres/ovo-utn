import AdminCrud from './AdminCrud';
import {
  listActionTypes,
  createActionType,
  updateActionType,
  deactivateActionType,
} from '../../services/admin';

export default function ActionTypesPage() {
  return (
    <AdminCrud
      title='Tipos de Acciones'
      list={listActionTypes}
      create={createActionType}
      update={updateActionType}
      deactivate={deactivateActionType}
    />
  );
}
