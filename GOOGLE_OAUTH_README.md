# Configuración de Google OAuth

Este documento explica cómo configurar el inicio de sesión con Google en la aplicación OVO-UTN.

## Prerrequisitos

1. Una cuenta de Google Cloud Platform
2. Un proyecto creado en Google Cloud Console

## Pasos de configuración

### 1. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona o crea un proyecto
3. Habilita la API de Google+ (Google+ API)
4. Ve a **Credenciales** en el menú lateral

### 2. Crear credenciales OAuth 2.0

1. Haz clic en **Crear credenciales** → **ID de cliente de OAuth**
2. Selecciona **Aplicación web** como tipo de aplicación
3. Configura los orígenes autorizados de JavaScript:
   - Para desarrollo local: `http://localhost:5173`
   - Para producción: tu dominio (ej: `https://tu-dominio.com`)
4. Configura los URI de redirección autorizados:
   - Para desarrollo local: `http://localhost:5173`
   - Para producción: tu dominio (ej: `https://tu-dominio.com`)
5. Haz clic en **Crear**
6. Copia el **Client ID** que se genera

### 3. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`)
2. Agrega tu Client ID:

```env
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
```

### 4. Configurar la pantalla de consentimiento OAuth

1. Ve a **Pantalla de consentimiento de OAuth** en Google Cloud Console
2. Configura los siguientes campos:
   - Nombre de la aplicación: "OVO-UTN"
   - Email de soporte al usuario
   - Logotipo de la aplicación (opcional)
   - Dominios autorizados
3. Agrega los alcances necesarios:
   - `email`
   - `profile`
   - `openid`

## Flujo de autenticación

1. El usuario hace clic en "Iniciar sesión con Google"
2. Se abre una ventana de Google para iniciar sesión
3. El usuario autoriza la aplicación
4. Google devuelve un `id_token`
5. La aplicación envía el `id_token` al backend en el endpoint `/api/v1/auth/google`
6. El backend valida el token y devuelve:
   - Token JWT de la aplicación
   - Datos del usuario
   - Grupos y permisos del usuario
7. La aplicación almacena el token y redirige según el rol del usuario

## Endpoint del backend

```bash
POST /api/v1/auth/google
Content-Type: application/json

{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

Respuesta esperada:

```json
{
  "token": "jwt_token_aqui",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com"
  },
  "grupos": ["Estudiante"],
  "permisos": [...]
}
```

## Estructura del código

- **App.tsx**: Envuelve la aplicación con `GoogleOAuthProvider`
- **LoginPage.tsx**: Contiene el botón de Google y maneja la respuesta
- **auth.js**: Contiene la función `loginGoogle` que envía el token al backend

## Notas de seguridad

- Nunca expongas el Client Secret en el frontend
- Solo el Client ID debe estar en las variables de entorno del frontend
- El backend debe validar el `id_token` con Google
- Usa HTTPS en producción
- Configura correctamente los dominios autorizados

## Solución de problemas

### Error: "Invalid client ID"

- Verifica que el Client ID en `.env` sea correcto
- Asegúrate de que el dominio esté en los orígenes autorizados

### Error: "Redirect URI mismatch"

- Verifica que la URL de tu aplicación esté en los URI de redirección autorizados
- Asegúrate de incluir el protocolo (http:// o https://)

### El botón de Google no aparece

- Verifica que `VITE_GOOGLE_CLIENT_ID` esté configurado
- Revisa la consola del navegador para ver errores
- Asegúrate de que el paquete `@react-oauth/google` esté instalado

## Referencias

- [Documentación de Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentación de @react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
