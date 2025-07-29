from sqlalchemy import Column,Integer,String,Boolean,ForeignKey,Float
from sqlalchemy.orm import relationship
from app.database import Base
from app.gestionVentas.modelosVentas import VentaOrm, DetalleVentaOrm
class UsuarioOrm(Base):
    __tablename__="usuarios"
    id=Column(Integer,primary_key=True,index=True)
    nombreCompleto=Column(String,nullable=False)
    usuario=Column(String,unique=True,index=True,nullable=False)
    contrasenia=Column(String,nullable=False)
    rol=Column(String,nullable=False)
    estado=Column(Boolean,default=True)
    administrador=relationship("AdministradorOrm",uselist=False,back_populates="usuario")
    vendedor=relationship("VendedorOrm",uselist=False,back_populates="usuario")
    ventas=relationship("VentaOrm",back_populates="responsable")

class AdministradorOrm(Base):
    __tablename__="administradores"
    idAdministrador=Column(Integer,primary_key=True,index=True)
    idUsuario=Column(Integer,ForeignKey("usuarios.id"))
    numeroProductosCreados=Column(Integer,default=0)
    usuario=relationship("UsuarioOrm",back_populates="administrador")

class VendedorOrm(Base):
    __tablename__="vendedores"
    idVendedor=Column(Integer,primary_key=True,index=True)
    idUsuario=Column(Integer,ForeignKey("usuarios.id"))
    totalVentas=Column(Float,default=0.0)
    usuario=relationship("UsuarioOrm",back_populates="vendedor")
