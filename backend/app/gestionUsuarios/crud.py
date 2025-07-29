from sqlalchemy.orm import Session, joinedload
from app.gestionUsuarios.modelosUsuarios import UsuarioOrm, AdministradorOrm, VendedorOrm
from app.gestionUsuarios.esquemas import *
from fastapi.encoders import jsonable_encoder

def obtenerUsuarioPorIdBD(db: Session, idUsuario: int):
    usuarioOrm = db.query(UsuarioOrm).options(
        joinedload(UsuarioOrm.administrador),
        joinedload(UsuarioOrm.vendedor)
    ).filter(UsuarioOrm.id == idUsuario).first()

    if not usuarioOrm:
        return RespuestaGenerica(
            estado=False,
            mensaje="Usuario no encontrado",
            datos=None
        )
    
    return RespuestaGenerica(
        estado=True,
        mensaje="Usuario encontrado",
        datos=UsuarioRespuestaSchema.from_orm(usuarioOrm)
    )

def obtenerUsuarioPorNombreBD(db:Session,usuario:str):
    usuarioOrm=db.query(UsuarioOrm).options(
        joinedload(UsuarioOrm.administrador),
        joinedload(UsuarioOrm.vendedor)
    ).filter(UsuarioOrm.usuario==usuario).first()
    if not usuarioOrm:
        return RespuestaGenerica(
            estado=False,
            mensaje="Usuario no encontrado",
            datos=None
        )
    print(usuarioOrm)
    return RespuestaGenerica(
        estado=True,
        mensaje="Usuario encontrado",
        datos=UsuarioRespuestaSchema.from_orm(usuarioOrm)
    )
    

def crearUsuarioBD(db:Session,usuarioCrear:UsuarioCrearSchema)->RespuestaGenerica:
    consulta=obtenerUsuarioPorNombreBD(db,usuarioCrear.usuario)
    print(consulta)
    if consulta.estado:
        return RespuestaGenerica(estado=False,mensaje="El usuario ya existe",datos=None)
    nuevoUsuario=UsuarioOrm(
        nombreCompleto=usuarioCrear.nombreCompleto,
        usuario=usuarioCrear.usuario,
        contrasenia=usuarioCrear.contrasenia,
        rol=usuarioCrear.rol
    )
    if usuarioCrear.rol=="administrador":
        nuevoUsuario.administrador=AdministradorOrm(numeroProductosCreados=0)
    elif usuarioCrear.rol=="vendedor":
        nuevoUsuario.vendedor=VendedorOrm(totalVentas=0.0)
    db.add(nuevoUsuario)
    db.commit()
    db.refresh(nuevoUsuario)
    usuarioRespuesta=UsuarioRespuestaSchema.from_orm(nuevoUsuario)
    return RespuestaGenerica(estado=True,mensaje="Usuario creado exitosamente",datos=usuarioRespuesta)

def actualizarUsuarioBD(db:Session,idUsuario:int,usuarioActualizar:UsuarioActualizarSchema)->RespuestaGenerica:
    usuarioActual=obtenerUsuarioPorIdBD(db,idUsuario)
    usuarioOrm=None
    print(usuarioActual)
    if not usuarioActual.estado:
        return RespuestaGenerica(estado=False,mensaje="Usuario no encontrado",datos=None)
    else:
        usuarioOrm=db.query(UsuarioOrm).filter(UsuarioOrm.usuario==usuarioActual.datos.usuario).first()
        print(usuarioOrm)
        if usuarioOrm and usuarioOrm.id != idUsuario:
            return RespuestaGenerica(estado=False,mensaje="El usuario ya existe",datos=None)
    print(usuarioOrm,type(usuarioOrm))
    for campo, valor in usuarioActualizar.dict().items():
        setattr(usuarioOrm, campo, valor)      

    db.commit()
    db.refresh(usuarioOrm)
    usuarioRespuesta=UsuarioRespuestaSchema.from_orm(usuarioOrm)
    return RespuestaGenerica(estado=True,mensaje="Usuario actualizado exitosamente",datos=usuarioRespuesta)



def deshabilitarUsuarioBD(db: Session, idUsuario: int):
    usuario=obtenerUsuarioPorIdBD(db, idUsuario)
    if not usuario.estado:
        return RespuestaGenerica(estado=False, mensaje="Usuario no encontrado", datos=None)
    
    usuarioOrm = db.query(UsuarioOrm).filter(UsuarioOrm.id == idUsuario).first()
    usuarioOrm.estado = False
    db.commit()
    db.refresh(usuarioOrm)
    return RespuestaGenerica(estado=True, mensaje="Usuario deshabilitado exitosamente", datos=None)

def listarUsuariosBD(db: Session):
    usuarios = db.query(UsuarioOrm).options(
        joinedload(UsuarioOrm.administrador),
        joinedload(UsuarioOrm.vendedor)
    ).all()
    if not usuarios:
        return RespuestaGenerica(estado=False, mensaje="No se encontraron usuarios", datos=None)
    
    usuariosRespuesta=[UsuarioRespuestaSchema.from_orm(usuario) for usuario in usuarios]
    return RespuestaGenerica(estado=True, mensaje="Usuarios encontrados", datos=usuariosRespuesta)


def obtenerAdministradorPorIdBD(db: Session, idAdministrador: int):
    administradorOrm = db.query(AdministradorOrm).filter(AdministradorOrm.idAdministrador == idAdministrador).first()
    return AdministradorSchema.from_orm(administradorOrm)

def obtenerVendedorPorIdBD(db: Session, idVendedor: int):
    vendedorOrm = db.query(VendedorOrm).filter(VendedorOrm.idVendedor == idVendedor).first()
    return VendedorSchema.from_orm(vendedorOrm)

def actualizarAdministradorProductosCreadosBD(db: Session, idAdministrador: int, cantidad: int):
    print(f"Actualizando administrador {idAdministrador} con cantidad {cantidad}")
    administrador = db.query(AdministradorOrm).filter(AdministradorOrm.idAdministrador == idAdministrador).first()
    if not administrador:
        return None
    administrador.numeroProductosCreados += cantidad
    db.commit()
    db.refresh(administrador)
    return RespuestaGenerica(
        estado=True,
        mensaje="Productos creados actualizados exitosamente",
        datos=AdministradorSchema.from_orm(administrador)
    )

def actualizarVendedorTotalVentasBD(db: Session, idVendedor: int, cantidad: float):
    vendedor = db.query(VendedorOrm).filter(VendedorOrm.idVendedor == idVendedor).first()
    if not vendedor:
        return None
    vendedor.totalVentas += cantidad
    db.commit()
    db.refresh(vendedor)
    return RespuestaGenerica(
        estado=True,
        mensaje="Total de ventas actualizado exitosamente",
        datos=VendedorSchema.from_orm(vendedor)
    )
