from sqlalchemy.orm import Session
# Importaciones internas
from .crud import *
from .menuUsuario import MenuUsuario

class Usuario:
    def __init__(self, nombreCompleto=None, usuario=None, contrasenia=None, rol=None, estado=True, id=None):
        self.id=id
        self.nombreCompleto=nombreCompleto
        self.usuario=usuario
        self.contrasenia=contrasenia
        self.rol=rol
        self.estado=estado

    def iniciarSesion(self,db:Session,usuarioInput,contraseniaInput):
        self.usuario=usuarioInput
        self.contrasenia=contraseniaInput
        validar=self.validarCredenciales(db)
        if not validar.get("estado", True):
            return validar
        if not self.validarRol():
            return {
                "mensaje": "Rol no válido",
                "estado": False}
        return  validar

    def validarCredenciales(self, db: Session):
        if not self.usuario or not self.contrasenia:
            return {
                "mensaje": "Usuario y contraseña son requeridos",
                "estado": False
            }
        usuario=obtenerUsuarioPorNombreBD(db, self.usuario)
        if not usuario.estado:
            return {
                "mensaje": "Usuario o contraseña incorrectos",
                "estado": False
            }
        if usuario.datos.contrasenia!=self.contrasenia and usuario.estado:
            return {
                "mensaje": "Usuario o contraseña incorrectos",
                "estado": False
            }
        if not usuario.datos.estado:
            return {
                "mensaje": "Usuario inactivo",
                "estado": False
            }
        self.id=usuario.datos.id
        self.nombreCompleto=usuario.datos.nombreCompleto
        self.rol=usuario.datos.rol
        self.contrasenia=usuario.datos.contrasenia
        self.estado=usuario.datos.estado
        datos={
            "id": self.id,
            "nombreCompleto": self.nombreCompleto,
            "usuario": self.usuario,
            "contrasenia": self.contrasenia,
            "rol": self.rol,
            "estado": self.estado,
        }
        datosExtra=None
        if self.rol == "administrador":
            admin=usuario.datos.administrador
            datosExtra={
                "idAdministrador": admin.idAdministrador,
                "numeroProductosCreados": admin.numeroProductosCreados
            }
        elif self.rol == "vendedor":
            vendedor=usuario.datos.vendedor
            datosExtra={
                "idVendedor": vendedor.idVendedor,
                "totalVentas": vendedor.totalVentas
            }
        datos.update({"datos": datosExtra})

        menu=MenuUsuario(self.rol)
        rutas=menu.mostrarMenu()
        return {
            "usuario": self.usuario,
            "rol": self.rol,
            "rutas": rutas,
            "datos": datos
        }
    

    def validarRol(self):
        return self.rol in ["administrador", "vendedor"]

    def cerrarSesion(self):
        return "Sesión cerrada correctamente."
    
    def crearUsuario(self,db: Session, nombreCompleto, usuario, contrasenia, rol,estado):
        resultado=crearUsuarioBD(db, UsuarioCrearSchema(
            nombreCompleto=nombreCompleto,
            usuario=usuario,
            contrasenia=contrasenia,
            rol=rol,
            estado=estado
        ))
        if not resultado.estado:
            return resultado
        return resultado
    def actualizarUsuario(self, db: Session,idUsuario, nombreCompleto, usuario, contrasenia, rol, estado):
        resultado=actualizarUsuarioBD(db, idUsuario, UsuarioActualizarSchema(
            nombreCompleto=nombreCompleto,
            usuario=usuario,
            contrasenia=contrasenia,
            rol=rol,
            estado=estado
        ))
        if not resultado.estado:
            return resultado
        return resultado
    
    def consultarUsuario(self, db: Session, idUsuario: int):
        respuesta=obtenerUsuarioPorIdBD(db, idUsuario)
        return respuesta
    
    def deshabilitarUsuario(self, db: Session, idUsuario: int):
        respuesta=deshabilitarUsuarioBD(db, idUsuario)
        return respuesta
    
    def listarUsuarios(self, db: Session):
        respuesta=listarUsuariosBD(db)
        return respuesta