// permission-request.js - Handle permission requests for ZENITH Wellness
console.log('ZENITH Wellness permission request loaded');

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const contentAnalysisCheckbox = document.getElementById('contentAnalysis');
    const eyeTrackingCheckbox = document.getElementById('eyeTracking');
    const emotionDetectionCheckbox = document.getElementById('emotionDetection');
    const dataCollectionCheckbox = document.getElementById('dataCollection');
    const grantBtn = document.getElementById('grantBtn');
    const denyBtn = document.getElementById('denyBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Initialize the permission request page
    initPermissionRequest();

    // Set up event listeners
    grantBtn.addEventListener('click', handlePermissionGrant);
    denyBtn.addEventListener('click', handlePermissionDeny);

    // Validate required data collection checkbox
    dataCollectionCheckbox.addEventListener('change', (e) => {
        if (!e.target.checked) {
            showStatus('Data collection is required to use ZENITH Wellness features. Your data stays on your device.', 'error');
            // Re-check after a brief delay to ensure user sees the message
            setTimeout(() => {
                dataCollectionCheckbox.checked = true;
            }, 100);
        }
    });

    // Enable/disable grant button based on data collection requirement
    contentAnalysisCheckbox.addEventListener('change', updateGrantButton);
    eyeTrackingCheckbox.addEventListener('change', updateGrantButton);
    emotionDetectionCheckbox.addEventListener('change', updateGrantButton);
    dataCollectionCheckbox.addEventListener('change', updateGrantButton);
});

// Initialize the permission request
function initPermissionRequest() {
    console.log('Initializing permission request...');
    
    // Check if we're running as a Chrome extension
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        showStatus('Error: This page must be opened as a Chrome extension.', 'error');
        disableAllControls();
        return;
    }

    // Load any existing permissions to pre-fill the form
    loadExistingPermissions();
}

// Load existing permissions to pre-fill the form
function loadExistingPermissions() {
    chrome.runtime.sendMessage({ type: 'GET_PERMISSIONS' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading permissions:', chrome.runtime.lastError);
            showStatus('Error connecting to extension. Please try refreshing the page.', 'error');
            return;
        }

        if (response && response.permissions) {
            const permissions = response.permissions;
            
            // Pre-fill checkboxes with existing permissions
            if (permissions.contentAnalysis !== undefined) {
                document.getElementById('contentAnalysis').checked = permissions.contentAnalysis;
            }
            if (permissions.eyeTracking !== undefined) {
                document.getElementById('eyeTracking').checked = permissions.eyeTracking;
            }
            if (permissions.emotionDetection !== undefined) {
                document.getElementById('emotionDetection').checked = permissions.emotionDetection;
            }
            if (permissions.dataCollection !== undefined) {
                document.getElementById('dataCollection').checked = permissions.dataCollection;
            }

            // Update button state
            updateGrantButton();

            console.log('Loaded existing permissions:', permissions);
            
            if (permissions.permissionsAsked) {
                showStatus('You can modify your existing permissions here.', 'info');
                document.querySelector('.header h1').textContent = '🧠 ZENITH Wellness - Manage Permissions';
                document.querySelector('.header p').textContent = 'Update your privacy settings and feature preferences';
                document.getElementById('grantBtn').textContent = 'Update Permissions';
            }
        }
    });
}

// Handle permission grant
function handlePermissionGrant() {
    console.log('User requested to grant permissions');
    
    // Disable buttons during processing
    setButtonsEnabled(false);
    showStatus('Processing your request...', 'info');

    // Collect selected permissions
    const requestedPermissions = {
        contentAnalysis: document.getElementById('contentAnalysis').checked,
        eyeTracking: document.getElementById('eyeTracking').checked,
        emotionDetection: document.getElementById('emotionDetection').checked,
        dataCollection: document.getElementById('dataCollection').checked,
        permissionsAsked: true,
        grantedAt: new Date().toISOString(),
        grantedFrom: 'permission-request-page'
    };

    // Validate that data collection is enabled (required)
    if (!requestedPermissions.dataCollection) {
        showStatus('Data collection is required to use ZENITH Wellness features. Your data stays securely on your device.', 'error');
        setButtonsEnabled(true);
        return;
    }

    // Validate that at least one feature is selected
    if (!requestedPermissions.contentAnalysis && !requestedPermissions.eyeTracking && !requestedPermissions.emotionDetection) {
        showStatus('Please enable at least one feature to continue.', 'error');
        setButtonsEnabled(true);
        return;
    }

    // Send permissions to background script
    chrome.runtime.sendMessage({
        type: 'REQUEST_PERMISSIONS',
        permissions: requestedPermissions
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending permissions:', chrome.runtime.lastError);
            showStatus('Error saving permissions. Please try again.', 'error');
            setButtonsEnabled(true);
            return;
        }

        if (response && response.success) {
            console.log('Permissions granted successfully:', response.permissions);
            showStatus('✅ Permissions granted! ZENITH Wellness is now active.', 'success');
            
            // Update UI to show success
            document.querySelector('.header h1').textContent = '🎉 Permissions Granted!';
            document.querySelector('.header p').textContent = 'ZENITH Wellness is now active and ready to help you.';
            
            // Change button to continue
            grantBtn.textContent = 'Continue to Dashboard';
            grantBtn.onclick = redirectToDashboard;
            denyBtn.style.display = 'none';
            
            // Auto-redirect after 3 seconds
            setTimeout(redirectToDashboard, 3000);
            
            // Notify all tabs about permission change
            notifyTabsAboutPermissions(response.permissions);
            
        } else {
            showStatus('Error: Could not save permissions. Please try again.', 'error');
            setButtonsEnabled(true);
        }
    });
}

