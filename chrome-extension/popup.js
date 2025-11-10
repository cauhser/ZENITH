// popup.js - Compact version with persistent data and pause functionality
class ZenithPopup {
  constructor() {
    this.analyticsData = [];
    this.webcamData = [];
    this.continuousData = [];
    this.permissions = null;
    this.isConnected = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadPopupData();
    this.checkPermissions();
    this.setupAutoRefresh();
  }

  setupEventListeners() {
    document.getElementById('viewDashboard').addEventListener('click', () => {
      this.openDashboard();
    });

    document.getElementById('enableTracking').addEventListener('click', () => {
      this.enableTracking();
    });

    document.getElementById('collectionMethod').addEventListener('change', (e) => {
      this.updateCollectionMethod(e.target.value);
    });

    document.getElementById('togglePause').addEventListener('click', () => {
      this.togglePauseCollection();
    });

    // Stat card click handlers
    document.getElementById('triggersCard').addEventListener('click', () => {
      this.showTriggerDetails();
    });

    document.getElementById('pagesCard').addEventListener('click', () => {
      this.showPagesDetails();
    });

    document.getElementById('sentimentCard').addEventListener('click', () => {
      this.showSentimentDetails();
    });
  }

  setupAutoRefresh() {
    // Refresh every 5 seconds to show latest data
    setInterval(() => {
      this.loadPopupData();
    }, 5000);
  }

