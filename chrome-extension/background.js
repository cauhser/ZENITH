// background.js - Enhanced with persistent data storage and pause functionality
console.log('ZENITH Wellness extension background script loaded');

const CONFIG = {
  maxStorageItems: 1000,
  duplicateTimeWindow: 30000,
  cleanupInterval: 24 * 60 * 60 * 1000,
  dataRetention: 30 * 24 * 60 * 60 * 1000, // 30 days retention
  collectionInterval: 15000, // 15 seconds for better performance
  paused: false // Add paused state
};

let userPermissions = {
  contentAnalysis: false,
  eyeTracking: false,
  emotionDetection: false,
  dataCollection: false,
  collectionMethod: 'content',
  paused: false // Add paused state
};

let collectionIntervals = {
  content: null,
  webcam: null
};

// Add this function to ensure data persistence
function initializeDataPersistence() {
  chrome.storage.local.get(['analytics', 'webcamData', 'continuousData', 'userPermissions'], (result) => {
    console.log('💾 Initializing data persistence...');
    
    // Ensure all data arrays exist
    const storageData = {
      analytics: result.analytics || [],
      webcamData: result.webcamData || [],
      continuousData: result.continuousData || [],
      userPermissions: result.userPermissions || {
        contentAnalysis: false,
        eyeTracking: false,
        emotionDetection: false,
        dataCollection: false,
        permissionsAsked: false,
        collectionMethod: 'content',
        paused: false
      }
    };
    
    // Save back to ensure structure
    chrome.storage.local.set(storageData, () => {
      console.log('💾 Data persistence initialized:', {
        analytics: storageData.analytics.length,
        webcamData: storageData.webcamData.length,
        continuousData: storageData.continuousData.length
      });
    });
  });
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('🎯 ZENITH Wellness extension installed');
  
  const defaultPermissions = {
    contentAnalysis: false,
    eyeTracking: false,
    emotionDetection: false,
    dataCollection: false,
    permissionsAsked: false,
    collectionMethod: 'content',
    paused: false
  };
  
  // Initialize storage with default values
  chrome.storage.local.get(['userPermissions', 'analytics', 'webcamData', 'continuousData'], (result) => {
    const storageData = {
      userPermissions: result.userPermissions || defaultPermissions,
      analytics: result.analytics || [],
      webcamData: result.webcamData || [],
      continuousData: result.continuousData || [],
      settings: result.settings || {
        enabled: false,
        triggerWords: [
          'stress', 'anxiety', 'depression', 'overwhelmed', 'negative',
          'worried', 'tension', 'burnout', 'exhausted', 'fatigue',
          'panic', 'fear', 'dread', 'hopeless', 'helpless',
          'sadness', 'grief', 'loss', 'pain', 'suffering',
          'angry', 'frustrated', 'irritated', 'annoyed', 'mad'
        ],
        sensitivity: 'medium',
        collectionFrequency: 15000,
        debugMode: true
      }
    };
    
    chrome.storage.local.set(storageData, () => {
      console.log('💾 Storage initialized with persistent data');
      userPermissions = storageData.userPermissions;
      CONFIG.paused = userPermissions.paused || false;
    });
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 ZENITH Wellness extension starting up...');
  initializeDataPersistence();
  initializeExtension();
});

chrome.action.onClicked.addListener((tab) => {
  console.log('🎯 Extension icon clicked');
  checkPermissionsStatus();
});

async function initializeExtension() {
  const permissions = await loadPermissions();
  CONFIG.paused = permissions.paused || false;
  updateExtensionState(permissions);
}

function loadPermissions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userPermissions'], (result) => {
      userPermissions = result.userPermissions || {
        contentAnalysis: false,
        eyeTracking: false,
        emotionDetection: false,
        dataCollection: false,
        permissionsAsked: false,
        collectionMethod: 'content',
        paused: false
      };
      
      CONFIG.paused = userPermissions.paused || false;
      
      console.log('📊 Loaded permissions from persistent storage, paused:', CONFIG.paused);
      resolve(userPermissions);
    });
  });
}

async function checkPermissionsStatus() {
  const permissions = await loadPermissions();
  
  updateExtensionIcon(permissions);
  
  if (!permissions.permissionsAsked) {
    showPermissionRequest();
  }
  
  return permissions;
}

