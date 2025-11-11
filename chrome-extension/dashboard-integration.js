console.log('ZENITH Wellness Dashboard Integration loaded - REAL DATA MODE');

class DashboardIntegration {
    constructor() {
        this.extensionId = null;
        this.isConnected = false;
        this.permissions = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.dataBuffer = [];
        
        this.init();
    }

    init() {
        console.log('🔄 Initializing dashboard integration with real data...');
    
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.warn('Chrome extension API not available - running in standalone mode');
            this.setupStandaloneMode();
            return;
        }

        this.extensionId = chrome.runtime.id;
        console.log('🔗 Extension ID:', this.extensionId);
        this.setupMessageListeners();
        this.connectToExtension();
        this.setupHealthChecks();
        this.setupStorageSync();
        this.setupDebugMode();
    }

    setupDebugMode() {
        window.zenithDebug = {
            log: (message, data) => {
                console.log('🐛 DASHBOARD DEBUG:', message, data);
            },
            getStatus: () => this.getConnectionStatus(),
            getData: () => this.dataBuffer
        };
        
        console.log('🔧 Debug mode enabled - use window.zenithDebug to inspect');
    }

    async connectToExtension() {
        try {
            console.log('🔌 Connecting to extension for real data...');
            const pingResponse = await this.sendMessageToExtension({ type: 'PING' });
            
            if (pingResponse && pingResponse.status === 'pong') {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('✅ Extension connection established:', {
                    version: pingResponse.version,
                    extensionId: pingResponse.extensionId,
                    dataStats: pingResponse.dataStats
                });

                await this.loadPermissions();
                await this.loadInitialData();
                this.notifyDashboard('EXTENSION_CONNECTED', {
                    extensionId: this.extensionId,
                    version: pingResponse.version,
                    permissions: this.permissions,
                    dataStats: pingResponse.dataStats
                });

            } else {
                throw new Error('Invalid ping response');
            }

        } catch (error) {
            console.error('❌ Extension connection failed:', error);
            this.handleConnectionError();
        }
    }

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

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('📨 Real data received from extension:', request.type);
            
            switch (request.type) {
                case 'EXTENSION_DATA':
                    this.handleExtensionData(request);
                    sendResponse({ received: true });
                    break;
                    
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
            
            return true;
        });

       
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                this.handleStorageChanges(changes);
            }
        });
    }

    handleExtensionData(request) {
        const { event, data, timestamp } = request;
        
        console.log('📊 Real-time data event:', event, data);
        this.dataBuffer.push({
            event,
            data,
            timestamp,
            receivedAt: Date.now()
        });
        

        if (this.dataBuffer.length > 1000) {
            this.dataBuffer = this.dataBuffer.slice(-500);
        }
        
        switch (event) {
            case 'CONTENT_ANALYSIS':
                this.notifyDashboard('REAL_CONTENT_ANALYSIS', {
                    analysis: data,
                    realTime: true
                });
                break;
                
            case 'WEBCAM_DATA':
                this.notifyDashboard('REAL_WEBCAM_DATA', {
                    webcam: data,
                    realTime: true
                });
                break;
                
            case 'PERMISSIONS_UPDATED':
                this.handlePermissionsUpdate(data.permissions);
                break;
        }
    }

    setupHealthChecks() {
        setInterval(() => {
            if (this.isConnected) {
                this.checkConnectionHealth();
            }
        }, 30000);
        setInterval(() => {
            if (this.isConnected && this.permissions?.dataCollection) {
                this.syncRealTimeData();
            }
        }, 10000);
    }

    setupStorageSync() {
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('zenith-')) {
                this.syncLocalStorageToExtension();
            }
        });
    }

    async checkConnectionHealth() {
        try {
            const response = await this.sendMessageToExtension({ type: 'PING' });
            if (response && response.status === 'pong') {
                this.notifyDashboard('CONNECTION_HEALTHY', {
                    timestamp: Date.now(),
                    extensionVersion: response.version,
                    dataStats: response.dataStats
                });
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            console.warn('⚠️ Connection health check failed:', error);
            this.isConnected = false;
            this.connectToExtension(); 
        }
    }

    async syncRealTimeData() {
        try {
            const [analyticsResponse, webcamResponse] = await Promise.all([
                this.sendMessageToExtension({ type: 'GET_ANALYTICS_DATA' }),
                this.sendMessageToExtension({ type: 'GET_WEBCAM_DATA' })
            ]);

            if (analyticsResponse?.analytics) {
                this.notifyDashboard('REAL_ANALYTICS_UPDATE', {
                    analytics: analyticsResponse.analytics,
                    count: analyticsResponse.analytics.length,
                    timestamp: Date.now()
                });
            }
            
            if (webcamResponse?.webcamData) {
                this.notifyDashboard('REAL_WEBCAM_UPDATE', {
                    webcamData: webcamResponse.webcamData,
                    count: webcamResponse.webcamData.length,
                    timestamp: Date.now()
                });
            }

        } catch (error) {
            console.error('Error syncing real-time data:', error);
        }
    }

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

    async loadPermissions() {
        try {
            const response = await this.sendMessageToExtension({ type: 'GET_PERMISSIONS' });
            if (response && response.permissions) {
                this.permissions = response.permissions;
                console.log('🔐 Loaded real permissions:', this.permissions);
                
                this.notifyDashboard('PERMISSIONS_LOADED', {
                    permissions: this.permissions
                });
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
        }
    }

    async loadInitialData() {
        if (!this.permissions?.dataCollection) {
            console.log('📊 Data collection not permitted - skipping initial data load');
            return;
        }

        try {
            const analyticsResponse = await this.sendMessageToExtension({ type: 'GET_ANALYTICS_DATA' });
            if (analyticsResponse && analyticsResponse.analytics) {
                this.notifyDashboard('REAL_ANALYTICS_LOADED', {
                    analytics: analyticsResponse.analytics,
                    count: analyticsResponse.analytics.length,
                    source: 'extension'
                });
            }

            const webcamResponse = await this.sendMessageToExtension({ type: 'GET_WEBCAM_DATA' });
            if (webcamResponse && webcamResponse.webcamData) {
                this.notifyDashboard('REAL_WEBCAM_LOADED', {
                    webcamData: webcamResponse.webcamData,
                    count: webcamResponse.webcamData.length,
                    source: 'extension'
                });
            }

            const settingsResponse = await this.sendMessageToExtension({ type: 'GET_SETTINGS' });
            if (settingsResponse && settingsResponse.settings) {
                this.notifyDashboard('SETTINGS_LOADED', {
                    settings: settingsResponse.settings
                });
            }

        } catch (error) {
            console.error('Error loading initial real data:', error);
        }
    }

    handleNewAnalysis(analysisData) {
        console.log('📊 New real analysis received:', {
            domain: analysisData.domain,
            triggers: analysisData.triggers?.length,
            sentiment: analysisData.sentiment?.score
        });

        this.notifyDashboard('NEW_REAL_ANALYSIS', {
            analysis: analysisData,
            timestamp: Date.now(),
            realData: true
        });

        this.updateLocalStorage('analytics', analysisData);
    }


    handlePermissionsUpdate(newPermissions) {
        console.log('🔄 Real permissions updated:', newPermissions);
        this.permissions = newPermissions;
        
        this.notifyDashboard('PERMISSIONS_UPDATED', {
            permissions: newPermissions
        });


        if (newPermissions.dataCollection) {
            this.loadInitialData();
        }
    }

    handleExtensionStatus(status) {
        console.log('📡 Extension status:', status);
        this.notifyDashboard('EXTENSION_STATUS_UPDATE', {
            status: status,
            timestamp: Date.now()
        });
    }

    handleDataUpdated(updatedData) {
        console.log('🔄 Real data updated from extension:', updatedData.type);
        this.notifyDashboard('EXTENSION_DATA_UPDATED', updatedData);
    }


    handleStorageChanges(changes) {
        Object.entries(changes).forEach(([key, change]) => {
            console.log('💾 Real storage changed:', key, change);
            
            switch (key) {
                case 'analytics':
                    this.notifyDashboard('REAL_ANALYTICS_UPDATED', {
                        newValue: change.newValue,
                        oldValue: change.oldValue,
                        count: change.newValue?.length || 0
                    });
                    break;
                    
                case 'webcamData':
                    this.notifyDashboard('REAL_WEBCAM_UPDATED', {
                        newValue: change.newValue,
                        oldValue: change.oldValue,
                        count: change.newValue?.length || 0
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

    async syncLocalStorageToExtension() {
        try {
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

   
    notifyDashboard(eventType, data) {
        const event = new CustomEvent('zenith-extension-event', {
            detail: {
                type: eventType,
                timestamp: Date.now(),
                data: data,
                extensionConnected: this.isConnected,
                permissions: this.permissions,
                debug: {
                    dataBufferLength: this.dataBuffer.length,
                    lastUpdate: new Date().toISOString()
                }
            }
        });
        
    
        window.dispatchEvent(event);
        console.log(`📢 Dashboard notified: ${eventType}`, data);
    }

    
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

    async startWebcamCollection() {
        if (!this.isConnected || !this.permissions?.emotionDetection) {
            throw new Error('Webcam collection not permitted or extension not connected');
        }

        try {
            const response = await this.sendMessageToExtension({ type: 'START_WEBCAM' });
            return response;
        } catch (error) {
            console.error('Error starting webcam collection:', error);
            throw error;
        }
    }

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


    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            extensionId: this.extensionId,
            permissions: this.permissions,
            reconnectAttempts: this.reconnectAttempts,
            dataBuffer: this.dataBuffer.length,
            lastSync: new Date().toISOString()
        };
    }


    getDataStats() {
        const contentData = this.dataBuffer.filter(item => 
            item.event === 'CONTENT_ANALYSIS' || item.event === 'NEW_ANALYSIS'
        ).length;
        
        const webcamData = this.dataBuffer.filter(item => 
            item.event === 'WEBCAM_DATA'
        ).length;
        
        return {
            totalEvents: this.dataBuffer.length,
            contentAnalysis: contentData,
            webcamAnalysis: webcamData,
            lastHour: this.dataBuffer.filter(item => 
                Date.now() - item.timestamp < 3600000
            ).length
        };
    }


    setupStandaloneMode() {
        console.log('🏠 Running in standalone mode with simulated data disabled');
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
            message: 'Chrome extension not detected - real data collection disabled'
        });

        // Load any existing real data from local storage
        this.loadFromLocalStorage();
    }

    // Load data from local storage in standalone mode
    loadFromLocalStorage() {
        try {
            const analytics = JSON.parse(localStorage.getItem('zenith-analytics') || '[]');
            const webcamData = JSON.parse(localStorage.getItem('zenith-webcamData') || '[]');
            
            if (analytics.length > 0 || webcamData.length > 0) {
                this.notifyDashboard('EXISTING_DATA_LOADED', {
                    analytics: analytics,
                    webcamData: webcamData,
                    count: analytics.length + webcamData.length,
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
}

// Initialize dashboard integration when script loads
let dashboardIntegration;

function initializeDashboardIntegration() {
    if (!dashboardIntegration) {
        dashboardIntegration = new DashboardIntegration();
        
        // Make it globally available for React components
        window.ZenithExtension = dashboardIntegration;
        
        console.log('🎯 Real data dashboard integration initialized');
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