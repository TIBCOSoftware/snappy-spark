
var isMemberCellExpanded = {};


function toggleCellDetails(detailsId) {

  $("#"+detailsId).toggle();

  var spanId = $("#"+detailsId+"-btn");
  if(spanId.hasClass("caret-downward")) {
    spanId.addClass("caret-upward");
    spanId.removeClass("caret-downward");
    isMemberCellExpanded[detailsId] = true;
  } else {
    spanId.addClass("caret-downward");
    spanId.removeClass("caret-upward");
    isMemberCellExpanded[detailsId] = false;
  }
}

function generateProgressBarHtml(progressValue){
  var progressBarHtml =
          '<div style="width:100%;">'
           + '<div style="float: left; width: 75%;">'
             + '<div class="progressBar">'
               + '<div class="completedProgress" style="width: '
                   + progressValue.toFixed(1) + '%;">&nbsp;</div>'
             + '</div>'
           + '</div>'
           + '<div class="progressValue"> ' + progressValue.toFixed(1) + ' %</div>'
        + '</div>';

  return progressBarHtml;
}

function getDetailsCellExpansionProps(key){
  var cellProps = {
        caretClass: 'caret-downward',
        displayStyle: 'display:none;'
      };
  if(isMemberCellExpanded[key]) {
      cellProps.caretClass = 'caret-upward';
      cellProps.displayStyle = 'display:block;';
  }
  return cellProps;
}

function generateDescriptionCellHtml(row) {
  var cellProps = getDetailsCellExpansionProps(row.userDir);

  var descText = row.host + " | " + row.userDir + " | " + row.processId;
  var descHtml =
          '<div style="float: left; font-weight: bold;">'
          + '<a href="/dashboard/memberDetails/?memId=' + row.id + '">'
          + descText + '</a>'
        + '</div>'
        + '<div style="width: 10px; float: right; padding-right: 10px;'
          +' cursor: pointer;" onclick="toggleCellDetails(\'' + row.userDir + '\');">'
          + '<span class="' + cellProps.caretClass + '" id="' + row.userDir + '-btn' + '"></span>'
        + '</div>'
        + '<div class="cellDetailsBox" id="' + row.userDir + '" '
          + 'style="'+ cellProps.displayStyle + '">'
          + '<span>'
            + '<strong>Host:</strong>' + row.host
            + '<br/><strong>Directory:</strong>' + row.userDirFullPath
            + '<br/><strong>Process ID:</strong>' + row.processId
          + '</span>'
        + '</div>';
  return descHtml;
}

// Content to be displayed in heap memory cell in Members Stats Grid
function generateHeapCellHtml(row){
  var cellProps = getDetailsCellExpansionProps(row.userDir + '-heap');

  var heapHtml = "NA";
  var heapStorageHtml = "NA";
  var heapExecutionHtml = "NA";

  if(row.memberType.toUpperCase() !== "LOCATOR"){
    var heapUsed = convertSizeToHumanReadable(row.heapMemoryUsed);
    var heapSize = convertSizeToHumanReadable(row.heapMemorySize);
    heapHtml = heapUsed[0] + " " + heapUsed[1]
                   + " / " + heapSize[0] + " " + heapSize[1];
    var heapStorageUsed = convertSizeToHumanReadable(row.heapStoragePoolUsed);
    var heapStorageSize = convertSizeToHumanReadable(row.heapStoragePoolSize);
    heapStorageHtml = heapStorageUsed[0] + " " + heapStorageUsed[1]
                      + " / " + heapStorageSize[0] + " " + heapStorageSize[1];
    var heapExecutionUsed = convertSizeToHumanReadable(row.heapExecutionPoolUsed);
    var heapExecutionSize = convertSizeToHumanReadable(row.heapExecutionPoolSize);
    heapExecutionHtml = heapExecutionUsed[0] + " " + heapExecutionUsed[1]
                      + " / " + heapExecutionSize[0] + " " + heapExecutionSize[1];
  }
  var jvmHeapUsed = convertSizeToHumanReadable(row.usedMemory);
  var jvmHeapSize = convertSizeToHumanReadable(row.totalMemory);
  var jvmHeapHtml = jvmHeapUsed[0] + " " + jvmHeapUsed[1]
                    + " / " + jvmHeapSize[0] + " " + jvmHeapSize[1];

  var heapCellHtml =
          '<div style="width: 80%; float: left; padding-right:10px;'
           + 'text-align:right;">' + heapHtml
        + '</div>'
        + '<div style="width: 5px; float: right; padding-right: 10px; '
           + 'cursor: pointer;" '
           + 'onclick="toggleCellDetails(\'' + row.userDir + '-heap' + '\');">'
           + '<span class="' + cellProps.caretClass + '" '
           + 'id="' + row.userDir + '-heap-btn"></span>'
        + '</div>'
        + '<div class="cellDetailsBox" id="'+ row.userDir + '-heap" '
           + 'style="width: 90%; ' + cellProps.displayStyle + '">'
           + '<span><strong>JVM Heap:</strong>'
           + '<br>' + jvmHeapHtml
           + '<br><strong>Storage Memory:</strong>'
           + '<br>' + heapStorageHtml
           + '<br><strong>Execution Memory:</strong>'
           + '<br>' + heapExecutionHtml
           + '</span>'
        + '</div>';
  return heapCellHtml;
}

