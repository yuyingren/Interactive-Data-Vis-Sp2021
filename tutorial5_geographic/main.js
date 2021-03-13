/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  // + SET UP STATE
  geojson: null,
  points: null,
  hover: {
    state_name: null,
    changeValue: null,
    screenPosition: null, // will be array of [x,y] once mouse is hovered on something
    mapPosition: null, // will be array of [long, lat] once mouse is hovered on something
    visible: false,
  }
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, pointsData]) => {
  // + SET STATE WITH DATA
  state.geojson = geojson
  state.points = pointsData
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // create an svg element in our main `d3-container` element
  svg = d3.select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // + SET UP PROJECTION
  const projection = d3.geoAlbersUsa()
      .fitSize([
      width-margin.left-margin.right,
      height-margin.top-margin.bottom], state.geojson);
  // + SET UP GEOPATH
  const path = d3.geoPath(projection)

  // + DRAW BASE MAP PATH
  const states = svg.selectAll("path.states")
      .data(state.geojson.features)
      .join("path")
      .attr("class", 'states')
      .attr("stroke", "black")
      .attr("fill", "transparent")
      .attr("d", path)
  // + ADD EVENT LISTENERS (if you want)
  const heatpoints = state.points;
  const radiusScale = d3.scaleLinear()
                      .domain([0, d3.max(heatpoints.map(d=>d.Changes))])
                      .range([2,6])
  //console.log("heatpoints", heatpoints.map(d=>d.Changes))
  //console.log("heatpoints2", [heatpoints[0].Lat, heatpoints[0].Long])
  /*const colorScale = d3.scaleSequential(d3.interpolateRdBu)
            .domain(heatpoints.map(d => d.Changes))
  console.log("color", colorScale(16.59491218))*/
  svg.selectAll("cirlcle.point")
      .data(heatpoints)
      .join("circle")
      .attr("r", d=>(radiusScale(Math.abs(d.Changes))))
      .attr("fill", d=>{
        if (d.Changes < 0) return "#00b4d8"
        else if (d.Changes === 0) return "#caf0f8"
        else if(d.Changes > 0) return "#faa307"

      })
      .attr("transform", d=> {
        // use our projection to go from lat/long => x/y
        // ref: https://github.com/d3/d3-geo#_projection
        //console.log("before_translation", [d.longitude, d.latitude])
        const [x, y] = projection([d.Long, d.Lat])
        //console.log("translation", [x, y])
        return `translate(${x}, ${y})`
      })
      .on("mousemove", function(event,d) {
        // 1. get mouse x/y position
        d3.select(this).transition()
          .duration("50")
          .attr("r", 10)
        const {clientX, clientY} = event
        //console.log("event", event)
  
       // 2. invert the projection to go from x/y => lat/long
      //ref: https://github.com/d3/d3-geo#projection_invert
       const [long, lat] = projection.invert([clientX, clientY])
        
        state.hover=  {
          state_name: d.State,
          changeValue: [d.Changes],
          screenPosition: [clientX, clientY], // will be array of [x,y] once mouse is hovered on something
          mapPosition: [d3.format(".1f")(long), d3.format(".1f")(lat)], // will be array of [long, lat] once mouse is hovered on something
          visible: true
        }
        //console.log("statehover", state.hover)
        draw();
      })
      .on("mouseout", function(event,d) {
        // hide tooltip when not moused over a state
        d3.select(this).transition()
          .duration("50")
          .attr("r", d=>(radiusScale(Math.abs(d.Changes))))
        state.hover.visible = false
        draw(); // redraw
      })

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {

  d3.select("#d3-container") // want to add
    .selectAll('div.hover-content')
    .data([state.hover])
    //console.log([state.hover])
    .join("div")
    .attr("class", 'hover-content')
    .classed("visible", d=> d.visible)
    .style("position", 'absolute')
    .style("transform", d=> {
      // only move if we have a value for screenPosition
      //console.log("screenPosiiton", d.screenPosition)
      if (d.screenPosition)
      return `translate(${d.screenPosition[0]}px, ${d.screenPosition[1]}px)`
    })
    .html(d=>
      `
      <div>
      Station location:
      </div>
      <div>
      State: ${d.state_name} Coordinate: ${d.mapPosition}
      </div>
      <div>
      Temprature changed in days: ${d3.format(".1f")(d.changeValue)}
      </div>
      `)
  
    
  
}