from sqlalchemy.orm import Session
from .crud import *
from .esquemasProducto import *
class Categoria:
    def __init__(self,idCategoria=None,nombreCategoria=None):
        self.idCategoria=idCategoria
        self.nombreCategoria=nombreCategoria
        self.listaCategorias=[]

    def crearCategoria(self, db: Session, nombreCategoria):
        categoriaCrear = CategoriaCrearSchema(nombreCategoria=nombreCategoria)
        resultado = crearCategoriaBD(db, categoriaCrear)
        return resultado
    def listarCategorias(self, db: Session):
        respuesta = listarCategoriasBD(db)
        if respuesta.estado:
            self.listaCategorias = respuesta.datos
            return RespuestaGenerica(
                estado=True,
                mensaje="Lista de categorías obtenida correctamente",
                datos=self.listaCategorias
            )
        return RespuestaGenerica(
            estado=False,
            mensaje="No se encontraron categorías",
            datos=None
        )

