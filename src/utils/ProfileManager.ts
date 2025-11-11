

import { UserProfile, createUserProfile } from './UserInterfaceDetector';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  notifications: boolean;
  dataCollection: boolean;
}

export interface InterfaceSettings {
  layout: 'compact' | 'standard' | 'expanded';
  sidebarCollapsed: boolean;
  dashboardView: 'grid' | 'list';
  contentDensity: 'comfortable' | 'compact';
}

export class ProfileManager {
  private static instance: ProfileManager;
  private userProfile: UserProfile | null = null;
  private userPreferences: UserPreferences | null = null;
  private interfaceSettings: InterfaceSettings | null = null;
  private listeners: Array<(profile: UserProfile) => void> = [];

  private constructor() {
    this.loadProfile();
    this.loadPreferences();
    this.loadInterfaceSettings();
  }

  public static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager();
    }
    return ProfileManager.instance;
  }

  
  public getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  
  public getUserPreferences(): UserPreferences | null {
    return this.userPreferences;
  }

  
  public getInterfaceSettings(): InterfaceSettings | null {
    return this.interfaceSettings;
  }

  
  public updateUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    this.saveProfile();
    this.notifyListeners();
  }

  
  public updateUserPreferences(preferences: UserPreferences): void {
    this.userPreferences = preferences;
    this.savePreferences();
    this.applyPreferences();
  }

  
  public updateInterfaceSettings(settings: InterfaceSettings): void {
    this.interfaceSettings = settings;
    this.saveInterfaceSettings();
  }

  
  public refreshProfile(): void {
    const newProfile = createUserProfile();
    this.updateUserProfile(newProfile);
  }

  
  public addProfileListener(listener: (profile: UserProfile) => void): void {
    this.listeners.push(listener);
  }

  
  public removeProfileListener(listener: (profile: UserProfile) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  
  private saveProfile(): void {
    if (this.userProfile) {
      try {
        localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
      } catch (error) {
        console.error('Failed to save user profile:', error);
      }
    }
  }

  
  private savePreferences(): void {
    if (this.userPreferences) {
      try {
        localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
      } catch (error) {
        console.error('Failed to save user preferences:', error);
      }
    }
  }

  
  private saveInterfaceSettings(): void {
    if (this.interfaceSettings) {
      try {
        localStorage.setItem('interfaceSettings', JSON.stringify(this.interfaceSettings));
      } catch (error) {
        console.error('Failed to save interface settings:', error);
      }
    }
  }

  
  private loadProfile(): void {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        this.userProfile = JSON.parse(savedProfile);
      } else {
        this.userProfile = createUserProfile();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.userProfile = createUserProfile();
    }
  }

  
  private loadPreferences(): void {
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        this.userPreferences = JSON.parse(savedPreferences);
      } else {
        this.userPreferences = this.createDefaultPreferences();
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      this.userPreferences = this.createDefaultPreferences();
    }
  }

  
  private loadInterfaceSettings(): void {
    try {
      const savedSettings = localStorage.getItem('interfaceSettings');
      if (savedSettings) {
        this.interfaceSettings = JSON.parse(savedSettings);
      } else {
        this.interfaceSettings = this.createDefaultInterfaceSettings();
      }
    } catch (error) {
      console.error('Failed to load interface settings:', error);
      this.interfaceSettings = this.createDefaultInterfaceSettings();
    }
  }

  
  private createDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: navigator.language || 'en-US',
      fontSize: 'medium',
      animations: true,
      notifications: true,
      dataCollection: false
    };
  }

  
  private createDefaultInterfaceSettings(): InterfaceSettings {
    if (!this.userProfile) {
      this.userProfile = createUserProfile();
    }

    return {
      layout: this.userProfile?.preferredLayout || 'standard',
      sidebarCollapsed: false,
      dashboardView: 'grid',
      contentDensity: 'comfortable'
    };
  }

  
  private applyPreferences(): void {
    if (!this.userPreferences) return;

    
    if (this.userPreferences.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-mode', prefersDark);
    } else {
      document.body.classList.toggle('dark-mode', this.userPreferences.theme === 'dark');
    }

    
    
  }

  
  private notifyListeners(): void {
    if (this.userProfile) {
      this.listeners.forEach(listener => listener(this.userProfile!));
    }
  }
}

export default ProfileManager;