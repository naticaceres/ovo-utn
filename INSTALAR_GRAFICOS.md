# Instalación de Gráficos para Estadísticas

## ⚠️ Instrucciones Importantes

Para poder ver los gráficos en las páginas de estadísticas, necesitas instalar la librería **Recharts**.

### Pasos para instalar:

1. **Abre una terminal CMD** (no PowerShell, ya que tiene problemas de permisos)

2. **Navega a la carpeta del proyecto:**

   ```cmd
   cd c:\Users\bunamax\Desktop\proyecto\ovo-utn
   ```

3. **Ejecuta el comando de instalación:**

   ```cmd
   npm install
   ```

   Esto instalará recharts y todas las dependencias necesarias.

## 📊 Gráficos Implementados

### Página: **Uso y funcionamiento del sistema**

- ✅ **Usuarios por tipo** → Gráfico de torta (Pie Chart)
- ✅ **Evolución de registros** → Gráfico de líneas (Line Chart)
- ✅ **Tests completados por mes** → Gráfico de barras horizontal (Bar Chart)
- ✅ **Carreras por tipo** → Gráfico de barras vertical (Bar Chart)
- ℹ️ **Estado de instituciones** → Tabla (con badges de colores)

### Página: **Comportamiento general de usuarios**

- ✅ **Carreras más favoritas** → Gráfico de barras horizontal (Top 10)
- ✅ **Top compatibilidad** → Gráfico de barras horizontal con porcentajes (Top 10)

## 🎨 Características de los gráficos:

- **Responsivos:** Se adaptan al tamaño de la pantalla
- **Interactivos:** Tooltip al pasar el mouse
- **Coloridos:** Colores distintivos para cada dato
- **Etiquetas:** Valores visibles en los gráficos
- **Leyendas:** Identificación clara de cada serie de datos

## 🚀 Una vez instalado

1. Reinicia el servidor de desarrollo si estaba corriendo:

   ```cmd
   npm run dev
   ```

2. Navega a las páginas de estadísticas en el sistema

3. ¡Disfruta de las visualizaciones!

---

**Nota:** Los archivos ya están modificados con los gráficos. Solo falta instalar la dependencia.
