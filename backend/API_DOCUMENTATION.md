# API Documentation - A.U.R.O.R.A

## Información General

- **Base URL**: `http://localhost:4000/api`
- **Versión**: 1.0.0
- **Formato de respuesta**: JSON
- **Autenticación**: JWT en cookies HTTP-only

## Autenticación

### Login Unificado
```http
POST /auth/login
```

**Body:**
```json
{
  "correo": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "usuario@ejemplo.com",
    "telefono": "+50371234567",
    "rol": "Cliente"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout
```http
POST /auth/logout
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### Verificar Token
```http
GET /auth/verify
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "usuario@ejemplo.com",
    "telefono": "+50371234567",
    "rol": "Cliente"
  }
}
```

### Recuperar Contraseña
```http
POST /auth/forgot-password
```

**Body:**
```json
{
  "correo": "usuario@ejemplo.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Email de recuperación enviado exitosamente"
}
```

### Restablecer Contraseña
```http
POST /auth/reset-password
```

**Body:**
```json
{
  "token": "abc123def456",
  "newPassword": "nuevaContraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Contraseña restablecida exitosamente"
}
```

## Clientes

### Obtener Todos los Clientes
```http
GET /clientes
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nombre": "Juan",
    "apellido": "Pérez",
    "edad": 25,
    "dui": "12345678-9",
    "telefono": "+50371234567",
    "correo": "juan@ejemplo.com",
    "direccion": {
      "calle": "Calle Principal 123",
      "ciudad": "San Salvador",
      "departamento": "San Salvador"
    },
    "estado": "Activo",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

### Obtener Cliente por ID
```http
GET /clientes/:id
```

**Respuesta exitosa (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 25,
  "dui": "12345678-9",
  "telefono": "+50371234567",
  "correo": "juan@ejemplo.com",
  "direccion": {
    "calle": "Calle Principal 123",
    "ciudad": "San Salvador",
    "departamento": "San Salvador"
  },
  "estado": "Activo",
  "fechaCreacion": "2024-01-15T10:30:00.000Z"
}
```

### Crear Cliente
```http
POST /clientes
```

**Body:**
```json
{
  "nombre": "María",
  "apellido": "González",
  "edad": 30,
  "dui": "87654321-0",
  "telefono": "+50379876543",
  "correo": "maria@ejemplo.com",
  "calle": "Avenida Central 456",
  "ciudad": "San Salvador",
  "departamento": "San Salvador",
  "password": "contraseña123",
  "estado": "Activo"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Cliente creado exitosamente"
}
```

### Actualizar Cliente
```http
PUT /clientes/:id
```

**Body:**
```json
{
  "nombre": "María",
  "apellido": "González",
  "edad": 31,
  "dui": "87654321-0",
  "telefono": "+50379876543",
  "correo": "maria@ejemplo.com",
  "calle": "Avenida Central 456",
  "ciudad": "San Salvador",
  "departamento": "San Salvador",
  "estado": "Activo"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Cliente actualizado exitosamente"
}
```

### Eliminar Cliente
```http
DELETE /clientes/:id
```

**Respuesta exitosa (200):**
```json
{
  "message": "Cliente eliminado exitosamente"
}
```

## Empleados

### Obtener Todos los Empleados
```http
GET /empleados
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "nombre": "Ana",
    "apellido": "Rodríguez",
    "edad": 28,
    "dui": "11223344-5",
    "telefono": "+50371234568",
    "correo": "ana@ejemplo.com",
    "cargo": "Vendedor",
    "sueldo": 800.00,
    "fechaContratacion": "2023-06-01T00:00:00.000Z",
    "estado": "Activo",
    "fechaCreacion": "2023-06-01T10:00:00.000Z"
  }
]
```

### Crear Empleado
```http
POST /empleados
```

**Body:**
```json
{
  "nombre": "Carlos",
  "apellido": "Martínez",
  "edad": 35,
  "dui": "55667788-9",
  "telefono": "+50371234569",
  "correo": "carlos@ejemplo.com",
  "cargo": "Optometrista",
  "sueldo": 1200.00,
  "fechaContratacion": "2024-01-01",
  "password": "contraseña123",
  "estado": "Activo"
}
```

## Citas

