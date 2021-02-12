
d3.csv('../data/squirrelActivities.csv', d3.autoType).then(data => {
    console.log('data', data)

const width = window.innerWidth *.4;
const height = window.innerHeight /3;

const xScale = d3.scaleBand()
    .domain(data.map(d => d.activity))
    .range([0, width])
    .paddingInner(.3)
//console.log(xScale.domain(), xScale.range())

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([height, 0])
//console.log(xScale, xScale('eating'))

const svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

const myColor = d3.scaleOrdinal()
    .domain(data.map(d => d.activity))
    .range(["#90B44B", "#42602D", "#90B44B", "#42602D", "#90B44B"])

//console.log(myColor.domain(), myColor.range())

svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d.count))
    .attr("x", d => xScale(d.activity))
    .attr("y", d => yScale(d.count))
    .attr("fill", d => myColor(d.activity))

})