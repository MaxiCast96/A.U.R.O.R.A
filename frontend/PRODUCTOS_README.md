# 🛍️ Sistema de Productos - Frontend

## Descripción General

Este sistema de productos conecta el frontend con el backend para mostrar, filtrar y gestionar productos de óptica (lentes, accesorios y productos personalizables) de manera eficiente y user-friendly.

## 🚀 Características Implementadas

### 1. **Conexión con Backend**
- ✅ Integración completa con API REST del backend
- ✅ Endpoints: `/api/lentes`, `/api/accesorios`, `/api/productosPersonalizados`
- ✅ Manejo automático de estados de carga, error y éxito
- ✅ Soporte para imágenes desde Cloudinary
- ✅ **NUEVO**: Hook personalizado `useApiData` con manejo robusto de errores
- ✅ **NUEVO**: Configuración centralizada de API con validaciones

### 2. **Navegación Inteligente**
- ✅ Navegación entre categorías de productos
- ✅ Rutas dinámicas: `/productos`, `/productos/lentes`, `/productos/accesorios`, `/productos/personalizables`
- ✅ Indicadores visuales de página activa
- ✅ Navegación responsive

### 3. **Sistema de Filtros Avanzado**
- ✅ **Búsqueda por texto**: Nombre y descripción del producto
- ✅ **Filtro por categoría**: Basado en datos del backend
- ✅ **Filtro por marca**: Integrado con API de marcas
- ✅ **Rango de precios**: Filtro personalizable min/max
- ✅ **Ordenamiento**: Por nombre, precio (asc/desc), marca
- ✅ **Vista dual**: Grid y Lista

### 4. **Visualización de Productos**
- ✅ **Vista Grid**: Tarjetas con imágenes, precios y badges
- ✅ **Vista Lista**: Información detallada en formato horizontal
- ✅ **Modal de detalles**: Información completa del producto
- ✅ **Indicadores de promoción**: Badges para productos en oferta
- ✅ **Imágenes responsivas**: Fallback a imágenes por defecto

### 5. **Componentes Reutilizables**
- ✅ `ProductNavigation`: Navegación entre categorías
- ✅ `ProductStats`: Estadísticas de productos
- ✅ `FeaturedProducts`: Productos destacados/en promoción
- ✅ `ProductTypeInfo`: Información específica por tipo
- ✅ `LoadingSpinner`: Indicador de carga atractivo
- ✅ `ErrorMessage`: Manejo de errores user-friendly
- ✅ `EmptyProducts`: Mensaje cuando no hay productos
- ✅ `ContactHelp`: Información de contacto y ayuda
- ✅ **NUEVO**: `ErrorBoundary`: Manejo de errores a nivel de componente

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos
```
frontend/src/
├── components/
│   ├── ProductNavigation.jsx      # Navegación principal
│   ├── ProductStats.jsx           # Estadísticas
│   ├── FeaturedProducts.jsx       # Productos destacados
│   ├── ProductTypeInfo.jsx        # Info del tipo
│   ├── LoadingSpinner.jsx         # Carga
│   ├── ErrorMessage.jsx           # Errores
│   ├── EmptyProducts.jsx          # Sin productos
│   ├── ContactHelp.jsx            # Contacto
│   └── ErrorBoundary.jsx          # Manejo de errores (NUEVO)
├── config/
│   └── api.js                     # Configuración de API (NUEVO)
├── hooks/
│   ├── useApiData.js              # Hook personalizado (NUEVO)
│   ├── useData.js                 # Hook anterior (deprecado)
│   └── useFetch.js                # Hook base para fetch
├── pages/public/
│   └── Producto.jsx               # Página principal
└── README.md                      # Documentación
```

### Flujo de Datos Mejorado
1. **Inicialización**: `useApiData` hook hace llamadas a la API con validaciones
2. **Validación**: Función `validateApiResponse` verifica estructura de datos
3. **Filtrado**: Función `filterProducts` aplica filtros en tiempo real
4. **Ordenamiento**: Función `sortProducts` ordena resultados
5. **Renderizado**: Componentes muestran datos filtrados/ordenados
6. **Manejo de Errores**: `ErrorBoundary` captura errores inesperados

## 🔧 Configuración y Uso

### 1. **Instalación de Dependencias**
```bash
cd frontend
npm install
```

### 2. **Variables de Entorno**
```env
# El backend debe estar configurado con:
VITE_API_BASE_URL=https://a-u-r-o-r-a.onrender.com/api
```

### 3. **Ejecutar en Desarrollo**
```bash
npm run dev
```

### 4. **Construir para Producción**
```bash
npm run build
```

## 📱 Rutas Disponibles

| Ruta | Descripción | Componente |
|------|-------------|------------|
| `/productos` | Todos los productos | Producto.jsx |
| `/productos/lentes` | Solo lentes | Producto.jsx |
| `/productos/accesorios` | Solo accesorios | Producto.jsx |
| `/productos/personalizables` | Solo productos personalizables | Producto.jsx |

