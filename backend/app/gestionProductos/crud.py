from sqlalchemy.orm import Session, joinedload
from .modelosProductos import ProductoOrm, CategoriaOrm
from .esquemasProducto import *

def listarProductosBD(db: Session):
    productos = db.query(ProductoOrm).options(
        joinedload(ProductoOrm.categoriaRel)
    ).all()
    if not productos:
        return RespuestaGenerica(
            estado=False,
            mensaje="No se encontraron productos",
            datos=None
        )
    return RespuestaGenerica(
        estado=True,
        mensaje="Lista de productos obtenida correctamente",
        datos=[ProductoRespuesta.from_orm(producto) for producto in db.query(ProductoOrm).all()]
    )

def obtenerProductoPorNombreBD(db: Session, nombre: str):
    producto=db.query(ProductoOrm).options(joinedload(ProductoOrm.categoriaRel)).filter(ProductoOrm.nombre == nombre).first()
    if not producto:
        return RespuestaGenerica(
            estado=False,
            mensaje="Producto no encontrado",
            datos=None
        )
    return RespuestaGenerica(
        estado=True,
        mensaje="Producto encontrado",
        datos=ProductoRespuesta.from_orm(producto)
    )
def obtenerProductoPorIdBD(db: Session, idProducto: int):
    producto=db.query(ProductoOrm).options(
        joinedload(ProductoOrm.categoriaRel)
    ).filter(ProductoOrm.idProducto == idProducto).first()
    if not producto:
        return RespuestaGenerica(
            estado=False,
            mensaje="Producto no encontrado",
            datos=None
        )
    return RespuestaGenerica(
        estado=True,
        mensaje="Producto encontrado",
        datos=ProductoRespuesta.from_orm(producto)
    )

def crearProductoBD(db: Session, productoCrear: ProductoCrearSchema):
    consultaProducto = obtenerProductoPorNombreBD(db, productoCrear.nombre)
    if consultaProducto.estado:
        return RespuestaGenerica(
            estado=False,
            mensaje="El producto ya existe",
            datos=None
        )
    nuevoProducto = ProductoOrm(**productoCrear.dict())
    db.add(nuevoProducto)
    db.commit()
    db.refresh(nuevoProducto)
    return RespuestaGenerica(
        estado=True,
        mensaje="Producto creado exitosamente",
        datos=ProductoRespuesta.from_orm(nuevoProducto)
    )

def actualizarProductoBD(db: Session, idProducto: int, productoActualizar: ProductoActualizarSchema):
    productoActual=obtenerProductoPorIdBD(db, idProducto)
    if not productoActual.estado:
        return RespuestaGenerica(
            estado=False,
            mensaje="Producto no encontrado",
            datos=None
        )
    else:
        productoOrm = db.query(ProductoOrm).filter(ProductoOrm.idProducto == idProducto).first()
        if productoOrm and productoOrm.idProducto!= idProducto:
            return RespuestaGenerica(
                estado=False,
                mensaje="El nombre del producto ya existe",
                datos=None
            )
    for campo, valor in productoActualizar.dict().items():
        setattr(productoOrm, campo, valor)
    db.commit()
    db.refresh(productoOrm)
    return RespuestaGenerica(
        estado=True,
        mensaje="Producto actualizado exitosamente",
        datos=ProductoRespuesta.from_orm(productoOrm)
    )   

def deshabilitarProductoBD(db: Session, idProducto: int):
    productoActual = obtenerProductoPorIdBD(db, idProducto)
    if not productoActual.estado:
        return RespuestaGenerica(
            estado=False,
            mensaje="Producto no encontrado",
            datos=None
        )
    productoOrm = db.query(ProductoOrm).filter(ProductoOrm.idProducto == idProducto).first()
    if productoOrm:
        productoOrm.estado="deshabilitado"
        db.commit()
        db.refresh(productoOrm)
    return RespuestaGenerica(
        estado=True,
        mensaje="Producto deshabilitado exitosamente",
        datos=ProductoRespuesta.from_orm(productoOrm)
    )

def actualizarStockBD(db: Session, idProducto: int, operacion: str, cantidad: int):
    producto=db.query(ProductoOrm).filter(ProductoOrm.idProducto == idProducto).first()
    if not producto:
        return RespuestaGenerica(
            estado=False,
            mensaje="Producto no encontrado",
            datos=None
        )
    if operacion == "sumar":
        producto.stock += cantidad
    elif operacion == "restar":
        if producto.stock < cantidad:
            return RespuestaGenerica(
                estado=False,
                mensaje="Stock insuficiente",
                datos=None
            )
        producto.stock-=cantidad
    db.commit()
    db.refresh(producto)
    return RespuestaGenerica(
        estado=True,
        mensaje="Stock actualizado exitosamente",
        datos=ProductoRespuesta.from_orm(producto)
    )


#--Categorías
def obtenerCategoriaPorNombreBD(db: Session, nombreCategoria: str):
    categoria = db.query(CategoriaOrm).filter(CategoriaOrm.nombreCategoria == nombreCategoria).first()
    if not categoria:
        return RespuestaGenerica(
            estado=False,
            mensaje="Categoría no encontrada",
            datos=None
        )
    return RespuestaGenerica(
        estado=True,
        mensaje="Categoría encontrada",
        datos=CategoriaRespuesta.from_orm(categoria)
    )

def crearCategoriaBD(db: Session, categoriaCrear: CategoriaCrearSchema):
    consultaCategoria = obtenerCategoriaPorNombreBD(db, categoriaCrear.nombreCategoria)
    if consultaCategoria.estado:
        return RespuestaGenerica(
            estado=False,
            mensaje="La categoría ya existe",
            datos=None
        )
    nuevaCategoria = CategoriaOrm(**categoriaCrear.dict())
    db.add(nuevaCategoria)
    db.commit()
    db.refresh(nuevaCategoria)
    return RespuestaGenerica(
        estado=True,
        mensaje="Categoría creada exitosamente",
        datos=CategoriaRespuesta.from_orm(nuevaCategoria)
    )

def listarCategoriasBD(db: Session):
    categorias = db.query(CategoriaOrm).all()
    if not categorias:
        return RespuestaGenerica(
            estado=False,
            mensaje="No se encontraron categorías",
            datos=None
        )
    return RespuestaGenerica(
        estado=True,
        mensaje="Lista de categorías obtenida correctamente",
        datos=[CategoriaRespuesta.from_orm(categoria) for categoria in categorias]
    )
