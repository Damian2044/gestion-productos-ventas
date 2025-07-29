import api from '@/lib/axios'

const rutaVentas = '/ventas/'

// Seleccionar producto para venta
export async function seleccionarProductoVentaServicio(datosVenta) {
  try {
    const { data } = await api.post(rutaVentas + 'seleccionar', datosVenta)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

// Finalizar venta
export async function finalizarSeleccionVentaServicio(datosVenta) {
  try {
    const { data } = await api.post(rutaVentas + 'finalizar', datosVenta)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

// Anular venta
export async function anularVentaServicio(idVenta) {
  try {
    const { data } = await api.delete(rutaVentas + 'anular/' + idVenta)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

// Listar ventas
export async function listarVentasServicio() {
  try {
    const { data } = await api.get(rutaVentas)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}

// Obtener venta por ID
export async function obtenerVentaPorIdServicio(idVenta) {
  try {
    const { data } = await api.get(rutaVentas + idVenta)
    return data
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}