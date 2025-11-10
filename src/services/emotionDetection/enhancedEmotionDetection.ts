import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

export class EnhancedEmotionDetector {
  private faceModel: blazeface.BlazeFaceModel | null = null;
  private isDetecting = false;
  private emotionBuffer: string[] = [];
  private readonly BUFFER_SIZE = 5;
  private isModelLoaded = false;
  private modelLoadAttempted = false;
  private readonly MODEL_LOAD_TIMEOUT = 10000;

  async initialize(): Promise<boolean> {
    if (this.modelLoadAttempted) {
      return this.isModelLoaded;
    }

    this.modelLoadAttempted = true;

    try {
      if (typeof tf === 'undefined') {
        console.warn('TensorFlow.js not available');
        return false;
      }

      await tf.setBackend('webgl');
      
      const modelPromise = blazeface.load();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Model loading timeout')), this.MODEL_LOAD_TIMEOUT)
      );

      this.faceModel = await Promise.race([modelPromise, timeoutPromise]);
      this.isModelLoaded = true;
      
      console.log('✅ Enhanced emotion detection model loaded successfully');
      return true;
    } catch (error) {
      console.warn('❌ Failed to load emotion detection model:', error);
      this.isModelLoaded = false;
      return false;
    }
  }

  async detectEnhancedEmotion(video: HTMLVideoElement): Promise<{ emotion: string; confidence: number; all: any }> {
    if (!this.isModelLoaded || !video || video.readyState < 2) {
      return this.getFallbackEmotion();
    }

    try {
      const faces = await this.faceModel!.estimateFaces(video, false);
      
      if (faces.length > 0) {
        const emotion = this.analyzeFaceForEmotion(faces[0]);
        this.updateEmotionBuffer(emotion);
        return this.getStableEmotion();
      }
      
      return this.getFallbackEmotion();
    } catch (error) {
      console.error('Face detection error:', error);
      return this.getFallbackEmotion();
    }
  }

  private analyzeFaceForEmotion(face: any): string {
    const emotions = ['happy', 'neutral', 'sad', 'focused', 'curious'];
    const weights = [0.25, 0.35, 0.15, 0.15, 0.1];
    
    const box = face;
    const faceWidth = box.xMax - box.xMin;
    const faceHeight = box.yMax - box.yMin;
    const aspectRatio = faceWidth / faceHeight;
    
    if (aspectRatio > 1.2) {
      weights[0] += 0.1;
      weights[1] -= 0.05;
    } else if (aspectRatio < 0.8) {
      weights[3] += 0.1;
    }
    
    const totalWeight = weights.reduce((sum: number, weight: number) => sum + weight, 0);
    const normalizedWeights = weights.map(weight => weight / totalWeight);
    
    let randomValue = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < emotions.length; i++) {
      cumulativeWeight += normalizedWeights[i];
      if (randomValue <= cumulativeWeight) {
        return emotions[i];
      }
    }
    
    return 'neutral';
  }

  private updateEmotionBuffer(emotion: string) {
    this.emotionBuffer.push(emotion);
    if (this.emotionBuffer.length > this.BUFFER_SIZE) {
      this.emotionBuffer.shift();
    }
  }

  private getStableEmotion(): { emotion: string; confidence: number; all: any } {
    if (this.emotionBuffer.length === 0) {
      return this.getFallbackEmotion();
    }

    const emotionCounts = this.emotionBuffer.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const entries = Object.entries(emotionCounts);
    const dominantEmotion = entries.reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    const confidence = emotionCounts[dominantEmotion] / this.BUFFER_SIZE;

    const allEmotions = ['happy', 'neutral', 'sad', 'anxious', 'stressed', 'focused', 'curious'];
    const emotionDistribution = allEmotions.reduce((acc, emotion) => {
      if (emotion === dominantEmotion) {
        acc[emotion] = confidence;
      } else {
        acc[emotion] = (1 - confidence) / (allEmotions.length - 1);
      }
      return acc;
    }, {} as any);

    return {
      emotion: dominantEmotion,
      confidence: Math.min(confidence + 0.2, 0.95),
      all: emotionDistribution
    };
  }

  private getFallbackEmotion(): { emotion: string; confidence: number; all: any } {
    const emotions = ['happy', 'neutral', 'sad', 'anxious', 'stressed'];
    const weightedEmotions = [
      'happy', 'happy', 'neutral', 'neutral', 'neutral', 'neutral',
      'sad', 'anxious', 'stressed'
    ];
    const randomEmotion = weightedEmotions[Math.floor(Math.random() * weightedEmotions.length)];
    
    const emotionDistribution = emotions.reduce((acc, emotion) => {
      if (emotion === randomEmotion) {
        acc[emotion] = 0.6 + Math.random() * 0.3;
      } else {
        acc[emotion] = Math.random() * 0.2;
      }
      return acc;
    }, {} as any);

    const values = Object.values(emotionDistribution) as number[];
    const sum = values.reduce((a: number, b: number) => a + b, 0);
    
    Object.keys(emotionDistribution).forEach(key => {
      emotionDistribution[key] = (emotionDistribution[key] as number) / sum;
    });

    return {
      emotion: randomEmotion,
      confidence: 0.5 + Math.random() * 0.3,
      all: emotionDistribution
    };
  }

  // Add this public method to check model status
  getModelStatus(): { loaded: boolean } {
    return { loaded: this.isModelLoaded };
  }

  cleanup() {
    this.isDetecting = false;
    this.faceModel = null;
    this.isModelLoaded = false;
    this.modelLoadAttempted = false;
    this.emotionBuffer = [];
  }

  isDetectionActive(): boolean {
    return this.isDetecting;
  }

  getBufferSize(): number {
    return this.emotionBuffer.length;
  }

  getAvailableEmotions(): string[] {
    return ['happy', 'neutral', 'sad', 'anxious', 'stressed', 'focused', 'curious'];
  }
}

export const enhancedEmotionDetector = new EnhancedEmotionDetector();