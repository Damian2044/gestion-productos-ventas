from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from .database import Base,engine
from fastapi.middleware.cors import CORSMiddleware
from app.gestionUsuarios.usuarioRouter import router as usuarioRouter
from app.gestionProductos.productoRouter import router as productoRouter
from app.gestionProductos.productoRouter import routerCategoria as categoriaRouter
from app.gestionVentas.ventasRouter import router as ventasRouter
from app.Reportes.reportesRouter import router as reporteRouter


from .database import obtenerSesionDirecta
Base.metadata.create_all(bind=engine)
#Crear datos por defecto
from app.gestionUsuarios.crearUsuariosInicial import crearUsuariosPorDefecto
crearUsuariosPorDefecto(obtenerSesionDirecta())

#Crear categorias y productos por defecto
from app.gestionProductos.crearDatosInicialesProductos import crearCategoriasPorDefecto, crearProductosPorDefecto
from app.database import obtenerSesion
crearCategoriasPorDefecto(obtenerSesionDirecta())
crearProductosPorDefecto(obtenerSesionDirecta())

#Crear datos de ventas por defecto
from app.gestionVentas.crearDatosInicialesVentas import crearVentasPorDefecto
crearVentasPorDefecto(obtenerSesionDirecta())

# Configuración de la aplicación FastAPI
app = FastAPI(
    title="API - Novedades Isabela",
    description="Sistema para Novedades Isabela",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarioRouter, prefix="/usuarios", tags=["Usuarios"])
app.include_router(productoRouter, prefix="/productos", tags=["Productos"])
app.include_router(categoriaRouter, prefix="/categorias", tags=["Categorias"])
app.include_router(ventasRouter, prefix="/ventas", tags=["Ventas"])
app.include_router(reporteRouter, prefix="/reportes", tags=["Reportes"])


