import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { EmotionData } from '../../types/wellness';

// Update type definitions to match the actual store structure
interface GazeData {
  x: number;
  y: number;
  timestamp: number;
}

interface BreakReminder {
  type: string;
  triggeredAt: string;
}

const RealTimeAnalytics: React.FC = () => {
  const wellness = useSelector((state: RootState) => state.wellness);

  const getSessionDuration = () => {
    if (wellness.gazeData.length === 0) return '0m 0s';
    const firstTimestamp = Math.min(...wellness.gazeData.map((g: GazeData) => g.timestamp));
    const duration = Math.floor((Date.now() - firstTimestamp) / 60000);
    const minutes = duration % 60;
    const hours = Math.floor(duration / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getFocusScore = () => {
    if (wellness.gazeData.length === 0) return 0;
    
    // Simulate focus score based on gaze data patterns
    const recentData = wellness.gazeData.slice(-50);
    const focusAreas = recentData.filter((gaze: GazeData) => 
      gaze.x > 25 && gaze.x < 75 && gaze.y > 25 && gaze.y < 75
    ).length;
    
    return Math.round((focusAreas / recentData.length) * 100);
  };

  const getEmotionTrend = () => {
    const recentEmotions = wellness.emotionalTrends.slice(-10);
    if (recentEmotions.length === 0) return 'stable';
    
    const positiveCount = recentEmotions.filter((e: EmotionData) => 
      ['happy', 'neutral', 'focused'].includes(e.emotion)
    ).length;
    
    const trend = positiveCount / recentEmotions.length;
    if (trend > 0.7) return 'positive';
    if (trend < 0.3) return 'negative';
    return 'stable';
  };

  return (
    <div className="card">
      <h3>Real-time Analytics</h3>
      <div className="real-time-stats">
        <div className="stat-item">
          <span className="stat-label">Current Session:</span>
          <span className="stat-value">{getSessionDuration()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Focus Score:</span>
          <span className="stat-value">{getFocusScore()}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Triggers Detected:</span>
          <span className="stat-value">{wellness.contentTriggers.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Current Emotion:</span>
          <span className={`stat-value emotion-${wellness.currentEmotion}`}>
            {wellness.currentEmotion}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Emotion Trend:</span>
          <span className={`stat-value trend-${getEmotionTrend()}`}>
            {getEmotionTrend()}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Focus Sessions:</span>
          <span className="stat-value">{wellness.attentionMetrics?.focusSessions || 0}</span>
        </div>
      </div>
      
      <div className="activity-monitor">
        <h4>Recent Activity Stream</h4>
        <div className="activity-stream">
          {wellness.emotionalTrends.slice(-8).map((emotion: EmotionData, index: number) => (
            <div key={index} className="activity-event">
              <div className="event-time">
                {new Date(emotion.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className={`event-type emotion-${emotion.emotion}`}>
                Emotion: {emotion.emotion}
              </div>
              <div className="event-intensity">
                Intensity: {Math.round(emotion.intensity)}%
              </div>
            </div>
          ))}
          {wellness.breakReminders.slice(-3).map((reminder: BreakReminder, index: number) => (
            <div key={`break-${index}`} className="activity-event">
              <div className="event-time">
                {new Date(reminder.triggeredAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="event-type break-reminder">
                Break Reminder
              </div>
              <div className="event-details">
                {reminder.type.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="performance-metrics">
        <h4>System Performance</h4>
        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-label">Data Points:</span>
            <span className="metric-value">{wellness.gazeData.length + wellness.emotionalTrends.length}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Update Frequency:</span>
            <span className="metric-value">1s</span>
          </div>
          <div className="metric">
            <span className="metric-label">Accuracy:</span>
            <span className="metric-value">92%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Latency:</span>
            <span className="metric-value">&lt;50ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;