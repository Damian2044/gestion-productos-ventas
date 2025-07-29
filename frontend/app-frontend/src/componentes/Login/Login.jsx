import { useForm } from 'react-hook-form'
import { iniciarSesionServicio } from '@/servicios/servicioLogin'
import { useNavigate } from 'react-router-dom'
import { useEffect,useState } from 'react'
import CampoContrasena from '@/componentes/Login/CampoContrasena.jsx'
import '@/estilos/login.css'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()//Componentes de react-hook-form para manejar formularios
  //register: para registrar los campos del formulario
  //handleSubmit: para manejar el envío del formulario
  //formState: para manejar el estado del formulario, incluyendo errores
  const navigate=useNavigate()
  const [mensaje,setMensaje]=useState(null)
  const limpiarMensaje=()=>{if(mensaje)setMensaje(null)}
  useEffect(() => {
    sessionStorage.clear()
  }, [])
  const iniciarSesion=async(datos)=>{//Función para manejar el inicio de sesión, que recibe los datos del formulario
    console.log(datos)
    try{
      const respuesta=await iniciarSesionServicio(datos)
      sessionStorage.setItem('logeado','true')
      sessionStorage.setItem('usuario',respuesta.usuario)
      sessionStorage.setItem('rol',respuesta.rol)
      sessionStorage.setItem('datosUsuario',JSON.stringify(respuesta.datos))
      console.log(JSON.stringify(respuesta.datos))
      if(!respuesta.rutas){
        respuesta.rutas=[sessionStorage.getItem('rol') === 'administrador' ? '/inicio-admin' : '/inicio-vendedor']
        console.log('No se recibieron rutas, usando ruta por defecto:', respuesta.rutas)
      } 
      sessionStorage.setItem('rutas',JSON.stringify(respuesta.rutas))
    
      setMensaje({tipo:'exito',texto:'¡Inicio de sesión exitoso!'})
      setTimeout(()=>navigate(respuesta.rol==='administrador'?'/inicio-admin':'/inicio-vendedor'),1000)
    }catch(error){
      setMensaje({tipo:'error',texto:error.response?.data?.detail || 'Usuario o contraseña incorrectos'})
    }
  }
  return(
    <div className="contenedorLogin">
      <h1 className="tituloLogin">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit(iniciarSesion)} className="formularioLogin">
        <div>
          <input
            type="text"
            placeholder="Usuario"
            {...register('usuario',{required:'El usuario es obligatorio',onChange:limpiarMensaje})}
            className="entrada"
          />
          {errors.usuario&&<p className="errorValidacion">{errors.usuario.message}</p>}
        </div>
        <CampoContrasena
          registrar={(nombre)=>register(nombre,{required:'La contraseña es obligatoria',onChange:limpiarMensaje})}
          nombre="contrasenia"
          marcador="Contraseña"
          error={errors.contrasenia}
        />
        <button type="submit" className="botonLogin">Iniciar sesión</button>
      </form>
      {mensaje&&(
        <div className={`mensaje ${mensaje.tipo==='error'?'mensajeError':'mensajeExito'}`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  )
}
