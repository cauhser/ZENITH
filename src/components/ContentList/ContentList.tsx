import React, { useState, useEffect } from 'react';
interface ContentItem {
  id: string;
  url: string;
  title: string;
  triggers: string[];
  timestamp: number;
  contentSnippet?: string;
  tabId?: number;
}
const ContentList: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [extensionStatus, setExtensionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [extensionId, setExtensionId] = useState<string>('');
  useEffect(() => {
    initializeExtensionConnection();
    const interval = setInterval(() => {
      if (extensionStatus === 'connected') {
        loadContentData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [extensionStatus]);
  const initializeExtensionConnection = async () => {
    setExtensionStatus('checking');
    const isInstalled = await checkExtensionInstalled();
    if (isInstalled) {
      setExtensionStatus('connected');
      if (chrome.runtime?.id) {
        setExtensionId(chrome.runtime.id);
      }
      loadContentData();
    } else {
      setExtensionStatus('disconnected');
      setLoading(false);
      loadLocalData();
    }
  };
  const checkExtensionInstalled = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        console.log('✅ Chrome extension runtime detected with ID:', chrome.runtime.id);
        resolve(true);
        return;
      }
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('❌ Extension not installed or not responding:', chrome.runtime.lastError);
            resolve(false);
          } else {
            console.log('✅ Extension responded to ping');
            resolve(true);
          }
        });
      } else {
        console.log('❌ Chrome extension API not available');
        resolve(false);
      }
    });
  };
  const loadContentData = () => {
    if (extensionStatus !== 'connected') return;
    try {
      chrome.storage.local.get(['analytics'], (result) => {
        if (result.analytics && Array.isArray(result.analytics)) {
          const realData = result.analytics.filter((item: ContentItem) => 
            !item.url.includes('example.com') && 
            !item.url.includes('test-content')
          );
          setContentItems(realData);
          console.log('📊 Loaded', realData.length, 'content items from extension storage');
        }
        setLoading(false);
      });
      chrome.runtime.sendMessage(
        { type: 'GET_ANALYTICS_DATA' },
        (response) => {
          if (response?.analytics && Array.isArray(response.analytics)) {
            const realData = response.analytics.filter((item: ContentItem) => 
              !item.url.includes('example.com') && 
              !item.url.includes('test-content')
            );
            if (realData.length > 0) {
              setContentItems(realData);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error loading content data:', error);
      setLoading(false);
    }
  };
  const loadLocalData = () => {
    const stored = localStorage.getItem('zenith-content-data');
    if (stored) {
      const parsedData = JSON.parse(stored);
      const realData = parsedData.filter((item: ContentItem) => 
        !item.url.includes('example.com') && 
        !item.url.includes('test-content')
      );
      setContentItems(realData);
      console.log('📊 Loaded', realData.length, 'content items from localStorage');
    }
  };
  const clearData = () => {
    setContentItems([]);
    localStorage.removeItem('zenith-content-data');
    if (extensionStatus === 'connected') {
      chrome.storage.local.set({ analytics: [] });
    }
  };
  const testExtensionConnection = () => {
    console.log('Testing extension connection...');
    initializeExtensionConnection();
    if (extensionStatus === 'connected') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id && tab.url?.startsWith('http')) {
            chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' }, (response) => {
              if (chrome.runtime.lastError) {
                console.log('Content script not ready in tab:', tab.url);
              } else {
                console.log('Triggered analysis in tab:', tab.url);
              }
            });
          }
        });
      });
    }
  };
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>📝 Content Analysis</h3>
        </div>
        <div className="loading-state">
          <p>Loading content data...</p>
          <small>Checking extension connection...</small>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="card-header">
        <h3>📝 Content Analysis</h3>
        <div className="card-actions">
          <button onClick={testExtensionConnection} className="btn-secondary">
            Check Extension
          </button>
          <button onClick={clearData} className="btn-danger">
            Clear Data
          </button>
        </div>
      </div>
      <div className="extension-status">
        <span className={`status-indicator ${extensionStatus}`}>
          {extensionStatus === 'connected' && `✅ Extension Connected (ID: ${extensionId.substring(0, 8)}...)`}
          {extensionStatus === 'disconnected' && '❌ Extension Not Detected'}
          {extensionStatus === 'checking' && '🔍 Checking Extension...'}
        </span>
        {extensionStatus === 'disconnected' && (
          <div className="extension-help">
            <p><strong>To enable real-time content collection:</strong></p>
            <div className="installation-steps">
              <div className="step">
                <strong>Step 1: Create Extension Files</strong>
                <ul>
                  <li><code>manifest.json</code></li>
                  <li><code>content.js</code></li>
                  <li><code>background.js</code></li>
                  <li><code>popup.html</code></li>
                  <li><code>popup.js</code></li>
                </ul>
              </div>
              <div className="step">
                <strong>Step 2: Load in Chrome</strong>
                <ol>
                  <li>Open <code>chrome://extensions</code></li>
                  <li>Enable <strong>"Developer mode"</strong> (toggle in top right)</li>
                  <li>Click <strong>"Load unpacked"</strong></li>
                  <li>Select your extension folder</li>
                  <li>Ensure extension shows as <strong>"Enabled"</strong></li>
                </ol>
              </div>
              <div className="step">
                <strong>Step 3: Start Browsing</strong>
                <p>Refresh this page and browse websites to see real-time content analysis.</p>
              </div>
            </div>
            <div className="debug-info">
              <p>Debug Information:</p>
              <ul>
                <li>Chrome API available: {typeof chrome !== 'undefined' ? 'Yes' : 'No'}</li>
                <li>Chrome runtime available: {typeof chrome !== 'undefined' && chrome.runtime ? 'Yes' : 'No'}</li>
                <li>Extension ID: {extensionId || 'Not found'}</li>
              </ul>
            </div>
          </div>
        )}
        {extensionStatus === 'connected' && contentItems.length === 0 && (
          <div className="empty-guide">
            <p><strong>✅ Extension is connected and ready!</strong></p>
            <small>
              Browse any website to see real-time content analysis here. The extension monitors for 
              wellbeing-related terms like stress, anxiety, depression, and more.
            </small>
            <button onClick={testExtensionConnection} className="test-btn">
              Test Current Page Analysis
            </button>
          </div>
        )}
      </div>
      <div className="content-list">
        {contentItems.length === 0 ? (
          <div className="empty-state">
            <p>No content data collected yet.</p>
            <small>
              {extensionStatus === 'connected' 
                ? 'Browse websites to see real-time content analysis here.' 
                : 'Install the Chrome extension to enable content collection.'
              }
            </small>
          </div>
        ) : (
          <div className="content-items">
            <div className="content-stats">
              <small>Found {contentItems.length} content items with wellbeing triggers</small>
            </div>
            {contentItems.slice().reverse().map((item) => (
              <div key={item.id} className="content-item">
                <div className="content-header">
                  <h4 className="content-title">{item.title}</h4>
                  <span className="content-time">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="content-url"
                >
                  {item.url}
                </a>
                <div className="content-triggers">
                  <strong>Detected Triggers:</strong>
                  <div className="trigger-tags">
                    {item.triggers.map((trigger, index) => (
                      <span key={index} className="trigger-tag">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
                {item.contentSnippet && (
                  <div className="content-snippet">
                    <p>{item.contentSnippet}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card-footer">
        <small>
          {extensionStatus === 'connected' ? '🟢 Live monitoring' : '🔴 Extension required'} • 
          {contentItems.length} items • 
          Last check: {new Date().toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};
export default ContentList;