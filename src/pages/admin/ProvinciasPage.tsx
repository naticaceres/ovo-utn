import AdminCrud from './AdminCrud';
import {
  listProvinces,
  createProvince,
  updateProvince,
  deactivateProvince,
} from '../../services/admin';

export default function ProvinciasPage() {
  return (
    <AdminCrud
      title='Provincia'
      list={listProvinces}
      create={createProvince}
      update={updateProvince}
      deactivate={deactivateProvince}
    />
  );
}