function updateExtensionIcon(permissions) {
  const iconPath = permissions.dataCollection && !permissions.paused ? 
    'icons/icon-active-128.png' : 
    'icons/icon-inactive-128.png';
  
  chrome.action.setIcon({
    path: {
      "16": iconPath,
      "48": iconPath,
      "128": iconPath
    }
  });
  
  chrome.action.setTitle({
    title: permissions.dataCollection && !permissions.paused ? 
      'ZENITH Wellness - Active' : 
      permissions.paused ? 'ZENITH Wellness - Paused' : 'ZENITH Wellness - Click to enable'
  });
}

function showPermissionRequest() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('permission-request.html'),
    active: true
  }, (tab) => {
    console.log('📋 Opened permission request tab:', tab.id);
  });
}

// Add this function to handle pause/resume
function toggleDataCollection(paused, sendResponse) {
  CONFIG.paused = paused;
  userPermissions.paused = paused;
  
  chrome.storage.local.get(['userPermissions'], (result) => {
    const updatedPermissions = {
      ...result.userPermissions,
      paused: paused
    };
    
    chrome.storage.local.set({ userPermissions: updatedPermissions }, () => {
      userPermissions = updatedPermissions;
      
      if (paused) {
        console.log('⏸️ Data collection paused');
        disableBackgroundServices();
      } else {
        console.log('▶️ Data collection resumed');
        updateExtensionState(updatedPermissions);
      }
      
      if (sendResponse) {
        sendResponse({ success: true, paused: paused });
      }
      
      // Notify content scripts about pause state
      notifyContentScriptsAboutPermissions(updatedPermissions);
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request.type);
  
  switch (request.type) {
    case 'REQUEST_PERMISSIONS':
      handlePermissionRequest(request.permissions, sendResponse);
      return true;
      
    case 'GET_PERMISSIONS':
      providePermissions(sendResponse);
      return true;
      
    case 'CHECK_PERMISSIONS':
      checkPermissionsStatus().then(permissions => {
        sendResponse({ permissions });
      });
      return true;
      
    case 'TOGGLE_PAUSE':
      toggleDataCollection(request.paused, sendResponse);
      return true;
      
    case 'GET_PAUSE_STATE':
      sendResponse({ paused: CONFIG.paused });
      return true;
      
    case 'CONTENT_ANALYSIS':
      loadPermissions().then(permissions => {
        if (!CONFIG.paused && permissions.contentAnalysis && permissions.dataCollection) {
          processContentAnalysis(request.data, sender, sendResponse);
        } else {
          console.log('🚫 Content analysis blocked - paused or permissions not granted');
          sendResponse({ success: false, error: 'Data collection paused or permissions not granted' });
        }
      });
      return true;
      
    case 'WEBCAM_DATA':
      loadPermissions().then(permissions => {
        if (!CONFIG.paused && permissions.emotionDetection && permissions.dataCollection) {
          processWebcamData(request.data, sender, sendResponse);
        } else {
          sendResponse({ success: false, error: 'Data collection paused or webcam permissions not granted' });
        }
      });
      return true;
      
    case 'CONTINUOUS_DATA':
      loadPermissions().then(permissions => {
        if (!CONFIG.paused && permissions.dataCollection) {
          processContinuousData(request.data, sender, sendResponse);
        } else {
          sendResponse({ success: false, error: 'Data collection paused or not permitted' });
        }
      });
      return true;
      
    case 'GET_ANALYTICS_DATA':
      provideAnalyticsData(sendResponse);
      return true;
      
    case 'GET_WEBCAM_DATA':
      provideWebcamData(sendResponse);
      return true;
      
    case 'GET_CONTINUOUS_DATA':
      provideContinuousData(sendResponse);
      return true;
      
    case 'PING':
      handlePing(sender, sendResponse);
      return true;
      
    case 'UPDATE_COLLECTION_METHOD':
      updateCollectionMethod(request.method, sendResponse);
      return true;
      
    case 'CLEAR_DATA':
      clearAnalyticsData(sendResponse);
      return true;
      
    case 'DEBUG_LOG':
      handleDebugLog(request.data, sender);
      sendResponse({ received: true });
      return true;
      
    default:
      console.warn('Unknown message type:', request.type);
      sendResponse({ error: 'Unknown message type' });
  }
});

function handlePermissionRequest(requestedPermissions, sendResponse) {
  console.log('🔐 User requested permissions:', requestedPermissions);
  
  const updatedPermissions = {
    ...requestedPermissions,
    permissionsAsked: true,
    grantedAt: new Date().toISOString()
  };
  
  userPermissions = updatedPermissions;
  
  chrome.storage.local.set({ userPermissions: updatedPermissions }, () => {
    updateExtensionState(updatedPermissions);
    
    console.log('💾 Permissions saved to persistent storage');
    sendResponse({ success: true, permissions: updatedPermissions });
    
    notifyContentScriptsAboutPermissions(updatedPermissions);
  });
}

function updateCollectionMethod(method, sendResponse) {
  userPermissions.collectionMethod = method;
  
  chrome.storage.local.get(['userPermissions'], (result) => {
    const updatedPermissions = {
      ...result.userPermissions,
      collectionMethod: method
    };
    
    chrome.storage.local.set({ userPermissions: updatedPermissions }, () => {
      userPermissions = updatedPermissions;
      console.log('🔄 Collection method updated to:', method);
      
      // Update collection based on new method
      updateExtensionState(updatedPermissions);
      
      sendResponse({ success: true, method: method });
    });
  });
}

function updateExtensionState(permissions) {
  updateExtensionIcon(permissions);
  
  if (permissions.dataCollection && permissions.contentAnalysis && !permissions.paused) {
    enableBackgroundServices();
  } else {
    disableBackgroundServices();
  }
  
  if (permissions.emotionDetection && permissions.collectionMethod === 'both' && !permissions.paused) {
    startWebcamCollection();
  } else {
    stopWebcamCollection();
  }
}

function enableBackgroundServices() {
  console.log('🟢 Enabling background services');
  startContinuousCollection();
}

function disableBackgroundServices() {
  console.log('🔴 Disabling background services');
  stopContinuousCollection();
}

function startContinuousCollection() {
  console.log('🔄 Starting continuous data collection');
  
  stopContinuousCollection();
  
  // Start collection on all existing tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && isAnalyzableUrl(tab.url)) {
        triggerContinuousAnalysis(tab.id);
      }
    });
  });
  
  collectionIntervals.content = setInterval(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && isAnalyzableUrl(tab.url)) {
          triggerContinuousAnalysis(tab.id);
        }
      });
    });
  }, CONFIG.collectionInterval);
}

