// src/components/ui/EnhancedMultiSelect.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

const EnhancedMultiSelect = ({ label, options = [], selectedOptions = [], onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    const isSelected = selectedOptions.some(o => o._id === option._id);
    const newSelection = isSelected
      ? selectedOptions.filter(o => o._id !== option._id)
      : [...selectedOptions, option];
    onChange(newSelection);
  };

  const selectedLabels = selectedOptions.map(o => o.nombre).join(', ');

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className={`relative w-full cursor-pointer rounded-md border py-2 pl-3 pr-10 text-left shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
        onClick={handleToggle}
      >
        <span className="block truncate">
          {selectedLabels || `Seleccione ${label.toLowerCase()}`}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {isOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option._id}
              className={`relative cursor-default select-none py-2 pl-3 pr-9 ${selectedOptions.some(o => o._id === option._id) ? 'bg-cyan-100 text-cyan-900' : 'text-gray-900 hover:bg-gray-100'}`}
              onClick={() => handleSelect(option)}
            >
              <span className="block truncate">
                {option.nombre}
              </span>
              {selectedOptions.some(o => o._id === option._id) && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-cyan-600">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
            </li>
          ))}
          {options.length === 0 && (
            <li className="py-2 px-3 text-gray-500">No hay opciones disponibles.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default EnhancedMultiSelect;