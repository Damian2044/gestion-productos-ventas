from sqlalchemy.orm import Session
from .crud import *
class Reporte:
    def __init__(self,tipo=None,filtro=None):
        self.tipo=tipo
        self.filtro=filtro

    def seleccionarReporte(self,tipo):
        if tipo not in ["ventasTotales","ventasEnUnDia","ventasEnSemanaSeleccionada","productoMasVendidoEnDia"]:
            return False
        return True

    def obtenerReporte(self,db,filtro):
        self.respuesta=None
        if self.tipo == "ventasTotales":
            self.respuesta=obtenerReporteVentas(db,self.tipo,filtro)
        elif self.tipo == "ventasEnUnDia":
            self.respuesta=obtenerReporteVentas(db,self.tipo,filtro)
        elif self.tipo == "ventasEnSemanaSeleccionada":
            self.respuesta=obtenerReporteVentas(db,self.tipo,filtro)
        elif self.tipo == "productoMasVendidoEnDia":
            self.respuesta=obtenerReporteVentas(db,self.tipo,filtro)
        if self.validarDisponibilidad():
            return self.respuesta
        return RespuestaGenerica(estado=False, mensaje="Reporte no disponible", datos=None)
        
        


    def validarDisponibilidad(self):
        if self.respuesta.estado:
            return True
        return False
        
