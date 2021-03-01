/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 60, left: 60, right: 40 },
  radius = 6;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedgender: "All" // + YOUR INITIAL FILTER SELECTION
};

/* LOAD DATA */
d3.json("../data/students_performance.json", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("data", raw_data);
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  console.log("STATE", state)
  // + DEFINE SCALES
  xScale = d3.scaleLinear()
    .domain(d3.extent(state.data, d=> d.MathScore))
    .range([margin.left, width - margin.right])
  
  yScale = d3.scaleLinear()
  .domain(d3.extent(state.data, d=> d.WritingScore))
  .range([height-margin.bottom, margin.top])
  //console.log("xScale", xScale, xScale(52))

  // + DEFINE AXES
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)

  // + UI ELEMENT SETUP
  const dropdown = d3.select("#dropdown")
  // + add dropdown options
  dropdown.selectAll("options")
    .data(["All","female", "male"])
    .join("option")
    .attr("value", d => d)
    .text(d=> d)
  // + add event listener for 'change'
  dropdown.on("change", event=> {
    console.log("dropdown changed!", event.target.value);
    state.selectedgender = event.target.value
    console.log("NEW STATE:", state)
    draw();
  })

  // + CREATE SVG ELEMENT
  svg = d3.select("#d3-container")
    .append("svg")
    .attr('width', width)
    .attr('height', height)

  //add Graph title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .attr("text-anchor", "middle")
    .attr("font-size","16")
    .attr("fill","black")
    .text("Students Performance Evaluation(Writing & Math)")


  // + CREATE AXES
  const xAxisGroup = svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(${0}, ${height-margin.bottom})`)
    .call(xAxis)
  
  xAxisGroup.append("text")
    .attr("class", 'axis-title')
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .attr("font-size","14")
    .attr("fill","black")
    .text("Math Score")

  const yAxisGroup = svg.append("g")
    .attr("class", "yAxis")
    .attr("transform", `translate(${margin.left}, ${0})`)
    .call(yAxis)
   
  yAxisGroup.append("text")
    .attr("class", 'axis-title')
    .attr("x", -40)
    .attr("y", height / 2)
    .attr("writing-mode", "vertical-lr")
    .attr("text-anchor", "middle")
    .attr("font-size","14")
    .attr("fill","black")
    .text("Writing Score")
  // draw(); // calls the draw function
  draw();
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {

  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
    .filter(d=>{
      if (state.selectedgender === "All") return true
      else return d.gender === state.selectedgender
      })
 

  // + DRAW CIRCLES
  const dot = svg
    .selectAll("circle")
    .data(filteredData, d => d.StudentId) // second argument is the unique key for that row
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter.append("circle")
        .attr("r", 0)
        .attr("fill-opacity","0")
        .attr("fill", d => {
          if (d.gender==="female") return "#fe7f2d"
          else return "#086788"
        })
        .attr("cx", d => xScale(d.MathScore))
        .attr("cy", d=> yScale(d.WritingScore))
        .call(enter => enter.transition()
          .duration(1000)
          .attr("r", radius)
          .attr("fill-opacity","0.6") // Fade-in transition
        ),
      // + HANDLE UPDATE SELECTION
      update => update
        .call(update => update
        .transition()
        .duration(1000)
        .attr("r", radius * 1.5)
        .transition()
        .duration(1000)
        .attr("r", radius)
        ),
      
      // + HANDLE EXIT SELECTION
      exit => exit
        .call(exit => exit
        .transition()
        .duration(1000)
        .attr("r", 0)
        .attr("fill-opacity","0")
        .remove()
        )


    );
}
