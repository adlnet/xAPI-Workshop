var lineDash;
var barDash;
var multiBarDash;

function drawLineChart(){
    d3.select('svg').empty();
    lineDash.data.where(
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro|02-ingredients|03-steps|04-video|05-quiz))$/');
    if (lineDash.data.contents.length > 0){
        var datum, moduleNames;
        var formattedData = formatLineData(lineDash.data);
        datum = formattedData[0];
        moduleNames = formattedData[1];
        graphLineModules(datum, moduleNames);        
    }
}

function drawBarChart(){
    d3.select('svg').empty();
    barDash.data.where(
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro|02-ingredients|03-steps|04-video|05-quiz))$/');  
    if (barDash.data.contents.length > 0){
        graphBarModules();
    }
}

function drawMultiBarChart(){
    d3.select('svg').empty();
    multiBarDash.data.where(
        'verb.id = /(launched|read)$/ and (' +
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/(01-intro|02-ingredients|03-steps|04-video|05-quiz)(\/{0,1})(.*))$/)');
    if (multiBarDash.data.contents.length > 0){
        graphMultiBarModules(formatMultiData(multiBarDash.data));
    }
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
    lineChart.yAxis
        .tickFormat(d3.format("d"))
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
            chart.yAxis.tickFormat(d3.format("d"));
        },
    });
    barChart.clear();
    barChart.draw();
}

function getChildData(datum) {
    if (datum.key == 'read') {
        childBarDash.fetchAllStatements(
                {'activity': localStorage.getItem("baseURI"),
                 'verb': ADL.verbs.read.id,
                 'related_activities': true
                },
                function(){graphChildBarModules(datum);}
        );
    }
};

function graphChildBarModules(datum) {
    d3.select('svg').empty();
    var module;
    switch(datum.x) {
        case 0:
            module = "01-intro";
            break;
        case 1:
            module = "02-ingredients";
            break;
        case 2:
            module = "03-steps";
            break;
        case 3:
            module = "04-video";
            break;
        case 4:
            module = "05-quiz";
            break;
    }
    document.getElementById("childModuleNumber").innerHTML = module;
    childBarDash.data.where(
        'object.id = /(http:\/\/adlnet\.gov\/xapi\/samples\/xapi-jqm\/course\/('+module+')(\/{0,1})(.*))$/');  
    if (childBarDash.data.contents.length > 0){
        var label = localStorage.getItem("baseURI") + "/label";
        var childBarChart = childBarDash.createBarChart({
            pre: function(data){
                data.contents.map(function(cur, idx, arr) {
                        if ('extensions' in cur.object.definition) {
                            // if you 'read' the video module, it has no pages in the name
                            if (cur.object.id.includes("04-video")){
                                cur.object.definition.extensions[label] = "p1"    
                            } else {
                                cur.object.definition.extensions[label] = cur.object.definition.name['en-US'].slice(-2);
                            }
                        } else {
                            cur.object.definition.extensions = {};
                            // if you 'read' the video module, it has no pages in the name
                            if (cur.object.id.includes("04-video")){
                                cur.object.definition.extensions[label] = "p1"    
                            } else {
                                cur.object.definition.extensions[label] = cur.object.definition.name['en-US'].slice(-2);
                            }
                        }                        
                    });
                return data.orderBy('object.id');
            },
            container: '#childbarchart',
            groupBy: 'object.id',
            rangeLabel: 'data.0.object.definition.extensions[' + label + ']',
            aggregate: ADL.count(),
            customize: function (chart) {
                chart.xAxis.rotateLabels(45);
                chart.yAxis.tickFormat(d3.format("d"));
            },
        });
        childBarChart.clear();
        childBarChart.draw();        
    }    
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
    mBarChart.yAxis
        .tickFormat(d3.format("d"));

    d3.select('#multibarchart')
        .datum(datum)
        .transition()
        .duration(500)
        .call(mBarChart);
    nv.utils.windowResize(mBarChart.update);    

    mBarChart.multibar.dispatch.on("elementClick", function(e) {
        getChildData(e.data);
    });
    return mBarChart;
});

