import Clientes from '../models/Clientes.js';
import Ventas from '../models/Ventas.js';
import Citas from '../models/Citas.js';
import Lentes from '../models/Lentes.js';
import Recetas from '../models/Recetas.js';

// SELECT - Obtiene estadísticas generales del dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Obtener fecha actual y primer día del mes (normalizado a UTC para evitar desfases de zona horaria)
    const now = new Date();
    const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const firstDayOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Contar total de clientes activos
    const totalClientes = await Clientes.countDocuments({ estado: 'Activo' });

    // Contar citas de hoy
    const citasHoy = await Citas.countDocuments({
      fecha: {
        $gte: todayStart,
        $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Contar ventas del mes actual (solo finalizadas)
    const ventasDelMes = await Ventas.countDocuments({
      fecha: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth },
      estado: { $in: ['completada', 'procesada', 'Completada', 'Procesada'] }
    });

    // Calcular ingresos del mes usando agregación
    const ventasIngresos = await Ventas.aggregate([
      {
        $match: {
          fecha: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth },
          estado: { $in: ['completada', 'procesada', 'Completada', 'Procesada'] }
        }
      },
      {
        $group: {
          _id: null,
          totalIngresos: { $sum: '$facturaDatos.total' }
        }
      }
    ]);

    const totalIngresos = ventasIngresos.length > 0 ? Math.round(ventasIngresos[0].totalIngresos * 100) / 100 : 0;

    res.json({
      success: true,
      data: {
        totalClientes,
        citasHoy,
        ventasDelMes,
        totalIngresos
      }
    });
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// SELECT - Obtiene datos para gráfico de ventas mensuales
const getVentasMensuales = async (req, res) => {
  try {
    const { year = new Date().getUTCFullYear() } = req.query;
    
    // Busca ventas del año específico usando agregación
    const ventasMensuales = await Ventas.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(Date.UTC(parseInt(year), 0, 1)),
            $lt: new Date(Date.UTC(parseInt(year) + 1, 0, 1))
          },
          estado: { $in: ['completada', 'procesada', 'Completada', 'Procesada'] }
        }
      },
      {
        $group: {
          _id: { $month: '$fecha' },
          ventas: { $sum: 1 },
          ingresos: { $sum: '$facturaDatos.total' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Crear array con todos los meses del año
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const datosCompletos = meses.map((mes, index) => {
      const mesData = ventasMensuales.find(v => v._id === index + 1);
      return {
        mes,
        ventas: mesData ? mesData.ventas : 0,
        ingresos: mesData ? Math.round(mesData.ingresos * 100) / 100 : 0
      };
    });

    res.json({
      success: true,
      data: datosCompletos
    });
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// SELECT - Obtiene estado de citas para gráfico circular
const getEstadoCitas = async (req, res) => {
  try {
    // Busca y agrupa citas por estado
    const estadoCitas = await Citas.aggregate([
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      },
      {
        $sort: { cantidad: -1 }
      }
    ]);

    // Mapear estados a español para mejor presentación
    const estadosMap = {
      'confirmada': 'Confirmadas',
      'pendiente': 'Pendientes',
      'cancelada': 'Canceladas',
      'completada': 'Completadas',
      'Confirmada': 'Confirmadas',
      'Pendiente': 'Pendientes',
      'Cancelada': 'Canceladas',
      'Completada': 'Completadas'
    };

    const datosFormateados = estadoCitas.map(item => ({
      estado: estadosMap[item._id] || item._id,
      cantidad: item.cantidad
    }));

    res.json({
      success: true,
      data: datosFormateados
    });
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// SELECT - Obtiene productos más populares usando agregación
const getProductosPopulares = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Busca productos más vendidos usando agregación
    const productosPopulares = await Ventas.aggregate([
      {
        $unwind: '$productos'
      },
      {
        $group: {
          _id: '$productos.nombre',
          cantidad: { $sum: '$productos.cantidad' },
          ingresos: { $sum: { $multiply: ['$productos.precioUnitario', '$productos.cantidad'] } }
        }
      },
      {
        $sort: { cantidad: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: productosPopulares
    });
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// SELECT - Obtiene todas las estadísticas del dashboard en una sola llamada
const getAllDashboardData = async (req, res) => {
  try {
    // Ejecutar todas las consultas en paralelo para optimizar rendimiento
    const [stats, ventasMensuales, estadoCitas, productosPopulares] = await Promise.all([
      // Stats básicos
      (async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const totalClientes = await Clientes.countDocuments({ estado: 'Activo' });
        const citasHoy = await Citas.countDocuments({
          fecha: {
            $gte: todayStart,
            $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
          }
        });
        const ventasDelMes = await Ventas.countDocuments({
          fecha: { $gte: firstDayOfMonth },
          estado: { $in: ['completada', 'procesada'] }
        });

        const ventasIngresos = await Ventas.aggregate([
          {
            $match: {
              fecha: { $gte: firstDayOfMonth },
              estado: { $in: ['completada', 'procesada'] }
            }
          },
          {
            $group: {
              _id: null,
              totalIngresos: { $sum: '$facturaDatos.total' }
            }
          }
        ]);

        return {
          totalClientes,
          citasHoy,
          ventasDelMes,
          totalIngresos: ventasIngresos.length > 0 ? Math.round(ventasIngresos[0].totalIngresos * 100) / 100 : 0
        };
      })(),

      // Ventas mensuales del año actual
      (async () => {
        const year = new Date().getUTCFullYear();
        const ventasMensuales = await Ventas.aggregate([
          {
            $match: {
              fecha: {
                $gte: new Date(Date.UTC(year, 0, 1)),
                $lt: new Date(Date.UTC(year + 1, 0, 1))
              },
              estado: { $in: ['completada', 'procesada', 'Completada', 'Procesada'] }
            }
          },
          {
            $group: {
              _id: { $month: '$fecha' },
              ventas: { $sum: 1 }
            }
          },
          {
            $sort: { '_id': 1 }
          }
        ]);

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return meses.map((mes, index) => {
          const mesData = ventasMensuales.find(v => v._id === index + 1);
          return {
            mes,
            ventas: mesData ? mesData.ventas : 0
          };
        });
      })(),

      // Estado de citas agrupado
      (async () => {
        const estadoCitas = await Citas.aggregate([
          {
            $group: {
              _id: '$estado',
              cantidad: { $sum: 1 }
            }
          }
        ]);

        const estadosMap = {
          'confirmada': 'Confirmadas',
          'pendiente': 'Pendientes',
          'cancelada': 'Canceladas',
          'completada': 'Completadas',
          'Confirmada': 'Confirmadas',
          'Pendiente': 'Pendientes',
          'Cancelada': 'Canceladas',
          'Completada': 'Completadas'
        };

        return estadoCitas.map(item => ({
          estado: estadosMap[item._id] || item._id,
          cantidad: item.cantidad
        }));
      })(),

      // Productos más populares
      (async () => {
        const productosPopulares = await Ventas.aggregate([
          {
            $unwind: '$productos'
          },
          {
            $group: {
              _id: '$productos.nombre',
              cantidad: { $sum: '$productos.cantidad' }
            }
          },
          {
            $sort: { cantidad: -1 }
          },
          {
            $limit: 5
          }
        ]);

        return productosPopulares;
      })()
    ]);

    res.json({
      success: true,
      data: {
        stats,
        ventasMensuales,
        estadoCitas,
        productosPopulares
      }
    });
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export {
  getDashboardStats,
  getVentasMensuales,
  getEstadoCitas,
  getProductosPopulares,
  getAllDashboardData
};