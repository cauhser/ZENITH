interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
declare global {
  interface Performance {
    memory?: MemoryInfo;
  }
}
export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();
  private marks: Map<string, number> = new Map();
  start(name: string): void {
    this.marks.set(name, performance.now());
  }
  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start time found for metric: ${name}`);
      return 0;
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    this.marks.delete(name);
    return duration;
  }
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
  clear(): void {
    this.metrics.clear();
    this.marks.clear();
  }
  getAllMetrics(): Map<string, number[]> {
    return new Map(this.metrics);
  }
}
export class MemoryMonitor {
  private samples: number[] = [];
  private maxSamples: number = 100;
  sample(): number {
    const memory = (performance as any).memory as MemoryInfo | undefined;
    if (memory) {
      const used = memory.usedJSHeapSize;
      this.samples.push(used);
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      return used;
    }
    return 0;
  }
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
  clear(): void {
    this.samples = [];
  }
}
export class FrameRateMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  private samples: number[] = [];
  private maxSamples: number = 60;
  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.samples.push(this.fps);
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }
  getFPS(): number {
    return this.fps;
  }
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
  clear(): void {
    this.samples = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
  }
}
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
export const measureExecution = <T extends (...args: any[]) => any>(
  func: T,
  ...args: Parameters<T>
): { result: ReturnType<T>; duration: number } => {
  const start = performance.now();
  const result = func.apply(null, args);
  const duration = performance.now() - start;
  return { result, duration };
};
export const measureExecutionAsync = async <T extends (...args: any[]) => Promise<any>>(
  func: T,
  ...args: Parameters<T>
): Promise<{ result: Awaited<ReturnType<T>>; duration: number }> => {
  const start = performance.now();
  const result = await func.apply(null, args);
  const duration = performance.now() - start;
  return { result, duration };
};
export const supportsPerformanceAPI = (): boolean => {
  return (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function' &&
    typeof performance.mark === 'function' &&
    typeof performance.measure === 'function'
  );
};
export const supportsMemoryAPI = (): boolean => {
  const memory = (performance as any).memory as MemoryInfo | undefined;
  return (
    typeof performance !== 'undefined' &&
    memory !== undefined &&
    typeof memory.usedJSHeapSize === 'number'
  );
};
export class PerformanceBudget {
  private budgets: Map<string, number> = new Map();
  private violations: Map<string, number> = new Map();
  setBudget(metric: string, maxValue: number): void {
    this.budgets.set(metric, maxValue);
  }
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
  getViolations(): Map<string, number> {
    return new Map(this.violations);
  }
  clearViolations(): void {
    this.violations.clear();
  }
  getBudgets(): Map<string, number> {
    return new Map(this.budgets);
  }
}
export class SystemResourceMonitor {
  private memoryMonitor: MemoryMonitor;
  private frameRateMonitor: FrameRateMonitor;
  private performanceTracker: PerformanceTracker;
  constructor() {
    this.memoryMonitor = new MemoryMonitor();
    this.frameRateMonitor = new FrameRateMonitor();
    this.performanceTracker = new PerformanceTracker();
  }
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
  startMonitoring() {
    const memoryInterval = setInterval(() => {
      this.memoryMonitor.sample();
    }, 1000);
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
export const globalPerformanceTracker = new PerformanceTracker();
export const globalMemoryMonitor = new MemoryMonitor();
export const globalFrameRateMonitor = new FrameRateMonitor();
export const globalPerformanceBudget = new PerformanceBudget();
export const globalSystemMonitor = new SystemResourceMonitor();
globalPerformanceBudget.setBudget('frame_time', 16.67); 
globalPerformanceBudget.setBudget('memory_usage', 50 * 1024 * 1024); 
globalPerformanceBudget.setBudget('detection_time', 100); 
globalPerformanceBudget.setBudget('network_request', 5000); 
export const initializePerformanceMonitoring = (): void => {
  if (supportsPerformanceAPI()) {
    console.log('✅ Performance API supported');
  } else {
    console.warn('⚠️ Performance API not supported');
  }
  if (supportsMemoryAPI()) {
    console.log('✅ Memory API supported');
    setInterval(() => {
      globalMemoryMonitor.sample();
    }, 1000);
  } else {
    console.warn('⚠️ Memory API not supported');
  }
  const updateFrameRate = () => {
    globalFrameRateMonitor.update();
    requestAnimationFrame(updateFrameRate);
  };
  requestAnimationFrame(updateFrameRate);
  console.log('🎯 Performance monitoring initialized');
};
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
  tracker: globalPerformanceTracker,
  memory: globalMemoryMonitor,
  fps: globalFrameRateMonitor,
  budget: globalPerformanceBudget,
  system: globalSystemMonitor
};