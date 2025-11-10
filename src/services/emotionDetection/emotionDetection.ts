import { WebSocketService } from '../websocket/websocket';

// Mock enhanced emotion detector (replace with your actual implementation)
class EnhancedEmotionDetector {
  private isModelLoaded: boolean = false;

  async initialize(): Promise<boolean> {
    // Simulate model loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.isModelLoaded = true;
    return true;
  }

  async detectEnhancedEmotion(videoElement: HTMLVideoElement): Promise<any> {
    if (!this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    // Simulate emotion detection
    const emotions = ['happy', 'sad', 'neutral', 'anxious', 'stressed'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      emotion: randomEmotion,
      confidence: Math.random() * 0.5 + 0.5,
      all: emotions.reduce((acc, emotion) => {
        acc[emotion] = emotion === randomEmotion ? 0.8 : Math.random() * 0.2;
        return acc;
      }, {} as any)
    };
  }

  getModelStatus(): string {
    return this.isModelLoaded ? 'loaded' : 'not-loaded';
  }
}

export const enhancedEmotionDetector = new EnhancedEmotionDetector();

export class EmotionDetector {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isDetecting = false;
  private stream: MediaStream | null = null;
  private webSocketService: WebSocketService;

  constructor(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
  }

  async initialize(): Promise<boolean> {
    try {
      const cameraSuccess = await this.setupCamera();
      if (!cameraSuccess) {
        console.warn('Camera access failed, using simulated data');
        return true; // Continue with simulated data
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
      // Check camera permissions first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported');
      }

      // Request camera with specific constraints
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
      });
    } catch (error) {
      console.error('Camera access denied or not available:', error);
      return false;
    }
  }

  startDetection() {
    this.isDetecting = true;
    this.detectEmotions();
  }

  stopDetection() {
    this.isDetecting = false;
  }

  private async detectEmotions() {
    if (!this.isDetecting) return;

    try {
      let emotionResult;

      if (this.videoElement && enhancedEmotionDetector) {
        // Use enhanced detection if camera is available
        emotionResult = await enhancedEmotionDetector.detectEnhancedEmotion(this.videoElement);
      } else {
        // Fallback to simulated data
        emotionResult = this.getSimulatedEmotion();
      }

      if (emotionResult && this.webSocketService.isConnected()) {
        this.webSocketService.sendMessage('EMOTION_UPDATE', {
          emotion: emotionResult.emotion,
          confidence: emotionResult.confidence,
          timestamp: Date.now(),
          allEmotions: emotionResult.all
        });
      }

      if (this.isDetecting) {
        setTimeout(() => this.detectEmotions(), 1000); // Check every second
      }
    } catch (error) {
      console.error('Emotion detection error:', error);
      
      // Fallback to simulated data on error
      if (this.isDetecting) {
        setTimeout(() => this.detectEmotions(), 1000);
      }
    }
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
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.videoElement = null;
    this.stream = null;
  }

  // Method to check camera status
  getCameraStatus(): 'available' | 'unavailable' | 'blocked' {
    if (this.stream) return 'available';
    return 'unavailable';
  }

  getDetectionStatus() {
    return {
      isDetecting: this.isDetecting,
      cameraStatus: this.getCameraStatus(),
      modelStatus: enhancedEmotionDetector.getModelStatus()
    };
  }
}

// Create and export instance
export const emotionDetector = new EmotionDetector(new WebSocketService('ws://localhost:3000'));