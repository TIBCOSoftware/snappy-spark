

var baseParams;

var curLogLength;
var startByte;
var endByte;
var totalLogLength;

var byteLength;

function setLogScroll(oldHeight) {
  var logContent = $(".log-content");
  logContent.scrollTop(logContent[0].scrollHeight - oldHeight);
}

function tailLog() {
  var logContent = $(".log-content");
  logContent.scrollTop(logContent[0].scrollHeight);
}

function setLogData() {
  $('#log-data').html("Showing " + curLogLength + " Bytes: " + startByte
    + " - " + endByte + " of " + totalLogLength);
}

function disableMoreButton() {
  var moreBtn = $(".log-more-btn");
  moreBtn.attr("disabled", "disabled");
  moreBtn.html("Top of Log");
}

function noNewAlert() {
  var alert = $(".no-new-alert");
  alert.css("display", "block");
  window.setTimeout(function () {alert.css("display", "none");}, 4000);
}

function loadMore() {
  var offset = Math.max(startByte - byteLength, 0);
  var moreByteLength = Math.min(byteLength, startByte);

  $.ajax({
    type: "GET",
    url: "/dashboard/memberDetails/log" + baseParams + "&offset=" + offset + "&byteLength=" + moreByteLength,
    success: function (data) {
      var oldHeight = $(".log-content")[0].scrollHeight;
      var newlineIndex = data.indexOf('\n');
      var dataInfo = data.substring(0, newlineIndex).match(/\d+/g);
      var retStartByte = dataInfo[0];
      var retLogLength = dataInfo[2];

      var cleanData = data.substring(newlineIndex + 1);
      if (retStartByte == 0) {
        disableMoreButton();
      }
      $("pre", ".log-content").prepend(cleanData);

      curLogLength = curLogLength + (startByte - retStartByte);
      startByte = retStartByte;
      totalLogLength = retLogLength;
      setLogScroll(oldHeight);
      setLogData();
    }
  });
}

function loadNew() {
  $.ajax({
    type: "GET",
    url: "/dashboard/memberDetails/log" + baseParams + "&byteLength=0",
    success: function (data) {
      var dataInfo = data.substring(0, data.indexOf('\n')).match(/\d+/g);
      var newDataLen = dataInfo[2] - totalLogLength;
      if (newDataLen != 0) {
        $.ajax({
          type: "GET",
          url: "/dashboard/memberDetails/log" + baseParams + "&byteLength=" + newDataLen,
          success: function (data) {
            var newlineIndex = data.indexOf('\n');
            var dataInfo = data.substring(0, newlineIndex).match(/\d+/g);
            var retStartByte = dataInfo[0];
            var retEndByte = dataInfo[1];
            var retLogLength = dataInfo[2];

            var cleanData = data.substring(newlineIndex + 1);
            $("pre", ".log-content").append(cleanData);

            curLogLength = curLogLength + (retEndByte - retStartByte);
            endByte = retEndByte;
            totalLogLength = retLogLength;
            tailLog();
            setLogData();
          }
        });
      } else {
        noNewAlert();
      }
    }
  });
}

function initLogPage(params, logLen, start, end, totLogLen, defaultLen) {
  baseParams = params;
  curLogLength = logLen;
  startByte = start;
  endByte = end;
  totalLogLength = totLogLen;
  byteLength = defaultLen;
  tailLog();
  if (startByte == 0) {
    disableMoreButton();
  }
}

function updateBasicMemoryStats(statsData){

  if(statsData.isLocator){
    return;
  }

  var currHeapStoragePoolUsed = convertSizeToHumanReadable(statsData.heapStoragePoolUsed);
  var currHeapStoragePoolSize = convertSizeToHumanReadable(statsData.heapStoragePoolSize);
  var currHeapExecutionPoolUsed = convertSizeToHumanReadable(statsData.heapExecutionPoolUsed);
  var currHeapExecutionPoolSize = convertSizeToHumanReadable(statsData.heapExecutionPoolSize);
  var currHeapMemoryUsed = convertSizeToHumanReadable(statsData.heapMemoryUsed);
  var currHeapMemorySize = convertSizeToHumanReadable(statsData.heapMemorySize);

  var currOffHeapStoragePoolUsed = convertSizeToHumanReadable(statsData.offHeapStoragePoolUsed);
  var currOffHeapStoragePoolSize = convertSizeToHumanReadable(statsData.offHeapStoragePoolSize);
  var currOffHeapExecutionPoolUsed = convertSizeToHumanReadable(statsData.offHeapExecutionPoolUsed);
  var currOffHeapExecutionPoolSize = convertSizeToHumanReadable(statsData.offHeapExecutionPoolSize);
  var currOffHeapMemoryUsed = convertSizeToHumanReadable(statsData.offHeapMemoryUsed);
  var currOffHeapMemorySize = convertSizeToHumanReadable(statsData.offHeapMemorySize);

  $("#currHeapStoragePool").text(
    currHeapStoragePoolUsed[0] + " " + currHeapStoragePoolUsed[1] + " / "
      + currHeapStoragePoolSize[0] + " " + currHeapStoragePoolSize[1] );
  $("#currHeapExecutionPool").text(
    currHeapExecutionPoolUsed[0] + " " + currHeapExecutionPoolUsed[1] + " / "
      + currHeapExecutionPoolSize[0] + " " + currHeapExecutionPoolSize[1]);
  $("#currHeapMemory").text(
    currHeapMemoryUsed[0] + " " + currHeapMemoryUsed[1] + " / "
      + currHeapMemorySize[0] + " " + currHeapMemorySize[1]);
  $("#currOffHeapStoragePool").text(
    currOffHeapStoragePoolUsed[0] + " " + currOffHeapStoragePoolUsed[1] + " / "
      + currOffHeapStoragePoolSize[0] + " " + currOffHeapStoragePoolSize[1]);
  $("#currOffHeapExecutionPool").text(
    currOffHeapExecutionPoolUsed[0] + " " + currOffHeapExecutionPoolUsed[1] + " / "
      + currOffHeapExecutionPoolSize[0] + " " + currOffHeapExecutionPoolSize[1]);
  $("#currOffHeapMemory").text(
    currOffHeapMemoryUsed[0] + " " + currOffHeapMemoryUsed[1] + " / "
      + currOffHeapMemorySize[0] + " " + currOffHeapMemorySize[1]);
}