function calculateReadStatements(data) {
    var introCount, ingCount, stepCount, vidCount, quizCount;
    introCount = ingCount = stepCount = vidCount = quizCount = 0;
    data.map(function(o, i){
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
    return [introCount, ingCount, stepCount, vidCount, quizCount];
}

function calculateLaunchStatements(data) {
    var introCount, ingCount, stepCount, vidCount, quizCount;
    introCount = ingCount = stepCount = vidCount = quizCount = 0;            
    data.map(function(o, i){
        switch (o.group){
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/01-intro":
                introCount += o.data.length;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/02-ingredients":
                ingCount += o.data.length;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps":
                stepCount += o.data.length;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/04-video":
                vidCount += o.data.length;
                break;
            case "http://adlnet.gov/xapi/samples/xapi-jqm/course/05-quiz":
                quizCount += o.data.length;
                break;
        }
    });    
    return [introCount, ingCount, stepCount, vidCount, quizCount]; 
}

function formatMultiData(data) {
    var ret = [{key: "launched", values: []}, {key: "read", values: []}];
    var grps = data.orderBy('object.id').groupBy('verb.id').groupBy('object.id');

    // the order of the data wasn't the same each time. this checks if there's only 'read' or only
    // 'launched' data, as well as which order they're in if both are supplied.
    if (grps.contents.length == 0){
        console.log("No data to report for multibarchart")
    }
    else if (grps.contents.length == 1){
        if (grps.contents[0].group == "http://adlnet.gov/expapi/verbs/read"){
            var counts = calculateReadStatements(grps.contents[0].data);

            ret[1].values.push({x: 0, y: counts[0]});
            ret[1].values.push({x: 1, y: counts[1]});
            ret[1].values.push({x: 2, y: counts[2]});
            ret[1].values.push({x: 3, y: counts[3]});
            ret[1].values.push({x: 4, y: counts[4]});

        }
        else if (grps.contents[0].group == "http://adlnet.gov/expapi/verbs/launched"){
            var counts = calculateLaunchStatements(grps.contents[0].data);           

            ret[0].values.push({x: 0, y: counts[0]});
            ret[0].values.push({x: 1, y: counts[1]});
            ret[0].values.push({x: 2, y: counts[2]});
            ret[0].values.push({x: 3, y: counts[3]});
            ret[0].values.push({x: 4, y: counts[4]});
        }
    }
    else if (grps.contents.length == 2){
        if (grps.contents[0].group == "http://adlnet.gov/expapi/verbs/read"){
            var counts = calculateLaunchStatements(grps.contents[1].data);           
            
            ret[0].values.push({x: 0, y: counts[0]});
            ret[0].values.push({x: 1, y: counts[1]});
            ret[0].values.push({x: 2, y: counts[2]});
            ret[0].values.push({x: 3, y: counts[3]});
            ret[0].values.push({x: 4, y: counts[4]});
            
            var counts = calculateReadStatements(grps.contents[0].data);

            ret[1].values.push({x: 0, y: counts[0]});
            ret[1].values.push({x: 1, y: counts[1]});
            ret[1].values.push({x: 2, y: counts[2]});
            ret[1].values.push({x: 3, y: counts[3]});
            ret[1].values.push({x: 4, y: counts[4]});
        }
        else{
            var counts = calculateLaunchStatements(grps.contents[0].data);          
            
            ret[0].values.push({x: 0, y: counts[0]});
            ret[0].values.push({x: 1, y: counts[1]});
            ret[0].values.push({x: 2, y: counts[2]});
            ret[0].values.push({x: 3, y: counts[3]});
            ret[0].values.push({x: 4, y: counts[4]});
            
            var counts = calculateReadStatements(grps.contents[1].data);

            ret[1].values.push({x: 0, y: counts[0]});
            ret[1].values.push({x: 1, y: counts[1]});
            ret[1].values.push({x: 2, y: counts[2]});
            ret[1].values.push({x: 3, y: counts[3]});
            ret[1].values.push({x: 4, y: counts[4]});
        }
    }

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
            localStorage.setItem("baseURI", "http://adlnet.gov/event/xapiworkshop/iFest/2017");
            console.log("--- content not launched via xAPI Launch ---\n", ADL.XAPIWrapper.lrs);
        }
    }, true);
});

$( "#load-graphs" ).click(function() {
    if ($("#graphscontainer").is(":hidden")){
        $("#graphscontainer").show();
    }

    d3.selectAll("svg > *").remove();
    document.getElementById("childModuleNumber").innerHTML = "X";
    lineDash = new ADL.XAPIDashboard();
    barDash = new ADL.XAPIDashboard();
    multiBarDash = new ADL.XAPIDashboard();
    childBarDash = new ADL.XAPIDashboard();

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