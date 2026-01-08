import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Check if running as native app
export const isNativeApp = () => {
  return Capacitor.isNativePlatform();
};

// Get platform (ios, android, web)
export const getPlatform = () => {
  return Capacitor.getPlatform();
};

// Haptic feedback
export const triggerHaptic = async (style = 'medium') => {
  if (!isNativeApp()) return;
  
  try {
    const impactStyle = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    }[style] || ImpactStyle.Medium;
    
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.log('Haptic not available');
  }
};

// Status bar configuration
export const setupStatusBar = async () => {
  if (!isNativeApp()) return;
  
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#8B5CF6' });
  } catch (error) {
    console.log('StatusBar not available');
  }
};

// Hide splash screen
export const hideSplashScreen = async () => {
  if (!isNativeApp()) return;
  
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.log('SplashScreen not available');
  }
};

// Handle back button (Android)
export const setupBackButton = (callback) => {
  if (!isNativeApp() || getPlatform() !== 'android') return;
  
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (callback) {
      callback(canGoBack);
    } else if (!canGoBack) {
      CapApp.exitApp();
    } else {
      window.history.back();
    }
  });
};