// src/components/ui/FilterBar.jsx
import React from 'react';

const FilterBar = ({ searchTerm, onSearchChange, placeholder, filters }) => {
    return (
        <div className="flex items-center space-x-4">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="input"
            />
            {filters.map((filter, index) => (
                <select
                    key={index}
                    value={filter.selectedValue}
                    onChange={(e) => filter.onFilterChange(e.target.value)}
                    className="select"
                >
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ))}
        </div>
    );
};

export default FilterBar;