import { useState, useEffect, useRef, useCallback } from 'react';
import { performanceEmotionDetector } from '../services/emotionDetection/performanceEmotionDetection';

export const useEmotionDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'available' | 'unavailable' | 'blocked'>('checking');
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const initializeDetection = useCallback(async () => {
    try {
      setCameraStatus('checking');
      setInitializationError(null);
      
      console.log('Initializing emotion detection...');
      
      const success = await performanceEmotionDetector.initialize();
      setIsInitialized(success);
      
      if (success) {
        const cameraStatus = performanceEmotionDetector.getCameraStatus();
        setCameraStatus(cameraStatus);
        
        console.log('✅ Emotion detection initialized successfully');
      } else {
        setCameraStatus('unavailable');
        setInitializationError('Failed to initialize emotion detection');
        console.error('❌ Emotion detection initialization failed');
      }
    } catch (error) {
      console.error('Failed to initialize emotion detection:', error);
      setCameraStatus('unavailable');
      setInitializationError(error instanceof Error ? error.message : 'Unknown error');
      setIsInitialized(false);
    }
  }, []);

  const startDetection = useCallback(() => {
    if (!isInitialized) {
      console.warn('Emotion detection not initialized');
      return;
    }
    
    try {
      performanceEmotionDetector.startDetection();
      setIsDetecting(true);
      console.log('🎯 Emotion detection started');
    } catch (error) {
      console.error('Failed to start emotion detection:', error);
      setIsDetecting(false);
    }
  }, [isInitialized]);

  const stopDetection = useCallback(() => {
    performanceEmotionDetector.stopDetection();
    setIsDetecting(false);
    console.log('⏹️ Emotion detection stopped');
  }, []);

  const toggleDetection = useCallback(() => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  }, [isDetecting, startDetection, stopDetection]);

  const startPerformanceMonitoring = useCallback(() => {
    const interval = setInterval(() => {
      const metrics = performanceEmotionDetector.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getDetectionStatus = useCallback(() => {
    return {
      isInitialized,
      isDetecting,
      cameraStatus,
      performanceMetrics,
      initializationError,
      performanceData: performanceEmotionDetector.getPerformanceData()
    };
  }, [isInitialized, isDetecting, cameraStatus, performanceMetrics, initializationError]);

  useEffect(() => {
    initializeDetection();
    
    return () => {
      performanceEmotionDetector.cleanup();
    };
  }, [initializeDetection]);

  useEffect(() => {
    if (isDetecting) {
      const cleanup = startPerformanceMonitoring();
      return cleanup;
    }
  }, [isDetecting, startPerformanceMonitoring]);

  return {
    isInitialized,
    isDetecting,
    cameraStatus,
    performanceMetrics,
    initializationError,
    videoRef,
    
    startDetection,
    stopDetection,
    toggleDetection,
    initializeDetection,
    
    getDetectionStatus,
    
    canStartDetection: isInitialized && !isDetecting,
    canStopDetection: isInitialized && isDetecting,
    hasCamera: cameraStatus === 'available',
    isInitializing: cameraStatus === 'checking'
  };
};

export const useEmotionDetectionWithVideo = (showVideo: boolean = false) => {
  const emotionDetection = useEmotionDetection();
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showVideo && videoContainerRef.current && emotionDetection.videoRef.current) {
      videoContainerRef.current.appendChild(emotionDetection.videoRef.current);
    }
  }, [showVideo]);

  return {
    ...emotionDetection,
    videoContainerRef
  };
};

export default useEmotionDetection;