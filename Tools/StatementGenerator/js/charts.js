xapicharts = function(){

    // async helper
    var _queryComplete = false;

    // json arrays with module labels and numbers
    // used in line and single series bar charts
    var _moduleList;
    var _numberList;

    // json array with steps page labels and values
    // used in dual series bar chart
    var _moduleNamePerPageList;
    var _moduleNumLaunchList
    var _pageNumReadList;

    // runs when HTML page loads.  sets everything up and loads charts
    var showCharts = function(){
        // setup credentials
        configLrs();

        // populate the module titles
        populateModuleList();

        // get the launches per module
        queryLaunchesPerModule();

        // show the line chart
        showLineGraph(_moduleList, _numberList, '#module-launch-chart-line');

        // show bar chart
        showBarChart(_moduleList, _numberList, '#module-launch-chart-bar');

        // get the reads per page compared to launches
        queryModuleLaunchesAndReadsPerPage();

        // show dual series bar chart
        showDualSeriesBarChart(_moduleNamePerPageList, _moduleNumLaunchList, _pageNumReadList, "#page-read-dual-chart-bar");

        // change the button text to say reload
        $('#load-graphs').text("Reload Graphs ");
    }


    // function that shows a bar chart
    var showBarChart = function(labels, values, htmlControlId){
        var data = {
          // A labels array that can contain any sort of values
          labels: labels,
          // Our series array that contains series objects or in this case series data arrays
          series: [
            values
          ]
        };

        var options = {
            width: 600,
            height: 300,
            seriesBarDistance: 10,
            axisX: {
                offset: 60
            },
            axisY: {
                offset: 80,
                labelInterpolationFnc: function(value) {
                  return value + ' -'
                },
                scaleMinSpace: 15
              }
        };

       // show label when loaded
        $(htmlControlId + "-label").show();

        // Create a new line chart object where as first parameter we pass in a selector
        // that is resolving to our chart container element. The Second parameter
        // is the actual data object.
        new Chartist.Bar(htmlControlId, data, options);
    }

   // function that shows a dual series bar chart
    var showDualSeriesBarChart = function(labels, values1, values2, htmlControlId){

        var data = {
          // A labels array that can contain any sort of values
          labels: labels,
          // Our series array that contains series objects or in this case series data arrays
          series: [
            values1,
            values2
          ]
        };

        var options = {
            width: 600,
            height: 300,
            seriesBarDistance: 10,
            axisX: {
                offset: 60
            },
            axisY: {
                offset: 80,
                labelInterpolationFnc: function(value) {
                  return value + '-'
                },
                scaleMinSpace: 15
              }
        };

       // show label when loaded
        $(htmlControlId + "-label").show();

        // Create a new line chart object where as first parameter we pass in a selector
        // that is resolving to our chart container element. The Second parameter
        // is the actual data object.
        new Chartist.Bar(htmlControlId, data, options);
    }
    // function that shows a line graph
    var showLineGraph = function(labels, values, htmlControlId){
        var data = {
          // A labels array that can contain any sort of values
          labels: labels,
          // Our series array that contains series objects or in this case series data arrays
          series: [
            values
          ]
        };

        var options = {
          showArea: true,
          width: 600,
          height: 300
        };

       // show label when loaded
        $(htmlControlId + "-label").show();

        // Create a new line chart object where as first parameter we pass in a selector
        // that is resolving to our chart container element. The Second parameter
        // is the actual data object.
        new Chartist.Line(htmlControlId, data, options);
    }

    // populate two arrays to be used by the chart function for # launches per module
    var queryModuleLaunchesAndReadsPerPage = function(){

        // populate the number of time launched from the LRS for each module
        _moduleNamePerPageList = new Array();
        _moduleNumLaunchList = new Array();
        _pageNumReadList = new Array();

        var search = ADL.XAPIWrapper.searchParams();

        // *********************************************************************
        // ** Intro
        // *********************************************************************
        // get intro module launches
        search['verb'] = ADL.verbs.launched.id;
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/01-intro";
        var introStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[0] = "Intro Page 1";
        _moduleNumLaunchList[0] = introStmts.length;

        // get intro module page
        search['verb'] = "http://example.com/xapi/verbs/read";
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/01-intro/p1";
        var introReadStmts = getCompleteStatementListFromLRSAsync(search);
        _pageNumReadList[0] = introReadStmts.length;


        // *********************************************************************
        // ** Ingredients
        // *********************************************************************
        // for ingredients
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/02-ingredients";
        search['verb'] = ADL.verbs.launched.id;
        var ingredientStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[1] = "Ingredients Page 1";
        _moduleNumLaunchList[1] = ingredientStmts.length;


        // get ingredient module pages
        // pg 1
        search['verb'] = "http://example.com/xapi/verbs/read";
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/02-ingredients/p1";
        var ingredientReadStmts = getCompleteStatementListFromLRSAsync(search);
        _pageNumReadList[1] = ingredientReadStmts.length;

        // pg 2
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/02-ingredients/p2";
        ingredientReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[2] = "Ingredients Page 2";
        _moduleNumLaunchList[2] = ingredientStmts.length;
        _pageNumReadList[2] = ingredientReadStmts.length;


        // *********************************************************************
        // ** Steps
        // *********************************************************************
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps";
        search['verb'] = ADL.verbs.launched.id;
        var stepsStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[3] = "Steps Page 1";
        _moduleNumLaunchList[3] = stepsStmts.length;

        // pg 1
        search['verb'] = "http://example.com/xapi/verbs/read";
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p1";
        var stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _pageNumReadList[3] = stepsReadStmts.length;

        // pg 2
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p2";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[4] = "Steps Page 2";
        _moduleNumLaunchList[4] = stepsStmts.length;
        _pageNumReadList[4] = stepsReadStmts.length;

        // pg 3
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p3";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[5] = "Steps Page 3";
        _moduleNumLaunchList[5] = stepsStmts.length;
        _pageNumReadList[5] = stepsReadStmts.length;

        // pg 4
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p4";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[6] = "Steps Page 4";
        _moduleNumLaunchList[6] = stepsStmts.length;
        _pageNumReadList[6] = stepsReadStmts.length;

        // pg 5
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p5";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[7] = "Steps Page 5";
        _moduleNumLaunchList[7] = stepsStmts.length;
        _pageNumReadList[7] = stepsReadStmts.length;

        // pg 6
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p6";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[8] = "Steps Page 6";
        _moduleNumLaunchList[8] = stepsStmts.length;
        _pageNumReadList[8] = stepsReadStmts.length;

        // pg 7
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p7";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[9] = "Steps Page 7";
        _moduleNumLaunchList[9] = stepsStmts.length;
        _pageNumReadList[9] = stepsReadStmts.length;

        // pg 8
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p8";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[10] = "Steps Page 8";
        _moduleNumLaunchList[10] = stepsStmts.length;
        _pageNumReadList[10] = stepsReadStmts.length;

        // pg 9
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps/p9";
        stepsReadStmts = getCompleteStatementListFromLRSAsync(search);
        _moduleNamePerPageList[11] = "Steps Page 9";
        _moduleNumLaunchList[11] = stepsStmts.length;
        _pageNumReadList[11] = stepsReadStmts.length;
    }

    // populate two arrays to be used by the chart function for # launches per module
    var queryLaunchesPerModule = function(){

        // populate the number of time launched from the LRS for each module
        _numberList = new Array();

        var search = ADL.XAPIWrapper.searchParams();
        search['verb'] = ADL.verbs.launched.id;

        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/01-intro";
        var introStmts = getCompleteStatementListFromLRSAsync(search);

        //console.log(introStmts);
        _numberList[0] = introStmts.length;
        //console.log(introStmts.length);

        // for ingredients
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/02-ingredients";
        var ingredientStmts = getCompleteStatementListFromLRSAsync(search);
        _numberList[1] = ingredientStmts.length;
        //console.log(ingredientStmts.length);

        // for steps
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/03-steps";
        var stepsStmts = getCompleteStatementListFromLRSAsync(search);
        _numberList[2] = stepsStmts.length;

        // for video
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/04-video";
        var videoStmts = getCompleteStatementListFromLRSAsync(search);
        _numberList[3] = videoStmts.length;

        // for quiz
        search['activity'] = "http://adlnet.gov/xapi/samples/xapi-jqm/course/05-quiz";
        var quizStmts = getCompleteStatementListFromLRSAsync(search);
        _numberList[4] = quizStmts.length;
    }

    // populate the module names
    var populateModuleList = function(){
        _moduleList = new Array();

        _moduleList[0] = "Introduction";
        _moduleList[1] = "Ingredients";
        _moduleList[2] = "Steps";
        _moduleList[3] = "Video";
        _moduleList[4] = "Quiz";
    }

    // lrs configuration object
//    var conf = {
//      "endpoint" : "https://lrs.adlnet.gov/xapi/",
//      "user" : "xapi-tools",
//      "password" : "xapi-tools",
//    };

    // function that configures lrs
    var configLrs = function(){
       // get LRS credentials from user interface
        var endpoint = $("#endpoint").val();
        var user = $("#username").val();
        var password = $("#password").val();

        var conf = {
            "endpoint" : endpoint,
            "auth" : "Basic " + toBase64(user + ":" + password),
        };
        ADL.XAPIWrapper.changeConfig(conf);
    }

    var getCompleteStatementListFromLRSAsyncAsync = function(search){
        var statements;

        ADL.XAPIWrapper.getStatements(search, null,
               function getmore(r){
                  var res = JSON.parse(r.response);

                  if (statements == null){
                    //console.log("statements null");
                    statements = res.statements;
                    //console.log("added results");
                    //console.log(statements);
                  }
                  else{
                    //console.log("statements not null");
                    statements.push.apply(statements, res.statements);
                    //console.log(statements);
                  }

                  //ADL.XAPIWrapper.log(res.statements);
                  if (res.more && res.more !== ""){
                     //console.log("getting more...");
                     ADL.XAPIWrapper.getStatements(search, res.more, getmore);
                  }
                  else{
                     // done getting values
                      _queryComplete = true;
                  }
               });

        //console.log(statements);
        return statements;
    }

    var getCompleteStatementListFromLRSAsync = function(search){
        var result = ADL.XAPIWrapper.getStatements(search);
        var statements = result.statements;

        while(result.more && result.more !== "")
        {
            var res = ADL.XAPIWrapper.getStatements(null, result.more);
            var stmts = res.statements;

            statements.push.apply(statements, stmts);

            result = res;
        }

        return statements;
    }

    // specify public objects
    return{
        showCharts:showCharts
    }
}();