## 🎨 Personalización

### Colores del Tema
```css
--primary-color: #0097c2
--secondary-color: #00b4e4
--accent-color: #0077a2
```

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid con fallbacks para navegadores antiguos

## 🔌 Integración con Backend

### Endpoints Utilizados
```javascript
// Lentes
GET /api/lentes
GET /api/lentes/:id

// Accesorios  
GET /api/accesorios
GET /api/accesorios/:id

// Productos Personalizados
GET /api/productosPersonalizados
GET /api/productosPersonalizados/:id

// Categorías y Marcas
GET /api/categoria
GET /api/marcas
```

### Estructura de Datos Esperada
```javascript
// Respuesta de la API
{
  success: true,
  data: [
    {
      _id: "string",
      nombre: "string",
      descripcion: "string",
      precioBase: "number",
      precioActual: "number",
      enPromocion: "boolean",
      imagenes: ["string"],
      marcaId: { _id: "string", nombre: "string" },
      categoriaId: { _id: "string", nombre: "string" },
      // ... otros campos según el tipo
    }
  ]
}
```

## 🚨 Manejo de Errores Mejorado

### **NUEVO**: Sistema de Manejo de Errores
- ✅ **ErrorBoundary**: Captura errores a nivel de componente
- ✅ **Validación de API**: Verifica estructura de respuestas
- ✅ **Reintentos automáticos**: Para errores de red
- ✅ **Timeouts configurables**: Evita solicitudes colgadas
- ✅ **Mensajes user-friendly**: Errores comprensibles para usuarios

### Tipos de Error Manejados
- **404**: Producto no encontrado
- **500**: Error del servidor
- **Network**: Problemas de conexión
- **Timeout**: Solicitud tardó demasiado
- **Validation**: Formato de datos incorrecto
- **Unexpected**: Errores inesperados del componente

### Estrategias de Recuperación
- ✅ Reintento automático para errores de red
- ✅ Validación robusta de datos de API
- ✅ Fallbacks para datos corruptos
- ✅ Mensajes de error contextuales
- ✅ Botones de acción claros

## 📊 Funcionalidades Avanzadas

### 1. **Búsqueda Inteligente**
- Búsqueda en tiempo real
- Filtrado por múltiples criterios
- Resultados ordenados por relevancia

### 2. **Gestión de Estado**
- Estado local para filtros
- Persistencia de preferencias del usuario
- Sincronización entre componentes

### 3. **Performance**
- Lazy loading de imágenes
- Debouncing en búsquedas
- Memoización de resultados filtrados
- **NUEVO**: Timeouts y reintentos configurables

## 🧪 Testing

### Componentes a Probar
- ✅ Filtros de productos
- ✅ Navegación entre categorías
- ✅ Modal de detalles
- ✅ Estados de carga y error
- ✅ Responsive design
- ✅ **NUEVO**: Manejo de errores y validaciones

### Casos de Uso
- Usuario busca productos específicos
- Usuario filtra por precio/categoría
- Usuario navega entre categorías
- Usuario ve detalles del producto
- Usuario contacta para ayuda
- **NUEVO**: Usuario experimenta errores de API

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas
- [ ] Carrito de compras integrado
- [ ] Wishlist de productos
- [ ] Comparador de productos
- [ ] Reviews y calificaciones
- [ ] Recomendaciones personalizadas
- [ ] Búsqueda por imagen
- [ ] Filtros avanzados (material, color, etc.)

### Optimizaciones Técnicas
- [ ] Implementar React Query para cache
- [ ] Lazy loading de componentes
- [ ] Service Worker para offline
- [ ] PWA capabilities
- [ ] Analytics y tracking

## 🐛 Correcciones Implementadas

### **Problema Resuelto**: Error de Iteración
- **Error**: `(accesorios || []) is not iterable`
- **Causa**: Los datos de la API no tenían la estructura esperada
- **Solución**: 
  - Creación del hook `useApiData` con validaciones robustas
  - Implementación de `ErrorBoundary` para manejo de errores
  - Validación centralizada de respuestas de API
  - Manejo de timeouts y reintentos automáticos

### **Mejoras de Robustez**
- ✅ Validación de arrays antes de iteración
- ✅ Fallbacks para datos corruptos o faltantes
- ✅ Manejo de errores de red con reintentos
- ✅ Timeouts configurables para evitar solicitudes colgadas
- ✅ Logging detallado para debugging

## 📞 Soporte

### Equipo de Desarrollo
- **Frontend**: [Tu Nombre]
- **Backend**: [Nombre del Backend Dev]
- **Design**: [Nombre del Designer]

### Canales de Comunicación
- 📧 Email: [email@ejemplo.com]
- 💬 Slack: [canal-slack]
- 📱 WhatsApp: [+503 1234-5678]

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.1.0  
**Estado**: ✅ Completado, Funcional y Corregido  
**Cambios**: Sistema de manejo de errores robusto implementado
