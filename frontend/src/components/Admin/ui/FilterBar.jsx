// src/components/ui/FilterBar.jsx
import React from 'react';
import { Search } from 'lucide-react';

const FilterBar = ({ 
    searchTerm, 
    onSearchChange,
    filters,
    activeFilter,
    onFilterChange,
    searchPlaceholder = 'Buscar...'
}) => (
    <div className="p-6 bg-gray-50 border-b">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
            </div>
            <div className="flex gap-2">
                {filters.map(filter => (
                    <button
                        key={filter.value}
                        onClick={() => onFilterChange(filter.value)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                            activeFilter === filter.value
                                ? 'bg-cyan-500 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default FilterBar;