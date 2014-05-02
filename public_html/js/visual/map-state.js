var width = 960,
        height = 600;

var rateById = d3.map();
var caseById = d3.map();

var quantize = d3.scale.quantize()
        .domain([0, .15])
        .range(d3.range(255).map(function(i) {
    return 255 - i;
}));

var projection = d3.geo.albersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);

var path = d3.geo.path()
        .projection(projection);
function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.behavior.zoom().scaleExtent([1, 64]).on("zoom", zoom))
        .append("g");
var Countries;
var Labels;
var Legend;
var Legend_label;
var casesId = [];
var casesCount = [];
var sum = 0;

function reload(Case) {
    svg.selectAll("g").remove();
    Countries = svg.append("g").attr("id", "countries");
    Labels = svg.append("g").attr("id", "labels");
    Legend = svg.append("g").attr("id", "legend");
    Legend_label = svg.append("g").attr("id", "legend-label");
    Tooltip = svg.append("g").attr("id", "tooltip");
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
        caseById.set(casesId[i], casesCount[i]);
    }
    var Country = Countries.attr("class", "countries")
            .selectAll("path")
            .data(us.features)
            .enter().append("path")
            .attr("name", function(d) {
        return d.properties.name;
    })
            .attr("rate", function(d) {
        return 100 * rateById.get(d.properties.abbr);
    })
            .attr("cases", function(d) {
        return caseById.get(d.properties.abbr);
    })
            .attr("fill", function(d) {
        var rate = quantize(rateById.get(d.properties.abbr));
        return "rgb(" + rate + "," + rate + "," + rate + ")";
    })
            .attr("ttx", function(d) {
        return path.centroid(d)[0];
    })
            .attr("tty", function(d) {
        return path.centroid(d)[1];
    })
            .attr("d", path);
    Tooltip.attr("class", "tooltip")
            .append("rect")
            .attr("x", 838)
            .attr("y", 400)
            .attr("height", 140)
            .attr("width", 120)
            .attr("stroke", "#277")
            .attr("fill", "#ccc");
    Labels.attr("class", "labels")
            .selectAll("text")
            .data(us.features)
            .enter().append("text")
            .attr("font-size", "12px")
            .attr("opacity", "0.2")
            .attr("x", function(d) {
        return path.centroid(d)[0];
    })
            .attr("y", function(d) {
        return path.centroid(d)[1];
    })
            .text(function(d) {
        return d.properties.abbr;
    });
    Legend.attr("class", "legend")
            .selectAll("rect")
            .data([0, .05, .1, .15])
            .enter().append("rect")
            .attr("x", 900)
            .attr("y", function(d) {
        return 300 + 400 * d;
    })
            .attr("height", 10)
            .attr("width", 10)
            .attr("stroke", "#377")
            .attr("fill", function(d) {
        var rate = quantize(d);
        return "rgb(" + rate + "," + rate + "," + rate + ")";
    });
    Legend_label.attr("class", "labels")
            .selectAll("text")
            .data([0, .05, .1, .15])
            .enter().append("text")
            .attr("x", 920)
            .attr("y", function(d) {
        return 310 + 400 * d;
    })
            .text(function(d) {
        return (d * 100) + "%";
    });
    var current = '';
    Country.on("mouseover", function() {
        if (d3.select(this) !== current) {
            d3.select(this)
                    .attr("_fill", function() {
                return d3.select(this).attr("fill");
            })
                    .attr("fill", function() {
                var rate = quantize(parseFloat(d3.select(this).attr("rate")) / 100);
                return "rgb(" + (rate - 4) + "," + (rate + 7) + "," + (rate + 4) + ")";
            })
                    .attr("cursor", "pointer");
            Countries.selectAll("text").remove();
            Countries.append("text")
                    .attr("x", (parseFloat(d3.select(this).attr("ttx"))-10))
                    .attr("y", (parseFloat(d3.select(this).attr("tty"))))
                    .attr("fill", "#722")
                    .text((Math.round(100 * d3.select(this).attr("rate")) / 100) + "%");
            Countries.append("text")
                    .attr("x", (parseFloat(d3.select(this).attr("ttx"))-10))
                    .attr("y", (parseFloat(d3.select(this).attr("tty")) + 20))
                    .attr("fill", "#027")
                    .text(d3.select(this).attr("cases") + " cases");
            current = d3.select(this);
        }
    });
    Country.on("mouseout", function() {
        d3.select(this)
                .attr("fill", function() {
            return d3.select(this).attr("_fill");
        })
                .attr("cursor", "pointer");
    });
    Country.on("click", function() {
        Tooltip.selectAll("text").remove();
        Tooltip.append("text")
                .attr("x", 864)
                .attr("y", 440)
                .attr("fill", "#722")
                .text(d3.select(this).attr("name"));
        Tooltip.append("text")
                .attr("x", 864)
                .attr("y", 470)
                .attr("fill", "#722")
                .text((Math.round(100 * d3.select(this).attr("rate")) / 100) + "%");
        Tooltip.append("text")
                .attr("x", 864)
                .attr("y", 500)
                .attr("fill", "#027")
                .text(d3.select(this).attr("cases") + " cases");

//        window.open("country-profile/" + d3.select(this)
//                .attr("link"));
    });

}


d3.select(self.frameElement).style("height", height + "px");