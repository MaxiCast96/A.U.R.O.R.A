import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, requiredRole = null, noRedirect = false }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Si no hay usuario autenticado
  if (!user) {
    // Si noRedirect es true, permitir que el componente hijo maneje la lógica
    if (noRedirect) {
      return children;
    }
    // Si no, redirigir al home (el modal se maneja internamente en el Navbar)
    return <Navigate to="/" replace />;
  }

  // Si no se especifica rol requerido, permitir acceso a cualquier usuario autenticado
  if (!requiredRole) {
    return children;
  }

  // Verificar si el usuario tiene el rol requerido
  const userRole = user.rol || user.role || user.userType;
  
  if (requiredRole === 'Empleado') {
    // Si requiere rol de Empleado, permitir acceso a cualquier rol que NO sea Cliente
    if (userRole === 'Cliente') {
      return <Navigate to="/acceso-denegado" state={{ 
        message: 'No tienes permisos para acceder a esta página. Solo el personal autorizado puede acceder al dashboard.' 
      }} replace />;
    }
    // Cualquier otro rol (Empleado, Admin, etc.) puede acceder
    return children;
  }

  if (requiredRole === 'Cliente' && userRole !== 'Cliente') {
    // Si requiere rol de Cliente pero el usuario no lo tiene, redirigir al acceso denegado
    return <Navigate to="/acceso-denegado" state={{ 
      message: 'No tienes permisos para acceder a esta página. Solo los clientes pueden acceder a las cotizaciones.' 
    }} replace />;
  }

  // Si el usuario tiene los permisos necesarios, mostrar el contenido
  return children;
};

export default PrivateRoute; 