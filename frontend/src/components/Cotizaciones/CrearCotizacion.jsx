import React, { useState } from "react";
import PageTransition from "../transition/PageTransition";
import Navbar from "../layout/Navbar";

const CrearCotizacion = () => {
    const [productos, setProductos] = useState([]);
    const [clienteInfo, setClienteInfo] = useState({
        nombre: '',
        email: '',
        telefono: '',
    });
    
    const fechaCreacion = new Date().toLocaleDateString();
    const fechaValidez = new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString();

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <PageTransition>
            <Navbar />
            <div className="container mx-auto px-4 py-8 font-['Lato']">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Crear Cotización</h1>
                
                {/* Información de la cotización */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Fecha de creación</p>
                            <p className="font-semibold text-gray-800">{fechaCreacion}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Válida hasta</p>
                            <p className="font-semibold text-gray-800">{fechaValidez}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-semibold text-yellow-600">Pendiente</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Información del cliente */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Información del Cliente</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={clienteInfo.nombre}
                                    onChange={(e) => setClienteInfo({...clienteInfo, nombre: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={clienteInfo.email}
                                    onChange={(e) => setClienteInfo({...clienteInfo, email: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={clienteInfo.telefono}
                                    onChange={(e) => setClienteInfo({...clienteInfo, telefono: e.target.value})}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0097c2] transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Productos</h2>
                        <button
                            type="button"
                            className="bg-[#0097c2] text-white px-6 py-2 rounded-lg shadow-sm hover:bg-[#0077a2] transition-all mb-6"
                            onClick={() => {/* Abrir modal */}}
                        >
                            Agregar Producto
                        </button>

                        <div className="overflow-hidden rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {/* Productos aquí */}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Resumen</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>IVA (13%)</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-800 pt-3">
                                <span>Total</span>
                                <span>$0.00</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="px-6 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                            onClick={() => {/* Descargar */}}
                        >
                            Descargar Cotización
                        </button>
                        <button
                            type="button"
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            onClick={() => {/* Convertir */}}
                        >
                            Convertir a Compra
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#0097c2] text-white rounded-lg hover:bg-[#0077a2] transition-all"
                        >
                            Guardar Cotización
                        </button>
                    </div>
                </form>
            </div>
        </PageTransition>
    );
}

export default CrearCotizacion;