export interface EmotionData {
  emotion: string;
  intensity: number;
  timestamp: number;
  confidence: number; // Changed from optional to required
}

export interface GazeData {
  x: number;
  y: number;
  timestamp: number;
  content?: string;
}

export interface BreakReminder {
  id: string;
  type: string;
  triggeredAt: string;
}

export interface AttentionMetrics {
  focusSessions: number;
  attentionSpan: number;
  distractions: number;
  lastUpdated: string;
}

export interface DetailedAttentionMetrics {
  focusSessions: number;
  averageSessionLength: number;
  totalFocusTime: number;
  attentionSpan: number;
  distractionCount: number;
  focusEfficiency: number;
  gazeStability: number;
  screenCoverage: number;
  regionAttention: Record<string, number>;
  patterns: {
    bestFocusTime: string;
    worstFocusTime: string;
    dailyRhythm: number[];
  };
  lastUpdated: number;
}

export interface WellnessState {
  emotionalTrends: EmotionData[];
  gazeData: GazeData[];
  breakReminders: BreakReminder[];
  contentTriggers: string[];
  wellnessScore: number;
  screenTime: number;
  currentEmotion: string;
  attentionMetrics: AttentionMetrics;
}