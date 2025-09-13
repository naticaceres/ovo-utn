import AdminCrud from './AdminCrud';
import {
  listGenders,
  createGender,
  updateGender,
  deactivateGender,
} from '../../services/admin';

export default function GenerosPage() {
  return (
    <AdminCrud
      title='Género'
      list={listGenders}
      create={createGender}
      update={updateGender}
      deactivate={deactivateGender}
    />
  );
}
