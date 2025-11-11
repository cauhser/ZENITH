import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../../store';
import EmotionChart from '../EmotionChart/EmotionChart';
import EmotionCalendar from './EmotionCalendar';
import TriggerWordCloud from './TriggerWordCloud';
import DailyWellnessPulse from './DailyWellnessPulse';
import TriggerRadar from './TriggerRadar';
import AIWellnessCoach from './AIWellnessCoach';
import DigitalSunsetScheduler from './DigitalSunsetScheduler';
import FocusFlow from './FocusFlow';
import SafeScrollFeed from './SafeScrollFeed';
import EmotionTimelineReplay from './EmotionTimelineReplay';
import CommunityPulse from './CommunityPulse';
import ExportWellnessReport from './ExportWellnessReport';
import ProactiveNudgeEngine from './ProactiveNudgeEngine';
import CampusResourceFinder from './CampusResourceFinder';
import { WebSocketService } from '../../services/websocket/websocket';
import { EmotionData, GazeData } from '../../types/wellness';
import './EnhancedDashboard.css';
import './WellnessFeatures.css';
import { useNavigate } from 'react-router-dom';
const websocketService = new WebSocketService('ws://localhost:8080');
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
interface EnhancedDashboardProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}
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
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [timeInterval, setTimeInterval] = useState('1d'); 
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(2023);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showHourlyView, setShowHourlyView] = useState(false);
  const [showChatbox, setShowChatbox] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [showWellnessPulse, setShowWellnessPulse] = useState(true); 
  const hiddenMenuRef = useRef<HTMLDivElement>(null);
  const [campusPulse, setCampusPulse] = useState({
    campus: 'HKU',
    trendingTopic: 'FYP',
    percentage: 68,
    message: '"FYP" spiking (68% today)'
  });
  const [trendData, setTrendData] = useState({
    change: 6,
    period: 'yesterday'
  });
  const [sectionSizes, setSectionSizes] = useState<Record<string, { width: number; height: number }>>({
    'emotion-timeline': { width: 400, height: 300 },
    'trigger-radar': { width: 400, height: 300 },
    'platform-breakdown': { width: 400, height: 300 },
    'top-triggers': { width: 400, height: 300 },
    'safe-scroll': { width: 400, height: 300 }
  });
  
  const generateSimulatedCampusPulse = () => {
    const campuses = ['HKU', 'CUHK', 'PolyU', 'CityU', 'HKUST'];
    const topics = [
      'FYP', 'exam', 'ghosted', 'internship', 'research', 'career',
      'housing', 'mental health', 'stress', 'relationships', 'grades'
    ];
    const campus = campuses[Math.floor(Math.random() * campuses.length)];
    const trendingTopic = topics[Math.floor(Math.random() * topics.length)];
    const percentage = Math.floor(Math.random() * 50) + 40; 
    return {
      campus,
      trendingTopic,
      percentage,
      message: `"${trendingTopic}" trending at ${percentage}% today at ${campus}`
    };
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCampusPulse(generateSimulatedCampusPulse());
    }, 30000); 
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2;
      const newScore = Math.max(0, Math.min(100, wellnessScore + change));
      updateWellnessScore(newScore);
      const trendChange = Math.floor(Math.random() * 11) - 5; 
      const periods = ['yesterday', 'last week', 'last month'];
      const period = periods[Math.floor(Math.random() * periods.length)];
      setTrendData({
        change: trendChange,
        period
      });
    }, 10000); 
    return () => clearInterval(interval);
  }, [wellnessScore, updateWellnessScore]);
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
  const [currentChallenge, setCurrentChallenge] = useState({
    title: "Digital Detox Thursday",
    description: "Track usage and earn badge",
    progress: 65,
    badge: "🧘"
  });
  const startFocusSession = () => {
    const startTime = Date.now();
    console.log('Focus session started at:', new Date(startTime).toLocaleTimeString());
  };
  const logDistraction = (type: string) => {
    const newDistraction = {
      time: Date.now(),
      type,
      duration: Math.floor(Math.random() * 10) + 1 
    };
    setDistractionLog(prev => [...prev, newDistraction]);
  };
  const addWellnessTip = (tip: string) => {
    setWellnessTips(prev => [...prev, tip]);
  };
  const updateGoal = (period: 'daily' | 'weekly' | 'monthly', increment: number) => {
    setGoalTracking(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        current: Math.min(prev[period].current + increment, prev[period].target)
      }
    }));
  };
  const generateProductivityInsights = () => {
    const insights = [];
    if (focusSessions.length > 0) {
      const avgDuration = focusSessions.reduce((sum, session) => sum + session.duration, 0) / focusSessions.length;
      if (avgDuration > 30) {
        insights.push("✅ Great job! Your average focus session is over 30 minutes.");
      } else {
        insights.push("💡 Try to extend your focus sessions for better productivity.");
      }
    }
    if (distractionLog.length > 5) {
      insights.push("⚠️ You've had many distractions today. Consider blocking distracting websites.");
    }
    if (goalTracking.daily.current >= goalTracking.daily.target) {
      insights.push("🏆 You've met your daily focus goal!");
    } else {
      const remaining = goalTracking.daily.target - goalTracking.daily.current;
      insights.push(`🎯 You need ${remaining} more ${goalTracking.daily.unit} to meet your daily goal.`);
    }
    return insights;
  };
  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setShowHourlyView(true);
    }
  };
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() === '') return;
    const newUserMessage = { text: chatInput, isUser: true };
    setChatMessages(prev => [...prev, newUserMessage]);
    const aiResponse = { 
      text: `I understand you're feeling ${currentEmotion}. It's important to take care of your emotional wellbeing. Would you like some specific advice or resources?`, 
      isUser: false 
    };
    setTimeout(() => {
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
    setChatInput('');
  };
  const getHourlyEmotionData = (date: Date) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const emotions = ['happy', 'sad', 'anxious', 'neutral', 'stressed', 'focused', 'relaxed'];
      let emotion;
      if (hour >= 6 && hour <= 9) {
        emotion = Math.random() > 0.7 ? 'happy' : 'neutral';
      } else if (hour >= 10 && hour <= 12) {
        emotion = Math.random() > 0.6 ? 'focused' : 'neutral';
      } else if (hour >= 13 && hour <= 14) {
        emotion = Math.random() > 0.5 ? 'stressed' : 'relaxed';
      } else if (hour >= 15 && hour <= 18) {
        const emotionOptions = ['happy', 'neutral', 'stressed', 'focused'];
        emotion = emotionOptions[Math.floor(Math.random() * emotionOptions.length)];
      } else {
        emotion = Math.random() > 0.6 ? 'relaxed' : 'neutral';
      }
      let intensity = 50; 
      if (hour >= 6 && hour <= 9) {
        intensity = 60 + Math.random() * 20; 
      } else if (hour >= 12 && hour <= 14) {
        intensity = 70 + Math.random() * 30; 
      } else if (hour >= 20 && hour <= 23) {
        intensity = 30 + Math.random() * 40; 
      } else {
        intensity = 40 + Math.random() * 30; 
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
    const handleMessage = (data: any) => {
      if (data.type === 'CAMPUS_PULSE_UPDATE') {
        setCampusPulse(data.payload);
      }
    };
    websocketService.onMessage(handleMessage);
    updateWebsocketStatus();
    const interval = setInterval(updateWebsocketStatus, 5000);
    return () => {
      clearInterval(interval);
      websocketService.offMessage(handleMessage);
    };
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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showHiddenMenu && hiddenMenuRef.current && !hiddenMenuRef.current.contains(event.target as Node)) {
        setShowHiddenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHiddenMenu]);
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
  const filterEmotionData = (interval: string) => {
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
  const getEmotionForDate = (date: Date) => {
    const dateString = date.toDateString();
    const emotionData = emotionalTrends.find(data => {
      const dataDate = new Date(data.timestamp);
      return dataDate.toDateString() === dateString;
    });
    if (emotionData) {
      return emotionData.emotion;
    }
    return null;
  };
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
  const filterActivityData = (interval: string) => {
    const now = Date.now();
    let filteredReminders = [...breakReminders];
    switch (interval) {
      case '30m':
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 30 * 60 * 1000;
        });
        break;
      case '1h':
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 60 * 60 * 1000;
        });
        break;
      case '1d':
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 24 * 60 * 60 * 1000;
        });
        break;
      case '1w':
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 7 * 24 * 60 * 60 * 1000;
        });
        break;
      case '1mo':
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 30 * 24 * 60 * 60 * 1000;
        });
        break;
      case '1y':
        filteredReminders = breakReminders.filter(reminder => {
          const reminderTime = new Date(reminder.triggeredAt).getTime();
          return (now - reminderTime) <= 365 * 24 * 60 * 60 * 1000;
        });
        break;
      default:
        filteredReminders = breakReminders;
    }
    return filteredReminders.slice(-5).reverse(); 
  };
  const [activityTimeInterval, setActivityTimeInterval] = useState('1d');
  const handleSignOut = () => {
    navigate('/');
  };
  const generateSimulatedData = () => {
    const emotions = ['happy', 'sad', 'anxious', 'neutral', 'stressed', 'focused', 'relaxed'];
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const emotionData: EmotionData = {
        emotion: randomEmotion,
        intensity: Math.random() * 100,
        timestamp: now - Math.random() * 7 * 24 * 60 * 60 * 1000, 
        confidence: Math.random() * 0.5 + 0.5
      };
      addEmotionData(emotionData);
    }
    for (let i = 0; i < 50; i++) {
      const gazePoint: GazeData = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        timestamp: now - Math.random() * 24 * 60 * 60 * 1000, 
        content: `simulated_content_${i}`
      };
      addGazeData(gazePoint);
    }
    const reminderTypes = ['screen_time', 'emotion_based'];
    for (let i = 0; i < 10; i++) {
      addBreakReminder({
        type: reminderTypes[Math.floor(Math.random() * reminderTypes.length)],
        triggeredAt: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString() 
      });
    }
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
    setScreenTime(Math.floor(Math.random() * 120)); 
    updateWellnessScore(Math.floor(Math.random() * 40) + 60); 
    updateAttentionMetrics({
      focusSessions: Math.floor(Math.random() * 20),
      attentionSpan: Math.floor(Math.random() * 30) + 10, 
      distractions: Math.floor(Math.random() * 15)
    });
  };
  const initializePage = () => {
    console.log('Initializing page...');
    generateSimulatedData();
  };
  const handleGenerateSimulatedData = () => {
    generateSimulatedData();
  };
  useEffect(() => {
    const scoreCircle = document.querySelector('.score-circle');
    if (scoreCircle) {
      const score = wellnessScore;
      let color1, color2, percentage;
      if (score <= 20) {
        color1 = '#FF6B6B'; 
        color2 = '#FF8E53'; 
        percentage = score * 5; 
      } else if (score <= 40) {
        color1 = '#FF8E53'; 
        color2 = '#FFD166'; 
        percentage = (score - 20) * 5; 
      } else if (score <= 60) {
        color1 = '#FFD166'; 
        color2 = '#06D6A0'; 
        percentage = (score - 40) * 5; 
      } else if (score <= 80) {
        color1 = '#06D6A0'; 
        color2 = '#118AB2'; 
        percentage = (score - 60) * 5; 
      } else {
        color1 = '#118AB2'; 
        color2 = '#073B4C'; 
        percentage = (score - 80) * 5; 
      }
      const gradient = `conic-gradient(${color1} ${100 - percentage}%, ${color2} ${percentage}%)`;
      (scoreCircle as HTMLElement).style.background = gradient;
    }
  }, [wellnessScore]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hiddenMenuRef.current && !(hiddenMenuRef.current as HTMLElement).contains(event.target as Node)) {
        if (showHiddenMenu) {
          const menuToggleButton = document.querySelector('.menu-toggle-button');
          if (!menuToggleButton || !menuToggleButton.contains(event.target as Node)) {
            setShowHiddenMenu(false);
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHiddenMenu]);
  return (
    <div className="dashboard">
      <button 
        className="developer-mode-toggle"
        onClick={() => setShowDeveloperMode(!showDeveloperMode)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.3)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          opacity: 0.5,
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
        title="Developer Mode"
      >
        ⚙️
      </button>
      {showDeveloperMode && (
        <div className="developer-mode-panel">
          <div className="developer-mode-header">
            <h3>Developer Mode</h3>
            <button 
              onClick={() => setShowDeveloperMode(false)}
              className="close-btn"
            >
              ×
            </button>
          </div>
          <div className="developer-mode-content">
            <div className="developer-section">
              <h4>Data Feeds</h4>
              <div className="data-feed-info">
                <p>WebSocket Status: {websocketStatus === 'connected' ? '🟢 Connected' : websocketStatus === 'connecting' ? '🟡 Connecting' : '🔴 Disconnected'}</p>
                <p>Webcam: {hasCamera ? '🟢 Available' : '🔴 Unavailable'}</p>
                <p>Emotion Detection: {isDetecting ? '🟢 Running' : '🔴 Stopped'}</p>
              </div>
            </div>
            <div className="developer-section">
              <h4>Actions</h4>
              <button 
                className="btn btn-primary"
                onClick={handleGenerateSimulatedData}
                style={{marginRight: '10px'}}
              >
                Generate Simulated Data
              </button>
              <button 
                className="btn btn-secondary"
                onClick={initializePage}
              >
                Initialize Page
              </button>
              <div style={{ marginTop: '15px' }}>
                <h4>Quick Access Features</h4>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowWellnessPulse(true)}
                  style={{marginRight: '10px', marginBottom: '10px'}}
                >
                  Daily Wellness Pulse
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setBreakAlert(true)}
                >
                  Nudge Alert
                </button>
              </div>
            </div>
            <div className="developer-section">
              <h4>Performance Metrics</h4>
              {performanceMetrics && (
                <div className="metrics-info">
                  <p>FPS: {performanceMetrics.fps}</p>
                  <p>Avg Detection Time: {performanceMetrics.averageDetectionTime}ms</p>
                  <p>Detection Frequency: {performanceMetrics.detectionFrequency}ms</p>
                  <p>Accuracy: {performanceMetrics.accuracy}%</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <header className="sticky-header">
        <div className="header-left">
          <button 
            className="menu-toggle-button"
            onClick={() => {
              if (showHiddenMenu) {
                setShowHiddenMenu(false);
              } else {
                setShowWellnessPulse(false);
                setBreakAlert(false);
                setShowHiddenMenu(true);
              }
            }}
            title="Toggle Menu"
          >
            ☰
          </button>
          <div 
            className="logo" 
            onClick={() => {
              if (showEmotionHistory) {
                setShowEmotionHistory(false);
              }
            }}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <img 
              src="/BLUE-64px.png" 
              alt="ZENITH Logo" 
              style={{ width: '64px', height: '64px' }} 
            />
            <span>ZENITH</span>
          </div>
        </div>
        <div className="wellness-score">
          <div className="score-circle" data-score={wellnessScore.toString()}>
            <span>{wellnessScore}</span>
          </div>
          <div className="trend">{trendData.change > 0 ? '↑' : '↓'} {Math.abs(trendData.change)}% from {trendData.period}</div>
        </div>
        <div className="user-menu">
          <span>Cira C.</span>
          <button 
            className="btn-logout"
            onClick={handleSignOut}
          >
            Logout
          </button>
        </div>
      </header>
      <div 
        ref={hiddenMenuRef}
        className={`hidden-dashboard-menu ${showHiddenMenu ? 'open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <button 
          className="menu-item"
          onClick={() => {
            setShowEmotionHistory(!showEmotionHistory);
            setShowHiddenMenu(false);
          }}
          style={{ marginBottom: '15px' }}
        >
          {showEmotionHistory ? 'Close Mood Report' : 'View Mood Report'}
        </button>
        <button 
          className="menu-item"
          onClick={() => {
            console.log('Focus Flow triggered from menu');
            setShowHiddenMenu(false);
            window.location.href = '/focus-flow';
          }}
          style={{ marginBottom: '15px' }}
        >
          Start Focus Flow
        </button>
        <button 
          className="menu-item"
          onClick={() => {
            console.log('Digital Sunset triggered from menu');
            setShowHiddenMenu(false);
            window.location.href = '/digital-sunset';
          }}
          style={{ marginBottom: '15px' }}
        >
          Set Digital Sunset
        </button>
        <button 
          className="menu-item"
          onClick={() => {
            console.log('Export PDF Report triggered from menu');
            setShowHiddenMenu(false);
            window.location.href = '/export-report';
          }}
          style={{ marginBottom: '15px' }}
        >
          Export PDF Report
        </button>
        <button 
          className="menu-item"
          onClick={() => {
            handleSignOut();
            setShowHiddenMenu(false);
          }}
          style={{ marginBottom: '15px' }}
        >
          Settings
        </button>
        {toggleDarkMode && (
          <button 
            className="dark-mode-toggle menu-item"
            onClick={() => {
              toggleDarkMode();
              setShowHiddenMenu(false);
            }}
            title="Toggle Dark Mode"
            style={{ marginTop: 'auto' }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        )}
      </div>
      <div className="campus-pulse-banner">
        <span className="pulse-icon">📍</span>
        <div className="pulse-text-container">
          <span className="pulse-text">{campusPulse.campus} Campus Pulse: {campusPulse.message}</span>
        </div>
      </div>
      <CampusResourceFinder />
      <AIWellnessCoach />
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
      <main>
        <DailyWellnessPulse 
          isVisible={showWellnessPulse}
          onClose={() => setShowWellnessPulse(false)}
          forceShow={true} 
        />
        {showEmotionHistory && (
          <section className="emotion-history-chart">
            <div className="chart-header">
              <h3>📊 Mood Report</h3>
              <button 
                className="close-chart-btn"
                onClick={() => setShowEmotionHistory(false)}
              >
                ×
              </button>
            </div>
            <div className="emotion-history-content">
              <EmotionCalendar data={emotionalTrends} />
              <EmotionChart data={emotionalTrends} />
            </div>
          </section>
        )}
        {!showEmotionHistory && (
          <>
            <div className="main-grid">
              <section className="emotion-timeline">
                <h3>📊 Emotion Timeline (Today)</h3>
                <EmotionTimelineReplay />
                <button className="btn-replay">▶ Replay My Day</button>
              </section>
              <section className="trigger-radar">
                <h3>🎯 Trigger Radar (Live in HK)</h3>
                <TriggerRadar />
              </section>
              <section className="platform-breakdown">
                <h3>📱 Platform Usage</h3>
                <div className="breakdown-grid">
                  <div className="card">
                    <h4>Today's Breakdown</h4>
                    <ul>
                      <li>X (Twitter): 1h 42m</li>
                      <li>Instagram: 1h 12m</li>
                      <li>Reddit: 38m</li>
                    </ul>
                  </div>
                </div>
              </section>
              <section className="top-triggers">
                <h3>🔥 Top Triggers</h3>
                <div className="word-cloud">
                  <span style={{fontSize: '32px'}}>FYP</span>
                  <span style={{fontSize: '28px'}}>exam</span>
                  <span style={{fontSize: '24px'}}>ghosted</span>
                </div>
              </section>
              <section className="community">
                <h3>🤝 Join a Circle</h3>
                <CommunityPulse />
              </section>
              <section className="safe-scroll large">
                <h3>🛡️ Safe Scroll Feed</h3>
                <SafeScrollFeed />
              </section>
            </div>
          </>
        )}
        <footer>
          <p><strong>ZENITH</strong> | Protecting Hong Kong Gen Z</p>
          <p>🔒 No raw data stored · On-device AI · <a href="#">Privacy Policy</a></p>
          <p>Need help? <a href="#">Campus Resources</a></p>
        </footer>
      </main>
    </div>
  );
};
export default EnhancedDashboard;