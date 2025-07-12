# Configuración de Email para Recuperación de Contraseña

## Problema Resuelto

El error "Cannot read properties of undefined (reading 'user_email')" ha sido corregido. Los cambios realizados incluyen:

1. **Corrección de rutas de configuración**: Cambiado de `config.emailUser.user_email` a `config.email.user`
2. **Importación faltante**: Agregado `import nodemailer from "nodemailer"` en EmpleadosController
3. **Mejor manejo de errores**: Agregada validación para configuración de email faltante
4. **Consistencia en parámetros**: Alineado los parámetros entre frontend y backend
5. **Estandarización de códigos**: Ambos controladores ahora usan códigos de 6 dígitos numéricos
6. **Logs de depuración**: Agregados logs para facilitar la identificación de problemas

## Configuración Requerida

Para que la recuperación de contraseña funcione correctamente, necesitas configurar las siguientes variables de entorno:

### 1. Crear archivo .env en el directorio backend/

```env
# Configuración de email para recuperación de contraseña
USER_EMAIL=tu_email@gmail.com
USER_PASS=tu_app_password

# Otras configuraciones opcionales
DB_URI=mongodb://localhost:27017/aurora_db
JWT_SECRET=aurora_jwt_secret_key_2024
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 2. Configurar Gmail para uso de aplicaciones

1. Ve a tu cuenta de Google
2. Activa la verificación en dos pasos
3. Genera una contraseña de aplicación:
   - Ve a "Seguridad" > "Contraseñas de aplicación"
   - Selecciona "Correo" como aplicación
   - Copia la contraseña generada (16 caracteres)
4. Usa esta contraseña en `USER_PASS`

### 3. Verificar configuración

El sistema ahora validará automáticamente si las variables de entorno están configuradas y mostrará un mensaje de error claro si faltan.

## Funcionalidad

- **Recuperación de contraseña**: Envía código de 6 dígitos por email
- **Código temporal**: Válido por 30 minutos para ambos tipos de usuario
- **Doble verificación**: Funciona tanto para clientes como empleados
- **Interfaz unificada**: Mismo flujo para ambos tipos de usuario
- **Logs de depuración**: Información detallada en la consola del servidor

## Archivos Modificados

- `backend/src/controllers/ClientesController.js`
- `backend/src/controllers/EmpleadosController.js`
- `frontend/src/pages/auth/RecuperarPassword.jsx`
- `frontend/src/components/auth/ForgotPassword.jsx`

## Pruebas y Depuración

### 1. Iniciar servidores
```bash
# Backend
cd backend
npm start

# Frontend (en otra terminal)
cd frontend
npm run dev
```

### 2. Verificar logs del servidor
Los logs mostrarán información detallada sobre:
- Códigos generados
- Fechas de expiración
- Intentos de validación
- Errores específicos

### 3. Probar el flujo completo
1. Ve a la página de recuperación de contraseña
2. Ingresa un email válido registrado en el sistema
3. Verifica que recibes el código por email
4. Completa el proceso de cambio de contraseña
5. Revisa los logs en la consola del servidor para identificar problemas

### 4. Solución de problemas comunes

**Error: "Código inválido, expirado o correo incorrecto"**
- Verifica que el código ingresado coincida exactamente con el enviado por email
- Asegúrate de que no han pasado más de 30 minutos desde que se generó el código
- Revisa los logs del servidor para ver detalles específicos

**Error: "Error de configuración del servidor"**
- Verifica que las variables USER_EMAIL y USER_PASS estén configuradas en el archivo .env
- Asegúrate de que la contraseña de aplicación de Gmail sea correcta

**Error: "No existe un cliente/empleado con este correo"**
- Verifica que el email esté registrado en la base de datos
- Asegúrate de que el email esté escrito correctamente

## Estructura de Códigos

- **Formato**: 6 dígitos numéricos (ej: 123456)
- **Duración**: 30 minutos desde la generación
- **Almacenamiento**: En la base de datos con timestamp de expiración
- **Validación**: Comparación exacta del código ingresado con el almacenado 