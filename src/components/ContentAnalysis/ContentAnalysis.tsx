import React from 'react';
import { useStore } from '../../store';

interface TriggerStats {
  [key: string]: number;
}

const ContentAnalysis: React.FC = () => {
  const { contentTriggers } = useStore();

  const triggerStats = contentTriggers.reduce((acc: TriggerStats, trigger: string) => {
    acc[trigger] = (acc[trigger] || 0) + 1;
    return acc;
  }, {} as TriggerStats);

  const getTriggerCategory = (trigger: string) => {
    const categories: { [key: string]: string } = {
      'stress': 'high',
      'anxiety': 'high', 
      'depression': 'high',
      'overwhelmed': 'medium',
      'worried': 'medium',
      'burnout': 'high',
      'exhausted': 'medium',
      'sad': 'low',
      'angry': 'medium',
      'frustrated': 'medium'
    };
    return categories[trigger] || 'low';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'high': '#ef4444',
      'medium': '#f59e0b', 
      'low': '#10b981'
    };
    return colors[category];
  };

  // Sort triggers by count for display
  const sortedTriggers = Object.entries(triggerStats)
    .sort(([,a], [,b]) => (b as number) - (a as number));

  return (
    <div className="content-analysis">
      <header className="page-header">
        <h1>Content Analysis</h1>
        <p>Understand how content affects your wellbeing</p>
      </header>

      <div className="analysis-content">
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>Total Triggers</h3>
              <div className="stat-value">{contentTriggers.length}</div>
              <p className="stat-description">All time</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <h3>High Impact</h3>
              <div className="stat-value">
                {sortedTriggers.filter(([trigger]) => getTriggerCategory(trigger) === 'high').length}
              </div>
              <p className="stat-description">Triggers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟡</div>
            <div className="stat-content">
              <h3>Medium Impact</h3>
              <div className="stat-value">
                {sortedTriggers.filter(([trigger]) => getTriggerCategory(trigger) === 'medium').length}
              </div>
              <p className="stat-description">Triggers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <h3>Low Impact</h3>
              <div className="stat-value">
                {sortedTriggers.filter(([trigger]) => getTriggerCategory(trigger) === 'low').length}
              </div>
              <p className="stat-description">Triggers</p>
            </div>
          </div>
        </div>

        <div className="analysis-grid">
          <div className="card">
            <h3>Trigger Patterns</h3>
            <div className="trigger-stats">
              {sortedTriggers.map(([trigger, count]) => (
                <div key={trigger} className="trigger-stat">
                  <div className="trigger-info">
                    <span 
                      className="trigger-category-indicator"
                      style={{ backgroundColor: getCategoryColor(getTriggerCategory(trigger)) }}
                    ></span>
                    <span className="trigger-name">{trigger}</span>
                  </div>
                  <div className="trigger-details">
                    <span className="trigger-count">{count as number} occurrences</span>
                    <span className={`trigger-severity ${getTriggerCategory(trigger)}`}>
                      {getTriggerCategory(trigger).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {sortedTriggers.length === 0 && (
                <p className="no-triggers">No content triggers detected yet. They will appear here as you browse.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Wellness Impact Analysis</h3>
            <div className="impact-analysis">
              <div className="impact-item">
                <h4>Content Sensitivity Score</h4>
                <div className="impact-meter">
                  <div 
                    className="impact-fill"
                    style={{ 
                      width: `${Math.min(contentTriggers.length * 5, 100)}%`,
                      backgroundColor: contentTriggers.length > 15 ? '#ef4444' : 
                                     contentTriggers.length > 8 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
                <p className="impact-description">
                  {contentTriggers.length > 15 ? 'High sensitivity to content' :
                   contentTriggers.length > 8 ? 'Moderate sensitivity to content' : 
                   'Low sensitivity to content'}
                </p>
              </div>
              
              <div className="impact-item">
                <h4>Recommendations</h4>
                <div className="recommendations-list">
                  {contentTriggers.length > 15 && (
                    <div className="recommendation high">
                      <strong>Consider content filtering:</strong> You're encountering many wellbeing triggers. 
                      Consider using content filters or taking regular breaks from triggering content.
                    </div>
                  )}
                  {contentTriggers.length > 8 && contentTriggers.length <= 15 && (
                    <div className="recommendation medium">
                      <strong>Mindful browsing:</strong> Be aware of content that affects your mood. 
                      Take breaks when you notice negative patterns.
                    </div>
                  )}
                  {contentTriggers.length <= 8 && contentTriggers.length > 0 && (
                    <div className="recommendation low">
                      <strong>Good balance:</strong> You're maintaining healthy content consumption habits.
                    </div>
                  )}
                  {contentTriggers.length === 0 && (
                    <div className="recommendation neutral">
                      <strong>No concerns detected:</strong> Continue your current browsing habits.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Content Wellness Tips</h3>
            <div className="wellness-tips">
              <div className="tip">
                <div className="tip-icon">🧘</div>
                <div className="tip-content">
                  <h4>Curate Your Feed</h4>
                  <p>Follow accounts and websites that promote positive mental health and wellbeing.</p>
                </div>
              </div>
              <div className="tip">
                <div className="tip-icon">⏰</div>
                <div className="tip-content">
                  <h4>Take Content Breaks</h4>
                  <p>Step away from triggering content and engage in offline activities regularly.</p>
                </div>
              </div>
              <div className="tip">
                <div className="tip-icon">🔍</div>
                <div className="tip-content">
                  <h4>Be Mindful</h4>
                  <p>Notice how different types of content affect your mood and adjust your consumption accordingly.</p>
                </div>
              </div>
              <div className="tip">
                <div className="tip-icon">💬</div>
                <div className="tip-content">
                  <h4>Seek Support</h4>
                  <p>Talk about concerning content with friends, family, or mental health professionals.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Trigger Trends Over Time</h3>
            <div className="trends-visualization">
              <div className="trends-placeholder">
                <p>📈 Trigger frequency visualization will appear here</p>
                <small>This feature tracks how often different triggers occur over time</small>
              </div>
              <div className="trends-stats">
                <div className="trend-stat">
                  <span className="trend-label">Most Common Trigger:</span>
                  <span className="trend-value">
                    {sortedTriggers[0]?.[0] || 'None'}
                  </span>
                </div>
                <div className="trend-stat">
                  <span className="trend-label">Peak Trigger Day:</span>
                  <span className="trend-value">Not enough data</span>
                </div>
                <div className="trend-stat">
                  <span className="trend-label">Improvement Trend:</span>
                  <span className="trend-value positive">+5% this week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalysis;