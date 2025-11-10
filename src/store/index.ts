import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { 
  addEmotionData, 
  addGazeData, 
  addBreakReminder, 
  updateWellnessScore, 
  addContentTrigger, 
  updateAttentionMetrics, 
  setScreenTime,
  resetData 
} from './wellnessSlice';
import { EmotionData, GazeData, BreakReminder, AttentionMetrics } from '../types/wellness';

// Create typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Fixed: useStore hook now properly returns the wellness state
export const useStore = () => {
  const wellness = useAppSelector((state: RootState) => state.wellness);
  const dispatch = useAppDispatch();
  
  // Return the entire wellness state object
  return {
    // State - return the actual arrays from Redux
    ...wellness,
    
    // Actions
    addEmotionData: (data: EmotionData) => dispatch(addEmotionData(data)),
    addGazeData: (data: GazeData) => dispatch(addGazeData(data)),
    addBreakReminder: (data: Omit<BreakReminder, 'id'>) => dispatch(addBreakReminder(data)),
    updateWellnessScore: (score: number) => dispatch(updateWellnessScore(score)),
    addContentTrigger: (trigger: string) => dispatch(addContentTrigger(trigger)),
    updateAttentionMetrics: (metrics: Partial<AttentionMetrics>) => dispatch(updateAttentionMetrics(metrics)),
    setScreenTime: (time: number) => dispatch(setScreenTime(time)),
    resetData: () => dispatch(resetData())
  };
};

// Export store types without circular dependency
export type { RootState, AppDispatch };

