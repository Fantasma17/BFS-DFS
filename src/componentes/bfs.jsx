// src/componentes/bfs.jsx
export function bfsRecorrido(grafo, inicio, callbackPaso) {
    const visitado = new Set();
    const cola = [];
  
    cola.push(inicio);
    visitado.add(inicio);
  
    const procesar = async () => {
      while (cola.length > 0) {
        const actual = cola.shift();
        callbackPaso(actual, "red"); // 🔴 rojo = explorado
        await esperar(800);
  
        (grafo[actual] || []).forEach((vecino) => {
          if (!visitado.has(vecino)) {
            visitado.add(vecino);
            callbackPaso(vecino, "blue"); // 🔵 azul = descubierto
            cola.push(vecino);
          }
        });
      }
    };
  
    procesar();
  }
  
  function esperar(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  