// Handle permission denial
function handlePermissionDeny() {
    console.log('User denied permissions');
    
    // Set minimal permissions (data collection false, permissions asked true)
    const minimalPermissions = {
        contentAnalysis: false,
        eyeTracking: false,
        emotionDetection: false,
        dataCollection: false,
        permissionsAsked: true,
        deniedAt: new Date().toISOString()
    };

    chrome.runtime.sendMessage({
        type: 'REQUEST_PERMISSIONS',
        permissions: minimalPermissions
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error saving denial:', chrome.runtime.lastError);
        }
        
        showStatus('Permissions not granted. You can enable ZENITH Wellness anytime by clicking the extension icon.', 'info');
        
        // Update UI
        document.querySelector('.header h1').textContent = 'Permissions Not Granted';
        document.querySelector('.header p').textContent = 'You can enable ZENITH Wellness features anytime from the extension popup.';
        
        grantBtn.textContent = 'Try Again';
        grantBtn.onclick = () => window.location.reload();
        denyBtn.style.display = 'none';
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            window.close();
        }, 3000);
    });
}

// Redirect to dashboard
function redirectToDashboard() {
    // Try to open the dashboard
    chrome.tabs.create({
        url: 'http://localhost:3000',
        active: true
    }, (tab) => {
        console.log('Opened dashboard tab:', tab.id);
        // Close the permission request tab
        setTimeout(() => {
            window.close();
        }, 1000);
    });
}

// Notify all tabs about permission changes
function notifyTabsAboutPermissions(permissions) {
    chrome.tabs.query({}, (tabs) => {
        let notifiedCount = 0;
        tabs.forEach(tab => {
            // Only notify tabs with http/https URLs
            if (tab.url && tab.url.startsWith('http')) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'PERMISSIONS_UPDATED',
                    permissions: permissions
                }).then(() => {
                    notifiedCount++;
                    console.log(`Notified tab ${tab.id} about permissions`);
                }).catch(error => {
                    // Tab might not have content script loaded yet, which is fine
                    console.log(`Could not notify tab ${tab.id}:`, error.message);
                });
            }
        });
        console.log(`Permission update sent to ${notifiedCount} tabs`);
    });
}

// Update grant button state based on selections
function updateGrantButton() {
    const dataCollectionChecked = document.getElementById('dataCollection').checked;
    const hasFeatureSelected = document.getElementById('contentAnalysis').checked ||
                              document.getElementById('eyeTracking').checked ||
                              document.getElementById('emotionDetection').checked;
    
    const grantBtn = document.getElementById('grantBtn');
    
    if (dataCollectionChecked && hasFeatureSelected) {
        grantBtn.disabled = false;
        grantBtn.style.opacity = '1';
        grantBtn.style.cursor = 'pointer';
    } else {
        grantBtn.disabled = true;
        grantBtn.style.opacity = '0.6';
        grantBtn.style.cursor = 'not-allowed';
    }
}

// Show status message
function showStatus(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    
    switch (type) {
        case 'success':
            statusMessage.classList.add('status-success');
            break;
        case 'error':
            statusMessage.classList.add('status-error');
            break;
        case 'info':
            statusMessage.style.background = '#fef3c7';
            statusMessage.style.color = '#92400e';
            statusMessage.style.border = '1px solid #fde68a';
            break;
    }
    
    statusMessage.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

// Set buttons enabled/disabled state
function setButtonsEnabled(enabled) {
    const grantBtn = document.getElementById('grantBtn');
    const denyBtn = document.getElementById('denyBtn');
    
    grantBtn.disabled = !enabled;
    denyBtn.disabled = !enabled;
    
    if (enabled) {
        grantBtn.style.opacity = '1';
        denyBtn.style.opacity = '1';
        grantBtn.style.cursor = 'pointer';
        denyBtn.style.cursor = 'pointer';
    } else {
        grantBtn.style.opacity = '0.6';
        denyBtn.style.opacity = '0.6';
        grantBtn.style.cursor = 'not-allowed';
        denyBtn.style.cursor = 'not-allowed';
    }
}

// Disable all controls (for error states)
function disableAllControls() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const buttons = document.querySelectorAll('button');
    
    checkboxes.forEach(checkbox => {
        checkbox.disabled = true;
    });
    
    buttons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
    });
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible, refresh permission state
        loadExistingPermissions();
    }
});

// Handle beforeunload event to clean up
window.addEventListener('beforeunload', () => {
    console.log('Permission request page closing');
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initPermissionRequest,
        handlePermissionGrant,
        handlePermissionDeny,
        updateGrantButton,
        showStatus
    };
}