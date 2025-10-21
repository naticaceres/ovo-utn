import AdminCrud from './AdminCrud';
import {
  listInstitutionStates,
  createInstitutionState,
  updateInstitutionState,
  deactivateInstitutionState,
} from '../../services/admin';

export default function InstitutionStatesPage() {
  return (
    <AdminCrud
      title='Estado de Institución'
      list={listInstitutionStates}
      create={createInstitutionState}
      update={updateInstitutionState}
      deactivate={deactivateInstitutionState}
    />
  );
}
