from sqlalchemy.orm import Session
from .detalleVenta import DetalleVenta
from app.gestionProductos.producto import Producto
from .esquemasVentas import *
from app.gestionProductos.crud import obtenerProductoPorIdBD
from .crud import *
import datetime

class Venta:
    def __init__(self, idVenta=None, fecha=None, listaDetalleVentas=None,
                 subtotal=None, descuentoPorcentaje=None, valorDescuento=None,
                 valorIva=None, total=None, idResponsableVenta=None, estado=None):
        self.idVenta=idVenta
        self.fecha=fecha
        self.listaDetalleVentas=listaDetalleVentas or []
        self.subtotal=subtotal
        self.descuentoPorcentaje=descuentoPorcentaje
        self.valorDescuento=valorDescuento
        self.valorIva=valorIva
        self.total=total
        self.idResponsableVenta=idResponsableVenta
        self.estado=estado

    def seleccionarProductoVenta(self, db, idProducto, cantidad):
        respuesta=Producto().validarDisponibilidad(db, idProducto, cantidad)
        if not respuesta.estado:
            return respuesta
        return RespuestaGenerica(estado=True, mensaje="Producto seleccionado correctamente",
                                 datos=None)

    def finalizarSeleccion(self, db, datosVenta: VentaFinalizarSchema):
        detalleProductos=datosVenta.detalleProductos
        self.idResponsableVenta=datosVenta.idResponsableVenta
        #for detalle in detalleProductos:
        #    respuesta=self.seleccionarProductoVenta(db, detalle.idProducto, detalle.cantidadVenta)
        #    return respuesta
        #Datos de la venta
        
        self.listaDetalleVentas=[DetalleVenta(**detalle.dict()) for detalle in detalleProductos]
        #Calcular Subtotal
        self.subtotal=self.calcularSubtotal()
        #Calcular Descuento
        self.descuentoPorcentaje=datosVenta.descuentoPorcentaje or 0.0
        self.valorDescuento=self.aplicarDescuento()
        #Calcular IVA
        self.valorSubtotalDescuento=self.subtotal-self.valorDescuento
        self.valorIva=self.calcularIva(db)
        #Calcular Total
        self.total=self.valorSubtotalDescuento+self.valorIva
        return self.confirmarVenta(db)

    def calcularSubtotal(self):
        return sum(d.cantidadVenta*d.precioUnitarioVenta for d in self.listaDetalleVentas)

    def aplicarDescuento(self):
        return (self.subtotal * self.descuentoPorcentaje / 100) if self.descuentoPorcentaje else 0

    def calcularIva(self, db):
        iva=0.15
        valorIvaTotal=0
        for detalle in self.listaDetalleVentas:
            producto=obtenerProductoPorIdBD(db, detalle.idProducto)
            producto=producto.datos
            if producto and producto.tieneIva:
                base=detalle.cantidadVenta*detalle.precioUnitarioVenta
                baseDescuento=base-(base*self.descuentoPorcentaje / 100)
                valorIvaTotal+=baseDescuento*iva
        return valorIvaTotal

    def confirmarVenta(self, db):
        quitoTZ=datetime.timezone(datetime.timedelta(hours=-5))
        self.fecha=datetime.datetime.now(quitoTZ)

        ventasGuardar=VentaConfirmarSchema(
            fecha=self.fecha,
            listaDetalleVentas=[DetalleVentaSchema(
                idProducto=detalle.idProducto,
                cantidadVenta=detalle.cantidadVenta,
                precioUnitarioVenta=detalle.precioUnitarioVenta,
                tieneIva=detalle.tieneIva
            ) for detalle in self.listaDetalleVentas],
            subtotal=self.subtotal,
            descuentoPorcentaje=self.descuentoPorcentaje,
            valorDescuento=self.valorDescuento,
            valorIva=self.valorIva,
            total=self.total,
            idResponsableVenta=self.idResponsableVenta,
            estado="Confirmada"
        )

        ventasRespuesta=guardarVentasBD(db, ventasGuardar)
        for detalle in self.listaDetalleVentas:
            Producto().actualizarStock(db, detalle.idProducto, detalle.cantidadVenta, "restar")

        return ventasRespuesta

    def anularVenta(self, db: Session, idVenta):
        resultado=anularVentaBD(db, idVenta)
        if not resultado.estado:
            return resultado
        for detalle in resultado.datos.detalles:
            Producto().actualizarStock(db, detalle.idProducto, detalle.cantidadVenta, "sumar")
        return resultado


    def obtenerDatosVentas(self, db: Session):
        resultado=listarVentasBD(db)
        return resultado
    
    def obtenerVenta(self, db: Session, idVenta: int):
        resultado=obtenerVentasIDBD(db, idVenta)
        return resultado
    