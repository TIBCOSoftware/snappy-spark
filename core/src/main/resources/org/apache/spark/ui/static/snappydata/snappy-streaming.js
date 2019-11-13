
function displayQueryStatistics(queryId) {
  var queryStats = {};
  if(selectedQueryUUID == "") {
    queryStats = streamingQueriesGridData[0];
  } else {
    queryStats = streamingQueriesGridData.find(obj => obj.queryUUID == queryId);
  }

  // return if data is not present
  if(queryStats == undefined) {
    return;
  }

  // set current selected query and highlight it in query navigation panel
  selectedQueryUUID = queryStats.queryUUID;

  var divList = $('#streamingQueriesGrid tbody tr td div');
  for (var i=0 ; i< divList.length ; i++) {
    if (divList[i].innerText == selectedQueryUUID) {
      var tr = divList[i].parentNode.parentNode;
      $(tr).toggleClass('queryselected');
      break;
    }
  }

  $("#selectedQueryName").html(queryStats.queryName);
  $("#startDateTime").html(queryStats.queryStartTimeText);
  $("#uptime").html(queryStats.queryUptimeText);
  $("#numBatchesProcessed").html(queryStats.numBatchesProcessed);
  var statusText = "";
  if (queryStats.isActive) {
    statusText = '<span style="color: green;">Active</span>';
  } else {
    statusText = '<span style="color: red;">Inactive</span>';
  }
  $("#status").html(statusText);

  $("#totalInputRows").html(queryStats.totalInputRows.toLocaleString(navigator.language));

  var qIRPSTrend = queryStats.inputRowsPerSecondTrend;
  $("#currInputRowsPerSec").html(
      qIRPSTrend[qIRPSTrend.length - 1].toLocaleString(navigator.language));

  var qPRPSTrend = queryStats.processedRowsPerSecondTrend;
  $("#currProcessedRowsPerSec").html(
      qPRPSTrend[qPRPSTrend.length - 1].toLocaleString(navigator.language));

  var qTPT = queryStats.totalProcessingTime;
  $("#totalProcessingTime").html(
      formatDurationVerbose(qTPT).toLocaleString(navigator.language));

  var qAPT = queryStats.avgProcessingTime;
  $("#avgProcessingTime").html(
      formatDurationVerbose(qAPT).toLocaleString(navigator.language));

  updateCharts(queryStats);

  $("#sourcesDetailsContainer").html(generateSourcesStats(queryStats.sources));
  $("#sinkDetailsContainer").html(generateSinkStats(queryStats.sink));
}

function generateSourcesStats(sources) {
  selectedQuerySourcesGridData = sources;
  selectedQuerySourcesGrid.clear().rows.add(selectedQuerySourcesGridData).draw();
}

function generateSinkStats(sink) {
  var sinkHTML = '<div style="width:100%;">'
                 + '<div style="padding: 0px 5px; float: left; font-weight: bold;">'
                   + 'Description:'
                 + '</div>'
                 + '<div style="float: left; padding: 0px 5px; text-align: left;"> '
                   + sink.description
                 + '</div>'
               + '</div>';
  return sinkHTML;
}

