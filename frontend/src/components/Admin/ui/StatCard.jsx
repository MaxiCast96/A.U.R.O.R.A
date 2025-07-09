// src/components/ui/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, Icon, color = 'cyan' }) => {
    const colorSchemes = {
        cyan: 'bg-cyan-100 text-cyan-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorSchemes[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;