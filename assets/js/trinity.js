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

var spark1 = {
  chart: {
    id: 'spark1',
    group: 'sparks',
    type: 'line',
    height: 80,
    sparkline: {
      enabled: true
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 2,
      opacity: 0.5,
    }
  },
  series: [{
    data: [25, 66, 41, 59, 25, 44, 12, 36, 9, 21, 66, 41]
  }],
  stroke: {
    curve: 'smooth'
  },
  markers: {
    size: 0
  },
  grid: {
    padding: {
      top: 20,
      bottom: 10,
      left: 110
    }
  },
  colors: ['#fff'],
  tooltip: {
    x: {
      show: false
    },
    y: {
      title: {
        formatter: function formatter(val) {
          return '';
        }
      }
    }
  }
}

var spark2 = {
  chart: {
    id: 'spark2',
    group: 'sparks',
    type: 'line',
    height: 80,
    sparkline: {
      enabled: true
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 2,
      opacity: 0.5,
    }
  },
  series: [{
    data: [12, 14, 2, 47, 32, 44, 14, 55, 41, 69, 12, 14]
  }],
  stroke: {
    curve: 'smooth'
  },
  grid: {
    padding: {
      top: 20,
      bottom: 10,
      left: 110
    }
  },
  markers: {
    size: 0
  },
  colors: ['#fff'],
  tooltip: {
    x: {
      show: false
    },
    y: {
      title: {
        formatter: function formatter(val) {
          return '';
        }
      }
    }
  }
}

var spark3 = {
  chart: {
    id: 'spark3',
    group: 'sparks',
    type: 'line',
    height: 80,
    sparkline: {
      enabled: true
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 2,
      opacity: 0.5,
    }
  },
  series: [{
    data: [47, 45, 74, 32, 56, 31, 44, 33, 45, 19, 47, 45]
  }],
  stroke: {
    curve: 'smooth'
  },
  markers: {
    size: 0
  },
  grid: {
    padding: {
      top: 20,
      bottom: 10,
      left: 110
    }
  },
  colors: ['#fff'],
  xaxis: {
    crosshairs: {
      width: 1
    },
  },
  tooltip: {
    x: {
      show: false
    },
    y: {
      title: {
        formatter: function formatter(val) {
          return '';
        }
      }
    }
  }
}


new ApexCharts(document.querySelector("#spark1"), spark1).render();
new ApexCharts(document.querySelector("#spark2"), spark2).render();
new ApexCharts(document.querySelector("#spark3"), spark3).render();



var optionsLine = {
  chart: {
    height: 328,
    type: 'line',
    zoom: {
      enabled: false
    },
    dropShadow: {
      enabled: true,
      top: 3,
      left: 2,
      blur: 4,
      opacity: 1,
    }
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  //colors: ["#3F51B5", '#2196F3'],
  series: [{
      name: "TRINITY",
      data: [0, 26, 25, 28, 27, 25, 10, 26, 25, 28, 27, 25]
    },
    {
      name: "SAVED",
      data: [0, 33, 29, 32, 31, 32, 20, 33, 29, 32, 31, 32]
    },
    {
      name: "RAW",
      data: [0, 28, 26, 31, 29, 27, 30, 28, 26, 31, 29, 27]
    }
  ],
  title: {
    text: 'VALIDITI',
    align: 'left',
    offsetY: 25,
    offsetX: 20
  },
  subtitle: {
    text: 'Statistics',
    offsetY: 55,
    offsetX: 20
  },
  markers: {
    size: 6,
    strokeWidth: 0,
    hover: {
      size: 9
    }
  },
  grid: {
    show: true,
    padding: {
      bottom: 0
    }
  },
  labels: ['MARK 1', 'MARK 2', 'MARK 3', 'MARK 4', 'MARK 5', 'MARK 6', 'MARK 7', 'MARK 8', 'MARK 9', 'MARK 10', 'MARK 11', 'MARK 12'],
  xaxis: {
    tooltip: {
      enabled: false
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -20
  }
}

var chartLine = new ApexCharts(document.querySelector('#line-adwords'), optionsLine);
chartLine.render();

var optionsCircle4 = {
  chart: {
    type: 'radialBar',
    height: 345,
    width: 380,
  },
  plotOptions: {
    radialBar: {
      size: undefined,
      inverseOrder: true,
      hollow: {
        margin: 5,
        size: '48%',
        background: 'transparent',

      },
      track: {
        show: false,
      },
      startAngle: -180,
      endAngle: 180

    },
  },
  stroke: {
    lineCap: 'round'
  },
  series: [71, 63, 77],
  labels: ['TRINITY', 'SAVED', 'RAW'],
  legend: {
    show: true,
    floating: true,
    position: 'right',
    offsetX: 70,
    offsetY: 230
  },
}

var chartCircle4 = new ApexCharts(document.querySelector('#radialBarBottom'), optionsCircle4);
chartCircle4.render();


var optionsBar = {
  chart: {
    height: 380,
    type: 'bar',
    stacked: true,
  },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      horizontal: false,
    },
  },
  series: [{
    name: "TRINITY",
    data: [30, 26, 25, 28, 27, 25, 20, 26, 25, 28, 27, 25],
  },
  {
    name: "SAVED",
    data: [40, 33, 29, 32, 31, 32, 10, 33, 29, 32, 31, 32],
  },
  {
    name: "RAW",
    data: [10, 28, 26, 31, 29, 27, 30, 28, 26, 31, 29, 27],
  }
],
  xaxis: {
    categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  },
  fill: {
    opacity: 1
  },

}

var chartBar = new ApexCharts(
  document.querySelector("#barchart"),
  optionsBar
);

chartBar.render();

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
    name: "TRINITY",
    data: [0, 26, 25, 28, 27, 25, 20, 26, 25, 28, 27, 25]
  },
  {
    name: "SAVED",
    data: [0, 33, 29, 32, 31, 32, 10, 33, 29, 32, 31, 32]
  },
  {
    name: "RAW",
    data: [0, 28, 26, 31, 29, 27, 30, 28, 26, 31, 29, 27]
  }
],
  xaxis: {
    categories: ['MARK 1', 'MARK 2', 'MARK 3', 'MARK 4', 'MARK 5', 'MARK 6','MARK 7', 'MARK 8', 'MARK 9', 'MARK 10', 'MARK 11', 'MARK 12'],
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