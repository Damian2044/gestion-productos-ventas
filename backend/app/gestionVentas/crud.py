from sqlalchemy.orm import Session, joinedload
from app.gestionVentas.modelosVentas import VentaOrm, DetalleVentaOrm
from .esquemasVentas import *

def guardarVentasBD(db: Session, ventaCrear: VentaConfirmarSchema):
    ventaOrm=VentaOrm(
        fecha=ventaCrear.fecha or datetime.datetime.utcnow(),
        subtotal=ventaCrear.subtotal,
        descuentoPorcentaje=ventaCrear.descuentoPorcentaje,
        valorDescuento=ventaCrear.valorDescuento,
        valorIva=ventaCrear.valorIva,
        total=ventaCrear.total,
        idResponsableVenta=ventaCrear.idResponsableVenta,
        estado=ventaCrear.estado
    )

    ventaOrm.detalles=[
        DetalleVentaOrm(
            idProducto=detalle.idProducto,
            cantidadVenta=detalle.cantidadVenta,
            precioUnitarioVenta=detalle.precioUnitarioVenta,
            tieneIva=detalle.tieneIva
        ) for detalle in ventaCrear.listaDetalleVentas
    ]

    db.add(ventaOrm)
    db.commit()
    db.refresh(ventaOrm)

    return RespuestaGenerica(
        estado=True,
        mensaje="Venta guardada correctamente",
        datos=VentaRespuestaSchema.from_orm(ventaOrm)
    )


def obtenerVentasIDBD(db: Session, idVenta: int):
    venta=db.query(VentaOrm).options(
        joinedload(VentaOrm.detalles)
    ).filter(VentaOrm.idVenta==idVenta).first()

    if not venta:
        return RespuestaGenerica(
            estado=False,
            mensaje="Venta no encontrada",
            datos=None
        )

    return RespuestaGenerica(
        estado=True,
        mensaje="Venta encontrada",
        datos=VentaRespuestaSchema.from_orm(venta)
    )

def anularVentaBD(db: Session, idVenta: int):
    venta=obtenerVentasIDBD(db, idVenta)
    print(venta)
    if not venta.estado:
        return venta
    ventaOrm=db.query(VentaOrm).options(
        joinedload(VentaOrm.detalles)
    ).filter(VentaOrm.idVenta == idVenta).first()
    ventaOrm.estado="Anulada"
    db.add(ventaOrm)
    db.commit()
    db.refresh(ventaOrm)

    return RespuestaGenerica(
        estado=True,
        mensaje="Venta anulada correctamente",
        datos=VentaRespuestaSchema.from_orm(ventaOrm)
    )

def listarVentasBD(db: Session):
    ventas= db.query(VentaOrm).options(
        joinedload(VentaOrm.detalles)
    ).all()

    if not ventas:
        return RespuestaGenerica(
            estado=False,
            mensaje="No se encontraron ventas",
            datos=None
        )

    return RespuestaGenerica(
        estado=True,
        mensaje="Lista de ventas obtenida correctamente",
        datos=[VentaRespuestaSchema.from_orm(venta) for venta in ventas]
    )

