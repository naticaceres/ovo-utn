import { api } from '../context/api';

/**
 * Tipos para la gestión de backups
 */
export interface BackupConfig {
  frecuencia: 'Diaria' | 'Semanal' | 'Mensual' | 'Anual';
  horaEjecucion: string; // Formato HH:MM:SS
  cantidadBackupConservar: number;
}

export interface BackupFile {
  id: number;
  fecha: string; // ISO 8601 format
  directorio: string; // filename
  tamano: number; // size in bytes
  tamanoFormateado: string; // formatted size (e.g., "500.00 MB")
}

export interface BackupFilesResponse {
  backups: BackupFile[];
}

/**
 * Obtiene la configuración actual de backups automáticos
 */
export async function getBackupConfig(): Promise<BackupConfig> {
  const response = await api.get('/api/v1/admin/backup');
  return response.data;
}

/**
 * Crea o actualiza la configuración de backups automáticos
 */
export async function updateBackupConfig(
  config: BackupConfig
): Promise<BackupConfig> {
  const response = await api.post('/api/v1/admin/backup', config);
  return response.data;
}

/**
 * Obtiene la lista de archivos de backup disponibles
 */
export async function getBackupFiles(): Promise<BackupFile[]> {
  const response = await api.get<BackupFilesResponse>(
    '/api/v1/admin/backup/files'
  );
  return response.data.backups || [];
}

/**
 * Restaura un backup específico usando su ID
 */
export async function restoreBackup(idBackup: number): Promise<void> {
  await api.post('/api/v1/admin/backup/files', { idBackup });
}

/**
 * Crea un backup manual inmediato
 */
export async function createManualBackup(): Promise<{
  message: string;
  archivo: string;
  tamano: string;
}> {
  const response = await api.post('/api/v1/admin/backup/manual');
  return response.data;
}
