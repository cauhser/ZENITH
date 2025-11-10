// popup-mobile.js - Mobile-friendly version with enhanced features
class ZenithMobilePopup extends ZenithPopup {
  constructor() {
    super();
    this.moodData = [];
    this.tips = [
      "Take a 5-minute break every hour to reduce eye strain",
      "Practice deep breathing when feeling overwhelmed",
      "Stay hydrated throughout the day for better focus",
      "Set boundaries for work and personal time",
      "Celebrate small wins to boost your mood"
    ];
    this.initMobileFeatures();
  }

  initMobileFeatures() {
    this.setupMobileEventListeners();
    this.loadMoodData();
    this.drawMoodChart();
  }

  setupMobileEventListeners() {
    // Call parent event listeners
    super.setupEventListeners();
    
    // Add mobile-specific event listeners
    const takeBreakBtn = document.getElementById('takeBreak');
    const logMoodBtn = document.getElementById('logMood');
    const dailyTipBtn = document.getElementById('dailyTip');
    const emergencyHelpBtn = document.getElementById('emergencyHelp');
    
    if (takeBreakBtn) {
      takeBreakBtn.addEventListener('click', () => this.takeBreak());
    }
    
    if (logMoodBtn) {
      logMoodBtn.addEventListener('click', () => this.logMood());
    }
    
    if (dailyTipBtn) {
      dailyTipBtn.addEventListener('click', () => this.showDailyTip());
    }
    
    if (emergencyHelpBtn) {
      emergencyHelpBtn.addEventListener('click', () => this.showEmergencyHelp());
    }
  }

  async loadMoodData() {
    try {
      const response = await this.sendMessage({ type: 'GET_MOOD_DATA' });
      if (response?.moodData) {
        this.moodData = response.moodData;
        this.updateMoodOverview();
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
    }
  }

  updateMoodOverview() {
    // Calculate today's mood
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayData = this.moodData.filter(item => {
      const itemDate = new Date(item.timestamp);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
    
    // Calculate this week's mood
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekData = this.moodData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= oneWeekAgo;
    });
    
    // Update UI
    const todayMood = document.getElementById('todayMood');
    const weekMood = document.getElementById('weekMood');
    
    if (todayMood) {
      todayMood.textContent = this.getAverageMoodEmoji(todayData);
    }
    
    if (weekMood) {
      weekMood.textContent = this.getAverageMoodEmoji(weekData);
    }
  }

  getAverageMoodEmoji(moodData) {
    if (moodData.length === 0) return '😐';
    
    const avgScore = moodData.reduce((sum, item) => sum + (item.moodScore || 0), 0) / moodData.length;
    
    if (avgScore >= 0.8) return '😊';
    if (avgScore >= 0.6) return '🙂';
    if (avgScore >= 0.4) return '😐';
    if (avgScore >= 0.2) return '😕';
    return '😢';
  }

  drawMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple mood chart
    const width = canvas.width;
    const height = canvas.height;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    // Draw mood data points (simplified)
    if (this.moodData.length > 0) {
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const dataPoints = Math.min(this.moodData.length, 7); // Last 7 days
      const pointSpacing = chartWidth / (dataPoints - 1);
      
      for (let i = 0; i < dataPoints; i++) {
        const dataIndex = this.moodData.length - dataPoints + i;
        const moodScore = this.moodData[dataIndex]?.moodScore || 0;
        const x = padding + i * pointSpacing;
        const y = padding + chartHeight - (moodScore * chartHeight);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = '#8b5cf6';
      for (let i = 0; i < dataPoints; i++) {
        const dataIndex = this.moodData.length - dataPoints + i;
        const moodScore = this.moodData[dataIndex]?.moodScore || 0;
        const x = padding + i * pointSpacing;
        const y = padding + chartHeight - (moodScore * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  takeBreak() {
    // Show break timer modal
    this.showNotification('Take a 5-minute break! Step away from your screen.', 'info');
    
    // Create a simple break timer
    let seconds = 300; // 5 minutes
    const breakInterval = setInterval(() => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      this.showNotification(`Break time: ${minutes}:${secs.toString().padStart(2, '0')}`, 'info');
      
      if (seconds <= 0) {
        clearInterval(breakInterval);
        this.showNotification('Break time is over! Ready to continue.', 'success');
      }
      
      seconds--;
    }, 1000);
  }

  logMood() {
    // Show mood logging interface
    const moods = ['😊 Happy', '😐 Neutral', '😢 Sad', '😠 Angry', '😰 Anxious', '😌 Relaxed', '.Focused'];
    
    // Create a simple mood selector
    let moodSelector = '😊 Happy';
    this.showNotification(`Logging mood: ${moodSelector}`, 'info');
    
    // In a real implementation, this would show a modal with mood options
    // For now, we'll just simulate logging a random mood
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    this.showNotification(`Mood logged: ${randomMood}`, 'success');
  }

  showDailyTip() {
    const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
    this.showNotification(randomTip, 'info');
  }

  showEmergencyHelp() {
    const emergencyContacts = [
      'National Suicide Prevention Lifeline: 988',
      'Crisis Text Line: Text HOME to 741741',
      'Emergency Services: 911'
    ];
    
    const message = `紧急帮助资源:\n${emergencyContacts.join('\n')}`;
    this.showNotification(message, 'warning');
    
    // In a real implementation, this would open a modal with emergency resources
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `status-message status-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.padding = '12px';
    notification.style.borderRadius = '8px';
    notification.style.textAlign = 'center';
    notification.style.fontWeight = '600';
    notification.style.fontSize = '13px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    
    // Set colors based on type
    switch (type) {
      case 'success':
        notification.style.background = 'rgba(16, 185, 129, 0.9)';
        notification.style.color = '#064e3b';
        notification.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        break;
      case 'warning':
        notification.style.background = 'rgba(245, 158, 11, 0.9)';
        notification.style.color = '#92400e';
        notification.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        break;
      case 'error':
        notification.style.background = 'rgba(239, 68, 68, 0.9)';
        notification.style.color = '#7f1d1d';
        notification.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        break;
      default:
        notification.style.background = 'rgba(99, 102, 241, 0.9)';
        notification.style.color = '#1e1b4b';
        notification.style.border = '1px solid rgba(99, 102, 241, 0.3)';
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Device detection function
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
}

// Initialize the appropriate popup based on device
document.addEventListener('DOMContentLoaded', () => {
  if (isMobileDevice()) {
    window.zenithPopup = new ZenithMobilePopup();
  } else {
    window.zenithPopup = new ZenithPopup();
  }
});