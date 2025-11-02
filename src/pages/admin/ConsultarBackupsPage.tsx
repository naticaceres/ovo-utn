import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/toast/useToast';
import { getBackupFiles, getBackupConfig } from '../../services/backup';
import type { BackupConfig, BackupFile } from '../../services/backup';
import styles from './ConsultarBackupsPage.module.css';

export default function ConsultarBackupsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [files, backupConfig] = await Promise.all([
        getBackupFiles(),
        getBackupConfig().catch(() => null),
      ]);
      setBackupFiles(files);
      setConfig(backupConfig);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showToast('Error al cargar la información de backups', {
        variant: 'error',
      });
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

  const sortedBackupFiles = [...backupFiles].sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return dateB.getTime() - dateA.getTime(); // Más reciente primero
  });

  const getFrecuenciaIcon = (frecuencia?: string) => {
    switch (frecuencia) {
      case 'Diaria':
        return '📅';
      case 'Semanal':
        return '📆';
      case 'Mensual':
        return '🗓️';
      case 'Anual':
        return '📋';
      default:
        return '⚙️';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando información de backups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>💾 Consultar Backups</h1>
        <p className={styles.subtitle}>
          Información sobre backups automáticos y archivos disponibles
        </p>
      </div>

      {/* Configuración Actual */}
      <div className={styles.configCard}>
        <h2 className={styles.sectionTitle}>Configuración Actual</h2>
        {config ? (
          <div className={styles.configGrid}>
            <div className={styles.configItem}>
              <div className={styles.configIcon}>
                {getFrecuenciaIcon(config.frecuencia)}
              </div>
              <div className={styles.configInfo}>
                <div className={styles.configLabel}>Frecuencia</div>
                <div className={styles.configValue}>{config.frecuencia}</div>
              </div>
            </div>
            <div className={styles.configItem}>
              <div className={styles.configIcon}>🕐</div>
              <div className={styles.configInfo}>
                <div className={styles.configLabel}>Hora de Ejecución</div>
                <div className={styles.configValue}>{config.horaEjecucion}</div>
              </div>
            </div>
            <div className={styles.configItem}>
              <div className={styles.configIcon}>🗂️</div>
              <div className={styles.configInfo}>
                <div className={styles.configLabel}>Backups a Conservar</div>
                <div className={styles.configValue}>
                  {config.cantidadBackupConservar}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noConfig}>
            <p>⚠️ No hay configuración de backups automáticos</p>
            <Button
              variant='primary'
              onClick={() => navigate('/app/admin/backups/abm-config-backup')}
            >
              Configurar Ahora
            </Button>
          </div>
        )}
      </div>

      {/* Lista de Backups */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>
            Archivos de Backup Disponibles ({backupFiles.length})
          </h2>
          <Button variant='outline' onClick={loadData} size='sm'>
            🔄 Actualizar
          </Button>
        </div>

        {backupFiles.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <h3>No hay backups disponibles</h3>
            <p>No se encontraron archivos de backup en el sistema</p>
          </div>
        ) : (
          <div className={styles.backupList}>
            {sortedBackupFiles.map((backup, index) => {
              const isRecent = index === 0; // El más reciente

              return (
                <div
                  key={backup.id}
                  className={`${styles.backupItem} ${isRecent ? styles.recent : ''}`}
                >
                  <div className={styles.backupIcon}>
                    {isRecent ? '⭐' : '💾'}
                  </div>
                  <div className={styles.backupInfo}>
                    <div className={styles.backupHeader}>
                      <div className={styles.backupDate}>
                        📅 {formatDate(backup.fecha)}
                      </div>
                      {isRecent && (
                        <span className={styles.recentBadge}>Más Reciente</span>
                      )}
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
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            variant='outline'
            onClick={() => navigate('/app/admin/backups')}
          >
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}
