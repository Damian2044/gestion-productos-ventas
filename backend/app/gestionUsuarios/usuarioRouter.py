from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import obtenerSesion
from .usuario import Usuario
from .administrador import Administrador
from .vendedor import Vendedor
from .esquemas import *

from .crud import *


#from .crud import crearAdministrador,crearVendedor
router=APIRouter()
#Login de usuario
@router.post("/login")
def login(datosLogin:UsuarioLogin, db:Session=Depends(obtenerSesion)):
    instanciaUsuario=Usuario("","","","")
    resultado=instanciaUsuario.iniciarSesion(db,datosLogin.usuario,datosLogin.contrasenia)
    if not resultado.get("estado", True):
        raise HTTPException(status_code=401,detail=resultado.get("mensaje", "Error al iniciar sesión"))
    return {
        "usuario": resultado["usuario"],
        "rol": resultado["rol"],
        "rutas": resultado["rutas"],
        "datos": resultado["datos"]
    }
#Crud de usuario
@router.post("/",status_code=status.HTTP_201_CREATED, response_model=RespuestaGenerica)
def crearUsuario(datosUsuario: UsuarioCrearSchema, db:Session=Depends(obtenerSesion)):
    respuesta=Usuario().crearUsuario(db, datosUsuario.nombreCompleto, datosUsuario.usuario, datosUsuario.contrasenia, datosUsuario.rol, datosUsuario.estado)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=respuesta.mensaje)
    return respuesta

@router.put("/{idUsuario}", response_model=RespuestaGenerica)
def actualizarUsuario(idUsuario: int, datosUsuario: UsuarioActualizarSchema, db: Session = Depends(obtenerSesion)):
    respuesta=Usuario().actualizarUsuario(db, idUsuario, datosUsuario.nombreCompleto, datosUsuario.usuario, datosUsuario.contrasenia, datosUsuario.rol, datosUsuario.estado)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.get("/{idUsuario}", response_model=RespuestaGenerica)
def obtenerUsuario(idUsuario: int, db: Session = Depends(obtenerSesion)):
    usuario=Usuario().consultarUsuario(db, idUsuario)
    if not usuario.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=usuario.mensaje)
    return usuario

@router.delete("/{idUsuario}", response_model=RespuestaGenerica)
def deshabilitarUsuario(idUsuario: int, db: Session = Depends(obtenerSesion)):
    usuario=Usuario().deshabilitarUsuario(db, idUsuario)
    if not usuario.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=usuario.mensaje)
    return usuario

@router.get("/", response_model=RespuestaGenerica)
def listarUsuarios(db: Session = Depends(obtenerSesion)):
    usuarios=Usuario().listarUsuarios(db)
    if not usuarios.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=usuarios.mensaje)
    return usuarios

#Actualizar administrador o vendedor
@router.put("/adminProdCreados/{idAdministrador}", response_model=RespuestaGenerica)
def actualizarAdministrador(adminDatos: ActualizacionAdministradorSchema, idAdministrador: int, db: Session = Depends(obtenerSesion)):
    respuesta=Administrador().actualizarProductosCreados(db, idAdministrador, adminDatos.numeroProductosCreados)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.put("/vendedorVentasRealizadas/{idVendedor}", response_model=RespuestaGenerica)
def actualizarVendedor(vendedorDatos: VendedorSchema, idVendedor: int, db: Session = Depends(obtenerSesion)):
    print(f"Actualizando vendedor con ID: {idVendedor} y datos: {vendedorDatos}")
    respuesta=Vendedor().actualizarVentas(db, idVendedor, vendedorDatos.totalVentas)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta

@router.get("/porNombre/{usuario}", response_model=RespuestaGenerica)
def obtenerUsuarioPorNombre(usuario: str, db: Session = Depends(obtenerSesion)):
    respuesta=obtenerUsuarioPorNombreBD(db, usuario)
    if not respuesta.estado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=respuesta.mensaje)
    return respuesta


