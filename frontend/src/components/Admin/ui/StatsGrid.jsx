// src/components/ui/StatsGrid.jsx
import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
            <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                Icon={stat.Icon}  // Cambié de stat.icon a stat.Icon
                color={stat.color}
            />
        ))}
    </div>
);

export default StatsGrid;