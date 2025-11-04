# Ejemplos de Respuesta del Backend - Estadísticas

## Endpoint: GET /api/v1/admin/stats/system

### Request

```http
GET /api/v1/admin/stats/system?fechaDesde=2024-01-01&fechaHasta=2024-12-31&idProvincia=5
Authorization: Bearer {token}
```

### Response Exitosa (200 OK)

```json
{
  "totalUsuariosPorTipo": [
    { "tipo": "Estudiante", "total": 1250 },
    { "tipo": "Institución", "total": 45 },
    { "tipo": "Administrador", "total": 8 }
  ],
  "evolucionRegistros": [
    { "fecha": "2024-01", "total": 150, "tipo": "Estudiante" },
    { "fecha": "2024-02", "total": 200, "tipo": "Estudiante" },
    { "fecha": "2024-03", "total": 180, "tipo": "Estudiante" },
    { "fecha": "2024-01", "total": 5, "tipo": "Institución" },
    { "fecha": "2024-02", "total": 8, "tipo": "Institución" }
  ],
  "testsCompletadosPorMes": [
    { "mes": "2024-01", "total": 320 },
    { "mes": "2024-02", "total": 450 },
    { "mes": "2024-03", "total": 380 }
  ],
  "totalCarrerasPorTipo": [
    { "tipo": "Licenciatura", "total": 85 },
    { "tipo": "Tecnicatura", "total": 120 },
    { "tipo": "Profesorado", "total": 45 },
    { "tipo": "Maestría", "total": 30 }
  ],
  "estadoSolicitudesInstituciones": [
    { "estado": "PENDIENTE", "total": 12 },
    { "estado": "APROBADA", "total": 35 },
    { "estado": "RECHAZADA", "total": 8 }
  ],
  "tasaActividad": {
    "usuariosActivos": 890,
    "usuariosTotales": 1250,
    "porcentaje": 71.2
  }
}
```

### Response Sin Resultados (200 OK)

```json
{
  "totalUsuariosPorTipo": [],
  "evolucionRegistros": [],
  "testsCompletadosPorMes": [],
  "totalCarrerasPorTipo": [],
  "estadoSolicitudesInstituciones": [],
  "tasaActividad": {
    "usuariosActivos": 0,
    "usuariosTotales": 0,
    "porcentaje": 0
  }
}
```

### Response Error (400 Bad Request)

```json
{
  "message": "La fecha desde no puede ser posterior a la fecha hasta",
  "error": "INVALID_DATE_RANGE"
}
```

### Response Error (401 Unauthorized)

```json
{
  "message": "No autorizado",
  "error": "UNAUTHORIZED"
}
```

### Response Error (403 Forbidden)

```json
{
  "message": "No tiene permisos para ver estadísticas",
  "error": "FORBIDDEN",
  "requiredPermission": "VIEW_STATS"
}
```

---

## Endpoint: GET /api/v1/admin/stats/users

### Request

```http
GET /api/v1/admin/stats/users?fechaDesde=2024-01-01&fechaHasta=2024-12-31
Authorization: Bearer {token}
```

### Response Exitosa (200 OK)

```json
{
  "carrerasMasFavoritas": [
    {
      "idCarrera": 145,
      "nombreCarrera": "Licenciatura en Sistemas de Información",
      "totalFavoritos": 320
    },
    {
      "idCarrera": 87,
      "nombreCarrera": "Ingeniería Industrial",
      "totalFavoritos": 285
    },
    {
      "idCarrera": 203,
      "nombreCarrera": "Medicina",
      "totalFavoritos": 270
    },
    {
      "idCarrera": 156,
      "nombreCarrera": "Psicología",
      "totalFavoritos": 245
    },
    {
      "idCarrera": 92,
      "nombreCarrera": "Arquitectura",
      "totalFavoritos": 210
    }
  ],
  "topCarrerasCompatibilidad": [
    {
      "idCarrera": 145,
      "nombreCarrera": "Licenciatura en Sistemas de Información",
      "promedioCompatibilidad": 87.5,
      "cantidadTests": 450
    },
    {
      "idCarrera": 203,
      "nombreCarrera": "Medicina",
      "promedioCompatibilidad": 85.3,
      "cantidadTests": 520
    },
    {
      "idCarrera": 87,
      "nombreCarrera": "Ingeniería Industrial",
      "promedioCompatibilidad": 83.7,
      "cantidadTests": 380
    },
    {
      "idCarrera": 156,
      "nombreCarrera": "Psicología",
      "promedioCompatibilidad": 82.1,
      "cantidadTests": 410
    },
    {
      "idCarrera": 92,
      "nombreCarrera": "Arquitectura",
      "promedioCompatibilidad": 80.9,
      "cantidadTests": 350
    }
  ]
}
```

### Response Sin Resultados (200 OK)

```json
{
  "carrerasMasFavoritas": [],
  "topCarrerasCompatibilidad": []
}
```

---

## Endpoint: GET /api/v1/admin/stats/system/export

### Request PDF

```http
GET /api/v1/admin/stats/system/export?fechaDesde=2024-01-01&fechaHasta=2024-12-31&format=pdf
Authorization: Bearer {token}
```