// Content to be displayed in off-heap memory cell in Members Stats Grid
function generateOffHeapCellHtml(row){
  var cellProps = getDetailsCellExpansionProps(row.userDir + '-offheap');

  var offHeapHtml = "NA";
  var offHeapStorageHtml = "NA";
  var offHeapExecutionHtml = "NA";

  if(row.memberType.toUpperCase() !== "LOCATOR"){
    var offHeapUsed = convertSizeToHumanReadable(row.offHeapMemoryUsed);
    var offHeapSize = convertSizeToHumanReadable(row.offHeapMemorySize);
    offHeapHtml = offHeapUsed[0] + " " + offHeapUsed[1]
                      + " / " + offHeapSize[0] + " " + offHeapSize[1];
    var offHeapStorageUsed = convertSizeToHumanReadable(row.offHeapStoragePoolUsed);
    var offHeapStorageSize = convertSizeToHumanReadable(row.offHeapStoragePoolSize);
    offHeapStorageHtml = offHeapStorageUsed[0] + " " + offHeapStorageUsed[1]
                      + " / " + offHeapStorageSize[0] + " " + offHeapStorageSize[1];
    var offHeapExecutionUsed = convertSizeToHumanReadable(row.offHeapExecutionPoolUsed);
    var offHeapExecutionSize = convertSizeToHumanReadable(row.offHeapExecutionPoolSize);
    offHeapExecutionHtml = offHeapExecutionUsed[0] + " " + offHeapExecutionUsed[1]
                      + " / " + offHeapExecutionSize[0] + " " + offHeapExecutionSize[1];
  }

  var offHeapCellHtml =
          '<div style="width: 80%; float: left; padding-right:10px;'
           + 'text-align:right;">' + offHeapHtml
        + '</div>'
        + '<div style="width: 5px; float: right; padding-right: 10px; '
           + 'cursor: pointer;" '
           + 'onclick="toggleCellDetails(\'' + row.userDir + '-offheap' + '\');">'
           + '<span class="' + cellProps.caretClass + '" '
           + 'id="' + row.userDir + '-offheap-btn"></span>'
        + '</div>'
        + '<div class="cellDetailsBox" id="'+ row.userDir + '-offheap" '
           + 'style="width: 90%; ' + cellProps.displayStyle + '">'
           + '<span><strong>Storage Memory:</strong>'
           + '<br>' + offHeapStorageHtml
           + '<br><strong>Execution Memory:</strong>'
           + '<br>' + offHeapExecutionHtml
           + '</span>'
        + '</div>';
  return offHeapCellHtml;
}

