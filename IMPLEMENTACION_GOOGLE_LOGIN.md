# Implementación de Login con Google - Resumen de Cambios

## Archivos modificados

### 1. **package.json**

- ✅ Agregada dependencia: `@react-oauth/google`

### 2. **src/App.tsx**

- ✅ Importado `GoogleOAuthProvider` de `@react-oauth/google`
- ✅ Envuelta la aplicación con el provider de Google OAuth
- ✅ Configurado el Client ID desde variable de entorno `VITE_GOOGLE_CLIENT_ID`

### 3. **src/pages/auth/LoginPage.tsx**

- ✅ Importadas funciones: `loginGoogle` de `services/auth.js`
- ✅ Importados componentes: `GoogleLogin` y tipo `CredentialResponse`
- ✅ Agregada función `handleGoogleSuccess` para manejar login exitoso con Google
- ✅ Agregada función `handleGoogleError` para manejar errores de Google
- ✅ Agregado botón de Google en el UI
- ✅ Implementada lógica de navegación según rol del usuario

### 4. **src/pages/auth/LoginPage.module.css**

- ✅ Agregados estilos para `.divider` (separador "o")
- ✅ Agregados estilos para `.googleButton` (contenedor del botón)

### 5. **src/services/auth.js**

- ℹ️ Ya existía la función `loginGoogle(id_token)` que llama al endpoint `/api/v1/auth/google`

## Archivos nuevos

### 1. **.env.example**

- ✅ Archivo de ejemplo para variables de entorno
- ✅ Documenta `VITE_GOOGLE_CLIENT_ID`

### 2. **GOOGLE_OAUTH_README.md**

- ✅ Guía completa de configuración de Google OAuth
- ✅ Pasos para obtener el Client ID
- ✅ Configuración de Google Cloud Console
- ✅ Documentación del flujo de autenticación
- ✅ Solución de problemas comunes

### 3. **.gitignore** (actualizado)

- ✅ Agregadas reglas para ignorar archivos `.env`

## Flujo de funcionamiento

1. Usuario hace clic en "Iniciar sesión con Google"
2. Google muestra ventana de autenticación
3. Usuario autoriza la aplicación
4. Google devuelve un `id_token` (JWT firmado por Google)
5. La aplicación envía el `id_token` al backend:

   ```
   POST /api/v1/auth/google
   Content-Type: application/json

   {
     "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
   }
   ```

6. El backend valida el token con Google y devuelve:
   - Token JWT de la aplicación
   - Datos del usuario
   - Grupos y permisos
7. La aplicación almacena el token y redirige según el rol

## Configuración necesaria

### 1. Obtener Client ID de Google

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear o seleccionar un proyecto
3. Ir a **APIs & Services** → **Credentials**
4. Crear credenciales OAuth 2.0 Client ID
5. Configurar orígenes autorizados:
   - Desarrollo: `http://localhost:5173`
   - Producción: tu dominio
6. Copiar el Client ID

### 2. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

### 3. Reiniciar el servidor de desarrollo

```bash
npm run dev
```

## Endpoint del backend

El backend debe tener implementado el endpoint:

```
POST /api/v1/auth/google
Content-Type: application/json

Body:
{
  "id_token": "token_de_google"
}

Response:
{
  "token": "jwt_de_la_aplicacion",
  "usuario": { ... },
  "grupos": [ ... ],
  "permisos": [ ... ]
}
```

## Verificación

Para verificar que todo funciona:

1. ✅ El botón de Google aparece en la página de login
2. ✅ Al hacer clic, se abre la ventana de Google
3. ✅ Después de autorizar, se cierra la ventana
4. ✅ El usuario es autenticado y redirigido
5. ✅ El token se guarda en localStorage

## Próximos pasos

- [ ] Obtener el Client ID de Google Cloud Console
- [ ] Configurar la variable de entorno `VITE_GOOGLE_CLIENT_ID`
- [ ] Probar el flujo de login con Google
- [ ] Verificar que el backend valida correctamente el `id_token`
- [ ] Configurar la pantalla de consentimiento en Google Cloud Console
- [ ] Agregar el logo de la aplicación (opcional)

## Notas de seguridad

⚠️ **IMPORTANTE:**

- Nunca subas el archivo `.env` al repositorio
- Solo el Client ID va en el frontend (no el Client Secret)
- El Client Secret solo debe estar en el backend
- Usa HTTPS en producción
- Configura correctamente los dominios autorizados en Google Cloud Console

## Soporte

Para más información, consulta:

- `GOOGLE_OAUTH_README.md` - Guía detallada
- `.env.example` - Ejemplo de configuración
- [Documentación oficial de Google OAuth](https://developers.google.com/identity/protocols/oauth2)
