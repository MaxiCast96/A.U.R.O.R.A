# 🔄 FLUJO DE PROPS - A.U.R.O.R.A

##   **REGLAS IMPLEMENTADAS**

###   **FLUJO UNIDIRECCIONAL DE PROPS**
Los props se comparten **SIEMPRE** desde el componente padre hacia los componentes hijos.

### 🏗️ **ESTRUCTURA DE COMPONENTES**

#### **PÁGINAS (PADRES)**
- **Responsabilidades:**
  - Manejan datos con hooks (`useData`, `useAuth`, etc.)
  - Contienen la lógica de negocio
  - Pasan datos y handlers como props a componentes hijos
  - Manejan estados globales

#### **COMPONENTES (HIJOS)**
- **Responsabilidades:**
  - Reciben datos como props
  - Se enfocan solo en la presentación
  - No manejan datos directamente
  - Ejecutan handlers recibidos como props

---

## 📁 **ESTRUCTURA REFACTORIZADA**

### **1. PÁGINA HOME**
```
Home.jsx (PADRE)
├── Maneja: promociones, brands, populars con useData
├── Pasa props a:
│   ├── BrandsCarousel (brands, loading, error, currentSlide, onSlideChange)
│   └── PopularCarousel (items, loading, error, currentSlide, onSlideChange)
```

### **2. PÁGINA COTIZACIONES**
```
Cotizaciones.jsx (PADRE)
├── Maneja: cotizaciones con useData
├── Pasa props a:
│   └── Tabla de cotizaciones (datos, handlers)
```

### **3. PÁGINA VER COTIZACIÓN**
```
VerCotizacionPage.jsx (PADRE)
├── Maneja: cotización específica con useData
├── Pasa props a:
│   └── VerCotizacion (cotizacion, loading, error, onConvertirACompra)
```

### **4. PÁGINA CREAR COTIZACIÓN**
```
CrearCotizacionPage.jsx (PADRE)
├── Maneja: productos, clienteInfo, estados
├── Pasa props a:
│   └── CrearCotizacion (todos los datos y handlers)
```

---

## 🔧 **EJEMPLOS DE IMPLEMENTACIÓN**

### **COMPONENTE PADRE (PÁGINA)**
```jsx
// Home.jsx - PADRE
const Home = () => {
  // TODOS los datos se manejan en el componente padre
  const { data: promociones, loading: loadingPromos, error: errorPromos } = useData('promociones');
  const { data: brands, loading: loadingBrands, error: errorBrands } = useData('marcas');
  
  // Handlers se definen en el padre
  const handleBrandSlideChange = (newSlide) => {
    setCurrentBrandSlide(newSlide);
  };

  return (
    <BrandsCarousel 
      brands={brands}
      loading={loadingBrands}
      error={errorBrands}
      currentSlide={currentBrandSlide}
      onSlideChange={handleBrandSlideChange}
    />
  );
};
```

### **COMPONENTE HIJO**
```jsx
// BrandsCarousel.jsx - HIJO
const BrandsCarousel = ({ 
  brands = [], 
  loading = false, 
  error = null, 
  currentSlide = 0, 
  onSlideChange 
}) => {
  // Solo recibe props, no maneja datos
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {/* Renderiza con los datos recibidos como props */}
    </div>
  );
};
```

---

##   **BENEFICIOS IMPLEMENTADOS**

### **1. FLUJO DE DATOS CLARO**
-   Datos fluyen de padre → hijo
-   Handlers fluyen de padre → hijo
-   Estados centralizados en páginas

### **2. COMPONENTES REUTILIZABLES**
-   Componentes hijos son puros (solo props)
-   Fáciles de testear
-   Independientes de fuentes de datos

### **3. MANTENIBILIDAD**
-   Lógica centralizada en páginas
-   Separación clara de responsabilidades
-   Fácil debugging

### **4. PERFORMANCE**
-   Estados optimizados en páginas padre
-   Re-renders controlados
-   Props memoizables

---

## 🚫 **ANTES (INCORRECTO)**
```jsx
//   Componente hijo manejando datos
const BrandsCarousel = () => {
  const { data: brands } = useData('marcas'); //   Hook en hijo
  return <div>{/* render */}</div>;
};
```

##   **DESPUÉS (CORRECTO)**
```jsx
//   Componente hijo recibiendo props
const BrandsCarousel = ({ brands, loading, error }) => {
  return <div>{/* render con props */}</div>;
};

//   Página padre manejando datos
const Home = () => {
  const { data: brands } = useData('marcas'); //   Hook en padre
  return <BrandsCarousel brands={brands} />;
};
```

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

-   **Home.jsx** - Refactorizado con flujo de props
-   **BrandsCarousel.jsx** - Recibe props del padre
-   **PopularCarousel.jsx** - Recibe props del padre
-   **Cotizaciones.jsx** - Maneja datos y pasa props
-   **VerCotizacionPage.jsx** - Nueva página padre
-   **VerCotizacion.jsx** - Recibe props del padre
-   **CrearCotizacionPage.jsx** - Nueva página padre
-   **CrearCotizacion.jsx** - Recibe props del padre

---

## 🎯 **RESULTADO FINAL**

El proyecto ahora cumple **100%** con la regla de flujo unidireccional de props:
- **Páginas** manejan datos y lógica
- **Componentes** reciben props y se enfocan en presentación
- **Flujo de datos** siempre padre → hijo
- **Reutilización** de componentes optimizada
- **Mantenibilidad** mejorada significativamente 