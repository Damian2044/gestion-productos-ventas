from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import obtenerSesion
from .venta import Venta
#from app.gestionProductos.esquemasProducto import *
from .esquemasVentas import *

router = APIRouter()

@router.post("/seleccionar",status_code=status.HTTP_201_CREATED, response_model=RespuestaGenerica)
def seleccionarProductoVenta(datosVenta: DetalleSeleccionProductos, db: Session = Depends(obtenerSesion)):
    venta=Venta()
    respuesta = venta.seleccionarProductoVenta(db, datosVenta.idProducto, datosVenta.cantidad)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=respuesta.mensaje)
    return  respuesta

@router.post("/finalizar", status_code=status.HTTP_201_CREATED, response_model=RespuestaGenerica)
def finalizarSeleccionVenta(datosVenta: VentaFinalizarSchema, db: Session = Depends(obtenerSesion)):    
    respuesta=Venta().finalizarSeleccion(db, datosVenta)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=respuesta.mensaje)
    return respuesta

@router.delete("/anular/{idVenta}", status_code=status.HTTP_200_OK, response_model=RespuestaGenerica)
def anularVenta(idVenta: int, db: Session = Depends(obtenerSesion)):
    respuesta=Venta().anularVenta(db, idVenta)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=respuesta.mensaje)
    return respuesta

@router.get("/", status_code=status.HTTP_200_OK, response_model=RespuestaGenerica)
def listarVentas(db: Session = Depends(obtenerSesion)):
    respuesta=Venta().obtenerDatosVentas(db)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.get("/{idVenta}", status_code=status.HTTP_200_OK, response_model=RespuestaGenerica)
def obtenerVentaPorId(idVenta: int, db: Session = Depends(obtenerSesion)):
    respuesta=Venta().obtenerVenta(db, idVenta)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta
