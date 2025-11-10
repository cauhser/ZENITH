export {};

declare global {
  interface Window {
    ZenithExtension?: {
      connect: () => void;
      disconnect: () => void;
      isConnected: boolean;
      getConnectionStatus: () => any;
      triggerContentAnalysis: () => Promise<void>;
    };
  }
}