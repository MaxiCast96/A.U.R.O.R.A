import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/" state={{ openAuthModal: true, from: location }} replace />;
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
      return <Navigate to="/perfil" state={{ 
        message: 'No tienes permisos para acceder a esta página. Solo el personal autorizado puede acceder al dashboard.' 
      }} replace />;
    }
    // Cualquier otro rol (Empleado, Admin, etc.) puede acceder
    return children;
  }

  if (requiredRole === 'Cliente' && userRole !== 'Cliente') {
    // Si requiere rol de Cliente pero el usuario no lo tiene, redirigir al perfil
    return <Navigate to="/perfil" state={{ 
      message: 'No tienes permisos para acceder a esta página. Solo los clientes pueden acceder a las cotizaciones.' 
    }} replace />;
  }

  // Si el usuario tiene los permisos necesarios, mostrar el contenido
  return children;
};

export default PrivateRoute; 