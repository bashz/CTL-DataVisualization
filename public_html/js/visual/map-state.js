var width = 960,
        height = 600;

var rateById = d3.map();

var quantize = d3.scale.quantize()
        .domain([0, .15])
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
var Countries;
var Labels;
var casesId = [];
var casesCount = [];
var sum = 0;

function reload(Case) {
    svg.selectAll("g").remove();
    sum = 0;
    casesId = [];
    casesCount = [];
    queue()
            .defer(d3.json, "../data/states.json")
            .defer(d3.csv, "../data/CTL-pub-data.csv", function(d) {
        var Type;
        if (!Case)
            Type = "1";
        else if (Case === "abuse")
            Type = d.abuse;
        else if (Case === "anxiety")
            Type = d.anxiety;
        else if (Case === "bereavement")
            Type = d.bereavement;
        else if (Case === "bully")
            Type = d.bully;
        else if (Case === "depressed")
            Type = d.depressed;
        else if (Case === "eating")
            Type = d.eating;
        else if (Case === "family")
            Type = d.family;
        else if (Case === "friend")
            Type = d.friend;
        else if (Case === "isolated")
            Type = d.isolated;
        else if (Case === "lgbtq")
            Type = d.lgbtq;
        else if (Case === "medical")
            Type = d.medical;
        else if (Case === "relationship")
            Type = d.relationship;
        else if (Case === "school")
            Type = d.school;
        else if (Case === "self_harm")
            Type = d.self_harm;
        else if (Case === "sexual_abuse")
            Type = d.sexual_abuse;
        else if (Case === "stress")
            Type = d.stress;
        else if (Case === "substance")
            Type = d.substance;
        else if (Case === "suicidal_ideation")
            Type = d.suicidal_ideation;
        else if (Case === "third_party")
            Type = d.third_party;
        else if (Case === "other")
            Type = d.other;

        if (Type === "1") {
            var state = d.State.toString().toLowerCase();
            var index = casesId.indexOf(state);
            if (index >= 0) {
                casesCount[index]++;
            } else {
                casesId.push(state);
                casesCount.push(1);
            }
            sum++;
        }
    })
            .await(ready);
}

reload();

function ready(error, us) {
    for (var i = 0; i < casesId.length; i++) {
        rateById.set(casesId[i], casesCount[i] / sum);
    }
    Countries = svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(us.features)
            .enter().append("path")
            .attr("class", function(d) {
        return quantize(rateById.get(d.properties.abbr));
    })
            .attr("d", path);
    Labels = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(us.features)
            .enter().append("text")
            .attr("x", function(d) {
        return path.centroid(d)[0];
    })
            .attr("y", function(d) {
        return path.centroid(d)[1];
    }).text(function(d) {
        return d.properties.abbr;
    });

}

d3.select(self.frameElement).style("height", height + "px");