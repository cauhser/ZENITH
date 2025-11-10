// dashboard-integration.js - Integration between Chrome extension and ZENITH Wellness Dashboard
console.log('ZENITH Wellness Dashboard Integration loaded');

class DashboardIntegration {
    constructor() {
        this.extensionId = null;
        this.isConnected = false;
        this.permissions = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        
        this.init();
    }

    // Initialize the dashboard integration
    init() {
        console.log('🔄 Initializing dashboard integration...');
        
        // Check if we're in a browser environment with chrome API
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.warn('Chrome extension API not available - running in standalone mode');
            this.setupStandaloneMode();
            return;
        }

        this.extensionId = chrome.runtime.id;
        console.log('🔗 Extension ID:', this.extensionId);

        // Set up message listeners
        this.setupMessageListeners();
        
        // Initialize connection to extension
        this.connectToExtension();
        
        // Set up periodic health checks
        this.setupHealthChecks();
        
        // Set up storage sync
        this.setupStorageSync();
    }

    // Connect to the Chrome extension
    async connectToExtension() {
        try {
            console.log('🔌 Connecting to extension...');
            
            // Test connection with ping
            const pingResponse = await this.sendMessageToExtension({ type: 'PING' });
            
            if (pingResponse && pingResponse.status === 'pong') {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('✅ Extension connection established:', {
                    version: pingResponse.version,
                    extensionId: pingResponse.extensionId
                });

                // Load permissions
                await this.loadPermissions();
                
                // Load initial data
                await this.loadInitialData();
                
                // Notify dashboard about connection
                this.notifyDashboard('EXTENSION_CONNECTED', {
                    extensionId: this.extensionId,
                    version: pingResponse.version,
                    permissions: this.permissions
                });

            } else {
                throw new Error('Invalid ping response');
            }

        } catch (error) {
            console.error('❌ Extension connection failed:', error);
            this.handleConnectionError();
        }
    }

    // Handle connection errors with retry logic
    handleConnectionError() {
        this.isConnected = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            
            console.log(`🔄 Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectToExtension();
            }, delay);
        } else {
            console.error('💥 Maximum reconnection attempts reached');
            this.notifyDashboard('EXTENSION_DISCONNECTED', {
                error: 'Could not connect to extension after multiple attempts'
            });
        }
    }

    // Set up message listeners for extension communication
    setupMessageListeners() {
        // Listen for messages from extension
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('📨 Message received from extension:', request.type);
            
            switch (request.type) {
                case 'NEW_ANALYSIS':
                    this.handleNewAnalysis(request.data);
                    sendResponse({ received: true });
                    break;
                    
                case 'PERMISSIONS_UPDATED':
                    this.handlePermissionsUpdate(request.permissions);
                    sendResponse({ updated: true });
                    break;
                    
                case 'EXTENSION_STATUS':
                    this.handleExtensionStatus(request.status);
                    sendResponse({ handled: true });
                    break;
                    
                case 'DATA_UPDATED':
                    this.handleDataUpdated(request.data);
                    sendResponse({ processed: true });
                    break;
                    
                default:
                    console.warn('Unknown message type from extension:', request.type);
                    sendResponse({ error: 'Unknown message type' });
            }
            
            return true; // Keep message channel open for async response
        });

        // Listen for storage changes
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                this.handleStorageChanges(changes);
            }
        });
    }

    // Set up periodic health checks
    setupHealthChecks() {
        // Check connection every 30 seconds
        setInterval(() => {
            if (this.isConnected) {
                this.checkConnectionHealth();
            }
        }, 30000);

        // Sync data every 60 seconds
        setInterval(() => {
            if (this.isConnected && this.permissions?.dataCollection) {
                this.syncDataWithExtension();
            }
        }, 60000);
    }

    // Set up storage synchronization
    setupStorageSync() {
        // Listen for dashboard storage events and sync with extension
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('zenith-')) {
                this.syncLocalStorageToExtension();
            }
        });
    }

    // Check connection health
    async checkConnectionHealth() {
        try {
            const response = await this.sendMessageToExtension({ type: 'PING' });
            if (response && response.status === 'pong') {
                // Connection is healthy
                this.notifyDashboard('CONNECTION_HEALTHY', {
                    timestamp: Date.now(),
                    extensionVersion: response.version
                });
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            console.warn('⚠️ Connection health check failed:', error);
            this.isConnected = false;
            this.connectToExtension(); // Attempt reconnect
        }
    }

    // Send message to extension with error handling
    async sendMessageToExtension(message) {
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
    }

    // Load permissions from extension
    async loadPermissions() {
        try {
            const response = await this.sendMessageToExtension({ type: 'GET_PERMISSIONS' });
            if (response && response.permissions) {
                this.permissions = response.permissions;
                console.log('🔐 Loaded permissions:', this.permissions);
                
                this.notifyDashboard('PERMISSIONS_LOADED', {
                    permissions: this.permissions
                });
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
        }
    }

    // Load initial data from extension
    async loadInitialData() {
        if (!this.permissions?.dataCollection) {
            console.log('📊 Data collection not permitted - skipping initial data load');
            return;
        }

        try {
            // Load analytics data
            const analyticsResponse = await this.sendMessageToExtension({ type: 'GET_ANALYTICS_DATA' });
            if (analyticsResponse && analyticsResponse.analytics) {
                this.notifyDashboard('ANALYTICS_DATA_LOADED', {
                    analytics: analyticsResponse.analytics,
                    count: analyticsResponse.analytics.length
                });
            }

            // Load settings
            const settingsResponse = await this.sendMessageToExtension({ type: 'GET_SETTINGS' });
            if (settingsResponse && settingsResponse.settings) {
                this.notifyDashboard('SETTINGS_LOADED', {
                    settings: settingsResponse.settings
                });
            }

        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Handle new analysis data from extension
    handleNewAnalysis(analysisData) {
        console.log('📊 New analysis received:', {
            domain: analysisData.domain,
            triggers: analysisData.triggers?.length,
            sentiment: analysisData.sentiment?.score
        });

        this.notifyDashboard('NEW_ANALYSIS_DATA', {
            analysis: analysisData,
            timestamp: Date.now()
        });

        // Update local storage for offline access
        this.updateLocalStorage('analytics', analysisData);
    }

    // Handle permissions updates
    handlePermissionsUpdate(newPermissions) {
        console.log('🔄 Permissions updated:', newPermissions);
        this.permissions = newPermissions;
        
        this.notifyDashboard('PERMISSIONS_UPDATED', {
            permissions: newPermissions
        });

        // If data collection was just enabled, load data
        if (newPermissions.dataCollection) {
            this.loadInitialData();
        }
    }

    // Handle extension status updates
    handleExtensionStatus(status) {
        console.log('📡 Extension status:', status);
        this.notifyDashboard('EXTENSION_STATUS_UPDATE', {
            status: status,
            timestamp: Date.now()
        });
    }

    // Handle data updates from extension
    handleDataUpdated(updatedData) {
        console.log('🔄 Data updated from extension:', updatedData.type);
        this.notifyDashboard('EXTENSION_DATA_UPDATED', updatedData);
    }

    // Handle storage changes from extension
    handleStorageChanges(changes) {
        Object.entries(changes).forEach(([key, change]) => {
            console.log('💾 Storage changed:', key, change);
            
            switch (key) {
                case 'analytics':
                    this.notifyDashboard('ANALYTICS_UPDATED', {
                        newValue: change.newValue,
                        oldValue: change.oldValue
                    });
                    break;
                    
                case 'settings':
                    this.notifyDashboard('SETTINGS_UPDATED', {
                        settings: change.newValue
                    });
                    break;
                    
                case 'userPermissions':
                    this.handlePermissionsUpdate(change.newValue);
                    break;
            }
        });
    }

    // Sync data with extension
    async syncDataWithExtension() {
        if (!this.isConnected || !this.permissions?.dataCollection) {
            return;
        }

        try {
            // Get latest analytics data
            const response = await this.sendMessageToExtension({ type: 'GET_ANALYTICS_DATA' });
            if (response && response.analytics) {
                this.notifyDashboard('DATA_SYNC_COMPLETE', {
                    analyticsCount: response.analytics.length,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error syncing data:', error);
        }
    }

    // Sync local storage to extension
    async syncLocalStorageToExtension() {
        try {
            // Get local storage data that needs to be synced
            const localData = this.getLocalStorageData();
            
            if (Object.keys(localData).length > 0) {
                await this.sendMessageToExtension({
                    type: 'SYNC_LOCAL_DATA',
                    data: localData
                });
                console.log('🔄 Local storage synced to extension');
            }
        } catch (error) {
            console.error('Error syncing local storage:', error);
        }
    }

    // Get local storage data for syncing
    getLocalStorageData() {
        const data = {};
        const prefix = 'zenith-';
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (error) {
                    console.warn('Error parsing localStorage item:', key, error);
                }
            }
        }
        
        return data;
    }

    // Update local storage
    updateLocalStorage(key, value) {
        const storageKey = `zenith-${key}`;
        try {
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updated = Array.isArray(existing) ? [value, ...existing] : value;
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }

    // Notify dashboard about events
    notifyDashboard(eventType, data) {
        const event = new CustomEvent('zenith-extension-event', {
            detail: {
                type: eventType,
                timestamp: Date.now(),
                data: data,
                extensionConnected: this.isConnected,
                permissions: this.permissions
            }
        });
        
        // Dispatch to window for React components to listen
        window.dispatchEvent(event);
        
        // Also log for debugging
        console.log(`📢 Dashboard notified: ${eventType}`, data);
    }

    // Public method to trigger content analysis
    async triggerContentAnalysis() {
        if (!this.isConnected || !this.permissions?.contentAnalysis) {
            throw new Error('Content analysis not permitted or extension not connected');
        }

        try {
            const response = await this.sendMessageToExtension({ type: 'ANALYZE_PAGE' });
            return response;
        } catch (error) {
            console.error('Error triggering content analysis:', error);
            throw error;
        }
    }

    // Public method to update settings
    async updateExtensionSettings(newSettings) {
        if (!this.isConnected) {
            throw new Error('Extension not connected');
        }

        try {
            const response = await this.sendMessageToExtension({
                type: 'UPDATE_SETTINGS',
                settings: newSettings
            });
            return response;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    // Public method to clear data
    async clearExtensionData() {
        if (!this.isConnected) {
            throw new Error('Extension not connected');
        }

        try {
            const response = await this.sendMessageToExtension({ type: 'CLEAR_DATA' });
            return response;
        } catch (error) {
            console.error('Error clearing data:', error);
            throw error;
        }
    }

    // Public method to get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            extensionId: this.extensionId,
            permissions: this.permissions,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Setup standalone mode (when extension is not available)
    setupStandaloneMode() {
        console.log('🏠 Running in standalone mode');
        this.isConnected = false;
        this.permissions = {
            contentAnalysis: false,
            eyeTracking: false,
            emotionDetection: false,
            dataCollection: false,
            permissionsAsked: false,
            standaloneMode: true
        };

        this.notifyDashboard('STANDALONE_MODE', {
            message: 'Chrome extension not detected - running in standalone mode'
        });

        // Load data from local storage
        this.loadFromLocalStorage();
    }

    // Load data from local storage in standalone mode
    loadFromLocalStorage() {
        try {
            const analytics = JSON.parse(localStorage.getItem('zenith-analytics') || '[]');
            if (analytics.length > 0) {
                this.notifyDashboard('ANALYTICS_DATA_LOADED', {
                    analytics: analytics,
                    count: analytics.length,
                    source: 'localStorage'
                });
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    // Public method to check if extension is available
    static isExtensionAvailable() {
        return typeof chrome !== 'undefined' && 
               chrome.runtime && 
               chrome.runtime.id !== undefined;
    }

    // Public method to get extension installation URL
    static getExtensionInstallUrl() {
        return 'https://chrome.google.com/webstore/detail/zenith-wellness-tracker/[extension-id]';
    }
}

// Initialize dashboard integration when script loads
let dashboardIntegration;

function initializeDashboardIntegration() {
    if (!dashboardIntegration) {
        dashboardIntegration = new DashboardIntegration();
        
        // Make it globally available for React components
        window.ZenithExtension = dashboardIntegration;
        
        console.log('🎯 Dashboard integration initialized');
    }
    return dashboardIntegration;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboardIntegration);
    } else {
        initializeDashboardIntegration();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DashboardIntegration,
        initializeDashboardIntegration
    };
}