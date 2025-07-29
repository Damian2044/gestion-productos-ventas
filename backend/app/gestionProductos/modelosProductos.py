from sqlalchemy import Column,Integer,String,Float,Boolean,ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class CategoriaOrm(Base):
    __tablename__="categorias"
    idCategoria=Column(Integer,primary_key=True,index=True)
    nombreCategoria=Column(String,unique=True,nullable=False)

    productos=relationship("ProductoOrm",back_populates="categoriaRel")

class ProductoOrm(Base):
    __tablename__="productos"
    idProducto=Column(Integer,primary_key=True,index=True)
    nombre=Column(String,nullable=False)
    descripcion=Column(String,nullable=True)
    categoria=Column(String,ForeignKey("categorias.nombreCategoria"),nullable=False)
    precio=Column(Float,nullable=False)
    stock=Column(Integer,nullable=False,default=0)
    tieneIva=Column(Boolean,nullable=False,default=True)
    estado=Column(String,nullable=False,default="activo")

    categoriaRel=relationship("CategoriaOrm",back_populates="productos")
