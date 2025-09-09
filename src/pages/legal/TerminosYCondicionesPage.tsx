import styles from './Contacto.module.css';
import { MainLayout } from '../../components/layout/MainLayout';

export function TermsContent() {
  return (
    <div className={styles.contactContainer}>
      <div className={styles.content}>
        <div className={styles.textSection}>
          <h1 className={styles.title}>Terminos y Condiciones</h1>

          <h2>
            1. <b>Objeto</b>
          </h2>
          <p>
            OVO (“la Plataforma”) es un sistema de orientación vocacional en
            línea que pone a disposición de sus usuarios cuestionarios,
            resultados personalizados y enlaces a instituciones educativas.
          </p>

          <h2>
            2. <b>Alcance del servicio</b>
          </h2>
          <p>
            La Plataforma presta un servicio de carácter informativo y
            orientativo, sin carácter vinculante.
          </p>
          <p>
            El acceso y uso del sistema está sujeto a estos Términos y
            Condiciones.
          </p>

          <h2>
            3. <b>Usuarios</b>
          </h2>
          <p>Podrán registrarse personas mayores de 13 años.</p>
          <p>
            El usuario garantiza que toda la información aportada es verdadera y
            actual.
          </p>

          <h2>
            4. <b>Propiedad intelectual</b>
          </h2>
          <p>
            OVO y sus contenidos (textos, gráficos, software) están protegidos
            por la Ley 11.723.
          </p>
          <p>
            Queda prohibida la reproducción, distribución o comunicación pública
            sin autorización.
          </p>

          <h2>
            5. <b>Obligaciones del usuario</b>
          </h2>
          <p>
            No publicar contenidos ilícitos, discriminatorios o contrarios a la
            normativa.
          </p>
          <p>No interferir con el funcionamiento técnico de la Plataforma.</p>

          <h2>
            6. <b>Responsabilidad</b>
          </h2>
          <p>
            La plataforma no será responsable por decisiones tomadas únicamente
            con base en los resultados.
          </p>
          <p>
            El usuario exime a la plataforma de reclamaciones derivadas de uso
            indebido.
          </p>

          <h2>
            7. <b>Modificaciones</b>
          </h2>
          <p>
            La plataforma podrá actualizar estos términos; los cambios se
            notificarán por la misma.
          </p>
          <p>El uso continuado implica aceptación de las nuevas versiones.</p>

          <h2>
            8. <b>Legislación aplicable y jurisdicción</b>
          </h2>
          <p>Ley 25.326 (Protección de Datos Personales).</p>
          <p>
            Para toda controversia, serán competentes los tribunales de la
            Ciudad de Mendoza, República Argentina.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TerminosYCondiciones() {
  return (
    <MainLayout>
      <TermsContent />
    </MainLayout>
  );
}
