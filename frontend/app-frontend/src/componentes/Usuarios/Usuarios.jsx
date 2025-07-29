import PlantillaBase from "@/componentes/PlantillaBase";
import {useState,useEffect} from "react";
import {useForm} from "react-hook-form";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import ojo from '@/imagenes/ojo.png';
import ojoAbierto from '@/imagenes/ojo-abierto.png';
import {
  listarUsuariosServicio,
  crearUsuarioServicio,
  actualizarUsuarioServicio,
  deshabilitarUsuarioServicio,
} from "@/servicios/servicioUsuarios";

function CampoContrasenaValidado({registrar,nombre,marcador,error,modo,setError,clearErrors}){
  const [mostrarContrasena,setMostrarContrasena]=useState(false);
  const alternarMostrar=()=>setMostrarContrasena(!mostrarContrasena);

  const manejarBlur=(e)=>{
    const valor=e.target.value;
    if(modo==="crear"){
      if(!valor){
        setError(nombre,{type:"manual",message:"Contraseña requerida"});
        return;
      }
      if(valor.length<8){
        setError(nombre,{type:"manual",message:"Mínimo 8 caracteres"});
        return;
      }
      if(!/[0-9]/.test(valor)||!/[!@#$%^&*]/.test(valor)){
        setError(nombre,{type:"manual",message:"Debe incluir números y símbolos"});
        return;
      }
      clearErrors(nombre);
    }else{
      if(valor){
        if(valor.length<8){
          setError(nombre,{type:"manual",message:"Mínimo 8 caracteres"});
          return;
        }
        if(!/[0-9]/.test(valor)||!/[!@#$%^&*]/.test(valor)){
          setError(nombre,{type:"manual",message:"Debe incluir números y símbolos"});
          return;
        }
      }
      clearErrors(nombre);
    }
  };
  return(
    <div className="campoContrasena">
      <div className="contenedorInputIcono" style={{position:"relative"}}>
        <input
          type={mostrarContrasena?"text":"password"}
          placeholder={marcador}
          {...registrar(nombre)}
          className={clsx("entrada border rounded px-3 py-2 w-full",{"border-red-600 bg-red-50":error})}
          autoComplete="new-password"
          onBlur={manejarBlur}
        />
        <img
          src={mostrarContrasena?ojoAbierto:ojo}
          alt={mostrarContrasena?"Ocultar contraseña":"Mostrar contraseña"}
          onClick={alternarMostrar}
          className="iconoOjo"
          style={{
            cursor:"pointer",
            position:"absolute",
            right:"10px",
            top:"50%",
            transform:"translateY(-50%)",
            width:"20px",
            height:"20px",
          }}
        />
      </div>
      {error&&<p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

export default function Usuarios(){
  const [usuarios,setUsuarios]=useState([]);
  const [filtro,setFiltro]=useState("");
  const [modo,setModo]=useState("lista");// lista|crear|actualizar|ver
  const [usuarioSeleccionado,setUsuarioSeleccionado]=useState(null);
  const [mensaje,setMensaje]=useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState:{errors},
  }=useForm({
    defaultValues:{
      nombreCompleto:"",
      usuario:"",
      contrasenia:"",
      rol:"",
      estado:true,
    },
  });

  const obtenerUsuarios=async()=>{
    const resp=await listarUsuariosServicio();
    if(resp.estado)setUsuarios(resp.datos);
    else setUsuarios([]);
  };

  useEffect(()=>{
    obtenerUsuarios();
    const intervalo=setInterval(()=>{
      obtenerUsuarios();
    },5000);
    return()=>clearInterval(intervalo);
  },[]);

  useEffect(()=>{
    if(mensaje){
      const temporizador=setTimeout(()=>setMensaje(null),4000);
      return()=>clearTimeout(temporizador);
    }
  },[mensaje]);

  const usuariosFiltrados=filtro.trim()
    ?usuarios.filter(usuario=>usuario.usuario.toLowerCase().includes(filtro.toLowerCase())||usuario.nombreCompleto.toLowerCase().includes(filtro.toLowerCase()))
    :usuarios;

  const abrirCrear=()=>{
    setModo("crear");
    setUsuarioSeleccionado(null);
    reset({nombreCompleto:"",usuario:"",contrasenia:"",rol:"",estado:true});
  };

  const abrirActualizar=(usuario)=>{
    setModo("actualizar");
    setUsuarioSeleccionado(usuario);
    reset({
      nombreCompleto:usuario.nombreCompleto,
      usuario:usuario.usuario,
      contrasenia:"",
      rol:usuario.rol,
      estado:usuario.estado,
    });
  };

  const abrirVer=(usuario)=>{
    setModo("ver");
    setUsuarioSeleccionado(usuario);
  };

  const validarCamposExtras=(datos)=>{
    const errores={};
    if(!datos.nombreCompleto?.trim())errores.nombreCompleto="Nombre requerido";
    if(!datos.usuario?.trim())errores.usuario="Usuario requerido";
    if(!["administrador","vendedor"].includes(datos.rol))errores.rol="Rol requerido";
    if(modo==="crear"){
      if(!datos.contrasenia)errores.contrasenia="Contraseña requerida";
      else if(datos.contrasenia.length<8)errores.contrasenia="Mínimo 8 caracteres";
      else if(!/[0-9]/.test(datos.contrasenia)||!/[!@#$%^&*]/.test(datos.contrasenia))errores.contrasenia="Debe incluir números y símbolos";
    }
    if(modo==="actualizar"&&datos.contrasenia){
      if(datos.contrasenia.length<8)errores.contrasenia="Mínimo 8 caracteres";
      else if(!/[0-9]/.test(datos.contrasenia)||!/[!@#$%^&*]/.test(datos.contrasenia))errores.contrasenia="Debe incluir números y símbolos";
    }
    return errores;
  };

  const enviarCrear=async(datos)=>{
    if(typeof datos.contrasenia!=="string")datos.contrasenia="";
    const erroresValidacion=validarCamposExtras(datos);
    if(Object.keys(erroresValidacion).length){
      for(const campo in erroresValidacion){
        setError(campo,{type:"manual",message:erroresValidacion[campo]});
      }
      return;
    }
    try{
      const resp=await crearUsuarioServicio(datos);
      if(!resp.estado){
        let mensajeError=resp.detail||resp.mensaje||"";
        setMensaje({tipo:"error",texto:mensajeError});
        if(resp.errors){
          for(const campo in resp.errors){
            setError(campo,{type:"server",message:resp.errors[campo]});
          }
        }
        return;
      }
      setMensaje({tipo:"exito",texto:`Usuario ${datos.usuario} creado correctamente`});
      await obtenerUsuarios();
      setModo("lista");
    }catch(error){
      let texto="";
      if(error?.detail)texto=error.detail;
      else if(error?.message)texto=error.message;
      setMensaje({tipo:"error",texto});
    }
  };

  const enviarActualizar=async(datos)=>{
    const erroresValidacion=validarCamposExtras(datos);
    if(Object.keys(erroresValidacion).length){
      for(const campo in erroresValidacion){
        setError(campo,{type:"manual",message:erroresValidacion[campo]});
      }
      return;
    }
    if(!usuarioSeleccionado)return;
    const payload={
      id:usuarioSeleccionado.id,
      nombreCompleto:datos.nombreCompleto,
      usuario:datos.usuario,
      rol:datos.rol,
      estado:datos.estado,
    };
    if(datos.contrasenia?.trim()){
      payload.contrasenia=datos.contrasenia;
    }else{
      payload.contrasenia=usuarioSeleccionado.contrasenia;
    }
    try{
      const resp=await actualizarUsuarioServicio(usuarioSeleccionado.id,payload);
      if(!resp.estado){
        let mensajeError=resp.detail||resp.mensaje||"";
        setMensaje({tipo:"error",texto:mensajeError});
        if(resp.errors){
          for(const campo in resp.errors){
            setError(campo,{type:"server",message:resp.errors[campo]});
          }
        }
        return;
      }
      setMensaje({tipo:"exito",texto:`Usuario ${datos.usuario} actualizado correctamente`});
      await obtenerUsuarios();
      setModo("lista");
    }catch(error){
      let texto="";
      if(error?.detail)texto=error.detail;
      else if(error?.message)texto=error.message;
      setMensaje({tipo:"error",texto});
    }
  };

  const alternarEstado=async(usuario)=>{
    if(!usuario.estado)return;
    const resp=await deshabilitarUsuarioServicio(usuario.id);
    if(!resp.estado){
      setMensaje({tipo:"error",texto:resp.mensaje});
      return;
    }
    setMensaje({tipo:"exito",texto:`Usuario ${usuario.usuario} deshabilitado correctamente`});
    await obtenerUsuarios();
  };

  const columnas=[
    {
      name:"Usuario",
      selector:fila=>fila.usuario,
      sortable:true,
    },
    {
      name:"Nombre",
      selector:fila=>fila.nombreCompleto,
      sortable:true,
    },
    {
      name:"Rol",
      cell:fila=>(
        <span className={clsx("px-2 py-1 rounded text-white",{
          "bg-blue-500":fila.rol==="administrador",
          "bg-green-500":fila.rol==="vendedor",
        })}>
          {fila.rol}
        </span>
      ),
      sortable:true,
    },
    {
      name:"Estado",
      cell:fila=>fila.estado
        ?<span className="text-green-600 font-semibold">Activo</span>
        :<span className="text-red-600 font-semibold">Deshabilitado</span>,
      sortable:true,
    },
    {
      name:"Ver",
      cell:fila=>(
        <button
          className="bg-gray-300 px-3 py-1 rounded shadow hover:bg-gray-400 transition-colors duration-150"
          onClick={()=>abrirVer(fila)}
          style={{minWidth:80}}
        >
          Ver
        </button>
      ),
      style:{minWidth:90,maxWidth:110,textAlign:'center'},
      ignoreRowClick:true,
      button:true,
    },
    {
      name:"Actualizar",
      cell:fila=>(
        <button
          className="bg-yellow-300 px-3 py-1 rounded shadow hover:bg-yellow-400 transition-colors duration-150"
          onClick={()=>abrirActualizar(fila)}
          style={{minWidth:90}}
        >
          Actualizar
        </button>
      ),
      style:{minWidth:110,maxWidth:130,textAlign:'center'},
      ignoreRowClick:true,
      button:true,
    },
    {
      name:"Eliminar",
      cell:fila=>fila.estado
        ?(
          <button
            className="bg-red-400 px-3 py-1 rounded shadow hover:bg-red-500 text-white transition-colors duration-150"
            onClick={()=>alternarEstado(fila)}
            style={{minWidth:110}}
          >
            Deshabilitar
          </button>
        )
        :(
          <button
            className="bg-gray-300 px-3 py-1 rounded shadow text-gray-400 cursor-not-allowed"
            disabled
            style={{minWidth:110}}
          >
            Deshabilitado
          </button>
        ),
      style:{minWidth:120,maxWidth:140,textAlign:'center'},
      ignoreRowClick:true,
      button:true,
    },
  ];

  return(
    <PlantillaBase
      componente={
        <main className="flex flex-col h-full w-full p-4">
          <h1 className="text-3xl font-bold mb-4 text-center">Gestión Usuarios</h1>

          {mensaje&&(
            <div
              className={clsx("p-3 mb-4 rounded text-white text-center font-semibold",{
                "bg-green-600":mensaje.tipo==="exito",
                "bg-red-600":mensaje.tipo==="error",
              })}
            >
              {mensaje.texto}
            </div>
          )}

          {modo==="lista"&&(
            <>
              <div className="flex justify-between mb-3">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={abrirCrear}
                >
                  Crear Usuario
                </button>
                <input
                  type="text"
                  placeholder="Buscar por usuario o nombre"
                  value={filtro}
                  onChange={e=>setFiltro(e.target.value)}
                  className="border rounded px-2 py-1 w-72"
                  autoFocus
                />
              </div>

              <div className="flex-grow">
                {usuariosFiltrados.length===0
                  ?(
                    <p className="text-center mt-10 font-semibold text-gray-500">
                      No se encontraron usuarios
                    </p>
                  )
                  :(
                    <DataTable
                      columns={columnas}
                      data={usuariosFiltrados}
                      pagination
                      highlightOnHover
                      striped
                      fixedHeader
                      fixedHeaderScrollHeight="calc(100vh - 180px)"
                    />
                  )
                }
              </div>
            </>
          )}

          {(modo==="crear"||modo==="actualizar")&&(
            <form
              onSubmit={handleSubmit(modo==="crear"?enviarCrear:enviarActualizar)}
              className="w-full max-w-2xl mx-auto p-8 flex flex-col gap-4"
              noValidate
            >
              <h2 className="text-2xl font-semibold mb-3">
                {modo==="crear"?"Crear Usuario":"Actualizar Usuario"}
              </h2>

              <label className="font-medium">Nombre Completo</label>
              <input
                {...register("nombreCompleto")}
                className={clsx("border rounded px-3 py-2",{"border-red-600 bg-red-50":errors.nombreCompleto})}
                type="text"
                autoFocus
              />
              {errors.nombreCompleto&&<p className="text-red-600 text-sm">{errors.nombreCompleto.message}</p>}

              <label className="font-medium">Usuario</label>
              <input
                {...register("usuario")}
                className={clsx("border rounded px-3 py-2",{"border-red-600 bg-red-50":errors.usuario})}
                type="text"
                //disabled={modo==="actualizar"}
              />
              {errors.usuario&&<p className="text-red-600 text-sm">{errors.usuario.message}</p>}

              <label className="font-medium">Contraseña</label>
              <CampoContrasenaValidado
                registrar={register}
                nombre="contrasenia"
                marcador={modo==="actualizar"?"Dejar vacío para no cambiar":""}
                error={errors.contrasenia}
                modo={modo}
                setError={setError}
                clearErrors={clearErrors}
              />

              {modo==="crear"&&(
                <>
                  <label className="font-medium">Rol</label>
                  <select
                    {...register("rol")}
                    className={clsx("border rounded px-3 py-2",{"border-red-600 bg-red-50":errors.rol})}
                  >
                    <option value="">Seleccione...</option>
                    <option value="administrador">Administrador</option>
                    <option value="vendedor">Vendedor</option>
                  </select>
                  {errors.rol&&<p className="text-red-600 text-sm">{errors.rol.message}</p>}
                </>
              )}

              {modo==="actualizar"&&(
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    {...register("estado")}
                    id="estado"
                    className="w-4 h-4"
                  />
                  <label htmlFor="estado" className="select-none">Activo</label>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={()=>setModo("lista")}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  {modo==="crear"?"Guardar":"Actualizar"}
                </button>
              </div>
            </form>
          )}

          {modo==="ver"&&usuarioSeleccionado&&(
            <section
              className="w-full max-w-2xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200"
              style={{marginTop:24}}
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Resumen de Usuario</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Nombre Completo</p>
                  <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">
                    {usuarioSeleccionado.nombreCompleto}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Usuario</p>
                  <div className="text-lg font-semibold text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200">
                    {usuarioSeleccionado.usuario}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Rol</p>
                  <div
                    className={clsx(
                      "text-lg font-semibold rounded px-3 py-2 border border-gray-200",
                      usuarioSeleccionado.rol==="administrador"
                        ?"bg-blue-100 text-blue-800"
                        :"bg-green-100 text-green-800"
                    )}
                  >
                    {usuarioSeleccionado.rol}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Estado</p>
                  <div
                    className={clsx(
                      "text-lg font-semibold rounded px-3 py-2 border border-gray-200",
                      usuarioSeleccionado.estado
                        ?"bg-green-50 text-green-700"
                        :"bg-red-50 text-red-700"
                    )}
                  >
                    {usuarioSeleccionado.estado?"Activo":"Deshabilitado"}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={()=>setModo("lista")}
                  className="bg-gray-500 text-white px-5 py-2 rounded shadow hover:bg-gray-600 transition-colors duration-150"
                >
                  Volver
                </button>
              </div>
            </section>
          )}
        </main>
      }
    />
  );
}