### Obtener Todas las Citas
```http
GET /citas
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "clienteId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "empleadoId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "fecha": "2024-01-20T14:30:00.000Z",
    "hora": "14:30",
    "servicio": "Examen Visual",
    "estado": "Programada",
    "notas": "Primera consulta",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

### Crear Cita
```http
POST /citas
```

**Body:**
```json
{
  "clienteId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "empleadoId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "fecha": "2024-01-25",
  "hora": "15:00",
  "servicio": "Adaptación de Lentes",
  "estado": "Programada",
  "notas": "Cliente requiere lentes progresivos"
}
```

## Lentes

### Obtener Todos los Lentes
```http
GET /lentes
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "nombre": "Lente Progresivo Premium",
    "marca": "Essilor",
    "categoria": "Progresivos",
    "precio": 299.99,
    "stock": 15,
    "descripcion": "Lente progresivo de alta calidad",
    "imagen": "https://res.cloudinary.com/cloud/image/upload/lentes/progresivo.jpg",
    "estado": "Disponible",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

### Crear Lente
```http
POST /lentes
```

**Body:**
```json
{
  "nombre": "Lente Monofocal Básico",
  "marca": "Zeiss",
  "categoria": "Monofocales",
  "precio": 89.99,
  "stock": 50,
  "descripcion": "Lente monofocal para visión lejana",
  "estado": "Disponible"
}
```

## Accesorios

### Obtener Todos los Accesorios
```http
GET /accesorios
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "nombre": "Estuche para Lentes Premium",
    "marca": "Ray-Ban",
    "categoria": "Estuches",
    "precio": 25.99,
    "stock": 100,
    "descripcion": "Estuche de cuero genuino",
    "imagen": "https://res.cloudinary.com/cloud/image/upload/accesorios/estuche.jpg",
    "estado": "Disponible",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

## Marcas

### Obtener Todas las Marcas
```http
GET /marcas
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "nombre": "Ray-Ban",
    "descripcion": "Marca líder en gafas de sol",
    "paisOrigen": "Italia",
    "estado": "Activo",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

## Categorías

### Obtener Todas las Categorías
```http
GET /categoria
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "nombre": "Monofocales",
    "descripcion": "Lentes para una sola distancia",
    "estado": "Activo",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

## Ventas

### Obtener Todas las Ventas
```http
GET /ventas
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
    "clienteId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "empleadoId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "productos": [
      {
        "productoId": "64f8a1b2c3d4e5f6a7b8c9d3",
        "nombre": "Lente Progresivo Premium",
        "cantidad": 1,
        "precioUnitario": 299.99,
        "subtotal": 299.99
      }
    ],
    "total": 299.99,
    "metodoPago": "Tarjeta",
    "estado": "Completada",
    "fecha": "2024-01-15T10:30:00.000Z",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

### Crear Venta
```http
POST /ventas
```

**Body:**
```json
{
  "clienteId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "empleadoId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "productos": [
    {
      "productoId": "64f8a1b2c3d4e5f6a7b8c9d3",
      "cantidad": 1,
      "precioUnitario": 299.99
    }
  ],
  "metodoPago": "Efectivo",
  "estado": "Completada"
}
```

## Recetas

### Obtener Todas las Recetas
```http
GET /recetas
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
    "clienteId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "optometristaId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "fecha": "2024-01-15T10:30:00.000Z",
    "ojoDerecho": {
      "esfera": -2.50,
      "cilindro": -0.75,
      "eje": 90,
      "adicion": 1.25
    },
    "ojoIzquierdo": {
      "esfera": -2.25,
      "cilindro": -0.50,
      "eje": 85,
      "adicion": 1.25
    },
    "distanciaPupilar": 62,
    "observaciones": "Paciente con miopía moderada",
    "estado": "Activa",
    "fechaCreacion": "2024-01-15T10:30:00.000Z"
  }
]
```

## Códigos de Error

### 400 - Bad Request
```json
{
  "message": "Faltan campos obligatorios"
}
```

### 401 - Unauthorized
```json
{
  "message": "Acceso denegado. Token de autenticación requerido."
}
```

### 403 - Forbidden
```json
{
  "message": "Acceso denegado. No tiene permisos para acceder a este recurso."
}
```

### 404 - Not Found
```json
{
  "message": "Cliente no encontrado"
}
```

### 409 - Conflict
```json
{
  "message": "El correo ya está registrado"
}
```

### 429 - Too Many Requests
```json
{
  "message": "Demasiadas solicitudes desde esta IP, intente nuevamente más tarde."
}
```

### 500 - Internal Server Error
```json
{
  "message": "Error interno del servidor"
}
```

## Headers Requeridos

