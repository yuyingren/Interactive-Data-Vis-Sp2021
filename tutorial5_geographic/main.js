/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 20, left: 20, right: 40 };

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
  },
  selectGroup: "All"
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/usHeatExtremes_alter.csv", d3.autoType),
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
      .attr("fill", "#e9edc9")
      .attr("opacity", ".5")
      .attr("d", path)
  
  
  // + ADD EVENT LISTENERS (if you want)
  const legends = ["Unusual hot days decreased", "Unusual hot days increased", "Unusual hot days not changed"]
  const legendScale = d3.scaleOrdinal()
          .domain(legends)
          .range(["#219ebc", "#fb8500", "#e9edc9"])
  svg.selectAll("legend")
    .data(legends)
    .enter()
    .append("circle")
      .attr("class", "legend")
      .attr("cx", width-margin.right-85)
      .attr("cy", function(d,i) {return (height-margin.bottom)- i*25})
      .attr("r", 3)
      .attr("fill", d => legendScale(d))
      .attr("stroke", "gray")
      .attr("stroke-width", "1")
  svg.selectAll("legendLabel")
      .data(legends)
      .enter()
      .append("text")
      .attr("class", "legend")
      .attr("x", width-margin.right-80)
      .attr("y", function(d,i) {return (height-margin.bottom+2.5)- i*25})
      .text(d=>(d))
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height-10)
      .attr("text-anchor", "middle")
      .attr("font-size","14")
      .attr("fill","black")
      .text("Change of Unusual Hot Days across United States")
  
  
  const selectElement = d3.select("#dropdown")
  selectElement
    .selectAll("option")
    .data([
      { key: "All", label: "All stations" },
      { key: "zero", label: "stations changed 0 days" },
      { key: "ten", label: "stations changed 0~10 days" },
      { key: "twenty", label: "stations changed 10~20 days" },
      { key: "thirty", label: "stations changed 20~30 days" },
      { key: "over30", label: "stations changed more than 30 days" }
    ])
    .join("option")
    .attr("value", d => d.key)
    .text(d => d.label);
  selectElement.on("change", event => {
      //console.log("DROPDOWN CALLBACK: new value is", event.target.value);
      state.selectGroup = event.target.value
      //console.log("NEW STATE:", state);             
      init2();
  });
  init2();

}


function init2() {
  const filteredData = state.points.filter(
    d => state.selectGroup === "All" || state.selectGroup === d.Group)
  //console.log("filterdata", filteredData)
  const radiusScale = d3.scaleOrdinal()
                    .domain(["zero", "ten", "twenty", "thirty", "over30"])
                    .range([2, 4, 5, 6, 7])
  const projection = d3.geoAlbersUsa()
                    .fitSize([
                    width-margin.left-margin.right,
                    height-margin.top-margin.bottom], state.geojson);
  
  const dots =svg
    .selectAll("circle.dots")
    .data(filteredData, d => d.StationID)
    .join(
      enter => enter.append("circle")
        .attr("class", "dots")
        .attr("r", d=>radiusScale(d.Group))
        .attr("fill", d=>{
          if (d.Changes < 0) return "#219ebc"
          else if (d.Changes === 0) return "transparent"
          else if(d.Changes > 0) return "#fb8500"
        })
        .attr("stroke", d=> {
          if (d.Changes === 0) return "gray"
          else return "white"
        })
        .attr("stroke-width", "1")
        .attr("opacity", ".9")
        .attr("transform", d=> {
            
          const [x, y] = projection([d.Long, d.Lat])
            //console.log("translation", [x, y])
          return `translate(${x}, ${y})`
        })
        /*.call(sel => sel.transition()
          .duration(200)
          .attr("opacity", "1")
          .attr("r", d=>radiusScale(d.Group))
        )*/
        .on("mousemove", function(event,d) {
          // 1. get mouse x/y position
          d3.select(this).transition()
            .duration("50")
            .attr("r", d=>radiusScale(d.Group) * 1.5)
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
            .attr("r", d=>radiusScale(d.Group))
          state.hover.visible = false
          draw(); // redraw
        }),
      update => update
        .call(sel => sel
        .transition()
        .duration(2000)
        .attr("r", d=>radiusScale(d.Group))// bring it back to original size
        ),
      exit => exit
        .call(sel => sel
        .attr("opacity", ".9")
        .transition()
        .duration(50)
        .attr("opacity", "0")
        .remove()
        )
    );
}

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
      Station location: ${d.state_name}
      </div>
      <div>
      Coordinate: ${d.mapPosition}
      </div>
      <div>
      Number of days changed: ${d3.format(".1f")(d.changeValue)}
      </div>
      `)
  
    
  
}