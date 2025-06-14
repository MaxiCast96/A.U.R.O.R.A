const cartController = {};
import cartModel from "../models/carrito.js"
// SELECT - Obtener todos los carritos
cartController.getCarts = async (req, res) => {
  try {
    const carts = await cartModel.find().populate('clienteId', 'nombre correo');
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener carritos", error: error.message });
  }
};

// SELECT - Obtener carrito por ID
cartController.getCartById = async (req, res) => {
  try {
    const cart = await cartModel.findById(req.params.id).populate('clienteId', 'nombre correo');
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener carrito", error: error.message });
  }
};

// SELECT - Obtener carrito por cliente
cartController.getCartByClient = async (req, res) => {
  try {
    const cart = await cartModel.findOne({ clienteId: req.params.clienteId }).populate('clienteId', 'nombre correo');
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado para este cliente" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener carrito del cliente", error: error.message });
  }
};

// INSERT - Crear nuevo carrito
cartController.createCart = async (req, res) => {
  try {
    const { clienteId, productos, total } = req.body;
    
    // Validar que productos no esté vacío
    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: "El carrito debe tener al menos un producto" });
    }

    // Verificar si el cliente ya tiene un carrito
    const existingCart = await cartModel.findOne({ clienteId });
    if (existingCart) {
      return res.status(400).json({ message: "El cliente ya tiene un carrito activo" });
    }

    const newCart = new cartModel({ 
      clienteId, 
      productos, 
      total 
    });
    
    await newCart.save();
    res.status(201).json({ message: "Carrito creado exitosamente", cart: newCart });
  } catch (error) {
    res.status(500).json({ message: "Error al crear carrito", error: error.message });
  }
};

// UPDATE - Actualizar carrito
cartController.updateCart = async (req, res) => {
  try {
    const { clienteId, productos, total } = req.body;
    
    // Validar que productos no esté vacío
    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: "El carrito debe tener al menos un producto" });
    }

    const updatedCart = await cartModel.findByIdAndUpdate(
      req.params.id,
      {
        clienteId,
        productos,
        total
      },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    res.json({ message: "Carrito actualizado exitosamente", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar carrito", error: error.message });
  }
};

// DELETE - Eliminar carrito (vaciar carrito)
cartController.deleteCart = async (req, res) => {
  try {
    const deletedCart = await cartModel.findByIdAndDelete(req.params.id);
    
    if (!deletedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    
    res.json({ message: "Carrito eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar carrito", error: error.message });
  }
};

export default cartController;