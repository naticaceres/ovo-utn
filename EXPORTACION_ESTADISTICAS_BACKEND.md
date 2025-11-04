# 📤 Exportación de Estadísticas desde Backend

## ✅ Implementación Completada

Las funciones de exportación de estadísticas ahora se realizan completamente desde el **backend**, descargando archivos CSV y PDF generados por el servidor.

---

## 🔄 Cambios Realizados

### 1. **src/services/statistics.ts**

Se reemplazaron las funciones de exportación para que llamen a los endpoints del backend:

#### Funciones Actualizadas:

##### `downloadSystemStatsCSV()`

```typescript
export async function downloadSystemStatsCSV(
  filtros: { fechaDesde?: string; fechaHasta?: string },
  token?: string
): Promise<void>;
```

- **Endpoint:** `GET /api/v1/admin/stats/system/export?from=...&to=...&format=csv`
- **Parámetros:** `from`, `to`, `format=csv`
- **Tipo respuesta:** `blob` (archivo CSV)

##### `downloadSystemStatsPDF()`

```typescript
export async function downloadSystemStatsPDF(
  filtros: { fechaDesde?: string; fechaHasta?: string },
  token?: string
): Promise<void>;
```

- **Endpoint:** `GET /api/v1/admin/stats/system/export?from=...&to=...&format=pdf`
- **Parámetros:** `from`, `to`, `format=pdf`
- **Tipo respuesta:** `blob` (archivo PDF)

##### `downloadUserBehaviorStatsCSV()`

```typescript
export async function downloadUserBehaviorStatsCSV(
  filtros: { fechaDesde?: string; fechaHasta?: string },
  token?: string
): Promise<void>;
```

- **Endpoint:** `GET /api/v1/admin/stats/users/export?from=...&to=...&format=csv`
- **Parámetros:** `from`, `to`, `format=csv`
- **Tipo respuesta:** `blob` (archivo CSV)

##### `downloadUserBehaviorStatsPDF()`

```typescript
export async function downloadUserBehaviorStatsPDF(
  filtros: { fechaDesde?: string; fechaHasta?: string },
  token?: string
): Promise<void>;
```

- **Endpoint:** `GET /api/v1/admin/stats/users/export?from=...&to=...&format=pdf`
- **Parámetros:** `from`, `to`, `format=pdf`
- **Tipo respuesta:** `blob` (archivo PDF)

---

### 2. **src/pages/admin/SystemUsageStatsPage.tsx**

#### Función `handleExport()` actualizada:

```typescript
const handleExport = async (format: 'pdf' | 'csv') => {
  setShowExportModal(false);

  if (!filtrosAplicados.fechaDesde || !filtrosAplicados.fechaHasta) {
    setError('Debe aplicar filtros de fecha antes de exportar');
    return;
  }

  try {
    setLoading(true);
    if (format === 'csv') {
      await downloadSystemStatsCSV(filtrosAplicados, token);
    } else {
      await downloadSystemStatsPDF(filtrosAplicados, token);
    }
  } catch (err) {
    const error = err as { message?: string };
    setError(
      error.message || 'Error al exportar. Por favor, intente nuevamente.'
    );
  } finally {
    setLoading(false);
  }
};
```

**Cambios clave:**

- ✅ Ahora es `async`
- ✅ Solo pasa `filtrosAplicados` y `token` (no `statsData` ni `filename`)
- ✅ Valida que existan fechas antes de exportar
- ✅ Muestra loading durante la descarga
- ✅ Maneja errores correctamente

---

### 3. **src/pages/admin/UserBehaviorStatsPage.tsx**

#### Función `handleExport()` actualizada:

```typescript
const handleExport = async (format: 'pdf' | 'csv') => {
  setShowExportModal(false);

  if (!filtrosAplicados.fechaDesde || !filtrosAplicados.fechaHasta) {
    setError('Debe aplicar filtros de fecha antes de exportar');
    return;
  }

  try {
    setLoading(true);
    if (format === 'csv') {
      await downloadUserBehaviorStatsCSV(filtrosAplicados, token);
    } else {
      await downloadUserBehaviorStatsPDF(filtrosAplicados, token);
    }
  } catch (err) {
    const error = err as { message?: string };
    setError(
      error.message || 'Error al exportar. Por favor, intente nuevamente.'
    );
  } finally {
    setLoading(false);
  }
};
```

**Cambios clave:**

- ✅ Mismo patrón que SystemUsageStatsPage
- ✅ Async/await para manejar promesas
- ✅ Validación de filtros
- ✅ Loading state

---

## 🔌 Endpoints del Backend

### Estadísticas del Sistema

#### CSV

```bash
GET /api/v1/admin/stats/system/export?from=2025-08-01&to=2025-09-01&format=csv
Authorization: Bearer {token}
```

#### PDF

```bash
GET /api/v1/admin/stats/system/export?from=2025-08-01&to=2025-09-01&format=pdf
Authorization: Bearer {token}
```

### Estadísticas de Usuarios

#### CSV

```bash
GET /api/v1/admin/stats/users/export?from=2025-08-01&to=2025-09-01&format=csv
Authorization: Bearer {token}
```

#### PDF

```bash
GET /api/v1/admin/stats/users/export?from=2025-08-01&to=2025-09-01&format=pdf
Authorization: Bearer {token}
```

