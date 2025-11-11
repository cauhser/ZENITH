import React, { useState, useEffect } from 'react';
interface CommunityCircle {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  tags: string[];
  joinLink: string;
}
const CommunityPulse: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const communityCircles: CommunityCircle[] = [
    {
      id: '1',
      name: 'HKU Mindful Coders',
      description: 'FYP support group for computer science students',
      members: 182,
      category: 'Academic',
      tags: ['FYP', 'Programming', 'Stress Relief'],
      joinLink: '#'
    },
    {
      id: '2',
      name: 'PolyU Film & Chill',
      description: 'Movie nights, no drama',
      members: 97,
      category: 'Social',
      tags: ['Movies', 'Relaxation', 'Community'],
      joinLink: '#'
    },
    {
      id: '3',
      name: 'CityU Wellness Warriors',
      description: 'Mindfulness and meditation group',
      members: 145,
      category: 'Wellness',
      tags: ['Meditation', 'Mindfulness', 'Stress Management'],
      joinLink: '#'
    },
    {
      id: '4',
      name: 'UST Study Buddies',
      description: 'Collaborative study sessions for all majors',
      members: 223,
      category: 'Academic',
      tags: ['Study Groups', 'Academic Support', 'Collaboration'],
      joinLink: '#'
    },
    {
      id: '5',
      name: 'HKU Creative Minds',
      description: 'Art, design, and creative expression community',
      members: 76,
      category: 'Creative',
      tags: ['Art', 'Design', 'Expression'],
      joinLink: '#'
    },
    {
      id: '6',
      name: 'PolyU Sports Circle',
      description: 'Stay active and healthy together',
      members: 134,
      category: 'Fitness',
      tags: ['Sports', 'Fitness', 'Health'],
      joinLink: '#'
    }
  ];
  const filteredCircles = activeTab === 'all' 
    ? communityCircles 
    : communityCircles.filter(circle => circle.category === activeTab);
  const categories = ['all', 'Academic', 'Social', 'Wellness', 'Creative', 'Fitness'];
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Academic: '#3b82f6',
      Social: '#10b981',
      Wellness: '#8b5cf6',
      Creative: '#f59e0b',
      Fitness: '#ef4444'
    };
    return colors[category] || '#64748b';
  };
  return (
    <div className="community-pulse">
      <div className="pulse-header">
        <h3>🤝 Community Pulse</h3>
        <p>Join supportive campus communities</p>
      </div>
      <div className="pulse-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`tab-btn ${activeTab === category ? 'active' : ''}`}
            onClick={() => setActiveTab(category)}
          >
            {category === 'all' ? 'All Circles' : category}
          </button>
        ))}
      </div>
      <div className="pulse-content">
        {filteredCircles.map((circle) => (
          <div key={circle.id} className="community-card">
            <div className="card-header">
              <h4 className="circle-name">{circle.name}</h4>
              <div 
                className="category-tag"
                style={{ backgroundColor: getCategoryColor(circle.category) }}
              >
                {circle.category}
              </div>
            </div>
            <p className="circle-description">{circle.description}</p>
            <div className="circle-stats">
              <div className="members-count">👥 {circle.members} members</div>
              <div className="tags">
                {circle.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="card-actions">
              <button className="join-btn">[Join with one click]</button>
              <div className="integration-info">
                Auto-add to WhatsApp/Discord
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pulse-footer">
        <p>Privacy: Opt-in only</p>
      </div>
    </div>
  );
};
export default CommunityPulse;