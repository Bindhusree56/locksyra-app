import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Check if running as native app
export const isNativeApp = () => {
  return Capacitor.isNativePlatform();
};

// Setup status bar for mobile
export const setupStatusBar = async () => {
  if (!isNativeApp()) return;
  
  try {
    await StatusBar.setBackgroundColor({ color: '#8B5CF6' }); // Purple
    await StatusBar.setStyle({ style: 'dark' });
  } catch (error) {
    console.log('StatusBar setup failed:', error);
  }
};

// Hide splash screen
export const hideSplashScreen = async () => {
  if (!isNativeApp()) return;
  
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.log('SplashScreen hide failed:', error);
  }
};

// Setup back button handler for Android
export const setupBackButton = (callback) => {
  if (!isNativeApp()) return;
  
  try {
    App.addListener('backButton', ({ canGoBack }) => {
      callback(canGoBack);
    });
  } catch (error) {
    console.log('BackButton setup failed:', error);
  }
};

// Trigger haptic feedback
export const triggerHaptic = async (style = 'medium') => {
  if (!isNativeApp()) return;
  
  try {
    const impactStyle = style === 'light' ? ImpactStyle.Light : 
                       style === 'heavy' ? ImpactStyle.Heavy : 
                       ImpactStyle.Medium;
    
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.log('Haptic feedback failed:', error);
  }
};

// Device Info
export const getDeviceInfo = async () => {
  if (!isNativeApp()) {
    return {
      platform: 'web',
      model: 'Browser',
      manufacturer: navigator.vendor || 'Unknown',
      osVersion: navigator.userAgent,
      isVirtual: false
    };
  }
  
  try {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    return info;
  } catch (error) {
    return {
      platform: 'web',
      model: 'Unknown',
      manufacturer: 'Unknown',
      osVersion: 'Unknown',
      isVirtual: false
    };
  }
};

// Network Status
export const getNetworkStatus = () => {
  return {
    connected: navigator.onLine,
    connectionType: navigator.connection?.effectiveType || 'unknown'
  };
};

// Share API
export const share = async (options) => {
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
};

// Open URL in browser
export const openUrl = async (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
  return { success: true };
};

// Push notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Notifications not supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted' };
  } catch (error) {
    return { granted: false, error: error.message };
  }
};

// Show local notification
export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/logo192.png',
      badge: options.badge || '/logo192.png'
    });
    return { success: true };
  }
  return { success: false, error: 'Notification permission not granted' };
};

// Vibrate device
export const vibrate = (duration = 200) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
    return { success: true };
  }
  return { success: false, error: 'Vibration not supported' };
};

// Get battery status
export const getBatteryStatus = async () => {
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
};

// Check if running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Install PWA prompt
export const installPWA = (deferredPrompt) => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    return deferredPrompt.userChoice;
  }
  return Promise.resolve({ outcome: 'dismissed' });
};

// Default export for backward compatibility
const MobileFeatures = {
  isNativeApp,
  setupStatusBar,
  hideSplashScreen,
  setupBackButton,
  triggerHaptic,
  getDeviceInfo,
  getNetworkStatus,
  share,
  openUrl,
  requestNotificationPermission,
  showNotification,
  vibrate,
  getBatteryStatus,
  isPWA,
  installPWA
};

export default MobileFeatures;