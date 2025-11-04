# Historial de Estados de Usuario - Implementación

## Fecha: 4 de noviembre de 2025

## Resumen

Se ha implementado la funcionalidad para visualizar el historial completo de estados de un usuario en la página de Gestión de Usuarios. Los administradores ahora pueden ver todos los cambios de estado que ha tenido un usuario a lo largo del tiempo.

## Cambios Realizados

### 1. **Servicio Backend** (`src/services/admin.js`)

Se agregó una nueva función para obtener el historial de estados de un usuario:

```javascript
export async function getUserStateHistory(userId, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get(
      `/api/v1/admin/catalog/users/${userId}/states`,
      { headers }
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
```

**Endpoint consumido:** `GET /api/v1/admin/catalog/users/{userId}/states`

### 2. **Declaración de Tipos** (`src/services/admin.d.ts`)

Se agregó la interfaz y declaración de tipo para TypeScript:

```typescript
export interface UserStateHistoryDTO {
  idEstadoUsuario: number;
  nombreEstadoUsuario: string;
  fechaInicio: string;
  fechaFin: string | null;
}

export function getUserStateHistory(
  userId: number | string,
  token?: string
): Promise<UserStateHistoryDTO[]>;
```

### 3. **Página de Usuarios** (`src/pages/admin/UsuariosPage.tsx`)

#### Estados agregados:

```typescript
const [showHistoryModal, setShowHistoryModal] = React.useState(false);
const [stateHistory, setStateHistory] = React.useState<UserStateHistoryDTO[]>(
  []
);
const [loadingHistory, setLoadingHistory] = React.useState(false);
const [selectedUserForHistory, setSelectedUserForHistory] = React.useState<{
  id: string | number;
  nombre: string;
} | null>(null);
```

#### Funciones agregadas:

1. **`openHistoryModal`**: Abre el modal y carga el historial de estados
2. **`closeHistoryModal`**: Cierra el modal y limpia los datos
3. **`formatDate`**: Formatea las fechas de manera legible

#### Nuevo botón en la tabla:

Se agregó un botón con icono de ojo (👁️) antes de los botones de Editar y Eliminar:

```tsx
<Button
  variant='outline'
  onClick={() => openHistoryModal(u.id, `${u.nombre} ${u.apellido}`.trim())}
  title='Ver historial de estados'
>
  👁️
</Button>
```

#### Modal de Historial:

El modal muestra una tabla con:

- **Estado**: Nombre del estado (con badge "Actual" para el estado vigente)
- **Fecha Inicio**: Fecha formateada de inicio del estado
- **Fecha Fin**: Fecha formateada de fin (o "Actualidad" si es el estado actual)
- **Duración**: Cálculo automático del tiempo en ese estado

**Características del modal:**

- Fondo destacado (azul claro) para el estado actual
- Formato de fechas legible: "4 de noviembre de 2025, 15:30"
- Cálculo inteligente de duración (días, meses, años)
- Loading spinner mientras carga
- Manejo de errores
- Scroll automático si hay muchos estados

## Estructura de Respuesta del Backend

```json
[
  {
    "fechaFin": null,
    "fechaInicio": "Sun, 14 Sep 2025 21:56:01 GMT",
    "idEstadoUsuario": 1,
    "nombreEstadoUsuario": "Activo"
  },
  {
    "fechaFin": "Sun, 14 Sep 2025 18:57:17 GMT",
    "fechaInicio": "Sun, 14 Sep 2025 21:55:36 GMT",
    "idEstadoUsuario": 3,
    "nombreEstadoUsuario": "Baja"
  },
  {
    "fechaFin": "Sun, 14 Sep 2025 21:45:41 GMT",
    "fechaInicio": "Sun, 14 Sep 2025 16:57:49 GMT",
    "idEstadoUsuario": 1,
    "nombreEstadoUsuario": "Activo"
  }
]
```

**Notas:**

- `fechaFin: null` indica que es el estado actual
- Los estados están ordenados del más reciente al más antiguo
- Las fechas vienen en formato GMT

## Interfaz de Usuario

### Tabla de Usuarios

Antes:

```
Nombre | Apellido | Email | Rol | Estado | [✏️] [🗑️]
```

Después:

```
Nombre | Apellido | Email | Rol | Estado | [👁️] [✏️] [🗑️]
```

### Modal de Historial

```
╔════════════════════════════════════════════════════════╗
║  Historial de Estados - Juan Pérez                    ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Estado      │ Fecha Inicio │ Fecha Fin   │ Duración ║
║  ─────────────────────────────────────────────────── ║
║  Activo [Actual] │ 14 sep 2025 │ Actualidad │ 51 días ║
║  Baja        │ 14 sep 2025  │ 14 sep 2025 │ 1 día    ║
║  Activo      │ 14 sep 2025  │ 14 sep 2025 │ 5 horas  ║
║                                                        ║
║                                      [Cerrar]         ║
╚════════════════════════════════════════════════════════╝
```

## Características Implementadas

### ✅ Funcionalidades

1. **Visualización completa del historial**: Muestra todos los estados por los que ha pasado el usuario
2. **Estado actual destacado**: El estado vigente (sin fecha fin) se muestra con fondo azul claro y badge verde
3. **Formato de fechas amigable**: Las fechas se muestran en español con hora incluida
4. **Cálculo de duración**: Calcula automáticamente cuánto tiempo estuvo en cada estado
5. **Manejo de errores**: Muestra mensajes claros si no se puede cargar el historial
6. **Loading state**: Indica visualmente cuando está cargando los datos
7. **Scroll en tablas largas**: Si hay muchos estados, el modal tiene scroll interno

