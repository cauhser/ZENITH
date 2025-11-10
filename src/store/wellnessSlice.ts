import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmotionData, GazeData, BreakReminder, AttentionMetrics, WellnessState } from '../types/wellness';

const initialState: WellnessState = {
  emotionalTrends: [],
  gazeData: [],
  breakReminders: [],
  contentTriggers: [],
  wellnessScore: 75,
  screenTime: 0,
  currentEmotion: 'neutral',
  attentionMetrics: {
    focusSessions: 0,
    attentionSpan: 0,
    distractions: 0,
    lastUpdated: new Date().toISOString()
  }
};

const wellnessSlice = createSlice({
  name: 'wellness',
  initialState,
  reducers: {
    addEmotionData: (state, action: PayloadAction<EmotionData>) => {
      state.emotionalTrends.push(action.payload);
      state.currentEmotion = action.payload.emotion;
      
      const emotionScores: { [key: string]: number } = {
        'happy': 10, 'neutral': 5, 'sad': -5, 'anxious': -8, 'stressed': -10
      };
      const scoreChange = emotionScores[action.payload.emotion] || 0;
      state.wellnessScore = Math.max(0, Math.min(100, state.wellnessScore + scoreChange));
    },
    
    addGazeData: (state, action: PayloadAction<GazeData>) => {
      state.gazeData.push(action.payload);
      state.screenTime += 1;
    },
    
    addBreakReminder: (state, action: PayloadAction<Omit<BreakReminder, 'id'>>) => {
      const newReminder: BreakReminder = {
        ...action.payload,
        id: Date.now().toString()
      };
      state.breakReminders.push(newReminder);
    },
    
    updateWellnessScore: (state, action: PayloadAction<number>) => {
      state.wellnessScore = Math.max(0, Math.min(100, action.payload));
    },
    
    addContentTrigger: (state, action: PayloadAction<string>) => {
      if (!state.contentTriggers.includes(action.payload)) {
        state.contentTriggers.push(action.payload);
      }
    },
    
    updateAttentionMetrics: (state, action: PayloadAction<Partial<AttentionMetrics>>) => {
      if (state.attentionMetrics) {
        state.attentionMetrics = {
          ...state.attentionMetrics,
          ...action.payload,
          lastUpdated: new Date().toISOString()
        };
      }
    },
    
    setScreenTime: (state, action: PayloadAction<number>) => {
      state.screenTime = action.payload;
    },
    
    resetData: (state) => {
      state.emotionalTrends = [];
      state.gazeData = [];
      state.breakReminders = [];
      state.contentTriggers = [];
      state.screenTime = 0;
      state.wellnessScore = 75;
      state.currentEmotion = 'neutral';
      state.attentionMetrics = {
        focusSessions: 0,
        attentionSpan: 0,
        distractions: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
});

export const {
  addEmotionData,
  addGazeData,
  addBreakReminder,
  updateWellnessScore,
  addContentTrigger,
  updateAttentionMetrics,
  setScreenTime,
  resetData
} = wellnessSlice.actions;

export default wellnessSlice.reducer;