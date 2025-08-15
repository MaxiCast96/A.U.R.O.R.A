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
        const horas = disponibilidad
            .filter(d => d.dia === dia)
            .map(d => d.hora || d.horaInicio)
            .filter(hora => hora && horasDisponibles.includes(hora));
        
        // Ordenar por el índice en horasDisponibles para mantener el orden correcto
        return horas.sort((a, b) => {
            const indexA = horasDisponibles.indexOf(a);
            const indexB = horasDisponibles.indexOf(b);
            return indexA - indexB;
        });
    };

    // Función para formatear horarios agrupados
     const formatHorariosAgrupados = (horas) => {
        if (!horas || horas.length === 0) return 'Sin horario';
        
        // Ordenar las horas usando el índice en horasDisponibles para orden correcto
        const horasOrdenadas = [...horas].sort((a, b) => {
            const indexA = horasDisponibles.indexOf(a);
            const indexB = horasDisponibles.indexOf(b);
            return indexA - indexB;
        });
        
        if (horasOrdenadas.length === 0) return 'Sin horario';
        
        const grupos = [];
        let grupoActual = [horasOrdenadas[0]];
        
        for (let i = 1; i < horasOrdenadas.length; i++) {
            const horaActual = horasOrdenadas[i];
            const horaAnterior = horasOrdenadas[i - 1];
            
            // Verificar si las horas son consecutivas usando índices
            const indexActual = horasDisponibles.indexOf(horaActual);
            const indexAnterior = horasDisponibles.indexOf(horaAnterior);
            
            if (indexActual === indexAnterior + 1) {
                // Horas consecutivas, agregar al grupo actual
                grupoActual.push(horaActual);
            } else {
                // No consecutivas, cerrar grupo actual y empezar uno nuevo
                grupos.push([...grupoActual]);
                grupoActual = [horaActual];
            }
        }
        
        // Agregar el último grupo
        grupos.push(grupoActual);
        
        // Formatear cada grupo - si es un bloque completo, mostrar como rango
        return grupos.map(grupo => {
            if (grupo.length === 1) {
                return grupo[0];
            } else if (grupo.length === 2) {
                return `${grupo[0]}, ${grupo[1]}`;
            } else {
                // Para 3 o más horas consecutivas, mostrar como rango
                const horaFin = grupo[grupo.length - 1];
                const indexFin = horasDisponibles.indexOf(horaFin);
                const siguienteHora = horasDisponibles[indexFin + 1] || `${parseInt(horaFin.split(':')[0]) + 1}:00`;
                return `${grupo[0]} - ${siguienteHora}`;
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
        <div className="space-y-6">
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

            {/* Resumen por día - MEJORADO CON MÁS ESPACIO */}
            <div className="space-y-4">
                <h5 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-2">
                    Resumen Semanal
                </h5>
                
                {/* Para pantallas grandes: 2 filas de 3-4 elementos */}
                <div className="hidden lg:block space-y-4">
                    {/* Primera fila: Lunes a Miércoles */}
                    <div className="grid grid-cols-3 gap-4">
                        {diasSemana.slice(0, 3).map((dia) => {
                            const horasDelDia = getHorasByDay(dia.key);
                            const horarioFormateado = formatHorariosAgrupados(horasDelDia);
                            
                            return (
                                <div key={dia.key} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="font-semibold text-gray-800 mb-3 text-center border-b border-gray-100 pb-2">
                                        {dia.label}
                                    </div>
                                    <div className={`text-sm text-center mb-2 ${horasDelDia.length > 0 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
                                        {horarioFormateado}
                                    </div>
                                    {horasDelDia.length > 0 && (
                                        <div className="text-xs text-gray-500 text-center bg-gray-50 rounded px-2 py-1">
                                            {horasDelDia.length} hora{horasDelDia.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Segunda fila: Jueves a Domingo */}
                    <div className="grid grid-cols-4 gap-4">
                        {diasSemana.slice(3).map((dia) => {
                            const horasDelDia = getHorasByDay(dia.key);
                            const horarioFormateado = formatHorariosAgrupados(horasDelDia);
                            
                            return (
                                <div key={dia.key} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="font-semibold text-gray-800 mb-3 text-center border-b border-gray-100 pb-2">
                                        {dia.label}
                                    </div>
                                    <div className={`text-sm text-center mb-2 ${horasDelDia.length > 0 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
                                        {horarioFormateado}
                                    </div>
                                    {horasDelDia.length > 0 && (
                                        <div className="text-xs text-gray-500 text-center bg-gray-50 rounded px-2 py-1">
                                            {horasDelDia.length} hora{horasDelDia.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Para pantallas medianas: 2 columnas */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
                    {diasSemana.map((dia) => {
                        const horasDelDia = getHorasByDay(dia.key);
                        const horarioFormateado = formatHorariosAgrupados(horasDelDia);
                        
                        return (
                            <div key={dia.key} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                                    {dia.label}
                                </div>
                                <div className={`text-sm mb-2 ${horasDelDia.length > 0 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
                                    {horarioFormateado}
                                </div>
                                {horasDelDia.length > 0 && (
                                    <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 inline-block">
                                        {horasDelDia.length} hora{horasDelDia.length !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Para pantallas pequeñas: 1 columna */}
                <div className="grid md:hidden grid-cols-1 gap-3">
                    {diasSemana.map((dia) => {
                        const horasDelDia = getHorasByDay(dia.key);
                        const horarioFormateado = formatHorariosAgrupados(horasDelDia);
                        
                        return (
                            <div key={dia.key} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-gray-800">{dia.label}</div>
                                    {horasDelDia.length > 0 && (
                                        <span className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                                            {horasDelDia.length}h
                                        </span>
                                    )}
                                </div>
                                <div className={`text-sm ${horasDelDia.length > 0 ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
                                    {horarioFormateado}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HorariosVisualizacion;