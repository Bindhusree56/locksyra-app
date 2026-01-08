import { Capacitor } from '@capacitor/core';

let BiometricAuth;

const loadBiometricPlugin = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  
  try {
    const plugin = await import('@capacitor-community/biometric');
    return plugin.BiometricAuth;
  } catch (error) {
    console.log('Biometric plugin not installed');
    return null;
  }
};

export const checkBiometricAvailable = async () => {
  BiometricAuth = BiometricAuth || await loadBiometricPlugin();
  if (!BiometricAuth) return false;
  
  try {
    const result = await BiometricAuth.isAvailable();
    return result.isAvailable;
  } catch (error) {
    return false;
  }
};

export const authenticateWithBiometric = async () => {
  BiometricAuth = BiometricAuth || await loadBiometricPlugin();
  if (!BiometricAuth) return false;
  
  try {
    const result = await BiometricAuth.verify({
      reason: 'Authenticate to access SecureU',
      title: 'Biometric Authentication',
      subtitle: 'Use your fingerprint or face',
      description: 'SecureU uses biometric authentication for security',
      negativeButtonText: 'Cancel',
      maxAttempts: 3
    });
    
    return result.verified;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};