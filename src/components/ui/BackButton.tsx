import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

export function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      className={styles.backBtn}
      type='button'
      aria-label='Volver'
      onClick={() => {
        try {
          // si hay historial, volver atrás; si no, ir a la home de student
          if (window.history.length > 1) navigate(-1);
          else navigate('/app/student');
        } catch {
          navigate('/app/student');
        }
      }}
    >
      <span className={styles.arrow}>&larr;</span>
    </button>
  );
}
