import { websocketService } from '../../websocket';
import { enhancedEmotionDetector } from './enhancedEmotionDetection';
export class PerformanceEmotionDetector {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isDetecting = false;
  private stream: MediaStream | null = null;
  private detectionTimes: number[] = [];
  private readonly MAX_DETECTION_SAMPLES = 100;
  private performanceMonitor: NodeJS.Timeout | null = null;
  async initialize(): Promise<boolean> {
    try {
      const cameraSuccess = await this.setupCamera();
      if (!cameraSuccess) {
        console.warn('Camera access failed, using simulated data');
        return true;
      }
      const modelSuccess = await enhancedEmotionDetector.initialize();
      return modelSuccess;
    } catch (error) {
      console.error('Failed to initialize emotion detection:', error);
      return false;
    }
  }
  private async setupCamera(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported');
      }
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        } 
      });
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.playsInline = true;
      this.canvasElement = document.createElement('canvas');
      this.context = this.canvasElement.getContext('2d');
      return new Promise((resolve) => {
        this.videoElement!.onloadedmetadata = () => {
          this.canvasElement!.width = this.videoElement!.videoWidth;
          this.canvasElement!.height = this.videoElement!.videoHeight;
          this.videoElement!.play();
          resolve(true);
        };
        this.videoElement!.onerror = () => {
          console.error('Video element error');
          resolve(false);
        };
        setTimeout(() => {
          if (this.videoElement!.readyState >= 1) {
            resolve(true);
          } else {
            resolve(false);
          }
        }, 3000);
      });
    } catch (error) {
      console.error('Camera access denied or not available:', error);
      return false;
    }
  }
  startDetection() {
    if (this.isDetecting) return;
    this.isDetecting = true;
    this.startPerformanceMonitoring();
    this.detectEmotions();
  }
  stopDetection() {
    this.isDetecting = false;
    this.stopPerformanceMonitoring();
  }
  private async detectEmotions() {
    if (!this.isDetecting) return;
    const startTime = performance.now();
    try {
      let emotionResult;
      if (this.videoElement && enhancedEmotionDetector.getModelStatus().loaded) {
        emotionResult = await enhancedEmotionDetector.detectEnhancedEmotion(this.videoElement);
      } else {
        emotionResult = this.getSimulatedEmotion();
      }
      const detectionTime = performance.now() - startTime;
      this.recordDetectionTime(detectionTime);
      if (emotionResult && websocketService.isConnected()) {
        websocketService.sendMessage('EMOTION_UPDATE', {
          ...emotionResult,
          detectionTime,
          timestamp: Date.now(),
          modelUsed: enhancedEmotionDetector.getModelStatus().loaded ? 'enhanced' : 'simulated',
          performance: this.getPerformanceMetrics()
        });
      }
    } catch (error) {
      console.error('Emotion detection error:', error);
    } finally {
      if (this.isDetecting) {
        const nextDetectionDelay = this.calculateNextDetectionDelay();
        setTimeout(() => this.detectEmotions(), nextDetectionDelay);
      }
    }
  }
  private recordDetectionTime(time: number) {
  this.detectionTimes.push(time);
  if (this.detectionTimes.length > this.MAX_DETECTION_SAMPLES) { 
    this.detectionTimes.shift();
  }
}
  private calculateNextDetectionDelay(): number {
    if (this.detectionTimes.length === 0) return 1000;
    const averageTime = this.detectionTimes.reduce((a, b) => a + b, 0) / this.detectionTimes.length;
    if (averageTime > 500) {
      return 2000;
    } else if (averageTime < 100) {
      return 500;
    }
    return 1000;
  }
  private startPerformanceMonitoring() {
    this.performanceMonitor = setInterval(() => {
      const metrics = this.getPerformanceMetrics();
      if (metrics) {
        console.log('Emotion Detection Performance:', metrics);
      }
    }, 10000);
  }
  private stopPerformanceMonitoring() {
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
      this.performanceMonitor = null;
    }
  }
  getPerformanceMetrics() {
    if (this.detectionTimes.length === 0) return null;
    const times = this.detectionTimes;
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);
    const recentTimes = times.slice(-10);
    const recentAverage = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
    return {
      averageDetectionTime: average,
      maxDetectionTime: max,
      minDetectionTime: min,
      recentAverageDetectionTime: recentAverage,
      sampleSize: times.length,
      fps: 1000 / average,
      detectionFrequency: this.calculateNextDetectionDelay()
    };
  }
  private getSimulatedEmotion() {
    const emotions = ['happy', 'sad', 'neutral', 'anxious', 'stressed'];
    const weightedEmotions = [
      'happy', 'happy', 'neutral', 'neutral', 'neutral', 
      'sad', 'anxious', 'stressed'
    ];
    const randomEmotion = weightedEmotions[Math.floor(Math.random() * weightedEmotions.length)];
    return {
      emotion: randomEmotion,
      confidence: 0.7,
      all: emotions.reduce((acc, emotion) => {
        acc[emotion] = emotion === randomEmotion ? 0.8 : Math.random() * 0.3;
        return acc;
      }, {} as any)
    };
  }
  cleanup() {
    this.stopDetection();
    this.stopPerformanceMonitoring();
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.videoElement = null;
    this.stream = null;
    this.detectionTimes = [];
    enhancedEmotionDetector.cleanup();
  }
  getCameraStatus(): 'available' | 'unavailable' | 'blocked' {
    if (this.stream) return 'available';
    return 'unavailable';
  }
  isDetectionActive(): boolean {
    return this.isDetecting;
  }
  getPerformanceData() {
    return {
      isDetecting: this.isDetecting,
      detectionTimes: [...this.detectionTimes],
      metrics: this.getPerformanceMetrics(),
      modelLoaded: enhancedEmotionDetector.getModelStatus().loaded,
      cameraAvailable: !!this.stream
    };
  }
}
export const performanceEmotionDetector = new PerformanceEmotionDetector();