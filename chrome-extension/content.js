let isAnalyzing = false;
let gazeTrackingInterval = null;
let emotionTrackingInterval = null;
let stream = null;
let video = null;


document.addEventListener('DOMContentLoaded', function() {
  console.log('Zenith content script loaded');
  
 
  chrome.runtime.sendMessage({action: 'getContentAnalysis'}, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Error getting content analysis status:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.shouldAnalyze) {
      startContentAnalysis();
    }
  });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case 'startAnalysis':
      startContentAnalysis();
      sendResponse({success: true});
      break;
      
    case 'stopAnalysis':
      stopContentAnalysis();
      sendResponse({success: true});
      break;
      
    case 'analyzeContent':
      analyzePageContent(request.selection);
      sendResponse({analysis: 'Content analysis completed'});
      break;
      
    default:
      sendResponse({error: 'Unknown action'});
  }
  
  return true; 
});


function startContentAnalysis() {
  if (isAnalyzing) return;
  
  isAnalyzing = true;
  console.log('Starting content analysis');
  startGazeTracking();
  startEmotionTracking();
}


function stopContentAnalysis() {
  isAnalyzing = false;
  console.log('Stopping content analysis');
  

  if (gazeTrackingInterval) {
    clearInterval(gazeTrackingInterval);
    gazeTrackingInterval = null;
  }
  
 
  if (emotionTrackingInterval) {
    clearInterval(emotionTrackingInterval);
    emotionTrackingInterval = null;
  }
  
 
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  

  if (video && video.parentNode) {
    video.parentNode.removeChild(video);
    video = null;
  }
}

function startGazeTracking() {
  gazeTrackingInterval = setInterval(() => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    chrome.runtime.sendMessage({
      action: 'addGazeData',
      data: {
        x: x,
        y: y,
        tabId: getTabId()
      }
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Error sending gaze data:', chrome.runtime.lastError);
      }
    });
  }, 1000); 
}


function startEmotionTracking() {
  video = document.createElement('video');
  video.style.position = 'fixed';
  video.style.top = '-1000px'; 
  video.style.left = '-1000px';
  video.style.width = '320px';
  video.style.height = '240px';
  video.style.zIndex = '-1';
  video.autoplay = true;
  video.playsInline = true;
  document.body.appendChild(video);
  navigator.mediaDevices.getUserMedia({video: true})
    .then(function(mediaStream) {
      stream = mediaStream;
      video.srcObject = stream;
      emotionTrackingInterval = setInterval(() => {
        const emotions = ['happy', 'sadness', 'stress', 'neutral'];
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        const confidence = Math.random();
  
        chrome.runtime.sendMessage({
          action: 'addEmotionData',
          data: {
            emotion: emotion,
            confidence: confidence,
            tabId: getTabId()
          }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error sending emotion data:', chrome.runtime.lastError);
          }
        });
      }, 5000); 
    })
    .catch(function(err) {
      console.error('Error accessing webcam:', err);
      emotionTrackingInterval = setInterval(() => {
        const emotions = ['happy', 'sadness', 'stress', 'neutral'];
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        const confidence = Math.random();
        chrome.runtime.sendMessage({
          action: 'addEmotionData',
          data: {
            emotion: emotion,
            confidence: confidence,
            tabId: getTabId()
          }
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error sending emotion data:', chrome.runtime.lastError);
          }
        });
      }, 5000); 
    });
}

function analyzePageContent(selection) {
  console.log('Analyzing page content:', selection);
  const triggers = detectTriggers(selection || document.body.innerText);
  console.log('Detected triggers:', triggers);
  chrome.runtime.sendMessage({
    action: 'updateTriggers',
    triggers: triggers
  });
}


function detectTriggers(content) {
  const triggerKeywords = ['exam', 'FYP', 'ghosted', 'stress', 'anxiety', 'deadline', 'work'];
  const triggers = [];
  
  triggerKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      triggers.push(keyword);
    }
  });
  
  return triggers;
}


function getTabId() {
  return 0;
}

window.addEventListener('beforeunload', function() {
  stopContentAnalysis();
});