# Guía de Pruebas - Estadísticas Backend

## Verificación de Endpoints

### 1. Probar Endpoint de Estadísticas del Sistema

**Endpoint:** `GET /api/v1/admin/stats/system`

**Parámetros requeridos:**

- `from`: Fecha desde (YYYY-MM-DD)
- `to`: Fecha hasta (YYYY-MM-DD)
- `provinceId` (opcional): ID de provincia

**Ejemplo de petición con curl:**

```bash
curl -X GET "http://ovotest.mooo.com:5000/api/v1/admin/stats/system?from=2024-01-01&to=2024-12-31" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Ejemplo de petición con fetch (JavaScript en consola del navegador):**

```javascript
// Obtener el token del localStorage
const token = localStorage.getItem('token');

// Realizar la petición
fetch(
  'http://ovotest.mooo.com:5000/api/v1/admin/stats/system?from=2024-01-01&to=2024-12-31',
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
)
  .then(res => res.json())
  .then(data => {
    console.log('Respuesta del backend:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Error:', err));
```

**Respuesta esperada (ejemplo):**

```json
{
  "filters": {
    "from": "2024-01-01",
    "to": "2024-12-31",
    "provinceId": null
  },
  "usuariosPorTipo": [
    {
      "tipo": "Estudiante",
      "total": 150
    },
    {
      "tipo": "Administrador",
      "total": 5
    }
  ],
  "evolucionRegistros": [
    {
      "periodo": "2024-01",
      "total": 25
    },
    {
      "periodo": "2024-02",
      "total": 30
    }
  ],
  "testsCompletados": [],
  "carrerasPorTipo": [
    {
      "tipo": "Grado",
      "total": 45
    },
    {
      "tipo": "Posgrado",
      "total": 12
    }
  ],
  "institucionesEstado": [
    {
      "estado": "Aprobado",
      "total": 10
    },
    {
      "estado": "Pendiente",
      "total": 3
    }
  ],
  "actividad": {
    "totalAccesos": 1250,
    "usuariosActivos": 95,
    "totalUsuarios": 150,
    "tasaActividad": 0.6333
  }
}
```

### 2. Probar Endpoint de Estadísticas de Usuarios

**Endpoint:** `GET /api/v1/admin/stats/users`

**Parámetros requeridos:**

- `from`: Fecha desde (YYYY-MM-DD)
- `to`: Fecha hasta (YYYY-MM-DD)
- `provinceId` (opcional): ID de provincia

**Ejemplo de petición con fetch:**

```javascript
const token = localStorage.getItem('token');

fetch(
  'http://ovotest.mooo.com:5000/api/v1/admin/stats/users?from=2024-01-01&to=2024-12-31',
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
)
  .then(res => res.json())
  .then(data => {
    console.log('Estadísticas de usuarios:');
    console.log(JSON.stringify(data, null, 2));

    // Verificar estructura
    console.log('\n--- Verificación de estructura ---');
    console.log('carrerasFavoritas:', Array.isArray(data.carrerasFavoritas));
    console.log(
      'Número de carreras favoritas:',
      data.carrerasFavoritas?.length || 0
    );
    console.log(
      'topCarrerasCompatibilidad:',
      Array.isArray(data.topCarrerasCompatibilidad)
    );
  })
  .catch(err => console.error('Error:', err));
```

**Respuesta esperada (ejemplo):**

```json
{
  "filters": {
    "from": "2024-01-01",
    "to": "2024-12-31",
    "provinceId": null
  },
  "carrerasFavoritas": [
    {
      "idCI": 123,
      "carrera": "Ingeniería en Sistemas",
      "total": 45
    },
    {
      "idCI": 456,
      "carrera": "Medicina",
      "total": 38
    },
    {
      "idCI": 789,
      "carrera": "Derecho",
      "total": 30
    }
  ],
  "topCarrerasCompatibilidad": []
}
```

### 3. Probar Casos de Error

#### Error ERR1: Sin datos

```javascript
const token = localStorage.getItem('token');

// Probar con un rango de fechas futuro (sin datos)
fetch(
  'http://ovotest.mooo.com:5000/api/v1/admin/stats/system?from=2025-01-01&to=2025-12-31',
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
)
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Respuesta:', data);
    // Debería devolver: { "errorCode": "ERR1", "message": "No se encontraron datos..." }
  })
  .catch(err => console.error('Error:', err));
```

#### Error de filtros inválidos

```javascript
const token = localStorage.getItem('token');

