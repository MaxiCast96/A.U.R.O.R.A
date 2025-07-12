# Proyecto A.U.R.O.R.A

![Logo del proyecto](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeSP1tTjjpFSC_UfBfzaTO3R2i_Z_cIxbnIARcPaZlnBNPUHzQa58ogB3wfKNc7MwRynU&usqp=CAU)

## Descripción del Proyecto
**Advanced Unified Retail & Optical Resource Administration (A.U.R.O.R.A)** es un sistema integral diseñado para la administración eficiente de catálogos y citas en **Óptica Inteligente**.

El sistema está desarrollado utilizando las tecnologías **MERN** (MongoDB, Express, React, Node.js), lo que garantiza robustez, escalabilidad y una experiencia fluida para los usuarios.

## Características Principales
- 📋 **Gestión de Catálogos**: Administra productos ópticos de manera eficiente.
- 📆 **Gestión de Citas**: Organiza y programa citas con clientes fácilmente.
- ⚡ **Interfaz Intuitiva**: Una experiencia de usuario optimizada y amigable.
- 🔐 **Sistema de Autenticación**: Login, registro y recuperación de contraseñas.
- 📊 **Dashboard Administrativo**: Estadísticas y gráficas en tiempo real.
- 📱 **Diseño Responsive**: Adaptable a todos los dispositivos.

## Tecnologías Utilizadas

### Frontend
- **React.js**: Librería frontend para interfaces interactivas
- **Vite**: Build tool y servidor de desarrollo
- **Tailwind CSS**: Framework de CSS para diseño responsive
- **Framer Motion**: Animaciones y transiciones
- **Axios**: Cliente HTTP para peticiones al backend
- **React Router**: Navegación entre páginas
- **Lucide React**: Iconos modernos

### Backend
- **Node.js**: Entorno de ejecución para el backend
- **Express.js**: Framework backend para Node.js
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación con tokens
- **bcryptjs**: Encriptación de contraseñas
- **Cloudinary**: Almacenamiento de imágenes
- **Nodemailer**: Envío de emails
- **Multer**: Manejo de archivos

## Estructura del Proyecto

```
A.U.R.O.R.A/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de la API
│   │   └── config.js        # Configuración
│   ├── uploads/             # Archivos temporales
│   ├── app.js              # Configuración de Express
│   ├── database.js         # Conexión a MongoDB
│   └── index.js            # Punto de entrada
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Admin/       # Componentes administrativos
│   │   │   ├── auth/        # Autenticación
│   │   │   ├── layout/      # Layout principal
│   │   │   └── ui/          # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas de la aplicación
│   │   └── assets/          # Recursos estáticos
│   ├── public/              # Archivos públicos
│   └── index.html           # HTML principal
└── README.md
```

## Nomenclatura del Proyecto

### Convenciones de Nomenclatura

#### Archivos y Carpetas
- **camelCase**: Variables, funciones, métodos, propiedades
- **PascalCase**: Componentes React, clases, interfaces
- **kebab-case**: URLs, rutas, nombres de archivos HTML/CSS
- **snake_case**: Nombres de archivos del backend (controladores, modelos)

#### Variables y Funciones
```javascript
// Variables - camelCase
const userName = 'John';
const isAuthenticated = true;
const userData = {};

// Funciones - camelCase
const handleSubmit = () => {};
const validateForm = () => {};
const fetchUserData = () => {};

// Componentes - PascalCase
const UserProfile = () => {};
const AuthModal = () => {};
const DashboardContent = () => {};

// Constantes - UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:4000';
const MAX_FILE_SIZE = 5242880;
```

#### Base de Datos
- **Colecciones**: PascalCase (Clientes, Empleados, Citas)
- **Campos**: camelCase (nombre, apellido, fechaCreacion)
- **Índices**: snake_case (idx_email, idx_created_at)

#### API Endpoints
- **Rutas**: kebab-case (/api/registro-clientes, /api/historial-medico)
- **Métodos**: camelCase (getClientes, createEmpleado, updateCita)

## Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB (v6 o superior)
- npm o yarn

### Backend

1. **Instalar dependencias**:
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**:
Crear archivo `.env` en la carpeta `backend/`:
```env
# Base de datos
DB_URI=mongodb://localhost:27017/aurora_db

# Servidor
PORT=4000

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRE=24h

# Email (Gmail)
USER_EMAIL=tu_email@gmail.com
USER_PASS=tu_password_de_aplicacion

# Cloudinary
CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

3. **Ejecutar el servidor**:
```bash
npm run dev
```

### Frontend

1. **Instalar dependencias**:
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno**:
Crear archivo `.env` en la carpeta `frontend/`:
```env
VITE_API_URL=http://localhost:4000/api
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

3. **Ejecutar el cliente**:
```bash
npm run dev
```

## Funcionalidades Implementadas

### ✅ Autenticación y Autorización
- Login unificado (clientes y empleados)
- Registro con verificación por email
- Recuperación de contraseñas
- Rutas protegidas por roles
- JWT en cookies seguras

### ✅ CRUD Completo (8 módulos)
1. **Clientes**: Gestión completa de clientes
2. **Empleados**: Administración de personal
3. **Recetas**: Gestión médica de recetas
4. **Citas**: Programación de citas
5. **Lentes**: Catálogo de lentes
6. **Accesorios**: Gestión de accesorios
7. **Marcas**: Administración de marcas
8. **Categorías**: Clasificación de productos

### ✅ Validaciones
- **Frontend**: Validaciones en tiempo real con react-hook-form
- **Backend**: Validaciones de seguridad y formato
- **Base de datos**: Validaciones a nivel de esquema

### ✅ Características Avanzadas
- Dashboard con estadísticas y gráficas
- Subida de imágenes con Cloudinary
- Sistema de notificaciones
- Diseño responsive con Tailwind CSS
- Paginación y filtros
- Búsqueda en tiempo real

## Scripts Disponibles

### Backend
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa de producción
npm run lint     # Linting del código
```

## Integrantes del equipo:
- Guillermo Rodrigo Chávez Mejía
- Luis Fernando Navarró Alemán
- Jhonatan Josué Valle Gamboa
- Kevin Josue Alvarado Hernandez
- Fernando Ariel 
     
