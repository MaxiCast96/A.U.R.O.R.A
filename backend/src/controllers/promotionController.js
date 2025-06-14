const promocionController = {};
import promocionModel from "../models/promotion.js";

// SELECT
promocionController.getpromociones = async (req, res) => {
  const promociones = await promocionModel.find();
  res.json(promociones);
};

// INSERT
promocionController.createpromocion = async (req, res) => {
  const { nombre, descripcion, tipoDescuento, valorDescuento, aplicaA, idsAplicacion, fechaInicio, fechaFin, codigoPromo, activo } = req.body;
  const newpromocion = new promocionModel({ nombre, descripcion, tipoDescuento, valorDescuento, aplicaA, idsAplicacion, fechaInicio, fechaFin, codigoPromo, activo });
  await newpromocion.save();
  res.json({ message: "promocion save" });
};

// DELETE
promocionController.deletepromocion = async (req, res) => {
  const deletedpromocion = await promocionModel.findByIdAndDelete(req.params.id);
  if (!deletedpromocion) {
    return res.status(404).json({ message: "promocion dont find" });
  }
  res.json({ message: "promocion deleted" });
};

// UPDATE
promocionController.updatepromocion = async (req, res) => {
  const { nombre, descripcion, tipoDescuento, valorDescuento, aplicaA, idsAplicacion, fechaInicio, fechaFin, codigoPromo, activo } = req.body;
  
  await promocionModel.findByIdAndUpdate(
    req.params.id,
    {
      nombre,
      descripcion,
      tipoDescuento,
      valorDescuento,
      aplicaA,
      idsAplicacion,
      fechaInicio,
      fechaFin,
      codigoPromo,
      activo
    },
    { new: true }
  );
  res.json({ message: "promocion update" });
};

export default promocionController;