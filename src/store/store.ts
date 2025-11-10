import { configureStore } from '@reduxjs/toolkit';
import wellnessReducer from './wellnessSlice';

export const store = configureStore({
  reducer: {
    wellness: wellnessReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;