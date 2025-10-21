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
    const url = `/api/v1/careers/${careerId}/institutions`;
    console.log('URL del endpoint:', url);

    const { data } = await api.get(url);
    console.log('Respuesta del endpoint:', data);

    // La API devuelve directamente un array de instituciones-carrera
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener instituciones de la carrera:', error);
    console.error('Respuesta del error:', error.response?.data);
    throw error.response ? error.response.data : error;
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

export async function getCareerInstitutionById(carreraInstitucionId) {
  try {
    console.log(
      'Obteniendo detalle por ID carrera-institución:',
      carreraInstitucionId
    );

    // Para obtener los detalles necesitamos derivar careerId e institutionId
    // Primero intentamos obtener la lista de todas las carreras-instituciones para encontrar la coincidencia
    const carrerasResponse = await api.get('/api/v1/careers');
    const carreras = Array.isArray(carrerasResponse.data)
      ? carrerasResponse.data
      : [];

    for (const carrera of carreras) {
      try {
        const carreraId = carrera.id || carrera.idCarrera;
        if (carreraId) {
          const instResponse = await api.get(
            `/api/v1/careers/${carreraId}/institutions`
          );
          const instituciones = Array.isArray(instResponse.data)
            ? instResponse.data
            : [];

          const found = instituciones.find(
            inst => inst.idCarreraInstitucion === parseInt(carreraInstitucionId)
          );

          if (found) {
            // Extraer los IDs del detailPath
            const pathParts = found.detailPath.split('/');
            const foundCareerId = pathParts[pathParts.length - 3];
            const foundInstitucionId = pathParts[pathParts.length - 1];

            // Ahora obtener el detalle completo
            return await getCareerInstitution(
              foundCareerId,
              foundInstitucionId
            );
          }
        }
      } catch (error) {
        console.warn(`Error al buscar en carrera ${carrera.id}:`, error);
      }
    }

    throw new Error(
      `No se encontró la carrera-institución con ID ${carreraInstitucionId}`
    );
  } catch (error) {
    console.error(
      'Error al obtener detalle por ID carrera-institución:',
      error
    );
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
