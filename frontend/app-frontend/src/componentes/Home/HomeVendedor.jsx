

import { useEffect, useState } from "react";
import PlantillaBase from "@/componentes/PlantillaBase.jsx";
import { buscarUsuarioServicio } from "@/servicios/servicioUsuarios";
import { FiDollarSign, FiCalendar, FiClock } from "react-icons/fi";

export default function HomeVendedor() {
  const [fechaActual, setFechaActual] = useState("");
  const [horaActual, setHoraActual] = useState("");
  const [totalVentas, setTotalVentas] = useState(null);
  const [nombreVendedor, setNombreVendedor] = useState("");

  useEffect(() => {
    // Fecha actual fija con zona horaria Ecuador
    const ahora = new Date();
    setFechaActual(
      ahora.toLocaleDateString("es-EC", {
        timeZone: "America/Guayaquil",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    // Actualizar hora cada segundo con zona horaria Ecuador
    const intervalo = setInterval(() => {
      const ahoraHora = new Date();
      setHoraActual(
        ahoraHora.toLocaleTimeString("es-EC", {
          timeZone: "America/Guayaquil",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    // Obtener totalVentas y nombre del vendedor
    async function fetchVendedor() {
      try {
        const datosUsuarioStr = sessionStorage.getItem("datosUsuario");
        if (datosUsuarioStr) {
          const datosUsuario = JSON.parse(datosUsuarioStr);
          const resp = await buscarUsuarioServicio(datosUsuario.id);
          if (resp.estado && resp.datos && resp.datos.vendedor) {
            setTotalVentas(resp.datos.vendedor.totalVentas ?? 0);
            setNombreVendedor(resp.datos.nombreCompleto ?? "");
          } else {
            setTotalVentas(0);
            setNombreVendedor("");
          }
        }
      } catch (e) {
        setTotalVentas(0);
        setNombreVendedor("");
      }
    }
    fetchVendedor();

    return () => clearInterval(intervalo);
  }, []);

  return (
    <PlantillaBase
      componente={
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Bienvenido al panel de vendedor</h1>
          </div>

          {/* Fecha y hora arriba, igual que HomeAdmin */}
          <div className="flex justify-center gap-10 mb-10 text-indigo-700 font-semibold text-lg">
            <div className="flex items-center gap-2">
              <FiCalendar size={28} />
              <span>{fechaActual || "Cargando..."}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock size={28} />
              <span>{horaActual || "Cargando..."}</span>
            </div>
          </div>

          {/* Solo la tarjeta de Total Ventas Registradas, con icono y estilos HomeAdmin */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
            <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition duration-300 flex items-center gap-4 min-h-[100px]">
              <div className="flex-shrink-0">
                <FiDollarSign size={32} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 break-words leading-tight">Total Ventas Registradas</p>
                <p className="text-3xl font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis">
                  {totalVentas !== null ? `$${Number(totalVentas).toFixed(2)}` : "Cargando..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
