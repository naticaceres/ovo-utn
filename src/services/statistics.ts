/**
 * SERVICIO DE ESTADÍSTICAS - CONSUMO DE ENDPOINTS BACKEND
 * Todas las estadísticas se obtienen directamente desde el backend
 * Endpoints: /api/v1/admin/stats/system y /api/v1/admin/stats/users
 */

import { api } from '../context/api';
import { listProvinces } from './admin';

/**
 * Tipos para las estadísticas del sistema
 */
export interface SystemStatsParams {
  from?: string; // YYYY-MM-DD (fechaDesde -> from)
  to?: string; // YYYY-MM-DD (fechaHasta -> to)
  provinceId?: number | string; // idProvincia -> provinceId
}

export interface UserBehaviorStatsParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  provinceId?: number | string;
}

export interface Province {
  id: number | string;
  nombre: string;
}

// Respuestas del backend según la lógica implementada
export interface SystemStatsResponse {
  filters: {
    from: string;
    to: string;
    provinceId: number | null;
  };
  usuariosPorTipo: {
    tipo: string;
    total: number;
  }[];
  evolucionRegistros: {
    periodo: string;
    total: number;
  }[];
  testsCompletados: {
    mes: string;
    total: number;
  }[]; // Vacío según backend (no hay fecha en tabla test)
  carrerasPorTipo: {
    tipo: string;
    total: number;
  }[];
  institucionesEstado: {
    estado: string;
    total: number;
  }[];
  actividad: {
    totalAccesos: number;
    usuariosActivos: number;
    totalUsuarios: number;
    tasaActividad: number;
  };
}

export interface UserBehaviorStatsResponse {
  filters: {
    from: string;
    to: string;
    provinceId: number | null;
  };
  carrerasFavoritas: {
    idCI: number;
    carrera: string;
    institucion: string;
    total: number;
  }[];
  topCarrerasCompatibilidad: {
    idCarrera: number;
    nombreCarrera: string;
    promedioCompatibilidad: number;
    cantidadTests: number;
  }[]; // Vacío según backend (no hay datos suficientes)
}

export interface ExportParams {
  fechaDesde?: string;
  fechaHasta?: string;
  idProvincia?: number | string;
  format: 'pdf' | 'csv';
  [key: string]: unknown;
}

/**
 * Obtiene las provincias disponibles para el filtro
 */
export async function getProvinces(): Promise<Province[]> {
  try {
    const provincias = await listProvinces({});
    return provincias.map(
      (p: { id: number | string; nombre: string }): Province => ({
        id: p.id,
        nombre: p.nombre,
      })
    );
  } catch (error) {
    console.error('Error al obtener provincias:', error);
    return [];
  }
}

// Nota: Esta función no se usa actualmente pero se mantiene para futura implementación
// de filtrado de usuarios por provincia y fecha
/*
function filterUsers(
  usuarios: Usuario[],
  fechaDesde?: string,
  fechaHasta?: string,
  idProvincia?: number | string
) {
  return usuarios.filter(u => {
    // Filtro por provincia (si idLocalidad está disponible, habría que obtener la provincia de la localidad)
    // Por simplicidad, asumimos que si no hay forma de filtrar por provincia, incluimos todos
    if (idProvincia && idProvincia !== 'todas') {
      // TODO: Implementar filtro por provincia cuando se tenga la relación localidad-provincia
      // Por ahora, no filtramos por provincia si no tenemos la información
    }

    // Filtro por fecha (si los usuarios tienen fechaCreacion)
    if (fechaDesde || fechaHasta) {
      const fechaCreacion = u.fechaCreacion || u.createdAt || u.created_at;
      if (fechaCreacion) {
        const fecha = new Date(fechaCreacion);
        if (fechaDesde && fecha < new Date(fechaDesde)) return false;
        if (fechaHasta && fecha > new Date(fechaHasta)) return false;
      }
    }

    return true;
  });
}
*/

/**
 * Obtiene estadísticas del uso y funcionamiento del sistema desde el backend
 * Endpoint: GET /api/v1/admin/stats/system
 * Filtros obligatorios: from (YYYY-MM-DD), to (YYYY-MM-DD)
 * Filtro opcional: provinceId (ID de provincia)
 */
export async function getSystemStats(
  params: SystemStatsParams = {}
): Promise<SystemStatsResponse> {
  try {
    const { from, to, provinceId } = params;

    // Validar que existan fechas
    if (!from || !to) {
      throw new Error('Los filtros de fecha son obligatorios (desde y hasta)');
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('from', from);
    queryParams.append('to', to);
    if (provinceId && provinceId !== 'todas' && provinceId !== 'all') {
      queryParams.append('provinceId', String(provinceId));
    }

    // Realizar petición al backend
    const response = await api.get(
      `/api/v1/admin/stats/system?${queryParams.toString()}`
    );

    return response.data as SystemStatsResponse;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { errorCode?: string; message?: string } };
      message?: string;
    };
    // Manejar errores específicos del backend
    if (apiError.response?.data?.errorCode === 'ERR1') {
      throw new Error(
        apiError.response.data.message ||
          'No se encontraron datos con los filtros aplicados. Por favor, cambie los filtros e intente nuevamente.'
      );
    }

    throw new Error(
      apiError.response?.data?.message ||
        apiError.message ||
        'Error al obtener estadísticas del sistema'
    );
  }
}

