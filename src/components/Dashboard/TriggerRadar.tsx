import React, { useState } from 'react';
interface CampusData {
  id: string;
  name: string;
  triggers: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  stressLevel: number;
  studentsAffected: number;
}
const TriggerRadar: React.FC = () => {
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const campusData: CampusData[] = [
    {
      id: 'hku',
      name: 'HKU',
      stressLevel: 78,
      studentsAffected: 68,
      triggers: [
        { name: 'FYP', count: 124, percentage: 35 },
        { name: 'exam', count: 98, percentage: 28 },
        { name: 'ghosted', count: 76, percentage: 22 },
        { name: 'assignment', count: 42, percentage: 12 },
        { name: 'presentation', count: 11, percentage: 3 }
      ]
    },
    {
      id: 'polyu',
      name: 'PolyU',
      stressLevel: 82,
      studentsAffected: 72,
      triggers: [
        { name: 'exam', count: 156, percentage: 42 },
        { name: 'FYP', count: 112, percentage: 30 },
        { name: 'internship', count: 65, percentage: 18 },
        { name: 'graduation', count: 37, percentage: 10 }
      ]
    },
    {
      id: 'cityu',
      name: 'CityU',
      stressLevel: 65,
      studentsAffected: 58,
      triggers: [
        { name: 'assignment', count: 89, percentage: 38 },
        { name: 'exam', count: 76, percentage: 32 },
        { name: 'group project', count: 45, percentage: 19 },
        { name: 'presentation', count: 26, percentage: 11 }
      ]
    },
    {
      id: 'ust',
      name: 'HKUST',
      stressLevel: 71,
      studentsAffected: 62,
      triggers: [
        { name: 'research', count: 92, percentage: 36 },
        { name: 'exam', count: 78, percentage: 31 },
        { name: 'lab report', count: 54, percentage: 21 },
        { name: 'thesis', count: 30, percentage: 12 }
      ]
    }
  ];
  const selectedCampusData = selectedCampus 
    ? campusData.find(campus => campus.id === selectedCampus) 
    : campusData[0];
  const getStressColor = (level: number) => {
    if (level >= 80) return '#ef4444'; 
    if (level >= 60) return '#f59e0b'; 
    return '#10b981'; 
  };
  
  
  const handleTriggerClick = (triggerName: string) => {
    console.log(`Trigger clicked: ${triggerName}`);
    
    alert(`You clicked on "${triggerName}". This is a common stress trigger for students at ${selectedCampusData?.name || 'HKU'}.`);
  };
  
  
  const handlePulseMessageClick = () => {
    console.log('Campus pulse message clicked');
    alert(`"${selectedCampusData?.triggers[0]?.name || 'FYP'}" is currently spiking at ${selectedCampusData?.triggers[0]?.percentage || 68}% among students at ${selectedCampusData?.name || 'HKU'}. This data is updated in real-time from our wellness tracking.`);
  };
  
  
  const handleStressLevelClick = () => {
    console.log('Stress level clicked');
    alert(`${selectedCampusData?.studentsAffected || 68}% of students at ${selectedCampusData?.name || 'HKU'} are experiencing similar stress levels today. You're not alone.`);
  };
  
  return (
    <div className="trigger-radar">
      <div className="trigger-radar-header">
        <h3>📍 HKU Campus Pulse</h3>
        <p 
          className="interactive-pulse-message"
          onClick={handlePulseMessageClick}
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          "{selectedCampusData?.triggers[0]?.name || 'FYP'}" spiking ({selectedCampusData?.triggers[0]?.percentage || 68}% today)
        </p>
      </div>
      <div className="trigger-radar-content">
        <div className="campus-selector">
          <h4>Select Campus:</h4>
          <div className="campus-buttons">
            {campusData.map(campus => (
              <button
                key={campus.id}
                className={`campus-btn ${selectedCampus === campus.id ? 'active' : ''}`}
                onClick={() => setSelectedCampus(campus.id)}
              >
                {campus.name}
              </button>
            ))}
          </div>
        </div>
        {selectedCampusData && (
          <div className="campus-details">
            <div className="campus-stats">
              <div 
                className="stat-item"
                onClick={handleStressLevelClick}
                style={{ cursor: 'pointer' }}
              >
                <span className="stat-label">Stress Level</span>
                <div className="stress-bar-container">
                  <div className="stress-bar">
                    <div 
                      className="stress-bar-fill"
                      style={{ 
                        width: `${selectedCampusData.stressLevel}%`,
                        backgroundColor: getStressColor(selectedCampusData.stressLevel)
                      }}
                    ></div>
                  </div>
                  <span className="stress-value">{selectedCampusData.stressLevel}%</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Students Affected</span>
                <div className="stat-value">{selectedCampusData.studentsAffected}%</div>
              </div>
            </div>
            <div className="top-triggers">
              <h4>Top 5 Triggers This Week</h4>
              <div className="triggers-list">
                {selectedCampusData.triggers.map((trigger, index) => (
                  <div 
                    key={index} 
                    className="trigger-item"
                    onClick={() => handleTriggerClick(trigger.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="trigger-info">
                      <span className="trigger-name">{trigger.name}</span>
                      <span className="trigger-count">{trigger.count} reports</span>
                    </div>
                    <div className="trigger-bar">
                      <div 
                        className="trigger-fill"
                        style={{ 
                          width: `${trigger.percentage}%`,
                          backgroundColor: getStressColor(trigger.percentage + 20)
                        }}
                      ></div>
                    </div>
                    <div className="trigger-percentage">{trigger.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="community-message">
              <p>You're not alone — {selectedCampusData.studentsAffected}% of {selectedCampusData.name} students felt this today.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TriggerRadar;