from pydantic import BaseModel
from typing import Optional,TypeVar

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    categoria: str
    precio: float
    stock: int
    tieneIva: bool

class ProductoCrearSchema(ProductoBase):
    pass

class ProductoActualizarSchema(ProductoBase):
    estado: Optional[str] = None

class ProductoRespuesta(ProductoBase):
    idProducto: int
    estado: str

    class Config:
        from_attributes = True

class CategoriaBase(BaseModel):
    nombreCategoria: str

class CategoriaCrearSchema(CategoriaBase):
    pass

class CategoriaRespuesta(CategoriaBase):
    idCategoria: int

    class Config:
        from_attributes = True
T=TypeVar("T")
class RespuestaGenerica(BaseModel):
    estado: bool
    mensaje: str
    datos: Optional[T] = None

    class Config:
        orm_mode = True
        from_attributes = True
class ValidacionDisponibilidadSchema(BaseModel):
    idProducto: int
    cantidad: int

    class Config:
        from_attributes = True

class ActualizacionStockSchema(BaseModel):
    idProducto: int
    cantidad: int
    operacion: str  # "sumar" o "restar"
    class Config:
        from_attributes = True