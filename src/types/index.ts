// Re-export all types from wellness to ensure consistency
export * from './wellness';

// Define GazePoint to match GazeData structure
export interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
  content: string; // Make this required to match GazeData usage
}

export interface ContentTrigger {
  type: string;
  timestamp: number;
  data: Record<string, any>;
}