// App.jsx
import React, { useState } from 'react';
import fondo from './assets/fondoL.jpg';
import './App.css';
import CrearGrafo from './componentes/CrearGrafo';

function App() {
  const [modo, setModo] = useState(null);

  const volverAlMenu = () => {
    setModo(null);
  };

  const cerrarVentana = () => {
    window.close(); // Esto intentará cerrar la ventana del navegador
  };

  const renderContenido = () => {
    if (modo === 'crear') return <CrearGrafo volverAlMenu={volverAlMenu} />;

    return (
      <div className="menu-fondo" style={{ backgroundImage: `url(${fondo})` }}>
        <div className="menu-contenido">
        <h1 className="typewriter">BIENVENIDO JUGADOR 
        </h1>
          <div className="menu-botones">
            <button onClick={() => setModo('crear')}>Crear Grafo</button>
            <button onClick={cerrarVentana} className="boton-cerrar"> Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  return <>{renderContenido()}</>;
}

export default App;
