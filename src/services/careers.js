import { api } from '../context/api';

export async function listCareers(params = {}) {
  try {
    const { data } = await api.get('/api/v1/careers', { params });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function searchCareers(query) {
  try {
    const { data } = await api.get('/api/v1/careers', {
      params: { search: query },
    });
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function getCareerInstitutions(careerId) {
  try {
    console.log('Obteniendo instituciones para carrera:', careerId);

    // Primer intento: usar endpoint que liste instituciones filtradas por carrera
    try {
      const { data } = await api.get('/api/v1/institutions', {
        params: {
          idCarrera: careerId,
          // También probar otros nombres de parámetro
          careerId: careerId,
          carrera: careerId,
        },
      });
      console.log('Respuesta del endpoint institutions:', data);

      // Verificar si es un array o si viene envuelto en un objeto
      let institutions = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        institutions = data.institutions || data.data || data.results || [];
      }

      if (Array.isArray(institutions) && institutions.length > 0) {
        console.log('Instituciones encontradas:', institutions);
        return institutions;
      }
    } catch (error) {
      console.log('Falló endpoint /api/v1/institutions:', error);
    }

    // Segundo intento: usar listCareers para obtener carrera con instituciones
    try {
      const { data } = await api.get(`/api/v1/careers/${careerId}`);
      console.log('Respuesta del endpoint careers individual:', data);

      if (data && data.institutions) {
        return data.institutions;
      }
    } catch (error) {
      console.log('Falló endpoint careers individual:', error);
    }

    // Tercer intento: buscar todas las carreras y filtrar por ID
    try {
      const { data } = await api.get('/api/v1/careers');
      console.log('Respuesta del endpoint careers lista:', data);

      const careers = Array.isArray(data)
        ? data
        : data.careers || data.data || [];
      const career = careers.find(
        c => c.id === careerId || c.nombre === careerId
      );

      if (career && career.institutions) {
        return career.institutions;
      }
    } catch (error) {
      console.log('Falló endpoint careers lista:', error);
    }

    // Si todos fallan, devolver array vacío en lugar de error
    console.log(
      'No se pudieron obtener instituciones para la carrera:',
      careerId
    );
    return [];
  } catch (error) {
    console.error('Error general en getCareerInstitutions:', error);
    return []; // Devolver array vacío en lugar de lanzar error
  }
}

export async function getCareerInstitution(careerId, institutionId) {
  try {
    console.log('Obteniendo detalle carrera-institución:', {
      careerId,
      institutionId,
    });
    const url = `/api/v1/careers/${careerId}/institutions/${institutionId}`;
    console.log('URL del endpoint:', url);

    const { data } = await api.get(url);
    console.log('Respuesta del detalle carrera-institución:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener detalle carrera-institución:', error);
    console.error('Respuesta del error:', error.response?.data);
    console.error('Status del error:', error.response?.status);
    throw error.response ? error.response.data : error;
  }
}

export async function getCareer(careerId) {
  try {
    const { data } = await api.get(`/api/v1/careers/${careerId}`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

export async function setCareerInterest(careerId) {
  try {
    const { data } = await api.post(`/api/v1/careers/${careerId}/interest`);
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
