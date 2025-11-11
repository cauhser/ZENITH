export const APP_CONSTANTS = {
  NAME: 'ZENITH Wellness',
  VERSION: '1.0.0',
  DESCRIPTION: 'Digital Wellbeing and Emotional Response Tracker',
  AUTHOR: 'ZENITH Team',
  REPOSITORY: 'https://github.com/zenith-wellness/zpire-web',
};
export const EMOTION_CONSTANTS = {
  EMOTIONS: [
    'happy',
    'sad', 
    'angry',
    'fearful',
    'surprised',
    'disgusted',
    'neutral',
    'calm',
    'confused',
    'focused',
    'stressed',
    'tired'
  ] as const,
  EMOTION_COLORS: {
    happy: 'linear-gradient(135deg, #10B981, #059669)',
    sad: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    angry: 'linear-gradient(135deg, #EF4444, #DC2626)',
    fearful: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    surprised: 'linear-gradient(135deg, #F59E0B, #D97706)',
    disgusted: 'linear-gradient(135deg, #84CC16, #65A30D)',
    neutral: 'linear-gradient(135deg, #6B7280, #4B5563)',
    calm: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    confused: 'linear-gradient(135deg, #F97316, #EA580C)',
    focused: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    stressed: 'linear-gradient(135deg, #EC4899, #DB2777)',
    tired: 'linear-gradient(135deg, #78716C, #57534E)'
  },
  INTENSITY_LEVELS: {
    VERY_LOW: 0.2,
    LOW: 0.4,
    MEDIUM: 0.6,
    HIGH: 0.8,
    VERY_HIGH: 1.0
  },
  CONFIDENCE_THRESHOLDS: {
    MINIMUM: 0.3,
    RELIABLE: 0.7,
    HIGH: 0.9
  },
  DETECTION_INTERVALS: {
    REALTIME: 100,    
    BALANCED: 500,    
    ECONOMICAL: 1000  
  }
};
export const CONTENT_CONSTANTS = {
  TRIGGER_CATEGORIES: {
    STRESS: ['stress', 'stressed', 'stressful', 'pressure', 'overwhelmed'],
    ANXIETY: ['anxiety', 'anxious', 'worry', 'worried', 'panic'],
    DEPRESSION: ['depression', 'depressed', 'sad', 'hopeless', 'empty'],
    ANGER: ['angry', 'anger', 'frustrated', 'mad', 'furious'],
    FEAR: ['fear', 'afraid', 'scared', 'terror', 'dread'],
    CRISIS: ['suicide', 'suicidal', 'self-harm', 'self injury', 'hopelessness']
  },
  SENTIMENT_THRESHOLDS: {
    VERY_NEGATIVE: -0.6,
    NEGATIVE: -0.2,
    NEUTRAL: 0.2,
    POSITIVE: 0.6,
    VERY_POSITIVE: 1.0
  },
  RISK_LEVELS: {
    CRISIS: {
      threshold: 10,
      color: '#DC2626',
      label: 'Crisis'
    },
    HIGH: {
      threshold: 7,
      color: '#EF4444', 
      label: 'High'
    },
    MEDIUM: {
      threshold: 4,
      color: '#F59E0B',
      label: 'Medium'
    },
    LOW: {
      threshold: 2,
      color: '#10B981',
      label: 'Low'
    },
    POSITIVE: {
      threshold: -1,
      color: '#059669',
      label: 'Positive'
    }
  }
};
export const ATTENTION_CONSTANTS = {
  FOCUS_THRESHOLDS: {
    OPTIMAL: 25,
    EXTENDED: 50,
    MAXIMUM: 90
  },
  BREAK_INTERVALS: {
    MICRO_BREAK: 5,
    SHORT_BREAK: 15,
    LONG_BREAK: 30
  },
  GAZE: {
    SAMPLE_RATE: 100, 
    HISTORY_SIZE: 100, 
    STABILITY_THRESHOLD: 0.7
  },
  ATTENTION_SCORES: {
    EXCELLENT: 90,
    GOOD: 70,
    FAIR: 50,
    POOR: 30
  }
};
export const WELLNESS_CONSTANTS = {
  WEIGHTS: {
    EMOTIONAL: 0.3,
    MENTAL: 0.25,
    PHYSICAL: 0.25,
    SOCIAL: 0.2
  },
  SCORE_RANGES: {
    EXCELLENT: { min: 90, color: '#10B981', label: 'Excellent' },
    GOOD: { min: 70, color: '#3B82F6', label: 'Good' },
    FAIR: { min: 50, color: '#F59E0B', label: 'Fair' },
    POOR: { min: 30, color: '#EF4444', label: 'Needs Attention' },
    CRITICAL: { min: 0, color: '#DC2626', label: 'Critical' }
  },
  DAILY_GOALS: {
    MAX_SCREEN_TIME: 480, 
    MIN_BREAKS: 4,
    MIN_FOCUS_SESSIONS: 3,
    MAX_STRESS_LEVEL: 70 
  }
};
export const STORAGE_CONSTANTS = {
  STORAGE_KEYS: {
    ANALYTICS: 'analytics',
    SETTINGS: 'settings',
    USER_PERMISSIONS: 'userPermissions',
    EMOTION_DATA: 'emotionData',
    ATTENTION_DATA: 'attentionData',
    SESSION_DATA: 'sessionData'
  },
  RETENTION_PERIODS: {
    ANALYTICS: 7 * 24 * 60 * 60 * 1000, 
    SESSION: 24 * 60 * 60 * 1000, 
    EMOTION: 30 * 24 * 60 * 60 * 1000, 
    ATTENTION: 14 * 24 * 60 * 60 * 1000 
  },
  STORAGE_LIMITS: {
    MAX_ITEMS: 1000,
    MAX_ITEM_SIZE: 8192, 
    TOTAL_QUOTA: 10485760 
  }
};
export const API_CONSTANTS = {
  WS_ENDPOINTS: {
    DEVELOPMENT: 'ws://localhost:3000',
    PRODUCTION: 'wss://api.zenith-wellness.com',
  },
  HTTP_ENDPOINTS: {
    BASE: '/api/v1',
    ANALYTICS: '/analytics',
    SESSIONS: '/sessions',
    INSIGHTS: '/insights'
  },
  TIMEOUTS: {
    WS_CONNECTION: 5000,
    HTTP_REQUEST: 10000,
    PING_INTERVAL: 30000
  },
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMITED: 'RATE_LIMITED',
    SERVER_ERROR: 'SERVER_ERROR'
  }
};
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
    LARGE_DESKTOP: 1536
  },
  COLORS: {
    PRIMARY: '#3B82F6',
    PRIMARY_DARK: '#2563EB',
    SECONDARY: '#8B5CF6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4',
    GRAY_50: '#F8FAFC',
    GRAY_100: '#F1F5F9',
    GRAY_200: '#E2E8F0',
    GRAY_300: '#CBD5E1',
    GRAY_400: '#94A3B8',
    GRAY_500: '#64748B',
    GRAY_600: '#475569',
    GRAY_700: '#334155',
    GRAY_800: '#1E293B',
    GRAY_900: '#0F172A'
  },
  TYPOGRAPHY: {
    FONT_FAMILY: {
      SANS: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      MONO: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    },
    FONT_WEIGHTS: {
      LIGHT: 300,
      NORMAL: 400,
      MEDIUM: 500,
      SEMIBOLD: 600,
      BOLD: 700
    },
    FONT_SIZES: {
      XS: '0.75rem',
      SM: '0.875rem',
      BASE: '1rem',
      LG: '1.125rem',
      XL: '1.25rem',
      '2XL': '1.5rem',
      '3XL': '1.875rem',
      '4XL': '2.25rem'
    }
  },
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
    '3XL': '4rem'
  },
  BORDER_RADIUS: {
    SM: '0.375rem',
    MD: '0.5rem',
    LG: '0.75rem',
    XL: '1rem',
    '2XL': '1.5rem',
    FULL: '9999px'
  },
  SHADOWS: {
    SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    MODAL: 1030,
    POPOVER: 1040,
    TOOLTIP: 1050
  }
};
export const FEATURE_FLAGS = {
  EMOTION_DETECTION: true,
  EYE_TRACKING: true,
  CONTENT_ANALYSIS: true,
  BREAK_REMINDERS: true,
  REAL_TIME_ANALYTICS: true,
  DATA_EXPORT: true,
  OFFLINE_MODE: true
};
export const DEFAULT_SETTINGS = {
  privacy: {
    dataCollection: true,
    emotionTracking: true,
    contentAnalysis: true,
    anonymousAnalytics: true
  },
  notifications: {
    breakReminders: true,
    stressAlerts: true,
    dailyInsights: true,
    soundEnabled: false
  },
  wellness: {
    workHours: {
      start: '09:00',
      end: '17:00'
    },
    breakIntervals: {
      microBreak: 25,
      shortBreak: 90,
      longBreak: 180
    },
    goals: {
      maxScreenTime: 480,
      minBreaks: 6,
      minFocusTime: 180
    }
  },
  appearance: {
    theme: 'system',
    reducedMotion: false,
    highContrast: false
  }
};
export const CONSTANTS = {
  APP: APP_CONSTANTS,
  EMOTION: EMOTION_CONSTANTS,
  CONTENT: CONTENT_CONSTANTS,
  ATTENTION: ATTENTION_CONSTANTS,
  WELLNESS: WELLNESS_CONSTANTS,
  STORAGE: STORAGE_CONSTANTS,
  API: API_CONSTANTS,
  UI: UI_CONSTANTS,
  FEATURES: FEATURE_FLAGS,
  SETTINGS: DEFAULT_SETTINGS
} as const;