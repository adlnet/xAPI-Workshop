var lineDash;
var barDash;
var multiBarDash;
var xData;
var moduleNames;

function drawLineChart(){
    d3.select('svg').empty();
    var statements = lineDash.data.where(
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro|02-ingredients|03-steps|04-video|05-quiz))$/');
    lineDash.data = statements;
    var data = formatData(lineDash.data);
    xData = data[0];
    moduleNames = data[1];
    graphLineModules();
}

function drawBarChart(){
    d3.select('svg').empty();
    var statements = barDash.data.where(
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro|02-ingredients|03-steps|04-video|05-quiz))$/');
    barDash.data = statements;    
    graphBarModules();
}

function drawMultiBarChart(){
    d3.select('svg').empty();
    var statements = multiBarDash.data.where(
        'verb.id = /(launched|read)$/ and (' +
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro|02-ingredients|03-steps|04-video|05-quiz)(\/{0,1})(.*))$/)');
    multiBarDash.data = statements;
    graphMultiBarModules();
}

var graphLineModules = (function() {
    var lineChart = nv.models.lineChart()
        .useInteractiveGuideline(true)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .margin({bottom: 100, right: 50})
    lineChart.xAxis
        .rotateLabels(45)
        .tickValues(Array.apply(null, {length: xData[0].values.length}).map(Number.call, Number))
        .tickFormat(function(d){
            return moduleNames[d];
        })
    d3.select('#linechart')
        .datum(xData)
        .call(lineChart);
    nv.utils.windowResize(lineChart.update);    
    return lineChart;
});

function formatData(data) {
    var ret = [{key: "times-launched", values: []}];
    var mod = [];
    var grps = data.orderBy('object.id').groupBy('object.id');
    for (var i = 0; i < grps.contents.length; i++) {
        ret[0].values[i] = {};
        ret[0].values[i].x = i;
        ret[0].values[i].y = grps.contents[i].data.length;
        mod.push(grps.contents[i].group.substring(grps.contents[i].group.lastIndexOf("/") + 1));
    }
    return [ret, mod];
}

function graphBarModules() {
    var label = localStorage.getItem("baseURI") + "/label";
    var barChart = barDash.createBarChart({
        pre: function(data){
            data.contents.map(function(cur, idx, arr) {
                    if ('extensions' in cur.object.definition) {
                        cur.object.definition.extensions[label] = cur.object.definition.name['en-US'].split(":")[1].substring(1);
                    } else {
                        cur.object.definition.extensions = {};
                        cur.object.definition.extensions[label] = cur.object.definition.name['en-US'].split(":")[1].substring(1);
                    }
                });
            return data.orderBy('object.id');
        },
        container: '#barchart',
        groupBy: 'object.id',
        rangeLabel: 'data.0.object.definition.extensions[' + label + ']',
        aggregate: ADL.count(),
        customize: function (chart) {
            chart.xAxis.rotateLabels(45);
        },
    });
    barChart.clear();
    barChart.draw();
}

function graphMultiBarModules() {
    var modules = multiBarDash.createMultiBarChart({
        container: '#multibarchart',
        groupBy: 'object.id',
        innerGroupBy: 'verb.id',
        rangeLabel: 'data.0.object.definition.name.en-US',
        aggregate:ADL.multiAggregate(ADL.count('verb.id')),
        customize: function (chart) {
            chart.xAxis.rotateLabels(45);
        },
    });
    modules.clear();
    modules.draw();
} 

$(document).ready(function() {
    ADL.launch(function(err, launchdata, xAPIWrapper) {
        if (!err) {
            ADL.XAPIWrapper = xAPIWrapper;
            localStorage.setItem("baseURI", launchdata.customData.content);
            console.log("--- content launched via xAPI Launch ---\n", ADL.XAPIWrapper.lrs, "\n", launchdata);
        } else {
            var conf = {
                "endpoint" : $("#endpoint").val(),
                "auth" : "Basic " + toBase64($("#username").val() + ":" + $("#password").val()),
            };
            ADL.XAPIWrapper.changeConfig(conf);
            localStorage.setItem("baseURI", "http://adlnet.gov/event/xapiworkshop/myworkshop");
            console.log("--- content not launched via xAPI Launch ---\n", ADL.XAPIWrapper.lrs);
        }
    }, true);
});

$( "#load-graphs" ).click(function() {
    if ($("#graphscontainer").is(":hidden")){
        $("#graphscontainer").show();
    }

    d3.select('svg').empty();
    lineDash = new ADL.XAPIDashboard();
    barDash = new ADL.XAPIDashboard();
    multiBarDash = new ADL.XAPIDashboard();

    lineDash.fetchAllStatements(
            {'activity': localStorage.getItem("baseURI"),
             'verb': ADL.verbs.launched.id,
             'related_activities': true
            },
            function(){drawLineChart();}
    );
    barDash.fetchAllStatements(
            {'activity': localStorage.getItem("baseURI"),
             'verb': ADL.verbs.launched.id,
             'related_activities': true
            },
            function(){drawBarChart();}
    );
    multiBarDash.fetchAllStatements(
            {'activity': localStorage.getItem("baseURI"),
             'related_activities': true
            },
            function(){drawMultiBarChart();}
    );
});
