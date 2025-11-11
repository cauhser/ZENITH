import React, { useState } from 'react';
interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'article' | 'community' | 'resource';
  source: string;
  duration?: string;
  likes: number;
  thumbnail?: string;
  description: string;
  url: string;
}
const SafeScrollFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: 'HKU puppy therapy reel',
      type: 'video',
      source: 'HKU Wellness',
      duration: '2:30',
      likes: 245,
      description: 'Cute puppies helping students de-stress during exam period',
      url: '#'
    },
    {
      id: '2',
      title: 'PolyU study buddy Discord',
      type: 'community',
      source: 'PolyU Student Union',
      likes: 189,
      description: 'Join our supportive study community with over 500 members',
      url: '#'
    },
    {
      id: '3',
      title: '1-min mindfulness by Mind HK',
      type: 'video',
      source: 'Mind HK',
      duration: '1:00',
      likes: 421,
      description: 'Quick daily mindfulness exercise to center yourself',
      url: '#'
    },
    {
      id: '4',
      title: 'Stress management techniques',
      type: 'article',
      source: 'HKU Counselling',
      likes: 156,
      description: '5 evidence-based techniques to manage academic stress',
      url: '#'
    },
    {
      id: '5',
      title: 'Campus nature walk guide',
      type: 'resource',
      source: 'CityU Green Initiative',
      likes: 98,
      description: 'Discover peaceful spots around campus for reflection',
      url: '#'
    },
    {
      id: '6',
      title: 'Peer support circles',
      type: 'community',
      source: 'UST Student Services',
      likes: 267,
      description: 'Weekly virtual support groups for students',
      url: '#'
    }
  ];
  const filteredContent = activeTab === 'all' 
    ? contentItems 
    : contentItems.filter(item => item.type === activeTab);
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📝';
      case 'community': return '👥';
      case 'resource': return '📚';
      default: return '📌';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return '#ef4444';
      case 'article': return '#10b981';
      case 'community': return '#3b82f6';
      case 'resource': return '#8b5cf6';
      default: return '#64748b';
    }
  };
  return (
    <div className="safe-scroll-feed">
      <div className="feed-header">
        <h3>🛡️ Safe Scroll Feed</h3>
        <p>Feeling low? Here's what helped others:</p>
      </div>
      <div className="feed-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          Videos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Communities
        </button>
        <button 
          className={`tab-btn ${activeTab === 'article' ? 'active' : ''}`}
          onClick={() => setActiveTab('article')}
        >
          Articles
        </button>
      </div>
      <div className="feed-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredContent.map((item) => (
          <div key={item.id} className="content-card">
            <div className="content-header">
              <div className="content-type">
                <span 
                  className="type-icon"
                  style={{ color: getTypeColor(item.type) }}
                >
                  {getTypeIcon(item.type)}
                </span>
                <span className="type-label">{item.type}</span>
              </div>
              <div className="content-meta">
                <span className="source">{item.source}</span>
                {item.duration && (
                  <span className="duration">⏱️ {item.duration}</span>
                )}
              </div>
            </div>
            <h4 className="content-title">{item.title}</h4>
            <p className="content-description">{item.description}</p>
            <div className="content-footer">
              <div className="likes">👍 {item.likes} likes</div>
              <button className="view-btn">View Content</button>
            </div>
          </div>
        ))}
      </div>
      <div className="feed-footer">
        <p>Partner NGOs + user-upvoted content</p>
      </div>
    </div>
  );
};
export default SafeScrollFeed;