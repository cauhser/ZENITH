import React, { createContext, useContext, ReactNode } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserProfile } from '../utils/UserInterfaceDetector';


import type { UserPreferences, InterfaceSettings } from '../utils/ProfileManager';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  userPreferences: UserPreferences | null;
  interfaceSettings: InterfaceSettings | null;
  updateProfile: (profile: UserProfile) => void;
  updatePreferences: (preferences: UserPreferences) => void;
  updateInterfaceSettings: (settings: InterfaceSettings) => void;
  refreshProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const {
    userProfile,
    userPreferences,
    interfaceSettings,
    updateProfile,
    updatePreferences,
    updateInterfaceSettings,
    refreshProfile
  } = useUserProfile();

  return React.createElement(
    UserProfileContext.Provider,
    {
      value: {
        userProfile,
        userPreferences,
        interfaceSettings,
        updateProfile,
        updatePreferences,
        updateInterfaceSettings,
        refreshProfile
      }
    },
    children
  );
};

export const useUserProfileContext = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
};