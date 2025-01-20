
// Remove the ApexCharts import
// import ApexCharts from 'apexcharts';

// Add the Chart.js import
import Chart from 'chart.js/auto';
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
const maxClicksPerRange = 6;

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

const ctxBarChart = document.getElementById('bar').getContext('2d');
const barChart = new Chart(ctxBarChart, {
  type: 'bar',
  data: {
    labels: ['A', 'D', 'M', 'L'],
    datasets: [{
      label: 'Button Clicks',
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

var chartBarChart = new ApexCharts(document.querySelector('#bar'), optionsBarChart);
chartBarChart.render();

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
  barChart.data.datasets[0].data = seriesData;
  barChart.update();
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

      // Create the area chart
      const ctxAreaChart = document.getElementById('areaChartNew').getContext('2d');
      const areaChart = new Chart(ctxAreaChart, {
        type: 'line',
        data: {
          labels: xAxisCategories,
          datasets: [{
            label: 'Agree',
            data: agreeData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }, {
            label: 'Disagree',
            data: disagreeData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }, {
            label: 'More',
            data: moreData,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1
          }, {
            label: 'Less',
            data: lessData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Interactions Over Time'
            }
          }
        }
      });
    })
    .catch(error => {
      console.error("Error fetching data for chart:", error);
    });
}

// Call the function with the videoID
fetchAndRenderChart(videoID);