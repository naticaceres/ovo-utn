import styles from './Contacto.module.css';
import { MainLayout } from '../../components/layout/MainLayout';

export default function PoliticasDePrivacidad() {
  return (
    <MainLayout>
      <div className={styles.contactContainer}>
        <div className={styles.content}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>Políticas de Privacidad</h1>
            <h2>
              1. <b>Responsable del tratamiento</b>
            </h2>
            <p>Plataforma OVO – Proyecto OVO</p>
            <p>Contacto: ovo.app.legal@gmail.com</p>

            <h2>
              2. <b>Datos que recabamos</b>
            </h2>
            <p>
              <strong>Registro:</strong> nombre, apellido, e-mail, contraseña
              (encriptada), fecha de nacimiento, género. Si es una institución
              además se solicitará: Cuit, dirección, año de fundación, teléfono,
              código postal, sitio web.
            </p>
            <p>
              <strong>Uso de la Plataforma:</strong> respuestas de test,
              historial de resultados, fecha y hora de acceso, ingreso de
              información institucional y carreras.
            </p>
            <p>
              <strong>Datos técnicos (cookies):</strong> IP, tipo de navegador,
              interacciones básicas en la sesión.
            </p>

            <h2>
              3. <b>Finalidad del tratamiento</b>
            </h2>
            <p>Proveer y mejorar el servicio de orientación vocacional.</p>
            <p>Personalizar resultados y recomendaciones.</p>
            <p>
              Enviar comunicaciones relacionadas con las instituciones y
              carreras (novedades, actualizaciones).
            </p>

            <h2>
              4. <b>Base legal</b>
            </h2>
            <p>Consentimiento libre e informado (Ley 25.326).</p>
            <p>
              Cumplimiento de una obligación contractual y legítimo interés para
              mejorar la plataforma.
            </p>

            <h2>
              5. <b>Cesión a terceros</b>
            </h2>
            <p>No vendemos tus datos.</p>
            <p>
              Podemos compartir información agregada o anonimizada con
              universidades o partners educativos, siempre sin identificación
              personal.
            </p>
            <p>
              Si en el futuro se comparte información personal, solicitaremos
              autorización expresa.
            </p>

            <h2>
              6. <b>Derechos del titular</b>
            </h2>
            <p>
              Acceder, rectificar, suprimir o limitar el tratamiento de tus
              datos.
            </p>
            <p>Derecho al “olvido” o portabilidad.</p>
            <p>
              Para ejercerlos, escribe a ovo.app.legal@gmail.com; te
              responderemos en un plazo máximo de 15 días hábiles.
            </p>

            <h2>
              7. <b>Conservación</b>
            </h2>
            <p>
              Tus datos se retendrán mientras mantengas tu cuenta activa y luego
              se anonimizarán en un plazo no mayor a 6 meses, salvo obligaciones
              legales en contrario.
            </p>

            <h2>
              8. <b>Seguridad</b>
            </h2>
            <p>Encriptación SSL para transmisión de datos.</p>
            <p>Contraseñas almacenadas con hashing (bcrypt).</p>
            <p>Backups periódicos y control de accesos con AWS IAM.</p>

            <h2>
              9. <b>Cookies y tecnologías similares</b>
            </h2>
            <p>Usamos cookies estrictamente necesarias.</p>
            <p>No almacenamos datos sensibles en cookies.</p>
            <p>
              Puedes deshabilitarlas desde la configuración de tu navegador,
              aunque esto puede afectar el funcionamiento.
            </p>

            <h2>
              10. <b>Menores de edad</b>
            </h2>
            <p>El sistema no está diseñado para menores de 13 años.</p>
            <p>Si detectamos un usuario menor, cerraremos la cuenta.</p>

            <h2>
              11. <b>Cambios en la política</b>
            </h2>
            <p>
              Podremos actualizar esta Política; la versión vigente estará
              siempre.
            </p>
            <p>Te notificaremos cambios importantes vía e-mail.</p>

            <h2>
              12. <b>Contacto y consultas</b>
            </h2>
            <p>Dudas o reclamos sobre privacidad: ovo.app.legal@gmail.com</p>
            <p>
              Domicilio: Ciudad de Mendoza, Provincia de Mendoza, Argentina.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
