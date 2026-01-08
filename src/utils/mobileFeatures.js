const MobileFeatures = {
  // Device Info (web version)
  getDeviceInfo: async () => {
    return {
      platform: 'web',
      model: 'Browser',
      manufacturer: navigator.vendor || 'Unknown',
      osVersion: navigator.userAgent,
      isVirtual: false
    };
  },

  // Network Status (web version)
  getNetworkStatus: () => {
    return {
      connected: navigator.onLine,
      connectionType: navigator.connection?.effectiveType || 'unknown'
    };
  },

  // Share API (web version)
  share: async (options) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url
        });
        return { success: true };
      } catch (error) {
        console.log('Share cancelled or failed:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(options.url || options.text);
        alert('Link copied to clipboard!');
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Share not supported' };
      }
    }
  },

  // Open URL in browser
  openUrl: async (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true };
  },

  // Push notifications (web version - requires service worker)
  requestNotificationPermission: async () => {
    if (!('Notification' in window)) {
      return { granted: false, error: 'Notifications not supported' };
    }

    try {
      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted' };
    } catch (error) {
      return { granted: false, error: error.message };
    }
  },

  // Show local notification
  showNotification: (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/logo192.png',
        badge: options.badge || '/logo192.png'
      });
      return { success: true };
    }
    return { success: false, error: 'Notification permission not granted' };
  },

  // Vibrate device (web version)
  vibrate: (duration = 200) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
      return { success: true };
    }
    return { success: false, error: 'Vibration not supported' };
  },

  // Get battery status
  getBatteryStatus: async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        return {
          level: battery.level,
          charging: battery.charging
        };
      } catch (error) {
        return { error: 'Battery API not available' };
      }
    }
    return { error: 'Battery API not supported' };
  },

  // Check if running as PWA
  isPWA: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  },

  // Install PWA prompt
  installPWA: (deferredPrompt) => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      return deferredPrompt.userChoice;
    }
    return Promise.resolve({ outcome: 'dismissed' });
  }
};

export default MobileFeatures;