import { useState, useEffect } from 'react';
import { ProfileManager } from '../utils/ProfileManager';
import { UserProfile } from '../utils/UserInterfaceDetector';
import { UserPreferences, InterfaceSettings } from '../utils/ProfileManager';


export const useUserProfile = () => {
  const profileManager = ProfileManager.getInstance();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(profileManager.getUserProfile());
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(profileManager.getUserPreferences());
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings | null>(profileManager.getInterfaceSettings());

  useEffect(() => {
    
    const profileListener = (profile: UserProfile) => {
      setUserProfile(profile);
    };
    
    profileManager.addProfileListener(profileListener);
    
    
    return () => {
      profileManager.removeProfileListener(profileListener);
    };
  }, [profileManager]);

  
  const updateProfile = (profile: UserProfile) => {
    profileManager.updateUserProfile(profile);
    setUserProfile(profile);
  };

  
  const updatePreferences = (preferences: UserPreferences) => {
    profileManager.updateUserPreferences(preferences);
    setUserPreferences(preferences);
  };

  
  const updateInterfaceSettings = (settings: InterfaceSettings) => {
    profileManager.updateInterfaceSettings(settings);
    setInterfaceSettings(settings);
  };

  
  const refreshProfile = () => {
    profileManager.refreshProfile();
  };

  return {
    userProfile,
    userPreferences,
    interfaceSettings,
    updateProfile,
    updatePreferences,
    updateInterfaceSettings,
    refreshProfile
  };
};