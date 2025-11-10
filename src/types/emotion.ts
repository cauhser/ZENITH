// emotion.ts - Comprehensive emotion detection types

/**
 * Core emotion types supported by the system
 */
export type EmotionType = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'fearful' 
  | 'surprised' 
  | 'disgusted' 
  | 'neutral'
  | 'calm'
  | 'confused'
  | 'focused'
  | 'stressed'
  | 'tired';

/**
 * Emotion intensity levels
 */
export type EmotionIntensity = 
  | 'very_low' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'very_high';

/**
 * Emotion valence (positive/negative)
 */
export type EmotionValence = 'positive' | 'negative' | 'neutral';

/**
 * Emotion arousal levels
 */
export type EmotionArousal = 'calm' | 'moderate' | 'aroused';

/**
 * Complete emotion detection result
 */
export interface EmotionDetectionResult {
  // Core emotion data
  emotion: EmotionType;
  confidence: number;
  intensity: number; // 0-1 scale
  valence: EmotionValence;
  arousal: EmotionArousal;
  
  // Detailed emotion probabilities
  probabilities: Record<EmotionType, number>;
  
  // Technical metadata
  timestamp: number;
  detectionTime: number;
  modelVersion: string;
  modelType: 'enhanced' | 'performance' | 'simulated';
  
  // Facial feature data (if available)
  facialFeatures?: {
    landmarks?: number[][];
    expressions?: {
      smile: number;
      eyebrowRaise: number;
      eyeWidening: number;
      mouthOpen: number;
    };
    headPose?: {
      pitch: number;
      yaw: number;
      roll: number;
    };
  };
  
  // Context data
  context?: {
    duration: number;
    stability: number; // How stable the emotion detection is
    previousEmotion?: EmotionType;
    transitionSpeed?: number; // How quickly emotion changed
  };
  
  // Performance metrics
  performance?: {
    processingTime: number;
    frameRate: number;
    quality: number; // 0-1 scale
    confidenceThreshold: number;
  };
}

/**
 * Emotion statistics over time
 */
export interface EmotionStatistics {
  period: {
    start: number;
    end: number;
    duration: number;
  };
  dominantEmotion: EmotionType;
  emotionDistribution: Record<EmotionType, number>;
  averageIntensity: number;
  valenceRatio: {
    positive: number;
    negative: number;
    neutral: number;
  };
  arousalLevels: {
    calm: number;
    moderate: number;
    aroused: number;
  };
  transitions: {
    count: number;
    mostCommon: Array<{
      from: EmotionType;
      to: EmotionType;
      count: number;
    }>;
  };
  stability: number; // 0-1 scale
}

/**
 * Emotion trend data for charts and analytics
 */
export interface EmotionTrend {
  timestamp: number;
  emotions: Record<EmotionType, number>;
  dominantEmotion: EmotionType;
  averageValence: number; // -1 to 1 scale
  averageArousal: number; // 0-1 scale
  intensity: number;
  sampleSize: number;
}

/**
 * Real-time emotion stream configuration
 */
export interface EmotionStreamConfig {
  enabled: boolean;
  sampleRate: number; // samples per second
  bufferSize: number; // number of samples to keep in memory
  smoothing: {
    enabled: boolean;
    windowSize: number;
    method: 'moving_average' | 'exponential' | 'median';
  };
  filters: {
    minConfidence: number;
    maxDetectionTime: number;
    stabilityThreshold: number;
  };
  output: {
    format: 'full' | 'minimal' | 'aggregated';
    includeFeatures: boolean;
    includePerformance: boolean;
  };
}

/**
 * Emotion detection model configuration
 */
