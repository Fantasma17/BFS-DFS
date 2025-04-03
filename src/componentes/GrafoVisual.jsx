// src/GrafoVisual.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./GrafoVisual.css";

function GrafoVisual({ grafo }) {
  const svgRef = useRef();
  const [caminoOptimo, setCaminoOptimo] = useState([]);
  const [nodoActual, setNodoActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [lineasColores, setLineasColores] = useState({});

  useEffect(() => {
    dibujarGrafo();
  }, [grafo]);

  const dibujarGrafo = (colores = {}, borde = {}, lineas = {}) => {
    const width = 800;
    const height = 600;
    const nivelAltura = 150;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const nodos = new Set();
    const links = [];

    Object.entries(grafo).forEach(([padre, hijos]) => {
      nodos.add(padre);
      hijos.forEach((hijo) => {
        nodos.add(hijo);
        links.push({ source: padre, target: hijo });
      });
    });

    const niveles = {};
    const posiciones = {};

    const calcularNivel = (nodo, nivel) => {
      if (niveles[nodo] === undefined || nivel > niveles[nodo]) {
        niveles[nodo] = nivel;
        (grafo[nodo] || []).forEach((hijo) => calcularNivel(hijo, nivel + 1));
      }
    };

    const raiz = Object.keys(grafo)[0];
    calcularNivel(raiz, 0);

    const nivelesAgrupados = {};
    Object.entries(niveles).forEach(([nodo, nivel]) => {
      if (!nivelesAgrupados[nivel]) nivelesAgrupados[nivel] = [];
      nivelesAgrupados[nivel].push(nodo);
    });

    Object.entries(nivelesAgrupados).forEach(([nivel, nodosNivel]) => {
      const y = 100 + nivel * nivelAltura;
      const espaciado = width / (nodosNivel.length + 1);
      nodosNivel.forEach((nodo, i) => {
        posiciones[nodo] = { x: espaciado * (i + 1), y };
      });
    });

    svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => posiciones[d.source].x)
      .attr("y1", (d) => posiciones[d.source].y)
      .attr("x2", (d) => posiciones[d.target].x)
      .attr("y2", (d) => posiciones[d.target].y)
      .attr("stroke", (d) => lineas[`${d.source}-${d.target}`] || "gray")
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(Array.from(nodos))
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${posiciones[d].x}, ${posiciones[d].y})`);

    node
      .append("circle")
      .attr("r", 22)
      .attr("class", "nodo")
      .attr("fill", (d) => colores[d] || "white")
      .attr("stroke", (d) => borde[d] || "gray")
      .attr("stroke-width", 3);

    node
      .append("text")
      .text((d) => d)
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("class", "texto")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "black");
  };

  const esperar = (ms) => new Promise((res) => setTimeout(res, ms));

  const aplicarBFS = async () => {
    const visitados = new Set();
    const colores = {};
    const borde = {};
    const cola = [];
    const padres = {};
    const historialPaso = [];
    const lineas = {};
    const inicio = Object.keys(grafo)[0];

    if (!inicio) return;

    cola.push(inicio);
    colores[inicio] = "#2196f3";
    setNodoActual(inicio);
    historialPaso.push(inicio);
    dibujarGrafo(colores, borde, lineas);
    await esperar(1000);

    while (cola.length > 0) {
      const actual = cola.shift();
      colores[actual] = "#f44336";
      setNodoActual(actual);
      historialPaso.push(actual);
      dibujarGrafo(colores, borde, lineas);
      await esperar(1000);

      (grafo[actual] || []).forEach((hijo) => {
        if (!visitados.has(hijo) && !cola.includes(hijo)) {
          colores[hijo] = "#2196f3";
          cola.push(hijo);
          padres[hijo] = actual;
          lineas[`${actual}-${hijo}`] = "#00ff00";
        }
      });

      visitados.add(actual);
    }

    const final = historialPaso[historialPaso.length - 1];
    const camino = [];
    let actual = final;
    while (actual) {
      camino.unshift(actual);
      actual = padres[actual];
    }

    camino.forEach((nodo) => {
      borde[nodo] = "#00ff00";
    });

    setNodoActual(null);
    dibujarGrafo(colores, borde, lineas);
    setCaminoOptimo(camino);
    setHistorial(historialPaso);
    setLineasColores(lineas);
  };

  const aplicarDFS = async () => {
    const visitados = new Set();
    const colores = {};
    const borde = {};
    const padres = {};
    const historialPaso = [];
    const lineas = {};
    const inicio = Object.keys(grafo)[0];

    const dfs = async (nodo) => {
      colores[nodo] = "#2196f3";
      setNodoActual(nodo);
      historialPaso.push(nodo);
      dibujarGrafo(colores, borde, lineas);
      await esperar(1000);

      visitados.add(nodo);

      for (const hijo of grafo[nodo] || []) {
        if (!visitados.has(hijo)) {
          padres[hijo] = nodo;
          lineas[`${nodo}-${hijo}`] = "#00ff00";
          await dfs(hijo);
        }
      }

      colores[nodo] = "#f44336";
      setNodoActual(nodo);
      dibujarGrafo(colores, borde, lineas);
      await esperar(1000);
    };

    if (!inicio) return;
    await dfs(inicio);

    const final = historialPaso[historialPaso.length - 1];
    const camino = [];
    let actual = final;
    while (actual) {
      camino.unshift(actual);
      actual = padres[actual];
    }

    camino.forEach((nodo) => {
      borde[nodo] = "#00ff00";
    });

    setNodoActual(null);
    dibujarGrafo(colores, borde, lineas);
    setCaminoOptimo(camino);
    setHistorial(historialPaso);
    setLineasColores(lineas);
  };

  return (
    <div className="contenedor-grafo">
      <svg ref={svgRef}></svg>

      <div className="botones-recorridos">
        <button className="boton-gamer" onClick={aplicarBFS}>
           Aplicar BFS
        </button>
        <button className="boton-gamer" onClick={aplicarDFS}>
          Aplicar DFS
        </button>
      </div>

      {nodoActual && (
        <p style={{ color: '#2196f3', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
          (ACTUAL): Visitando {nodoActual}
        </p>
      )}

      {historial.length > 0 && (
        <p style={{ color: '#2196f3', textAlign: 'center', fontWeight: 'bold' }}>
          Mostramos: {historial.join(" → ")}
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