---

## 📋 Parámetros de Query

| Parámetro | Tipo   | Requerido | Descripción               |
| --------- | ------ | --------- | ------------------------- |
| `from`    | string | ✅ Sí     | Fecha inicio (YYYY-MM-DD) |
| `to`      | string | ✅ Sí     | Fecha fin (YYYY-MM-DD)    |
| `format`  | string | ✅ Sí     | Formato: `csv` o `pdf`    |

---

## 🔄 Flujo de Exportación

### Antes (Frontend)

```
Usuario → Click Exportar → Frontend genera archivo → Descarga
```

### Ahora (Backend)

```
Usuario → Click Exportar →
  → Request al backend con filtros →
  → Backend genera archivo (CSV/PDF) →
  → Devuelve blob →
  → Frontend descarga blob
```

---

## ✨ Ventajas de la Nueva Implementación

### 1. **Centralización**

- ✅ Toda la lógica de generación está en el backend
- ✅ Fácil mantenimiento y actualizaciones
- ✅ Consistencia en formato entre frontend y otros clientes

### 2. **Seguridad**

- ✅ El backend controla qué datos se exportan
- ✅ Aplica permisos y validaciones
- ✅ Token de autenticación obligatorio

### 3. **Performance**

- ✅ El backend puede optimizar queries pesadas
- ✅ Procesamiento más rápido en servidor
- ✅ Menor carga en el navegador del cliente

### 4. **Formato Profesional**

- ✅ PDFs generados con librerías profesionales (reportlab, etc.)
- ✅ CSVs con encoding correcto
- ✅ Formato consistente y bien estructurado

---

## 🧪 Cómo Probar

### 1. Probar con CURL (Backend directo)

#### CSV del sistema:

```bash
curl --location 'http://ovotest.mooo.com:5000/api/v1/admin/stats/system/export?from=2025-08-01&to=2025-09-01&format=csv' \
--header 'Authorization: Bearer TU_TOKEN' \
--output estadisticas-sistema.csv
```

#### PDF de usuarios:

```bash
curl --location 'http://ovotest.mooo.com:5000/api/v1/admin/stats/users/export?from=2025-08-01&to=2025-09-01&format=pdf' \
--header 'Authorization: Bearer TU_TOKEN' \
--output estadisticas-usuarios.pdf
```

### 2. Probar desde el Frontend

1. **Iniciar sesión** como administrador
2. **Navegar** a Estadísticas
3. **Seleccionar filtros** de fecha (obligatorio)
4. **Click en "Buscar"** para ver las estadísticas
5. **Click en "Exportar"**
6. **Seleccionar formato** (CSV o PDF)
7. **El archivo se descarga** automáticamente

---

## 📝 Nombres de Archivos Generados

### Uso y funcionamiento del sistema:

- CSV: `uso-funcionamiento-sistema-{fechaDesde}-{fechaHasta}.csv`
- PDF: `uso-funcionamiento-sistema-{fechaDesde}-{fechaHasta}.pdf`

**Ejemplo:**

- `uso-funcionamiento-sistema-2025-08-01-2025-09-01.csv`
- `uso-funcionamiento-sistema-2025-08-01-2025-09-01.pdf`

### Comportamiento de usuarios:

- CSV: `comportamiento-usuarios-{fechaDesde}-{fechaHasta}.csv`
- PDF: `comportamiento-usuarios-{fechaDesde}-{fechaHasta}.pdf`

**Ejemplo:**

- `comportamiento-usuarios-2025-08-01-2025-09-01.csv`
- `comportamiento-usuarios-2025-08-01-2025-09-01.pdf`

---

## ⚠️ Validaciones

### Frontend

- ✅ Valida que existan `fechaDesde` y `fechaHasta` antes de exportar
- ✅ Muestra mensaje de error si faltan fechas
- ✅ Muestra loading durante la descarga
- ✅ Maneja errores del backend

### Backend (esperado)

- ✅ Valida formato de fechas
- ✅ Valida que `from` ≤ `to`
- ✅ Valida token de autenticación
- ✅ Valida permisos de administrador
- ✅ Retorna errores descriptivos

---

## 🐛 Manejo de Errores

### Errores comunes:

| Error                                       | Causa                   | Solución                   |
| ------------------------------------------- | ----------------------- | -------------------------- |
| "Las fechas son obligatorias para exportar" | No se aplicaron filtros | Buscar con filtros primero |
| "Error al descargar CSV/PDF"                | Backend no responde     | Verificar backend activo   |
| Error 401                                   | Token inválido          | Volver a iniciar sesión    |
| Error 403                                   | Sin permisos            | Usuario debe ser admin     |

---

## 📊 Tipo de Respuesta del Backend

```typescript
// Response con blob
response.data: Blob
Content-Type: text/csv (para CSV) | application/pdf (para PDF)
Content-Disposition: attachment; filename="..."
```

---

## 🎯 Resultado Final

✅ **Exportación de estadísticas completamente funcional desde el backend**
✅ **Soporte para CSV y PDF**
✅ **Validaciones completas**
✅ **Manejo de errores robusto**
✅ **UX mejorada con loading states**
✅ **Código limpio y mantenible**

---

**¡Listo para usar!** 🚀
