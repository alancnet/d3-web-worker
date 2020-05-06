// Init variables
var margin = {top: 30, bottom: 30, left: 30, right: 30};
var width = 960;
var height = 550;
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

// Create container of force simulation
var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Append rectangle to container
var rect = g.append('rect')
  .attr('width', innerWidth)
  .attr('height', innerHeight)
  .attr('fill', 'none')
  .attr('stroke', '#ccc');

// Init progress bar
var progressBar = g.append('line')
  .attr('x1', 0)
  .attr('x2', 0)
  .attr('y1', 0)
  .attr('y2', 0)
  .style('stroke', 'red')
  .style('stroke-width', '2');

// Linear scale for progress bar
var scale = d3.scaleLinear()
  .domain([0, 1])
  .range([0, innerWidth]);

// Read data
d3.json('data2.json', function(error, data) {
  // Init worker
  var worker = new Worker('worker.js');

  // Post data to worker
  worker.postMessage({
    type: 'initial',
    nodes: data.nodes,
    links: data.links,
    width: innerWidth,
    height: innerHeight
  });

  const throttledUpdate = _.throttle((event) => {
    switch (event.data.type) {
      case 'update': update(event.data); break
      case 'initial': initial(event.data); break
    }
  
    worker.postMessage({
      type: 'update'
    })
  }, 66)

  worker.onmessage = function(event) {
    requestAnimationFrame(() => throttledUpdate(event))
  };
});


let nodeSelection, textSelection, linkSelection
let initialLinks, initialNodes

function initial(data) {

  // Get data with x and y values
  var links = data.links;
  var nodes = data.nodes;

  initialNodes = nodes

  // Add links
  var link = g.append('g')
    .attr('class', 'links')
    .attr('transform', 'translate(' + (innerWidth / 2) + ',' + (innerHeight / 2) + ')')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  // Add nodes
  var node = g.append('g')
    .attr('class', 'nodes')
    .attr('transform', 'translate(' + (innerWidth / 2) + ',' + (innerHeight / 2) + ')')
    .selectAll('.node')
    .data(nodes)
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  // Add circles to nodes
  var text = node.append('circle')
    .attr('cy', '0')
    .attr('cx', '0')
    .attr('r', 5)
    .attr('fill', 'steelblue');

  nodeSelection = node
  textSelection = text
  linkSelection = link
}

function update(data) {
  var links = data.links;
  var nodes = data.nodes;

  nodes.forEach((node, i) => {
    initialNodes[i].x = node.x
    initialNodes[i].y = node.y
  })

  nodeSelection
    .attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    })
  
  linkSelection
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

}