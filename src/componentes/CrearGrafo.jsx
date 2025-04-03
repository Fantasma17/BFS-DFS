//crearGrafo.jsx
import React, { useState } from 'react';
import './CrearGrafo.css';
import GrafoVisual from './GrafoVisual';

function CrearGrafo({ volverAlMenu }) {
  const [nodoPadre, setNodoPadre] = useState('');
  const [cantidadHijos, setCantidadHijos] = useState('');
  const [hijos, setHijos] = useState([]);
  const [grafo, setGrafo] = useState({});
  const [mostrarGrafo, setMostrarGrafo] = useState(false);
  const [padreExistente, setPadreExistente] = useState('');
  const [cantidadNuevosHijos, setCantidadNuevosHijos] = useState('');
  const [nuevosHijos, setNuevosHijos] = useState([]);

  const handleCrearCampos = () => {
    const cantidad = parseInt(cantidadHijos);
    if (!cantidad || cantidad < 1) return alert("Cantidad inválida");
    setHijos(Array.from({ length: cantidad }, () => ''));
  };

  const handleHijoChange = (index, value) => {
    const nuevos = [...hijos];
    nuevos[index] = value;
    setHijos(nuevos);
  };

  const generarGrafo = () => {
    if (!nodoPadre || hijos.some(h => !h)) {
      alert("Completa todos los campos antes de generar el grafo");
      return;
    }

    const nuevoGrafo = { ...grafo };
    nuevoGrafo[nodoPadre] = hijos;
    setGrafo(nuevoGrafo);
    setMostrarGrafo(true);
  };

  const limpiarGrafo = () => {
    setNodoPadre('');
    setCantidadHijos('');
    setHijos([]);
    setGrafo({});
    setMostrarGrafo(false);
    setPadreExistente('');
    setCantidadNuevosHijos(0);
    setNuevosHijos([]);
  };

  const handleNuevoCampoHijos = () => {
    const cantidad = parseInt(cantidadNuevosHijos);
    if (!cantidad || cantidad < 1) return alert("Cantidad inválida");
    setNuevosHijos(Array.from({ length: cantidad }, () => ''));
  };

  const handleNuevoHijoChange = (index, value) => {
    const nuevos = [...nuevosHijos];
    nuevos[index] = value;
    setNuevosHijos(nuevos);
  };

  const agregarHijosANodo = () => {
    if (!padreExistente || nuevosHijos.some(h => !h)) {
      alert("Completa todos los campos para agregar hijos");
      return;
    }
    const nuevoGrafo = { ...grafo };
    if (!nuevoGrafo[padreExistente]) nuevoGrafo[padreExistente] = [];
    nuevoGrafo[padreExistente] = [...nuevoGrafo[padreExistente], ...nuevosHijos];
    setGrafo(nuevoGrafo);
    setMostrarGrafo(true);
    setNuevosHijos([]);
    setCantidadNuevosHijos(0);
  };

  const obtenerTodosLosNodos = () => {
    const nodos = new Set();
    Object.entries(grafo).forEach(([padre, hijos]) => {
      nodos.add(padre);
      hijos.forEach(hijo => nodos.add(hijo));
    });
    return Array.from(nodos);
  };

  return (
    <div className="crear-grafo-container">
      <div className="formulario">
        <h3>Crear Nodo Inicial</h3>
        <label>Nodo Padre:</label>
        <input value={nodoPadre} onChange={(e) => setNodoPadre(e.target.value)} />

        <label>Cantidad de Hijos:</label>
        <input
          type="number"
          value={cantidadHijos}
          onChange={(e) => setCantidadHijos(e.target.value)}
        />

        <button className="btn-verde" onClick={handleCrearCampos}>Crear Campos</button>

        {hijos.map((h, i) => (
          <div key={i}>
            <label>Hijo {i + 1}:</label>
            <input value={h} onChange={(e) => handleHijoChange(i, e.target.value)} />
          </div>
        ))}

        {hijos.length > 0 && (
          <>
            <button className="btn-azul" onClick={generarGrafo}>Generar Grafo</button>
            <button className="btn-gris" onClick={limpiarGrafo}>Limpiar Grafo</button>
          </>
        )}

        {Object.keys(grafo).length > 0 && (
          <>
            <hr />
            <h3>Agregar Hijos a un Nodo Existente</h3>
            <label>Selecciona Nodo:</label>
            <select value={padreExistente} onChange={(e) => setPadreExistente(e.target.value)}>
              <option value="">Seleccionar</option>
              {obtenerTodosLosNodos().map((nodo) => (
                <option key={nodo} value={nodo}>{nodo}</option>
              ))}
            </select>

            <label>Cantidad de Hijos:</label>
            <input
              type="number"
              value={cantidadNuevosHijos}
              onChange={(e) => setCantidadNuevosHijos(e.target.value)}
            />
            <button className="btn-naranja" onClick={handleNuevoCampoHijos}>Crear Nuevos Campos</button>

            {nuevosHijos.map((h, i) => (
              <div key={i}>
                <label>Hijo {i + 1}:</label>
                <input value={h} onChange={(e) => handleNuevoHijoChange(i, e.target.value)} />
              </div>
            ))}

            {nuevosHijos.length > 0 && (
              <button className="btn-azul" onClick={agregarHijosANodo}>Agregar Hijos</button>
            )}
          </>
        )}

        <button className="btn-salir" onClick={volverAlMenu}>⬅ Volver al Menú</button>
      </div>

      {mostrarGrafo && (
        <div className="grafo-preview">
          <h2 className="titulo-grafo">Vista del Grafo</h2>
          <GrafoVisual grafo={grafo} />
        </div>
      )}
    </div>
  );
}

export default CrearGrafo;
