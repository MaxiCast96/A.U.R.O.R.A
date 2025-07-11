import { Schema, model } from 'mongoose';

const sucursalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre de la sucursal es obligatorio'] },
    direccion: {
        calle: { type: String, required: [true, 'La calle es obligatoria'] },
        ciudad: { type: String, required: [true, 'La ciudad es obligatoria'] },
        departamento: { type: String, required: [true, 'El departamento es obligatorio'] }
    },
    telefono: { type: String, required: [true, 'El teléfono es obligatorio'] },
    correo: { type: String, required: [true, 'El correo es obligatorio'] },
    horariosAtencion: [
        {
            dia: {
                type: String
            },
            apertura: {
                type: String
            },
            cierre: {
                type: String
            }
        }
    ],
    activo: { type: Boolean, required: [true, 'El estado activo es obligatorio'] },
}, {
    timestamps: true,
    strict: true
});

export default model('Sucursales', sucursalSchema);