function updateCharts(queryStats) {
  // Load charts library if not already loaded
  if(!isGoogleChartLoaded) {
    // Set error message
    $("#googleChartsErrorMsg").show();
    return;
  }

  var numInputRowsChartData = new google.visualization.DataTable();
  numInputRowsChartData.addColumn('datetime', 'Time of Day');
  numInputRowsChartData.addColumn('number', 'Input Records');

  var inputVsProcessedRowsChartData = new google.visualization.DataTable();
  inputVsProcessedRowsChartData.addColumn('datetime', 'Time of Day');
  inputVsProcessedRowsChartData.addColumn('number', 'Input Records Per Sec');
  inputVsProcessedRowsChartData.addColumn('number', 'Processed Records Per Sec');

  var processingTimeChartData = new google.visualization.DataTable();
  processingTimeChartData.addColumn('datetime', 'Time of Day');
  processingTimeChartData.addColumn('number', 'Processing Time');

  var stateOperatorsStatsChartData = new google.visualization.DataTable();
  stateOperatorsStatsChartData.addColumn('datetime', 'Time of Day');
  stateOperatorsStatsChartData.addColumn('number', 'Total Records');

  var timeLine = queryStats.timeLine;
  var numInputRowsTrend = queryStats.numInputRowsTrend;
  var inputRowsPerSecondTrend = queryStats.inputRowsPerSecondTrend;
  var processedRowsPerSecondTrend = queryStats.processedRowsPerSecondTrend;
  var processingTimeTrend = queryStats.processingTimeTrend;
  var stateOpNumRowsTotalTrend = queryStats.stateOpNumRowsTotalTrend;

  for(var i=0 ; i < timeLine.length ; i++) {
    var timeX = new Date(timeLine[i]);

    numInputRowsChartData.addRow([
        timeX,
        numInputRowsTrend[i]]);

    inputVsProcessedRowsChartData.addRow([
        timeX,
        inputRowsPerSecondTrend[i],
        processedRowsPerSecondTrend[i]]);

     processingTimeChartData.addRow([
        timeX,
        processingTimeTrend[i]]);

     stateOperatorsStatsChartData.addRow([
        timeX,
        stateOpNumRowsTotalTrend[i]]);
  }

  numInputRowsChartOptions = {
    title: 'Input Records',
    // curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    }
  };

  inputVsProcessedRowsChartOptions = {
    title: 'Input Rate vs Processing Rate',
    // curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC', '#E67E22'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    }
  };

  processingTimeChartOptions = {
    title: 'Processing Time',
    // curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    }
  };

  stateOperatorsStatsChartOptions = {
    title: 'Aggregation States',
    // curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    }
  };

  // display state operator chart and other charts resizing accordingly
  if(stateOpNumRowsTotalTrend.length == 0) {
    $('#stateOperatorContainer').css("display", "none");
    $('#inputTrendsContainer').css("width", "31%");
    $('#processingTrendContainer').css("width", "31%");
    $('#processingTimeContainer').css("width", "31%");
  } else {
    $('#inputTrendsContainer').css("width", "23%");
    $('#processingTrendContainer').css("width", "23%");
    $('#processingTimeContainer').css("width", "23%");
    $('#stateOperatorContainer').css("display", "");
    $('#stateOperatorContainer').css("width", "23%");
    var stateOperatorsStatsChart = new google.visualization.LineChart(
          document.getElementById('stateOperatorContainer'));
    stateOperatorsStatsChart.draw(stateOperatorsStatsChartData,
          stateOperatorsStatsChartOptions);
  }

  var numInputRowsChart = new google.visualization.LineChart(
        document.getElementById('inputTrendsContainer'));
  numInputRowsChart.draw(numInputRowsChartData,
        numInputRowsChartOptions);

  var inputVsProcessedRowsChart = new google.visualization.LineChart(
        document.getElementById('processingTrendContainer'));
  inputVsProcessedRowsChart.draw(inputVsProcessedRowsChartData,
        inputVsProcessedRowsChartOptions);

  var processingTimeChart = new google.visualization.LineChart(
        document.getElementById('processingTimeContainer'));
  processingTimeChart.draw(processingTimeChartData,
        processingTimeChartOptions);

}

