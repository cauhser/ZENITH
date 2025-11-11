import React, { useState } from 'react';
import './SettingsMobile.css';

const SettingsMobile: React.FC = () => {
  const [notifications, setNotifications] = useState({
    breakReminders: true,
    stressAlerts: true,
    dailyInsights: true,
    soundEnabled: false
  });

  const [wellness, setWellness] = useState({
    workHours: {
      start: '09:00',
      end: '17:00'
    },
    breakIntervals: {
      microBreak: 25,
      shortBreak: 90,
      longBreak: 180
    },
    goals: {
      maxScreenTime: 480,
      minBreaks: 6,
      minFocusTime: 180
    }
  });

  const [appearance, setAppearance] = useState({
    theme: 'system',
    reducedMotion: false,
    highContrast: false
  });

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications]
    }));
  };

  const handleAppearanceChange = (key: string) => {
    setAppearance(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof appearance]
    }));
  };

  const handleThemeChange = (theme: string) => {
    setAppearance(prev => ({
      ...prev,
      theme
    }));
  };

  return (
    <div className="settings-mobile">
      <header className="settings-header">
        <h1>Settings</h1>
      </header>

      <main className="settings-content">
        {}
        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="settings-group">
            <div className="setting-item">
              <label>Break Reminders</label>
              <div 
                className={`toggle-switch ${notifications.breakReminders ? 'on' : 'off'}`}
                onClick={() => handleNotificationChange('breakReminders')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
            
            <div className="setting-item">
              <label>Stress Alerts</label>
              <div 
                className={`toggle-switch ${notifications.stressAlerts ? 'on' : 'off'}`}
                onClick={() => handleNotificationChange('stressAlerts')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
            
            <div className="setting-item">
              <label>Daily Insights</label>
              <div 
                className={`toggle-switch ${notifications.dailyInsights ? 'on' : 'off'}`}
                onClick={() => handleNotificationChange('dailyInsights')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
            
            <div className="setting-item">
              <label>Sound Enabled</label>
              <div 
                className={`toggle-switch ${notifications.soundEnabled ? 'on' : 'off'}`}
                onClick={() => handleNotificationChange('soundEnabled')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="settings-section">
          <h2>Appearance</h2>
          <div className="settings-group">
            <div className="setting-item">
              <label>Theme</label>
              <div className="theme-selector">
                <button 
                  className={`theme-option ${appearance.theme === 'light' ? 'selected' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  Light
                </button>
                <button 
                  className={`theme-option ${appearance.theme === 'dark' ? 'selected' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  Dark
                </button>
                <button 
                  className={`theme-option ${appearance.theme === 'system' ? 'selected' : ''}`}
                  onClick={() => handleThemeChange('system')}
                >
                  System
                </button>
              </div>
            </div>
            
            <div className="setting-item">
              <label>Reduced Motion</label>
              <div 
                className={`toggle-switch ${appearance.reducedMotion ? 'on' : 'off'}`}
                onClick={() => handleAppearanceChange('reducedMotion')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
            
            <div className="setting-item">
              <label>High Contrast</label>
              <div 
                className={`toggle-switch ${appearance.highContrast ? 'on' : 'off'}`}
                onClick={() => handleAppearanceChange('highContrast')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="settings-section">
          <h2>Wellness Goals</h2>
          <div className="settings-group">
            <div className="setting-item">
              <label>Max Screen Time (minutes)</label>
              <input 
                type="number" 
                value={wellness.goals.maxScreenTime}
                onChange={(e) => setWellness(prev => ({
                  ...prev,
                  goals: {
                    ...prev.goals,
                    maxScreenTime: parseInt(e.target.value) || 0
                  }
                }))}
                className="number-input"
              />
            </div>
            
            <div className="setting-item">
              <label>Min Breaks Per Day</label>
              <input 
                type="number" 
                value={wellness.goals.minBreaks}
                onChange={(e) => setWellness(prev => ({
                  ...prev,
                  goals: {
                    ...prev.goals,
                    minBreaks: parseInt(e.target.value) || 0
                  }
                }))}
                className="number-input"
              />
            </div>
            
            <div className="setting-item">
              <label>Min Focus Time (minutes)</label>
              <input 
                type="number" 
                value={wellness.goals.minFocusTime}
                onChange={(e) => setWellness(prev => ({
                  ...prev,
                  goals: {
                    ...prev.goals,
                    minFocusTime: parseInt(e.target.value) || 0
                  }
                }))}
                className="number-input"
              />
            </div>
          </div>
        </section>

        {}
        <section className="settings-section">
          <h2>Break Intervals</h2>
          <div className="settings-group">
            <div className="setting-item">
              <label>Micro Break (minutes)</label>
              <input 
                type="number" 
                value={wellness.breakIntervals.microBreak}
                onChange={(e) => setWellness(prev => ({
                  ...prev,
                  breakIntervals: {
                    ...prev.breakIntervals,
                    microBreak: parseInt(e.target.value) || 0
                  }
                }))}
                className="number-input"
              />
            </div>
            
            <div className="setting-item">
              <label>Short Break (minutes)</label>
              <input 
                type="number" 
                value={wellness.breakIntervals.shortBreak}
                onChange={(e) => setWellness(prev => ({
                  ...prev,
                  breakIntervals: {
                    ...prev.breakIntervals,
                    shortBreak: parseInt(e.target.value) || 0
                  }
                }))}
                className="number-input"
              />
            </div>
            
            <div className="setting-item">
              <label>Long Break (minutes)</label>
              <input 
                type="number" 
                value={wellness.breakIntervals.longBreak}
                onChange={(e) => setWellness(prev => ({
                  ...prev,
                  breakIntervals: {
                    ...prev.breakIntervals,
                    longBreak: parseInt(e.target.value) || 0
                  }
                }))}
                className="number-input"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsMobile;