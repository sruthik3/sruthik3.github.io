// Set Margins
var margin = {top: 10, right: 100, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#Global")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom+50)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Set Start ad End Dates for Axis
var startDate = new Date("1900-01-01"),
    endDate = new Date("2020-12-31");

//Plot Axis
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

x.domain([startDate,endDate]);
y.domain([-0.55,1.10]);

var g = svg.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


g.append("g")
.attr("class", "axis axis--x")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

g.append("g")
.attr("class", "axis axis--y")
.call(d3.axisLeft(y).ticks(6).tickFormat(function(d) { return (Math.round(d * 100.0) / 100.0); }))
.append("text")
.attr("class", "axis-title")
.attr("transform", "rotate(-90)")
.attr("y", 6)
.attr("dy", ".71em")
.style("text-anchor", "end")
.text("Temperature Rise");

///////////////////////////////////////////////////////////

var area = d3.area()
.x(function(d) { return x(d.Year); })
.y(function(d) { return y(d.Value); }); 

var parseTime = d3.timeParse("%Y")
bisectYear = d3.bisector(function(d) { return d.Year; }).left;

// Read File

function plotChart(fileN,classN){
    d3.csv(fileN, function(error, data) {
        if (error) throw error;
        data = data.filter(function(d) {
          return d.Year >= 1900;})
        data.forEach(function(d) {
        d.Year = parseTime(d.Year);
        d.Value = +d.Value;});

   /* g.append("path")
        .datum(data)
        .attr("class", classN)
        .attr("d", area);
        var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none"); */

    g.append("path")
        .datum(data)
        .attr("fill", "#69b3a2")
        .attr("fill-opacity", .8)
        .attr("stroke", "none")
        .attr("d", d3.area()
          .x(function(d) { return x(d.Year) })
          .y0( height )
          .y1(function(d) { return y(d.Value) })
          );
          var focus = g.append("g")
          .attr("class", "focus")
          .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 6);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectYear(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.Year > d1.Year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.Year) + "," + y(d.Value) + ")");
      focus.select("text").text(function() { return [d.Year.toISOString().substring(0,4),d.Value]; });
      focus.select(".x-hover-line").attr("y2", height - y(d.Value));
      focus.select(".y-hover-line").attr("x2", width + width);
    }

    ////////////////

           /* Code below relevant for annotations */
          /* var fh_x = data.filter(function(d){ return x(min(d.Value>0))};)
           var fh_y = data.filter(y(function(d){return (min(d.Value)>0};)) */
           const annotations = [
            
          {
            note: { label: "First rise above 0 degree celsius", 
              lineType:"none", 
              orientation: "top",
              "padding": 0.5, 
              "align": "middle" },
            className: "anomaly",
            type: d3.annotationCalloutCircle,
            subject: { radius: 8 },
            data: { x: "1/30/1939", y: 0.01 },
            dy: -80
          },


          {
            note: { label: "Peak rise of 1 degree celsius", 
              lineType:"none", 
              orientation: "top",
              "padding": 2, 
              "align": "middle" },
            className: "anomaly",
            type: d3.annotationCalloutCircle,
            subject: { radius: 8 },
            data: { x: "01/01/2016", y: 1.0},
            dy: 10
          }
          
        ]

        //An example of taking the XYThreshold and merging it 
          //with custom settings so you don't have to 
          //repeat yourself in the annotations Objects
          const type = d3.annotationCustomType(
            d3.annotationXYThreshold, 
            {"note":{
                "lineType":"none",
                "orientation": "left",
                "align":"middle"}
            }
          )

          const makeAnnotations = d3.annotation()
            .type(type)
            //Gives you access to any data objects in the annotations array
            .accessors({ 
              x: function(d){ return x(new Date(d.x))},
              y: function(d){ return y(d.y) }
            })
            .annotations(annotations)

          //d3.select("svg")
            g.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)


    });
}

//////////////

function plotChartBack(fileN,classN)
{
    d3.csv(fileN, function(error, data) {
        if (error) throw error;
        data.forEach(function(d) {
        d.Year = parseTime(d.Year);
        d.Value = +d.Value;});

      g.append("path")
        .datum(data)
        .attr("fill", "#69b3a2")
        .attr("fill-opacity", .8)
        .attr("stroke", "none")
        .attr("d", d3.area()
          .x(function(d) { return x(d.Year) })
          .y0( height )
          .y1(function(d) { return y(d.Value) })
          );
        var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");
    });
}
plotChart("https://sruthik3.github.io/Global_Temp.csv","area");