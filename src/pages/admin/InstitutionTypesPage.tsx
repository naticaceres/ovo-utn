import AdminCrud from './AdminCrud';
import {
  listInstitutionTypes,
  createInstitutionType,
  updateInstitutionType,
  deactivateInstitutionType,
} from '../../services/admin';

export default function InstitutionTypesPage() {
  return (
    <AdminCrud
      title='Tipo de Institución'
      list={listInstitutionTypes}
      create={createInstitutionType}
      update={updateInstitutionType}
      deactivate={deactivateInstitutionType}
    />
  );
}
