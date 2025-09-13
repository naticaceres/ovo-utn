import AdminCrud from './AdminCrud';
import {
  listLocalities,
  createLocality,
  updateLocality,
  deactivateLocality,
} from '../../services/admin';

export default function LocalidadesPage() {
  return (
    <AdminCrud
      title='Localidad'
      list={listLocalities}
      create={createLocality}
      update={updateLocality}
      deactivate={deactivateLocality}
    />
  );
}
