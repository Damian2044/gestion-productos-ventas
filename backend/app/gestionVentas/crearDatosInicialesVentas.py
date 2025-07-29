import random
import datetime
from sqlalchemy.orm import Session
from app.gestionVentas.venta import Venta
from app.gestionProductos.modelosProductos import ProductoOrm
from app.gestionVentas.modelosVentas import VentaOrm

def crearVentasPorDefecto(db:Session, idResponsable:int=1):
    hoy=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-5)))
    diaInicio=hoy.replace(day=21,hour=10,minute=0,second=0,microsecond=0)
    if diaInicio>hoy:
        mes=(hoy.month-1) if hoy.month>1 else 12
        año=hoy.year if hoy.month>1 else hoy.year-1
        diaInicio=diaInicio.replace(year=año,month=mes)
    diaFin = hoy

    #VERIFICACIÓN: ya existen ventas en ese rango
    ventasExistentes = db.query(VentaOrm).filter(
        VentaOrm.fecha >= diaInicio,
        VentaOrm.fecha <= diaFin
    ).first()

    if ventasExistentes:
        print("Ya existen ventas en el rango definido. No se crearán duplicados.")
        return
    productosActivos=db.query(ProductoOrm).filter(ProductoOrm.estado=="activo").all()
    if not productosActivos:
        print("No hay productos activos para crear ventas")
        return

    for _ in range(10):
        ventaActual=Venta(idResponsableVenta=idResponsable)
        cantidadProductosVenta=random.randint(1,5)
        productosSeleccionados=random.sample(productosActivos,k=min(cantidadProductosVenta,len(productosActivos)))

        listaDetallesVenta=[]
        for producto in productosSeleccionados:
            cantidad=random.randint(1,5)
            listaDetallesVenta.append({
                "idProducto":producto.idProducto,
                "cantidadVenta":cantidad,
                "precioUnitarioVenta":producto.precio,
                "tieneIva":producto.tieneIva
            })

        diferenciaSegundos=int((hoy-diaInicio).total_seconds())
        segundosAleatorios=random.randint(0,diferenciaSegundos)
        fechaAleatoria=diaInicio+datetime.timedelta(seconds=segundosAleatorios)

        from app.gestionVentas.esquemasVentas import VentaFinalizarSchema,DetalleVentaSchema
        detallesSchema=[DetalleVentaSchema(**detalle) for detalle in listaDetallesVenta]
        datosVentaFinalizar=VentaFinalizarSchema(
            idResponsableVenta=idResponsable,
            descuentoPorcentaje=random.choice([0,5,10]),
            detalleProductos=detallesSchema
        )

        ventaActual.finalizarSeleccion(db,datosVentaFinalizar)
        ventaActual.fecha=fechaAleatoria
        ventaActual.confirmarVenta(db)

        ventaOrm=db.query(VentaOrm).order_by(VentaOrm.idVenta.desc()).first()
        if ventaOrm:
            ventaOrm.fecha=fechaAleatoria
            db.commit()

       # print(f"Venta creada con fecha {fechaAleatoria.strftime('%Y-%m-%d %H:%M:%S')} y {len(listaDetallesVenta)} productos")
