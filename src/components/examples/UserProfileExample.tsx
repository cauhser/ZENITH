import React from 'react';
import { useUserProfileContext } from '../../contexts/UserProfileContext';


const UserProfileExample: React.FC = () => {
  const { 
    userProfile, 
    userPreferences, 
    interfaceSettings,
    updateProfile,
    updatePreferences,
    updateInterfaceSettings,
    refreshProfile
  } = useUserProfileContext();

  if (!userProfile) {
    return <div>Loading user profile...</div>;
  }

  const handleRefreshProfile = () => {
    refreshProfile();
  };

  const handleToggleTheme = () => {
    if (userPreferences) {
      const newTheme = userPreferences.theme === 'dark' ? 'light' : 'dark';
      updatePreferences({
        ...userPreferences,
        theme: newTheme
      });
    }
  };

  return (
    <div className="user-profile-example">
      <h2>User Profile Information</h2>
      
      <div className="profile-section">
        <h3>Device Information</h3>
        <p><strong>Interface Type:</strong> {userProfile.interfaceType}</p>
        <p><strong>Screen Size:</strong> {userProfile.screenSize}</p>
        <p><strong>Preferred Layout:</strong> {userProfile.preferredLayout}</p>
        <p><strong>Theme:</strong> {userProfile.theme}</p>
      </div>

      {userPreferences && (
        <div className="preferences-section">
          <h3>User Preferences</h3>
          <p><strong>Theme:</strong> {userPreferences.theme}</p>
          <p><strong>Language:</strong> {userPreferences.language}</p>
          <p><strong>Font Size:</strong> {userPreferences.fontSize}</p>
          <p><strong>Animations:</strong> {userPreferences.animations ? 'Enabled' : 'Disabled'}</p>
        </div>
      )}

      {interfaceSettings && (
        <div className="interface-section">
          <h3>Interface Settings</h3>
          <p><strong>Layout:</strong> {interfaceSettings.layout}</p>
          <p><strong>Sidebar:</strong> {interfaceSettings.sidebarCollapsed ? 'Collapsed' : 'Expanded'}</p>
          <p><strong>Dashboard View:</strong> {interfaceSettings.dashboardView}</p>
        </div>
      )}

      <div className="actions">
        <button onClick={handleRefreshProfile}>Refresh Profile</button>
        <button onClick={handleToggleTheme}>Toggle Theme</button>
      </div>

      <div className="features-section">
        <h3>Device Features</h3>
        <ul>
          {userProfile.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfileExample;