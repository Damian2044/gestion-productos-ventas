from sqlalchemy.orm import Session
from .usuario import Usuario
from .esquemas import VendedorSchema, RespuestaGenerica
from .crud import actualizarVendedorTotalVentasBD

class Vendedor(Usuario):
    def __init__(self,nombreCompleto=None, usuario=None, contrasenia=None, estado=True, totalVentas=0.0, id=None):
        super().__init__(nombreCompleto,usuario,contrasenia,"vendedor",estado,id=id)
        self.totalVentas=totalVentas

    def actualizarVentas(self, db: Session, idVendedor: int, totalVentas: float):
        return actualizarVendedorTotalVentasBD(db, idVendedor, totalVentas)
