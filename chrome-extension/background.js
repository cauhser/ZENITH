let isTracking = false;
let isEyeTracking = false;
let wellnessScore = 82;
let dailyTriggers = ['exam', 'FYP', 'ghosted'];
let gazeData = [];
let emotionData = [];
let currentTabId = null;

chrome.runtime.onInstalled.addListener(function(details) {
  console.log('Zenith Wellness Tracker installed');
  chrome.storage.sync.set({
    isTracking: false,
    isEyeTracking: false,
    wellnessScore: 82,
    dailyTriggers: ['exam', 'FYP', 'ghosted'],
    gazeData: [],
    emotionData: []
  });
  createContextMenu();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && isTracking) {
    currentTabId = tabId;
    injectContentScript(tabId);
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  currentTabId = activeInfo.tabId;
  chrome.tabs.get(currentTabId, function(tab) {
    if (chrome.runtime.lastError) {
      console.error('Error getting tab info:', chrome.runtime.lastError);
      return;
    }
    
    if (tab.url && isTracking) {
      injectContentScript(currentTabId);
    }
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Received message in background:', request);
  
  switch (request.action) {
    case 'toggleTracking':
      toggleTracking();
      sendResponse({trackingPaused: !isTracking});
      break;
      
    case 'toggleEyeTracking':
      toggleEyeTracking();
      sendResponse({eyeTrackingEnabled: isEyeTracking});
      break;
      
    case 'openDashboard':
      openDashboard();
      sendResponse({success: true});
      break;
      
    case 'openSettings':
      openSettings();
      sendResponse({success: true});
      break;
      
    case 'alertAction':
      handleAlertAction(request.alertAction);
      sendResponse({success: true});
      break;
      
    case 'updateWellnessScore':
      updateWellnessScore(request.score);
      sendResponse({success: true});
      break;
      
    case 'getContentAnalysis':
      sendResponse({
        triggers: dailyTriggers,
        score: wellnessScore,
        shouldAnalyze: isTracking
      });
      break;
      
    case 'addGazeData':
      addGazeData(request.data);
      sendResponse({success: true});
      break;
      
    case 'addEmotionData':
      addEmotionData(request.data);
      sendResponse({success: true});
      break;
      
    case 'updateTriggers':
      updateTriggers(request.triggers);
      sendResponse({success: true});
      break;
      
    default:
      sendResponse({error: 'Unknown action'});
  }
  
  return true; 
});

function toggleTracking() {
  isTracking = !isTracking;
  chrome.storage.sync.set({isTracking: isTracking});
  updateExtensionIcon();

  console.log(`Tracking ${isTracking ? 'enabled' : 'disabled'}`);
  
  if (isTracking && currentTabId) {
    chrome.tabs.get(currentTabId, function(tab) {
      if (chrome.runtime.lastError) {
        console.error('Error getting tab info:', chrome.runtime.lastError);
        return;
      }
      
      if (tab.url) {
        injectContentScript(currentTabId);
      }
    });
  }
}

function toggleEyeTracking() {
  isEyeTracking = !isEyeTracking;
  chrome.storage.sync.set({isEyeTracking: isEyeTracking});
  console.log(`Eye tracking ${isEyeTracking ? 'enabled' : 'disabled'}`);
}


function updateExtensionIcon() {
  if (isTracking) {
    
    chrome.action.setIcon({
      path: {
        "16": "icons/Zenith_Logo_V01_16_16px.png",
        "32": "icons/Zenith_Logo_V01_32_32px.png",
        "48": "icons/Zenith_Logo_V01_48_48px.png",
        "128": "icons/Zenith_Logo_V01_128_128px.png"
      }
    });
    
    chrome.action.setBadgeText({text: "LIVE"});
    chrome.action.setBadgeBackgroundColor({color: "#10b981"});
  } else {
    chrome.action.setIcon({
      path: {
        "16": "icons/Zenith_Logo_V01_16_16px.png",
        "32": "icons/Zenith_Logo_V01_32_32px.png",
        "48": "icons/Zenith_Logo_V01_48_48px.png",
        "128": "icons/Zenith_Logo_V01_128_128px.png"
      }
    });
    
   
    chrome.action.setBadgeText({text: ""});
  }
}


function openDashboard() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard.html')
  });
}


function openSettings() {
  chrome.tabs.create({
    url: 'chrome://extensions/?options=' + chrome.runtime.id
  });
}


function handleAlertAction(action) {
  console.log(`Alert action: ${action}`);
  
  if (action === 'done') {
    wellnessScore = Math.min(100, wellnessScore + 1);
    updateWellnessScore(wellnessScore);
  }
}

function updateWellnessScore(newScore) {
  wellnessScore = newScore;
  chrome.storage.sync.set({wellnessScore: wellnessScore});
  chrome.runtime.sendMessage({
    action: 'updateScore',
    score: wellnessScore
  });
}

function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: {tabId: tabId},
    files: ['content.js']
  }).catch(err => {
    console.error('Failed to inject content script:', err);
  });
}

function createContextMenu() {
  chrome.contextMenus.create({
    id: "zenithWellness",
    title: "Zenith Wellness Analysis",
    contexts: ["selection", "page"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.log('Context menu already exists or error occurred');
    } else {
      console.log('Context menu created');
    }
  });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "zenithWellness") {
    console.log("Zenith Wellness context menu clicked");
    
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'analyzeContent',
        selection: info.selectionText
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to content script:', chrome.runtime.lastError);
        } else {
          console.log('Content analysis response:', response);
        }
      });
    }
  }
});


function showWellnessAlert(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/Zenith_Logo_V01_128_128px.png",
    title: "Zenith Alert",
    message: message,
    buttons: [
      { title: "Breathing Exercise" },
      { title: "Later" }
    ],
    priority: 2
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Error creating notification:', chrome.runtime.lastError);
    } else {
      console.log('Notification created with ID:', notificationId);
    }
  });
}

function addGazeData(data) {
  gazeData.push({
    timestamp: Date.now(),
    x: data.x,
    y: data.y,
    tabId: data.tabId
  });
  
  if (gazeData.length > 100) {
    gazeData = gazeData.slice(-100);
  }
  chrome.storage.sync.set({gazeData: gazeData});
}

function addEmotionData(data) {
  emotionData.push({
    timestamp: Date.now(),
    emotion: data.emotion,
    confidence: data.confidence,
    tabId: data.tabId
  });
  
  if (emotionData.length > 50) {
    emotionData = emotionData.slice(-50);
  }
  
  chrome.storage.sync.set({emotionData: emotionData});

  if (data.emotion === 'stress' || data.emotion === 'sadness') {
    wellnessScore = Math.max(0, wellnessScore - 1);
  } else if (data.emotion === 'happy') {
    wellnessScore = Math.min(100, wellnessScore + 1);
  }
  
  updateWellnessScore(wellnessScore);
}

function updateTriggers(triggers) {
  dailyTriggers = triggers;
  chrome.storage.sync.set({dailyTriggers: dailyTriggers});
}

function startWellnessMonitoring() {
  setInterval(() => {
    if (isTracking) {
      const toxicityScore = Math.random();
      const emotion = ['happy', 'stress', 'sadness'][Math.floor(Math.random() * 3)];
      const duration = Math.floor(Math.random() * 10) + 1; 
      if (toxicityScore > 0.7 && emotion === 'stress' && duration > 5) {
        showWellnessAlert("High negativity detected. Take a break?");
      }
    }
  }, 30000); 
}

startWellnessMonitoring();
function exportWellnessReport() {
  console.log("Exporting wellness report...");
}