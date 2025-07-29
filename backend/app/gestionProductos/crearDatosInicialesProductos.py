from sqlalchemy.orm import Session
from .modelosProductos import ProductoOrm, CategoriaOrm

def crearCategoriasPorDefecto(db: Session):
    categoriasPorDefecto = ["Papeleria", "Bazar", "Oficina", "Maquillaje", "Tecnología"]
    for nombre in categoriasPorDefecto:
        existe = db.query(CategoriaOrm).filter(CategoriaOrm.nombreCategoria == nombre).first()
        if not existe:
            nuevaCategoria = CategoriaOrm(nombreCategoria=nombre)
            db.add(nuevaCategoria)

    db.commit()

def crearProductosPorDefecto(db: Session):
    productosPorDefecto = [
        {"nombre":"Cuaderno A5","descripcion":"Cuaderno con 100 hojas rayadas","categoria":"Papeleria","precio":2.5,"stock":50,"tieneIva":True,"estado":"activo"},
        {"nombre":"Lápiz HB","descripcion":"Lápiz de grafito para dibujo y escritura","categoria":"Papeleria","precio":0.5,"stock":200,"tieneIva":True,"estado":"activo"},
        {"nombre":"Bolígrafo Azul","descripcion":"Bolígrafo con tinta azul","categoria":"Papeleria","precio":1.0,"stock":150,"tieneIva":True,"estado":"activo"},
        {"nombre":"Pegamento en barra","descripcion":"Pegamento sólido para papel","categoria":"Papeleria","precio":1.2,"stock":100,"tieneIva":True,"estado":"activo"},
        {"nombre":"Resma de papel A4","descripcion":"500 hojas para impresora","categoria":"Papeleria","precio":6.0,"stock":80,"tieneIva":True,"estado":"activo"},
        
        {"nombre":"Velas aromáticas","descripcion":"Set de 3 velas con aroma","categoria":"Bazar","precio":10.0,"stock":30,"tieneIva":True,"estado":"activo"},
        {"nombre":"Cesto organizador","descripcion":"Cesto de mimbre para orden","categoria":"Bazar","precio":12.5,"stock":40,"tieneIva":True,"estado":"activo"},
        {"nombre":"Portarretrato madera","descripcion":"Portarretrato tamaño 10x15","categoria":"Bazar","precio":8.0,"stock":60,"tieneIva":True,"estado":"activo"},
        {"nombre":"Jarrón decorativo","descripcion":"Jarrón de cerámica","categoria":"Bazar","precio":15.0,"stock":25,"tieneIva":True,"estado":"activo"},
        {"nombre":"Set de cubiertos","descripcion":"10 piezas acero inoxidable","categoria":"Bazar","precio":20.0,"stock":50,"tieneIva":True,"estado":"activo"},
        
        {"nombre":"Silla de oficina","descripcion":"Silla ergonómica con ruedas","categoria":"Oficina","precio":85.0,"stock":10,"tieneIva":True,"estado":"activo"},
        {"nombre":"Escritorio madera","descripcion":"Escritorio con gavetas","categoria":"Oficina","precio":120.0,"stock":8,"tieneIva":True,"estado":"activo"},
        {"nombre":"Archivador metálico","descripcion":"Archivador 4 gavetas","categoria":"Oficina","precio":70.0,"stock":15,"tieneIva":True,"estado":"activo"},
        {"nombre":"Calendario de pared","descripcion":"Calendario anual 2025","categoria":"Oficina","precio":5.0,"stock":100,"tieneIva":True,"estado":"activo"},
        {"nombre":"Organizador de escritorio","descripcion":"Soporte para documentos","categoria":"Oficina","precio":7.5,"stock":45,"tieneIva":True,"estado":"activo"},
        
        {"nombre":"Base de maquillaje","descripcion":"Base líquida tono medio","categoria":"Maquillaje","precio":15.0,"stock":70,"tieneIva":True,"estado":"activo"},
        {"nombre":"Máscara de pestañas","descripcion":"Máscara voluminizadora","categoria":"Maquillaje","precio":12.0,"stock":90,"tieneIva":True,"estado":"activo"},
        {"nombre":"Labial rojo","descripcion":"Labial mate color rojo intenso","categoria":"Maquillaje","precio":8.0,"stock":80,"tieneIva":True,"estado":"activo"},
        {"nombre":"Paleta de sombras","descripcion":"Paleta 12 colores","categoria":"Maquillaje","precio":18.0,"stock":50,"tieneIva":True,"estado":"activo"},
        {"nombre":"Desmaquillante","descripcion":"Gel desmaquillante facial","categoria":"Maquillaje","precio":10.0,"stock":60,"tieneIva":True,"estado":"activo"},
        
        {"nombre":"Auriculares Bluetooth","descripcion":"Auriculares inalámbricos","categoria":"Tecnología","precio":35.0,"stock":40,"tieneIva":True,"estado":"activo"},
        {"nombre":"Mouse óptico","descripcion":"Mouse USB con cable","categoria":"Tecnología","precio":12.5,"stock":100,"tieneIva":True,"estado":"activo"},
    ]

    for prod in productosPorDefecto:
        existe = db.query(ProductoOrm).filter(ProductoOrm.nombre == prod["nombre"]).first()
        if not existe:
            nuevoProducto = ProductoOrm(**prod)
            db.add(nuevoProducto)

    db.commit()
