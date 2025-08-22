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
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {filters.map(filter => (
                    <button
                        key={filter.value}
                        onClick={() => onFilterChange(filter.value)}
                        className={`px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
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