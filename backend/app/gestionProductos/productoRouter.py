from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import obtenerSesion
from .producto import Producto
from .categoria import Categoria
from .esquemasProducto import *
from .crud import obtenerProductoPorIdBD
router = APIRouter()

@router.get("/", response_model=RespuestaGenerica)
def listarProductos(db: Session=Depends(obtenerSesion)):
    instanciaProducto=Producto()
    respuesta=instanciaProducto.listarProductos(db)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=RespuestaGenerica)
def crearProducto(datosProducto: ProductoCrearSchema, db: Session=Depends(obtenerSesion)):
    respuesta=Producto().agregarProducto(
        db, 
        datosProducto.nombre, 
        datosProducto.descripcion, 
        datosProducto.categoria, 
        datosProducto.precio, 
        datosProducto.stock, 
        datosProducto.tieneIva
    )
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=respuesta.mensaje)
    return respuesta
@router.get("/{nombre}", response_model=RespuestaGenerica)
def consultarProducto(nombre: str, db: Session=Depends(obtenerSesion)):
    print(f"Consultando producto: {nombre}")
    respuesta=Producto().consultarProducto(db, nombre)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.get("/id/{idProducto}", response_model=RespuestaGenerica)
def consultarProductoPorId(idProducto: int, db: Session=Depends(obtenerSesion)):
    respuesta=obtenerProductoPorIdBD(db, idProducto)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.put("/{idProducto}", response_model=RespuestaGenerica)
def actualizarProducto(idProducto: int, datosProducto: ProductoActualizarSchema, db: Session=Depends(obtenerSesion)):
    respuesta=Producto().seleccionarProductoActualizar(
        db, 
        idProducto, 
        nombre=datosProducto.nombre,
        descripcion=datosProducto.descripcion,
        categoria=datosProducto.categoria,
        precio=datosProducto.precio,
        stock=datosProducto.stock,
        tieneIva=datosProducto.tieneIva,
        estado=datosProducto.estado
    )
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta    

@router.delete("/{idProducto}", response_model=RespuestaGenerica)
def eliminarProducto(idProducto: int, db: Session=Depends(obtenerSesion)):
    respuesta=Producto().seleccionarProductoEliminar(db, idProducto)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.post("/validarDisponibilidad", response_model=RespuestaGenerica)
def validarDisponibilidad(datos: ValidacionDisponibilidadSchema, db: Session=Depends(obtenerSesion)):
    respuesta=Producto().validarDisponibilidad(db, datos.idProducto, datos.cantidad)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado o cantidad insuficiente")
    return respuesta

@router.put("/actualizarStock", response_model=RespuestaGenerica)
def actualizarStock(datos: ActualizacionStockSchema, db: Session=Depends(obtenerSesion)):
    respuesta=Producto().actualizarStock(db, datos.idProducto, datos.cantidad, datos.operacion)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta



routerCategoria = APIRouter()
@routerCategoria.post("/", status_code=status.HTTP_201_CREATED, response_model=RespuestaGenerica)
def crearCategoria(datosCategoria: CategoriaCrearSchema, db: Session=Depends(obtenerSesion)):
    nuevaCategoria = Categoria().crearCategoria(db, datosCategoria.nombreCategoria)
    if not nuevaCategoria.estado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=nuevaCategoria.mensaje)
    return nuevaCategoria

@routerCategoria.get("/", response_model=RespuestaGenerica)
def listarCategorias(db: Session=Depends(obtenerSesion)):
    categorias = Categoria().listarCategorias(db)
    if not categorias.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=categorias.mensaje)
    return categorias

