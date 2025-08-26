# OVO - Orientación Vocacional

Aplicación web para orientación vocacional que ayuda a los usuarios a explorar sus aptitudes y descubrir carreras recomendadas.

## 🚀 Características

- **Autenticación de usuarios** con registro e inicio de sesión
- **Cuestionario interactivo** para evaluar aptitudes
- **Mapa de aptitudes** visual con resultados personalizados
- **Recomendaciones de carreras** con enlaces a universidades
- **Interfaz moderna y responsive** construida con React 19
- **API mock completa** con JSON Server para desarrollo

## 🛠️ Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Validación**: Zod
- **Linting**: ESLint + Prettier
- **API Mock**: JSON Server
- **Estilos**: CSS Modules

## 📋 Requisitos

- Node.js 18+ (probado con v23.7.0)
- npm, yarn, o pnpm

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/naticaceres/ovo-utn.git
   cd ovo-utn
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar aplicación**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**
   - **App**: http://localhost:5173
   - **API**: http://localhost:3001

## 📁 Estructura del Proyecto

```
ovo-utn/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── features/           # Funcionalidades por dominio
│   ├── layouts/            # Layouts de la aplicación
│   ├── lib/                # Utilidades y configuración
│   │   └── api.ts         # Cliente API y tipos
│   ├── pages/              # Páginas de la aplicación
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── QuestionnairePage.tsx
│   │   └── ResultsPage.tsx
│   ├── routes/             # Configuración de rutas
│   │   └── AppRoutes.tsx
│   ├── styles/             # Estilos CSS Modules
│   └── types/              # Tipos TypeScript
├── server/                 # API Mock
│   ├── db.json            # Base de datos mock
│   └── routes.json        # Configuración de rutas API
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## 🔐 Credenciales de Demo

- **Email**: `demo@ovo.app`
- **Contraseña**: `demo123`

## 📊 Endpoints de la API

### Autenticación
- `GET /api/users?email=...` - Buscar usuario por email
- `POST /api/users` - Crear nuevo usuario

### Cuestionario
- `GET /api/questions` - Obtener preguntas del cuestionario
- `POST /api/answers` - Enviar respuestas del usuario

### Resultados
- `GET /api/recommendations` - Obtener recomendaciones de carreras

## 🎯 Flujo de la Aplicación

1. **Inicio** → Página principal con información del proyecto
2. **Registro/Login** → Autenticación de usuarios
3. **Cuestionario** → Evaluación de aptitudes (escala 1-5)
4. **Resultados** → Mapa de aptitudes y recomendaciones de carreras

## 🧪 Scripts Disponibles

```bash
npm run dev          # Inicia app + API mock
npm run build        # Construye para producción
npm run lint         # Ejecuta ESLint
npm run preview      # Vista previa de producción
npm run api          # Solo API mock (puerto 3001)
```

## 🎨 Buenas Prácticas Implementadas

### Arquitectura
- **Estructura feature-based** para mejor organización
- **Separación de responsabilidades** (UI/lógica)
- **Imports absolutos** con alias de TypeScript
- **Componentes pequeños y reutilizables**

### Desarrollo
- **TypeScript estricto** para type safety
- **ESLint + Prettier** para consistencia de código
- **React Query** para gestión de estado del servidor
- **CSS Modules** para estilos encapsulados

### UX/UI
- **Routing declarativo** con React Router
- **Formularios accesibles** con labels y ARIA
- **Estados de carga** y manejo de errores
- **Navegación intuitiva** con breadcrumbs

## 🔄 Estado del Desarrollo

### ✅ Completado (v0.0.1)
- [x] Scaffolding de React 19 + TypeScript + Vite
- [x] Configuración de ESLint, Prettier, y path aliases
- [x] Sistema de routing con React Router
- [x] API mock con JSON Server
- [x] Autenticación básica (login/signup)
- [x] Cuestionario funcional con preguntas dinámicas
- [x] Página de resultados con recomendaciones
- [x] Layout responsive con header/footer
- [x] Data fetching con React Query

### 🚧 En Desarrollo
- [ ] Protección de rutas (guards)
- [ ] Validación de formularios con Zod
- [ ] Gráfico de aptitudes interactivo
- [ ] Estilos mejorados según diseño del PDF
- [ ] Tests unitarios y de integración

### 📋 Próximas Funcionalidades
- [ ] Integración con Amazon Bedrock para IA
- [ ] Dashboard de administrador
- [ ] Exportación de resultados
- [ ] Notificaciones push
- [ ] PWA capabilities

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del trabajo final de la carrera de Ingeniería en Sistemas de la UTN.

---

## 📝 Release Notes - v0.0.1

### 🎉 Lanzamiento Inicial

**Fecha**: Agosto 2024

### ✨ Nuevas Funcionalidades
- **Aplicación base completa** con React 19 y TypeScript
- **Sistema de autenticación** con registro e inicio de sesión
- **Cuestionario interactivo** para evaluación de aptitudes
- **API mock completa** con JSON Server
- **Sistema de recomendaciones** de carreras
- **Routing y navegación** entre páginas
- **Layout responsive** con header y footer

### 🛠️ Mejoras Técnicas
- **Arquitectura moderna** siguiendo mejores prácticas 2025
- **Tooling completo** (ESLint, Prettier, TypeScript)
- **Data fetching optimizado** con React Query
- **Imports absolutos** para mejor mantenibilidad
- **CSS Modules** para estilos encapsulados

### 🐛 Correcciones
- Configuración inicial de JSON Server
- Estructura de archivos optimizada
- Tipos TypeScript completos

### 📚 Documentación
- README completo con instrucciones de instalación
- Estructura del proyecto documentada
- Scripts y comandos explicados
- Credenciales de demo incluidas

### 🔧 Configuración
- **Node.js**: v23.7.0
- **React**: v19.1.1
- **TypeScript**: v5.8.3
- **Vite**: v7.1.2

---

**Desarrollado para el proyecto final de Ingeniería en Sistemas - UTN**
