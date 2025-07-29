from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import obtenerSesion
#from app.gestionProductos.esquemasProducto import *
from app.gestionVentas.esquemasVentas import *
from pydantic import BaseModel
from typing import Optional
from datetime import date
from .reportes import Reporte
class datosReporte(BaseModel):
    tipo: Optional[str] = None
    fecha: Optional[date] = None


router = APIRouter()


@router.post("/", status_code=status.HTTP_200_OK, response_model=RespuestaGenerica)
def obtenerReporte(datos: datosReporte,db: Session = Depends(obtenerSesion)):
    reporte=Reporte(tipo=datos.tipo, filtro=datos.fecha)
    if not reporte.seleccionarReporte(datos.tipo):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipo de reporte no válido")
    respuesta=reporte.obtenerReporte(db, datos.fecha)
    return respuesta