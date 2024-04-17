import { useState } from "react"
import "../assets/style.css"

export function Project() {
  /*Estado para mostrar u ocultar*/
  const [mostrarComponente, setMostrarComponente] = useState(true);
  return (
    <>
    <div>
      {/*Con un estado adicional le dicen cuando mostrarse o no*/}
      <button onClick={() => setMostrarComponente(!mostrarComponente)}>
        {/*Aqui solo cambio el texto de mi boton, para el ejemplo */}
        {mostrarComponente ? `Ocultar` : `Mostrar`}
      </button>
      <div className={mostrarComponente ? "show-element" : null}>
        {mostrarComponente && 
        <div>
        <video src="../../public/demo-coming-gigs-new.mp4"></video>
        </div>
        }
      </div>
    </div>
    </>
  );
}