### Para endpoints autenticados:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Para subida de archivos:
```
Content-Type: multipart/form-data
```

## Paginación

Para endpoints que soportan paginación, use los siguientes parámetros de query:

```
GET /clientes?page=1&limit=10&sort=nombre&order=asc
```

**Parámetros:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `sort`: Campo por el cual ordenar
- `order`: Orden ascendente (asc) o descendente (desc)

**Respuesta con paginación:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtros

Para endpoints que soportan filtros, use los siguientes parámetros de query:

```
GET /clientes?estado=Activo&ciudad=San Salvador&edad_min=18&edad_max=65
```

**Filtros comunes:**
- `estado`: Filtrar por estado (Activo, Inactivo)
- `fecha_desde`: Fecha de inicio (YYYY-MM-DD)
- `fecha_hasta`: Fecha de fin (YYYY-MM-DD)
- `buscar`: Búsqueda en texto (nombre, correo, etc.)

## Subida de Archivos

Para subir imágenes a Cloudinary:

```http
POST /upload
```

**Body (multipart/form-data):**
```
file: [archivo]
folder: lentes
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/cloud/image/upload/lentes/imagen.jpg",
  "publicId": "lentes/imagen"
}
```

## Webhooks

### Notificación de Cita
```http
POST /webhooks/cita-notification
```

**Body:**
```json
{
  "citaId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "tipo": "recordatorio",
  "fecha": "2024-01-20T14:30:00.000Z"
}
```

## Rate Limiting

La API implementa rate limiting para prevenir abuso:

- **Límite**: 100 requests por 15 minutos por IP
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite de requests
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Tiempo de reset en segundos

## Seguridad

### CORS
La API está configurada para aceptar requests desde:
- `http://localhost:5173` (desarrollo)
- `https://aurora-optics.com` (producción)

### Cookies
- Las cookies JWT son HTTP-only
- SameSite: strict
- Secure en producción

### Validación
- Todos los inputs son validados en el servidor
- Sanitización de datos
- Prevención de inyección SQL

## Ejemplos de Uso

### JavaScript (Fetch)
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    correo: 'usuario@ejemplo.com',
    password: 'contraseña123'
  })
});

// Obtener clientes
const clientes = await fetch('/api/clientes', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'
});
```

### cURL
```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"usuario@ejemplo.com","password":"contraseña123"}' \
  -c cookies.txt

# Obtener clientes
curl -X GET http://localhost:4000/api/clientes \
  -H "Authorization: Bearer $(cat token.txt)" \
  -b cookies.txt
```

## Dashboard

### Obtener Todas las Estadísticas del Dashboard
```http
GET /api/dashboard/all
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalClientes": 1250,
      "citasHoy": 15,
      "ventasDelMes": 89,
      "totalIngresos": 45000.50
    },
    "ventasMensuales": [
      {
        "mes": "Ene",
        "ventas": 12,
        "ingresos": 15000.00
      }
    ],
    "estadoCitas": [
      {
        "estado": "Confirmadas",
        "cantidad": 35
      }
    ],
    "productosPopulares": [
      {
        "_id": "Lente Progresivo Premium",
        "cantidad": 45,
        "ingresos": 13500.00
      }
    ]
  }
}
```

### Obtener Estadísticas Básicas
```http
GET /api/dashboard/stats
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "totalClientes": 1250,
    "citasHoy": 15,
    "ventasDelMes": 89,
    "totalIngresos": 45000.50
  }
}
```

### Obtener Ventas Mensuales
```http
GET /api/dashboard/ventas-mensuales?year=2024
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "mes": "Ene",
      "ventas": 12,
      "ingresos": 15000.00
    }
  ]
}
```

### Obtener Estado de Citas
```http
GET /api/dashboard/estado-citas
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "estado": "Confirmadas",
      "cantidad": 35
    },
    {
      "estado": "Pendientes",
      "cantidad": 15
    },
    {
      "estado": "Canceladas",
      "cantidad": 5
    },
    {
      "estado": "Completadas",
      "cantidad": 45
    }
  ]
}
```

### Obtener Productos Populares
```http
GET /api/dashboard/productos-populares?limit=5
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "Lente Progresivo Premium",
      "cantidad": 45,
      "ingresos": 13500.00
    }
  ]
}
```

## Soporte

Para soporte técnico o preguntas sobre la API:

- **Email**: soporte@aurora-optics.com
- **Documentación**: https://docs.aurora-optics.com/api
- **GitHub**: https://github.com/aurora-optics/api 