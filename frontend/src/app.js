import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import { SecurityScore, DailyStreak, BadgeDisplay } from './components/dashboard/DashboardCards';
import AIAnalysis from './components/analysis/AIAnalysis';
import Notifications from './components/monitoring/Notifications';
import { Header, SecurityTip } from './components/layout/LayoutComponents';
import BreachMonitor from './components/breach/BreachMonitor';
import PhishingDetector from './components/security/PhishingDetector';
import SecurityNewsFeed from './components/security/SecurityNewsFeed';
import PasswordManager from './components/security/PasswordManager';
import EducationCenter from './components/education/EducationCenter';
import SettingsPanel from './components/settings/SettingsPanel';
import { Shield, Lock, Newspaper, Key, BookOpen, Settings, Home, Mail } from 'lucide-react';
import { initialBadges } from './utils/mockData';
import { triggerHaptic } from './utils/mobileFeatures';

const SecurityToolkit = () => {
  const { user, logout, loading } = useAuth();
  const [securityScore, setSecurityScore] = useState(72);
  const [streak] = useState(5);
  const [badges, setBadges] = useState(initialBadges);
  const [analyzing, setAnalyzing] = useState(false);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [settings, setSettings] = useState({
    securityAlerts: true,
    dailyReminders: true,
    breachNotifs: true,
    theme: 'purple',
    securityLevel: 'balanced',
    scanFrequency: 'daily'
  });

  // Show welcome notification when user logs in
  useEffect(() => {
    if (user) {
      setNotifications([{
        id: Date.now(),
        type: 'success',
        title: `✅ Welcome back, ${user.firstName || user.email}!`,
        message: 'All systems secured and monitoring active',
        time: 'Just now',
        risk: 'low'
      }]);
    }
  }, [user]);

  const analyzeWithAI = async () => {
    await triggerHaptic('medium');
    setAnalyzing(true);
    setAnomalyDetected(false);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are LockSyra's AI security assistant for college students. Analyze security for ${user?.email} and give a brief, actionable security tip (2-3 sentences). Be friendly and motivating!`
          }]
        })
      });
      const data = await response.json();
      setAiInsight(data.content?.[0]?.text || '');
      setSecurityScore(s => Math.min(100, s + 5));
      if (!badges.includes('🧠 AI Analyst')) setBadges(prev => [...prev, '🧠 AI Analyst']);
      await triggerHaptic('light');
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        title: '✅ AI Analysis Complete',
        message: 'Security recommendations generated',
        time: 'Just now',
        risk: 'low'
      }, ...prev.slice(0, 4)]);
    } catch {
      setAiInsight('🤖 Quick Tip: Enable 2FA on all important accounts and use unique passwords for each site. Small steps = big protection! 🛡️');
    }
    setAnalyzing(false);
  };

  const handleNavigation = async (screen) => {
    await triggerHaptic('light');
    setCurrentScreen(screen);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-600 font-medium">Loading Locksyra...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show auth page
  if (!user) {
    return <AuthPage onAuthenticate={() => {}} />;
  }

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'phishing', icon: Shield, label: 'Phishing' },
    { id: 'passwords', icon: Key, label: 'Passwords' },
    { id: 'breach', icon: Mail, label: 'Breach' },
    { id: 'news', icon: Newspaper, label: 'News' },
    { id: 'learn', icon: BookOpen, label: 'Learn' },
    { id: 'settingsPanel', icon: Settings, label: 'Settings' }
  ];

  const renderContent = () => {
    switch (currentScreen) {
      case 'phishing': return <PhishingDetector />;
      case 'news': return <SecurityNewsFeed />;
      case 'passwords': return <PasswordManager />;
      case 'breach': return <BreachMonitor />;
      case 'learn': return <EducationCenter />;
      case 'settingsPanel': return <SettingsPanel settings={settings} onSettingChange={(k, v) => setSettings(p => ({ ...p, [k]: v }))} />;
      default: return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SecurityScore score={securityScore} />
            <DailyStreak streak={streak} />
            <BadgeDisplay badges={badges} />
          </div>
          <Notifications notifications={notifications} />
          <AIAnalysis analyzing={analyzing} anomalyDetected={anomalyDetected} aiInsight={aiInsight} onAnalyze={analyzeWithAI} />
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Security Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {[
                { id: 'phishing', icon: <Shield className="w-8 h-8 text-blue-500 mb-2" />, title: 'Check Suspicious Link', desc: 'Scan URLs for phishing', color: 'from-blue-50 to-cyan-50 border-blue-200' },
                { id: 'passwords', icon: <Key className="w-8 h-8 text-cyan-500 mb-2" />, title: 'Password Vault', desc: 'Manage saved passwords', color: 'from-cyan-50 to-teal-50 border-cyan-200' },
                { id: 'breach', icon: <Mail className="w-8 h-8 text-red-500 mb-2" />, title: 'Breach Check', desc: 'See if your data leaked', color: 'from-red-50 to-orange-50 border-red-200' },
                { id: 'news', icon: <Newspaper className="w-8 h-8 text-purple-500 mb-2" />, title: 'Security News', desc: 'Stay updated on threats', color: 'from-purple-50 to-pink-50 border-purple-200' }
              ].map(item => (
                <button key={item.id} onClick={() => handleNavigation(item.id)} className={`bg-gradient-to-r ${item.color} border-2 rounded-2xl p-4 hover:shadow-lg transition-all text-left`}>
                  {item.icon}
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <SecurityTip />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <Header onLogout={handleLogout} user={user} />
      {renderContent()}
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t-2 border-purple-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-2 py-3">
          <div className="flex items-center justify-around">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button key={item.id} onClick={() => handleNavigation(item.id)}
                  className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${isActive ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
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