import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketService } from '../services/websocket/websocket';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  lastError: string | null;
  connectionId: string | null;
  messageCount: number;
}

export const useWebSocket = (url: string = 'ws://localhost:30000') => {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<WebSocketStatus>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    lastError: null,
    connectionId: null,
    messageCount: 0
  });

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<WebSocketMessage[]>([]);
  const webSocketService = useRef<WebSocketService | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket service
  const initializeWebSocket = useCallback(async () => {
    try {
      setStatus(prev => ({
        ...prev,
        isConnecting: true,
        lastError: null
      }));

      webSocketService.current = new WebSocketService(url);
      
      await webSocketService.current.initialize();
      
      setStatus(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        connectionId: webSocketService.current?.getConnectionId() || null
      }));

      console.log('✅ WebSocket connected successfully');

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        lastError: error instanceof Error ? error.message : 'Connection failed'
      }));

      // Schedule reconnection
      scheduleReconnection();
    }
  }, [url]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = Math.min(1000 * Math.pow(2, status.messageCount), 30000); // Max 30 seconds
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setStatus(prev => ({ ...prev, isReconnecting: true }));
      initializeWebSocket();
    }, delay);
  }, [initializeWebSocket, status.messageCount]);

  // Send message through WebSocket
  const sendMessage = useCallback((type: string, data: any) => {
    if (!webSocketService.current || !status.isConnected) {
      // Queue message for when connection is restored
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };
      setQueuedMessages(prev => [...prev, message]);
      return false;
    }

    try {
      webSocketService.current.sendMessage(type, data);
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }, [status.isConnected]);

  // Send queued messages when connection is restored
  const sendQueuedMessages = useCallback(() => {
    if (queuedMessages.length === 0 || !status.isConnected) return;

    const successfulMessages: WebSocketMessage[] = [];
    const failedMessages: WebSocketMessage[] = [];

    queuedMessages.forEach(message => {
      const success = sendMessage(message.type, message.data);
      if (success) {
        successfulMessages.push(message);
      } else {
        failedMessages.push(message);
      }
    });

    setQueuedMessages(failedMessages);
    
    if (successfulMessages.length > 0) {
      console.log(`✅ Sent ${successfulMessages.length} queued messages`);
    }
  }, [queuedMessages, status.isConnected, sendMessage]);

  // Handle incoming messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    setMessages(prev => {
      const newMessages = [...prev, message].slice(-100); // Keep last 100 messages
      return newMessages;
    });

    setStatus(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1
    }));

    // Emit custom event for specific message types
    const event = new CustomEvent(`websocket-${message.type}`, {
      detail: message
    });
    window.dispatchEvent(event);
  }, []);

  // Subscribe to specific message types
  const subscribe = useCallback((messageType: string, callback: (data: any) => void) => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<WebSocketMessage>;
      callback(customEvent.detail.data);
    };

    window.addEventListener(`websocket-${messageType}`, handler);

    // Return unsubscribe function
    return () => {
      window.removeEventListener(`websocket-${messageType}`, handler);
    };
  }, []);

  // Get messages by type
  const getMessagesByType = useCallback((type: string): WebSocketMessage[] => {
    return messages.filter(message => message.type === type);
  }, [messages]);

  // Get latest message by type
  const getLatestMessage = useCallback((type?: string): WebSocketMessage | null => {
    const filtered = type ? messages.filter(msg => msg.type === type) : messages;
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }, [messages]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (webSocketService.current) {
      webSocketService.current.disconnect();
      webSocketService.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setStatus({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      lastError: null,
      connectionId: null,
      messageCount: 0
    });

    console.log('🔌 WebSocket disconnected');
  }, []);

  // Reconnect WebSocket
  const reconnect = useCallback(() => {
    disconnect();
    initializeWebSocket();
  }, [disconnect, initializeWebSocket]);

  // Set up WebSocket event listeners
  useEffect(() => {
    if (!webSocketService.current) return;

    const handleConnect = () => {
      setStatus(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        lastError: null
      }));
      
      // Send queued messages when connected
      sendQueuedMessages();
    };

    const handleDisconnect = () => {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false
      }));
      
      scheduleReconnection();
    };

    const handleError = (error: Error) => {
      setStatus(prev => ({
        ...prev,
        lastError: error.message,
        isConnected: false,
        isConnecting: false
      }));
    };

    const handleMessageEvent = (message: WebSocketMessage) => {
      handleMessage(message);
    };

    // Subscribe to WebSocket events
    webSocketService.current.on('connect', handleConnect);
    webSocketService.current.on('disconnect', handleDisconnect);
    webSocketService.current.on('error', handleError);
    webSocketService.current.on('message', handleMessageEvent);

    // Cleanup function
    return () => {
      if (webSocketService.current) {
        webSocketService.current.off('connect', handleConnect);
        webSocketService.current.off('disconnect', handleDisconnect);
        webSocketService.current.off('error', handleError);
        webSocketService.current.off('message', handleMessageEvent);
      }
    };
  }, [handleMessage, scheduleReconnection, sendQueuedMessages]);

  // Initialize WebSocket on mount
  useEffect(() => {
    initializeWebSocket();

    return () => {
      disconnect();
    };
  }, [initializeWebSocket, disconnect]);

  // Send heartbeat when connected
  useEffect(() => {
    if (!status.isConnected) return;

    const heartbeatInterval = setInterval(() => {
      sendMessage('heartbeat', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [status.isConnected, sendMessage]);

  return {
    // State
    status,
    messages,
    queuedMessages,
    
    // Actions
    sendMessage,
    subscribe,
    getMessagesByType,
    getLatestMessage,
    clearMessages,
    disconnect,
    reconnect,
    
    // Derived state
    hasQueuedMessages: queuedMessages.length > 0,
    lastMessage: getLatestMessage(),
    connectionHealth: status.isConnected ? 'healthy' : 
                     status.isReconnecting ? 'reconnecting' : 
                     status.isConnecting ? 'connecting' : 'disconnected'
  };
};

// Specialized hook for wellness data
export const useWellnessWebSocket = () => {
  const webSocket = useWebSocket();
  
  // Send wellness data
  const sendWellnessData = useCallback((data: {
    emotion?: string;
    attention?: number;
    stressLevel?: number;
    triggers?: string[];
    sentiment?: number;
  }) => {
    return webSocket.sendMessage('wellness-data', {
      ...data,
      timestamp: Date.now(),
      sessionId: localStorage.getItem('zenith-session-id')
    });
  }, [webSocket]);

  // Send content analysis
  const sendContentAnalysis = useCallback((data: {
    url: string;
    title: string;
    triggers: string[];
    sentiment: number;
    riskLevel: string;
  }) => {
    return webSocket.sendMessage('content-analysis', {
      ...data,
      timestamp: Date.now()
    });
  }, [webSocket]);

  // Subscribe to wellness recommendations
  const subscribeToRecommendations = useCallback((callback: (recommendation: any) => void) => {
    return webSocket.subscribe('wellness-recommendation', callback);
  }, [webSocket]);

  // Subscribe to break reminders
  const subscribeToBreakReminders = useCallback((callback: (reminder: any) => void) => {
    return webSocket.subscribe('break-reminder', callback);
  }, [webSocket]);

  // Get wellness insights
  const getWellnessInsights = useCallback(() => {
    return webSocket.getMessagesByType('wellness-insights');
  }, [webSocket]);

  return {
    ...webSocket,
    sendWellnessData,
    sendContentAnalysis,
    subscribeToRecommendations,
    subscribeToBreakReminders,
    getWellnessInsights
  };
};

export default useWebSocket;