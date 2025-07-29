// Componente auxiliar para mostrar el nombre del vendedor en el resumen de venta
function VendedorNombre({ idUsuario }) {
  const [nombre, setNombre] = useState("");
  useEffect(() => {
    let activo = true;
    async function fetchNombre() {
      if (!idUsuario) { setNombre(""); return; }
      try {
        const usuario = await buscarUsuarioServicio(idUsuario);
        if (activo) setNombre(usuario.datos.nombreCompleto);
      } catch (e) {
        if (activo) setNombre("Desconocido");
      }
    }
    fetchNombre();
    return () => { activo = false; };
  }, [idUsuario]);
  return <>{nombre}</>;
}
import PlantillaBase from "@/componentes/PlantillaBase";
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
  listarVentasServicio,
  anularVentaServicio,
  obtenerVentaPorIdServicio,
  finalizarSeleccionVentaServicio,
} from "@/servicios/servicioVentas";
import { listarProductosServicio, validarDisponibilidadServicio, obtenerProductoPorIdServicio } from "@/servicios/servicioProducto";
import { actualizarVendedorVentasServicio, buscarUsuarioServicio } from "@/servicios/servicioUsuarios";

function formatoComprobante(id) {
  return `001-001-${String(id).padStart(9, "0")}`;
}

