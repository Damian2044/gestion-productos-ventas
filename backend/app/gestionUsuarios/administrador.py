from sqlalchemy.orm import Session
from .usuario import Usuario
from .esquemas import AdministradorSchema, RespuestaGenerica
from .crud import actualizarAdministradorProductosCreadosBD

class Administrador(Usuario):
    def __init__(self,nombreCompleto=None, usuario=None, contrasenia=None, estado=True, numeroProductosCreados=0, id=None):
        super().__init__(nombreCompleto,usuario,contrasenia,"administrador",estado,id=id)
        self.numeroProductosCreados=numeroProductosCreados

    def actualizarProductosCreados(self,db:Session,idAdministrador:int,numeroProductosCreados:int):
        return actualizarAdministradorProductosCreadosBD(db, idAdministrador, numeroProductosCreados)
