/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * 0.9,
 height = window.innerHeight * 0.7,
 margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;
let tooltip1;
//let view;

/**
* APPLICATION STATE
* */
let state = {
 // + INITIALIZE STATE
 data: null,
 hover:null,
};




/**
* LOAD DATA
* */
d3.json("../data/flare.json", d3.autotype).then(data => {
 state.data = data;
 init();
});


/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 
 const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

 const colorScale1 = d3.scaleSequentialSqrt()
        .domain([1,3])
        .range(["#7d82b8", "#ffffff"]);

 const opacityScale = d3.scaleLinear()
   .domain([4, 2])
   .range([.55, .95]);

 const container = d3.select("#d3-container").style("position", "relative");
 const root = d3.hierarchy(state.data)
   .sum(d => d.value) // sets the 'value' of each level
   .sort((a, b) => b.value - a.value);
 
 const treeLayout = d3.treemap()
   .size([
    width - margin.left - margin.right,
    height - margin.top - margin.bottom])
  //.paddingTop(10)
  //.paddingRight(2)
   .padding(1)
   .round(true)
//console.log("treelyout", treeLayout)

// + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
 const tree = treeLayout(root)
//console.log("tree", tree)

 const leaves = tree.leaves()
 console.log("leaves", leaves)
 const packLayout = d3.pack()
   .size([
     width,
     height - margin.bottom - margin.top])// - margin.left - margin.right
   .padding(1.5)
   //.round(true)
 console.log("treelyout", packLayout)

 

 // + CALL YOUR LAYOUT FUNCTION ON YOUR ROOT DATA
 const packs = packLayout(root)
 console.log("cirl", packs.descendants().slice(1))
 svg = container
   .append("svg")
   .attr("width", width)
   .attr("height", height)

 svg.append("text")
   .attr("x", width / 2)
   .attr("y", height-30)
   .attr("text-anchor", "middle")
   .attr("font-size","14")
   .attr("fill","black")
   .text("Tree Map for Flare data")
   
 svg1 = container
   .append("svg")
   .attr("width", width)
   .attr("height", height)

 svg1.append("text")
   .attr("x", width / 2)
   .attr("y", height-5)
   .attr("text-anchor", "middle")
   .attr("font-size","14")
   .attr("fill","black")
   .text("Circle Pack for Flare data")

 // + INITIALIZE TOOLTIP IN YOUR CONTAINER ELEMENT
 tooltip = container.append("div")
   .attr("class", "tooltip")
   .style("position", "absolute")
   .style("top", 0)
   .style("left", 0)

 tooltip1 = container.append("div")
   .attr("class", "tooltip1")
   .style("position", "absolute")
   .style("top", height + "px")
   .style("left", 0)
 // + CREATE YOUR ROOT HIERARCHY NODE

  const leafGroups = svg
    .selectAll(".leaf")
    .data(leaves)
    .join("g")
    .attr("class", "leaf")
    .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
   
  leafGroups.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => {
      // grab level 1 category and use that for color
      const level1Ancestor = d.ancestors().find(d => d.depth === 1);
      return colorScale(level1Ancestor.data.name);
    })
    .attr("opacity", d => opacityScale(d.depth));


 // + CREATE YOUR GRAPHICAL ELEMENTS
  leafGroups
    .on("mouseenter", (event, d) => { // second argument returns the data associated with that leaf
      state.hover = {
        position: [d.x1, d.y1],
        name: d.data.name,
        value: d3.format(",")(d.value),
       // example for something you can do with a leaf node:
        anscestorsPath: d.ancestors()
          .reverse()
          .map(d => d.data.name)
          .join(" => ".fontcolor("#ff595e"))
      }
      draw()
    })
    .on("mouseleave", () => {
     //reset hover when mouse out of the leaf
     
      state.hover = null
      draw();
    })
  //const colorScale = d3.scaleSequentialSqrt()
  //       .domain([1,3])
  //       .range(["#ef798a", "#ffffff"]);

 const leafGroups1 = svg1
   .selectAll(".packcircle")
   .data(packs.descendants().slice(1))
   .join("g")
   .attr("class", "packcircle")
   .attr("transform", d => `translate(${d.x}, ${d.y})`)

   
  leafGroups1.append("circle")
   .attr("r", d => d.r)
   .attr("fill", d => d.children ? colorScale1(d.depth) : "#ef798a")
   .attr("opacity", ".85")


 // + CREATE YOUR GRAPHICAL ELEMENTS
 leafGroups1
 .on("mouseenter", (event, d) => { // second argument returns the data associated with that leaf
   state.hover = {
     position: [d.x, d.y],
     name: d.data.name,
     value: d3.format(",")(d.value),
     // example for something you can do with a leaf node:
     anscestorsPath: d.ancestors()
       .reverse()
       .map(d => d.data.name)
       .join(" => ".fontcolor("#ff595e"))
   }
   draw1()
 })
 .on("mouseleave", () => {
   //reset hover when mouse out of the leaf
   state.hover = null
   draw1();
 })
}

/**
* DRAW FUNCTION
* we call this everytime there is an update to the data/state
* */
function draw() {
 // + UPDATE TOOLTIP
 if (state.hover) {
   tooltip
     .html(
       `
   <div>Name: ${state.hover.name}</div>
   <div>Value: ${state.hover.value}</div>
   <div>Hierarchy Path: ${state.hover.anscestorsPath}</div>
   `
     ).transition()
     .duration(200)
     .style("transform", `translate(${state.hover.position[0]}px, ${state.hover.position[1]}px )`)
 }

 // hide/show tooltip depending on whether state.hover exists
 // hint: look at the css to see what this is doing
 // ref: https://github.com/d3/d3-selection#selection_classed
 tooltip.classed("visible", state.hover)
}

function draw1() {
  // + UPDATE TOOLTIP
  if (state.hover) {
    tooltip1
      .html(
        `
    <div>Name: ${state.hover.name}</div>
    <div>Value: ${state.hover.value}</div>
    <div>Hierarchy Path: ${state.hover.anscestorsPath}</div>
    `
      ).transition()
      .duration(200)
      .style("transform", `translate(${(width - 150) / 2}px, ${height - 50}px )`)
  }
 
  // hide/show tooltip depending on whether state.hover exists
  // hint: look at the css to see what this is doing
  // ref: https://github.com/d3/d3-selection#selection_classed
  tooltip1.classed("visible", state.hover)
  //console.log("tool", tooltip1)
 }