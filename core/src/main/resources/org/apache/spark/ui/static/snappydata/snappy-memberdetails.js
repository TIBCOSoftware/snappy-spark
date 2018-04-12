

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

  var getsputsChartData = new google.visualization.DataTable();
  getsputsChartData.addColumn('datetime', 'Time of Day');
  getsputsChartData.addColumn('number', 'Gets');
  getsputsChartData.addColumn('number', 'Puts');

  var timeLine = statsData.timeLine;
  var cpuUsageTrend = statsData.cpuUsageTrend;

  var jvmUsageTrend = statsData.jvmUsageTrend;
  var heapStorageUsageTrend = statsData.heapStorageUsageTrend;
  var heapExecutionUsageTrend = statsData.heapExecutionUsageTrend;

  var offHeapStorageUsageTrend = statsData.offHeapStorageUsageTrend;
  var offHeapExecutionUsageTrend = statsData.offHeapExecutionUsageTrend;

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
    getsputsChartData.addRow([timeX, (Math.random()*100), (Math.random()*50)]);
  }

  cpuChartOptions = {
    title: 'CPU Usage',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC'],
    hAxis: {
      format: 'HH:mm'
    },
    vAxis: {
      minValue: 0
    }
  };
  heapChartOptions = {
    title: 'Heap Usage',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#6C3483', '#2139EC', '#E67E22'],
    hAxis: {
      format: 'HH:mm'
    }
  };
  offHeapChartOptions = {
    title: 'Off-Heap Usage',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC', '#E67E22'],
    hAxis: {
      format: 'HH:mm'
    }
  };
  getsputsChartOptions = {
    title: 'Gets and Puts',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors:['#2139EC', '#E67E22'],
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

  var getsputsChart = new google.visualization.LineChart(
                        document.getElementById('getsputsContainer'));
    getsputsChart.draw(getsputsChartData, getsputsChartOptions);
}

function loadGoogleCharts(){
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(googleChartsLoaded);
}

function googleChartsLoaded(){
  loadMemberInfo();
}

function loadMemberInfo() {
  $.getJSON(getMemberDetailsURI(memberId),
    function (response, status, jqXHR) {
      var memberData = response[0];
      updateUsageCharts(memberData);

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