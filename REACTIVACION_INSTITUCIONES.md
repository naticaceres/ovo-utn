# Documentación: Reactivación de Instituciones

## Descripción General

Se ha implementado la funcionalidad para reactivar instituciones que han sido dadas de baja en el sistema. Esta funcionalidad permite a los administradores restaurar instituciones que previamente fueron desactivadas.

## Cambios Implementados

### 1. Servicio Backend (`admin.js`)

Se agregó la función `activateInstitution` que consume el endpoint de reactivación:

```javascript
export async function activateInstitution(id, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post(
      `/api/v1/admin/institutions/${id}/activate`,
      {},
      { headers }
    );
    return data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}
```

**Endpoint:** `POST /api/v1/admin/institutions/{id}/activate`

**Parámetros:**

- `id`: ID de la institución a reactivar
- `token`: Token de autenticación Bearer

### 2. Declaración de Tipos (`admin.d.ts`)

Se agregó la declaración de tipo TypeScript para la nueva función:

```typescript
export function activateInstitution(
  id: number | string,
  token?: string
): Promise<boolean>;
```

### 3. Interfaz de Usuario (`SolicitudesInstitucionPage.tsx`)

#### Estados Agregados

- `activatingId`: Rastrea qué institución se está reactivando actualmente

#### Funciones Agregadas

**`onActivate(id)`**: Maneja el proceso de reactivación de una institución

```typescript
const onActivate = async (id: number | string) => {
  setError(null);
  setActivatingId(id);
  try {
    const token = localStorage.getItem('token');
    await activateInstitution(id, token || undefined);
    loadData(); // Recargar la lista
  } catch (err) {
    console.error('Error activating institution:', err);
    setError('No se pudo reactivar la institución');
  } finally {
    setActivatingId(null);
  }
};
```

#### Cambios en la UI

1. **Botón de Reactivar**: Se agregó un botón "Reactivar" (color turquesa #17a2b8) que aparece cuando la institución está en estado:
   - `Baja`
   - `Inactiva`
   - `Desactivada`

2. **Estados de Carga**: El botón muestra "Reactivando..." mientras se procesa la solicitud

3. **Deshabilitación de Controles**: Todos los filtros y botones se deshabilitan durante el proceso de reactivación

4. **Separación de Estados**: Las instituciones rechazadas ahora solo muestran el texto "Rechazada" (sin opción de reactivar), mientras que las dadas de baja muestran el botón de reactivar

## Estados de Institución

| Estado                        | Acciones Disponibles             |
| ----------------------------- | -------------------------------- |
| Pendiente                     | Aprobar, Rechazar                |
| Aprobada                      | Dar de baja                      |
| Rechazada                     | Ninguna (solo texto informativo) |
| Baja / Inactiva / Desactivada | **Reactivar**                    |

## Flujo de Trabajo

### Reactivar una Institución

1. El administrador accede a **"Solicitudes de Instituciones"**
2. Filtra o busca instituciones con estado "Baja", "Inactiva" o "Desactivada"
3. Hace clic en el botón **"Reactivar"**
4. El sistema:
   - Muestra "Reactivando..." en el botón
   - Deshabilita todos los controles
   - Envía la petición al backend
   - Recarga la lista de instituciones
   - Muestra mensaje de error si falla
5. La institución cambia su estado a "Aprobada" (o el estado que el backend defina)

## Manejo de Errores

- Si la reactivación falla, se muestra el mensaje: **"No se pudo reactivar la institución"**
- Los errores se registran en la consola del navegador
- El estado de carga se limpia automáticamente después de la operación

## Seguridad

- Requiere token de autenticación Bearer
- Solo usuarios con permisos de administrador pueden acceder
- Todas las operaciones son auditables en el backend

## Ejemplo de Uso con cURL

```bash
curl -X POST http://ovotest.mooo.com:5000/api/v1/admin/institutions/5/activate \
  -H "Authorization: Bearer {{token}}" \
  -H "Content-Type: application/json"
```

## Consideraciones Técnicas

1. **Concurrencia**: Solo se puede reactivar una institución a la vez
2. **Recarga Automática**: Después de reactivar, la lista se actualiza automáticamente
3. **Estado Visual**: El botón utiliza color turquesa (#17a2b8) para diferenciarse de otros botones de acción
4. **Prevención de Doble Clic**: El botón se deshabilita durante el proceso para evitar múltiples solicitudes

## Testing

### Escenarios de Prueba

1. **Reactivación Exitosa**
   - Estado inicial: Baja/Inactiva/Desactivada
   - Acción: Clic en "Reactivar"
   - Resultado esperado: Institución cambia a estado activo

2. **Error de Red**
   - Simular desconexión
   - Verificar mensaje de error apropiado
   - Confirmar que el botón vuelve a estar habilitado

3. **Sin Permisos**
   - Usuario sin token válido
   - Verificar manejo de error 401/403

4. **Institución No Encontrada**
   - ID inexistente
   - Verificar mensaje de error 404

## Notas Adicionales

- Las instituciones **rechazadas** no pueden ser reactivadas (solo las dadas de baja)
- La diferencia entre "Rechazada" y "Baja":
  - **Rechazada**: Solicitud negada inicialmente, no reactivable
  - **Baja**: Institución aprobada previamente y luego desactivada, reactivable

## Próximas Mejoras Sugeridas

1. Agregar confirmación antes de reactivar (modal similar al de dar de baja)
2. Permitir agregar comentarios al reactivar
3. Mostrar historial de activaciones/desactivaciones
4. Notificar por email al representante de la institución cuando se reactive
