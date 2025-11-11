import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { EmotionData } from '../../types/wellness';
interface TimelineEvent {
  id: string;
  time: string;
  timestamp: number;
  emotion: string;
  intensity: number;
  activity: string;
  duration?: number;
  description: string;
}
const EmotionTimelineReplay: React.FC = () => {
  const { emotionalTrends } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); 
  useEffect(() => {
    if (emotionalTrends.length === 0) return;
    const selectedDateStr = selectedDate.toDateString();
    const dayData = emotionalTrends.filter(data => 
      new Date(data.timestamp).toDateString() === selectedDateStr
    );
    const timelineEvents: TimelineEvent[] = dayData.map((data, index) => {
      const time = new Date(data.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const activities: Record<string, string[]> = {
        happy: ['Posted on social media', 'Watched funny video', 'Chatted with friends'],
        sad: ['Read news article', 'Listened to music', 'Browsed social media'],
        anxious: ['Checked notifications', 'Scrolled through feeds', 'Watched stressful content'],
        neutral: ['Browsed websites', 'Checked email', 'Read articles'],
        stressed: ['Worked on assignments', 'Attended online class', 'Responded to messages'],
        focused: ['Studied for exam', 'Worked on project', 'Read research papers'],
        relaxed: ['Listened to music', 'Watched nature videos', 'Meditated']
      };
      const activityOptions = activities[data.emotion] || activities.neutral;
      const activity = activityOptions[Math.floor(Math.random() * activityOptions.length)];
      return {
        id: `event-${index}`,
        time,
        timestamp: data.timestamp,
        emotion: data.emotion,
        intensity: data.intensity,
        activity,
        description: `${data.emotion.charAt(0).toUpperCase() + data.emotion.slice(1)} moment (${Math.round(data.intensity)}% intensity)`,
        duration: index > 0 ? 
          Math.round((data.timestamp - dayData[index - 1].timestamp) / 60000) : 
          0
      };
    });
    setEvents(timelineEvents);
    setCurrentEventIndex(0);
  }, [emotionalTrends, selectedDate]);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && events.length > 0 && currentEventIndex < events.length - 1) {
      interval = setInterval(() => {
        setCurrentEventIndex(prev => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000 / speed); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, events, currentEventIndex, speed]);
  const handlePlay = () => {
    if (currentEventIndex >= events.length - 1) {
      setCurrentEventIndex(0);
    }
    setIsPlaying(true);
  };
  const handlePause = () => {
    setIsPlaying(false);
  };
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentEventIndex(0);
  };
  const handleNext = () => {
    if (currentEventIndex < events.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(prev => prev - 1);
    }
  };
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };
  const getCurrentEvent = () => {
    return events[currentEventIndex] || null;
  };
  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: '#10b981',
      sad: '#3b82f6',
      anxious: '#f59e0b',
      neutral: '#64748b',
      stressed: '#ef4444',
      focused: '#8b5cf6',
      relaxed: '#06b6d4'
    };
    return colors[emotion] || '#64748b';
  };
  const getEmotionEmoji = (emotion: string) => {
    const emojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      neutral: '😐',
      stressed: '😫',
      focused: '🤔',
      relaxed: '😌'
    };
    return emojis[emotion] || '😐';
  };
  
  
  const handleEventClick = (event: TimelineEvent) => {
    console.log('Event clicked:', event);
    alert(`You felt "${event.emotion}" at ${event.time} while ${event.activity}. This lasted for ${event.duration || 0} minutes.`);
  };
  
  
  const handleEmotionEmojiClick = (emotion: string) => {
    console.log('Emotion emoji clicked:', emotion);
    const emotionDetails: Record<string, string> = {
      happy: 'You were feeling happy during this time. This is a positive emotional state.',
      sad: 'You were feeling sad during this time. It\'s okay to feel this way.',
      anxious: 'You were feeling anxious during this time. Consider taking some deep breaths.',
      neutral: 'You were feeling neutral during this time. This is a balanced emotional state.',
      stressed: 'You were feeling stressed during this time. Consider taking a break.',
      focused: 'You were feeling focused during this time. This is great for productivity.',
      relaxed: 'You were feeling relaxed during this time. Enjoy this peaceful state.'
    };
    alert(emotionDetails[emotion] || `You felt ${emotion} during this time.`);
  };
  
  
  const handleTimelineBarClick = (index: number) => {
    console.log('Timeline bar clicked, setting index to:', index);
    setCurrentEventIndex(index);
  };
  
  const currentEvent = getCurrentEvent();
  return (
    <div className="emotion-timeline-replay">
      <div className="replay-header">
        <h3>🎥 Emotion Timeline Replay</h3>
        <p>Click any day → animated playback</p>
      </div>
      <div className="replay-content">
        <div className="date-selector">
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="date-input"
          />
        </div>
        {events.length > 0 ? (
          <>
            <div className="timeline-display">
              <div className="current-event">
                {currentEvent && (
                  <>
                    <div className="event-time">{currentEvent.time}</div>
                    <div 
                      className="event-emotion"
                      onClick={() => handleEmotionEmojiClick(currentEvent.emotion)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span 
                        className="emotion-emoji"
                        style={{ color: getEmotionColor(currentEvent.emotion) }}
                      >
                        {getEmotionEmoji(currentEvent.emotion)}
                      </span>
                      <span className="emotion-name">{currentEvent.emotion}</span>
                    </div>
                    <div 
                      className="event-activity"
                      onClick={() => handleEventClick(currentEvent)}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {currentEvent.activity}
                    </div>
                    <div className="event-description">{currentEvent.description}</div>
                    {currentEvent.duration !== undefined && currentEvent.duration > 0 && (
                      <div className="event-duration">
                        Spent {currentEvent.duration} minutes on this activity
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="timeline-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${events.length > 0 ? (currentEventIndex / (events.length - 1)) * 100 : 0}%`,
                      backgroundColor: currentEvent ? getEmotionColor(currentEvent.emotion) : '#64748b'
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  {currentEventIndex + 1} of {events.length} events
                </div>
              </div>
            </div>
            <div className="replay-controls">
              <div className="speed-control">
                <span>Speed:</span>
                {[0.5, 1, 2, 3].map((spd) => (
                  <button
                    key={spd}
                    className={`speed-btn ${speed === spd ? 'active' : ''}`}
                    onClick={() => handleSpeedChange(spd)}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
              <div className="playback-controls">
                <button 
                  className="control-btn"
                  onClick={handlePrevious}
                  disabled={currentEventIndex === 0}
                >
                  ⏮️
                </button>
                {!isPlaying ? (
                  <button 
                    className="control-btn play"
                    onClick={handlePlay}
                  >
                    ▶️
                  </button>
                ) : (
                  <button 
                    className="control-btn pause"
                    onClick={handlePause}
                  >
                    ⏸️
                  </button>
                )}
                <button 
                  className="control-btn"
                  onClick={handleNext}
                  disabled={currentEventIndex >= events.length - 1}
                >
                  ⏭️
                </button>
                <button 
                  className="control-btn"
                  onClick={handleReset}
                >
                  🔄
                </button>
              </div>
            </div>
            <div className="timeline-events">
              <h4>Today's Emotion Timeline</h4>
              <div className="events-list">
                {events.map((event, index) => (
                  <div 
                    key={event.id}
                    className={`event-item ${index === currentEventIndex ? 'active' : ''}`}
                    onClick={() => handleTimelineBarClick(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="event-time">{event.time}</div>
                    <div className="event-summary">
                      <span 
                        className="event-emotion-indicator"
                        style={{ color: getEmotionColor(event.emotion) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmotionEmojiClick(event.emotion);
                        }}
                      >
                        {getEmotionEmoji(event.emotion)}
                      </span>
                      <span className="event-activity">{event.activity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="no-events">
            <p>No emotion data available for this date.</p>
            <p>Start using the wellness tracker to see your emotion timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default EmotionTimelineReplay;