function updateUsageCharts(statsData){
  var cpuChartData = new google.visualization.DataTable();
  cpuChartData.addColumn('datetime', 'Time of Day');
  cpuChartData.addColumn('number', 'CPU');

  var heapChartData = new google.visualization.DataTable();
  heapChartData.addColumn('datetime', 'Time of Day');
  heapChartData.addColumn('number', 'JVM');
  heapChartData.addColumn('number', 'Storage');
  heapChartData.addColumn('number', 'Execution');

  var offHeapChartData = new google.visualization.DataTable();
  offHeapChartData.addColumn('datetime', 'Time of Day');
  offHeapChartData.addColumn('number', 'Storage');
  offHeapChartData.addColumn('number', 'Execution');

  var memoryUsageChartData = new google.visualization.DataTable();
  memoryUsageChartData.addColumn('datetime', 'Time of Day');
  memoryUsageChartData.addColumn('number', 'Memory');

  var timeLine = statsData.timeLine;
  var cpuUsageTrend = statsData.cpuUsageTrend;

  var jvmUsageTrend = statsData.jvmUsageTrend;
  var heapStorageUsageTrend = statsData.heapStorageUsageTrend;
  var heapExecutionUsageTrend = statsData.heapExecutionUsageTrend;

  var offHeapStorageUsageTrend = statsData.offHeapStorageUsageTrend;
  var offHeapExecutionUsageTrend = statsData.offHeapExecutionUsageTrend;

  var aggrMemoryUsageTrend = statsData.aggrMemoryUsageTrend;

  for(var i=0; i<timeLine.length; i++){
    var timeX = new Date(timeLine[i]);

    cpuChartData.addRow([timeX, cpuUsageTrend[i]]);
    heapChartData.addRow([timeX,
                          jvmUsageTrend[i],
                          heapStorageUsageTrend[i],
                          heapExecutionUsageTrend[i]]);
    offHeapChartData.addRow([timeX,
                          offHeapStorageUsageTrend[i],
                          offHeapExecutionUsageTrend[i]]);
    memoryUsageChartData.addRow([timeX, aggrMemoryUsageTrend[i]]);
  }

  cpuChartOptions = {
    title: 'CPU Usage (%)',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    },
    vAxis: {
      minValue: 0
    }
  };
  heapChartOptions = {
    title: 'Heap Usage (GB)',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#6C3483', '#2139EC', '#E67E22'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    }
  };
  offHeapChartOptions = {
    title: 'Off-Heap Usage (GB)',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC', '#E67E22'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    }
  };
  memoryUsageChartOptions = {
    title: 'Heap & Off-Heap Collective Usage (GB)',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC', '#E67E22'],
    crosshair: { trigger: 'focus' },
    hAxis: {
      format: 'HH:mm'
    }
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

  var memoryUsageChart = new google.visualization.LineChart(
                        document.getElementById('memoryUsageContainer'));
    memoryUsageChart.draw(memoryUsageChartData, memoryUsageChartOptions);
}

function loadGoogleCharts(){
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(googleChartsLoaded);
}

function googleChartsLoaded(){
  loadMemberInfo();
}

function loadMemberInfo() {
  $.ajax({
    url: getMemberDetailsURI(memberId),
    dataType: 'json',
    success: function (response, status, jqXHR) {

      // Hide error message, if displayed
      $("#AutoUpdateErrorMsg").hide();

      var memberData = response[0];
      updateBasicMemoryStats(memberData);
      updateUsageCharts(memberData);

    },
    error: function (jqXHR, status, error) {
      var displayMessage = "Could Not Fetch Members Stats Data. <br>Reason: ";
      if (jqXHR.status == 401) {
        displayMessage += "Unauthorized Access.";
      } else if (jqXHR.status == 404) {
        displayMessage += "Server Not Found.";
      } else if (jqXHR.status == 408) {
        displayMessage += "Request Timeout.";
      } else if (jqXHR.status == 500) {
        displayMessage += "Internal Server Error.";
      } else if (jqXHR.status == 503) {
        displayMessage += "Service Unavailable.";
      } else {
        displayMessage += "Unable to Connect to Server."
      }

      $("#AutoUpdateErrorMsg").html(displayMessage).show();
    }
   });
}

// Member to be loaded
var memberId = "";
function setMemberId(memId) {
  memberId = memId;
}

// Resource URI to get Members Details
function getMemberDetailsURI(memberId) {
  return "/snappy-api/services/memberdetails/" + memberId;
}

$(document).ready(function() {

  loadGoogleCharts();

  $.ajaxSetup({
      cache : false
    });

  var memberStatsUpdateInterval = setInterval(function() {
      // todo: need to provision when to stop and start update feature
      // clearInterval(memberStatsUpdateInterval);

      loadMemberInfo();
    }, 5000);

});
