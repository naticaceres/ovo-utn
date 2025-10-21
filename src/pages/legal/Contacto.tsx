import styles from './Contacto.module.css';
import undrawLovingIt from '../../assets/undraw_loving-it_hspq.svg';
import { MainLayout } from '../../components/layout/MainLayout';

export default function Contacto() {
  return (
    <MainLayout>
      <div className={styles.contactContainer}>
        <div className={styles.content}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>Contacto</h1>
            <p className={styles.description}>
              Para contactarnos, escribe al mail <b>ovo.app.legal@gmail.com</b>{' '}
              y recibirás respuestas a la brevedad.
            </p>
          </div>
          <div className={styles.imageSection}>
            <img
              src={undrawLovingIt}
              alt='Ilustración contacto'
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
