
import api from '@/lib/axios';

const rutaReportes = '/reportes/';


// Reporte genérico: tipo = 'ventas' | 'ventasSemana' | 'mayorDia' | 'productoDia', fecha puede ser día o semana
export async function obtenerReporteServicio(datosReporte) {
    console.log('Obteniendo reporte con datos:', datosReporte);
  try {
    const { data } = await api.post(rutaReportes, datosReporte);
    return data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
}
