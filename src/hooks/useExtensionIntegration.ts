import { useState, useEffect, useRef, useCallback } from 'react';

export interface ExtensionStatus {
  isAvailable: boolean;
  isConnected: boolean;
  permissions: {
    contentAnalysis: boolean;
    eyeTracking: boolean;
    emotionDetection: boolean;
    dataCollection: boolean;
    permissionsAsked: boolean;
  } | null;
  version: string | null;
  lastSync: number | null;
}

export interface AnalyticsData {
  url: string;
  title: string;
  triggers: string[];
  timestamp: number;
  sentiment: {
    score: number;
    positive: number;
    negative: number;
    total: number;
  };
  aiAnalysis?: {
    sentiment: string;
    confidence: number;
    riskLevel: string;
    summary: string;
  };
}

export const useExtensionIntegration = () => {
  const [status, setStatus] = useState<ExtensionStatus>({
    isAvailable: false,
    isConnected: false,
    permissions: null,
    version: null,
    lastSync: null
  });

  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extensionRef = useRef<any>(null);

  // Check if extension is available
  const checkExtensionAvailability = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    const isAvailable = 
      typeof chrome !== 'undefined' && 
      chrome.runtime && 
      typeof chrome.runtime.sendMessage === 'function';
    
    setStatus(prev => ({ ...prev, isAvailable }));
    
    if (isAvailable && window.ZenithExtension) {
      extensionRef.current = window.ZenithExtension;
      setStatus(prev => ({ ...prev, isConnected: true }));
    }
    
    return isAvailable;
  }, []);

  // Initialize extension connection
  const initializeExtension = useCallback(async () => {
    if (!checkExtensionAvailability()) {
      setError('Chrome extension runtime not available');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to use global extension instance first
      if (window.ZenithExtension) {
        extensionRef.current = window.ZenithExtension;
        const connectionStatus = extensionRef.current.getConnectionStatus();
        
        setStatus(prev => ({
          ...prev,
          isConnected: connectionStatus.isConnected,
          permissions: connectionStatus.permissions,
          version: connectionStatus.version
        }));

        if (connectionStatus.isConnected) {
          await loadExtensionData();
          return true;
        }
      }

      // Fallback: direct messaging
      const response = await sendMessageToExtension({ type: 'PING' });
      if (response?.status === 'pong') {
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          version: response.version,
          lastSync: Date.now()
        }));

        await loadPermissions();
        await loadAnalyticsData();
        return true;
      } else {
        throw new Error('Extension did not respond correctly');
      }

    } catch (error) {
      console.error('Failed to initialize extension:', error);
      setError(error instanceof Error ? error.message : 'Extension connection failed');
      setStatus(prev => ({ ...prev, isConnected: false }));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message to extension
  const sendMessageToExtension = useCallback(async (message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime?.sendMessage) {
        reject(new Error('Chrome runtime not available'));
        return;
      }

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  // Load permissions from extension
  const loadPermissions = useCallback(async () => {
    try {
      const response = await sendMessageToExtension({ type: 'GET_PERMISSIONS' });
      if (response?.permissions) {
        setStatus(prev => ({
          ...prev,
          permissions: response.permissions
        }));
        return response.permissions;
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
    return null;
  }, [sendMessageToExtension]);

  // Load analytics data from extension
  const loadAnalyticsData = useCallback(async () => {
    if (!status.permissions?.dataCollection) {
      console.log('Data collection not permitted');
      return;
    }

    try {
      setIsLoading(true);
      const response = await sendMessageToExtension({ type: 'GET_ANALYTICS_DATA' });
      
      if (response?.analytics) {
        const realData = response.analytics.filter((item: AnalyticsData) => 
          !item.url.includes('example.com') && !item.url.includes('test-content')
        );
        
        setAnalytics(realData);
        setStatus(prev => ({ ...prev, lastSync: Date.now() }));
        
        console.log(`✅ Loaded ${realData.length} analytics records from extension`);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setError('Failed to load data from extension');
    } finally {
      setIsLoading(false);
    }
  }, [sendMessageToExtension, status.permissions?.dataCollection]);

  // Load all extension data
  const loadExtensionData = useCallback(async () => {
    await loadPermissions();
    await loadAnalyticsData();
  }, [loadPermissions, loadAnalyticsData]);

  // Trigger content analysis on current page
  const triggerContentAnalysis = useCallback(async () => {
    if (!status.isConnected || !status.permissions?.contentAnalysis) {
      setError('Content analysis not permitted or extension not connected');
      return false;
    }

    try {
      const response = await sendMessageToExtension({ type: 'ANALYZE_PAGE' });
      
      if (response?.status === 'analysis_triggered') {
        // Wait a bit and reload data
        setTimeout(() => {
          loadAnalyticsData();
        }, 2000);
        
        return true;
      } else {
        throw new Error(response?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Failed to trigger content analysis:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      return false;
    }
  }, [status.isConnected, status.permissions?.contentAnalysis, sendMessageToExtension, loadAnalyticsData]);

  // Export data from extension
  const exportExtensionData = useCallback(async () => {
    try {
      const dataStr = JSON.stringify(analytics, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenith-wellness-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Export failed');
      return false;
    }
  }, [analytics]);

  // Clear extension data
  const clearExtensionData = useCallback(async () => {
    try {
      const response = await sendMessageToExtension({ type: 'CLEAR_DATA' });
      
      if (response?.success) {
        setAnalytics([]);
        setStatus(prev => ({ ...prev, lastSync: Date.now() }));
        return true;
      }
    } catch (error) {
      console.error('Failed to clear data:', error);
      setError('Failed to clear data');
      return false;
    }
  }, [sendMessageToExtension]);

  // Request permissions from user
  const requestPermissions = useCallback(() => {
    if (!status.isAvailable) {
      setError('Extension not available');
      return;
    }

    chrome.tabs.create({
      url: chrome.runtime.getURL('permission-request.html')
    });
  }, [status.isAvailable]);

  // Listen for extension events
  useEffect(() => {
    const handleExtensionEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'EXTENSION_CONNECTED':
          setStatus(prev => ({
            ...prev,
            isConnected: true,
            permissions: data.permissions,
            version: data.version
          }));
          break;
          
        case 'EXTENSION_DISCONNECTED':
          setStatus(prev => ({ ...prev, isConnected: false }));
          setError(data.error || 'Extension disconnected');
          break;
          
        case 'PERMISSIONS_UPDATED':
          setStatus(prev => ({
            ...prev,
            permissions: data.permissions
          }));
          break;
          
        case 'NEW_ANALYSIS_DATA':
          setAnalytics(prev => [data.analysis, ...prev].slice(0, 1000));
          break;
          
        case 'ANALYTICS_UPDATED':
          if (data.newValue) {
            setAnalytics(data.newValue);
          }
          break;
      }
    };

    window.addEventListener('zenith-extension-event', handleExtensionEvent as EventListener);

    return () => {
      window.removeEventListener('zenith-extension-event', handleExtensionEvent as EventListener);
    };
  }, []);

  // Initialize on component mount
  useEffect(() => {
    initializeExtension();
  }, [initializeExtension]);

  // Auto-refresh data when connected
  useEffect(() => {
    if (!status.isConnected || !status.permissions?.dataCollection) return;

    const interval = setInterval(() => {
      loadAnalyticsData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [status.isConnected, status.permissions?.dataCollection, loadAnalyticsData]);

  // Calculate analytics metrics
  const analyticsMetrics = {
    totalPages: analytics.length,
    totalTriggers: analytics.reduce((sum, item) => sum + (item.triggers?.length || 0), 0),
    positiveContent: analytics.filter(item => 
      item.sentiment?.score > 0 || item.aiAnalysis?.sentiment === 'positive'
    ).length,
    negativeContent: analytics.filter(item => 
      item.sentiment?.score < 0 || item.aiAnalysis?.sentiment === 'negative'
    ).length,
    averageSentiment: analytics.length > 0 
      ? analytics.reduce((sum, item) => sum + (item.sentiment?.score || 0), 0) / analytics.length
      : 0
  };

  return {
    // State
    status,
    analytics,
    analyticsMetrics,
    isLoading,
    error,
    
    // Actions
    initializeExtension,
    triggerContentAnalysis,
    exportExtensionData,
    clearExtensionData,
    requestPermissions,
    reloadData: loadExtensionData,
    
    // Permissions helpers
    hasContentAnalysis: status.permissions?.contentAnalysis || false,
    hasEyeTracking: status.permissions?.eyeTracking || false,
    hasEmotionDetection: status.permissions?.emotionDetection || false,
    hasDataCollection: status.permissions?.dataCollection || false,
    
    // Connection helpers
    canAnalyze: status.isConnected && status.permissions?.contentAnalysis,
    canExport: analytics.length > 0,
    requiresPermissions: status.isAvailable && !status.permissions?.permissionsAsked,
    
    // Data helpers
    getRecentAnalytics: (limit: number = 10) => analytics.slice(0, limit),
    getAnalyticsByDomain: (domain: string) => 
      analytics.filter(item => new URL(item.url).hostname.includes(domain)),
    getAnalyticsByDate: (date: Date) => 
      analytics.filter(item => new Date(item.timestamp).toDateString() === date.toDateString())
  };
};

// Specialized hook for dashboard integration
export const useDashboardExtensionIntegration = () => {
  const extension = useExtensionIntegration();
  
  // Enhanced analytics with AI insights
  const enhancedAnalytics = extension.analytics.map(item => ({
    ...item,
    hasAIInsights: !!item.aiAnalysis,
    riskLevel: item.aiAnalysis?.riskLevel || 'unknown',
    confidence: item.aiAnalysis?.confidence || 0
  }));

  // Get wellbeing insights
  const wellbeingInsights = {
    highRiskContent: enhancedAnalytics.filter(item => 
      item.aiAnalysis?.riskLevel === 'high' || item.aiAnalysis?.riskLevel === 'crisis'
    ).length,
    positiveMoments: enhancedAnalytics.filter(item => 
      item.aiAnalysis?.sentiment === 'positive'
    ).length,
    frequentTriggers: enhancedAnalytics
      .flatMap(item => item.triggers)
      .reduce((acc: { [key: string]: number }, trigger) => {
        acc[trigger] = (acc[trigger] || 0) + 1;
        return acc;
      }, {}),
    dailyPatterns: enhancedAnalytics.reduce((acc: { [key: string]: number }, item) => {
      const hour = new Date(item.timestamp).getHours();
      const key = `${hour}:00`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  };

  return {
    ...extension,
    enhancedAnalytics,
    wellbeingInsights
  };
};

export default useExtensionIntegration;