### Response PDF (200 OK)

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="estadisticas-sistema-2024-01-01-2024-12-31.pdf"
Content-Length: 245678

[Binary PDF Data]
```

**Contenido del PDF debe incluir:**

1. Encabezado con logo del sistema (opcional)
2. Título: "Uso y funcionamiento del sistema"
3. Detalle de filtros aplicados:
   - Periodo: 01/01/2024 - 31/12/2024
   - Provincia: Buenos Aires (si se filtró)
4. Fecha de emisión: 04/11/2025 15:30:00
5. Todas las tablas y gráficos con los datos

### Request CSV

```http
GET /api/v1/admin/stats/system/export?fechaDesde=2024-01-01&fechaHasta=2024-12-31&format=csv
Authorization: Bearer {token}
```

### Response CSV (200 OK)

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="estadisticas-sistema-2024-01-01-2024-12-31.csv"

Tipo de Usuario,Total
Estudiante,1250
Institución,45
Administrador,8

Fecha,Total Registros,Tipo
2024-01,150,Estudiante
2024-02,200,Estudiante
2024-03,180,Estudiante

Mes,Tests Completados
2024-01,320
2024-02,450
2024-03,380

Tipo de Carrera,Total
Licenciatura,85
Tecnicatura,120
Profesorado,45
Maestría,30

Estado Solicitud,Total
PENDIENTE,12
APROBADA,35
RECHAZADA,8

Tasa de Actividad
Usuarios Activos,890
Usuarios Totales,1250
Porcentaje,71.2
```

---

## Endpoint: GET /api/v1/admin/stats/users/export

### Request PDF

```http
GET /api/v1/admin/stats/users/export?fechaDesde=2024-01-01&fechaHasta=2024-12-31&format=pdf
Authorization: Bearer {token}
```

### Response PDF (200 OK)

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="estadisticas-usuarios-2024-01-01-2024-12-31.pdf"

[Binary PDF Data]
```

**Contenido del PDF debe incluir:**

1. Encabezado con logo del sistema (opcional)
2. Título: "Comportamiento general de los usuarios"
3. Detalle de filtros aplicados:
   - Periodo: 01/01/2024 - 31/12/2024
   - Provincia: Todas (o la seleccionada)
4. Fecha de emisión: 04/11/2025 15:30:00
5. Tablas con:
   - Carreras más favoritas
   - Top carreras por compatibilidad

### Request CSV

```http
GET /api/v1/admin/stats/users/export?fechaDesde=2024-01-01&fechaHasta=2024-12-31&format=csv
Authorization: Bearer {token}
```

### Response CSV (200 OK)

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="estadisticas-usuarios-2024-01-01-2024-12-31.csv"

Carreras Más Favoritas
Posición,ID Carrera,Nombre Carrera,Total Favoritos
1,145,Licenciatura en Sistemas de Información,320
2,87,Ingeniería Industrial,285
3,203,Medicina,270
4,156,Psicología,245
5,92,Arquitectura,210

Top Carreras por Compatibilidad
Posición,ID Carrera,Nombre Carrera,Promedio Compatibilidad,Cantidad Tests
1,145,Licenciatura en Sistemas de Información,87.5,450
2,203,Medicina,85.3,520
3,87,Ingeniería Industrial,83.7,380
4,156,Psicología,82.1,410
5,92,Arquitectura,80.9,350
```

---

## Errores Comunes

### 400 - Parámetros Inválidos

```json
{
  "message": "Los parámetros fechaDesde y fechaHasta son obligatorios",
  "error": "MISSING_REQUIRED_PARAMS"
}
```

### 404 - Endpoint No Encontrado

```json
{
  "message": "Endpoint no encontrado",
  "error": "NOT_FOUND"
}
```

### 500 - Error del Servidor

```json
{
  "message": "Error interno del servidor al generar estadísticas",
  "error": "INTERNAL_SERVER_ERROR"
}
```

---

## Notas de Implementación Backend

### Consideraciones para el Backend:

1. **Autenticación:**
   - Verificar token en el header `Authorization: Bearer {token}`
   - Validar que el usuario tenga el permiso `VIEW_STATS`

2. **Validación de Parámetros:**
   - `fechaDesde` y `fechaHasta` son obligatorios
   - Formato de fecha: `YYYY-MM-DD`
   - `fechaHasta` no puede ser superior a la fecha actual
   - `fechaDesde` no puede ser posterior a `fechaHasta`
   - `idProvincia` es opcional

3. **Filtrado por Provincia:**
   - Si `idProvincia` está presente, filtrar solo usuarios/datos de esa provincia
   - Si no está presente o es "todas", traer datos de todas las provincias

4. **Generación de Reportes:**
   - PDF: usar biblioteca como `pdfkit`, `puppeteer`, o similar
   - CSV: generar con separador de comas, codificación UTF-8
   - Incluir encabezados informativos en ambos formatos

5. **Performance:**
   - Considerar cachear resultados para periodos recientes
   - Optimizar consultas SQL con índices apropiados
   - Limitar cantidad de registros si es necesario (ej: top 20 carreras)

6. **Manejo de Errores:**
   - Retornar mensajes descriptivos
   - Usar códigos HTTP apropiados
   - Logear errores para debugging
