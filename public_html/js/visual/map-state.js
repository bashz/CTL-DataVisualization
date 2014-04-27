var width = 960,
        height = 600;

var rateById = d3.map();

var quantize = d3.scale.quantize()
        .domain([0, 4])
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
        .defer(d3.json, "../data/states.json")
        .defer(d3.csv, "../data/CTL-pub-data.csv", function(d) {
    var state = d.State.toString().toLowerCase();
    var index = casesId.indexOf(state);
    if (index >= 0) {
        casesCount[index]++;
    } else {
        casesId.push(state);
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
            .data(us.features)
            .enter().append("path")
            .attr("class", function(d) {
        return quantize(rateById.get(d.properties.abbr));
    })
            .attr("text", function(d) {
        return d.properties.abbr;
    })
            .attr("d", path);

}

d3.select(self.frameElement).style("height", height + "px");