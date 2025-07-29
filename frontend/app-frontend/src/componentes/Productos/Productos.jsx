

import PlantillaBase from "@/componentes/PlantillaBase";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import DataTable from "react-data-table-component";
import clsx from "clsx";
import {
  listarProductosServicio,
  crearProductoServicio,
  actualizarProductoServicio,
  eliminarProductoServicio,
  listarCategoriasServicio,
} from "@/servicios/servicioProducto";
import { actualizarAdministradorProductosServicio } from "@/servicios/servicioUsuarios";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [modo, setModo] = useState("lista"); // lista | crear | actualizar | ver
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      stock: "",
      tieneIva: false,
      estado: "activo",
    },
  });

  const obtenerProductos = async () => {
    try {
      const resp = await listarProductosServicio();
      if (resp.estado) setProductos(resp.datos);
      else setProductos([]);
    } catch (e) {
      setProductos([]);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const resp = await listarCategoriasServicio();
      if (resp.estado) setCategorias(resp.datos);
      else setCategorias([]);
    } catch (e) {
      setCategorias([]);
    }
  };

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
    const intervalo = setInterval(() => {
      obtenerProductos();
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const productosFiltrados = filtro.trim()
    ? productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          p.descripcion?.toLowerCase().includes(filtro.toLowerCase())
      )
    : productos;

  const abrirCrear = () => {
    setModo("crear");
    setProductoSeleccionado(null);
    reset({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      stock: "",
      tieneIva: false,
      estado: "activo",
    });
  };

  const abrirActualizar = (producto) => {
    setModo("actualizar");
    setProductoSeleccionado(producto);
    reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      tieneIva: producto.tieneIva,
      estado: producto.estado,
    });
  };

  const abrirVer = (producto) => {
    setModo("ver");
    setProductoSeleccionado(producto);
  };

  const validarCampos = (datos, esActualizar = false) => {
    const errores = {};
    if (!esActualizar && !datos.nombre?.trim()) errores.nombre = "Nombre requerido";
    if (!datos.descripcion?.trim()) errores.descripcion = "Descripción obligatoria";
    if (!datos.categoria) errores.categoria = "Categoría requerida";
    if (datos.precio === "" || isNaN(Number(datos.precio)) || Number(datos.precio) < 0)
      errores.precio = "Precio no válido (debe ser mayor o igual a 0)";
    if (datos.stock === "" || isNaN(Number(datos.stock)) || Number(datos.stock) < 0)
      errores.stock = "Stock no válido (debe ser mayor o igual a 0)";
    return errores;
  };

  const onSubmitCrear = async (datos) => {
    const errores = validarCampos(datos);
    if (Object.keys(errores).length) {
      for (const campo in errores) setError(campo, { type: "manual", message: errores[campo] });
      return;
    }
    try {
      const resp = await crearProductoServicio({
        ...datos,
        precio: Number(datos.precio),
        stock: Number(datos.stock),
      });
      if (!resp.estado) {
        let mensajeError = resp.detail || resp.mensaje || "";
        setMensaje({ tipo: "error", texto: mensajeError });
        return;
      }
      // Actualizar productos creados para el administrador
      try {
        const datosUsuario = JSON.parse(sessionStorage.getItem('datosUsuario'));
        if (datosUsuario?.id) {
          await actualizarAdministradorProductosServicio(datosUsuario.id, 1);
        }
      } catch (e) { /* opcional: manejar error */ }
      setMensaje({ tipo: "exito", texto: `Producto ${datos.nombre} creado correctamente` });
      await obtenerProductos();
      setModo("lista");
    } catch (error) {
      let mensajeError = error?.detail || error?.mensaje || error?.message || "Error";
      setMensaje({ tipo: "error", texto: mensajeError });
    }
  };

  const onSubmitActualizar = async (datos) => {
    const errores = validarCampos(datos, true);
    if (Object.keys(errores).length) {
      for (const campo in errores) setError(campo, { type: "manual", message: errores[campo] });
      return;
    }
    console.log('Datos a actualizar:', datos);
    try {
     
      const resp = await actualizarProductoServicio(productoSeleccionado.idProducto, {
        ...datos,
        nombre: productoSeleccionado.nombre, 
        precio: Number(datos.precio),
        stock: Number(datos.stock),
      });

      console.log('Respuesta de actualización:', resp);
      if (!resp.estado) {
        let mensajeError = resp.detail || resp.mensaje || "";
        setMensaje({ tipo: "error", texto: mensajeError });
        return;
      }
      setMensaje({ tipo: "exito", texto: `Producto ${productoSeleccionado.nombre} actualizado correctamente` });
      await obtenerProductos();
      setModo("lista");
    } catch (error) {
      let mensajeError = error?.detail || error?.mensaje || error?.message || "Error";
      setMensaje({ tipo: "error", texto: mensajeError });
    }
  };

  const deshabilitarProducto = async (producto) => {
    if (producto.estado !== "activo") return;
    try {
      const resp = await eliminarProductoServicio(producto.idProducto);
      if (!resp.estado) {
        let mensajeError = resp.detail || resp.mensaje || "";
        setMensaje({ tipo: "error", texto: mensajeError });
        return;
      }
      setMensaje({ tipo: "exito", texto: `Producto ${producto.nombre} deshabilitado correctamente` });
      await obtenerProductos();
    } catch (error) {
      let mensajeError = error?.detail || error?.mensaje || error?.message || "Error";
      setMensaje({ tipo: "error", texto: mensajeError });
    }
  };

  const colorStock = (stock) => {
    if (stock > 50) return "bg-green-100 text-green-800";
    if (stock < 10) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const columnas = [
    {
      name: "ID",
      selector: (row) => row.idProducto,
      sortable: true,
      width: "70px",
    },
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
    },
    {
      name: "Categoría",
      selector: (row) => row.categoria,
      sortable: true,
    },
    {
      name: "Precio",
      cell: (row) => <span>$ {Number(row.precio).toFixed(2)}</span>,
      sortable: true,
    },
    {
      name: "Stock",
      cell: (row) => (
        <span className={clsx("font-bold px-2 py-1 rounded", colorStock(row.stock))}>{row.stock}</span>
      ),
      sortable: true,
    },
    {
      name: "Ver",
      cell: (row) => (
        <button
          className="bg-gray-300 px-3 py-1 rounded shadow hover:bg-gray-400 transition-colors duration-150"
          onClick={() => abrirVer(row)}
          style={{ minWidth: 80 }}
        >
          Ver
        </button>
      ),
      style: { minWidth: 90, maxWidth: 110, textAlign: 'center' },
      ignoreRowClick: true,
      button: true,
    },
    {
      name: "Actualizar",
      cell: (row) => (
        <button
          className="bg-yellow-300 px-3 py-1 rounded shadow hover:bg-yellow-400 transition-colors duration-150"
          onClick={() => abrirActualizar(row)}
          style={{ minWidth: 90 }}
        >
          Actualizar
        </button>
      ),
      style: { minWidth: 110, maxWidth: 130, textAlign: 'center' },
      ignoreRowClick: true,
      button: true,
    },
    {
      name: "Eliminar",
      cell: (row) => (
        row.estado === "activo" ? (
          <button
            className="bg-red-400 px-3 py-1 rounded shadow hover:bg-red-500 text-white transition-colors duration-150"
            onClick={() => deshabilitarProducto(row)}
            style={{ minWidth: 110 }}
          >
            Deshabilitar
          </button>
        ) : (
          <button
            className="bg-gray-300 px-3 py-1 rounded shadow text-gray-400 cursor-not-allowed"
            disabled
            style={{ minWidth: 110 }}
          >
            Deshabilitado
          </button>
        )
      ),
      style: { minWidth: 120, maxWidth: 140, textAlign: 'center' },
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <PlantillaBase
      componente={
        <main className="flex flex-col h-full w-full p-4">
          <h1 className="text-3xl font-bold mb-4 text-center">Gestión de Productos</h1>

          {mensaje && (
            <div
              className={clsx("p-3 mb-4 rounded text-white text-center font-semibold", {
                "bg-green-600": mensaje.tipo === "exito",
                "bg-red-600": mensaje.tipo === "error",
              })}
            >
              {mensaje.texto}
            </div>
          )}

          {modo === "lista" && (
            <>
              <div className="flex justify-between mb-3">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={abrirCrear}
                >
                  Crear Producto
                </button>
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="border rounded px-2 py-1 w-72"
                  autoFocus
                />
              </div>

              <div className="flex-grow">
                {productosFiltrados.length === 0 ? (
                  <p className="text-center mt-10 font-semibold text-gray-500">
                    No se encontraron productos
                  </p>
                ) : (
                  <DataTable
                    columns={columnas}
                    data={productosFiltrados}
                    pagination
                    highlightOnHover
                    striped
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 180px)"
                  />
                )}
              </div>
            </>
          )}

          {(modo === "crear" || modo === "actualizar") && (
            <form
              onSubmit={handleSubmit(modo === "crear" ? onSubmitCrear : onSubmitActualizar)}
              className="w-full max-w-2xl mx-auto p-8 flex flex-col gap-4"
              noValidate
            >
              <h2 className="text-2xl font-semibold mb-3">
                {modo === "crear" ? "Crear Producto" : "Actualizar Producto"}
              </h2>

              <label className="font-medium">Nombre</label>
              <input
                {...register("nombre")}
                className={clsx("border rounded px-3 py-2", {
                  "border-red-600 bg-red-50": errors.nombre,
                })}
                type="text"
                autoFocus
                disabled={modo === "actualizar"}
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm">{errors.nombre.message}</p>
              )}

              <label className="font-medium">Descripción</label>
              <textarea
                {...register("descripcion")}
                className={clsx("border rounded px-3 py-2 resize-none min-h-[60px]", {
                  "border-red-600 bg-red-50": errors.descripcion,
                })}
                rows={3}
              />
              {errors.descripcion && (
                <p className="text-red-600 text-sm">{errors.descripcion.message}</p>
              )}

              <label className="font-medium">Categoría</label>
              <select
                {...register("categoria")}
                className={clsx("border rounded px-3 py-2", {
                  "border-red-600 bg-red-50": errors.categoria,
                })}
              >
                <option value="">Seleccione...</option>
                {categorias.map((cat) => (
                  <option key={cat.idCategoria} value={cat.nombreCategoria}>
                    {cat.nombreCategoria}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-red-600 text-sm">{errors.categoria.message}</p>
              )}

              <label className="font-medium">Precio ($)</label>
              <input
                {...register("precio")}
                className={clsx("border rounded px-3 py-2", {
                  "border-red-600 bg-red-50": errors.precio,
                })}
                type="number"
                min="0"
                step="0.01"
                placeholder="$"
              />
              {errors.precio && (
                <p className="text-red-600 text-sm">{errors.precio.message}</p>
              )}

              <label className="font-medium">Stock</label>
              <input
                {...register("stock")}
                className={clsx("border rounded px-3 py-2", {
                  "border-red-600 bg-red-50": errors.stock,
                })}
                type="number"
                min="0"
              />
              {errors.stock && (
                <p className="text-red-600 text-sm">{errors.stock.message}</p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  {...register("tieneIva")}
                  id="tieneIva"
                  className="w-4 h-4"
                />
                <label htmlFor="tieneIva" className="select-none">
                  Tiene IVA
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModo("lista")}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  {modo === "crear" ? "Guardar" : "Actualizar"}
                </button>
              </div>
            </form>
          )}

          {modo === "ver" && productoSeleccionado && (
            <section className="w-full max-w-2xl mx-auto p-8 rounded-lg shadow-lg bg-white border border-gray-200" style={{ marginTop: 24 }}>
              <h2 className="text-2xl font-semibold mb-4 text-center">Resumen de Producto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Nombre</label>
                  <input
                    value={productoSeleccionado.nombre}
                    readOnly
                    className="border rounded px-3 py-2 bg-gray-100 w-full"
                  />
                </div>
                <div>
                  <label className="font-medium">Descripción</label>
                  <textarea
                    value={productoSeleccionado.descripcion}
                    readOnly
                    className="border rounded px-3 py-2 bg-gray-100 w-full resize-none min-h-[60px]"
                  />
                </div>
                <div>
                  <label className="font-medium">Categoría</label>
                  <input
                    value={productoSeleccionado.categoria}
                    readOnly
                    className="border rounded px-3 py-2 bg-gray-100 w-full"
                  />
                </div>
                <div>
                  <label className="font-medium">Precio ($)</label>
                  <input
                    value={`$ ${Number(productoSeleccionado.precio).toFixed(2)}`}
                    readOnly
                    className={clsx("border rounded px-3 py-2 w-full", {
                      "bg-green-100 text-green-800 font-bold": productoSeleccionado.precio > 50,
                      "bg-yellow-100 text-yellow-800 font-bold": productoSeleccionado.precio <= 50 && productoSeleccionado.precio >= 10,
                    })}
                  />
                </div>
                <div>
                  <label className="font-medium">Stock</label>
                  <input
                    value={productoSeleccionado.stock}
                    readOnly
                    className={clsx("border rounded px-3 py-2 w-full", colorStock(productoSeleccionado.stock))}
                  />
                </div>
                <div>
                  <label className="font-medium">Tiene IVA</label>
                  <input
                    value={productoSeleccionado.tieneIva ? "Sí" : "No"}
                    readOnly
                    className="border rounded px-3 py-2 bg-gray-100 w-full"
                  />
                </div>
                <div>
                  <label className="font-medium">Estado</label>
                  <input
                    value={productoSeleccionado.estado}
                    readOnly
                    className={clsx("border rounded px-3 py-2 w-full", {
                      "bg-green-100 text-green-800 font-bold": productoSeleccionado.estado === "activo",
                      "bg-red-100 text-red-800 font-bold": productoSeleccionado.estado !== "activo",
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setModo("lista")}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Volver
                </button>
              </div>
            </section>
          )}
        </main>
      }
    />
  );
}