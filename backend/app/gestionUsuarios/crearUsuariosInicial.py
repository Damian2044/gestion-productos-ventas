from sqlalchemy.orm import Session
from .modelosUsuarios import UsuarioOrm, AdministradorOrm, VendedorOrm

def crearUsuariosPorDefecto(db: Session):
    # Solo crear si no existe usuario "admin"
    if not db.query(UsuarioOrm).filter(UsuarioOrm.usuario == "admin").first():
        admin = UsuarioOrm(
            nombreCompleto="Admin Inicial",
            usuario="admin",
            contrasenia="admin123",
            rol="administrador",
            estado=True
        )
        admin.administrador=AdministradorOrm(numeroProductosCreados=0)
        db.add(admin)

    # Solo crear si no existe usuario "vendedor1"
    if not db.query(UsuarioOrm).filter(UsuarioOrm.usuario == "vendedor1").first():
        vendedor = UsuarioOrm(
            nombreCompleto="Vendedor Inicial",
            usuario="vendedor1",
            contrasenia="ventas123",
            rol="vendedor",
            estado=True
        )
        vendedor.vendedor = VendedorOrm(totalVentas=0.0)
        db.add(vendedor)

    db.commit()
