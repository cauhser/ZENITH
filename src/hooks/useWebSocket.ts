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
export const useWebSocket = (url: string = 'ws://localhost:3000') => {
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
      scheduleReconnection();
    }
  }, [url]);
  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    const delay = Math.min(1000 * Math.pow(2, status.messageCount), 30000); 
    reconnectTimeoutRef.current = setTimeout(() => {
      setStatus(prev => ({ ...prev, isReconnecting: true }));
      initializeWebSocket();
    }, delay);
  }, [initializeWebSocket, status.messageCount]);
  const sendMessage = useCallback((type: string, data: any) => {
    if (!webSocketService.current || !status.isConnected) {
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
  const handleMessage = useCallback((message: WebSocketMessage) => {
    setMessages(prev => {
      const newMessages = [...prev, message].slice(-100); 
      return newMessages;
    });
    setStatus(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1
    }));
    const event = new CustomEvent(`websocket-${message.type}`, {
      detail: message
    });
    window.dispatchEvent(event);
  }, []);
  const subscribe = useCallback((messageType: string, callback: (data: any) => void) => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<WebSocketMessage>;
      callback(customEvent.detail.data);
    };
    window.addEventListener(`websocket-${messageType}`, handler);
    return () => {
      window.removeEventListener(`websocket-${messageType}`, handler);
    };
  }, []);
  const getMessagesByType = useCallback((type: string): WebSocketMessage[] => {
    return messages.filter(message => message.type === type);
  }, [messages]);
  const getLatestMessage = useCallback((type?: string): WebSocketMessage | null => {
    const filtered = type ? messages.filter(msg => msg.type === type) : messages;
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }, [messages]);
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
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
  const reconnect = useCallback(() => {
    disconnect();
    initializeWebSocket();
  }, [disconnect, initializeWebSocket]);
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
    webSocketService.current.on('connect', handleConnect);
    webSocketService.current.on('disconnect', handleDisconnect);
    webSocketService.current.on('error', handleError);
    webSocketService.current.on('message', handleMessageEvent);
    return () => {
      if (webSocketService.current) {
        webSocketService.current.off('connect', handleConnect);
        webSocketService.current.off('disconnect', handleDisconnect);
        webSocketService.current.off('error', handleError);
        webSocketService.current.off('message', handleMessageEvent);
      }
    };
  }, [handleMessage, scheduleReconnection, sendQueuedMessages]);
  useEffect(() => {
    initializeWebSocket();
    return () => {
      disconnect();
    };
  }, [initializeWebSocket, disconnect]);
  useEffect(() => {
    if (!status.isConnected) return;
    const heartbeatInterval = setInterval(() => {
      sendMessage('heartbeat', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    }, 30000); 
    return () => clearInterval(heartbeatInterval);
  }, [status.isConnected, sendMessage]);
  return {
    status,
    messages,
    queuedMessages,
    sendMessage,
    subscribe,
    getMessagesByType,
    getLatestMessage,
    clearMessages,
    disconnect,
    reconnect,
    hasQueuedMessages: queuedMessages.length > 0,
    lastMessage: getLatestMessage(),
    connectionHealth: status.isConnected ? 'healthy' : 
                     status.isReconnecting ? 'reconnecting' : 
                     status.isConnecting ? 'connecting' : 'disconnected'
  };
};
export const useWellnessWebSocket = () => {
  const webSocket = useWebSocket();
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
  const subscribeToRecommendations = useCallback((callback: (recommendation: any) => void) => {
    return webSocket.subscribe('wellness-recommendation', callback);
  }, [webSocket]);
  const subscribeToBreakReminders = useCallback((callback: (reminder: any) => void) => {
    return webSocket.subscribe('break-reminder', callback);
  }, [webSocket]);
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