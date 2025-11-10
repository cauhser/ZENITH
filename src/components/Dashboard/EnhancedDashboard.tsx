import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../store';
import EmotionChart from '../EmotionChart/EmotionChart';
import TriggerWordCloud from './TriggerWordCloud';
import { WebSocketService } from '../../services/websocket/websocket';
import { EmotionData, GazeData } from '../../types/wellness';
import './EnhancedDashboard.css';
import { useNavigate } from 'react-router-dom';

// Create WebSocket service instance
const websocketService = new WebSocketService('ws://localhost:3000');

// Enhanced emotion detection hook
const useEmotionDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'available' | 'unavailable' | 'blocked' | 'checking'>('checking');
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeDetection = useCallback(async () => {
    setIsInitializing(true);
    setInitializationError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInitialized(true);
      setCameraStatus('available');
      setPerformanceMetrics({
        fps: 30,
        averageDetectionTime: 45,
        detectionFrequency: 1000,
        accuracy: 92
      });
    } catch (error) {
      setInitializationError('Failed to initialize emotion detection. Please check camera permissions.');
      setCameraStatus('unavailable');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const toggleDetection = () => {
    if (!isInitialized) return;
    setIsDetecting(!isDetecting);
  };

  return {
    isInitialized,
    isDetecting,
    cameraStatus,
    performanceMetrics,
    initializationError,
    toggleDetection,
    initializeDetection,
    canStartDetection: isInitialized && !isDetecting,
    canStopDetection: isInitialized && isDetecting,
    hasCamera: cameraStatus === 'available',
    isInitializing
  };
};

// Update the component props
interface EnhancedDashboardProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

// Update the component signature
const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const {
    wellnessScore,
    screenTime,
    currentEmotion,
    emotionalTrends,
    contentTriggers,
    breakReminders,
    addEmotionData,
    addContentTrigger,
    addBreakReminder,
    addGazeData,
    setScreenTime,
    updateWellnessScore,
    updateAttentionMetrics
  } = useStore();
  
  const {
    isInitialized,
    isDetecting,
    cameraStatus,
    performanceMetrics,
    initializationError,
    toggleDetection,
    initializeDetection,
    canStartDetection,
    canStopDetection,
    hasCamera,
    isInitializing
  } = useEmotionDetection();

  const [breakAlert, setBreakAlert] = useState(false);
  const [showEmotionHistory, setShowEmotionHistory] = useState(false);
  const [showDeveloperMode, setShowDeveloperMode] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [timeInterval, setTimeInterval] = useState('1d'); // Default to day view
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(2023);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showHourlyView, setShowHourlyView] = useState(false);
  const [showChatbox, setShowChatbox] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [chatInput, setChatInput] = useState('');

  // New state for additional features
  const [focusSessions, setFocusSessions] = useState<Array<{start: number, end: number, duration: number}>>([]);
  const [productivityScore, setProductivityScore] = useState(75);
  const [distractionLog, setDistractionLog] = useState<Array<{time: number, type: string, duration: number}>>([]);
  const [wellnessTips, setWellnessTips] = useState<Array<string>>([
    "Take a 5-minute break every hour to reduce eye strain",
    "Practice deep breathing when feeling overwhelmed",
    "Stay hydrated throughout the day for better focus"
  ]);
  const [goalTracking, setGoalTracking] = useState({
    daily: { target: 8, current: 6, unit: 'hours' },
    weekly: { target: 40, current: 32, unit: 'hours' },
    monthly: { target: 160, current: 120, unit: 'hours' }
  });

  // Add state for wellness challenge
  const [currentChallenge, setCurrentChallenge] = useState({
    title: "Digital Detox Thursday",
    description: "Track usage and earn badge",
    progress: 65,
    badge: "🧘"
  });

  // Function to start a focus session
  const startFocusSession = () => {
    const startTime = Date.now();
    // In a real implementation, this would start a timer
    console.log('Focus session started at:', new Date(startTime).toLocaleTimeString());
  };

  // Function to log a distraction
  const logDistraction = (type: string) => {
    const newDistraction = {
      time: Date.now(),
      type,
      duration: Math.floor(Math.random() * 10) + 1 // Random duration 1-10 minutes
    };
    setDistractionLog(prev => [...prev, newDistraction]);
  };

  // Function to add a wellness tip
  const addWellnessTip = (tip: string) => {
    setWellnessTips(prev => [...prev, tip]);
  };

  // Function to update goal tracking
  const updateGoal = (period: 'daily' | 'weekly' | 'monthly', increment: number) => {
    setGoalTracking(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        current: Math.min(prev[period].current + increment, prev[period].target)
      }
    }));
  };

  // Function to generate productivity insights
  const generateProductivityInsights = () => {
    const insights = [];
    
    // Analyze focus sessions
    if (focusSessions.length > 0) {
      const avgDuration = focusSessions.reduce((sum, session) => sum + session.duration, 0) / focusSessions.length;
      if (avgDuration > 30) {
        insights.push("✅ Great job! Your average focus session is over 30 minutes.");
      } else {
        insights.push("💡 Try to extend your focus sessions for better productivity.");
      }
    }
    
    // Analyze distractions
    if (distractionLog.length > 5) {
      insights.push("⚠️ You've had many distractions today. Consider blocking distracting websites.");
    }
    
    // Analyze goals
    if (goalTracking.daily.current >= goalTracking.daily.target) {
      insights.push("🏆 You've met your daily focus goal!");
    } else {
      const remaining = goalTracking.daily.target - goalTracking.daily.current;
      insights.push(`🎯 You need ${remaining} more ${goalTracking.daily.unit} to meet your daily goal.`);
    }
    
    return insights;
  };

  // Function to handle day click in calendar
  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setShowHourlyView(true);
    }
  };

  // Function to handle chat submit
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() === '') return;
    
    // Add user message
    const newUserMessage = { text: chatInput, isUser: true };
    setChatMessages(prev => [...prev, newUserMessage]);
    
    // Simulate AI response
    const aiResponse = { 
      text: `I understand you're feeling ${currentEmotion}. It's important to take care of your emotional wellbeing. Would you like some specific advice or resources?`, 
      isUser: false 
    };
    
    // Add AI response after a short delay
    setTimeout(() => {
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
    
    setChatInput('');
  };

  // Function to get hourly emotion data for a specific date
  const getHourlyEmotionData = (date: Date) => {
    // This is a mock implementation - in a real app, you would fetch actual data
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      // Create a more realistic pattern based on time of day
      const emotions = ['happy', 'sad', 'anxious', 'neutral', 'stressed', 'focused', 'relaxed'];
      let emotion;
      
      // Simulate typical daily emotion patterns
      if (hour >= 6 && hour <= 9) {
        // Morning - often neutral or happy
        emotion = Math.random() > 0.7 ? 'happy' : 'neutral';
      } else if (hour >= 10 && hour <= 12) {
        // Late morning - often focused
        emotion = Math.random() > 0.6 ? 'focused' : 'neutral';
      } else if (hour >= 13 && hour <= 14) {
        // Afternoon - can be stressed or relaxed
        emotion = Math.random() > 0.5 ? 'stressed' : 'relaxed';
      } else if (hour >= 15 && hour <= 18) {
        // Evening - mixed emotions
        const emotionOptions = ['happy', 'neutral', 'stressed', 'focused'];
        emotion = emotionOptions[Math.floor(Math.random() * emotionOptions.length)];
      } else {
        // Night - often relaxed or neutral
        emotion = Math.random() > 0.6 ? 'relaxed' : 'neutral';
      }
      
      // Intensity varies throughout the day
      let intensity = 50; // Base intensity
      if (hour >= 6 && hour <= 9) {
        intensity = 60 + Math.random() * 20; // Morning energy
      } else if (hour >= 12 && hour <= 14) {
        intensity = 70 + Math.random() * 30; // Midday peak
      } else if (hour >= 20 && hour <= 23) {
        intensity = 30 + Math.random() * 40; // Evening wind-down
      } else {
        intensity = 40 + Math.random() * 30; // Night/early morning
      }
      
      return {
        hour,
        emotion,
        intensity
      };
    });
  };

  useEffect(() => {
    const updateWebsocketStatus = () => {
      const readyState = websocketService.getReadyState();
      if (readyState === WebSocket.OPEN) {
        setWebsocketStatus('connected');
      } else if (readyState === WebSocket.CONNECTING) {
        setWebsocketStatus('connecting');
      } else {
        setWebsocketStatus('disconnected');
      }
    };

    websocketService.initialize().then(() => {
      updateWebsocketStatus();
    }).catch(error => {
      console.error('WebSocket initialization failed:', error);
      setWebsocketStatus('disconnected');
    });

    updateWebsocketStatus();
    const interval = setInterval(updateWebsocketStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    initializeDetection();
  }, [initializeDetection]);

  useEffect(() => {
    const emotionInterval = setInterval(() => {
      const emotions = ['happy', 'sad', 'anxious', 'neutral', 'stressed', 'focused', 'relaxed'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      const emotionData: EmotionData = {
        emotion: randomEmotion,
        intensity: Math.random() * 100,
        timestamp: Date.now(),
        confidence: Math.random() * 0.5 + 0.5
      };
      
      addEmotionData(emotionData);

      if (websocketStatus === 'connected') {
        websocketService.sendMessage('EMOTION_UPDATE', emotionData);
      }

      if (Math.random() > 0.7) {
        const triggers = ['negative comments', 'stressful news', 'anxiety-inducing content'];
        const randomTrigger = triggers[Math.floor(Math.random() * triggers.length)];
        addContentTrigger(randomTrigger);
      }

      if (Math.random() > 0.5) {
        const gazePoint = {
          x: Math.random() * 100,
          y: Math.random() * 100,
          timestamp: Date.now(),
          content: 'simulated_content'
        };
        addGazeData(gazePoint);
      }

      setScreenTime(screenTime + 1);
    }, 15000);

    return () => clearInterval(emotionInterval);
  }, [addEmotionData, addContentTrigger, addGazeData, setScreenTime, screenTime, websocketStatus]);

  useEffect(() => {
    if (screenTime > 60 && screenTime % 30 === 0) {
      setBreakAlert(true);
      addBreakReminder({
        type: 'screen_time',
        triggeredAt: new Date().toISOString()
      });

      if (websocketStatus === 'connected') {
        websocketService.sendMessage('BREAK_REMINDER', {
          type: 'screen_time',
          screenTime,
          triggeredAt: new Date().toISOString()
        });
      }
    }
  }, [screenTime, addBreakReminder, websocketStatus]);

  const getWellnessStatus = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-600' };
    if (score >= 40) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Needs Attention', color: 'text-red-600' };
  };

  const status = getWellnessStatus(wellnessScore);

  const getEmotionTrend = () => {
    const recentEmotions = emotionalTrends.slice(-20);
    const emotionCounts = recentEmotions.reduce((acc: Record<string, number>, data: EmotionData) => {
      acc[data.emotion] = (acc[data.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      percentage: (count as number / recentEmotions.length) * 100
    }));
  };

  const emotionTrends = getEmotionTrend();

  // Function to filter emotion data based on time interval
  const filterEmotionData = (interval: string) => {
    // This is a mock implementation - in a real app, you would filter actual data
    switch (interval) {
      case '30m':
        return emotionalTrends.slice(-5);
      case '1h':
        return emotionalTrends.slice(-10);
      case '1d':
        return emotionalTrends;
      case '1w':
        return [...emotionalTrends, ...emotionalTrends.slice(0, 5)];
      case '1mo':
        return [...emotionalTrends, ...emotionalTrends, ...emotionalTrends.slice(0, 10)];
      case '1y':
        return [...emotionalTrends, ...emotionalTrends, ...emotionalTrends, ...emotionalTrends];
      default:
        return emotionalTrends;
    }
  };

  // Helper function to get emotion for a specific date
  const getEmotionForDate = (date: Date) => {
    // Find emotion data for the specific date
    const dateString = date.toDateString();
    const emotionData = emotionalTrends.find(data => {
      const dataDate = new Date(data.timestamp);
      return dataDate.toDateString() === dateString;
    });
    
    // If we found data for this date, return the emotion
    if (emotionData) {
      return emotionData.emotion;
    }
    
    // Otherwise, return null (no emotion data for this date)
    return null;
  };

  // Helper function to get color for emotion
  const getEmotionColor = (emotion: string) => {
    const emotionColors: Record<string, string> = {
      'happy': 'rgba(16, 185, 129, 0.3)',
      'sad': 'rgba(96, 165, 250, 0.3)',
      'anxious': 'rgba(245, 158, 11, 0.3)',
      'neutral': 'rgba(163, 163, 163, 0.3)',
      'stressed': 'rgba(239, 68, 68, 0.3)',
      'focused': 'rgba(139, 92, 246, 0.3)',
      'relaxed': 'rgba(20, 184, 166, 0.3)'
    };
    return emotionColors[emotion] || 'rgba(163, 163, 163, 0.3)';
  };

  // Helper function to get emoji for emotion
  const getEmotionEmoji = (emotion: string | null) => {
    if (!emotion) return '';
    
    const emotionEmojis: Record<string, string> = {
      'happy': '😊',
      'sad': '😢',
      'anxious': '😰',
      'neutral': '😐',
      'stressed': '😫',
      'focused': '🤔',
      'relaxed': '😌'
    };
    
    return emotionEmojis[emotion] || '😐';
  };

  // Function to filter activity data based on time interval
  const filterActivityData = (interval: string) => {
    // This is a mock implementation - in a real app, you would filter actual data
    const now = Date.now();
    let filteredReminders = [...breakReminders];
    
    switch (interval) {
      case '30m':
        // Filter reminders from last 30 minutes
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 30 * 60 * 1000;
        });
        break;
      case '1h':
        // Filter reminders from last hour
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 60 * 60 * 1000;
        });
        break;
      case '1d':
        // Filter reminders from last day
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 24 * 60 * 60 * 1000;
        });
        break;
      case '1w':
        // Filter reminders from last week
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 7 * 24 * 60 * 60 * 1000;
        });
        break;
      case '1mo':
        // Filter reminders from last month
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 30 * 24 * 60 * 60 * 1000;
        });
        break;
      case '1y':
        // Filter reminders from last year
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 365 * 24 * 60 * 60 * 1000;
        });
        break;
      default:
        filteredReminders = breakReminders;
    }
    
    return filteredReminders.slice(-5).reverse(); // Show latest 5
  };

  // Add state for activity time interval
  const [activityTimeInterval, setActivityTimeInterval] = useState('1d');

  const handleSignOut = () => {
    // Add sign out logic here
    navigate('/');
  };
  
  // Function to generate simulated data
  const generateSimulatedData = () => {
    // Generate emotional trends data
    const emotions = ['happy', 'sad', 'anxious', 'neutral', 'stressed', 'focused', 'relaxed'];
    const now = Date.now();
    
    // Add emotional trends data for the past week
    for (let i = 0; i < 100; i++) {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const emotionData: EmotionData = {
        emotion: randomEmotion,
        intensity: Math.random() * 100,
        timestamp: now - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time within the last week
        confidence: Math.random() * 0.5 + 0.5
      };
      addEmotionData(emotionData);
    }
    
    // Add gaze data
    for (let i = 0; i < 50; i++) {
      const gazePoint: GazeData = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        timestamp: now - Math.random() * 24 * 60 * 60 * 1000, // Random time within the last 24 hours
        content: `simulated_content_${i}`
      };
      addGazeData(gazePoint);
    }
    
    // Add break reminders
    const reminderTypes = ['screen_time', 'emotion_based'];
    for (let i = 0; i < 10; i++) {
      addBreakReminder({
        type: reminderTypes[Math.floor(Math.random() * reminderTypes.length)],
        triggeredAt: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString() // Random time within the last 24 hours
      });
    }
    
    // Add content triggers
    const triggers = [
      'negative comments',
      'stressful news',
      'anxiety-inducing content',
      'work-related stress',
      'social media comparison',
      'entertainment binge'
    ];
    
    triggers.forEach(trigger => {
      addContentTrigger(trigger);
    });
    
    // Update screen time
    setScreenTime(Math.floor(Math.random() * 120)); // Random screen time up to 120 minutes
    
    // Update wellness score
    updateWellnessScore(Math.floor(Math.random() * 40) + 60); // Random score between 60-100
    
    // Update attention metrics
    updateAttentionMetrics({
      focusSessions: Math.floor(Math.random() * 20),
      attentionSpan: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
      distractions: Math.floor(Math.random() * 15)
    });
  };

  // Add a button to generate simulated data
  const handleGenerateSimulatedData = () => {
    generateSimulatedData();
  };

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🧠 ZENITH Wellness Dashboard</h1>
          <button 
            className="btn btn-secondary mood-report-btn"
            onClick={() => setShowEmotionHistory(true)}
          >
            📊 View Mood Report
          </button>
        </div>
        <div className="header-right">
          {/* Add Dark Mode Toggle */}
          <button 
            className="btn btn-secondary dark-mode-toggle"
            onClick={() => toggleDarkMode && toggleDarkMode()}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          
          <button 
            className="btn btn-primary signout-btn"
            onClick={handleSignOut}
          >
            🔒 Sign Out
          </button>
        </div>
      </header>
      
      {/* Break Alert */}
      {breakAlert && (
        <div className="break-alert-overlay">
          <div className="break-alert">
            <div className="alert-content">
              <h3>🎯 Time for a Break!</h3>
              <p>You've been active for {screenTime} minutes. Consider taking a short break to refresh your mind and eyes.</p>
              <button 
                onClick={() => setBreakAlert(false)}
                className="btn btn-primary"
              >
                Dismiss & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="main-content">
          {/* Weekly Wellness Challenge */}
          <div className="wellness-challenge">
            <div className="challenge-header">
              <h3>Weekly Wellness Challenge</h3>
              <span className="challenge-badge">{currentChallenge.badge}</span>
            </div>
            <div className="challenge-content">
              <h4>{currentChallenge.title}</h4>
              <p>{currentChallenge.description}</p>
              <div className="challenge-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${currentChallenge.progress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{currentChallenge.progress}% complete</div>
              </div>
              <button className="btn btn-primary challenge-action">
                Share on IG Story
              </button>
            </div>
          </div>
          
          {/* Wellness Metrics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🧠</div>
              <div className="stat-content">
                <h3>Wellness Score</h3>
                <div className={`stat-value ${status.color}`}>
                  {wellnessScore}%
                </div>
                <p className="stat-description">{status.text}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <h3>Screen Time</h3>
                <div className="stat-value">{screenTime}m</div>
                <p className="stat-description">Today's usage</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">😊</div>
              <div className="stat-content">
                <h3>Current Emotion</h3>
                <div className="stat-value">{currentEmotion}</div>
                <p className="stat-description">
                  {isDetecting ? 'Live Detection' : 'Simulated Data'}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>Content Triggers</h3>
                <div className="stat-value">{contentTriggers.length}</div>
                <p className="stat-description">Potential stressors</p>
              </div>
            </div>
          </div>

          {/* Emotion History */}
          {showEmotionHistory && (
            <div className="card">
              <h3>Emotion History</h3>
              <div className="time-selector">
                <button 
                  className="time-btn"
                  onClick={() => setTimeInterval('30m')}
                  style={{
                    background: timeInterval === '30m' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                    color: timeInterval === '30m' ? 'white' : '#1e293b',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    margin: '0 5px'
                  }}
                >
                  30m
                </button>
                <button 
                  className="time-btn"
                  onClick={() => setTimeInterval('1h')}
                  style={{
                    background: timeInterval === '1h' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                    color: timeInterval === '1h' ? 'white' : '#1e293b',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    margin: '0 5px'
                  }}
                >
                  1h
                </button>
                <button 
                  className="time-btn"
                  onClick={() => setTimeInterval('1d')}
                  style={{
                    background: timeInterval === '1d' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                    color: timeInterval === '1d' ? 'white' : '#1e293b',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    margin: '0 5px'
                  }}
                >
                  Day
                </button>
                <button 
                  className="time-btn"
                  onClick={() => setTimeInterval('1w')}
                  style={{
                    background: timeInterval === '1w' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                    color: timeInterval === '1w' ? 'white' : '#1e293b',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    margin: '0 5px'
                  }}
                >
                  Week
                </button>
                <button 
                  className="time-btn"
                  onClick={() => setTimeInterval('1mo')}
                  style={{
                    background: timeInterval === '1mo' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                    color: timeInterval === '1mo' ? 'white' : '#1e293b',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    margin: '0 5px'
                  }}
                >
                  Month
                </button>
                <button 
                  className="time-btn"
                  onClick={() => setTimeInterval('1y')}
                  style={{
                    background: timeInterval === '1y' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                    color: timeInterval === '1y' ? 'white' : '#1e293b',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    margin: '0 5px'
                  }}
                >
                  Year
                </button>
              </div>
              <div className="emotion-chart-container">
                <EmotionChart data={filterEmotionData(timeInterval)} />
              </div>
              <div className="emotion-trends">
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '20px',
                  textAlign: 'center',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  📊 Emotion Distribution Overview
                </h3>
                
                {/* Summary Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '15px',
                  marginBottom: '25px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #1667c9, #1e40af)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(22, 103, 201, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>{emotionTrends.length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>Emotions</div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                      {emotionTrends.length > 0 ? 
                        emotionTrends.reduce((max, trend) => trend.percentage > max.percentage ? trend : max, emotionTrends[0]).emotion :
                        'N/A'}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>Dominant</div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)'
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                      {emotionTrends.length > 0 ? 
                        (emotionTrends.reduce((sum, trend) => sum + trend.percentage, 0) / emotionTrends.length).toFixed(0) + '%' :
                        '0%'}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>Average</div>
                  </div>
                </div>
                
                {/* Emotion Distribution Bars */}
                <div className="trend-list">
                  {emotionTrends.map((trend, index) => {
                    // Get emotion color
                    const emotionColors: Record<string, string> = {
                      'happy': '#10b981',
                      'sad': '#3b82f6',
                      'anxious': '#f59e0b',
                      'neutral': '#64748b',
                      'stressed': '#ef4444',
                      'focused': '#8b5cf6',
                      'relaxed': '#06b6d4'
                    };
                    
                    const color = emotionColors[trend.emotion] || '#64748b';
                    
                    return (
                      <div 
                        key={index} 
                        className="trend-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          padding: '12px 15px',
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          transition: 'none'
                        }}
                      >
                        {/* Emotion Name */}
                        <div style={{
                          fontWeight: '500',
                          color: '#1e293b',
                          minWidth: '80px',
                          textTransform: 'capitalize',
                          fontSize: '0.95rem'
                        }}>
                          {trend.emotion}
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div style={{
                          flex: 1,
                          height: '8px',
                          background: '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div 
                            className="trend-fill"
                            style={{
                              height: '100%',
                              borderRadius: '4px',
                              background: color,
                              width: `${trend.percentage}%`,
                              transition: 'none'
                            }}
                          />
                        </div>
                        
                        {/* Percentage */}
                        <div style={{
                          fontWeight: '600',
                          color: color,
                          minWidth: '45px',
                          textAlign: 'right',
                          fontSize: '0.9rem'
                        }}>
                          {trend.percentage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Empty State */}
                {emotionTrends.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '30px 20px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
                    <h4 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: '#1e293b'
                    }}>
                      No Emotion Data Yet
                    </h4>
                    <p style={{ 
                      fontSize: '0.9rem',
                      marginBottom: '0'
                    }}>
                      Start using the wellness tracker to see your emotion distribution
                    </p>
                  </div>
                )}
              </div>

              {/* Calendar View */}
              <div className="calendar-view">
                <h4>Emotion Calendar</h4>
                <div className="calendar-header">
                  <div className="calendar-month-year-selector">
                    <select 
                      value={calendarMonth}
                      onChange={(e) => setCalendarMonth(parseInt(e.target.value))}
                      className="calendar-selector"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(2023, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select 
                      value={calendarYear}
                      onChange={(e) => setCalendarYear(parseInt(e.target.value))}
                      className="calendar-selector"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={i} value={2021 + i}>
                          {2021 + i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                  <div>
                    <button 
                      className="calendar-nav"
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear(prev => prev - 1);
                        } else {
                          setCalendarMonth(prev => prev - 1);
                        }
                      }}
                      style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      &lt; Prev
                    </button>
                    <button 
                      className="calendar-nav"
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0);
                          setCalendarYear(prev => prev + 1);
                        } else {
                          setCalendarMonth(prev => prev + 1);
                        }
                      }}
                      style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        marginLeft: '10px'
                      }}
                    >
                      Next &gt;
                    </button>
                  </div>
                </div>
                
                {/* Hourly View */}
                {showHourlyView && selectedDate && (
                  <div className="hourly-view">
                    <div className="hourly-view-header">
                      <h5>
                        Emotions for {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h5>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setShowHourlyView(false)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.9rem'
                        }}
                      >
                        Back to Calendar
                      </button>
                    </div>
                    <div className="hourly-emotion-chart">
                      {getHourlyEmotionData(selectedDate).map((hourData) => (
                        <div 
                          key={hourData.hour}
                          className="hourly-bar"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            borderBottom: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{ width: '40px', fontWeight: '600' }}>
                            {hourData.hour.toString().padStart(2, '0')}:00
                          </div>
                          <div 
                            className="hourly-emotion-indicator"
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: getEmotionColor(hourData.emotion),
                              margin: '0 10px'
                            }}
                            title={hourData.emotion}
                          />
                          <div style={{ flex: 1 }}>
                            <div 
                              style={{
                                height: '8px',
                                backgroundColor: '#e2e8f0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}
                            >
                              <div 
                                style={{
                                  height: '100%',
                                  width: `${hourData.intensity}%`,
                                  backgroundColor: getEmotionColor(hourData.emotion),
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ width: '60px', textAlign: 'right', fontSize: '0.9rem' }}>
                            {hourData.intensity.toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Calendar Grid */}
                {!showHourlyView && (
                  <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="calendar-day-header">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - new Date(calendarYear, calendarMonth, 1).getDay() + 1;
                      const isCurrentMonth = day > 0 && day <= new Date(calendarYear, calendarMonth + 1, 0).getDate();
                      const date = isCurrentMonth ? new Date(calendarYear, calendarMonth, day) : null;
                      const emotion = date ? getEmotionForDate(date) : null;
                      const emotionClass = emotion ? `emotion-${emotion}` : '';
                      
                      return (
                        <div 
                          key={i}
                          className={`calendar-day ${emotion ? 'has-emotion ' + emotionClass : ''} ${date && selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : ''} ${isCurrentMonth ? '' : 'other-month'}`}
                          onClick={() => handleDayClick(date)}
                          title={emotion ? `${emotion} - ${date?.toLocaleDateString()}` : ''}
                        >
                          <div className="calendar-day-content">
                            {isCurrentMonth ? (
                              <>
                                <div className="calendar-day-number">{day}</div>
                                {emotion && (
                                  <div className="calendar-day-emoji" title={emotion}>
                                    {getEmotionEmoji(emotion)}
                                  </div>
                                )}
                              </>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                      );

                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Trigger Word Cloud here */}
          <TriggerWordCloud />
          
          {/* Two Column Layout */}
          <div className="dashboard-columns">
            <div className="main-column">
              {/* Recent Activity */}
              <div className="card">
                <h3>Recent Activity</h3>
                <div className="time-selector">
                  <button 
                    className="time-btn"
                    onClick={() => setActivityTimeInterval('30m')}
                    style={{
                      background: activityTimeInterval === '30m' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                      color: activityTimeInterval === '30m' ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      margin: '0 5px'
                    }}
                  >
                    30m
                  </button>
                  <button 
                    className="time-btn"
                    onClick={() => setActivityTimeInterval('1h')}
                    style={{
                      background: activityTimeInterval === '1h' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                      color: activityTimeInterval === '1h' ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      margin: '0 5px'
                    }}
                  >
                    1h
                  </button>
                  <button 
                    className="time-btn"
                    onClick={() => setActivityTimeInterval('1d')}
                    style={{
                      background: activityTimeInterval === '1d' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                      color: activityTimeInterval === '1d' ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      margin: '0 5px'
                    }}
                  >
                    Day
                  </button>
                  <button 
                    className="time-btn"
                    onClick={() => setActivityTimeInterval('1w')}
                    style={{
                      background: activityTimeInterval === '1w' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                      color: activityTimeInterval === '1w' ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      margin: '0 5px'
                    }}
                  >
                    Week
                  </button>
                  <button 
                    className="time-btn"
                    onClick={() => setActivityTimeInterval('1mo')}
                    style={{
                      background: activityTimeInterval === '1mo' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                      color: activityTimeInterval === '1mo' ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      margin: '0 5px'
                    }}
                  >
                    Month
                  </button>
                  <button 
                    className="time-btn"
                    onClick={() => setActivityTimeInterval('1y')}
                    style={{
                      background: activityTimeInterval === '1y' ? 'linear-gradient(135deg, #1667c9, #1e40af)' : 'white',
                      color: activityTimeInterval === '1y' ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      margin: '0 5px'
                    }}
                  >
                    Year
                  </button>
                </div>
                <div className="activity-list">
                  {filterActivityData(activityTimeInterval).map((reminder: any, index: number) => (
                    <div key={index} className="activity-item fade-in">
                      <div className="activity-icon">
                        {reminder.type === 'screen_time' ? '⏰' : '😊'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          {reminder.type === 'screen_time' ? 'Screen time break reminder' : 'Emotion-based break reminder'}
                        </p>
                        <span className="activity-time">
                          {new Date(reminder.triggeredAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filterActivityData(activityTimeInterval).length === 0 && (
                    <div className="no-activity">
                      <p>No recent activity detected</p>
                      <small>Activity will appear here as you use the system</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Developer Mode */}
              {showDeveloperMode && (
                <div className="card">
                  <h3>Developer Mode</h3>
                  <div className="developer-content">
                    <div className="system-info">
                      <h4>System Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <strong>Emotion Detection:</strong> {isInitialized ? '✅ Initialized' : '❌ Not Initialized'}
                        </div>
                        <div className="info-item">
                          <strong>Camera Status:</strong> {cameraStatus}
                        </div>
                        <div className="info-item">
                          <strong>WebSocket:</strong> {websocketStatus}
                        </div>
                        <div className="info-item">
                          <strong>Detection Active:</strong> {isDetecting ? '✅ Yes' : '❌ No'}
                        </div>
                      </div>
                    </div>
                    <div className="developer-actions">
                      <button onClick={initializeDetection} className="btn btn-secondary">
                        🔄 Reinitialize
                      </button>
                      <button onClick={() => console.log('Status logged')} className="btn btn-secondary">
                        📋 Log Status
                      </button>
                      <button onClick={handleGenerateSimulatedData} className="btn btn-secondary">
                        🎲 Generate Sample Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar-column">
              {/* Quick Actions */}
              <div className="card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="btn btn-secondary">
                    🎯 Take Wellness Break
                  </button>
                  <button className="btn btn-secondary">
                    📊 Generate Report
                  </button>
                  <button className="btn btn-secondary">
                    ⚙️ Adjust Settings
                  </button>
                  <button className="btn btn-secondary">
                    🎭 Calibrate Detection
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="card">
                <h3>System Status</h3>
                <div className="system-status">
                  <div className="status-item">
                    <span className="status-label">Emotion Detection</span>
                    <span className={`status-value ${isDetecting ? 'connected' : 'disconnected'}`}>
                      {isDetecting ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">WebSocket</span>
                    <span className={`status-value ${websocketStatus === 'connected' ? 'connected' : 'disconnected'}`}>
                      {websocketStatus}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Camera Access</span>
                    <span className={`status-value ${hasCamera ? 'connected' : 'disconnected'}`}>
                      {cameraStatus}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Data Collection</span>
                    <span className="status-value connected">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;