// Probar sin fechas (error 400)
fetch('http://ovotest.mooo.com:5000/api/v1/admin/stats/system', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then(res => {
    console.log('Status:', res.status); // Debería ser 400
    return res.json();
  })
  .then(data => {
    console.log('Respuesta:', data);
    // Debería devolver: { "errorCode": "ERR1", "message": "Filtros inválidos." }
  })
  .catch(err => console.error('Error:', err));
```

### 4. Verificar Exportación

#### Exportar estadísticas del sistema en CSV

```javascript
const token = localStorage.getItem('token');

fetch(
  'http://ovotest.mooo.com:5000/api/v1/admin/stats/system/export?from=2024-01-01&to=2024-12-31&format=csv',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)
  .then(res => res.blob())
  .then(blob => {
    // Crear y descargar el archivo
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stats_system.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('Archivo descargado correctamente');
  })
  .catch(err => console.error('Error:', err));
```

#### Exportar estadísticas de usuarios en CSV

```javascript
const token = localStorage.getItem('token');

fetch(
  'http://ovotest.mooo.com:5000/api/v1/admin/stats/users/export?from=2024-01-01&to=2024-12-31&format=csv',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
)
  .then(res => res.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stats_users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('Archivo descargado correctamente');
  })
  .catch(err => console.error('Error:', err));
```

## Checklist de Verificación

Usar esta lista para verificar que todo funciona correctamente:

### Backend

- [ ] Endpoint `/api/v1/admin/stats/system` devuelve datos correctos con filtros válidos
- [ ] Endpoint devuelve error ERR1 cuando no hay datos
- [ ] Endpoint devuelve error 400 con filtros inválidos
- [ ] El filtro por provincia funciona correctamente
- [ ] Endpoint `/api/v1/admin/stats/users` devuelve datos correctos
- [ ] Exportación CSV funciona correctamente
- [ ] Exportación PDF funciona correctamente

### Frontend

- [ ] La página carga sin errores
- [ ] Los filtros de fecha son obligatorios
- [ ] Validación de fechas funciona (fecha hasta no mayor a hoy)
- [ ] Validación de rango funciona (desde <= hasta)
- [ ] Los datos se muestran correctamente en las tablas
- [ ] Las tarjetas resumen muestran totales correctos
- [ ] El botón de exportar aparece solo cuando hay datos
- [ ] Modal de exportación funciona correctamente
- [ ] Descarga de CSV funciona
- [ ] Descarga de PDF funciona
- [ ] Mensajes de error se muestran correctamente
- [ ] Loading spinner aparece durante la carga

### Integración

- [ ] Los nombres de las propiedades coinciden entre frontend y backend
- [ ] Los filtros se envían correctamente (from, to, provinceId)
- [ ] Las respuestas se procesan correctamente
- [ ] Los errores del backend se manejan correctamente en el frontend
- [ ] El token de autenticación se envía correctamente

## Comandos Útiles

### Ver logs del backend (si tienes acceso)

```bash
tail -f /ruta/al/log/del/backend.log
```

### Ver peticiones en la consola del navegador

1. Abrir DevTools (F12)
2. Ir a la pestaña "Network"
3. Filtrar por "XHR" o "Fetch"
4. Buscar peticiones a `/api/v1/admin/stats/`
5. Ver detalles de Request y Response

### Verificar token en localStorage

```javascript
console.log('Token:', localStorage.getItem('token'));
```

### Limpiar token (si necesitas probar sin autenticación)

```javascript
localStorage.removeItem('token');
```

## Troubleshooting

### Problema: "401 Unauthorized"

**Solución:** Verificar que el token sea válido y que el usuario tenga el permiso `VIEW_STATS`.

### Problema: "404 Not Found" con ERR1

**Solución:** Normal cuando no hay datos en el rango de fechas. Cambiar los filtros.

### Problema: "400 Bad Request"

**Solución:** Verificar que los filtros `from` y `to` estén en formato `YYYY-MM-DD`.

### Problema: Los datos no se muestran en el frontend

**Solución:**

1. Verificar la consola del navegador para errores
2. Verificar la pestaña Network para ver la respuesta del backend
3. Verificar que los nombres de las propiedades coincidan con los del backend

### Problema: "TypeError: Cannot read property 'length' of undefined"

**Solución:** Verificar que todas las propiedades esperadas existan en la respuesta. Usar optional chaining (`?.`) en el frontend.

## Ejemplos de Datos de Prueba

### Fechas recomendadas para pruebas:

- **Con datos**: `from=2024-01-01&to=2024-12-31`
- **Sin datos**: `from=2025-01-01&to=2025-12-31`
- **Fecha inválida**: `from=2024-12-31&to=2024-01-01` (desde > hasta)

### IDs de provincia para pruebas (ejemplo):

- `provinceId=1` - Buenos Aires
- `provinceId=2` - Córdoba
- `provinceId=all` - Todas las provincias

---

**Nota:** Reemplazar `http://ovotest.mooo.com:5000` con la URL correcta de tu backend si es diferente.
