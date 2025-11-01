import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/toast/useToast';
import { createManualBackup } from '../../services/backup';
import styles from './CrearBackupPage.module.css';

interface BackupResult {
  message: string;
  archivo: string;
  tamano: string;
}

export default function CrearBackupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const result = await createManualBackup();
      setBackupResult(result);
      showToast('¡Backup creado exitosamente!', { variant: 'success' });
      setShowConfirmModal(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error al crear backup:', error);
      showToast(err?.response?.data?.message || 'Error al crear el backup', {
        variant: 'error',
      });
      setShowConfirmModal(false);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    navigate('/app/admin/backups');
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>💾 Crear Backup Manual</h1>
        <p className={styles.subtitle}>
          Crea una copia de seguridad inmediata de la base de datos
        </p>
      </div>

      {backupResult ? (
        // Resultado exitoso
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>¡Backup creado exitosamente!</h2>
          <div className={styles.resultInfo}>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>Archivo generado:</div>
              <div className={styles.resultValue}>{backupResult.archivo}</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>Tamaño:</div>
              <div className={styles.resultValue}>{backupResult.tamano}</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>Mensaje:</div>
              <div className={styles.resultValue}>{backupResult.message}</div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant='primary' onClick={handleClose}>
              Volver a Backups
            </Button>
          </div>
        </div>
      ) : (
        // Formulario de creación
        <div className={styles.card}>
          <div className={styles.infoSection}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div>
              <h3 className={styles.infoTitle}>Acerca del Backup Manual</h3>
              <ul className={styles.infoList}>
                <li>
                  Se creará una copia de seguridad completa de la base de datos
                </li>
                <li>
                  El proceso puede tardar varios minutos dependiendo del tamaño
                  de la base de datos
                </li>
                <li>
                  El archivo de backup se guardará automáticamente en el
                  servidor
                </li>
                <li>El backup estará disponible para restauración posterior</li>
              </ul>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningIcon}>⚠️</div>
            <div>
              <h3 className={styles.warningTitle}>Recomendaciones</h3>
              <ul className={styles.warningList}>
                <li>
                  Realiza backups manuales antes de cambios importantes en el
                  sistema
                </li>
                <li>
                  No cierres esta ventana hasta que el proceso haya terminado
                </li>
                <li>
                  Verifica que haya suficiente espacio en disco en el servidor
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.actionSection}>
            <Button
              variant='outline'
              onClick={() => navigate('/app/admin/backups')}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              onClick={() => setShowConfirmModal(true)}
              disabled={creating}
            >
              {creating ? 'Creando Backup...' : '💾 Crear Backup Ahora'}
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !creating && setShowConfirmModal(false)}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>💾 Confirmar Creación de Backup</h2>
            </div>
            <div className={styles.modalBody}>
              <p>
                ¿Está seguro de que desea crear un backup manual de la base de
                datos?
              </p>
              <p className={styles.modalInfo}>
                Este proceso creará una copia completa de la base de datos
                actual. El tiempo de ejecución dependerá del tamaño de los
                datos.
              </p>
            </div>
            <div className={styles.modalActions}>
              <Button
                variant='outline'
                onClick={() => setShowConfirmModal(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={handleCreateBackup}
                disabled={creating}
              >
                {creating ? 'Creando...' : 'Sí, Crear Backup'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
