import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/componentes/Login/Login.jsx'
import HomeAdmin from '@/componentes/Home/HomeAdmin.jsx'
import HomeVendedor from '@/componentes/Home/HomeVendedor.jsx'
import Productos from '@/componentes/Productos/Productos.jsx'
import Usuarios from '@/componentes/Usuarios/Usuarios.jsx'
import Ventas from '@/componentes/Ventas/Ventas.jsx'
import Reportes from '@/componentes/Reportes/Reportes.jsx'


import RutaProtegida from '@/componentes/RutaProtegida.jsx'
import '@/App.css' // Importar estilos globales
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/inicio-admin"
        element={
          <RutaProtegida ruta="/inicio-admin">
            <HomeAdmin />
          </RutaProtegida>
        }
      />
      <Route
        path="/inicio-vendedor"
        element={
          <RutaProtegida ruta="/inicio-vendedor">
            <HomeVendedor />
          </RutaProtegida>
        }
      />
      <Route
        path="/gestion-productos"
        element={
          <RutaProtegida ruta="/gestion-productos">
            <Productos />
          </RutaProtegida>
        }
      />

      <Route
        path="/gestion-ventas"
        element={
          <RutaProtegida ruta="/gestion-ventas">
            <Ventas />
          </RutaProtegida>
        }
      />
      <Route
        path="/reportes"
        element={
          <RutaProtegida ruta="/reportes">
            <Reportes />
          </RutaProtegida>
        }
      />
      <Route
        path="/gestion-usuarios"
        element={
          <RutaProtegida ruta="/gestion-usuarios">
            <Usuarios />
          </RutaProtegida>
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
