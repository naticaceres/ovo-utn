# 🔄 Recuperación de Tests en Progreso

## 📋 Resumen

Se ha implementado un sistema de recuperación automática de tests en progreso que permite a los usuarios continuar un test vocacional desde donde lo dejaron, incluso si cierran el navegador o salen de la página.

## ✨ Características Implementadas

### 1. **Detección Automática de Tests en Progreso**

- Al entrar a la página del test, el sistema verifica automáticamente si existe un `testId` guardado en localStorage
- Si encuentra un test en progreso, intenta recuperar su estado desde el backend
- Muestra un mensaje de bienvenida diferente cuando detecta un test en progreso

### 2. **Recuperación del Historial**

- El sistema obtiene todo el historial de conversación del test interrumpido
- Restaura todos los mensajes (preguntas y respuestas) en el orden correcto
- El usuario puede ver inmediatamente dónde se quedó

### 3. **Opciones para el Usuario**

Cuando se detecta un test en progreso, el usuario tiene dos opciones:

- **Continuar test**: Reanuda el test exactamente donde lo dejó
- **Comenzar nuevo test**: Inicia un test completamente nuevo (se advierte que se perderá el progreso anterior)

### 4. **Limpieza Automática**

- Si un test ya fue completado, el sistema limpia automáticamente el localStorage
- No muestra opciones de recuperación para tests ya finalizados

## 🔧 Archivos Modificados

### Backend (Necesario implementar)

```javascript
// Nuevo endpoint en el backend
GET /api/v1/tests/:testId/status

// Respuesta esperada:
{
  "fullHistory": [
    { "role": "assistant", "content": "¿Qué te gusta hacer en tu tiempo libre?" },
    { "role": "user", "content": "Me gusta programar y resolver problemas" },
    // ... más mensajes
  ],
  "status": "in_progress" | "completed",
  "testId": 123
}
```

### Frontend

1. **`src/services/tests.js`**
   - ✅ Agregada función `getTestStatus(testId)` para obtener el estado del test

2. **`src/services/tests.d.ts`**
   - ✅ Agregados tipos TypeScript para `getTestStatus`

3. **`src/context/api.ts`**
   - ✅ Agregada función `getTestStatus` exportable
   - ✅ Definidos tipos de respuesta

4. **`src/pages/questionnaire/QuestionnairePage.tsx`**
   - ✅ Agregado estado `isRecovering` para mostrar carga inicial
   - ✅ Agregado estado `hasInProgressTest` para detectar tests pendientes
   - ✅ Agregado `useEffect` para recuperar test al montar el componente
   - ✅ Modificada pantalla de bienvenida con dos opciones cuando hay test en progreso
   - ✅ Lógica para convertir historial recuperado a mensajes del chat

5. **`src/pages/questionnaire/QuestionnairePage.module.css`**
   - ✅ Agregados estilos para `.warningBox` (mensaje de advertencia)

## 📝 Flujo de Uso

### Escenario 1: Usuario interrumpe el test

1. Usuario inicia un test vocacional
2. Responde algunas preguntas
3. Cierra el navegador o sale de la página
4. **Al regresar**: El sistema detecta el test en progreso
5. Muestra mensaje: "¡Bienvenido de nuevo! Detectamos que tienes un test en progreso"
6. Usuario elige "Continuar test"
7. Se cargan todos los mensajes previos
8. Usuario continúa desde donde lo dejó

### Escenario 2: Usuario quiere empezar de nuevo

1. Usuario regresa y hay un test en progreso
2. Sistema muestra las dos opciones
3. Usuario selecciona "Comenzar nuevo test"
4. Se advierte que se perderá el progreso anterior
5. Se inicia un nuevo test desde cero
6. El `testId` anterior se sobrescribe

### Escenario 3: Test ya completado

1. Usuario completa un test
2. Ve los resultados
3. Al intentar volver a la página del test
4. El sistema detecta que el test está completado
5. Limpia el localStorage automáticamente
6. Muestra la pantalla de inicio normal

## 🎨 Interfaz de Usuario

### Pantalla de Recuperación

```
┌─────────────────────────────────────────┐
│  Test de Orientación Vocacional         │
├─────────────────────────────────────────┤
│                                         │
│  👋 ¡Bienvenido de nuevo!               │
│                                         │
│  Detectamos que tienes un test en      │
│  progreso. ¿Deseas continuar donde     │
│  lo dejaste o prefieres comenzar un    │
│  nuevo test?                            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⚠️ Nota: Si comienzas un nuevo   │ │
│  │ test, se perderá el progreso del  │ │
│  │ test anterior.                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Continuar test] [Comenzar nuevo test]│
│                                         │
└─────────────────────────────────────────┘
```

## 🔍 Detalles Técnicos

### LocalStorage

```javascript
// Clave utilizada
localStorage.setItem('testId', '123');
localStorage.getItem('testId'); // '123'
localStorage.removeItem('testId'); // Limpia al completar
```

### Estructura de Historial

```typescript
interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}
```

### Estados del Test

- `in_progress`: Test iniciado pero no completado
- `completed`: Test finalizado con resultados disponibles

## 🐛 Manejo de Errores

- Si el backend no responde, se limpia el localStorage
- Si el `testId` es inválido, se muestra pantalla de inicio normal
- Si hay error de red, se muestra mensaje apropiado
- Si el test ya no existe, se limpia automáticamente

## ⚠️ Consideraciones Importantes

1. **Seguridad**: El sistema solo permite recuperar tests del usuario actual (verificado en backend)
2. **Privacidad**: El historial se guarda solo mientras el test está activo
3. **Expiración**: Los tests en progreso pueden tener un tiempo de expiración en el backend (recomendado: 7 días)
4. **Sincronización**: El sistema siempre consulta el backend para verificar el estado real del test

## 🚀 Próximas Mejoras

- [ ] Agregar indicador visual del progreso del test (ej: "12 de 50 preguntas respondidas")
- [ ] Implementar guardado automático cada N respuestas como backup adicional
- [ ] Agregar opción de "Pausar test" explícita con recordatorio
- [ ] Notificación por email para tests pausados por más de X días
- [ ] Permitir múltiples tests en progreso (uno por tipo de test)

## 📞 Soporte

Si tienes preguntas o encuentras problemas con esta funcionalidad:

1. Verifica que el endpoint `/api/v1/tests/:testId/status` esté implementado en el backend
2. Revisa la consola del navegador para errores
3. Verifica que el localStorage tenga el `testId` guardado
4. Asegúrate de que el usuario tenga los permisos necesarios

---

**Última actualización**: 4 de noviembre de 2025
**Versión**: 1.0.0
