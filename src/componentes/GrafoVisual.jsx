// src/GrafoVisual.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./GrafoVisual.css";

function GrafoVisual({ grafo }) {
  const svgRef = useRef();
  const [nodoInicio, setNodoInicio] = useState('');
  const [nodoDestino, setNodoDestino] = useState('');
  const [caminoOptimo, setCaminoOptimo] = useState([]);
  const [nodoActual, setNodoActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [lineasColores, setLineasColores] = useState({});
  const [tipoRecorrido, setTipoRecorrido] = useState(''); 

  useEffect(() => {
    dibujarGrafo();
  }, [grafo]);

  const convertirEnNoDirigido = (grafoOriginal) => {
    const grafoBidireccional = {};
    Object.entries(grafoOriginal).forEach(([padre, hijos]) => {
      if (!grafoBidireccional[padre]) grafoBidireccional[padre] = [];
      hijos.forEach((hijo) => {
        if (!grafoBidireccional[hijo]) grafoBidireccional[hijo] = [];
        grafoBidireccional[padre].push(hijo);
        grafoBidireccional[hijo].push(padre);
      });
    });
    return grafoBidireccional;
  };

  const dibujarGrafo = (colores = {}, borde = {}, lineas = {}) => {
    const width = 800;
    const nivelAltura = 150;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const grafoNoDirigido = convertirEnNoDirigido(grafo);
    const nodos = new Set();
    const links = [];

    Object.entries(grafoNoDirigido).forEach(([padre, hijos]) => {
      nodos.add(padre);
      hijos.forEach((hijo) => {
        nodos.add(hijo);
        if (!links.some(l =>
          (l.source === hijo && l.target === padre) ||
          (l.source === padre && l.target === hijo)
        )) {
          links.push({ source: padre, target: hijo });
        }
      });
    });

    const niveles = {};
    const posiciones = {};

    const calcularTodosLosNiveles = () => {
      const visitados = new Set();

      const recorrer = (nodo, nivel) => {
        if (visitados.has(nodo)) return;
        visitados.add(nodo);
        if (niveles[nodo] === undefined || nivel > niveles[nodo]) {
          niveles[nodo] = nivel;
        }
        (grafo[nodo] || []).forEach(hijo => {
          recorrer(hijo, nivel + 1);
        });
      };

      Object.keys(grafo).forEach(nodo => {
        if (!visitados.has(nodo)) {
          recorrer(nodo, 0);
        }
      });
    };

    calcularTodosLosNiveles();

    const nivelesAgrupados = {};
    Object.entries(niveles).forEach(([nodo, nivel]) => {
      if (!nivelesAgrupados[nivel]) nivelesAgrupados[nivel] = [];
      nivelesAgrupados[nivel].push(nodo);
    });

    const cantidadNiveles = Object.keys(nivelesAgrupados).length || 1;
    const height = 100 + cantidadNiveles * nivelAltura;
    svg.attr("width", width).attr("height", height);

    Object.entries(nivelesAgrupados).forEach(([nivel, nodosNivel]) => {
      const y = 100 + nivel * nivelAltura;
      const espaciado = width / (nodosNivel.length + 1);
      nodosNivel.forEach((nodo, i) => {
        posiciones[nodo] = { x: espaciado * (i + 1), y };
      });
    });

    svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", d => posiciones[d.source].x)
      .attr("y1", d => posiciones[d.source].y)
      .attr("x2", d => posiciones[d.target].x)
      .attr("y2", d => posiciones[d.target].y)
      .attr("stroke", d => lineas[`${d.source}-${d.target}`] || lineas[`${d.target}-${d.source}`] || "gray")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(Array.from(nodos))
      .enter()
      .append("g")
      .attr("transform", d => `translate(${posiciones[d].x}, ${posiciones[d].y})`);

    node.append("circle")
      .attr("r", 22)
      .attr("class", "nodo")
      .attr("fill", d => colores[d] || "white")
      .attr("stroke", d => borde[d] || "gray")
      .attr("stroke-width", 3);

    node.append("text")
      .text(d => d)
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("class", "texto")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "black");
  };

  const esperar = (ms) => new Promise((res) => setTimeout(res, ms));

  const aplicarBFS = async () => {
    setTipoRecorrido("Recorrido BFS"); // 
    const grafoActual = convertirEnNoDirigido(grafo);
    if (!grafoActual[nodoInicio] || !grafoActual[nodoDestino]) {
      alert("Nodo de inicio o destino no existe en el grafo");
      return;
    }

    const visitados = new Set();
    const colores = {};
    const borde = {};
    const cola = [];
    const padres = {};
    const historialPaso = [];
    const lineas = {};

    cola.push(nodoInicio);
    colores[nodoInicio] = "#2196f3";
    setNodoActual(nodoInicio);
    historialPaso.push(nodoInicio);
    dibujarGrafo(colores, borde, lineas);
    await esperar(1000);

    while (cola.length > 0) {
      const actual = cola.shift();
      colores[actual] = "#f44336";
      setNodoActual(actual);
      historialPaso.push(actual);
      dibujarGrafo(colores, borde, lineas);
      await esperar(1000);

      if (actual === nodoDestino) break;

      for (const vecino of grafoActual[actual] || []) {
        if (!visitados.has(vecino) && !cola.includes(vecino)) {
          colores[vecino] = "#2196f3";
          cola.push(vecino);
          padres[vecino] = actual;
          lineas[`${actual}-${vecino}`] = "#00ff00";
        }
      }

      visitados.add(actual);
    }

    const camino = [];
    let actual = nodoDestino;
    while (actual) {
      camino.unshift(actual);
      actual = padres[actual];
    }

    if (camino.length === 1 && camino[0] !== nodoInicio) {
      alert("No hay camino entre los nodos seleccionados");
      setCaminoOptimo(["No hay camino"]);
      setHistorial(["Sin conexión"]);
      return;
    }

    camino.forEach(nodo => borde[nodo] = "#00ff00");
    setNodoActual(null);
    dibujarGrafo(colores, borde, lineas);
    setCaminoOptimo(camino);
    setHistorial(historialPaso);
    setLineasColores(lineas);
  };

  const aplicarDFS = async () => {
    setTipoRecorrido("Recorrido DFS"); // 
    const grafoActual = convertirEnNoDirigido(grafo);
    if (!grafoActual[nodoInicio] || !grafoActual[nodoDestino]) {
      alert("Nodo de inicio o destino no existe en el grafo");
      return;
    }

    const visitados = new Set();
    const colores = {};
    const borde = {};
    const padres = {};
    const historialPaso = [];
    const lineas = {};

    const dfs = async (nodo) => {
      colores[nodo] = "#2196f3";
      setNodoActual(nodo);
      historialPaso.push(nodo);
      dibujarGrafo(colores, borde, lineas);
      await esperar(1000);

      visitados.add(nodo);

      for (const vecino of grafoActual[nodo] || []) {
        if (!visitados.has(vecino)) {
          padres[vecino] = nodo;
          lineas[`${nodo}-${vecino}`] = "#00ff00";
          await dfs(vecino);
        }
      }

      colores[nodo] = "#f44336";
      setNodoActual(nodo);
      dibujarGrafo(colores, borde, lineas);
      await esperar(1000);
    };

    await dfs(nodoInicio);

    const camino = [];
    let actual = nodoDestino;
    while (actual) {
      camino.unshift(actual);
      actual = padres[actual];
    }

    if (camino.length === 1 && camino[0] !== nodoInicio) {
      alert("No hay camino entre los nodos seleccionados");
      setCaminoOptimo(["No hay camino"]);
      setHistorial(["Sin conexión"]);
      return;
    }

    camino.forEach(nodo => borde[nodo] = "#00ff00");
    setNodoActual(null);
    dibujarGrafo(colores, borde, lineas);
    setCaminoOptimo(camino);
    setHistorial(historialPaso);
    setLineasColores(lineas);
  };

  return (
    <div className="contenedor-grafo">
      {tipoRecorrido && (
        <h2 style={{ color: '#00f0ff', textAlign: 'center', fontSize: '22px', marginBottom: '10px' }}>
          {tipoRecorrido}
        </h2>
      )}

      <svg ref={svgRef}></svg>

      <div className="botones-recorridos">
        <div className="bloque-input">
          <label>Nodo de Inicio:</label>
          <input
            type="text"
            value={nodoInicio}
            onChange={(e) => setNodoInicio(e.target.value)}
            placeholder="Escribe nodo de inicio"
          />
        </div>

        <div className="bloque-input">
          <label>Nodo de Destino:</label>
          <input
            type="text"
            value={nodoDestino}
            onChange={(e) => setNodoDestino(e.target.value)}
            placeholder="Escribe nodo de destino"
          />
        </div>

        <div className="bloque-botones">
          <button className="boton-gamer" onClick={aplicarBFS}>Aplicar BFS</button>
          <button className="boton-gamer" onClick={aplicarDFS}>Aplicar DFS</button>
        </div>
      </div>

      {nodoActual && (
        <p style={{ color: '#2196f3', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
          (ACTUAL): Visitando {nodoActual}
        </p>
      )}

      {historial.length > 0 && (
        <p style={{ color: '#2196f3', textAlign: 'center', fontWeight: 'bold' }}>
          <span style={{ textDecoration: 'underline' }}>Mostramos:</span> {historial.join(" → ")}
        </p>
      )}

      {caminoOptimo.length > 0 && (
        <p style={{ color: '#00ff00', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
          Camino óptimo: {caminoOptimo.join(" → ")}
        </p>
      )}
    </div>
  );
}

export default GrafoVisual;
