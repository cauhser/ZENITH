import React, { useState } from 'react';
interface Resource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  hours?: string;
  location?: string;
}
const CampusResourceFinder: React.FC = () => {
  const [showResources, setShowResources] = useState(false);
  const resources: Resource[] = [
    {
      id: '1',
      name: 'Open Up 24/7 Chat',
      description: 'Confidential emotional support service available 24/7 in Cantonese and English',
      phone: '988',
      website: 'https://openup.hk',
    },
    {
      id: '2',
      name: 'CEDARS Emergency Line',
      description: 'The University of Hong Kong Crisis Emergency Distress Response System',
      phone: '3917 9999',
      hours: '24/7'
    },
    {
      id: '3',
      name: 'PolyU Counselling & Psychological Services',
      description: 'Professional counselling services for PolyU students',
      phone: '2766 6999',
      hours: 'Mon-Fri 9:00-18:00'
    },
    {
      id: '4',
      name: 'HKU Student Counselling Service',
      description: 'Confidential counselling and mental health support',
      phone: '3917 9999',
      hours: 'Mon-Fri 9:00-18:00'
    },
    {
      id: '5',
      name: 'CityU Student Counselling',
      description: 'Individual and group counselling services',
      phone: '3442 8666',
      hours: 'Mon-Fri 9:00-18:00'
    }
  ];
  const toggleResources = () => {
    setShowResources(!showResources);
  };
  return (
    <div className="campus-resource-finder">
      <button className="panic-button" onClick={toggleResources}>
        🆘 Need to talk now?
      </button>
      {showResources && (
        <div className="resources-overlay">
          <div className="resources-modal campus-resources-modal">
            <div className="modal-header">
              <h2 className="campus-resources-title">Campus Mental Health Resources</h2>
              <button className="close-button" onClick={toggleResources}>×</button>
            </div>
            <div className="resources-list">
              {resources.map(resource => (
                <div key={resource.id} className="resource-card">
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>
                  {resource.phone && (
                    <p className="contact-info">
                      <strong>📞</strong> {resource.phone}
                    </p>
                  )}
                  {resource.hours && (
                    <p className="hours">
                      <strong>🕐</strong> {resource.hours}
                    </p>
                  )}
                  {resource.website && (
                    <a 
                      href={resource.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="quiet-spaces">
              <h3>📍 Find Quiet Spaces on Campus</h3>
              <p>Discover peaceful areas for reflection and relaxation near you.</p>
              <button className="map-button">
                Show Campus Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CampusResourceFinder;