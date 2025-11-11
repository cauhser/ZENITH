# Zpire-Web Unified Interface Architecture

This document describes the new unified interface architecture that allows the website to determine the user's interface and provide specific browsing interface profiles.

## Architecture Overview

The new architecture consists of several key components:

1. **User Interface Detector** - Detects device type, screen size, and user preferences
2. **Profile Manager** - Manages user profiles, preferences, and interface settings
3. **Dynamic Component Loader** - Loads appropriate components based on user profile
4. **User Profile Context** - Provides user profile data throughout the application

## Key Files

### `utils/UserInterfaceDetector.ts`
- Detects device type (mobile, desktop, tablet)
- Determines screen size category (small, medium, large)
- Gets user preferences (theme, layout, features)
- Creates comprehensive user profiles

### `utils/ProfileManager.ts`
- Manages user profiles and preferences
- Handles localStorage persistence
- Provides methods to update profile settings
- Implements singleton pattern for consistent access

### `hooks/useUserProfile.ts`
- Custom React hook for accessing user profile data
- Provides functions to update profile, preferences, and settings
- Automatically updates when profile changes

### `contexts/UserProfileContext.tsx`
- React context provider for user profile data
- Makes profile data accessible throughout the component tree
- Wraps the main application component

### `components/DynamicComponentLoader.tsx`
- Dynamically loads components based on user profile
- Falls back to generic components when interface-specific ones don't exist
- Handles loading and error states

## How It Works

1. When the application starts, the User Interface Detector analyzes the user's device and browser
2. A user profile is created with information about device type, screen size, and preferences
3. The Profile Manager stores this profile and makes it available through the context
4. Components can access the user profile through the UserProfileContext
5. The Dynamic Component Loader loads interface-specific components when available

## Usage Examples

### Accessing User Profile in Components

```tsx
import React from 'react';
import { useUserProfileContext } from '../contexts/UserProfileContext';

const MyComponent: React.FC = () => {
  const { userProfile, userPreferences } = useUserProfileContext();
  
  if (!userProfile) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className={`my-component ${userProfile.interfaceType}`}>
      <h1>Welcome to {userProfile.interfaceType} interface</h1>
    </div>
  );
};
```

### Using Dynamic Component Loader

```tsx
import DynamicComponentLoader from '../components/DynamicComponentLoader';

const AppRoutes: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  
  if (!userProfile) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      <Route 
        path="/dashboard" 
        element={
          <DynamicComponentLoader 
            componentName="Dashboard/EnhancedDashboard" 
            userProfile={userProfile} 
          />
        } 
      />
    </Routes>
  );
};
```

## Benefits

1. **Automatic Interface Detection** - The system automatically detects the user's device and provides the appropriate interface
2. **Consistent User Experience** - User preferences are preserved across sessions
3. **Flexible Component Loading** - Components can be loaded dynamically based on user profile
4. **Easy Maintenance** - Centralized profile management makes it easy to update user settings
5. **Scalable Architecture** - New device types and interface preferences can be easily added

## Adding New Interface Types

To add support for new interface types:

1. Update the `interfaceType` type in `UserProfile` interface
2. Add detection logic in `UserInterfaceDetector.ts`
3. Create interface-specific components in appropriately named directories
4. Update the `DynamicComponentLoader` to handle the new interface type