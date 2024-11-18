
var player;
var playbackInterval;

function onYouTubeIframeAPIReady() {
  console.log('onYouTubeIframeAPIReady...');
  player = new YT.Player('video', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onPlaybackQualityChange': onPlaybackQualityChange,
      'onError': onPlayerError
    }
  });
}

function onPlayerReady(event) {
  console.log("YouTube Player is ready");
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    console.log("Video is playing");

    // Start logging progress every second
    playbackInterval = setInterval(function () {
      logCurrentTime();
    }, 1000);
  } else {
    console.log("Player state changed:", event.data);
    if (event.data !== YT.PlayerState.PLAYING) {
      clearInterval(playbackInterval);
    }
  }
}

function onPlaybackQualityChange(event) {
  console.log("Playback quality changed to:", event.data);
}

function onPlayerError(event) {
  console.error("An error occurred:", event.data);
}

function logCurrentTime() {
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  console.log(`Current time: ${currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`);
}

onYouTubeIframeAPIReady();

// Function to send API data
function sendApiData(videoID, option) {
  const currentTime = player.getCurrentTime()
  const payload = {
    videoID,
    timestamp: currentTime.toFixed(1),
    response: option,
  };
  console.log("Payload:", payload);

  fetch('http://localhost:4020/api/v1/video-response', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response submitted successfully:", data);
    })
    .catch((error) => {
      console.error("Error submitting response:", error);
    });
}


// -----------------------------------------------------------
// MongoDB Data Storage Code is above 
// -----------------------------------------------------------

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
const videoID = video.getAttribute("src").split("/").pop();

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
    categories: ['A', 'D', 'M', 'L']
  },
  yaxis: {
    show: false,
    tickAmount: 10,
    labels: {
      formatter: function (val) {
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
      formatter: function (val) {
        return Math.round(val) + '%'
      }
    }
  },
  responsive: [
    {
      breakpoint: 1080, // adjust this value to match your smaller screen size
      options: {
        chart: {
          height: 200 // adjust this value to set the chart height on smaller screens
        }
      }
    }
  ]
}

var chartBarChart = new ApexCharts(document.querySelector('#bar'), optionsBarChart);
chartBarChart.render();

// Update chart when button is clicked
document.getElementById('agree').addEventListener('click', function () {
  agreeCount++;
  sendApiData(videoID, "agree");
  updateChart();
});

document.getElementById('disagree').addEventListener('click', function () {
  disagreeCount++;
  sendApiData(videoID, "disagree");
  updateChart();
});

document.getElementById('more').addEventListener('click', function () {
  lessCount++;
  sendApiData(videoID, "more");
  updateChart();
});

document.getElementById('less').addEventListener('click', function () {
  moreCount++;
  sendApiData(videoID, "less");
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

// Initialize arrays to store click counts per minute for each button
var agreeClicksPerMinute = [];
var disagreeClicksPerMinute = [];
var lessClicksPerMinute = [];
var moreClicksPerMinute = [];

// Initialize minutes elapsed
var minutesElapsed = 0;

// Update click counts per minute for each button
video.addEventListener('timeupdate', function () {
  var currentTime = video.currentTime;
  var newMinutesElapsed = Math.floor(currentTime / 60);
  if (newMinutesElapsed > minutesElapsed) {
    minutesElapsed = newMinutesElapsed;
    agreeClicksPerMinute.push(agreeCount);
    disagreeClicksPerMinute.push(disagreeCount);
    lessClicksPerMinute.push(lessCount);
    moreClicksPerMinute.push(moreCount);
    agreeCount = 0;
    disagreeCount = 0;
    lessCount = 0;
    moreCount = 0;
  }
});

// Update area chart with click counts per minute for each button
document.getElementById('agree').addEventListener('click', function () {
  agreeCount++;
  updateAreaChart();
});

document.getElementById('disagree').addEventListener('click', function () {
  disagreeCount++;
  updateAreaChart();
});

document.getElementById('more').addEventListener('click', function () {
  lessCount++;
  updateAreaChart();
});

document.getElementById('less').addEventListener('click', function () {
  moreCount++;
  updateAreaChart();
});

function updateAreaChart() {
  var seriesData = [
    {
      name: 'AGREE',
      data: agreeClicksPerMinute
    },
    {
      name: 'DISAGREE',
      data: disagreeClicksPerMinute
    },
    {
      name: 'MORE',
      data: lessClicksPerMinute
    },
    {
      name: 'LESS',
      data: moreClicksPerMinute
    }
  ];
  chartArea.updateSeries(seriesData);
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
    name: 'Button Clicks',
    data: [0, 0, 0, 0]
  }],
  xaxis: {
    categories: ['AGREE', 'DISAGREE', 'MORE', 'LESS']
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