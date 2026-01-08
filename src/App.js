import React, { useState, useEffect } from 'react';
import BiometricAuth from './components/auth/BiometricAuth';
import { SecurityScore, DailyStreak, BadgeDisplay } from './components/dashboard/DashboardCards';
import AIAnalysis from './components/analysis/AIAnalysis';
import Notifications from './components/monitoring/Notifications';
import { Header, SecurityTip } from './components/layout/LayoutComponents';
import BreachMonitor from './components/breach/BreachMonitor';
import { initialBadges } from './utils/mockData';

// NEW IMPORTS FOR MOBILE
import { 
  isNativeApp, 
  setupStatusBar, 
  hideSplashScreen, 
  setupBackButton,
  triggerHaptic 
} from './utils/mobileFeatures';

// EXISTING IMPORTS
import PhishingDetector from './components/security/PhishingDetector';
import SecurityNewsFeed from './components/security/SecurityNewsFeed';
import PasswordManager from './components/security/PasswordManager';
import EducationCenter from './components/education/EducationCenter';
import SettingsPanel from './components/settings/SettingsPanel';

import { Shield, Lock, Newspaper, Key, BookOpen, Settings, Home, Mail } from 'lucide-react';

const SecurityToolkit = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [securityScore, setSecurityScore] = useState(72);
  const [streak] = useState(5);
  const [badges, setBadges] = useState(initialBadges);
  const [analyzing, setAnalyzing] = useState(false);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  
  const [settings, setSettings] = useState({
    securityAlerts: true,
    dailyReminders: true,
    breachNotifs: true,
    theme: 'purple',
    securityLevel: 'balanced',
    scanFrequency: 'daily'
  });

  // MOBILE SETUP
  useEffect(() => {
    const initMobile = async () => {
      const native = isNativeApp();
      setIsMobile(native);
      
      if (native) {
        await setupStatusBar();
        await hideSplashScreen();
        
        // Handle Android back button
        setupBackButton((canGoBack) => {
          if (currentScreen !== 'dashboard') {
            setCurrentScreen('dashboard');
          } else if (!canGoBack) {
            // Show exit confirmation
            if (window.confirm('Exit LockSyra?')) {
              const { App } = require('@capacitor/app');
              App.exitApp();
            }
          }
        });
      }
    };
    
    initMobile();
  }, [currentScreen]);

  const analyzeWithAI = async () => {
    // Add haptic feedback for mobile
    await triggerHaptic('medium');
    
    setAnalyzing(true);
    setAnomalyDetected(false);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userEmail = localStorage.getItem('userEmail') || 'user@university.edu';
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are LockSyra's AI security assistant for college students. Analyze the security status for ${userEmail} and provide a brief, encouraging security tip (2-3 sentences max).

Focus on:
1. A specific actionable tip for today
2. Why it matters for student security
3. Keep it friendly and motivating

Give practical advice they can do right now!`
          }]
        })
      });

      const data = await response.json();
      const insight = data.content[0].text;
      setAiInsight(insight);
      
      setSecurityScore(Math.min(100, securityScore + 5));
      
      if (!badges.includes('🧠 AI Analyst')) {
        setBadges(prev => [...prev, '🧠 AI Analyst']);
      }
      
      // Success haptic
      await triggerHaptic('light');
      
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        title: '✅ AI Analysis Complete',
        message: 'Security recommendations generated',
        time: 'Just now',
        risk: 'low'
      }, ...prev.slice(0, 4)]);
      
    } catch (error) {
      setAiInsight('🤖 Quick Security Tip: Check your saved passwords for weak ones and enable 2FA on your most important accounts (email, banking, social media). Small steps = big protection! 🛡️');
    }

    setAnalyzing(false);
  };

  const handleSettingChange = (key, value) => {
    triggerHaptic('light');
    setSettings(prev => ({...prev, [key]: value}));
  };

  const handleAuthenticate = (success) => {
    if (success) {
      setIsAuthenticated(true);
      setNotifications([{
        id: Date.now(),
        type: 'success',
        title: '✅ Welcome Back!',
        message: 'All systems secured and monitoring active',
        time: 'Just now',
        risk: 'low'
      }]);
    }
  };

  const handleNavigation = async (screen) => {
    await triggerHaptic('light');
    setCurrentScreen(screen);
  };

  if (!isAuthenticated) {
    return (
      <BiometricAuth 
        onAuthenticate={handleAuthenticate}
        notifications={notifications}
        isMobile={isMobile}
      />
    );
  }

  const renderContent = () => {
    switch (currentScreen) {
      case 'phishing':
        return <PhishingDetector />;
      case 'news':
        return <SecurityNewsFeed />;
      case 'passwords':
        return <PasswordManager />;
      case 'breach':
        return <BreachMonitor />;
      case 'learn':
        return <EducationCenter />;
      case 'settingsPanel':
        return <SettingsPanel settings={settings} onSettingChange={handleSettingChange} />;
      default:
        return (
          <div className="max-w-6xl mx-auto p-4 space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SecurityScore score={securityScore} />
              <DailyStreak streak={streak} />
              <BadgeDisplay badges={badges} />
            </div>

            <Notifications notifications={notifications} />

            <AIAnalysis 
              analyzing={analyzing}
              anomalyDetected={anomalyDetected}
              aiInsight={aiInsight}
              onAnalyze={analyzeWithAI}
            />

            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Security Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleNavigation('phishing')}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4 hover:shadow-lg transition-all text-left"
                >
                  <Shield className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="font-bold text-gray-800">Check Suspicious Link</h3>
                  <p className="text-sm text-gray-600">Scan URLs for phishing</p>
                </button>
                
                <button
                  onClick={() => handleNavigation('passwords')}
                  className="bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200 rounded-2xl p-4 hover:shadow-lg transition-all text-left"
                >
                  <Key className="w-8 h-8 text-cyan-500 mb-2" />
                  <h3 className="font-bold text-gray-800">Audit Passwords</h3>
                  <p className="text-sm text-gray-600">Check for weak passwords</p>
                </button>
                
                <button
                  onClick={() => handleNavigation('breach')}
                  className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 hover:shadow-lg transition-all text-left"
                >
                  <Mail className="w-8 h-8 text-red-500 mb-2" />
                  <h3 className="font-bold text-gray-800">Breach Check</h3>
                  <p className="text-sm text-gray-600">See if your data leaked</p>
                </button>
                
                <button
                  onClick={() => handleNavigation('news')}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 hover:shadow-lg transition-all text-left"
                >
                  <Newspaper className="w-8 h-8 text-purple-500 mb-2" />
                  <h3 className="font-bold text-gray-800">Security News</h3>
                  <p className="text-sm text-gray-600">Stay updated on threats</p>
                </button>
              </div>
            </div>

            <SecurityTip />
          </div>
        );
    }
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'phishing', icon: Shield, label: 'Phishing' },
    { id: 'passwords', icon: Key, label: 'Passwords' },
    { id: 'breach', icon: Mail, label: 'Breach' },
    { id: 'news', icon: Newspaper, label: 'News' },
    { id: 'learn', icon: BookOpen, label: 'Learn' },
    { id: 'settingsPanel', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <Header onLogout={() => {
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
      }} />
      
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t-2 border-purple-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-2 py-3">
          <div className="flex items-center justify-around">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => handleNavigation(item.id)} 
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityToolkit;