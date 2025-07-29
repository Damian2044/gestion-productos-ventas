from pydantic import BaseModel
from typing import Optional,TypeVar

class UsuarioLogin(BaseModel):
    usuario: str
    contrasenia: str

    class Config:
        from_attributes = True
class AdministradorSchema(BaseModel):
    idAdministrador: Optional[int]
    idUsuario: Optional[int]
    numeroProductosCreados: int

    class Config:
        from_attributes = True

class ActualizacionAdministradorSchema(BaseModel):
    numeroProductosCreados: int

    class Config:
        from_attributes = True
        

class VendedorSchema(BaseModel):
    idVendedor: Optional[int]
    idUsuario: Optional[int]
    totalVentas: float

    class Config:
        from_attributes = True

class UsuarioBaseSchema(BaseModel):
    nombreCompleto: str
    usuario: str
    contrasenia: str
    rol: str
    estado: Optional[bool] = True

class UsuarioCrearSchema(UsuarioBaseSchema):
    pass

class UsuarioActualizarSchema(UsuarioBaseSchema):
    pass

class UsuarioRespuestaSchema(BaseModel):
    id: int
    nombreCompleto: str
    usuario: str
    contrasenia: str
    rol: str
    estado: bool
    administrador: Optional[AdministradorSchema] = None
    vendedor: Optional[VendedorSchema] = None

    class Config:
        from_attributes = True

T=TypeVar("T")
class RespuestaGenerica(BaseModel):
    estado: bool
    mensaje: str
    datos: Optional[T] = None