function getQuerySourcesGridConf() {
  // Streaming Queries Grid Data Table Configurations
  var querySourcesGridConf = {
    data: selectedQuerySourcesGridData,
    "dom": '',
    "columns": [
      { // Source description
        data: function(row, type) {
                var descHtml = '<div style="width:100%; padding-left:10px;">'
                              + row.description
                              + '</div>';
                return descHtml;
              },
        "orderable": true
      },
      { // Input Rows
        data: function(row, type) {
                var irValue = "";
                if (isNaN(row.numInputRows)) {
                  irValue = "NA";
                } else{
                  irValue = row.numInputRows.toLocaleString(navigator.language);
                }
                var irHtml = '<div style="width:100%; padding-left:10px;">'
                              + irValue
                              + '</div>';
                return irHtml;
              },
        "orderable": false
      },
      { // Input Rows Per Second
        data: function(row, type) {
                var irpsValue = "";
                if (isNaN(row.inputRowsPerSecond)) {
                  irpsValue = "NA";
                } else{
                  irpsValue = Math.round(row.inputRowsPerSecond).toLocaleString(navigator.language);
                }
                var irpsHtml = '<div style="width:100%; padding-left:10px;">'
                              + irpsValue
                              + '</div>';
                return irpsHtml;
              },
        "orderable": false
      },
      { // Processed Rows Per Second
        data: function(row, type) {
                var prpsValue = "";
                if (isNaN(row.processedRowsPerSecond)) {
                  prpsValue = "NA";
                } else{
                  prpsValue = Math.round(row.processedRowsPerSecond).toLocaleString(navigator.language);
                }
                var prpsHtml = '<div style="width:100%; padding-left:10px;">'
                              + prpsValue
                              + '</div>';
                return prpsHtml;
              },
        "orderable": false
      }
    ]
  }
  return querySourcesGridConf;
}

function getStreamingQueriesGridConf() {
  // Streaming Queries Grid Data Table Configurations
  var streamingQueriesGridConf = {
    data: streamingQueriesGridData,
    "dom": '',
    "columns": [
      { // Query Names
        data: function(row, type) {
                var qNameHtml = '<div style="display:none;">' + row.queryUUID + '</div>'
                              + '<div style="width:100%; padding-left:10px; cursor: pointer;"'
                              + ' onclick="displayQueryStatistics(\''+ row.queryUUID +'\')">'
                              + row.queryName
                              + '</div>';
                return qNameHtml;
              },
        "orderable": true
      }
    ]
  }
  return streamingQueriesGridConf;
}

function addDataTableSingleRowSelectionHandler(tableId) {
  $('#' + tableId + ' tbody').on( 'click', 'tr', function () {
    $('#' + tableId + ' tbody').children('.queryselected').toggleClass('queryselected');
    // $(this).toggleClass('queryselected');
    displayQueryStatistics($(this).children().children().first().text());
  } );
}

function loadStreamingStatsInfo() {

  if(!isGoogleChartLoaded) {
    $.ajax({
      url: "https://www.gstatic.com/charts/loader.js",
      dataType: "script",
      success: function() {
        loadGoogleCharts();
      }
    });
  }

  $.ajax({
    url:"/snappy-streaming/services/streams",
    dataType: 'json',
    // timeout: 5000,
    success: function (response, status, jqXHR) {
      // Hide error message, if displayed
      $("#AutoUpdateErrorMsg").hide();

      streamingQueriesGridData = response[0].allQueries;
      streamingQueriesGrid.clear().rows.add(streamingQueriesGridData).draw();

      // Display currently selected queries stats
      displayQueryStatistics(selectedQueryUUID);

    },
    error: ajaxRequestErrorHandler
  });
}

function loadGoogleCharts() {

  if((typeof google === 'object' && typeof google.charts === 'object')) {
    $("#googleChartsErrorMsg").hide();
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(googleChartsLoaded);
    isGoogleChartLoaded = true;
  } else {
    $("#googleChartsErrorMsg").show();
  }

}

function googleChartsLoaded() {
  loadStreamingStatsInfo();
}

var isGoogleChartLoaded = false;
var streamingQueriesGrid;
var streamingQueriesGridData = [];
var selectedQueryUUID = "";
var selectedQuerySourcesGrid;
var selectedQuerySourcesGridData = [];

$(document).ready(function() {

  loadGoogleCharts();

  $.ajaxSetup({
      cache : false
    });

  // Members Grid Data Table
  streamingQueriesGrid = $('#streamingQueriesGrid').DataTable( getStreamingQueriesGridConf() );
  addDataTableSingleRowSelectionHandler('streamingQueriesGrid');

  selectedQuerySourcesGrid = $('#querySourcesGrid').DataTable( getQuerySourcesGridConf() );

  var streamingStatsUpdateInterval = setInterval(function() {
    loadStreamingStatsInfo();
  }, 5000);



});