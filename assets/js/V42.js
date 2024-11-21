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
  // Remove existing toast notifications
  while (toastContainer.firstChild) {
    toastContainer.removeChild(toastContainer.firstChild);
  }

  const toast = document.createElement('div');
  toast.style.pointerEvents = 'none';
  toast.style.textAlign ='center';
  toast.style.background = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '5px 10px';
  toast.style.marginTop = '5px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Check screen size and apply different styles if necessary
  if (window.innerWidth < 768) {
    toast.style.pointerEvents = 'none';
    toast.style.maxWidth = '60vw';
    toast.style.padding = '2px 5px';
    toast.style.marginTop = '2px';
    toast.style.borderRadius = '3px';
    toast.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
  }

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// Variables to manage button states and clicks
let isVideoPlaying = false;
const clickLimits = {};
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

    // Start logging progress every second
    playbackInterval = setInterval(function () {
      logCurrentTime();
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
      updateAreaChart();
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
  updateAreaChart();
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

// Update area chart function
function updateAreaChart() {
  const seriesData = [
    {
      name: 'AGREE',
      data: [agreeCount]
    },
    {
      name: 'DISAGREE',
      data: [disagreeCount]
    },
    {
      name: 'MORE',
      data: [moreCount]
    },
    {
      name: 'LESS',
      data: [lessCount]
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

// Get the button element
const vbuttonagree = document.getElementById('agree');
const vbuttondisagree = document.getElementById('disagree');
const vbuttonmore = document.getElementById('more');
const vbuttonless = document.getElementById('less');

// Add an event listener to the button
vbuttonagree.addEventListener('click', () => {
  // Check if the Vibration API is supported
  if ('vibrate' in navigator) {
    // Vibrate the device for 500ms
    navigator.vibrate(30);
  } else {
    console.log('Vibration API is not supported on this device');
  }
});

// Add an event listener to the button
vbuttondisagree.addEventListener('click', () => {
  // Check if the Vibration API is supported
  if ('vibrate' in navigator) {
    // Vibrate the device for 500ms
    navigator.vibrate(30);
  } else {
    console.log('Vibration API is not supported on this device');
  }
});

// Add an event listener to the button
vbuttonmore.addEventListener('click', () => {
  // Check if the Vibration API is supported
  if ('vibrate' in navigator) {
    // Vibrate the device for 500ms
    navigator.vibrate(30);
  } else {
    console.log('Vibration API is not supported on this device');
  }
});

// Add an event listener to the button
vbuttonless.addEventListener('click', () => {
  // Check if the Vibration API is supported
  if ('vibrate' in navigator) {
    // Vibrate the device for 500ms
    navigator.vibrate(30);
  } else {
    console.log('Vibration API is not supported on this device');
  }
});