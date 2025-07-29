import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function RutaProtegida({ children, ruta }) {
  const [verificando, setVerificando]=useState(true)
  const [accesoPermitido, setAccesoPermitido]=useState(false)
  const location=useLocation()

  useEffect(() => {
    const isLoggedIn=sessionStorage.getItem('logeado')==='true'
    const rutasString=sessionStorage.getItem('rutas')
    //console.log(typeof rutasString)
    const rutas = rutasString ? JSON.parse(rutasString) : []
    //console.log('Rutas disponibles:', rutas)

    if (!isLoggedIn) {
      setAccesoPermitido(false)
    } else {
      setAccesoPermitido(rutas.includes(ruta))
    }

    setVerificando(false)
  }, [location, ruta])

  if (verificando) {
    return (
      //<div className="flex flex-col items-center justify-center h-screen bg-white">
      //  <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      //  <p className="mt-4 text-blue-600 font-semibold text-lg">Cargando...</p>
      //</div>
      <></>
    )
  }

  return accesoPermitido ? children : <Navigate to="/login" replace />
}
