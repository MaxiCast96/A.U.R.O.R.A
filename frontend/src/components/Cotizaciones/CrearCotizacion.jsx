import React, { useState } from "react";
import PageTransition from "../transition/PageTransition";
import Navbar from "../layout/Navbar";
import { useAuth } from '../auth/AuthContext';

const CrearCotizacion = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [clienteInfo, setClienteInfo] = useState({
        correoCliente: user?.correo || user?.email || '',
        telefonoCliente: user?.telefono || '',
    });
    // Si el usuario cambia (por ejemplo, tras login), actualiza los campos precargados
    React.useEffect(() => {
        setClienteInfo({
            correoCliente: user?.correo || user?.email || '',
            telefonoCliente: user?.telefono || '',
        });
    }, [user]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const fechaCreacion = new Date();
    const fechaValidez = new Date(Date.now() + 30*24*60*60*1000);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch('http://localhost:4000/api/cotizaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: user?.clienteId,
                    correoCliente: clienteInfo.correoCliente,
                    telefonoCliente: clienteInfo.telefonoCliente,
                    productos: productos.map(p => ({
                        productoId: p.productoId,
                        nombre: p.nombre,
                        categoria: p.categoria,
                        cantidad: p.cantidad,
                        precioUnitario: p.precio
                    })),
                    fecha: fechaCreacion.toISOString(),
                    validaHasta: fechaValidez.toISOString(),
                    estado: 'pendiente'
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al crear la cotización');
            }
            setSuccess(true);
            setProductos([]);
            setClienteInfo({ correoCliente: '', telefonoCliente: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <PageTransition>
                <Navbar />
                <div className="container mx-auto px-4 py-8 font-['Lato']">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800">Crear Cotización</h1>
                    <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded text-center">
                        Debes iniciar sesión para crear una cotización.
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <Navbar />
            <div className="container mx-auto px-4 py-8 font-['Lato']">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Crear Cotización</h1>
                {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">Cotización creada correctamente.</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
                {/* Información de la cotización */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Fecha de creación</p>
                            <p className="font-semibold text-gray-800">{fechaCreacion.toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Válida hasta</p>
                            <p className="font-semibold text-gray-800">{fechaValidez.toLocaleDateString()}</p>
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
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Información de Contacto</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={clienteInfo.correoCliente}
                                    onChange={(e) => setClienteInfo({...clienteInfo, correoCliente: e.target.value})}
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
                                    value={clienteInfo.telefonoCliente}
                                    onChange={(e) => setClienteInfo({...clienteInfo, telefonoCliente: e.target.value})}
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
                            onClick={() => {/* Abrir modal para agregar producto */}}
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
                                    {productos.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-4">No hay productos agregados actualmente.</td></tr>
                                    ) : (
                                        productos.map((prod, idx) => (
                                            <tr key={idx}>
                                                <td>{prod.producto}</td>
                                                <td>{prod.cantidad}</td>
                                                <td>${prod.precio?.toFixed(2) ?? '0.00'}</td>
                                                <td>${((prod.cantidad || 0) * (prod.precio || 0)).toFixed(2)}</td>
                                                <td>
                                                    <button type="button" onClick={() => setProductos(productos.filter((_, i) => i !== idx))} className="text-red-500 hover:underline">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
                                <span>${productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio || 0), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>IVA (13%)</span>
                                <span>${(productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio || 0), 0) * 0.13).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-800 pt-3">
                                <span>Total</span>
                                <span>${(productos.reduce((acc, p) => acc + (p.cantidad || 0) * (p.precio || 0), 0) * 1.13).toFixed(2)}</span>
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
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cotización'}
                        </button>
                    </div>
                </form>
            </div>
        </PageTransition>
    );
}

export default CrearCotizacion;