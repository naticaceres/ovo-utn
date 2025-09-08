import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

export function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      className={styles.backBtn}
      type='button'
      aria-label='Volver'
      onClick={() => navigate(-1)}
    >
      <span className={styles.arrow}>&larr;</span>
    </button>
  );
}
