// src/components/management/optometristas/HorariosVisualizacion.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const HorariosVisualizacion = ({ disponibilidad = [] }) => {
    // Días de la semana
    const diasSemana = [
        { key: 'lunes', label: 'Lunes' },
        { key: 'martes', label: 'Martes' },
        { key: 'miercoles', label: 'Miércoles' },
        { key: 'jueves', label: 'Jueves' },
        { key: 'viernes', label: 'Viernes' },
        { key: 'sabado', label: 'Sábado' },
        { key: 'domingo', label: 'Domingo' }
    ];

    // Horas disponibles
    const horasDisponibles = [
        '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
    ];

    // Función para verificar si una hora está seleccionada para un día
    const isHoraSelected = (dia, hora) => {
        if (!Array.isArray(disponibilidad)) return false;
        return disponibilidad.some(d => 
            d.dia === dia && (d.hora === hora || d.horaInicio === hora)
        );
    };

    // Función para obtener las horas de un día específico
    const getHorasByDay = (dia) => {
        if (!Array.isArray(disponibilidad)) return [];
        return disponibilidad
            .filter(d => d.dia === dia)
            .map(d => d.hora || d.horaInicio)
            .sort();
    };

    // Función para formatear horarios agrupados
    const formatHorariosAgrupados = (horas) => {
        if (!horas || horas.length === 0) return 'Sin horario';
        
        // Ordenar las horas
        const horasOrdenadas = [...horas].sort();
        const grupos = [];
        let grupoActual = [horasOrdenadas[0]];
        
        for (let i = 1; i < horasOrdenadas.length; i++) {
            const horaActual = horasOrdenadas[i];
            const horaAnterior = horasOrdenadas[i - 1];
            
            // Verificar si las horas son consecutivas
            const indexActual = horasDisponibles.indexOf(horaActual);
            const indexAnterior = horasDisponibles.indexOf(horaAnterior);
            
            if (indexActual === indexAnterior + 1) {
                // Horas consecutivas, agregar al grupo actual
                grupoActual.push(horaActual);
            } else {
                // No consecutivas, cerrar grupo actual y empezar uno nuevo
                grupos.push(grupoActual);
                grupoActual = [horaActual];
            }
        }
        
        // Agregar el último grupo
        grupos.push(grupoActual);
        
        // Formatear cada grupo
        return grupos.map(grupo => {
            if (grupo.length === 1) {
                return grupo[0];
            } else {
                return `${grupo[0]} - ${grupo[grupo.length - 1]}`;
            }
        }).join(', ');
    };

    // Contar total de horas
    const totalHoras = Array.isArray(disponibilidad) ? disponibilidad.length : 0;

    if (!disponibilidad || disponibilidad.length === 0) {
        return (
            <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Sin horarios de disponibilidad definidos</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-cyan-600" />
                    <span>Horarios de Disponibilidad</span>
                </h4>
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
                    {totalHoras} horas semanales
                </span>
            </div>
            
            {/* Visualización en grid */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {/* Header con días */}
                <div className="bg-cyan-50 border-b border-gray-200">
                    <div className="grid grid-cols-7 text-center">
                        {diasSemana.map((dia) => {
                            const horasDelDia = getHorasByDay(dia.key);
                            return (
                                <div key={dia.key} className="py-3 px-2 border-r border-gray-200 last:border-r-0">
                                    <div className="font-medium text-sm text-gray-700">{dia.label}</div>
                                    {horasDelDia.length > 0 && (
                                        <div className="text-xs text-cyan-600 font-medium mt-1">
                                            {horasDelDia.length}h
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Grid de horas */}
                <div className="p-4">
                    {horasDisponibles.map((hora) => (
                        <div key={hora} className="grid grid-cols-7 mb-2 last:mb-0">
                            {diasSemana.map((dia) => (
                                <div key={`${dia.key}-${hora}`} className="px-1">
                                    <div
                                        className={`w-full py-2 px-2 text-sm font-medium rounded text-center ${
                                            isHoraSelected(dia.key, hora)
                                                ? 'bg-cyan-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                        {hora}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Resumen por día */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
                {diasSemana.map((dia) => {
                    const horasDelDia = getHorasByDay(dia.key);
                    const horarioFormateado = formatHorariosAgrupados(horasDelDia);
                    
                    return (
                        <div key={dia.key} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="font-medium text-sm text-gray-800 mb-2">{dia.label}</div>
                            <div className={`text-xs ${horasDelDia.length > 0 ? 'text-cyan-600' : 'text-gray-500'}`}>
                                {horarioFormateado}
                            </div>
                            {horasDelDia.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {horasDelDia.length} hora{horasDelDia.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HorariosVisualizacion;