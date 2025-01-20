// Get the video and button elements
const TIME_RANGE = 30;
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
      const newMinutesElapsed = Math.floor((currentTime - 1) / TIME_RANGE) + 1;
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

// Initialize counts
var agreeCount = 0;
var disagreeCount = 0;
var lessCount = 0;
var moreCount = 0;

// Get the context of the canvas element
var ctx = document.getElementById('bar').getContext('2d');

// Define the chart data
var chartData = {
  labels: ['AGREE', 'DISAGREE', 'MORE', 'LESS'],
  datasets: [{
    label: false,
    data: [0, 0, 0, 0],
    backgroundColor: [
      'rgb(255, 99, 133)',
      'rgb(54, 163, 235)',
      'rgb(255, 207, 86)',
      'rgb(75, 192, 192)'
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ],
    borderWidth: 1
  }]
};

// Create the chart
var chartBarChart = new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: {
    plugins: {
      legend: {
         display: false
      }
   },
    title: {
      display: false
    },
    scales: {
      x: {
        grid: {
          display: false
        },
      },
      
      y: {
        display: false,
        ticks: {
          precision: 0
        },
        grid: {
          display: false
        }
      }
    }
  }
});

function getCurrentTimeRange() {
  const currentTime = player.getCurrentTime();
  const rangeStart = Math.floor((currentTime === 0 ? 0 : (currentTime - 1)) / TIME_RANGE) * TIME_RANGE + 1; // Adjust for 1-based range
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
    showToast(`You can only select up to ${maxClicksPerRange} responses in the ${TIME_RANGE} seconds.`);
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
  var newMinutesElapsed = Math.floor(currentTime / TIME_RANGE);
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
      const xAxisCategories = chartData.map((item, index) => index + 1); // Time ranges
      const agreeData = chartData.map(item => item.agree);       // Agree counts
      const disagreeData = chartData.map(item => item.disagree); // Disagree counts
      const moreData = chartData.map(item => item.more);         // More counts
      const lessData = chartData.map(item => item.less);         // Less counts

      // Create the Chart.js configuration
      const options = {
        type: 'line',
        data: {
          labels: xAxisCategories,
          datasets: [
            { label: 'Agree', data: agreeData, borderColor: '#00E396', fill: false },
            { label: 'Disagree', data: disagreeData, borderColor: '#FEB019', fill: false },
            { label: 'More', data: moreData, borderColor: '#FF4560', fill: false },
            { label: 'Less', data: lessData, borderColor: '#775DD0', fill: false }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Input Points'
              }
            },
            y: {
              type: 'linear',
              title: {
                display: true,
                text: 'Interactions'
              },
              ticks: {
                callback: function(value, index, values) {
                  return Math.round(value);
                }
              }
            }
          },
          tooltips: {
            mode: 'index',
            intersect: false,
            followCursor: true,
            intersectMode: 'index',
            callbacks: {
              label: function(tooltipItem, data) {
                const label = data.labels[tooltipItem.index];
                const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return `${label}: ${value}`;
              }
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              fontColor: '#000'
            }
          },
          layout: {
            padding: {
              left: 20,
              right: 20
            }
          }
        }
      };

      // Render the Chart.js chart
      const ctx = document.querySelector("#areaChartNew").getContext('2d');
      const chart = new Chart(ctx, options);
    })
    .catch(error => {
      console.error("Error fetching data for chart:", error);
    });
}

// Call the function with the videoID
fetchAndRenderChart(videoID);
function updateChart() {
  // Update the chart data
  chartData.datasets[0].data = [agreeCount, disagreeCount, moreCount, lessCount];

  // Update the chart
  chartBarChart.update();
}