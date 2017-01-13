var lineDash;
var barDash;
var multiBarDash;

function drawLineChart(){
    d3.select('svg').empty();
    var statements = lineDash.data.where(
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro|02-ingredients|03-steps|04-video|05-quiz))$/');
    lineDash.data = statements;
    var datum, moduleNames;
    var formattedData = formatLineData(lineDash.data);
    datum = formattedData[0];
    moduleNames = formattedData[1];
    graphLineModules(datum, moduleNames);
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
    graphMultiBarModules(formatMultiData(multiBarDash.data));
}

var graphLineModules = (function(datum, moduleNames) {
    var lineChart = nv.models.lineChart()
        .useInteractiveGuideline(true)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .margin({bottom: 100, right: 50})
    lineChart.xAxis
        .rotateLabels(45)
        .tickValues(Array.apply(null, {length: datum[0].values.length}).map(Number.call, Number))
        .tickFormat(function(d){
            return moduleNames[d];
        })
    d3.select('#linechart')
        .datum(datum)
        .call(lineChart);
    nv.utils.windowResize(lineChart.update);    
    return lineChart;
});

function formatLineData(data) {
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

var graphMultiBarModules = (function(datum) {

    var moduleNames = ['01-intro', '02-ingredients', '03-steps', '04-video', '05-quiz'];
    var mBarChart = nv.models.multiBarChart()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .margin({bottom: 100, right: 50})
    mBarChart.xAxis
        .rotateLabels(45)
        .tickValues(Array.apply(null, {length: datum[0].values.length}).map(Number.call, Number))
        .tickFormat(function(d){
            return moduleNames[d];
        })

    d3.select('#multibarchart')
        .datum(datum)
        .transition()
        .duration(500)
        .call(mBarChart);
    nv.utils.windowResize(mBarChart.update);    
    return mBarChart;
});

function formatMultiData(data) {
    var ret = [{key: "launched", values: []}, {key: "read", values: []}];
    var grps = data.orderBy('object.id').groupBy('verb.id').groupBy('object.id');

    grps.contents[0].data.map(function(o, i){
        var idx;
        switch (o.group){
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/01-intro":
                idx = 0;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/02-ingredients":
                idx = 1;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps":
                idx = 2;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/04-video":
                idx = 3;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/05-quiz":
                idx = 4;
                break;
        }
        ret[0].values.push({x: idx, y: o.data.length});
    });
    
    var introCount, ingCount, stepCount, vidCount, quizCount;
    introCount = ingCount = stepCount = vidCount = quizCount = 0;
    grps.contents[1].data.map(function(o, i){
        switch (true) {
            case /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro)(\/{0,1})(.*))$/.test(o.group):
                introCount += o.data.length;
            break;
            case /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(02-ingredients)(\/{0,1})(.*))$/.test(o.group):
                ingCount += o.data.length; 
            break;
            case /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(03-steps)(\/{0,1})(.*))$/.test(o.group):
                stepCount += o.data.length;
            break;
            case /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(04-video)(\/{0,1})(.*))$/.test(o.group):
                vidCount += o.data.length;
            break;
            case /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(05-quiz)(\/{0,1})(.*))$/.test(o.group):
                quizCount += o.data.length;
            break;
        }
    });

    ret[1].values.push({x: 0, y: introCount});
    ret[1].values.push({x: 1, y: ingCount});
    ret[1].values.push({x: 2, y: stepCount});
    ret[1].values.push({x: 3, y: vidCount});
    ret[1].values.push({x: 4, y: quizCount});

    return ret;
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