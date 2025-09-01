import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import { MainLayout } from '../components/layout/MainLayout';

export function HomePage() {
  return (
    <MainLayout>
      <div className={styles.homePage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.mainTitle}>Explorá tu vocación con OVO</h1>
            <p className={styles.subtitle}>
              Tu camino profesional empieza aquí.
            </p>
            <Link to='/app/questionnaire' className={styles.ctaButton}>
              Hacer Test sin cuenta
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresContent}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width='48' height='48' viewBox='0 0 48 48' fill='none'>
                  <path
                    d='M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM24 40C15.18 40 8 32.82 8 24C8 15.18 15.18 8 24 8C32.82 8 40 15.18 40 24C40 32.82 32.82 40 24 40Z'
                    fill='#EC4899'
                  />
                  <path
                    d='M24 12C17.37 12 12 17.37 12 24C12 30.63 17.37 36 24 36C30.63 36 36 30.63 36 24C36 17.37 30.63 12 24 12Z'
                    fill='#EC4899'
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Test adaptativos</h3>
              <p className={styles.featureDescription}>
                Preguntas que se adaptan a tus respuestas
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width='48' height='48' viewBox='0 0 48 48' fill='none'>
                  <circle cx='24' cy='24' r='20' fill='#EF4444' />
                  <circle cx='24' cy='24' r='8' fill='white' />
                  <path
                    d='M24 8L28 20H40L30 28L34 40L24 32L14 40L18 28L8 20H20L24 8Z'
                    fill='white'
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Resultados personalizados</h3>
              <p className={styles.featureDescription}>
                Informe detallado de tus áreas de afinidad
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width='48' height='48' viewBox='0 0 48 48' fill='none'>
                  <path d='M24 4L44 16V32L24 44L4 32V16L24 4Z' fill='#8B5CF6' />
                  <path
                    d='M24 12L36 20V28L24 36L12 28V20L24 12Z'
                    fill='white'
                  />
                  <circle cx='24' cy='24' r='4' fill='#8B5CF6' />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Vinculación educativa</h3>
              <p className={styles.featureDescription}>
                Conexión con universidades e institutos
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={styles.howItWorks}>
          <div className={styles.howItWorksContent}>
            <h2 className={styles.howItWorksTitle}>¿Cómo funciona?</h2>
            <ol className={styles.stepsList}>
              <li className={styles.step}>Completá el test vocacional.</li>
              <li className={styles.step}>Descubrí tus áreas de afinidad.</li>
              <li className={styles.step}>Explorá carreras e instituciones.</li>
            </ol>
          </div>
        </section>

        {/* Institution CTA Section */}
        <section className={styles.institutionCTA}>
          <div className={styles.institutionCTAContent}>
            <p className={styles.institutionQuestion}>
              ¿Eres una institución educativa interesada?
            </p>
            <Link to='/institution-signup' className={styles.institutionButton}>
              Registrarte como institución
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
