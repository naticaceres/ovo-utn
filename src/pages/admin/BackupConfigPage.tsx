import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/toast/useToast';
import {
  getBackupConfig,
  updateBackupConfig,
  type BackupConfig,
} from '../../services/backup';
import styles from './BackupConfigPage.module.css';

export default function BackupConfigPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BackupConfig>({
    frecuencia: 'Diaria',
    horaEjecucion: '02:00',
    cantidadBackupConservar: 7,
  });

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getBackupConfig();

      // Convertir horaEjecucion de HH:MM:SS a HH:MM para el input type="time"
      let horaParaInput = data.horaEjecucion;
      if (horaParaInput && horaParaInput.length > 5) {
        // Si viene con segundos (HH:MM:SS), quitar los segundos
        horaParaInput = horaParaInput.substring(0, 5);
      }

      setConfig({
        ...data,
        horaEjecucion: horaParaInput,
      });
    } catch (error) {
      // Si no hay configuración, usar valores por defecto
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 404) {
        showToast(
          'No hay configuración previa. Configure los backups automáticos.',
          {
            variant: 'info',
          }
        );
      } else {
        showToast('Error al cargar la configuración de backups', {
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validaciones
      if (
        !config.cantidadBackupConservar ||
        config.cantidadBackupConservar < 1
      ) {
        showToast('La cantidad de backups debe ser al menos 1', {
          variant: 'error',
        });
        return;
      }

      if (config.cantidadBackupConservar > 365) {
        showToast('La cantidad de backups no puede ser mayor a 365', {
          variant: 'error',
        });
        return;
      }

      // Validar formato de hora (acepta HH:MM o H:MM)
      const timeRegex = /^([0-1]?\d|2[0-3]):([0-5]\d)$/;
      if (!config.horaEjecucion || !timeRegex.test(config.horaEjecucion)) {
        showToast('El formato de hora debe ser HH:MM (ejemplo: 02:00)', {
          variant: 'error',
        });
        return;
      }

      // Asegurar formato HH:MM:SS con ceros iniciales para el backend
      const timeParts = config.horaEjecucion.split(':');
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1].padStart(2, '0');
      const seconds = timeParts[2] || '00'; // Agregar segundos si no existen
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      await updateBackupConfig({ ...config, horaEjecucion: formattedTime });
      showToast('Configuración de backups guardada exitosamente', {
        variant: 'success',
      });
      navigate('/app/admin/backups');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error al guardar configuración:', error);
      showToast(
        err?.response?.data?.message || 'Error al guardar la configuración',
        { variant: 'error' }
      );
    } finally {
      setSaving(false);
    }
  };

  const getFrecuenciaInfo = () => {
    switch (config.frecuencia) {
      case 'Diaria':
        return 'Se ejecutará todos los días';
      case 'Semanal':
        return 'Se ejecutará todos los domingos';
      case 'Mensual':
        return 'Se ejecutará el día 1 de cada mes';
      case 'Anual':
        return 'Se ejecutará el 1 de enero de cada año';
      default:
        return '';
    }
  };

  const getRecommendedBackups = () => {
    switch (config.frecuencia) {
      case 'Diaria':
        return 7;
      case 'Semanal':
        return 4;
      case 'Mensual':
        return 12;
      case 'Anual':
        return 5;
      default:
        return 7;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <BackButton />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>
          ⚙️ Configuración de Backups Automáticos
        </h1>
        <p className={styles.subtitle}>
          Configure la frecuencia y retención de backups automáticos del sistema
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>Frecuencia de Backup</span>
            <span className={styles.labelInfo}>{getFrecuenciaInfo()}</span>
          </label>
          <select
            className={styles.select}
            value={config.frecuencia}
            onChange={e =>
              setConfig({
                ...config,
                frecuencia: e.target.value as BackupConfig['frecuencia'],
                cantidadBackupConservar: getRecommendedBackups(),
              })
            }
          >
            <option value='Diaria'>📅 Diaria</option>
            <option value='Semanal'>📆 Semanal (Domingos)</option>
            <option value='Mensual'>🗓️ Mensual (Día 1)</option>
            <option value='Anual'>📋 Anual (1 de Enero)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>Hora de Ejecución</span>
            <span className={styles.labelInfo}>
              Formato 24 horas: HH:MM (ejemplo: 02:00)
            </span>
          </label>
          <Input
            type='time'
            value={config.horaEjecucion}
            onChange={e =>
              setConfig({ ...config, horaEjecucion: e.target.value })
            }
            placeholder='02:00'
            pattern='^([01]\d|2[0-3]):([0-5]\d)$'
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>
              Cantidad de Backups a Conservar
            </span>
            <span className={styles.labelInfo}>
              Recomendado para {config.frecuencia.toLowerCase()}:{' '}
              {getRecommendedBackups()} backups
            </span>
          </label>
          <Input
            type='text'
            value={config.cantidadBackupConservar || ''}
            onChange={e => {
              const value = e.target.value;
              // Solo permitir números
              if (value === '' || /^\d+$/.test(value)) {
                setConfig({
                  ...config,
                  cantidadBackupConservar: value === '' ? 0 : parseInt(value),
                });
              }
            }}
            placeholder='Ej: 7'
          />
        </div>

        <div className={styles.infoBox}>
          <h3 className={styles.infoTitle}>ℹ️ Información</h3>
          <ul className={styles.infoList}>
            <li>
              Los backups se ejecutarán automáticamente según la frecuencia
              configurada
            </li>
            <li>
              Se conservarán los últimos{' '}
              <strong>{config.cantidadBackupConservar}</strong> backups
            </li>
            <li>Los backups más antiguos se eliminarán automáticamente</li>
            <li>
              La hora de ejecución se basa en la zona horaria del servidor
            </li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button
            variant='outline'
            onClick={() => navigate('/app/admin/backups')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button variant='primary' onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  );
}
