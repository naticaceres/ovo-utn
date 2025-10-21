import { Link } from 'react-router-dom';
import styles from './GlobalFooter.module.css';

export function GlobalFooter() {
  return (
    <footer className={styles.globalFooter}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link to='/legal' className={styles.footerLink}>
            Aviso legal
          </Link>
          <Link to='/terms' className={styles.footerLink}>
            Términos y condiciones
          </Link>
          <Link to='/privacy' className={styles.footerLink}>
            Políticas de privacidad
          </Link>
          <Link to='/contact' className={styles.footerLink}>
            Contacto
          </Link>
        </div>
        <div className={styles.copyright}>© 2025 OVO</div>
      </div>
    </footer>
  );
}
