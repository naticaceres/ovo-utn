import styles from './Contacto.module.css';
import undrawTerms from '../../assets/undraw_terms_sx63.svg';
import { MainLayout } from '../../components/layout/MainLayout';

export default function AvisoLegal() {
  return (
    <MainLayout>
      <div className={styles.contactContainer}>
        <div className={styles.content}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>AvisoLegal</h1>
            <p className={styles.description}>
              Protección de Datos Personales: Cumplimiento de la Ley 25.326
              (Argentina) y normativas internacionales como GDPR (Europa) o
              PIPEDA (Canadá) en caso de expansión. Consentimiento informado:
              Todos los usuarios deberán aceptar expresamente términos y
              políticas de privacidad antes de interactuar con la plataforma.
              Publicidad Transparente: Las universidades promocionadas deberán
              estar diferenciadas claramente de los resultados del test para no
              inducir a error. Propiedad intelectual: Registro de marca, base de
              datos de preguntas y algoritmo de análisis bajo protección de
              derechos de autor únicamente después de presentado el MVP, de
              requerirse desplegar a producción.
            </p>
          </div>
          <div className={styles.imageSection}>
            <img
              src={undrawTerms}
              alt='Ilustración Legal'
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
