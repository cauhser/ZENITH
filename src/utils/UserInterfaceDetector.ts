

export interface UserProfile {
  interfaceType: 'mobile' | 'desktop' | 'tablet';
  screenSize: 'small' | 'medium' | 'large';
  preferredLayout: 'compact' | 'standard' | 'expanded';
  features: string[];
  theme: 'light' | 'dark' | 'auto';
}


export const detectDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  
  const isMobileUA = mobileRegex.test(userAgent);
  
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  
  if (isMobileUA || (isTouchDevice && screenWidth <= 768)) {
    return 'mobile';
  }
  
  
  if (screenWidth > 768 && screenWidth <= 1024) {
    return 'tablet';
  }
  
  
  return 'desktop';
};


export const getScreenSize = (): 'small' | 'medium' | 'large' => {
  const width = window.innerWidth;
  
  if (width <= 768) {
    return 'small';
  } else if (width <= 1024) {
    return 'medium';
  } else {
    return 'large';
  }
};


export const getThemePreference = (): 'light' | 'dark' | 'auto' => {
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
    return savedTheme;
  }
  
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  
  return 'auto';
};


export const getPreferredLayout = (): 'compact' | 'standard' | 'expanded' => {
  const deviceType = detectDeviceType();
  const screenSize = getScreenSize();
  
  if (deviceType === 'mobile' || screenSize === 'small') {
    return 'compact';
  } else if (deviceType === 'tablet' || screenSize === 'medium') {
    return 'standard';
  } else {
    return 'expanded';
  }
};


export const getDeviceFeatures = (): string[] => {
  const deviceType = detectDeviceType();
  const features: string[] = [];
  
  
  if (deviceType === 'mobile') {
    features.push('touch', 'camera', 'geolocation', 'notifications');
  } else if (deviceType === 'tablet') {
    features.push('touch', 'camera', 'geolocation', 'notifications', 'keyboard');
  } else {
    features.push('keyboard', 'mouse', 'high-resolution', 'multiple-windows');
  }
  
  
  if ('serviceWorker' in navigator) {
    features.push('offline-support');
  }
  
  if ('PushManager' in window) {
    features.push('push-notifications');
  }
  
  return features;
};


export const createUserProfile = (): UserProfile => {
  const deviceType = detectDeviceType();
  const screenSize = getScreenSize();
  const preferredLayout = getPreferredLayout();
  const features = getDeviceFeatures();
  const theme = getThemePreference();
  
  return {
    interfaceType: deviceType,
    screenSize,
    preferredLayout,
    features,
    theme
  };
};


export const getComponentForInterface = (componentName: string, userProfile: UserProfile): string => {
  
  
  return `./components/${userProfile.interfaceType}/${componentName}-${userProfile.interfaceType}`;
};

export default {
  detectDeviceType,
  getScreenSize,
  getThemePreference,
  getPreferredLayout,
  getDeviceFeatures,
  createUserProfile,
  getComponentForInterface
};