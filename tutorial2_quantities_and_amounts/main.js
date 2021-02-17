
d3.csv('../data/squirrelActivities.csv', d3.autoType).then(data => {
    console.log('data', data)

const width = window.innerWidth *.25;
const height = window.innerHeight /3;
const margins = { top:10, bottom: 25, left:10, right:10}; 

const xScale = d3.scaleBand()
    .domain(data.map(d => d.activity))
    .range([0, width])
    .paddingInner(.3)
console.log(xScale.domain(), xScale.range())

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([height, 0])
console.log(xScale, xScale('eating'))
console.log(yScale.domain(), yScale.range())

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

svg.selectAll("text.activity")
    .data(data)
    .join("text")
    .attr("class", 'activity')
    .attr("x", d => xScale(d.activity) + (xScale.bandwidth() / 2))
    .attr("y", height - margins.bottom)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text(d => d.activity)
    .style("fill", "white")

svg.selectAll("text.count")
    .data(data)
    .join("text")
    .attr("class", 'count')
    .attr("x", d => xScale(d.activity) + (xScale.bandwidth() / 2))
    .attr("y", d => yScale(d.count))
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text(d => d3.format(",")(d.count))
    .style("fill", "white")

const xScale1 = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([0, width])

console.log(xScale1.domain(), xScale1.range())

const yScale1 = d3.scaleBand()
    .domain(data.map(d => d.activity))
    .range([height, 0])
    .paddingInner(.2)

console.log(yScale1.domain(), yScale1.range())
console.log(yScale1, yScale1('eating'))

const svg1 = d3.select("#barchart1")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

svg1.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("height", yScale1.bandwidth())
    .attr("width", d => xScale1(d.count))
    .attr("y", d => yScale1(d.activity))
    .attr("x", d => 0)
    .attr("fill", d => myColor(d.activity))

svg1.selectAll("text.activity")
    .data(data)
    .join("text")
    .attr("class", 'activity')
    .attr("y", d => yScale1(d.activity) + (yScale1.bandwidth() / 2))
    .attr("x", d => 0)
    .attr("dx", "2em")
    .attr("text-anchor", "middle")
    .text(d => d.activity)
    .style("fill", "white")
    .attr("transform", "rotate(0)")

svg1.selectAll("text.count")
    .data(data)
    .join("text")
    .attr("class", 'count')
    .attr("y", d => yScale1(d.activity) + (yScale1.bandwidth() / 2))
    .attr("x", d => xScale1(d.count))
    .attr("dx", "-2em")
    .attr("text-anchor", "middle")
    .text(d => d3.format(",")(d.count))
    .style("fill", "white")

})