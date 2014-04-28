var width = 960,
        height = 600;

var rateById = d3.map();

var quantize = d3.scale.quantize()
        .domain([0, .6])
        .range(d3.range(9).map(function(i) {
    return "q" + i + "-9";
}));

var projection = d3.geo.albersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);

var path = d3.geo.path()
        .projection(projection);

var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);
var casesId = [];
var casesCount = [];
queue()
        .defer(d3.json, "../data/us.json")
        .defer(d3.csv, "../data/CTL-pub-data.csv", function(d) {
    var index = casesId.indexOf(d.Area_Code);
    if (index >= 0) {
        casesCount[index]++;
    } else {
        casesId.push(d.Area_Code);
        casesCount.push(1);
    }
})
        .await(ready);


function ready(error, us) {
    for (var i = 0; i < casesId.length; i++) {
        rateById.set(casesId[i], Math.sqrt(casesCount[i] / casesId.length));
    }
    svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .attr("class", function(d) {
        return quantize(rateById.get(d.id));
    })
            .attr("i", function(d) {
        return d.id;
    })
            .attr("d", path);

    svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
        return a !== b;
    }))
            .attr("class", "states")
            .attr("d", path);
}

d3.select(self.frameElement).style("height", height + "px");