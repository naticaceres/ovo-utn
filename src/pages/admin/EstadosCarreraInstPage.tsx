import AdminCrud from './AdminCrud';
import {
  listCareerStates,
  createCareerState,
  updateCareerState,
  deactivateCareerState,
} from '../../services/admin';

export default function EstadosCarreraInstPage() {
  return (
    <AdminCrud
      title='Estado de carrera institución'
      list={listCareerStates}
      create={createCareerState}
      update={updateCareerState}
      deactivate={deactivateCareerState}
    />
  );
}