export interface EmotionModelConfig {
  modelType: 'enhanced' | 'performance' | 'simulated';
  parameters: {
    confidenceThreshold: number;
    detectionInterval: number;
    smoothingFactor: number;
    maxHistorySize: number;
  };
  features: {
    enableFacialLandmarks: boolean;
    enableHeadPose: boolean;
    enableExpressionAnalysis: boolean;
    enableRealTimeSmoothing: boolean;
  };
  performance: {
    targetFPS: number;
    maxProcessingTime: number;
    qualityVsSpeed: 'quality' | 'balanced' | 'speed';
  };
}

/**
 * Camera and video configuration for emotion detection
 */
export interface EmotionCameraConfig {
  deviceId?: string;
  constraints: {
    width: { ideal: number; max?: number };
    height: { ideal: number; max?: number };
    frameRate: { ideal: number; max?: number };
    facingMode: 'user' | 'environment';
  };
  processing: {
    resizeFactor: number;
    grayscale: boolean;
    normalize: boolean;
    enhance: boolean;
  };
}

/**
 * Emotion detection session
 */
export interface EmotionSession {
  id: string;
  startTime: number;
  endTime?: number;
  config: EmotionModelConfig;
  cameraConfig: EmotionCameraConfig;
  statistics: EmotionStatistics;
  recordings: Array<{
    timestamp: number;
    emotion: EmotionDetectionResult;
    videoChunk?: string; // base64 encoded video chunk
  }>;
  status: 'active' | 'paused' | 'ended' | 'error';
  error?: string;
}

/**
 * Emotion-based wellness insights
 */
export interface EmotionWellnessInsights {
  emotionalPatterns: {
    frequentEmotions: Array<{
      emotion: EmotionType;
      frequency: number;
      averageIntensity: number;
    }>;
    emotionalStability: number;
    positiveRatio: number;
    stressIndicators: number;
  };
  recommendations: Array<{
    type: 'break' | 'exercise' | 'meditation' | 'content_change';
    emotion: EmotionType;
    confidence: number;
    message: string;
    urgency: 'low' | 'medium' | 'high';
  }>;
  correlations: {
    screenTime: number;
    contentType: string;
    timeOfDay: string;
    emotionalImpact: number;
  }[];
}

/**
 * Emotion detection performance metrics
 */
export interface EmotionPerformanceMetrics {
  // Timing metrics
  averageDetectionTime: number;
  maxDetectionTime: number;
  minDetectionTime: number;
  recentAverageDetectionTime: number;
  
  // Quality metrics
  averageConfidence: number;
  successRate: number; // percentage of successful detections
  stability: number; // consistency of detections
  
  // Resource usage
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  
  // Sample statistics
  sampleSize: number;
  detectionFrequency: number;
  bufferUsage: number;
  
  // Model performance
  modelAccuracy: number;
  falsePositives: number;
  falseNegatives: number;
}

/**
 * Emotion event for real-time processing
 */
export interface EmotionEvent {
  type: 'emotion_detected' | 'emotion_changed' | 'emotion_stable' | 'emotion_volatile';
  emotion: EmotionDetectionResult;
  previousEmotion?: EmotionDetectionResult;
  duration: number;
  significance: 'low' | 'medium' | 'high';
  trigger?: string;
}

/**
 * Content analysis types for wellness tracking
 */
export interface ContentAnalysisResult {
  contentId: string;
  url: string;
  timestamp: string;
  emotionalImpact: EmotionalImpact;
  attentionMetrics: any;
  wellnessScore: number;
  recommendations: string[];
  contentType: ContentType;
  analysisConfidence: number;
}

export interface EmotionalImpact {
  sentiment: number;
  sentimentLabel: string;
  emotionalTone: Record<string, number>;
  intensity: number;
  triggers: string[];
  positivityScore: number;
}

export type ContentType = 'article' | 'blog' | 'social' | 'email' | 'academic' | 'webpage';

/**
 * Export all emotion types
 */
export type {
  EmotionType as CoreEmotion,
  EmotionIntensity as IntensityLevel,
  EmotionValence as ValenceType,
  EmotionArousal as ArousalLevel,
};