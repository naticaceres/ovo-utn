import AdminCrud from './AdminCrud';
import {
  listCountries,
  createCountry,
  updateCountry,
  deactivateCountry,
} from '../../services/admin';

export default function PaisesPage() {
  return (
    <AdminCrud
      title='País'
      list={listCountries}
      create={createCountry}
      update={updateCountry}
      deactivate={deactivateCountry}
    />
  );
}
