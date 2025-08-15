import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ProductNavigation = () => {
  const location = useLocation();

  const navigationItems = [
    {
      path: '/productos',
      label: 'Todos los Productos',
      icon: '🛍️'
    },
    {
      path: '/productos/lentes',
      label: 'Lentes',
      icon: '👓'
    },
    {
      path: '/productos/accesorios',
      label: 'Accesorios',
      icon: '👜'
    },
    {
      path: '/productos/personalizables',
      label: 'Personalizables',
      icon: '✨'
    }
  ];

  return (
    <div className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-1 overflow-x-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'text-[#0097c2] border-b-2 border-[#0097c2] bg-blue-50'
                    : 'text-gray-600 hover:text-[#0097c2] hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProductNavigation;
