// ===== MODELO SUCURSALES =====
import { Schema, model } from 'mongoose';

const sucursalSchema = new Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre de la sucursal es obligatorio'] // Nombre de la sucursal
    },
    direccion: { // Dirección completa de la sucursal
        calle: { 
            type: String, 
            required: [true, 'La calle es obligatoria'] 
        },
        ciudad: { 
            type: String, 
            required: [true, 'La ciudad es obligatoria'] 
        },
        departamento: { 
            type: String, 
            required: [true, 'El departamento es obligatorio'] 
        }
    },
    telefono: { 
        type: String, 
        required: [true, 'El teléfono es obligatorio'] // Teléfono de contacto
    },
    correo: { 
        type: String, 
        required: [true, 'El correo es obligatorio'] // Email de la sucursal
    },
    horariosAtencion: [ // Horarios de atención por día
        {
            dia: {
                type: String // Día de la semana
            },
            apertura: {
                type: String // Hora de apertura
            },
            cierre: {
                type: String // Hora de cierre
            }
        }
    ],
    activo: { 
        type: Boolean, 
        required: [true, 'El estado activo es obligatorio'] // Si la sucursal está operativa
    },
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('Sucursales', sucursalSchema);