# Integración de Estadísticas con Backend - Resumen de Cambios

## Fecha: 4 de noviembre de 2025

## Resumen General

Se ha modificado el frontend para que se comunique directamente con los endpoints de estadísticas del backend implementados. El sistema ahora consume los endpoints:

- `GET /api/v1/admin/stats/system` - Estadísticas del sistema
- `GET /api/v1/admin/stats/users` - Estadísticas de comportamiento de usuarios
- `GET /api/v1/admin/stats/system/export` - Exportar estadísticas del sistema
- `GET /api/v1/admin/stats/users/export` - Exportar estadísticas de usuarios

## Archivos Modificados

### 1. `src/services/statistics.ts`

**Cambios principales:**

- Cambio de cálculos en frontend a consumo de API backend
- Actualización de tipos de datos según respuesta del backend:
  - `SystemStatsResponse`: ahora incluye `usuariosPorTipo`, `evolucionRegistros`, `carrerasPorTipo`, `institucionesEstado`, `actividad`
  - `UserBehaviorStatsResponse`: ahora incluye `carrerasFavoritas` y `topCarrerasCompatibilidad`
- Parámetros de consulta cambiados:
  - `fechaDesde` → `from`
  - `fechaHasta` → `to`
  - `idProvincia` → `provinceId`

**Funciones principales:**

```typescript
// Obtiene estadísticas del sistema desde el backend
export async function getSystemStats(
  params: SystemStatsParams
): Promise<SystemStatsResponse>;

// Obtiene estadísticas de comportamiento de usuarios desde el backend
export async function getUserBehaviorStats(
  params: UserBehaviorStatsParams
): Promise<UserBehaviorStatsResponse>;

// Funciones de exportación (CSV y PDF)
export function downloadSystemStatsCSV(
  data: SystemStatsResponse,
  filename: string,
  filtros?: object
): void;
export function downloadUserBehaviorStatsCSV(
  data: UserBehaviorStatsResponse,
  filename: string,
  filtros?: object
): void;
export function downloadSystemStatsPDF(
  data: SystemStatsResponse,
  filename: string,
  filtros?: object
): void;
export function downloadUserBehaviorStatsPDF(
  data: UserBehaviorStatsResponse,
  filename: string,
  filtros?: object
): void;

// Funciones para exportar desde backend
export async function exportSystemStats(
  params: SystemStatsParams & { format: 'csv' | 'pdf' }
): Promise<void>;
export async function exportUserStats(
  params: UserBehaviorStatsParams & { format: 'csv' | 'pdf' }
): Promise<void>;
```

### 2. `src/pages/admin/SystemUsageStatsPage.tsx`

**Cambios principales:**

- Validación obligatoria de fechas `desde` y `hasta`
- Actualización de nombres de propiedades según respuesta del backend:
  - `totalUsuariosPorTipo` → `usuariosPorTipo`
  - `testsCompletadosPorMes` → `testsCompletados`
  - `totalCarrerasPorTipo` → `carrerasPorTipo`
  - `estadoSolicitudesInstituciones` → `institucionesEstado`
  - `tasaActividad` → `actividad`
- Tabla de evolución de registros ahora muestra columna "Periodo" en lugar de "Fecha"
- Tasa de actividad se muestra como porcentaje (multiplicado por 100)

### 3. `src/pages/admin/UserBehaviorStatsPage.tsx`

**Cambios principales:**

- Validación obligatoria de fechas `desde` y `hasta`
- Actualización de nombres de propiedades según respuesta del backend:
  - `carrerasMasFavoritas` → `carrerasFavoritas`
  - Campos de la respuesta: `idCI`, `carrera`, `total` (en lugar de `idCarrera`, `nombreCarrera`, `totalFavoritos`)

## Estructura de Respuestas del Backend

### Respuesta de `/api/v1/admin/stats/system`

```json
{
  "filters": {
    "from": "2024-01-01",
    "to": "2024-12-31",
    "provinceId": 5
  },
  "usuariosPorTipo": [
    { "tipo": "Estudiante", "total": 150 },
    { "tipo": "Administrador", "total": 5 }
  ],
  "evolucionRegistros": [
    { "periodo": "2024-01", "total": 25 },
    { "periodo": "2024-02", "total": 30 }
  ],
  "testsCompletados": [],
  "carrerasPorTipo": [
    { "tipo": "Grado", "total": 45 },
    { "tipo": "Posgrado", "total": 12 }
  ],
  "institucionesEstado": [
    { "estado": "Aprobado", "total": 10 },
    { "estado": "Pendiente", "total": 3 }
  ],
  "actividad": {
    "totalAccesos": 1250,
    "usuariosActivos": 95,
    "totalUsuarios": 150,
    "tasaActividad": 0.6333
  }
}
```

### Respuesta de `/api/v1/admin/stats/users`

```json
{
  "filters": {
    "from": "2024-01-01",
    "to": "2024-12-31",
    "provinceId": null
  },
  "carrerasFavoritas": [
    { "idCI": 123, "carrera": "Ingeniería en Sistemas", "total": 45 },
    { "idCI": 456, "carrera": "Medicina", "total": 38 }
  ],
  "topCarrerasCompatibilidad": []
}
```

## Manejo de Errores

El backend devuelve el código de error `ERR1` cuando:

- No hay datos en ninguna métrica solicitada
- Los filtros aplicados no devuelven resultados

Ejemplo de respuesta de error:

```json
{
  "errorCode": "ERR1",
  "message": "No se encontraron datos con los filtros aplicados."
}
```

El frontend captura este error y muestra el mensaje al usuario, invitándolo a cambiar los filtros.

## Limitaciones Conocidas

