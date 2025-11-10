// performance.ts - Performance monitoring and optimization utilities

/**
 * Memory info interface for Chrome's performance.memory API
 */
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Extend Performance interface to include memory property
 */
declare global {
  interface Performance {
    memory?: MemoryInfo;
  }
}

/**
 * Performance metrics tracker
 */
export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();
  private marks: Map<string, number> = new Map();

  /**
   * Start timing a operation
   */
  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End timing and record the duration
   */
  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start time found for metric: ${name}`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Store the duration
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    // Clean up
    this.marks.delete(name);

    return duration;
  }

  /**
   * Get statistics for a metric
   */
  getStats(name: string): {
    average: number;
    min: number;
    max: number;
    count: number;
    last: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const last = values[values.length - 1];

    return {
      average,
      min,
      max,
      count: values.length,
      last
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.marks.clear();
  }

  /**
   * Get all tracked metrics
   */
  getAllMetrics(): Map<string, number[]> {
    return new Map(this.metrics);
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private samples: number[] = [];
  private maxSamples: number = 100;

  /**
   * Take a memory usage sample
   */
  sample(): number {
    // ✅ FIXED: Use type assertion for memory API
    const memory = (performance as any).memory as MemoryInfo | undefined;
    if (memory) {
      const used = memory.usedJSHeapSize;
      this.samples.push(used);
      
      // Keep only the most recent samples
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      
      return used;
    }
    return 0;
  }

  /**
   * Get memory usage statistics
   */
  getStats(): {
    current: number;
    average: number;
    max: number;
    min: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.samples.length === 0) {
      return {
        current: 0,
        average: 0,
        max: 0,
        min: 0,
        trend: 'stable'
      };
    }

    const current = this.samples[this.samples.length - 1];
    const average = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const max = Math.max(...this.samples);
    const min = Math.min(...this.samples);

    // Calculate trend
    const recentSamples = this.samples.slice(-5);
    const trend = recentSamples.length >= 2 
      ? recentSamples[recentSamples.length - 1] > recentSamples[0] 
        ? 'increasing' 
        : 'decreasing'
      : 'stable';

    return {
      current,
      average,
      max,
      min,
      trend
    };
  }

  /**
   * Get memory usage in MB
   */
  getMemoryInMB(): {
    current: number;
    average: number;
    max: number;
    min: number;
  } {
    const bytesToMB = (bytes: number) => Math.round(bytes / 1024 / 1024);
    const stats = this.getStats();
    
    return {
      current: bytesToMB(stats.current),
      average: bytesToMB(stats.average),
      max: bytesToMB(stats.max),
      min: bytesToMB(stats.min)
    };
  }

  /**
   * Clear all samples
   */
  clear(): void {
    this.samples = [];
  }
}

/**
 * Frame rate monitor
 */
export class FrameRateMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  private samples: number[] = [];
  private maxSamples: number = 60;

  /**
   * Update frame count (call this every frame)
   */
  update(): void {
    this.frameCount++;
    
    const currentTime = performance.now();
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.samples.push(this.fps);
      
      // Keep only the most recent samples
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get FPS statistics
   */
  getStats(): {
    current: number;
    average: number;
    min: number;
    max: number;
    stable: boolean;
  } {
    if (this.samples.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        stable: false
      };
    }

    const current = this.samples[this.samples.length - 1];
    const average = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const min = Math.min(...this.samples);
    const max = Math.max(...this.samples);
    
    // Consider stable if variance is low
    const variance = this.samples.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / this.samples.length;
    const stable = variance < 10;

    return {
      current,
      average,
      min,
      max,
      stable
    };
  }

  /**
   * Clear all samples
   */
  clear(): void {
    this.samples = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
  }
}

/**
 * Debounced function with performance tracking
 */
export const debounced = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  tracker?: PerformanceTracker
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  const trackName = `debounced_${func.name || 'anonymous'}`;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    
    if (tracker) {
      tracker.start(trackName);
    }
    
    timeout = setTimeout(() => {
      func.apply(null, args);
      
      if (tracker) {
        tracker.end(trackName);
      }
    }, wait);
  };
};

/**
 * Throttled function with performance tracking
 */
export const throttled = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  tracker?: PerformanceTracker
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  const trackName = `throttled_${func.name || 'anonymous'}`;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      if (tracker) {
        tracker.start(trackName);
      }
      
      func.apply(null, args);
      
      if (tracker) {
        tracker.end(trackName);
      }
      
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Measure execution time of a function
 */
export const measureExecution = <T extends (...args: any[]) => any>(
  func: T,
  ...args: Parameters<T>
): { result: ReturnType<T>; duration: number } => {
  const start = performance.now();
  const result = func.apply(null, args);
  const duration = performance.now() - start;
  
  return { result, duration };
};

/**
 * Async version of measureExecution
 */
export const measureExecutionAsync = async <T extends (...args: any[]) => Promise<any>>(
  func: T,
  ...args: Parameters<T>
): Promise<{ result: Awaited<ReturnType<T>>; duration: number }> => {
  const start = performance.now();
  const result = await func.apply(null, args);
  const duration = performance.now() - start;
  
  return { result, duration };
};

/**
 * Check if the browser supports performance APIs
 */
export const supportsPerformanceAPI = (): boolean => {
  return (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function' &&
    typeof performance.mark === 'function' &&
    typeof performance.measure === 'function'
  );
};

/**
 * Check if the browser supports memory monitoring
 */
export const supportsMemoryAPI = (): boolean => {
  const memory = (performance as any).memory as MemoryInfo | undefined;
  return (
    typeof performance !== 'undefined' &&
    memory !== undefined &&
    typeof memory.usedJSHeapSize === 'number'
  );
};

/**
 * Create a performance budget monitor
 */
export class PerformanceBudget {
  private budgets: Map<string, number> = new Map();
  private violations: Map<string, number> = new Map();

  /**
   * Set a performance budget for a metric
   */
  setBudget(metric: string, maxValue: number): void {
    this.budgets.set(metric, maxValue);
  }

  /**
   * Check if a value violates the budget
   */
  check(metric: string, value: number): boolean {
    const budget = this.budgets.get(metric);
    if (budget === undefined) return false;

    const violates = value > budget;
    if (violates) {
      const currentViolations = this.violations.get(metric) || 0;
      this.violations.set(metric, currentViolations + 1);
    }

    return violates;
  }

  /**
   * Get violation statistics
   */
  getViolations(): Map<string, number> {
    return new Map(this.violations);
  }

  /**
   * Clear all violations
   */
  clearViolations(): void {
    this.violations.clear();
  }

  /**
   * Get all budgets
   */
  getBudgets(): Map<string, number> {
    return new Map(this.budgets);
  }
}

/**
 * System resource monitor
 */
export class SystemResourceMonitor {
  private memoryMonitor: MemoryMonitor;
  private frameRateMonitor: FrameRateMonitor;
  private performanceTracker: PerformanceTracker;

  constructor() {
    this.memoryMonitor = new MemoryMonitor();
    this.frameRateMonitor = new FrameRateMonitor();
    this.performanceTracker = new PerformanceTracker();
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    const memoryStats = this.memoryMonitor.getMemoryInMB();
    const fpsStats = this.frameRateMonitor.getStats();
    
    return {
      memory: memoryStats,
      fps: fpsStats,
      performance: {
        supportsMemoryAPI: supportsMemoryAPI(),
        supportsPerformanceAPI: supportsPerformanceAPI(),
        timestamp: Date.now()
      }
    };
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    // Start memory sampling
    const memoryInterval = setInterval(() => {
      this.memoryMonitor.sample();
    }, 1000);

    // Start frame rate monitoring
    const updateFrameRate = () => {
      this.frameRateMonitor.update();
      requestAnimationFrame(updateFrameRate);
    };
    requestAnimationFrame(updateFrameRate);

    return {
      stop: () => {
        clearInterval(memoryInterval);
      }
    };
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceTracker = new PerformanceTracker();
export const globalMemoryMonitor = new MemoryMonitor();
export const globalFrameRateMonitor = new FrameRateMonitor();
export const globalPerformanceBudget = new PerformanceBudget();
export const globalSystemMonitor = new SystemResourceMonitor();

// Set default performance budgets
globalPerformanceBudget.setBudget('frame_time', 16.67); // 60 FPS
globalPerformanceBudget.setBudget('memory_usage', 50 * 1024 * 1024); // 50MB
globalPerformanceBudget.setBudget('detection_time', 100); // 100ms
globalPerformanceBudget.setBudget('network_request', 5000); // 5 seconds

/**
 * Initialize performance monitoring
 */
export const initializePerformanceMonitoring = (): void => {
  if (supportsPerformanceAPI()) {
    console.log('✅ Performance API supported');
  } else {
    console.warn('⚠️ Performance API not supported');
  }

  if (supportsMemoryAPI()) {
    console.log('✅ Memory API supported');
    
    // Start memory monitoring
    setInterval(() => {
      globalMemoryMonitor.sample();
    }, 1000);
  } else {
    console.warn('⚠️ Memory API not supported');
  }

  // Start frame rate monitoring
  const updateFrameRate = () => {
    globalFrameRateMonitor.update();
    requestAnimationFrame(updateFrameRate);
  };
  requestAnimationFrame(updateFrameRate);

  console.log('🎯 Performance monitoring initialized');
};

/**
 * Performance monitoring hook for React components
 */
import React from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({
    memory: { current: 0, average: 0, max: 0, min: 0 },
    fps: { current: 0, average: 0, min: 0, max: 0, stable: false }
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const memoryStats = globalMemoryMonitor.getMemoryInMB();
      const fpsStats = globalFrameRateMonitor.getStats();
      
      setMetrics({
        memory: memoryStats,
        fps: fpsStats
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

/**
 * Export performance utilities
 */
export default {
  PerformanceTracker,
  MemoryMonitor,
  FrameRateMonitor,
  PerformanceBudget,
  SystemResourceMonitor,
  measureExecution,
  measureExecutionAsync,
  debounced,
  throttled,
  supportsPerformanceAPI,
  supportsMemoryAPI,
  initializePerformanceMonitoring,
  
  // Global instances
  tracker: globalPerformanceTracker,
  memory: globalMemoryMonitor,
  fps: globalFrameRateMonitor,
  budget: globalPerformanceBudget,
  system: globalSystemMonitor
};