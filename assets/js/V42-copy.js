window.Apex = {
  chart: {
    foreColor: '#ccc',
    toolbar: {
      show: false
    },
  },
  stroke: {
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    theme: 'dark'
  },
  grid: {
    borderColor: "#535A6C",
    xaxis: {
      lines: {
        show: true
      }
    }
  }
};

// Get the video and button elements
const video = document.getElementById('video');
const buttons = document.querySelectorAll('.button');
const chart = document.getElementById('bar');

var agreeCount = 0;
var disagreeCount = 0;
var lessCount = 0;
var moreCount = 0;

var optionsBarChart = {
  chart: {
    type: 'bar',

  },
  responsive: [{
    breakpoint: undefined,
    options: {},
}],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%',
      endingShape: 'rounded'
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  series: [{
    name: 'Button Clicks',
    data: [0, 0, 0, 0]
  }],
  xaxis: {
    categories: ['AGREE', 'DISAGREE', 'LESS', 'MORE']
  },
  yaxis: {
    show: false    
  },
  fill: {
    opacity: 1,
  },
  legend: {
    show: false
  },
  tooltip: {
    y: {
      formatter: function(val) {
        return Math.round(val) + '%'
      }
    }
  },
  grid: {
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: false
      }
    }
  },
  colors: ['#007bff', '#dc3545', '#ffc107', '#28a745'] // blue, red, yellow, green
}

var chartBarChart = new ApexCharts(document.querySelector('#bar'), optionsBarChart);
chartBarChart.render();

// Update chart when button is clicked
document.getElementById('agree').addEventListener('click', function() {
  agreeCount++;
  updateChart();
});

document.getElementById('disagree').addEventListener('click', function() {
  disagreeCount++;
  updateChart();
});

document.getElementById('less').addEventListener('click', function() {
  lessCount++;
  updateChart();
});

document.getElementById('more').addEventListener('click', function() {
  moreCount++;
  updateChart();
});

function updateChart() {
  var totalInput = agreeCount + disagreeCount + lessCount + moreCount;
  var agreePercentage = (agreeCount / totalInput) * 100;
  var disagreePercentage = (disagreeCount / totalInput) * 100;
  var lessPercentage = (lessCount / totalInput) * 100;
  var morePercentage = (moreCount / totalInput) * 100;
  var seriesData = [agreePercentage, disagreePercentage, lessPercentage, morePercentage];
  chartBarChart.updateSeries([{
    data: seriesData
  }]);
}




var optionsArea = {
  chart: {
    height: 380,
    type: 'area',
    stacked: false,
  },
  stroke: {
    curve: 'straight'
  },
  series: [{
      name: "AGREE",
      data: [11, 15, 26, 20, 33, 27, 20, 39, 52, 11, 29, 43]
    },
    {
      name: "DISAGREE",
      data: [32, 33, 21, 42, 19, 32, 10, 12, 42, 18, 41, 22]
    },
    {
      name: "MORE",
      data: [20, 39, 52, 11, 29, 43, 10, 12, 42, 18, 41, 22]
    },
    {
      name: "LESS",
      data: [20, 12, 42, 18, 41, 22, 10, 12, 42, 18, 41, 22]
    },
  ],
  xaxis: {
    categories: ['MARK 1', 'MARK 2', 'MARK 3', 'MARK 4', 'MARK 5', 'MARK 6', 'MARK 7', 'MARK 8', 'MARK 9', 'MARK 10', 'MARK 11', 'MARK 12'],
  },
  tooltip: {
    followCursor: true
  },
  fill: {
    opacity: 1,
  },

}

var chartArea = new ApexCharts(
  document.querySelector("#areachart"),
  optionsArea
);

chartArea.render();


