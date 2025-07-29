from pydantic import BaseModel
from typing import Optional, TypeVar
from datetime import datetime

class VentaSeleccionarProductoSchema(BaseModel):
    idProducto: int
    cantidad: int

class DetalleSeleccionProductos(BaseModel):
    idProducto: Optional[int]=None
    cantidadVenta: Optional[int]=None
    precioUnitarioVenta: Optional[float]=None
    tieneIva: Optional[bool]=False
    class Config:
        from_attributes = True

class DetalleVentaSchema(DetalleSeleccionProductos):
    class Config:
        from_attributes = True


class VentaFinalizarSchema(BaseModel):
    idResponsableVenta: Optional[int] = None
    descuentoPorcentaje: Optional[float] = 0.0
    detalleProductos: list[DetalleVentaSchema]


class VentaConfirmarSchema(BaseModel):
    fecha: Optional[datetime]=None
    listaDetalleVentas: list[DetalleVentaSchema]=[]
    subtotal: Optional[float]=0.0
    descuentoPorcentaje: Optional[float]=0.0
    valorDescuento: Optional[float]=0.0
    valorIva: Optional[float]=0.0
    total: Optional[float]=0.0
    idResponsableVenta: Optional[int]=None
    estado: Optional[str]="Confirmada"

class VentaRespuestaSchema(BaseModel):
    idVenta: int
    fecha: datetime
    subtotal: float
    descuentoPorcentaje: float
    valorDescuento: float
    valorIva: float
    total: float
    idResponsableVenta: int
    estado: str
    detalles: list[DetalleVentaSchema]
    class Config:
        from_attributes = True

T = TypeVar("T")
class RespuestaGenerica(BaseModel):
    estado: bool
    mensaje: str
    datos: Optional[T] = None
