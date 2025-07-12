// src/components/ui/DataTable.jsx
import React from 'react';
import { Users } from 'lucide-react';

const DataTable = ({
    columns = [], // Valor predeterminado: array vacío
    data = [],    // Valor predeterminado: array vacío
    renderRow,
    noDataMessage = "No se encontraron datos.",
    noDataSubMessage = "Intenta con otros términos de búsqueda"
}) => {
    const renderCell = (item, column) => {
        if (column.render) {
            return column.render(item);
        }
        // Add a check to ensure column.key exists before calling split
        if (column.key) {
            const value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
            return value || '-';
        }
        // Fallback for columns missing 'key' (and no 'render' function)
        console.warn('Column definition missing "key" property and no custom render function:', column);
        return '-'; // Display a placeholder or handle as appropriate
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-cyan-500 text-white">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key || col.header} className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left font-semibold text-xs sm:text-sm">
                                {col.label || col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                                {renderRow ? (
                                    renderRow(item)
                                ) : (
                                    columns.map(column => (
                                        <td key={column.key || column.header} className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-gray-600 text-xs sm:text-sm">
                                            {renderCell(item, column)}
                                        </td>
                                    ))
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center p-4 sm:p-6 md:p-8">
                                <Users className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">{noDataMessage}</h3>
                                {noDataSubMessage && (
                                    <p className="text-xs sm:text-sm text-gray-500 mt-2">{noDataSubMessage}</p>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;