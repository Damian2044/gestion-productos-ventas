
import { useState, useEffect } from "react";
import { obtenerProductoPorIdServicio } from "@/servicios/servicioProducto";
import PlantillaBase from "@/componentes/PlantillaBase.jsx";
import { FiBarChart2, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { obtenerReporteServicio } from "@/servicios/servicioReportes";
import DataTable from "react-data-table-component";

export default function Reportes() {
  const [reporte, setReporte] = useState("totales"); // totales | mayorDia | productoDia
  const [fecha, setFecha] = useState("");
  const [semana, setSemana] = useState(""); // formato yyyy-Www
  const [fechaProducto, setFechaProducto] = useState("");
  const [resumen, setResumen] = useState(null);
  const [tabla, setTabla] = useState([]);
  const [resumenSemana, setResumenSemana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setResumen(null);
    setTabla([]);
    setResumenSemana([]);
    let body = {};
    if (reporte === "totales") {
      if (fecha) {
        body = { tipo: "ventasEnUnDia", fecha };
      } else {
        body = { tipo: "ventasTotales" };
      }
    } else if (reporte === "mayorDia") {
      // Si hay semana seleccionada, calcular fecha del lunes y enviar body correcto
      if (semana) {
        // semana formato yyyy-Www
        const [year, week] = semana.split('-W');
        // Calcular fecha del lunes de esa semana
        const simple = new Date(year, 0, 1 + (parseInt(week) - 1) * 7);
        const dow = simple.getDay();
        const monday = new Date(simple);
        if (dow <= 4) {
          monday.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
          monday.setDate(simple.getDate() + 8 - simple.getDay());
        }
        const fechaLunes = monday.toISOString().slice(0, 10);
        body = { tipo: "ventasEnSemanaSeleccionada", fecha: fechaLunes };
      } else {
        body = { tipo: "mayorDia" };
      }
    } else if (reporte === "productoDia") {
      if (fechaProducto) {
        body = { tipo: "productoMasVendidoEnDia", fecha: fechaProducto };
      } else {
        body = { tipo: "productoDia" };
      }
    }
    if (reporte === "mayorDia" && !semana) {
      setLoading(false);
      return;
    }
    obtenerReporteServicio(body)
      .then((data) => {
        if (reporte === "totales" && data.datos) {
          if (fecha) {
            setResumen({ titulo: `Ventas del día ${fecha}`, valor: `$${Number(data.datos.sumaTotal).toFixed(2)}` });
          } else {
            setResumen({ titulo: "Total ventas registradas", valor: `$${Number(data.datos.sumaTotal).toFixed(2)}` });
          }
          setTabla(data.datos.ventas || []);
        } else if (reporte === "mayorDia" && data.datos) {
          // Ordenar resumenSemana de mayor a menor total
          const resumenSemana = (data.datos.resumenSemana || []).slice().sort((a, b) => b.total - a.total);
          setResumen({ titulo: `Ventas de la semana`, valor: '' });
          setResumenSemana(resumenSemana);
          setTabla(data.datos.ventasSemana || []);
        } else if (reporte === "productoDia" && data.datos && data.datos.rankingProductos) {
          setResumen({ titulo: data.mensaje || "Ranking productos vendidos", fecha: fechaProducto });
          // Ordenar de mayor a menor por totalVendido
          const rankingOrdenado = data.datos.rankingProductos.slice().sort((a, b) => b.totalVendido - a.totalVendido);
          // Obtener nombres de productos
          Promise.all(
            rankingOrdenado.map(async (p, idx) => {
              try {
                const prod = await obtenerProductoPorIdServicio(p.idProducto);
                return {
                  puesto: idx + 1,
                  idProducto: p.idProducto,
                  nombre: prod.datos?.nombre || `ID ${p.idProducto}`,
                  totalVendido: p.totalVendido
                };
              } catch {
                return {
                  puesto: idx + 1,
                  idProducto: p.idProducto,
                  nombre: `ID ${p.idProducto}`,
                  totalVendido: p.totalVendido
                };
              }
            })
          ).then(setTabla);
        } else {
          setResumen(data.resumen || null);
          setTabla(data.tabla || []);
        }
      })
      .catch((err) => {
        setError(err?.detail || "Error al obtener reporte");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [reporte, semana, fechaProducto, fecha]);

  return (
    <PlantillaBase
      componente={
        <main className="flex flex-col h-full w-full p-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Reportes de Ventas</h1>

          {/* Botones de selección de reporte */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded font-semibold flex items-center gap-2 border transition-colors duration-150 ${reporte === "totales" ? "bg-blue-600 text-white border-blue-700" : "bg-white text-blue-700 border-blue-400 hover:bg-blue-50"}`}
              onClick={() => setReporte("totales")}
            >
              <FiBarChart2 size={22} /> Ventas Totales
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold flex items-center gap-2 border transition-colors duration-150 ${reporte === "mayorDia" ? "bg-green-600 text-white border-green-700" : "bg-white text-green-700 border-green-400 hover:bg-green-50"}`}
              onClick={() => setReporte("mayorDia")}
            >
              <FiTrendingUp size={22} /> Día con Mayores Ventas (Semana)
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold flex items-center gap-2 border transition-colors duration-150 ${reporte === "productoDia" ? "bg-yellow-500 text-white border-yellow-700" : "bg-white text-yellow-700 border-yellow-400 hover:bg-yellow-50"}`}
              onClick={() => setReporte("productoDia")}
            >
              <FiCalendar size={22} /> Producto más vendido en un Día
            </button>
          </div>

          {/* Selectores según reporte */}
          {reporte === "totales" && (
            <div className="flex justify-center mb-6 gap-2 items-center">
              <label className="font-medium">Seleccionar día:</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="border rounded px-2 py-1"
                max={new Date().toISOString().split("T")[0]}
              />
              {fecha && (
                <button
                  className="ml-2 px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setFecha("")}
                >
                  Todas
                </button>
              )}
            </div>
          )}
          {reporte === "semana" && (
            <div className="flex justify-center mb-6 gap-2 items-center">
              <label className="font-medium">Selecciona el lunes de la semana:</label>
              <input
                type="date"
                value={fechaLunes}
                onChange={e => setFechaLunes(e.target.value)}
                className="border rounded px-2 py-1"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}
          {reporte === "mayorDia" && (
            <div className="flex justify-center mb-6 gap-2 items-center">
              <label htmlFor="semana" className="font-medium">Selecciona una semana:</label>
              <input
                type="week"
                id="semana"
                name="semana"
                value={semana}
                onChange={e => setSemana(e.target.value)}
                className="border rounded px-2 py-1"
                max={(() => { const d = new Date(); return d.toISOString().slice(0, 7) + '-W' + String(Math.ceil((((d - new Date(d.getFullYear(),0,1)) / 86400000) + new Date(d.getFullYear(),0,1).getDay()+1)/7)).padStart(2,'0'); })()}
              />
            </div>
          )}
          {reporte === "productoDia" && (
            <div className="flex justify-center mb-6 gap-2 items-center">
              <label className="font-medium">Seleccionar día:</label>
              <input
                type="date"
                value={fechaProducto}
                onChange={(e) => setFechaProducto(e.target.value)}
                className="border rounded px-2 py-1"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          {/* Resumen inicial */}
          {reporte === "totales" && resumen && (
            <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex items-center gap-4 max-w-md mx-auto mb-8">
              <FiBarChart2 size={32} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">{resumen.titulo}</p>
                <p className="text-3xl font-semibold">{resumen.valor}</p>
              </div>
            </div>
          )}
          {reporte === "semana" && resumen && (
            <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex flex-col gap-2 max-w-2xl mx-auto mb-8">
              <FiBarChart2 size={32} className="text-purple-600 mb-2" />
              <div>
                <p className="text-sm text-gray-500">{resumen.titulo}</p>
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full text-sm border rounded">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border">Día</th>
                        <th className="px-3 py-2 border">Fecha</th>
                        <th className="px-3 py-2 border">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenSemana.map((d, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 border">{d.dia}</td>
                          <td className="px-3 py-2 border">{d.fecha}</td>
                          <td className="px-3 py-2 border">${Number(d.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {reporte === "mayorDia" && resumen && (() => {
            if (!resumenSemana || resumenSemana.length === 0) {
              return (
                <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 flex flex-col items-center max-w-2xl mx-auto mb-8">
                  <span className="text-lg text-gray-700 font-semibold">No hay datos para la semana seleccionada.</span>
                </div>
              );
            }
            // Días de la semana en español
            const diasEspanol = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            // Buscar el día con mayor total (puede no ser el primero si hay empate o datos desordenados)
            let diaMasVendido = resumenSemana[0];
            for (const d of resumenSemana) {
              if (Number(d.total) > Number(diaMasVendido.total)) diaMasVendido = d;
            }
            // Traducir el día a español si es posible
            const diaMasVendidoNombre = (() => {
              if (diaMasVendido.fecha) {
                const date = new Date(diaMasVendido.fecha);
                return diasEspanol[date.getDay()];
              }
              return diaMasVendido.dia;
            })();
            return (
              <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex flex-col gap-2 max-w-2xl mx-auto mb-8">
                {/* Cuadro del día más vendido, sin icono */}
                <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg flex flex-col items-center">
                  <span className="font-semibold text-green-800 text-lg">Día más vendido de la semana:</span>
                  <span className="text-xl font-bold text-green-900 mt-1">{diaMasVendidoNombre} {diaMasVendido.fecha}</span>
                  <span className="text-2xl font-extrabold text-green-700 mt-1">${Number(diaMasVendido.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {semana ? (() => {
                      const [year, week] = semana.split('-W');
                      const simple = new Date(year, 0, 1 + (parseInt(week) - 1) * 7);
                      const dow = simple.getDay();
                      const monday = new Date(simple);
                      if (dow <= 4) {
                        monday.setDate(simple.getDate() - simple.getDay() + 1);
                      } else {
                        monday.setDate(simple.getDate() + 8 - simple.getDay());
                      }
                      return `Ventas de la semana del ${monday.toISOString().slice(0, 10)}`;
                    })() : 'Ventas de la semana'}
                  </p>
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full text-sm border rounded">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 border">Día</th>
                          <th className="px-3 py-2 border">Fecha</th>
                          <th className="px-3 py-2 border">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumenSemana.map((d, idx) => {
                          let diaNombre = d.dia;
                          if (d.fecha) {
                            const date = new Date(d.fecha);
                            diaNombre = diasEspanol[date.getDay()];
                          }
                          return (
                            <tr key={idx}>
                              <td className="px-3 py-2 border">{diaNombre}</td>
                              <td className="px-3 py-2 border">{d.fecha}</td>
                              <td className="px-3 py-2 border">${Number(d.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
          {reporte === "productoDia" && resumen && (
            <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 flex flex-col gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center gap-4">
                <FiCalendar size={32} className="text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500">{resumen.titulo}</p>
                  {resumen.fecha && <p className="text-base text-gray-700">{resumen.fecha}</p>}
                </div>
              </div>
              {/* Recuadro del producto más vendido */}
              {tabla.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex flex-col items-center">
                  <span className="font-semibold text-yellow-800 text-lg">Producto más vendido:</span>
                  <span className="text-xl font-bold text-yellow-900 mt-1">{tabla[0].nombre}</span>
                  <span className="text-lg text-yellow-700 mt-1">Unidades: <span className="font-bold">{tabla[0].totalVendido}</span></span>
                </div>
              )}
              {tabla.length > 0 ? (
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full text-sm border rounded">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border">#</th>
                        <th className="px-3 py-2 border">Producto</th>
                        <th className="px-3 py-2 border">Total Vendido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabla.map((p, idx) => (
                        <tr key={p.idProducto}>
                          <td className="px-3 py-2 border text-center">{p.puesto}</td>
                          <td className="px-3 py-2 border text-center">{p.nombre}</td>
                          <td className="px-3 py-2 border text-center">{p.totalVendido}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 font-semibold py-8">No hay datos para este día.</div>
              )}
            </div>
          )}

          {/* Tabla de ventas o resumen */}
          <div className="flex justify-center items-start mt-2">
            <div className="w-full max-w-4xl min-h-[320px] bg-white rounded-lg shadow-lg p-2 overflow-auto">
              {reporte === "totales" && (
                tabla.length > 0 ? (
                  <DataTable
                    columns={[ 
                      { name: "Fecha", selector: row => row.fecha?.slice(0,10), sortable: true },
                      { name: "Hora", selector: row => row.fecha?.slice(11,19), sortable: true },
                      { name: "Total", selector: row => `$${Number(row.total).toFixed(2)}`, sortable: true },
                    ]}
                    data={tabla}
                    pagination
                    highlightOnHover
                    striped
                    customStyles={{
                      table: { style: { minWidth: '100%' } },
                      rows: { style: { minHeight: '48px', fontSize: '1.08rem' } },
                      headCells: { style: { paddingLeft: '18px', paddingRight: '18px', fontWeight: 700, fontSize: '1.1rem' } },
                      cells: { style: { paddingLeft: '18px', paddingRight: '18px' } },
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500 font-semibold py-8">No hay ventas para este día.</div>
                )
              )}
              {reporte === "ventasDia" && (
                tabla.length > 0 ? (
                  <DataTable
                    columns={[ 
                      { name: "Fecha", selector: row => row.fecha?.slice(0,10), sortable: true },
                      { name: "Hora", selector: row => row.fecha?.slice(11,19), sortable: true },
                      { name: "Total", selector: row => `$${Number(row.total).toFixed(2)}`, sortable: true },
                    ]}
                    data={tabla}
                    pagination
                    highlightOnHover
                    striped
                    customStyles={{
                      table: { style: { minWidth: '100%' } },
                      rows: { style: { minHeight: '48px', fontSize: '1.08rem' } },
                      headCells: { style: { paddingLeft: '18px', paddingRight: '18px', fontWeight: 700, fontSize: '1.1rem' } },
                      cells: { style: { paddingLeft: '18px', paddingRight: '18px' } },
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500 font-semibold py-8">No hay ventas para este día.</div>
                )
              )}
              {reporte === "semana" && tabla.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2 mt-4">Ventas de la semana</h3>
                  <DataTable
                    columns={[ 
                      { name: "Fecha", selector: row => row.fecha?.slice(0,10), sortable: true },
                      { name: "Hora", selector: row => row.fecha?.slice(11,19), sortable: true },
                      { name: "Total", selector: row => `$${Number(row.total).toFixed(2)}`, sortable: true },
                    ]}
                    data={tabla}
                    pagination
                    highlightOnHover
                    striped
                    customStyles={{
                      table: { style: { minWidth: '100%' } },
                      rows: { style: { minHeight: '48px', fontSize: '1.08rem' } },
                      headCells: { style: { paddingLeft: '18px', paddingRight: '18px', fontWeight: 700, fontSize: '1.1rem' } },
                      cells: { style: { paddingLeft: '18px', paddingRight: '18px' } },
                    }}
                  />
                </>
              )}
              {reporte === "mayorDia" && (
                tabla.length > 0 ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2 mt-4">Ventas de la semana</h3>
                    <DataTable
                      columns={[ 
                        { name: "Fecha", selector: row => row.fecha?.slice(0,10), sortable: true },
                        { name: "Hora", selector: row => row.fecha?.slice(11,19), sortable: true },
                        { name: "Total", selector: row => `$${Number(row.total).toFixed(2)}`, sortable: true },
                      ]}
                      data={tabla}
                      pagination
                      highlightOnHover
                      striped
                      customStyles={{
                        table: { style: { minWidth: '100%' } },
                        rows: { style: { minHeight: '48px', fontSize: '1.08rem' } },
                        headCells: { style: { paddingLeft: '18px', paddingRight: '18px', fontWeight: 700, fontSize: '1.1rem' } },
                        cells: { style: { paddingLeft: '18px', paddingRight: '18px' } },
                      }}
                    />
                  </>
                ) : (
                  <div className="text-center text-gray-500 font-semibold py-8">No hay datos para la semana seleccionada.</div>
                )
              )}
              {/* Eliminada la tabla DataTable de productos al final para evitar mostrar NaN */}
            </div>
          </div>
        </main>
      }
    />
  );
}