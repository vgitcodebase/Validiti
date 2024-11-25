// Get the video and button elements
const video = document.getElementById('video');
const buttons = document.querySelectorAll('.button');
const chart = document.getElementById('bar');
const videoSrc = video.getAttribute("src");
const videoID = videoSrc.includes('?') ? videoSrc.split('?')[0].split("/").pop() : videoSrc.split("/").pop();
const development = false
const BASE_URL = development ? 'http://localhost:4020' : 'https://api.validiti.com'

// Add toast container
const toastContainer = document.createElement('div');
toastContainer.style.position = 'fixed';
toastContainer.style.bottom = '20px';
toastContainer.style.left = '20px';
toastContainer.style.zIndex = '1000';
document.body.appendChild(toastContainer);

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.background = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 15px';
  toast.style.marginTop = '5px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

let isVideoPlaying = false;
let clickLimits = {};
const maxClicksPerRange = 4;

// Enable or disable buttons
function setButtonState(enabled) {
  buttons.forEach(button => {
    button.disabled = !enabled;
    button.style.cursor = enabled ? 'pointer' : 'not-allowed';
    button.style.opacity = enabled ? '1' : '0.5';
  });
}

// Initialize with buttons disabled
setButtonState(false);

// ----------------------------------------------------

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
    isVideoPlaying = true;
    setButtonState(true);

    playbackInterval = setInterval(function () {
      logCurrentTime();
      const currentTime = player.getCurrentTime();
      const newMinutesElapsed = Math.floor((currentTime - 1) / 60) + 1; // Ensure ranges start at 1-based
      if (newMinutesElapsed !== minutesElapsed) {
        minutesElapsed = newMinutesElapsed;
        clearChartData();
      }
    }, 1000);
  } else {
    console.log("Player state changed:", event.data);
    if (event.data !== YT.PlayerState.PLAYING) {
      isVideoPlaying = false;
      setButtonState(false);
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

  fetch(`${BASE_URL}/api/v1/video-response`, {
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

function getCurrentTimeRange() {
  const currentTime = player.getCurrentTime();
  const rangeStart = Math.floor((currentTime === 0 ? 0 : (currentTime - 1)) / 60) * 60 + 1; // Adjust for 1-based range
  const rangeEnd = rangeStart + 59; // End of the range
  return `${rangeStart}-${rangeEnd}`;
}

function clearChartData() {
  agreeCount = 0;
  disagreeCount = 0;
  moreCount = 0;
  lessCount = 0;
  clickLimits = {};
  updateChart();
}

function fetchStoredResponses() {
  const timeRange = getCurrentTimeRange();

  fetch(`${BASE_URL}/api/v1/get-responses?videoID=${videoID}&timeRange=${timeRange}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Stored responses for range ${timeRange}:`, data);

      const storedData = data.data
      // Update counts with fetched data
      agreeCount = storedData.agree || 0;
      disagreeCount = storedData.disagree || 0;
      moreCount = storedData.more || 0;
      lessCount = storedData.less || 0;

      // Update the charts with the new values
      updateChart();
    })
    .catch(error => {
      console.error("Error fetching stored responses:", error);
    });
}

// Button click event handler
function handleButtonClick(option) {
  if (!isVideoPlaying) {
    showToast("Please start the video before selecting options.");
    return;
  }

  const timeRange = getCurrentTimeRange();
  console.log('Selected Time range:', timeRange);

  if (!clickLimits[timeRange]) {
    clickLimits[timeRange] = 0;
    // Fetch stored responses only when the time range is accessed for the first time
    fetchStoredResponses();
  }

  if (clickLimits[timeRange] >= maxClicksPerRange) {
    showToast(`You can only select up to ${maxClicksPerRange} responses in the 60 seconds.`);
    return;
  }

  clickLimits[timeRange]++;

  if (option === "agree") {
    agreeCount++;
  } else if (option === "disagree") {
    disagreeCount++;
  } else if (option === "more") {
    moreCount++;
  } else if (option === "less") {
    lessCount++;
  }

  // Send API data and update charts
  sendApiData(videoID, option);
  updateChart();
}

// Attach event listeners to buttons
document.getElementById('agree').addEventListener('click', () => handleButtonClick("agree"));
document.getElementById('disagree').addEventListener('click', () => handleButtonClick("disagree"));
document.getElementById('more').addEventListener('click', () => handleButtonClick("more"));
document.getElementById('less').addEventListener('click', () => handleButtonClick("less"));

function updateChart() {
  var totalInput = agreeCount + disagreeCount + lessCount + moreCount;
  var agreePercentage = (agreeCount / totalInput) * 100;
  var disagreePercentage = (disagreeCount / totalInput) * 100;
  var lessPercentage = (lessCount / totalInput) * 100;
  var morePercentage = (moreCount / totalInput) * 100;
  var seriesData = [agreePercentage, disagreePercentage, morePercentage, lessPercentage];
  chartBarChart.updateSeries([{
    data: seriesData
  }]);
}

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

// --------------------------------
// Data from the API
function fetchAndRenderChart(videoID) {
  fetch(`${BASE_URL}/api/v1/all-responses?videoID=${videoID}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch data: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("API Response:", data);

      // Process the data from the API response
      const chartData = data.data;

      // Extract data for the chart
      const xAxisCategories = chartData.map(item => item.range); // Time ranges
      const agreeData = chartData.map(item => item.agree);       // Agree counts
      const disagreeData = chartData.map(item => item.disagree); // Disagree counts
      const moreData = chartData.map(item => item.more);         // More counts
      const lessData = chartData.map(item => item.less);         // Less counts

      // Update the Apex Chart Configuration
      const options = {
        chart: {
          type: 'area',
          height: 400,
          stacked: false,
          toolbar: {
            show: false
          }
        },
        stroke: {
          curve: 'smooth'
        },
        series: [
          { name: 'Agree', data: agreeData },
          { name: 'Disagree', data: disagreeData },
          { name: 'More', data: moreData },
          { name: 'Less', data: lessData }
        ],
        xaxis: {
          title: {
            text: 'Time Ranges (minutes)'
          },
          labels: {
            formatter: val => Math.round(val)
          },
        },
        yaxis: {
          title: {
            text: 'Interactions'
          },
          labels: {
            formatter: val => Math.round(val)
          }
        },
        tooltip: {
          shared: true,
          intersect: false,
          followCursor: true
        },
        colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0'], // Colors for the lines
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
            stops: [0, 90, 100]
          }
        }
      };
      const chartV2 = new ApexCharts(document.querySelector("#areaChartNew"), options);
      chartV2.render();
    })
    .catch(error => {
      console.error("Error fetching data for chart:", error);
    });
}

// Call the function with the videoID
fetchAndRenderChart(videoID);