function stopContinuousCollection() {
  console.log('🛑 Stopping continuous data collection');
  
  if (collectionIntervals.content) {
    clearInterval(collectionIntervals.content);
    collectionIntervals.content = null;
  }
}

function startWebcamCollection(sendResponse) {
  console.log('📷 Starting webcam data collection');
  
  if (collectionIntervals.webcam) {
    clearInterval(collectionIntervals.webcam);
  }
  
  collectionIntervals.webcam = setInterval(() => {
    // Maintain webcam collection interval
  }, 5000);
  
  if (sendResponse) {
    sendResponse({ success: true, message: 'Webcam collection started' });
  }
}

function stopWebcamCollection(sendResponse) {
  console.log('🛑 Stopping webcam data collection');
  
  if (collectionIntervals.webcam) {
    clearInterval(collectionIntervals.webcam);
    collectionIntervals.webcam = null;
  }
  
  if (sendResponse) {
    sendResponse({ success: true, message: 'Webcam collection stopped' });
  }
}

function triggerContinuousAnalysis(tabId) {
  chrome.tabs.sendMessage(tabId, { 
    type: 'COLLECT_CONTINUOUS_DATA' 
  }).catch(() => {
    // Content script not ready
  });
}

function processWebcamData(data, sender, sendResponse) {
  if (CONFIG.paused || !userPermissions.emotionDetection || !userPermissions.dataCollection) {
    sendResponse({ success: false, error: 'Data collection paused or webcam permissions not granted' });
    return;
  }

  chrome.storage.local.get(['webcamData'], (result) => {
    const webcamData = result.webcamData || [];
    
    const webcamRecord = {
      ...data,
      id: generateId(),
      tabId: sender.tab?.id,
      timestamp: Date.now(),
      collectedWithPermission: true,
      source: 'webcam_analysis'
    };
    
    const updatedWebcamData = [webcamRecord, ...webcamData].slice(0, CONFIG.maxStorageItems);
    
    chrome.storage.local.set({ webcamData: updatedWebcamData }, () => {
      console.log('💾 Webcam data saved to persistent storage');
      sendResponse({ 
        success: true, 
        stored: true,
        emotion: data.dominantEmotion
      });
    });
  });
}

