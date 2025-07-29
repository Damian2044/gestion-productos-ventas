import PlantillaBase from "../PlantillaBase";
import { useState, useEffect } from "react";
import {
  listarUsuariosServicio,
  buscarUsuarioServicio
} from "@/servicios/servicioUsuarios";
import {
  listarProductosServicio,
  listarCategoriasServicio,
} from "@/servicios/servicioProducto";

import { 
  FiUsers, FiBox, FiTag, FiDollarSign, FiLayers, 
  FiCheckCircle, FiXCircle, FiCalendar, FiClock 
} from "react-icons/fi";

export default function HomeAdmin() {
  const [totalUsuarios,setTotalUsuarios] = useState(null);
  const [totalProductos,setTotalProductos] = useState(null);
  const [productosActivos,setProductosActivos] = useState(null);
  const [productosDeshabilitados,setProductosDeshabilitados] = useState(null);
  const [totalCategorias,setTotalCategorias] = useState(null);
  const [productosCreadosUsuario,setProductosCreadosUsuario] = useState(null);
  const [fechaActual, setFechaActual] = useState(null);
  const [horaActual, setHoraActual] = useState(null);
  // Monto total de ventas quemado
  const montoTotalVentas=256000;

  useEffect(() => {
    const cargarDatos=async() => {
      try{
        // Usuarios
        const respUsuarios=await listarUsuariosServicio();
        if(respUsuarios.estado && Array.isArray(respUsuarios.datos)){
          setTotalUsuarios(respUsuarios.datos.length);
        }else{
          setTotalUsuarios(0);
        }

        // Productos
        const respProductos=await listarProductosServicio();
        if(respProductos.estado && Array.isArray(respProductos.datos)){
          setTotalProductos(respProductos.datos.length);
          // Contar productos activos y deshabilitados según campo estado
          const activos=respProductos.datos.filter(p=>p.estado==="activo").length;
          const deshabilitados=respProductos.datos.filter(p=>p.estado!=="activo").length;
          setProductosActivos(activos);
          setProductosDeshabilitados(deshabilitados);
        }else{
          setTotalProductos(0);
          setProductosActivos(0);
          setProductosDeshabilitados(0);
        }

        // Categorías
        const respCategorias=await listarCategoriasServicio();
        if(respCategorias.estado && Array.isArray(respCategorias.datos)){
          setTotalCategorias(respCategorias.datos.length);
        }else{
          setTotalCategorias(0);
        }

        // Productos creados por el usuario logueado
        const datosUsuarioStr=sessionStorage.getItem("datosUsuario");
        if(datosUsuarioStr){
          const datosUsuario=JSON.parse(datosUsuarioStr);
          console.log("Datos del usuario logueado:", datosUsuario.id,typeof datosUsuario.id);
          let datosRealesUsuario= await buscarUsuarioServicio(datosUsuario.id);
          datosRealesUsuario=datosRealesUsuario.datos;
          if(datosUsuario?.id){
            if(datosRealesUsuario && datosRealesUsuario.administrador.numeroProductosCreados!=null){
              setProductosCreadosUsuario(datosRealesUsuario.administrador.numeroProductosCreados);
            }else{
              setProductosCreadosUsuario(0);
            }
          }
        }
      }catch(error){
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();

    // Fecha actual fija con zona horaria Ecuador
    const ahora = new Date();
    setFechaActual(ahora.toLocaleDateString("es-EC", {
      timeZone: "America/Guayaquil",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));

    // Actualizar hora cada segundo con zona horaria Ecuador
    const intervalo = setInterval(() => {
      const ahoraHora = new Date();
      setHoraActual(ahoraHora.toLocaleTimeString("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }));
    }, 1000);

    // Cleanup del intervalo al desmontar componente
    return () => clearInterval(intervalo);
  },[]);

  // Métricas sin fecha ni hora
  const metricas=[
    {titulo:"Total Usuarios",valor:totalUsuarios??"Cargando...",icono:<FiUsers size={32} className="text-blue-600"/>},
    {titulo:"Productos Registrados",valor:totalProductos??"Cargando...",icono:<FiBox size={32} className="text-green-600"/>},
    {titulo:"Productos Activos",valor:productosActivos??"Cargando...",icono:<FiCheckCircle size={32} className="text-green-500"/>},
    {titulo:"Productos Deshabilitados",valor:productosDeshabilitados??"Cargando...",icono:<FiXCircle size={32} className="text-red-500"/>},
    {titulo:"Categorías Activas",valor:totalCategorias??"Cargando...",icono:<FiTag size={32} className="text-yellow-600"/>},
    {titulo:"Productos Creados por Ti",valor:productosCreadosUsuario??"Cargando...",icono:<FiLayers size={32} className="text-purple-600"/>},
  ];

  function componenteHomeAdmin(){
    return(
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Bienvenido al panel de administración</h1>
      </div>

        {/* Fecha y hora arriba */}
        <div className="flex justify-center gap-10 mb-10 text-indigo-700 font-semibold text-lg">
          <div className="flex items-center gap-2">
            <FiCalendar size={28} />
            <span>{fechaActual ?? "Cargando..."}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock size={28} />
            <span>{horaActual ?? "Cargando..."}</span>
          </div>
        </div>

        {/* Grid de métricas */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {metricas.map((metrica,indice)=>(
            <div
              key={indice}
              className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition duration-300 flex items-center gap-4 min-h-[100px]"
            >
              <div className="flex-shrink-0">{metrica.icono}</div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 break-words leading-tight">{metrica.titulo}</p>
                <p className="text-3xl font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis">
                  {metrica.valor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <PlantillaBase componente={componenteHomeAdmin()}/>;
}
