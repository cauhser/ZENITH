import React from 'react';
import { useStore } from '../../store';

interface BreakReminder {
  type: string;
  triggeredAt: string;
}

const BreakReminders: React.FC = () => {
  // FIXED: Remove selector function
  const { breakReminders } = useStore();

  // Add proper typing for the reduce function
  const reminderStats = breakReminders.reduce((acc: Record<string, number>, reminder: BreakReminder) => {
    acc[reminder.type] = (acc[reminder.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Add proper typing for the map functions
  const recentReminders = breakReminders.slice(-10).reverse().map((reminder: BreakReminder, index: number) => (
    <div key={index} className="reminder-item">
      <div className="reminder-icon">⏰</div>
      <div className="reminder-content">
        <p className="reminder-text">
          {reminder.type === 'screen_time' ? 'Screen time break reminder' : 'Emotion-based break reminder'}
        </p>
        <span className="reminder-time">
          {new Date(reminder.triggeredAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  ));

  // Add proper typing for statistics
  const totalReminders = breakReminders.length;
  const screenTimeReminders = breakReminders.filter((r: BreakReminder) => r.type === 'screen_time').length;
  const emotionReminders = breakReminders.filter((r: BreakReminder) => r.type === 'emotion').length;

  return (
    <div className="break-reminders">
      <header className="page-header">
        <h1>Break Reminders</h1>
        <p>Your wellness break history and patterns</p>
      </header>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Total Reminders</h3>
            <div className="stat-value">{totalReminders}</div>
            <p className="stat-description">All time</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>Screen Time</h3>
            <div className="stat-value">{screenTimeReminders}</div>
            <p className="stat-description">Reminders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">😊</div>
          <div className="stat-content">
            <h3>Emotion Based</h3>
            <div className="stat-value">{emotionReminders}</div>
            <p className="stat-description">Reminders</p>
          </div>
        </div>
      </div>

      <div className="recent-reminders">
        <h3>Recent Break Reminders</h3>
        <div className="reminders-list">
          {recentReminders.length > 0 ? recentReminders : (
            <p className="no-reminders">No break reminders yet. They will appear here when triggered.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakReminders;