import api from '@/lib/axios'
const rutaUsuarios='/usuarios/'

export async function listarUsuariosServicio() {
  try {
    const { data } = await api.get(rutaUsuarios)
    console.log('Respuesta del servicio listarUsuarios:', data)
    return data
  } catch (error) {
    
    throw error

  }
}

export async function crearUsuarioServicio(datosUsuario) {
  try {
    const { data } = await api.post(rutaUsuarios, datosUsuario)
    console.log('Respuesta del servicio crearUsuario:', data)
    return data
  } catch (error) {
    console.error('Error al listar usuarios:', error.response)
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export async function actualizarUsuarioServicio(id, datosUsuario) {
  try {
    console.log('Actualizando usuario con ID:', id)
    console.log('Datos a actualizar:', datosUsuario)
    const { data } = await api.put(`${rutaUsuarios}${id}/`, datosUsuario)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export async function deshabilitarUsuarioServicio(id) {
  try {
    const { data } = await api.delete(`${rutaUsuarios}${id}/`)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export async function buscarUsuarioServicio(id) {
  try {
    const { data } = await api.get(`${rutaUsuarios}${id}/`)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}
export async function buscarUsuarioPorNombreServicio(nombre) {
  try {
    const { data } = await api.get(`${rutaUsuarios}porNombre/${nombre}/`)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export async function actualizarAdministradorProductosServicio(id, numeroProductosCreados) {
  try {
    const { data } = await api.put(`${rutaUsuarios}adminProdCreados/${id}`, { numeroProductosCreados: numeroProductosCreados })
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

export async function actualizarVendedorVentasServicio(id, numeroVentasRealizadas) {
  console.log(numeroVentasRealizadas)
  try {
    const { data } = await api.put(`${rutaUsuarios}vendedorVentasRealizadas/${id}/`, numeroVentasRealizadas)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}