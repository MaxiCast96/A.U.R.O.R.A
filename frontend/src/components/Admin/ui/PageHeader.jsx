// src/components/ui/PageHeader.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const PageHeader = ({ title, buttonLabel, onButtonClick }) => {
  return (
    <div className="bg-cyan-500 text-white p-4 sm:p-6 rounded-t-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{title}</h2>
        <button
          onClick={onButtonClick}
          className="w-full sm:w-auto bg-white text-cyan-500 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>{buttonLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default PageHeader;