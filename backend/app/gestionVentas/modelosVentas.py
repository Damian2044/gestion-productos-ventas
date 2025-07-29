from sqlalchemy import Column,Integer,Float,String,DateTime,Boolean,ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from datetime import datetime, timezone


class VentaOrm(Base):
    __tablename__="ventas"
    idVenta=Column(Integer,primary_key=True,index=True)
    fecha = Column(DateTime(timezone=True), nullable=False)
    subtotal=Column(Float, nullable=False)#total sin descuentos ni IVA
    descuentoPorcentaje=Column(Float,nullable=False)#Porcentaje de descuento aplicado
    valorDescuento=Column(Float, nullable=False, default=0.0)  # valor monetario del descuento
    valorIva=Column(Float, nullable=False, default=0.0)#valor monetario del IVA (ej. 12%)
    total=Column(Float, nullable=False)#total final:subtotal-descuento+IVA
    idResponsableVenta=Column(Integer,ForeignKey("usuarios.id"),nullable=False)
    estado=Column(String,nullable=False,default="activa")
    detalles=relationship("DetalleVentaOrm",back_populates="venta",cascade="all, delete-orphan")
    responsable=relationship("UsuarioOrm",back_populates="ventas")


class DetalleVentaOrm(Base):
    __tablename__="detalles_venta"
    id=Column(Integer,primary_key=True,index=True)
    idVenta=Column(Integer,ForeignKey("ventas.idVenta"),nullable=False)
    idProducto=Column(Integer,ForeignKey("productos.idProducto"),nullable=False)
    cantidadVenta=Column(Integer,nullable=False)
    precioUnitarioVenta=Column(Float,nullable=False)
    tieneIva=Column(Boolean, nullable=False, default=False) 
    venta=relationship("VentaOrm",back_populates="detalles")
    producto=relationship("ProductoOrm")