### ✅ UX/UI

1. **Icono intuitivo**: Ojo (👁️) para "ver" el historial
2. **Tooltip**: Al pasar el mouse sobre el botón, muestra "Ver historial de estados"
3. **Diseño consistente**: Usa los mismos estilos del modal de edición
4. **Responsive**: La tabla se adapta al contenido
5. **Feedback visual**: Loading, errores y estados vacíos bien manejados

### ✅ Seguridad

1. **Autenticación**: Requiere token válido
2. **Permisos**: Respeta los permisos del backend (VIEW_USERS o similar)
3. **Validación**: Maneja errores 401, 403, 404, etc.

## Cómo Usar

### Para el Administrador:

1. Ir a **Seguridad** → **Gestionar Usuarios**
2. En la tabla de usuarios, hacer clic en el icono del ojo (👁️) en la columna "Acciones"
3. Se abrirá un modal mostrando todo el historial de estados del usuario
4. Revisar los cambios de estado, fechas y duraciones
5. Cerrar el modal con el botón "Cerrar"

### Información Mostrada:

- **Estado**: Nombre del estado (Activo, Bloqueado, Baja, etc.)
- **Fecha Inicio**: Cuándo comenzó ese estado
- **Fecha Fin**: Cuándo finalizó (o "Actualidad" si es el estado actual)
- **Duración**: Tiempo transcurrido en ese estado

### Ejemplo de Interpretación:

```
Estado: Activo [Actual]
Fecha Inicio: 14 de septiembre de 2025, 21:56
Fecha Fin: Actualidad
Duración: 51 días
```

Esto significa que el usuario está actualmente en estado "Activo" desde el 14 de septiembre a las 21:56 y lleva 51 días en este estado.

## Casos de Uso

### 1. Auditoría de Usuarios

Cuando se necesita investigar la actividad de un usuario:

- Ver cuándo fue dado de baja
- Ver cuándo fue reactivado
- Ver el historial completo de cambios

### 2. Resolución de Problemas

Si un usuario reporta que no puede acceder:

- Verificar rápidamente su estado actual
- Ver cuándo cambió su estado
- Identificar si fue bloqueado o dado de baja

### 3. Cumplimiento Normativo

Para reportes de auditoría:

- Demostrar trazabilidad de cambios de estado
- Documentar cuándo se tomaron acciones administrativas
- Mantener registro histórico de estados

## Pruebas Recomendadas

### Test 1: Usuario con múltiples estados

1. Crear un usuario
2. Cambiar su estado varias veces (Activo → Bloqueado → Activo → Baja)
3. Ver el historial y verificar que todos los cambios aparezcan

### Test 2: Usuario con un solo estado

1. Crear un usuario nuevo
2. Ver el historial
3. Verificar que solo aparezca el estado inicial

### Test 3: Formato de fechas

1. Abrir el historial de cualquier usuario
2. Verificar que las fechas se vean en español y sean legibles
3. Verificar que el cálculo de duración sea correcto

### Test 4: Estado actual

1. Verificar que el estado actual tenga:
   - Fondo azul claro
   - Badge verde "Actual"
   - Fecha fin = "Actualidad"

### Test 5: Manejo de errores

1. Desconectar el backend
2. Intentar ver el historial
3. Verificar que muestre un mensaje de error apropiado

## Notas Técnicas

### Formato de Fechas del Backend

El backend devuelve fechas en formato GMT:

```
"Sun, 14 Sep 2025 21:56:01 GMT"
```

El frontend las convierte a:

```
"14 de septiembre de 2025, 21:56"
```

### Cálculo de Duración

El cálculo se hace de manera inteligente:

- **< 1 día**: "Menos de 1 día"
- **1 día**: "1 día"
- **< 30 días**: "X días"
- **< 365 días**: "X meses"
- **≥ 365 días**: "X años"

### Ordenamiento

Los estados se muestran en el orden que vienen del backend (generalmente del más reciente al más antiguo).

## Posibles Mejoras Futuras

1. **Exportar historial**: Botón para descargar el historial como CSV o PDF
2. **Filtros de fecha**: Filtrar el historial por rango de fechas
3. **Gráfico de línea de tiempo**: Visualización gráfica del historial
4. **Notas de cambio**: Si el backend las proporciona, mostrar notas explicando cada cambio
5. **Usuario que realizó el cambio**: Si el backend lo proporciona, mostrar quién cambió el estado
6. **Búsqueda en historial**: Buscar estados específicos
7. **Paginación**: Si un usuario tiene muchos estados, paginar los resultados

## Endpoints Relacionados

- **GET** `/api/v1/admin/catalog/users/{userId}/states` - Obtiene el historial de estados
- **PUT** `/api/v1/admin/users/{userId}` - Actualiza el usuario (incluye cambio de estado)

## Permisos Requeridos

Para ver el historial de estados, el usuario administrador necesita tener los permisos apropiados (probablemente `VIEW_USERS` o `MANAGE_USERS`).

---

**Implementado por:** GitHub Copilot  
**Fecha:** 4 de noviembre de 2025  
**Versión:** 1.0