  async checkPermissions() {
    try {
      const response = await this.sendMessage({ type: 'GET_PERMISSIONS' });
      if (response?.permissions) {
        this.permissions = response.permissions;
        this.updatePermissionUI();
        
        // Set collection method selector
        const methodSelect = document.getElementById('collectionMethod');
        if (methodSelect) {
          methodSelect.value = this.permissions.collectionMethod || 'content';
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }

  updatePermissionUI() {
    const permissionWarning = document.getElementById('permissionWarning');
    const methodSelector = document.querySelector('.collection-method-selector');
    const pauseButton = document.getElementById('togglePause');
    
    if (!this.permissions?.dataCollection || !this.permissions?.permissionsAsked) {
      permissionWarning.style.display = 'block';
      if (methodSelector) methodSelector.style.display = 'none';
      if (pauseButton) pauseButton.style.display = 'none';
      this.updateStatus('disconnected', 'Enable Tracking');
    } else {
      permissionWarning.style.display = 'none';
      if (methodSelector) methodSelector.style.display = 'block';
      if (pauseButton) pauseButton.style.display = 'block';
      
      // Update pause button text
      if (this.permissions.paused) {
        pauseButton.innerHTML = '▶️ Resume Collection';
        pauseButton.classList.remove('btn-primary');
        pauseButton.classList.add('btn-success');
        this.updateStatus('disconnected', 'Paused');
      } else {
        pauseButton.innerHTML = '⏸️ Pause Collection';
        pauseButton.classList.remove('btn-success');
        pauseButton.classList.add('btn-primary');
        const method = this.permissions.collectionMethod === 'both' ? 'Content+Webcam' : 'Content Only';
        this.updateStatus('connected', `${method} Active`);
      }
    }
  }

  async loadPopupData() {
    try {
      // Always check pause state
      const pauseResponse = await this.sendMessage({ type: 'GET_PAUSE_STATE' });
      if (pauseResponse) {
        // Update permissions with pause state
        if (this.permissions) {
          this.permissions.paused = pauseResponse.paused;
        }
        this.updatePermissionUI();
      }
    } catch (error) {
      console.error('Error getting pause state:', error);
    }
    
    // Load data regardless of pause state to show historical data
    try {
      const [analyticsResponse, webcamResponse, continuousResponse] = await Promise.all([
        this.sendMessage({ type: 'GET_ANALYTICS_DATA' }),
        this.sendMessage({ type: 'GET_WEBCAM_DATA' }),
        this.sendMessage({ type: 'GET_CONTINUOUS_DATA' })
      ]);

      if (analyticsResponse?.analytics) {
        this.analyticsData = analyticsResponse.analytics;
      }
      
      if (webcamResponse?.webcamData) {
        this.webcamData = webcamResponse.webcamData;
      }
      
      if (continuousResponse?.continuousData) {
        this.continuousData = continuousResponse.continuousData;
      }

      this.updateUI();
    } catch (error) {
      console.error('Error loading popup data:', error);
      this.updateStatus('error', 'Connection Error');
    }
  }

  updateUI() {
    const realData = this.analyticsData.filter(item => 
      item.url && !item.url.includes('example.com') && !item.url.includes('test-content')
    );

    // Calculate real metrics from persistent data
    const triggerCount = realData.reduce((sum, item) => sum + (item.triggers?.length || 0), 0);
    const pagesCount = realData.length;
    
    // Calculate real sentiment score
    const positiveItems = realData.filter(item => 
      item.sentiment?.score > 0 || item.aiAnalysis?.sentiment === 'positive'
    ).length;
    const sentimentScore = pagesCount > 0 ? Math.round((positiveItems / pagesCount) * 100) : 0;

    // Update counters
    document.getElementById('triggersCount').textContent = this.formatNumber(triggerCount);
    document.getElementById('pagesCount').textContent = this.formatNumber(pagesCount);
    document.getElementById('sentimentScore').textContent = `${sentimentScore}%`;

    // Update status with data stats
    const totalData = pagesCount + this.continuousData.length + this.webcamData.length;
    if (this.permissions?.paused) {
      this.updateStatus('disconnected', 'Paused');
    } else if (totalData > 0) {
      this.updateStatus('connected', `${this.formatNumber(totalData)} data points`);
    } else {
      this.updateStatus('connected', 'Collecting data...');
    }

    // Show recent activity
    this.showRecentActivity();
  }

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  updateStatus(status, message) {
    const statusIndicator = document.getElementById('statusIndicator');
    statusIndicator.className = 'status-indicator';
    
    switch (status) {
      case 'connected':
        statusIndicator.classList.add('status-connected');
        statusIndicator.innerHTML = `✅ ${message}`;
        break;
      case 'disconnected':
        statusIndicator.classList.add('status-disconnected');
        statusIndicator.innerHTML = `❌ ${message}`;
        break;
      case 'error':
        statusIndicator.classList.add('status-disconnected');
        statusIndicator.innerHTML = `⚠️ ${message}`;
        break;
    }
  }

  showRecentActivity() {
    const container = document.getElementById('recentActivity');
    
    // Combine all data sources and get most recent
    const allData = [
      ...this.analyticsData.slice(0, 2),
      ...this.webcamData.slice(0, 1),
      ...this.continuousData.slice(0, 1)
    ].sort((a, b) => (b.timestamp || b.processedAt) - (a.timestamp || a.processedAt))
     .slice(0, 3); // Show only 3 items for compact view

    if (allData.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div>No data yet</div>
        </div>
      `;
      return;
    }

    const activityHTML = allData.map((item, index) => {
      const isWebcam = item.source === 'webcam_analysis';
      const isContinuous = item.dataType === 'mood_metrics';
      
      if (isWebcam) {
        return this.createWebcamActivityItem(item, index);
      } else if (isContinuous) {
        return this.createContinuousActivityItem(item, index);
      } else {
        return this.createContentActivityItem(item, index);
      }
    }).join('');
    
    container.innerHTML = activityHTML;
  }

  createWebcamActivityItem(item, index) {
    const emotion = item.dominantEmotion || 'neutral';
    const timeAgo = this.getTimeAgo(item.timestamp);
    
    return `
      <div class="activity-item">
        <div class="activity-title">📷 ${emotion}</div>
        <div class="activity-meta">${timeAgo}</div>
      </div>
    `;
  }

  createContentActivityItem(item, index) {
    const triggers = item.triggers || [];
    const moodLevel = this.getMoodLevel(item);
    const timeAgo = this.getTimeAgo(item.timestamp || item.processedAt);
    const domain = this.extractDomain(item.url);
    
    return `
      <div class="activity-item">
        <div class="activity-title">${this.truncateText(domain, 20)}</div>
        <div class="activity-triggers">
          <span class="trigger-count">${triggers.length}t</span>
          ${moodLevel}
        </div>
        <div class="activity-meta">${timeAgo}</div>
      </div>
    `;
  }

  createContinuousActivityItem(item, index) {
    const triggers = item.triggers || [];
    const moodLevel = item.moodIntensity || 'low';
    const timeAgo = this.getTimeAgo(item.timestamp);
    
    return `
      <div class="activity-item">
        <div class="activity-title">🔄 Monitoring</div>
        <div class="activity-triggers">
          <span class="trigger-count">${triggers.length}t</span>
          ${moodLevel}
        </div>
        <div class="activity-meta">${timeAgo}</div>
      </div>
    `;
  }

  getMoodLevel(item) {
    const triggers = item.triggers || [];
    const sentiment = item.sentiment?.score || 0;
    const aiRisk = item.aiAnalysis?.riskLevel;
    
    if (aiRisk === 'crisis') return '🚨';
    if (aiRisk === 'high') return '🔴';
    if (aiRisk === 'medium') return '🟡';
    if (triggers.some(t => ['suicide', 'suicidal', 'self-harm', 'crisis'].includes(t))) return '🚨';
    if (triggers.some(t => ['depression', 'anxiety', 'panic', 'hopeless'].includes(t))) return '🔴';
    if (triggers.length > 0) return '🟡';
    if (sentiment > 0) return '✅';
    return '⚪';
  }

  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  async updateCollectionMethod(method) {
    try {
      const response = await this.sendMessage({
        type: 'UPDATE_COLLECTION_METHOD',
        method: method
      });
      
      if (response.success) {
        this.showNotification(`Collection method: ${method === 'both' ? 'Content + Webcam' : 'Content Only'}`, 'success');
        // Reload permissions to get updated state
        await this.checkPermissions();
      }
    } catch (error) {
      this.showNotification('Failed to update collection method', 'error');
    }
  }

  async togglePauseCollection() {
    try {
      const currentPaused = this.permissions?.paused || false;
      const response = await this.sendMessage({
        type: 'TOGGLE_PAUSE',
        paused: !currentPaused
      });
      
      if (response.success) {
        // Reload permissions to get updated state
        await this.checkPermissions();
        this.showNotification(
          this.permissions.paused ? 'Data collection paused' : 'Data collection resumed',
          this.permissions.paused ? 'warning' : 'success'
        );
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
      this.showNotification('Failed to toggle pause', 'error');
    }
  }

  openDashboard() {
    chrome.tabs.create({ 
      url: 'http://localhost:3000',
      active: true 
    });
  }

  enableTracking() {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('permission-request.html') 
    });
  }

  showTriggerDetails() {
    const triggerCount = this.analyticsData.reduce((sum, item) => sum + (item.triggers?.length || 0), 0);
    this.showNotification(`${triggerCount} mood triggers detected`, 'info');
  }

  showPagesDetails() {
    const pagesCount = this.analyticsData.length;
    this.showNotification(`Analyzed ${pagesCount} pages`, 'info');
  }

  showSentimentDetails() {
    const positive = this.analyticsData.filter(item => item.sentiment?.score > 0).length;
    const total = this.analyticsData.length;
    const percentage = total > 0 ? Math.round((positive / total) * 100) : 0;
    this.showNotification(`${percentage}% positive content`, 'info');
  }

  showNotification(message, type = 'info') {
    // Simple notification without animation for compact design
    console.log(`${type}: ${message}`);
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  truncateText(text, maxLength) {
    if (!text) return 'No title';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.zenithPopup = new ZenithPopup();
});