/**
 * Obtiene estadísticas del comportamiento de usuarios desde el backend
 * Endpoint: GET /api/v1/admin/stats/users
 * Filtros obligatorios: from (YYYY-MM-DD), to (YYYY-MM-DD)
 * Filtro opcional: provinceId (ID de provincia)
 */
export async function getUserBehaviorStats(
  params: UserBehaviorStatsParams = {}
): Promise<UserBehaviorStatsResponse> {
  try {
    const { from, to, provinceId } = params;

    // Validar que existan fechas
    if (!from || !to) {
      throw new Error('Los filtros de fecha son obligatorios (desde y hasta)');
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('from', from);
    queryParams.append('to', to);
    if (provinceId && provinceId !== 'todas' && provinceId !== 'all') {
      queryParams.append('provinceId', String(provinceId));
    }

    // Realizar petición al backend
    const response = await api.get(
      `/api/v1/admin/stats/users?${queryParams.toString()}`
    );

    return response.data as UserBehaviorStatsResponse;
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { errorCode?: string; message?: string } };
      message?: string;
    };
    // Manejar errores específicos del backend
    if (apiError.response?.data?.errorCode === 'ERR1') {
      throw new Error(
        apiError.response.data.message ||
          'No se encontraron datos con los filtros aplicados. Por favor, cambie los filtros e intente nuevamente.'
      );
    }

    throw new Error(
      apiError.response?.data?.message ||
        apiError.message ||
        'Error al obtener estadísticas de comportamiento de usuarios'
    );
  }
}

/**
 * Descarga CSV de estadísticas del sistema desde el backend
 * Endpoint: GET /api/v1/admin/stats/system/export?from=...&to=...&format=csv
 */
export async function downloadSystemStatsCSV(filtros: {
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<void> {
  try {
    if (!filtros.fechaDesde || !filtros.fechaHasta) {
      throw new Error('Las fechas son obligatorias para exportar');
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('from', filtros.fechaDesde);
    queryParams.append('to', filtros.fechaHasta);
    queryParams.append('format', 'csv');

    // Realizar petición al backend
    const response = await api.get(
      `/api/v1/admin/stats/system/export?${queryParams.toString()}`,
      {
        responseType: 'blob',
      }
    );

    // Crear blob y descargar
    const blob = new Blob([response.data], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `uso-funcionamiento-sistema-${filtros.fechaDesde}-${filtros.fechaHasta}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    throw new Error(
      apiError.response?.data?.message ||
        apiError.message ||
        'Error al descargar CSV del sistema'
    );
  }
}

/**
 * Descarga CSV de estadísticas de comportamiento de usuarios desde el backend
 * Endpoint: GET /api/v1/admin/stats/users/export?from=...&to=...&format=csv
 */
export async function downloadUserBehaviorStatsCSV(filtros: {
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<void> {
  try {
    if (!filtros.fechaDesde || !filtros.fechaHasta) {
      throw new Error('Las fechas son obligatorias para exportar');
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('from', filtros.fechaDesde);
    queryParams.append('to', filtros.fechaHasta);
    queryParams.append('format', 'csv');

    // Realizar petición al backend
    const response = await api.get(
      `/api/v1/admin/stats/users/export?${queryParams.toString()}`,
      {
        responseType: 'blob',
      }
    );

    // Crear blob y descargar
    const blob = new Blob([response.data], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `comportamiento-usuarios-${filtros.fechaDesde}-${filtros.fechaHasta}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    throw new Error(
      apiError.response?.data?.message ||
        apiError.message ||
        'Error al descargar CSV de comportamiento de usuarios'
    );
  }
}

/**
 * Descarga PDF de estadísticas del sistema desde el backend
 * Endpoint: GET /api/v1/admin/stats/system/export?from=...&to=...&format=pdf
 */
export async function downloadSystemStatsPDF(filtros: {
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<void> {
  try {
    if (!filtros.fechaDesde || !filtros.fechaHasta) {
      throw new Error('Las fechas son obligatorias para exportar');
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('from', filtros.fechaDesde);
    queryParams.append('to', filtros.fechaHasta);
    queryParams.append('format', 'pdf');

    // Realizar petición al backend
    const response = await api.get(
      `/api/v1/admin/stats/system/export?${queryParams.toString()}`,
      {
        responseType: 'blob',
      }
    );

    // Crear blob y descargar
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `uso-funcionamiento-sistema-${filtros.fechaDesde}-${filtros.fechaHasta}.pdf`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    throw new Error(
      apiError.response?.data?.message ||
        apiError.message ||
        'Error al descargar PDF del sistema'
    );
  }
}

/**
 * Descarga PDF de estadísticas de comportamiento de usuarios desde el backend
 * Endpoint: GET /api/v1/admin/stats/users/export?from=...&to=...&format=pdf
 */
export async function downloadUserBehaviorStatsPDF(filtros: {
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<void> {
  try {
    if (!filtros.fechaDesde || !filtros.fechaHasta) {
      throw new Error('Las fechas son obligatorias para exportar');
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('from', filtros.fechaDesde);
    queryParams.append('to', filtros.fechaHasta);
    queryParams.append('format', 'pdf');

    // Realizar petición al backend
    const response = await api.get(
      `/api/v1/admin/stats/users/export?${queryParams.toString()}`,
      {
        responseType: 'blob',
      }
    );

    // Crear blob y descargar
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `comportamiento-usuarios-${filtros.fechaDesde}-${filtros.fechaHasta}.pdf`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    throw new Error(
      apiError.response?.data?.message ||
        apiError.message ||
        'Error al descargar PDF de comportamiento de usuarios'
    );
  }
}