function getMemberStatsGridConf() {
  // Members Grid Data Table Configurations
  var memberStatsGridConf = {
    "ajax": {
      "url": "/snappy-api/services/allmembers",
      "dataSrc": ""
    },
    "drawCallback": function( settings ) {
      var api = this.api();
      // var membersData = api.rows().data();
      // Output the data for the visible rows to the browser's console
      // updateClusterStats(membersData);
    },
    "columns": [
      { // Status
        data: function(row, type) {
                var statusImgUri = "";
                if (row.status.toUpperCase() == "RUNNING") {
                  statusImgUri = "/static/snappydata/running-status-icon-20x19.png"
                } else {
                  statusImgUri = "/static/snappydata/stopped-status-icon-20x19.png"
                }
                var statusHtml = '<div style="float: left; height: 24px; padding: 0 20px;" >'
                                  + '<img src="' + statusImgUri +'" data-toggle="tooltip" '
                                  + ' title="" data-original-title="'+ row.status +'" />'
                               + '</div>';
                return statusHtml;
              }
      },
      { // Description
        data: function(row, type) {
                var descHtml = generateDescriptionCellHtml(row);
                return descHtml;
              }
      },
      { // Type
        data: function(row, type) {
                var memberType = "";
                if(row.isActiveLead) {
                  memberType = '<div style="text-align:center;">'
                               + '<strong data-toggle="tooltip" title="" '
                                 + 'data-original-title="Active Lead">'
                                 + row.memberType
                               + '</strong>'
                             + '</div>';
                } else {
                  memberType = '<div style="text-align:center;">' + row.memberType + '</div>';
                }
                return memberType;
              }
      },
      { // CPU Usage
        data: function(row, type) {
                return generateProgressBarHtml(row.cpuActive);
              }
      },
      { // Memory Usage
        data: function(row, type) {
                var totalMemorySize = row.heapMemorySize + row.offHeapMemorySize;
                var totalMemoryUsed = row.heapMemoryUsed + row.offHeapMemoryUsed;
                var memoryUsage = (totalMemoryUsed * 100) / totalMemorySize;
                if(isNaN(memoryUsage)){
                  memoryUsage = 0;
                }
                return generateProgressBarHtml(memoryUsage);
              }
      },
      { // Heap Usage
        data: function(row, type) {
                return generateHeapCellHtml(row);
              }
      },
      { // Off-Heap Usage
        data: function(row, type) {
                return generateOffHeapCellHtml(row);
              }
      }
    ]
  }

  return memberStatsGridConf;
}

function getTableStatsGridConf() {
  // Tables Grid Data Table Configurations
  var tableStatsGridConf = {
    "ajax": {
      "url": "/snappy-api/services/alltables",
      "dataSrc": ""
    },
    "columns": [
      { // Name
        data: function(row, type) {
                var nameHtml = '<div style="width:100%; padding-left:10px;">'
                               + row.tableName
                             + '</div>';
                return nameHtml;
              }
      },
      { // Storage Model
        data: function(row, type) {
                var smHtml = '<div style="width:100%; text-align:center;">'
                             + row.storageModel
                           + '</div>';
                return smHtml;
              }
      },
      { // Distribution Type
        data: function(row, type) {
                var dtHtml = '<div style="width:100%; text-align:center;">'
                             + row.distributionType
                           + '</div>';
                return dtHtml;
              }
      },
      { // Row Count
        data: function(row, type) {
                var rcHtml = '<div style="padding-right:10px; text-align:right;">'
                             + row.rowCount
                           + '</div>';
                return rcHtml;
              }
      },
      { // In Memory Size
        data: function(row, type) {
                var tableInMemorySize = convertSizeToHumanReadable(row.sizeInMemory);
                var msHtml = '<div style="padding-right:10px; text-align:right;">'
                             + tableInMemorySize[0] + ' ' + tableInMemorySize[1]
                           + '</div>';
                return msHtml;
              }
      },
      { // Total Size
        data: function(row, type) {
                var tableTotalSize = convertSizeToHumanReadable(row.totalSize);
                var tsHtml = '<div style="padding-right:10px; text-align:right;">'
                             + tableTotalSize[0] + ' ' + tableTotalSize[1]
                           + '</div>';
                return tsHtml;
              }
      },
      { // Bucket Count
        data: function(row, type) {
                var bcHtml = '<div style="padding-right:10px; text-align:right;">'
                             + row.bucketCount
                           + '</div>';
                return bcHtml;
              }
      }
    ]
  }

  return tableStatsGridConf;
}

function getExternalTableStatsGridConf() {
  // External Tables Grid Data Table Configurations
  var extTableStatsGridConf = {
    "ajax": {
      "url": "/snappy-api/services/allexternaltables",
      "dataSrc": ""
    },
    "columns": [
      { // Name
        data: function(row, type) {
                var nameHtml = '<div style="width:100%; padding-left:10px;">'
                               + row.tableName
                             + '</div>';
                return nameHtml;
              }
      },
      { // Provider
        data: function(row, type) {
                var providerHtml = '<div style="width:100%; text-align:center;">'
                                   + row.provider
                                 + '</span>';
                return providerHtml;
              }
      },
      { // Source
        data: function(row, type) {
                var sourceHtml = '<div style="padding-right:10px; text-align:left;">'
                                 + row.source
                               + '</span>';
                return sourceHtml;
              }
      }
    ]
  }

  return extTableStatsGridConf;
}

