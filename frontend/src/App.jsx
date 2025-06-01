import { useState } from 'react'
import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/public/Home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     {/* Componente Router para manejar las rutas de la aplicación */}
      <Router>
        <Routes>
          {/* Ruta para la página de inicio */}
          <Route path="/" element={<Home />} />
          {/* Puedes agregar más rutas aquí */}
        </Routes>
      </Router>
        
    </>
  )
}

export default App
