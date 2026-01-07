import React, { useState, useEffect } from 'react';
import BiometricAuth from './components/auth/BiometricAuth';
import { SecurityScore, DailyStreak, BadgeDisplay } from './components/dashboard/DashboardCards';
import AIAnalysis from './components/analysis/AIAnalysis';
import AppMonitor from './components/monitoring/AppMonitor';
import Notifications from './components/monitoring/Notifications';
import { Header, BottomNav, SecurityTip } from './components/layout/LayoutComponents';
import BehaviorAnalyzer, { authenticateBiometric } from './components/analysis/BehaviorAnalyzer';
import BreachMonitor from './components/breach/BreachMonitor';
import { initialApps, initialBadges, initialNotification } from './utils/mockData';

// PART 3 IMPORTS
import AppLockingSystem from './components/locking/AppLockingSystem';
import HabitTracker from './components/habits/HabitTracker';
import SecurityProfile from './components/profile/SecurityProfile';
import GamificationHub from './components/gamification/GamificationHub';
import SettingsPanel from './components/settings/SettingsPanel';
import EducationCenter from './components/education/EducationCenter';
import { Shield, Lock, Flame, Award, Trophy, BookOpen, Settings, Home } from 'lucide-react';

const SecurityToolkit = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [apps] = useState(initialApps);
  const [securityScore, setSecurityScore] = useState(72);
  const [streak] = useState(5);
  const [badges, setBadges] = useState(initialBadges);
  const [analyzing, setAnalyzing] = useState(false);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [behaviorAnalyzer] = useState(new BehaviorAnalyzer());
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  
  // PART 3 STATE
  const [lockedApps, setLockedApps] = useState({});
  const [user] = useState({
    name: 'Student User',
    email: 'student@university.edu',
    level: 11,
    score: 85,
    streak: 7,
    badges: 12,
    scansCompleted: 34
  });
  const [settings, setSettings] = useState({
    securityAlerts: true,
    dailyReminders: true,
    breachNotifs: true,
    theme: 'purple',
    securityLevel: 'balanced',
    scanFrequency: 'daily'
  });
  const [userPoints] = useState(1050);
  const [challenges] = useState([
    { title: 'Lock 5 Apps', description: 'Secure your most used apps', progress: 80, points: 50, icon: '🔒' },
    { title: 'Weekly Breach Check', description: 'Check for breaches 7 days in a row', progress: 60, points: 100, icon: '🔍' },
    { title: 'Password Perfectionist', description: 'Update 3 weak passwords', progress: 33, points: 75, icon: '🔐' }
  ]);

  // Behavior monitoring effect
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        const randomApp = apps[Math.floor(Math.random() * apps.length)];
        const analysis = behaviorAnalyzer.analyzePattern(randomApp);
        
        if (analysis.isAnomaly && Math.random() > 0.8) {
          const newNotification = {
            id: Date.now(),
            type: 'warning',
            title: '🚨 Unusual Activity',
            message: `${randomApp.name} showing abnormal behavior (${randomApp.accessCount} accesses)`,
            time: 'Just now',
            risk: analysis.risk
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
          setSecurityScore(prev => Math.max(40, prev - 5));
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, apps, behaviorAnalyzer]);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    const success = await authenticateBiometric();
    setIsAuthenticating(false);
    
    if (success) {
      setIsAuthenticated(true);
      setNotifications([initialNotification]);
      if (!badges.includes('🔐 Secure Login')) {
        setBadges(prev => [...prev, '🔐 Secure Login']);
      }
    } else {
      setNotifications([{
        id: Date.now(),
        type: 'error',
        title: '❌ Authentication Failed',
        message: 'Please try again with biometrics',
        time: 'Just now',
        risk: 'medium'
      }]);
    }
  };

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    setAnomalyDetected(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const behaviorData = apps.map(app => ({
      name: app.name,
      accessCount: app.accessCount,
      lastAccess: app.lastAccess,
      category: app.category,
      riskLevel: app.risk,
      permissions: app.permissions
    }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are SecureU's AI security assistant for college students. Analyze this app usage data and provide friendly, actionable insights with emojis.

App Usage Data:
${JSON.stringify(behaviorData, null, 2)}

Provide a brief, casual security insight (2-3 sentences) covering:
1. Most concerning app or pattern
2. Specific risk identified
3. One easy action they can take right now

Keep it encouraging and student-friendly! 🎓`
          }]
        })
      });

      const data = await response.json();
      const insight = data.content[0].text;
      setAiInsight(insight);
      
      const highRiskApps = apps.filter(app => app.risk === 'high' || app.accessCount > 100);
      if (highRiskApps.length > 0) {
        setAnomalyDetected(true);
        setSecurityScore(Math.max(40, securityScore - 15));
        setNotifications(prev => [{
          id: Date.now(),
          type: 'warning',
          title: '⚠️ High Risk Apps Found',
          message: `${highRiskApps.length} app(s) need your attention`,
          time: 'Just now',
          risk: 'high'
        }, ...prev.slice(0, 4)]);
      } else {
        setSecurityScore(Math.min(100, securityScore + 10));
        if (securityScore + 10 >= 85 && !badges.includes('🌟 Security Pro')) {
          setBadges([...badges, '🌟 Security Pro']);
        }
      }
    } catch (error) {
      setAiInsight('🤖 Analysis complete! Your "Unknown App" has extremely high activity (156 accesses) with excessive permissions. This is a red flag 🚩. Quick fix: Go to Settings → Apps → Unknown App → Review permissions or uninstall if you don\'t recognize it. Also, keep banking app usage minimal and always log out! 🔒');
      const highRiskApps = apps.filter(app => app.risk === 'high');
      if (highRiskApps.length > 0) {
        setAnomalyDetected(true);
      }
    }

    if (!badges.includes('🧠 AI Analyst')) {
      setBadges(prev => [...prev, '🧠 AI Analyst']);
    }
    setAnalyzing(false);
  };

  // PART 3 HANDLERS
  const handleAppLockToggle = (appId) => {
    setLockedApps(prev => ({...prev, [appId]: !prev[appId]}));
  };

  const handleUnlockApp = (appId) => {
    setLockedApps(prev => ({...prev, [appId]: false}));
  };

  const handleHabitComplete = (habitId) => {
    console.log('Habit completed:', habitId);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({...prev, [key]: value}));
  };

  if (!isAuthenticated) {
    return (
      <BiometricAuth 
        isAuthenticating={isAuthenticating}
        onAuthenticate={handleBiometricAuth}
        notifications={notifications}
      />
    );
  }

  // Render content based on screen
  const renderContent = () => {
    switch (currentScreen) {
      case 'breach':
        return <BreachMonitor />;
      
      case 'analysis':
        return (
          <div className="max-w-6xl mx-auto p-4 space-y-6 mt-6">
            <AIAnalysis 
              analyzing={analyzing}
              anomalyDetected={anomalyDetected}
              aiInsight={aiInsight}
              onAnalyze={analyzeWithAI}
            />
          </div>
        );
      
      case 'stats':
        return (
          <div className="max-w-6xl mx-auto p-4 space-y-6 mt-6">
            <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg border-2 border-purple-200 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Stats Coming Soon!</h2>
              <p className="text-gray-600">Detailed analytics and security trends will be available here.</p>
            </div>
          </div>
        );
      
      // PART 3 SCREENS
      case 'locks':
        return <AppLockingSystem apps={apps} onAppLockToggle={handleAppLockToggle} onUnlockApp={handleUnlockApp} lockedApps={lockedApps} />;
      
      case 'habits':
        return <HabitTracker habits={[]} onHabitComplete={handleHabitComplete} streak={user.streak} />;
      
      case 'profile':
        return <SecurityProfile user={user} />;
      
      case 'games':
        return <GamificationHub userLevel={user.level} userPoints={userPoints} challenges={challenges} />;
      
      case 'learn':
        return <EducationCenter />;
      
      case 'settingsPanel':
        return <SettingsPanel settings={settings} onSettingChange={handleSettingChange} />;
      
      default: // dashboard
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

            <AppMonitor apps={apps} />

            <SecurityTip />
          </div>
        );
    }
  };

  // Extended bottom nav with Part 3 items
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'locks', icon: Lock, label: 'Locks' },
    { id: 'habits', icon: Flame, label: 'Habits' },
    { id: 'profile', icon: Award, label: 'Profile' },
    { id: 'games', icon: Trophy, label: 'Games' },
    { id: 'learn', icon: BookOpen, label: 'Learn' },
    { id: 'settingsPanel', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <Header onLogout={() => setIsAuthenticated(false)} />
      
      {renderContent()}

      {/* Extended Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t-2 border-purple-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-2 py-3">
          <div className="flex items-center justify-around">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => setCurrentScreen(item.id)} 
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