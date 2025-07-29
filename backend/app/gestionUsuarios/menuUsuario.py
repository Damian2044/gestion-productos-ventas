class MenuUsuario:
    def __init__(self,rol):
        self.rol=rol

    def mostrarMenu(self):
        if self.rol=="administrador":
            return ["/inicio-admin", "/gestion-productos", "/gestion-ventas", "/reportes","/gestion-usuarios"]
        elif self.rol=="vendedor":
            return ["/inicio-vendedor","/gestion-ventas"]
        else:
            return []
