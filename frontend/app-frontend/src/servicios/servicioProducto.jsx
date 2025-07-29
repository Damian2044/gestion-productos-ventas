import api from '@/lib/axios'

const rutaProductos = '/productos/'
const rutaCategorias = '/categorias/'

// PRODUCTOS
export async function listarProductosServicio() {
  try {
    const { data } = await api.get(rutaProductos)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function crearProductoServicio(datosProducto) {
  try {
    const { data } = await api.post(rutaProductos, datosProducto)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function consultarProductoServicio(nombre) {
  try {
    const { data } = await api.get(`${rutaProductos}${nombre}`)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function actualizarProductoServicio(idProducto, datosProducto) {
  try {
    const { data } = await api.put(`${rutaProductos}${idProducto}`, datosProducto)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function eliminarProductoServicio(idProducto) {
  try {
    const { data } = await api.delete(`${rutaProductos}${idProducto}`)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function validarDisponibilidadServicio(idProducto, cantidad) {
  try {
    const { data } = await api.post(`${rutaProductos}validarDisponibilidad`, { idProducto, cantidad })
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function actualizarStockServicio(idProducto, cantidad, operacion) {
  try {
    const { data } = await api.put(`${rutaProductos}actualizarStock`, { idProducto, cantidad, operacion })
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function obtenerProductoPorIdServicio(idProducto) {
  try {
    const { data } = await api.get(`${rutaProductos}id/${idProducto}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}

// CATEGORIAS
export async function listarCategoriasServicio() {
  try {
    const { data } = await api.get(rutaCategorias)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

export async function crearCategoriaServicio(datosCategoria) {
  try {
    const { data } = await api.post(rutaCategorias, datosCategoria)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}