// Main App Navigation and Core Logic

window.currentScreen = 'loading';

window.showScreen = function(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(screenId + '-screen');
    if (target) {
        target.classList.add('active');
        window.currentScreen = screenId;
        window.scrollTo(0, 0);
        
        // Load screen-specific data
        if (screenId === 'courtyard') {
            window.updateCourtyardProgress();
        } else if (screenId === 'scriptorium') {
            window.loadScriptorium();
        } else if (screenId === 'prayer-wall') {
            window.loadPrayerWall();
        } else if (screenId === 'workshop') {
            window.loadWorkshop();
        }
    }
};

window.navigateTo = function(destination) {
    if (destination === 'workshop' && !window.WORKSHOP_DATA?.unlocked) {
        showToast('Complete The Listening Heart journey first');
        return;
    }
    window.showScreen(destination);
};

// Initialize App
window.initApp = function() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }
    
    // Check auth state
    window.checkAuthState();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => Notification.requestPermission(), 3000);
    }
};

// Start the app
window.onload = function() {
    window.initApp();
};
