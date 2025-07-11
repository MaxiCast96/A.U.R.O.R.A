// src/components/ui/PageHeader.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const PageHeader = ({ title, buttonLabel, onButtonClick }) => {
  return (
    <div className="bg-cyan-500 text-white p-6 rounded-t-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={onButtonClick}
          className="bg-white text-cyan-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{buttonLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default PageHeader;