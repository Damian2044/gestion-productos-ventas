from sqlalchemy.orm import Session, joinedload
from app.gestionVentas.modelosVentas import VentaOrm, DetalleVentaOrm
from app.gestionVentas.esquemasVentas import *

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import timedelta

def obtenerReporteVentas(db:Session,tipoReporte:str,filtro:'date')->RespuestaGenerica:
    consultaVentas=db.query(VentaOrm).join(VentaOrm.detalles).filter(VentaOrm.estado == "Confirmada")
    def filtrarPorFecha(consulta,fechaInicio,fechaFin):
        return consulta.filter(VentaOrm.fecha>=fechaInicio,VentaOrm.fecha<fechaFin)
    try:
        if tipoReporte=="ventasTotales":
            ventas=consultaVentas.all()
            sumaTotal=sum(v.total for v in ventas)
            datos={"ventas":[VentaRespuestaSchema.from_orm(v) for v in ventas],"sumaTotal":sumaTotal}
            return RespuestaGenerica(estado=True,mensaje="Ventas totales obtenidas",datos=datos)
        elif tipoReporte=="ventasEnUnDia":
            fechaInicio=filtro
            fechaFin=filtro+timedelta(days=1)
            ventas=filtrarPorFecha(consultaVentas,fechaInicio,fechaFin).all()
            sumaTotal=sum(v.total for v in ventas)
            datos={"ventas":[VentaRespuestaSchema.from_orm(v) for v in ventas],"sumaTotal":sumaTotal}
            return RespuestaGenerica(estado=True,mensaje=f"Ventas del día {fechaInicio} obtenidas",datos=datos)
        elif tipoReporte=="ventasEnSemanaSeleccionada":
            diaSemana=filtro.weekday()
            inicioSemana=filtro - timedelta(days=diaSemana)
            finSemana=inicioSemana + timedelta(days=7)
            ventasSemana=filtrarPorFecha(consultaVentas,inicioSemana,finSemana).all()
            resumenPorDia=[]
            for i in range(7):
                diaActual=inicioSemana + timedelta(days=i)
                sumaDia=sum(v.total for v in ventasSemana if v.fecha.date()==diaActual)
                resumenPorDia.append({"dia":diaActual.strftime("%A"),"fecha":diaActual.isoformat(),"total":sumaDia})
            datos={"resumenSemana":resumenPorDia,"ventasSemana":[VentaRespuestaSchema.from_orm(v) for v in ventasSemana]}
            return RespuestaGenerica(estado=True,mensaje="Ventas de la semana obtenidas",datos=datos)
        elif tipoReporte=="productoMasVendidoEnDia":
            fechaInicio=filtro
            fechaFin=filtro+timedelta(days=1)
            resultados=(db.query(DetalleVentaOrm.idProducto,func.sum(DetalleVentaOrm.cantidadVenta).label("totalVendido"))
                .join(DetalleVentaOrm.venta)
                .filter(VentaOrm.fecha>=fechaInicio,VentaOrm.fecha<fechaFin)
                .group_by(DetalleVentaOrm.idProducto)
                .order_by(desc("totalVendido"))
                .all())
            ranking=[{"idProducto":r.idProducto,"totalVendido":r.totalVendido} for r in resultados]
            datos={"rankingProductos":ranking}
            return RespuestaGenerica(estado=True,mensaje=f"Ranking productos vendidos el día {fechaInicio}",datos=datos)
        else:
            return RespuestaGenerica(estado=False,mensaje="Tipo de reporte no reconocido",datos=None)
    except Exception as e:
        return RespuestaGenerica(estado=False,mensaje=f"Error al obtener reporte: {str(e)}",datos=None)