Según la implementación del backend:

1. **Tests completados**: La tabla `test` no tiene columna de fecha, por lo que `testsCompletados` siempre devuelve un array vacío `[]`.

2. **Top carreras por compatibilidad**: No hay datos suficientes para calcular esta métrica, por lo que `topCarrerasCompatibilidad` siempre devuelve un array vacío `[]`.

3. **Provincias**: El filtro por provincia es opcional. Si no se especifica o se pasa `'all'` o `'todas'`, se devuelven datos de todas las provincias.

## Instrucciones de Prueba

### Prueba 1: Estadísticas del Sistema

1. Navegar a la página "Uso y funcionamiento del sistema"
2. Seleccionar fecha desde y fecha hasta (obligatorias)
3. (Opcional) Seleccionar una provincia
4. Hacer clic en "Buscar"
5. Verificar que se muestren:
   - Total de usuarios por tipo
   - Evolución de registros por periodo (mes)
   - Carreras cargadas por tipo
   - Estado de solicitudes de instituciones
   - Tasa de actividad con porcentaje

**Casos de prueba:**

- ✅ Con fechas válidas y provincia específica
- ✅ Con fechas válidas sin provincia (todas)
- ❌ Sin seleccionar fechas (debe mostrar error)
- ❌ Con fecha "hasta" mayor a hoy (debe mostrar error)
- ❌ Con fecha "desde" mayor a fecha "hasta" (debe mostrar error)
- ❌ Con rango de fechas sin datos (debe mostrar mensaje ERR1)

### Prueba 2: Estadísticas de Comportamiento de Usuarios

1. Navegar a la página "Comportamiento general de los usuarios"
2. Seleccionar fecha desde y fecha hasta (obligatorias)
3. (Opcional) Seleccionar una provincia
4. Hacer clic en "Buscar"
5. Verificar que se muestren:
   - Carreras más marcadas como favoritas
   - Top carreras por compatibilidad (probablemente vacío)

**Casos de prueba:**

- ✅ Con fechas válidas y provincia específica
- ✅ Con fechas válidas sin provincia (todas)
- ❌ Sin seleccionar fechas (debe mostrar error)
- ❌ Con rango de fechas sin datos (debe mostrar mensaje ERR1)

### Prueba 3: Exportación de Datos

1. Generar estadísticas con filtros válidos
2. Hacer clic en botón "Exportar"
3. Seleccionar formato (CSV o PDF)
4. Verificar que se descargue el archivo
5. Abrir el archivo y verificar que contenga:
   - Encabezado con fecha de emisión
   - Filtros aplicados
   - Datos exportados correctamente

**Formatos a probar:**

- ✅ Exportar a CSV
- ✅ Exportar a PDF (nota: el PDF es básico, solo texto plano)

### Prueba 4: Verificación de Respuesta del Backend

Para verificar cómo llegan las respuestas del backend, abrir la consola del navegador (F12) y revisar la pestaña "Network". Buscar las peticiones a:

- `/api/v1/admin/stats/system`
- `/api/v1/admin/stats/users`

Verificar:

- ✅ Status code 200 (éxito)
- ✅ Status code 404 con errorCode "ERR1" (sin datos)
- ✅ Status code 400 (filtros inválidos)
- ✅ Estructura de la respuesta JSON coincide con los tipos definidos

## Ejemplo de Uso en Consola

Para probar manualmente la comunicación con el backend, puedes ejecutar en la consola del navegador:

```javascript
// Importar servicios (si estás en una página de estadísticas)
import { getSystemStats, getUserBehaviorStats } from './services/statistics';

// Probar estadísticas del sistema
const systemStats = await getSystemStats({
  from: '2024-01-01',
  to: '2024-12-31',
  provinceId: 5,
});
console.log('System Stats:', systemStats);

// Probar estadísticas de usuarios
const userStats = await getUserBehaviorStats({
  from: '2024-01-01',
  to: '2024-12-31',
});
console.log('User Stats:', userStats);
```

## Próximos Pasos (Opcional)

1. **Gráficos visuales**: Integrar una librería como Chart.js o Recharts para mostrar gráficos en lugar de tablas.
2. **PDF mejorado**: Integrar jsPDF para generar PDFs con mejor formato y gráficos.
3. **Cache de datos**: Implementar cache para evitar consultas repetidas con los mismos filtros.
4. **Filtros adicionales**: Agregar más filtros como rango de edades, tipos de usuario específicos, etc.

## Notas Importantes

- ⚠️ **Permisos**: Los endpoints requieren el permiso `VIEW_STATS`. Asegúrate de que el usuario tenga este permiso.
- ⚠️ **Filtros obligatorios**: Las fechas `from` y `to` son SIEMPRE obligatorias. El backend devolverá error 400 si no se envían.
- ⚠️ **Formato de fechas**: Deben estar en formato `YYYY-MM-DD`.
- ⚠️ **Tests completados y compatibilidad**: Estas métricas están vacías por limitaciones de la base de datos.

## Errores Conocidos a Corregir

En el archivo `statistics.ts` hay algunas funciones legacy de exportación (CSV/PDF) que aún usan nombres antiguos de propiedades. Estas funciones necesitan actualización:

- `downloadSystemStatsCSV`: líneas 264, 273, 279, 281, 289, 296, 303, 304, 305
- `downloadUserBehaviorStatsCSV`: líneas 345
- `downloadSystemStatsPDF`: líneas 397, 404, 405, 406, 409, 411, 418, 420
- `downloadUserBehaviorStatsPDF`: líneas 463, 465

Recomendación: Usar las funciones `exportSystemStats` y `exportUserStats` que llaman directamente a los endpoints de exportación del backend.