function loadGoogleCharts(){
  google.charts.load('current', {'packages':['corechart']});
  // google.charts.setOnLoadCallback(updateUsageCharts);
}

function updateUsageCharts(){
  var cpuChartData = new google.visualization.DataTable();
  cpuChartData.addColumn('number', 'Min');
  cpuChartData.addColumn('number', 'CPU');

  var heapChartData = new google.visualization.DataTable();
  heapChartData.addColumn('number', 'Min');
  heapChartData.addColumn('number', 'JVM');
  heapChartData.addColumn('number', 'Storage');
  heapChartData.addColumn('number', 'Execution');

  var offHeapChartData = new google.visualization.DataTable();
  offHeapChartData.addColumn('number', 'Min');
  offHeapChartData.addColumn('number', 'Storage');
  offHeapChartData.addColumn('number', 'Execution');

  var getsputsChartData = new google.visualization.DataTable();
  getsputsChartData.addColumn('number', 'Min');
  getsputsChartData.addColumn('number', 'Gets');
  getsputsChartData.addColumn('number', 'Puts');

  for(var i=0; i<180; i++){
    cpuChartData.addRow([i, (Math.random()*100)]);
    heapChartData.addRow([i, (Math.random()*100), (Math.random()*100), (Math.random()*100)]);
    offHeapChartData.addRow([i, (Math.random()*100), (Math.random()*100)]);
    getsputsChartData.addRow([i, (Math.random()*100), (Math.random()*50)]);
  }

  cpuChartOptions = {
              title: 'CPU Usage',
              curveType: 'function',
              legend: { position: 'bottom' },
              vAxis: {
                minValue: 0
              }
            };

  heapChartOptions = {
            title: 'Heap Usage',
            curveType: 'function',
            legend: { position: 'bottom' }
          };
  offHeapChartOptions = {
              title: 'Off-Heap Usage',
              curveType: 'function',
              legend: { position: 'bottom' }
            };
  getsputsChartOptions = {
              title: 'Gets and Puts',
              curveType: 'function',
              legend: { position: 'bottom' }
            };

  cpuChart = new google.visualization.LineChart(
                      document.getElementById('cpuUsageContainer'));
  cpuChart.draw(cpuChartData, cpuChartOptions);

  var heapChart = new google.visualization.LineChart(
                      document.getElementById('heapUsageContainer'));
  heapChart.draw(heapChartData, heapChartOptions);

  var offHeapChart = new google.visualization.LineChart(
                      document.getElementById('offheapUsageContainer'));
  offHeapChart.draw(offHeapChartData, offHeapChartOptions);

  var getsputsChart = new google.visualization.LineChart(
                        document.getElementById('getsputsContainer'));
    getsputsChart.draw(getsputsChartData, getsputsChartOptions);
}

$(document).ready(function() {

  loadGoogleCharts();

  $.ajaxSetup({
      cache : false
    });

  // Members Grid Data Table
  var membersStatsGrid = $('#memberStatsGrid').DataTable( getMemberStatsGridConf() );

  // Tables Grid Data Table
  var tableStatsGrid = $('#tableStatsGrid').DataTable( getTableStatsGridConf() );

  // External Tables Grid Data Table
  var extTableStatsGrid = $('#extTableStatsGrid').DataTable( getExternalTableStatsGridConf() );

  var clusterStatsUpdateInterval = setInterval(function() {
    // todo: need to provision when to stop and start update feature
    // clearInterval(clusterStatsUpdateInterval);

    $.getJSON("/snappy-api/services/clusterinfo",
      function (response, status, jqXHR) {
        // todo: refresh graph data and reload charts
        // var cpuUsageTrend = response[0].cpuUsageTrend;
        updateUsageCharts();

      });
  }, 5000);

  // Members stats are updated after every 30 seconds
  var memberStatsUpdateInterval = setInterval(function() {
    // todo: need to provision when to stop and start update feature
    // clearInterval(memberStatsUpdateInterval);

    $('#memberStatsGrid').DataTable().ajax.reload();
  }, 5000);

  // Tables stats are updated after every 10 seconds
  var tableStatsUpdateInterval = setInterval(function() {
      // todo: need to provision when to stop and start update feature
      // clearInterval(tableStatsUpdateInterval);

      $('#tableStatsGrid').DataTable().ajax.reload();
      $('#extTableStatsGrid').DataTable().ajax.reload();
    }, 10000);

});
