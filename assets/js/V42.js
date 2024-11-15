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
    height: 440,
    type: 'bar',
    stacked: true,
  },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      horizontal: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  series: [{
    name: 'Button Clicks',
    data: [0, 0, 0, 0]
  }],
  xaxis: {
    categories: ['AGREE', 'DISAGREE', 'LESS', 'MORE']
  },
  yaxis: {
    show: false,
    tickAmount: 10,
    labels: {
      formatter: function(val) {
        return Math.floor(val);
      }
    }
  },
  grid: {
    show: false,
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
      name: "Music",
      data: [11, 15, 26, 20, 33, 27]
    },
    {
      name: "Photos",
      data: [32, 33, 21, 42, 19, 32]
    },
    {
      name: "Files",
      data: [20, 39, 52, 11, 29, 43]
    }
  ],
  xaxis: {
    categories: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2'],
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