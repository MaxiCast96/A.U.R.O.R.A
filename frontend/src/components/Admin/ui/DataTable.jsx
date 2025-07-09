// src/components/ui/DataTable.jsx
import React from 'react';
import { Users } from 'lucide-react';

const DataTable = ({ 
    columns, 
    data, 
    renderRow, 
    noDataMessage = "No se encontraron datos.",
    noDataSubMessage = "Intenta con otros términos de búsqueda"
}) => {
    // Función para renderizar una celda individual
    const renderCell = (item, column) => {
        if (column.render) {
            return column.render(item);
        }
        
        // Si no hay función render, buscar por la key
        const value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
        return value || '-';
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-cyan-500 text-white">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-6 py-4 text-left font-semibold text-sm">
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
                                    // Caso 1: Función renderRow personalizada (como en Clientes)
                                    renderRow(item)
                                ) : (
                                    // Caso 2: Renderizado automático basado en columnas (como en Empleados)
                                    columns.map(column => (
                                        <td key={column.key} className="px-6 py-4 text-gray-600">
                                            {renderCell(item, column)}
                                        </td>
                                    ))
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center p-8">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">{noDataMessage}</h3>
                                {noDataSubMessage && (
                                    <p className="text-sm text-gray-500 mt-2">{noDataSubMessage}</p>
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