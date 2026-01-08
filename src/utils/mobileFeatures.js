import { Capacitor } from '@capacitor/core';

/**
 * Check if running as a native mobile app
 */
export const isNativeApp = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Setup status bar styling for mobile
 */
export const setupStatusBar = async () => {
  if (!isNativeApp()) return;
  
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    
    await StatusBar.setStyle({ style: 'Dark' });
    await StatusBar.setBackgroundColor({ color: '#8B5CF6' });
  } catch (error) {
    console.log('StatusBar not available:', error);
  }
};

/**
 * Hide splash screen
 */
export const hideSplashScreen = async () => {
  if (!isNativeApp()) return;
  
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    
    await SplashScreen.hide();
  } catch (error) {
    console.log('SplashScreen not available:', error);
  }
};

/**
 * Setup back button handler for Android
 */
export const setupBackButton = (callback) => {
  if (!isNativeApp()) return;
  
  try {
    import('@capacitor/app').then(({ App }) => {
      App.addListener('backButton', ({ canGoBack }) => {
        callback(canGoBack);
      });
    });
  } catch (error) {
    console.log('App plugin not available:', error);
  }
};

/**
 * Trigger haptic feedback
 * @param {string} type - 'light', 'medium', 'heavy'
 */
export const triggerHaptic = async (type = 'light') => {
  if (!isNativeApp()) return;
  
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };
    
    await Haptics.impact({ style: styleMap[type] || ImpactStyle.Light });
  } catch (error) {
    console.log('Haptics not available:', error);
  }
};

/**
 * Show keyboard
 */
export const showKeyboard = async () => {
  if (!isNativeApp()) return;
  
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    await Keyboard.show();
  } catch (error) {
    console.log('Keyboard plugin not available:', error);
  }
};

/**
 * Hide keyboard
 */
export const hideKeyboard = async () => {
  if (!isNativeApp()) return;
  
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    await Keyboard.hide();
  } catch (error) {
    console.log('Keyboard plugin not available:', error);
  }
};

/**
 * Get device info
 */
export const getDeviceInfo = async () => {
  if (!isNativeApp()) {
    return {
      platform: 'web',
      model: 'browser',
      manufacturer: 'N/A'
    };
  }
  
  try {
    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    return info;
  } catch (error) {
    console.log('Device info not available:', error);
    return null;
  }
};

/**
 * Check network status
 */
export const getNetworkStatus = async () => {
  if (!isNativeApp()) {
    return { connected: navigator.onLine };
  }
  
  try {
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return status;
  } catch (error) {
    console.log('Network plugin not available:', error);
    return { connected: navigator.onLine };
  }
};

/**
 * Share content (native share sheet)
 */
export const shareContent = async (title, text, url) => {
  if (!isNativeApp()) {
    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        console.log('Share failed:', error);
        return false;
      }
    }
    return false;
  }
  
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share with'
    });
    return true;
  } catch (error) {
    console.log('Share plugin not available:', error);
    return false;
  }
};

/**
 * Open URL in system browser
 */
export const openUrl = async (url) => {
  if (!isNativeApp()) {
    window.open(url, '_blank');
    return;
  }
  
  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } catch (error) {
    window.open(url, '_blank');
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!isNativeApp()) {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
  
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.requestPermissions();
    return result.receive;
  } catch (error) {
    console.log('Notifications not available:', error);
    return 'denied';
  }
};

export default {
  isNativeApp,
  setupStatusBar,
  hideSplashScreen,
  setupBackButton,
  triggerHaptic,
  showKeyboard,
  hideKeyboard,
  getDeviceInfo,
  getNetworkStatus,
  shareContent,
  openUrl,
  requestNotificationPermission
};