function calcularIVA(monto) {
  return +(monto * 0.15).toFixed(2);
}

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [modo, setModo] = useState("lista"); // por defecto mostrar lista
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [mensajeFlotante, setMensajeFlotante] = useState(null);
  const [nombresProductosResumen, setNombresProductosResumen] = useState({});

  // Auto-dismiss message after 3 seconds
  // Cargar nombres de productos para el resumen de venta seleccionada
  useEffect(() => {
    async function fetchNombresProductos() {
      if (ventaSeleccionada && ventaSeleccionada.detalles) {
        const nuevosNombres = {};
        await Promise.all(
          ventaSeleccionada.detalles.map(async (d) => {
            if (!nombresProductosResumen[d.idProducto]) {
            try {
                const prod = await obtenerProductoPorIdServicio(d.idProducto);
                nuevosNombres[d.idProducto] = prod.datos.nombre;
            } catch (e) {
                nuevosNombres[d.idProducto] = 'Desconocido';
            }
            } else {
              nuevosNombres[d.idProducto] = nombresProductosResumen[d.idProducto];
            }
          })
        );
        setNombresProductosResumen(nuevosNombres);
      }
    }
    fetchNombresProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ventaSeleccionada]);
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);
  // Auto-dismiss floating message after 2.5s
  useEffect(() => {
    if (mensajeFlotante) {
      const timer = setTimeout(() => setMensajeFlotante(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensajeFlotante]);
  const [usuario, setUsuario] = useState(null);
  const [productosVenta, setProductosVenta] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [modalBuscar, setModalBuscar] = useState(false);
  const [busquedaModal, setBusquedaModal] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [stockDisponible, setStockDisponible] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const datosUsuario = JSON.parse(sessionStorage.getItem("datosUsuario"));
    setUsuario(datosUsuario);
    obtenerVentas();
    obtenerProductos();
  }, []);

  // Actualizar productos cada 5 segundos solo cuando el modal de buscar productos está abierto
  useEffect(() => {
    let interval = null;
    if (modalBuscar) {
      interval = setInterval(() => {
        obtenerProductos();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [modalBuscar]);

  // Actualizar ventas cada 5 segundos en modo lista
  useEffect(() => {
    let interval = null;
    if (modo === "lista") {
      interval = setInterval(() => {
        obtenerVentas();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [modo]);

  const obtenerVentas = async () => {
    setCargando(true);
    try {
      const resp = await listarVentasServicio();
      if (resp.estado) {
        // Para cada venta, obtener el nombreCompleto del vendedor
        console.log("Ventas obtenidas:", resp.datos);
        const ventasConNombre = await Promise.all(
          resp.datos.map(async v => {
            let nombreCompleto = '';
            try {
              const usuario = await buscarUsuarioServicio(v.idResponsableVenta);
              nombreCompleto = usuario.datos.nombreCompleto;
            } catch (e) {
              nombreCompleto = 'Desconocido';
            }
            return { ...v, nombreCompleto };
          })
        );
        setVentas(ventasConNombre);
      } else {
        setVentas([]);
      }
    } catch (e) {
      setVentas([]);
    }
    setCargando(false);
  };

  const obtenerProductos = async () => {
    try {
      const resp = await listarProductosServicio();
      if (resp.estado) setProductos(resp.datos);
      else setProductos([]);
    } catch (e) {
      setProductos([]);
    }
  };

  const columnas = [
    {
      name: "Comprobante",
      selector: row => formatoComprobante(row.idVenta),
      sortable: true,
      width: "180px",
      wrap: true,
    },
    {
      name: "Fecha",
      selector: row => row.fecha ? row.fecha.split('T')[0] : '',
      sortable: true,
    },
    {
      name: "Vendedor",
      selector: row => row.nombreCompleto || '',
      sortable: true,
    },
    {
      name: "Total",
      cell: row => `$ ${Number(row.total).toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Estado",
      cell: row => (
        <span className={clsx("font-bold px-2 py-1 rounded", {
          "bg-green-100 text-green-800": row.estado === "Confirmada",
          "bg-red-100 text-red-800": row.estado === "Anulada",
        })}>
          {row.estado}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Ver",
      cell: row => (
        <button
          className="bg-gray-300 px-3 py-1 rounded shadow hover:bg-gray-400"
          onClick={() => verVenta(row)}
        >Ver</button>
      ),
      ignoreRowClick: true,
      button: true,
    },
    {
      name: "Anular",
      cell: row => (
        row.estado === "Anulada" ? (
          <button
            className="bg-gray-300 px-3 py-1 rounded text-gray-400 cursor-not-allowed"
            disabled
            style={{ minWidth: 90 }}
          >
            Anulada
          </button>
        ) : (
          <button
            className="bg-red-400 px-3 py-1 rounded shadow hover:bg-red-500 text-white"
            onClick={() => anularVenta(row)}
          >Anular</button>
        )
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  const verVenta = async (venta) => {
    setCargando(true);
    try {
      const resp = await obtenerVentaPorIdServicio(venta.idVenta);
      if (resp.estado) setVentaSeleccionada(resp.datos);
      else setVentaSeleccionada(venta);
      // No cambiar el modo, solo mostrar el modal
      console.log("Venta seleccionada:", resp.datos);
    } catch (e) {
      setMensaje({ tipo: "error", texto: "No se pudo obtener la venta" });
    }
    setCargando(false);
  };

  const anularVenta = async (venta) => {
    if (venta.estado === "anulada") return;
    setCargando(true);
    try {
      const resp = await anularVentaServicio(venta.idVenta);
      if (!resp.estado) {
        setMensaje({ tipo: "error", texto: resp.mensaje || resp.detail || "No se pudo anular" });
        setCargando(false);
        return;
      }
      setMensaje({ tipo: "exito", texto: `Venta ${formatoComprobante(venta.idVenta)} anulada correctamente` });
      // Actualizar el estado de la venta anulada en la lista local inmediatamente
      setVentas(prev => prev.map(v => v.idVenta === venta.idVenta ? { ...v, estado: "anulada" } : v));
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.mensaje || e.detail || "No se pudo anular" });
    }
    setCargando(false);
  };

  // --- Nueva Venta ---
  const productosFiltrados = busquedaProducto.trim()
    ? productos.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()))
    : productos;
  const productosFiltradosModal = busquedaModal.trim()
    ? productos.filter(p => p.nombre.toLowerCase().includes(busquedaModal.toLowerCase()) && p.estado !== "deshabilitado")
    : productos.filter(p => p.estado !== "deshabilitado");

  const agregarProductoVenta = async (producto) => {
    // Permite añadir varios productos, pero si ya está añadido, no hace nada
    const yaExiste = productosVenta.find(pv => pv.idProducto === producto.idProducto);
    if (yaExiste) return;
    try {
      const resp = await validarDisponibilidadServicio(producto.idProducto, 1);
      if (!resp.estado) {
        setMensaje({ tipo: "error", texto: resp.mensaje || resp.detail || "Stock insuficiente" });
        return;
      }
      setProductosVenta([...productosVenta, { ...producto, cantidad: 1 }]);
      setMensaje(null);
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.mensaje || e.detail || "Stock insuficiente" });
    }
  };

  const eliminarProductoVenta = (idProducto) => {
    setProductosVenta(productosVenta.filter(pv => pv.idProducto !== idProducto));
  };

  const cambiarCantidad = async (idProducto, nuevaCantidad) => {
    if (!nuevaCantidad || nuevaCantidad < 1) return;
    const producto = productosVenta.find(pv => pv.idProducto === idProducto);
    if (!producto) return;
    try {
      const resp = await validarDisponibilidadServicio(idProducto, nuevaCantidad);
      if (!resp.estado) {
        setMensaje({ tipo: "error", texto: resp.mensaje || resp.detail || "Stock insuficiente" });
        return;
      }
      setProductosVenta(productosVenta.map(pv =>
        pv.idProducto === idProducto ? { ...pv, cantidad: nuevaCantidad } : pv
      ));
      setMensaje(null);
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.mensaje || e.detail || "Stock insuficiente" });
    }
  };

  const vaciarVenta = () => {
    setProductosVenta([]);
    setDescuento(0);
    setMensaje(null);
  };

  // Cálculos
  const subtotal = productosVenta.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
  const descuentoValor = +(subtotal * (descuento / 100)).toFixed(2);
  const subtotalConDescuento = subtotal - descuentoValor;
  const iva = productosVenta.reduce((acc, p) => acc + (p.tieneIva ? calcularIVA((p.precio * p.cantidad) - ((p.precio * p.cantidad) * (descuento / 100))) : 0), 0);
  const total = +(subtotalConDescuento + iva).toFixed(2);

  const confirmarVenta = async () => {
    if (productosVenta.length === 0) {
      setMensaje({ tipo: "error", texto: "Debe agregar al menos un producto" });
      return;
    }
    setCargando(true);
    try {
      // Formato requerido por el backend
      const detalleProductos = productosVenta.map(p => ({
        idProducto: p.idProducto,
        cantidadVenta: p.cantidad,
        precioUnitarioVenta: p.precio,
        tieneIva: p.tieneIva
      }));
      const datosVenta = {
        idResponsableVenta: usuario.id,
        descuentoPorcentaje: descuento,
        detalleProductos
      };
      console.log("Datos de la venta:", datosVenta);
      const resp = await finalizarSeleccionVentaServicio(datosVenta);
      if (!resp.estado) {
        setMensaje({ tipo: "error", texto: resp.mensaje || resp.detail || "No se pudo completar la venta" });
        setCargando(false);
        return;
      }
      console.log("Venta finalizada:", usuario);
      // Si es vendedor, actualizar ventas
      if (usuario.rol === "vendedor") {
        let vendedor=await buscarUsuarioServicio(usuario.id);
        console.log(vendedor.datos)
        let idVendedor = vendedor.datos.vendedor.idVendedor
        if( idVendedor ) {
          let enviar={
            idVendedor: idVendedor,
            idUsuario: usuario.id,
            totalVentas: total
          }
          await actualizarVendedorVentasServicio(idVendedor, enviar);
        }
      }
      setMensaje({ tipo: "exito", texto: `Venta registrada correctamente. Comprobante: ${formatoComprobante(resp.datos?.idVenta || resp.idVenta)}. Total: $${total}` });
      setMensajeFlotante({ tipo: "exito", texto: `Venta ${formatoComprobante(resp.datos?.idVenta || resp.idVenta)} registrada correctamente` });
      vaciarVenta();
      await obtenerVentas(usuario);
      setModo("lista");
    } catch (e) {
      setMensaje({ tipo: "error", texto: e.mensaje || e.detail || "No se pudo completar la venta" });
    }
    setCargando(false);
  };

  // Color de stock igual que en Productos.jsx
  const colorStock = (stock) => {
    if (stock > 50) return "bg-green-100 text-green-800";
    if (stock < 10) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  // DataTable columns for productos en la venta
  const columnasVenta = [
    { name: "ID", selector: row => row.idProducto, sortable: true, width: "70px" },
    { name: "Nombre", selector: row => row.nombre, sortable: true },
    {
      name: "Stock",
      cell: row => (
        <span className={clsx("font-bold px-2 py-1 rounded", colorStock(row.stock))}>{row.stock}</span>
      ),
      sortable: true,
    },
    {
      name: "Cantidad",
      cell: row => (
        <input
          type="number"
          min={1}
          max={row.stock}
          value={row.cantidad}
          onChange={e => cambiarCantidad(row.idProducto, Number(e.target.value))}
          className="border rounded px-2 py-1 w-16 text-black bg-gray-50 focus:ring focus:ring-blue-200"
          style={{ textAlign: 'center' }}
        />
      ),
      sortable: false,
    },
    {
      name: "Precio Unitario",
      cell: row => <span>$ {Number(row.precio).toFixed(2)}</span>,
      sortable: true,
    },
    {
      name: "Precio Total",
      cell: row => <span>$ {(row.precio * row.cantidad).toFixed(2)}</span>,
      sortable: false,
    },
    {
      name: "Acciones",
      cell: row => (
        <button
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          onClick={() => eliminarProductoVenta(row.idProducto)}
        >Eliminar</button>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  // DataTable columns for modal buscar productos
  const columnasBuscar = [
    { name: "ID", selector: row => row.idProducto, sortable: true, width: "70px" },
    { name: "Nombre", selector: row => row.nombre, sortable: true },
    { name: "Precio", cell: row => <span>$ {Number(row.precio).toFixed(2)}</span>, sortable: true },
    {
      name: "Stock",
      cell: row => (
        <span className={clsx("font-bold px-2 py-1 rounded", colorStock(row.stock))}>{row.stock}</span>
      ),
      sortable: true,
    },
    {
      name: "Añadir",
      cell: row => {
        const yaExiste = productosVenta.find(pv => pv.idProducto === row.idProducto);
        return (
          <button
            className={clsx("bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700", {
              "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500 border border-gray-400": yaExiste || row.stock <= 0
            })}
            disabled={yaExiste || row.stock <= 0}
            onClick={() => agregarProductoVenta(row)}
          >{yaExiste ? "Añadido" : "Añadir"}</button>
        );
      },
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <PlantillaBase
      componente={
        <>
          {/* Mensaje superior ancho completo */}
          {mensajeFlotante && (
            <div className={clsx(
              "fixed top-0 left-0 w-full z-[100] px-0 py-3 text-white text-lg font-bold text-center transition-all duration-500",
              {
                "bg-green-600 animate-fadeInDown": mensajeFlotante.tipo === "exito",
                "bg-red-600 animate-fadeInDown": mensajeFlotante.tipo === "error",
              }
            )}>
              {mensajeFlotante.texto}
            </div>
          )}
          {modo === "lista" ? (
            <main className="flex flex-col h-full w-full p-0 bg-gradient-to-br from-blue-50 to-white min-h-screen">
              <h1 className="text-3xl font-bold mb-4 text-center text-black drop-shadow">Gestión de Ventas</h1>
              {mensaje && (
                <div className={clsx("p-3 mb-4 rounded text-white text-center font-semibold shadow-lg", {
                  "bg-green-600": mensaje.tipo === "exito",
                  "bg-red-600": mensaje.tipo === "error",
                })}>{mensaje.texto}</div>
              )}
              <div className="flex flex-col flex-1 h-full w-full justify-center items-center">
                <section className="flex flex-col flex-1 w-full max-w-6xl bg-white border border-gray-200 rounded-lg shadow-lg p-8 m-0 h-full">
                  <div className="flex flex-row items-center justify-between mb-4 w-full gap-2">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 shadow"
                      onClick={() => { setModo("nueva"); vaciarVenta(); }}
                    >
                      Nueva Venta
                    </button>
                    <div className="flex flex-row gap-2 ml-auto">
                      <input
                        type="text"
                        placeholder="Buscar comprobante..."
                        value={filtro}
                        onChange={e => setFiltro(e.target.value)}
                        className="border rounded px-2 py-1 w-56"
                      />
                    </div>
                  </div>
                  <DataTable
                    columns={columnas}
                    data={filtro.trim() ? ventas.filter(v => formatoComprobante(v.idVenta).toLowerCase().includes(filtro.toLowerCase())) : ventas}
                    noDataComponent={<span className="text-gray-400">No hay ventas registradas</span>}
                    highlightOnHover
                    striped
                    dense
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 20, 50, 100]}
                    customStyles={{
                      headRow: { style: { background: '#f3f4f6', color: '#111', fontWeight: 700 } },
                      rows: { style: { color: '#222' } },
                    }}
                    fixedHeader
                    fixedHeaderScrollHeight="400px"
                  />
                </section>
              </div>
            </main>
          ) : (
            <main className="flex flex-col h-full w-full p-0 bg-gradient-to-br from-blue-50 to-white min-h-screen">
              <h1 className="text-3xl font-bold mb-4 text-center text-black drop-shadow">Nueva Venta</h1>
              {mensaje && (
                <div className={clsx("p-3 mb-4 rounded text-white text-center font-semibold shadow-lg", {
                  "bg-green-600": mensaje.tipo === "exito",
                  "bg-red-600": mensaje.tipo === "error",
                })}>{mensaje.texto}</div>
              )}
              <div className="flex flex-col flex-1 h-full w-full justify-center items-center">
                <section className="flex flex-col flex-1 w-full max-w-6xl bg-white border border-gray-200 rounded-lg shadow-lg p-8 m-0 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-black">Productos en la venta</h2>
                    <button
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
                      onClick={() => { setModalBuscar(true); setBusquedaModal(""); }}
                      title="Buscar productos"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                      </svg>
                      Buscar
                    </button>
                  </div>
                  <div className="mb-2" style={{ minHeight: 0 }}>
                    <DataTable
                      columns={columnasVenta}
                      data={productosVenta}
                      noDataComponent={<span className="text-gray-400">No hay productos añadidos</span>}
                      highlightOnHover
                      striped
                      dense
                      pagination
                      paginationPerPage={5}
                      paginationRowsPerPageOptions={[5, 10, 20, 50]}
                      customStyles={{
                        headRow: { style: { background: '#f3f4f6', color: '#111', fontWeight: 700, minHeight: 36, maxHeight: 40 } },
                        rows: { style: { color: '#222', minHeight: 32, maxHeight: 36, paddingTop: 2, paddingBottom: 2 } },
                        table: { style: { marginBottom: 0 } },
                      }}
                      fixedHeader
                      fixedHeaderScrollHeight="220px"
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-4 items-end">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black">Subtotal:</span>
                      <span className="text-black">$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black">Descuento (%):</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={descuento}
                        onChange={e => setDescuento(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-20 focus:ring focus:ring-blue-200 text-black"
                        style={{ textAlign: 'center' }}
                      />
                      <span className="text-black">(${descuentoValor.toFixed(2)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black">IVA (15%):</span>
                      <span className="text-black">$ {iva.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg">
                      <span className="font-bold text-black">Total:</span>
                      <span className="font-bold text-black">$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 mt-6 justify-end">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
                      onClick={confirmarVenta}
                      disabled={cargando}
                    >Confirmar Venta</button>
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 shadow"
                      onClick={vaciarVenta}
                      disabled={cargando}
                    >Vaciar Venta</button>
                    <button
                      className="bg-transparent border border-gray-700 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 shadow"
                      onClick={() => setModo("lista")}
                      disabled={cargando}
                    >Volver</button>
                  </div>
                </section>
                {/* Modal Buscar Productos */}
                {modalBuscar && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'transparent' }}>
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-3xl max-h-[60vh] flex flex-col justify-center items-center border border-gray-300">
                      <div className="flex items-center justify-between mb-4 w-full">
                        <h3 className="text-lg font-bold text-black">Buscar productos</h3>
                        <button className="text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setModalBuscar(false)}>&times;</button>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar por nombre"
                        value={busquedaModal}
                        onChange={e => setBusquedaModal(e.target.value)}
                        className="border rounded px-3 py-2 mb-3 focus:ring focus:ring-blue-200 text-black w-full"
                        autoFocus
                      />
                      <div className="flex-1 w-full overflow-y-auto border rounded-lg">
                        <DataTable
                          columns={columnasBuscar}
                          data={productosFiltradosModal}
                          noDataComponent={<span className="text-red-500 font-semibold">Cantidad insuficiente</span>}
                          highlightOnHover
                          striped
                          dense
                          pagination
                          paginationPerPage={5}
                          paginationRowsPerPageOptions={[5, 10, 20, 50]}
                          customStyles={{
                            headRow: { style: { background: '#f3f4f6', color: '#111', fontWeight: 700 } },
                            rows: { style: { color: '#222' } },
                          }}
                          fixedHeader
                          fixedHeaderScrollHeight="250px"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>
          )}

          {/* Modal resumen de venta seleccionada, overlay sobre la pantalla de comprobantes */}
          {ventaSeleccionada && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Fondo overlay */}
              <div className="absolute inset-0 bg-black" style={{ opacity: 0.3 }} onClick={() => setVentaSeleccionada(null)}></div>
              {/* Modal centrado */}
              <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-300 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-black">Resumen de Venta</h3>
                  <button className="text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setVentaSeleccionada(null)}>&times;</button>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div><span className="font-semibold">Comprobante:</span> {formatoComprobante(ventaSeleccionada.idVenta)}</div>
                  <div>
                    <span className="font-semibold">Fecha:</span> {ventaSeleccionada.fecha ? ventaSeleccionada.fecha.split('T')[0] : ''}
                    {ventaSeleccionada.fecha && (
                      <>
                        <span className="font-semibold ml-4">Hora:</span> {ventaSeleccionada.fecha.split('T')[1]?.substring(0,5) || ''}
                      </>
                    )}
                  </div>
                  <div><span className="font-semibold">Vendedor:</span> <VendedorNombre idUsuario={ventaSeleccionada.idResponsableVenta} /></div>
                  <div><span className="font-semibold">Estado:</span> <span className={clsx("font-bold px-2 py-1 rounded", {
                    "bg-green-100 text-green-800": ventaSeleccionada.estado === "Confirmada",
                    "bg-red-100 text-red-800": ventaSeleccionada.estado === "Anulada",
                  })}>{ventaSeleccionada.estado}</span></div>
                  <div><span className="font-semibold">Subtotal:</span> $ {Number(ventaSeleccionada.subtotal).toFixed(2)}</div>
                  <div><span className="font-semibold">Descuento:</span> {ventaSeleccionada.descuentoPorcentaje}% (${Number(ventaSeleccionada.valorDescuento).toFixed(2)})</div>
                  <div><span className="font-semibold">IVA:</span> $ {Number(ventaSeleccionada.valorIva).toFixed(2)}</div>
                  <div><span className="font-semibold">Total:</span> <span className="font-bold">$ {Number(ventaSeleccionada.total).toFixed(2)}</span></div>
                </div>
                <div className="mb-2 mt-2">
                  <span className="font-semibold text-lg">Detalle de productos:</span>
                  <table className="w-full mt-2 border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 py-1">Producto</th>
                        <th className="border px-2 py-1">Cantidad</th>
                        <th className="border px-2 py-1">Precio Unitario</th>
                        <th className="border px-2 py-1">IVA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventaSeleccionada.detalles && ventaSeleccionada.detalles.map((d, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1 text-center">{nombresProductosResumen[d.idProducto] || d.idProducto}</td>
                          <td className="border px-2 py-1 text-center">{d.cantidadVenta}</td>
                          <td className="border px-2 py-1 text-center">$ {Number(d.precioUnitarioVenta).toFixed(2)}</td>
                          <td className="border px-2 py-1 text-center">{d.tieneIva ? 'Sí' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      }
    />
  );
}