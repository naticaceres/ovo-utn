import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/toast/useToast';
import {
  getBackupFiles,
  restoreBackup,
  type BackupFile,
} from '../../services/backup';
import styles from './RestoreBackupPage.module.css';

export default function RestoreBackupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadBackupFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBackupFiles = async () => {
    try {
      setLoading(true);
      const files = await getBackupFiles();
      setBackupFiles(files);
      if (files.length === 0) {
        showToast('No hay backups disponibles para restaurar', {
          variant: 'info',
        });
      }
    } catch (error) {
      console.error('Error al cargar backups:', error);
      showToast('Error al cargar la lista de backups', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;

    try {
      setRestoring(true);
      await restoreBackup(selectedBackup.id);
      showToast('¡Backup restaurado exitosamente!', { variant: 'success' });
      setShowConfirmModal(false);
      setSelectedBackup(null);

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        navigate('/app/admin/backups');
      }, 2000);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error al restaurar backup:', error);
      showToast(
        err?.response?.data?.message || 'Error al restaurar el backup',
        { variant: 'error' }
      );
    } finally {
      setRestoring(false);
    }
  };

  const sortedBackupFiles = [...backupFiles].sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return dateB.getTime() - dateA.getTime(); // Más reciente primero
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando backups disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>🔄 Restaurar Backup</h1>
        <p className={styles.subtitle}>
          Seleccione un backup para restaurar la base de datos
        </p>
      </div>

      <div className={styles.warningBox}>
        <div className={styles.warningIcon}>⚠️</div>
        <div>
          <h3 className={styles.warningTitle}>¡Atención!</h3>
          <ul className={styles.warningList}>
            <li>
              Esta acción <strong>no se puede deshacer</strong>
            </li>
            <li>Se perderán todos los datos actuales no guardados</li>
            <li>Se recomienda crear un backup antes de restaurar</li>
            <li>El proceso puede tomar varios minutos</li>
          </ul>
        </div>
      </div>

      {backupFiles.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📁</div>
          <h3>No hay backups disponibles</h3>
          <p>No se encontraron archivos de backup para restaurar</p>
          <Button
            variant='outline'
            onClick={() => navigate('/app/admin/backups')}
          >
            Volver
          </Button>
        </div>
      ) : (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>
            Backups Disponibles ({backupFiles.length})
          </h2>
          <div className={styles.backupList}>
            {sortedBackupFiles.map(backup => {
              const isSelected = selectedBackup?.id === backup.id;

              return (
                <div
                  key={backup.id}
                  className={`${styles.backupItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => setSelectedBackup(backup)}
                >
                  <div className={styles.backupIcon}>
                    {isSelected ? '✅' : '💾'}
                  </div>
                  <div className={styles.backupInfo}>
                    <div className={styles.backupDate}>
                      📅 {formatDate(backup.fecha)}
                    </div>
                    <div className={styles.backupTime}>
                      🕐 {formatTime(backup.fecha)}
                    </div>
                    <div className={styles.backupSize}>
                      💾 {backup.tamanoFormateado}
                    </div>
                    <div className={styles.backupFilename}>
                      {backup.directorio}
                    </div>
                  </div>
                  {isSelected && (
                    <div className={styles.selectedBadge}>Seleccionado</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            <Button
              variant='outline'
              onClick={() => navigate('/app/admin/backups')}
              disabled={restoring}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              onClick={() => setShowConfirmModal(true)}
              disabled={!selectedBackup || restoring}
              style={{ backgroundColor: '#dc2626' }}
            >
              {restoring ? 'Restaurando...' : '🔄 Restaurar Backup'}
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && selectedBackup && (
        <div
          className={styles.modalOverlay}
          onClick={() => !restoring && setShowConfirmModal(false)}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>⚠️ Confirmar Restauración</h2>
            </div>
            <div className={styles.modalBody}>
              <p>
                ¿Está seguro de que desea restaurar el backup del{' '}
                <strong>{formatDate(selectedBackup.fecha)}</strong> a las{' '}
                <strong>{formatTime(selectedBackup.fecha)}</strong>?
              </p>
              <p className={styles.modalInfo}>
                Archivo: <strong>{selectedBackup.directorio}</strong>
                <br />
                Tamaño: <strong>{selectedBackup.tamanoFormateado}</strong>
              </p>
              <p className={styles.modalWarning}>
                Esta acción <strong>eliminará todos los datos actuales</strong>{' '}
                y los reemplazará con los datos del backup seleccionado.
              </p>
            </div>
            <div className={styles.modalActions}>
              <Button
                variant='outline'
                onClick={() => setShowConfirmModal(false)}
                disabled={restoring}
              >
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={handleRestore}
                disabled={restoring}
                style={{ backgroundColor: '#dc2626' }}
              >
                {restoring ? 'Restaurando...' : 'Sí, Restaurar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
