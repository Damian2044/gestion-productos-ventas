import api from '@/lib/axios'

const rutaLogin='/usuarios/login/'
export async function iniciarSesionServicio(datosUsuario) {
  try {
    const{ data }=await api.post(rutaLogin, datosUsuario)
    return data
  } catch(error){
    throw error
  }
}