function processContinuousData(data, sender, sendResponse) {
  if (CONFIG.paused || !userPermissions.dataCollection) {
    sendResponse({ success: false, error: 'Data collection paused or not permitted' });
    return;
  }

  chrome.storage.local.get(['continuousData'], (result) => {
    const continuousData = result.continuousData || [];
    
    const continuousRecord = {
      ...data,
      id: generateId(),
      tabId: sender.tab?.id,
      domain: getDomainFromUrl(data.url || sender.tab?.url),
      timestamp: Date.now(),
      collectedWithPermission: true
    };
    
    const updatedContinuousData = [continuousRecord, ...continuousData].slice(0, CONFIG.maxStorageItems);
    
    chrome.storage.local.set({ continuousData: updatedContinuousData }, () => {
      console.log('💾 Continuous data saved to persistent storage');
      sendResponse({ 
        success: true, 
        stored: true,
        timestamp: continuousRecord.timestamp
      });
    });
  });
}

function processContentAnalysis(data, sender, sendResponse) {
  if (CONFIG.paused || !userPermissions.contentAnalysis || !userPermissions.dataCollection) {
    sendResponse({ success: false, error: 'Data collection paused or permissions not granted' });
    return;
  }

  chrome.storage.local.get(['analytics'], (result) => {
    const analytics = result.analytics || [];
    
    if (!isValidAnalysisData(data)) {
      console.error('Invalid analysis data received:', data);
      sendResponse({ success: false, error: 'Invalid data' });
      return;
    }
    
    const sentiment = analyzeSentiment(data.contentSnippet || '');
    
    const analysisRecord = {
      ...data,
      id: generateId(),
      tabId: sender.tab?.id,
      domain: getDomainFromUrl(data.url),
      processedAt: Date.now(),
      extensionVersion: '1.0.0',
      sentiment: sentiment,
      collectedWithPermission: true,
      source: 'content_analysis'
    };
    
    const updatedAnalytics = [analysisRecord, ...analytics].slice(0, CONFIG.maxStorageItems);
    
    chrome.storage.local.set({ analytics: updatedAnalytics }, () => {
      console.log('💾 Content analysis saved to persistent storage');
      sendResponse({ 
        success: true, 
        stored: true,
        triggers: analysisRecord.triggers.length,
        sentiment: sentiment.score
      });
    });
  });
}

function provideWebcamData(sendResponse) {
  chrome.storage.local.get(['webcamData'], (result) => {
    const webcamData = result.webcamData || [];
    console.log('📊 Providing webcam data:', webcamData.length, 'persistent items');
    sendResponse({ webcamData: webcamData });
  });
}

function provideContinuousData(sendResponse) {
  chrome.storage.local.get(['continuousData'], (result) => {
    const continuousData = result.continuousData || [];
    
    const moodData = continuousData.filter(item => 
      item.triggers && item.triggers.length > 0
    );
    
    console.log('📊 Providing continuous mood data:', moodData.length, 'persistent items');
    sendResponse({ continuousData: moodData });
  });
}

function provideAnalyticsData(sendResponse) {
  chrome.storage.local.get(['analytics'], (result) => {
    const analytics = result.analytics || [];
    
    const realData = analytics
      .filter(item => item.url && !item.url.includes('example.com') && !item.url.includes('test-content'))
      .map(item => ({
        ...item,
        triggers: item.triggers || [],
        timestamp: item.timestamp || item.processedAt || Date.now(),
        sentiment: item.sentiment || { score: 0, positive: 0, negative: 0, total: 0 }
      }));
    
    console.log('📊 Providing analytics data:', realData.length, 'persistent items');
    sendResponse({ analytics: realData });
  });
}

function providePermissions(sendResponse) {
  sendResponse({ permissions: userPermissions });
}

function analyzeSentiment(text) {
  const positiveWords = [
    'happy', 'joy', 'excited', 'good', 'great', 'positive', 'excellent',
    'wonderful', 'amazing', 'fantastic', 'brilliant', 'awesome', 'love',
    'loved', 'enjoy', 'enjoyed', 'pleasure', 'delighted', 'satisfied',
    'success', 'achievement', 'progress', 'improve', 'better', 'best'
  ];
  
  const negativeWords = [
    'stress', 'anxiety', 'depression', 'overwhelmed', 'negative',
    'worried', 'tension', 'burnout', 'exhausted', 'fatigue',
    'panic', 'fear', 'dread', 'hopeless', 'helpless',
    'sadness', 'grief', 'loss', 'pain', 'suffering',
    'angry', 'frustrated', 'irritated', 'annoyed', 'mad'
  ];
  
  const textLower = text.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => 
    new RegExp(`\\b${word}\\b`, 'i').test(textLower)
  ).length;
  
  const negativeCount = negativeWords.filter(word => 
    new RegExp(`\\b${word}\\b`, 'i').test(textLower)
  ).length;
  
  const total = positiveCount + negativeCount;
  const score = total > 0 ? (positiveCount - negativeCount) / total : 0;
  
  return {
    score: Math.max(-1, Math.min(1, score)),
    positive: positiveCount,
    negative: negativeCount,
    total: total
  };
}

