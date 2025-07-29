from sqlalchemy.orm import Session
# Importaciones internas
from .crud import *
from .esquemasProducto import *
class Producto:
    def __init__(self, idProducto=None, nombre=None, descripcion=None, categoria=None, precio=None, stock=None, tieneIva=None, estado="activo"):
        self.idProducto=idProducto
        self.nombre=nombre
        self.descripcion=descripcion
        self.categoria=categoria
        self.precio=precio
        self.stock=stock
        self.tieneIva=tieneIva
        self.estado=estado
    
    def listarProductos(self, db):
        respuesta=listarProductosBD(db)
        return respuesta
    
    def agregarProducto(self, db: Session,nombre, descripcion, categoria, precio, stock, tieneIva):
        if self.validarCamposProducto(nombre, descripcion, categoria, precio, stock, tieneIva):
            return RespuestaGenerica(estado=False, mensaje="Campos inválidos",datos=None)
        resultado=crearProductoBD(db, ProductoCrearSchema(
            nombre=nombre,
            descripcion=descripcion,
            categoria=categoria,
            precio=precio,
            stock=stock,
            tieneIva=tieneIva
        ))
        return resultado
    
    def validarCamposProducto(self, nombre, descripcion, categoria, precio, stock, tieneIva):
        if not nombre or not categoria or precio is None or stock is None:
            return True
        if precio < 0 or stock < 0:
            return True
        return False
    
    def consultarProducto(self, db: Session, nombre):
        respuesta=obtenerProductoPorNombreBD(db, nombre)
        if not respuesta.estado:
            return RespuestaGenerica(estado=False, mensaje="Producto no encontrado", datos=None)
        return respuesta
    
    def seleccionarProductoActualizar(self, db: Session, idProducto,
                                      nombre=None, descripcion=None, categoria=None, precio=None, stock=None, tieneIva=None,estado=None):
        resultado=actualizarProductoBD(db, idProducto,ProductoActualizarSchema(
            nombre=nombre,
            descripcion=descripcion,
            categoria=categoria,
            precio=precio,
            stock=stock,
            tieneIva=tieneIva,
            estado=estado
        ))
        return resultado
    
    def seleccionarProductoEliminar(self, db: Session, idProducto):
        resultado=deshabilitarProductoBD(db, idProducto)
        return resultado
    
    def validarDisponibilidad(self, db: Session, idProducto,cantidad):
        producto=obtenerProductoPorIdBD(db, idProducto)
        if not producto.estado:
            return RespuestaGenerica(estado=False, mensaje="Producto no encontrado", datos=None)
        if producto.datos.stock < cantidad:
            return RespuestaGenerica(estado=False, mensaje=f"Prodcuto { producto.datos.nombre} no tiene stock suficiente", datos=None)
        return RespuestaGenerica(estado=True, mensaje=f"Prodcuto { producto.datos.nombre} tiene stock disponible", datos=producto.datos)
    
    def actualizarStock(self, db: Session, idProducto, cantidad,operacion):
        producto=actualizarStockBD(db, idProducto, operacion, cantidad)
        return producto
