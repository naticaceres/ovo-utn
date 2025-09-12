import AdminCrud from './AdminCrud';
import {
  listModalities,
  createModality,
  updateModality,
  deactivateModality,
} from '../../services/admin';

export default function ModalidadesPage() {
  return (
    <AdminCrud
      title='Modalidad de carrera'
      list={listModalities}
      create={createModality}
      update={updateModality}
      deactivate={deactivateModality}
    />
  );
}
