importScripts('//d3js.org/d3.v4.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

self.onmessage = async function(e) {
  if (e.data.type === 'initial') initial(e)
  if (e.data.type === 'update') updateGraph()
}

let simulation, nodes, links

function initial(e) {
  nodes = e.data.nodes;
  links = e.data.links;

  // Add force simulation
  simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-80))
    .force('link', d3.forceLink(links)
      .distance(40)
      .id(function(d) {
        return d.id;
      }))
    .force('collide', d3.forceCollide().radius(10))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .stop();

  postMessage({type: "initial", nodes, links });
}

function updateGraph() {
  simulation.tick();
  postMessage({type: "update", nodes, links });
}