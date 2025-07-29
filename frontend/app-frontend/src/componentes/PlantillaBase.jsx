import {useState,useEffect} from'react'
import {Link,useLocation} from'react-router-dom'
import logoEmpresaIcono from '@/imagenes/logo.png'
import inicioIcono from '@/imagenes/inicio.svg'
import productosIcono from '@/imagenes/productos.svg'
import ventasIcono from '@/imagenes/ventas.svg'
import reportesIcono from '@/imagenes/reportes.png'
import usuariosIcono from '@/imagenes/usuarios.svg'
import cerrarSesionIcono from '@/imagenes/cerrar-sesion.svg'

import'@/estilos/PlantillaBase.css'

export default function PlantillaBase({componente}){
  console.log('PlantillaBase renderizada')
  const ubicacion=useLocation()
  const[menuAbierto,setMenuAbierto]=useState(false)
  const[modoManual,setModoManual]=useState(false)
  const[rutasDisponibles,setRutasDisponibles]=useState([])

  const rutasValidas={
    '/inicio-admin':{etiqueta:'Inicio',icono:inicioIcono},
    '/inicio-vendedor':{etiqueta:'Inicio',icono:inicioIcono},
    '/gestion-productos':{etiqueta:'Gestión de Productos',icono:productosIcono},
    '/gestion-ventas':{etiqueta:'Gestión de Ventas',icono:ventasIcono},
    '/reportes':{etiqueta:'Reportes',icono:reportesIcono},
    '/gestion-usuarios':{etiqueta:'Gestión de Usuarios',icono:usuariosIcono}
  }

  useEffect(()=>{
    const rutasRecibidas=JSON.parse(sessionStorage.getItem('rutas')||'[]')
    const rutasFiltradas=rutasRecibidas.filter(ruta=>rutasValidas.hasOwnProperty(ruta))
    setRutasDisponibles(rutasFiltradas)
  },[])

  const cerrarSesion=()=>{
    sessionStorage.clear()
    window.location.href='/'
  }

  const alEntrarMouse=()=>{
    if(!modoManual)setMenuAbierto(true)
  }
  const alSalirMouse=()=>{
    if(!modoManual)setMenuAbierto(false)
  }
  const alternarMenu=()=>{
    setMenuAbierto(prev=>!prev)
    setModoManual(true)
  }

  useEffect(()=>{
    if(!menuAbierto&&modoManual){
      const temporizador=setTimeout(()=>setModoManual(false),500)
      return()=>clearTimeout(temporizador)
    }
  },[menuAbierto,modoManual])

  return(
    <div className={`plantillaBase ${menuAbierto?'menu-abierto':'menu-cerrado'}`}>
      <aside
        className="barraLateral"
        onMouseEnter={alEntrarMouse}
        onMouseLeave={alSalirMouse}
      >
        <div className="areaLogo">
          <img src={logoEmpresaIcono} alt="Logo" className="logo"/>
          {menuAbierto&&<span className="tituloEmpresa">Gestión de operaciones</span>}
        </div>
        <nav className="menuNavegacion">
          {rutasDisponibles.map(ruta=>(
            <Link
              key={ruta}
              to={ruta}
              className={`itemNavegacion${ubicacion.pathname===ruta?' activo':''}`}
              onClick={()=>setMenuAbierto(false)}
              title={"Botón para ir a "+rutasValidas[ruta].etiqueta}
            >
              <img src={rutasValidas[ruta].icono} alt={rutasValidas[ruta].etiqueta} className="iconoRuta"/>
              {menuAbierto&&<span>{rutasValidas[ruta].etiqueta}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="contenidoPrincipal">
        <header className="encabezado">
          <div className="menuIzquierda">
            <button onClick={alternarMenu} className="botonMenu">
              {menuAbierto?'X':'☰'}
            </button>
          </div>
          <div className="usuarioCerrarSesion">
            <div className="usuarioDerecha">{sessionStorage.getItem('usuario')}</div>
            <div className="cerrarSesion" onClick={cerrarSesion} role="button" tabIndex={0}>
              <img src={cerrarSesionIcono} alt="Cerrar sesión" className="iconoCerrar" title="Botón para cerrar sesión"/>

            </div>
          </div>
        </header>
        <main className="contenido">{componente}</main>
        <footer className="piePagina">
          <p>© 2025 Novedades Isabela. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}
