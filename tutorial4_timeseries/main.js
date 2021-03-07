/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 3;

//const formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B')
const formatDate = d3.timeFormat("%Y")
// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let yAxis;
let xAxisGroup;
let yAxisGroup;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "All", // + YOUR FILTER SELECTION
};


/* LOAD DATA */
// + SET YOUR DATA PATH

d3.csv('../data/SUNY_enrollments_y02y19.csv', (d) => {
  const formattedObj = {
    race: d.Race,
    enrollment: +d.Enrollment,
    year: new Date(+d.Year, 01, 01)
  }
  return formattedObj
})

  .then(data => {
    console.log("loaded data:", data);
    state.data = data;
    init();

  });

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {

  // + SCALES
  xScale = d3.scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right])
  yScale = d3.scaleLinear()
    .domain(d3.extent(state.data, d =>d.enrollment))
    .range([height - margin.bottom, margin.top])
  // + AXES
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)
  // + UI ELEMENT SETUP
  const dropdown = d3.select('#dropdown')

  // add in dropdown options from the unique values in the data
  dropdown.selectAll("option")
    .data(
      Array.from(new Set(state.data.map(d => d.race))))
    .join("option")
    .attr("value", d => d)
    .text(d => d)
  console.log("dropdown: ", dropdown)
  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  
  dropdown.on("change", event => {
    console.log("dropdown changed!", event.target.value)
    state.selection = event.target.value
    console.log("new state", state)
    draw();
  })
  // + CREATE SVG ELEMENT
  svg = d3.select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // + CALL AXES
  xAxisGroup = svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${0}, ${height - margin.bottom})`)
    .call(xAxis)
  
  xAxisGroup.append("text")
    .attr("class", 'xLabel')
    .attr("transform", `translate(${width / 2}, ${40})`)
    .attr("text-anchor", "middle")
    .attr("font-size","14")
    .attr("fill","black")
    .text("Year")
  
  yAxisGroup = svg.append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.left}, ${0})`)
    .call(yAxis)

  yAxisGroup.append("text")
    .attr("class", 'yLabel')
    .attr("transform", `translate(${-55}, ${height / 2})`)
    .attr("writing-mode", 'vertical-rl')
    .attr("text-anchor", "middle")
    .attr("font-size","14")
    .attr("fill","black")
    .text("Enrollment")

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
    .filter(d => d.race === state.selection)

  // + UPDATE SCALE(S), if needed

  // + UPDATE AXIS/AXES, if needed
  // + DRAW CIRCLES/LABEL GROUPS, if you decide to
  const dots = svg
    .selectAll(".dot")
    .data(filteredData, d => d.year)
    .join(
      enter => enter.append("g")
        .attr("class", "dot")
        .attr("transform", d => `translate(${xScale(d.year)}, ${yScale(d.enrollment)})`),
      update => update
        .call(update => update.transition()
          .duration(1000)
          .attr("transform", d => `translate(${xScale(d.year)}, ${yScale(d.enrollment)})`)
        ),
      exit => exit.remove()
    );
  /*var tooltip = d3.select("#d3-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
  console.log("tooltip", tooltip)
  
  var mouseover = function(d) {
    tooltip
        .style("opacity", 1)
    d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    console.log("tooltip", tooltip)
  }
  var mousemove = function(d) {
    tooltip
        .html("The exact value of<br>this cell is: " + d.year)
        .style("left", (d3.pointer(this)[0]+70) + "px")
        .style("top", (d3.pointer(this)[1]) + "px")
    console.log("tooltip", tooltip)
  }
  var mouseleave = function(d) {
    tooltip
        .style("opacity", 0)
    d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
  }*/
  

  dots.selectAll("circle")
    .data(d => [d]) // pass along data from parent to child
    .join("circle")
    .attr("r", radius)
    //.on("mouseover", mouseover)
    //.on("mousemove", mousemove)
    //.on("mouseleave", mouseleave)
    /*.on('mouseout', function (d, i) {
      d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1')})*/
      

  
  
  /*dots.selectAll("text")
    .data(d => [d]) // pass along data from parent to child
    .join("text")
    .attr("text-anchor", "end")
    .text(d => `${formatDate(d.year)}: ${d.enrollment} `)*/

  // + DEFINE LINE GENERATOR FUNCTION
  const lineGen = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.enrollment))

  // + DRAW LINE AND/OR AREA
  
  svg.selectAll(".line")
    .data([filteredData]) // data needs to take an []
    .join("path")
    .attr("class", 'line')
    .attr("fill", "none")
    .attr("stroke", "black")
    .transition()
    .duration(1000)
    .attr("d", d => lineGen(d))
  
  const areaGen = d3.area()
    .x(d => xScale(d.year))
    .y0(yScale(0))
    .y1(d => yScale(d.enrollment))

  svg.selectAll(".area")
    .data([filteredData]) // data needs to take an []
    .join("path")
    .attr("class", 'area')
    .attr("fill", "#cce5df")
    .attr("stroke-width", 1.5)
    .transition()
    .duration(1000)
    .attr("d", d => areaGen(d))

} 