function handlePing(sender, sendResponse) {
  chrome.storage.local.get(['analytics', 'webcamData'], (result) => {
    sendResponse({ 
      status: 'pong', 
      extensionId: chrome.runtime.id,
      version: '1.0.0',
      timestamp: Date.now(),
      permissions: userPermissions,
      dataStats: {
        analytics: result.analytics?.length || 0,
        webcam: result.webcamData?.length || 0
      }
    });
  });
}

function clearAnalyticsData(sendResponse) {
  chrome.storage.local.set({ analytics: [], continuousData: [], webcamData: [] }, () => {
    console.log('🗑️ ALL data cleared from persistent storage');
    sendResponse({ success: true });
  });
}

function notifyContentScriptsAboutPermissions(permissions) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && isAnalyzableUrl(tab.url)) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'PERMISSIONS_UPDATED',
          permissions: permissions
        }).catch(() => {
          // Content script not ready
        });
      }
    });
  });
}

function handleDebugLog(data, sender) {
  console.log('🐛 DEBUG:', {
    from: sender.tab?.url || 'extension',
    message: data.message,
    data: data.data,
    timestamp: new Date().toISOString()
  });
}

function isValidAnalysisData(data) {
  return data &&
         data.url &&
         data.title &&
         Array.isArray(data.triggers);
}

function isAnalyzableUrl(url) {
  const skipPatterns = [
    /chrome:\/\//,
    /about:/,
    /file:\/\//,
    /blob:/,
    /data:/,
    /\.(pdf|jpg|jpeg|png|gif|mp4|mp3|zip|rar|exe|dmg)$/i
  ];
  
  return url.startsWith('http') && !skipPatterns.some(pattern => pattern.test(url));
}

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Monitor all tab activity
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const permissions = await loadPermissions();
  
  if (!permissions.dataCollection || !permissions.contentAnalysis || permissions.paused) {
    return;
  }
  
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && isAnalyzableUrl(tab.url)) {
      triggerContinuousAnalysis(tab.id);
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const permissions = await loadPermissions();
  
  if (!permissions.dataCollection || !permissions.contentAnalysis || permissions.paused) {
    return;
  }
  
  if (changeInfo.status === 'complete' && tab.url && isAnalyzableUrl(tab.url)) {
    setTimeout(() => {
      triggerContinuousAnalysis(tabId);
    }, 2000);
  }
});

// Monitor web navigation
chrome.webNavigation.onCompleted.addListener(async (details) => {
  const permissions = await loadPermissions();
  
  if (!permissions.dataCollection || !permissions.contentAnalysis || permissions.paused) {
    return;
  }
  
  if (details.frameId === 0 && isAnalyzableUrl(details.url)) {
    setTimeout(() => {
      triggerContinuousAnalysis(details.tabId);
    }, 3000);
  }
});

function performMaintenance() {
  console.log('🔧 Performing maintenance tasks...');
  
  chrome.storage.local.get(['analytics', 'continuousData', 'webcamData'], (result) => {
    const analytics = result.analytics || [];
    const continuousData = result.continuousData || [];
    const webcamData = result.webcamData || [];
    const retentionTime = Date.now() - CONFIG.dataRetention;
    
    const recentAnalytics = analytics.filter(item => 
      (item.timestamp || item.processedAt) > retentionTime
    );
    
    const recentContinuous = continuousData.filter(item => 
      item.timestamp > retentionTime
    );
    
    const recentWebcam = webcamData.filter(item =>
      item.timestamp > retentionTime
    );
    
    if (recentAnalytics.length !== analytics.length || 
        recentContinuous.length !== continuousData.length ||
        recentWebcam.length !== webcamData.length) {
      chrome.storage.local.set({ 
        analytics: recentAnalytics,
        continuousData: recentContinuous,
        webcamData: recentWebcam
      });
      console.log('🧹 Cleaned up old data from persistent storage');
    }
  });
}

chrome.alarms.create('maintenance', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'maintenance') {
    performMaintenance();
  }
});

// Initialize
performMaintenance();