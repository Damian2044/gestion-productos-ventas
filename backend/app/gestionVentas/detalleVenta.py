class DetalleVenta:
    def __init__(self,idVenta=None,idProducto=None,cantidadVenta=None,precioUnitarioVenta=None,tieneIva=False):
        self.idVenta=idVenta
        self.idProducto=idProducto
        self.cantidadVenta=cantidadVenta
        self.precioUnitarioVenta=precioUnitarioVenta
        self.tieneIva=tieneIva

    def crearDetalleVenta(self,idVenta,idProducto,cantidadVenta,precioUnitarioVenta,tieneIva=False):
        self.idVenta=idVenta
        self.idProducto=idProducto
        self.cantidadVenta=cantidadVenta
        self.precioUnitarioVenta=precioUnitarioVenta
        self.tieneIva=tieneIva
        return self

    def obtenerIdVenta(self):
        return self.idVenta

    def asignarIdVenta(self,idVenta):
        self.idVenta=idVenta
        return True

    def obtenerIdProducto(self):
        return self.idProducto

    def asignarProducto(self,idProducto):
        self.idProducto=idProducto
        return True

    def obtenerCantidadVenta(self):
        return self.cantidadVenta

    def asignarCantidadVenta(self,cantidadVenta):
        self.cantidadVenta=cantidadVenta
        return True

    def obtenerPrecioUnitarioVenta(self):
        return self.precioUnitarioVenta

    def asignarPrecioUnitarioVenta(self,precioUnitarioVenta):
        self.precioUnitarioVenta=precioUnitarioVenta
        return True

    def obtenerTieneIva(self):
        return self.tieneIva
    def asignarTieneIva(self,tieneIva):
        self.tieneIva=tieneIva
        return True
