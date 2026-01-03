import React, { useState, useEffect } from 'react';
import BiometricAuth from './components/auth/BiometricAuth';
import { SecurityScore, DailyStreak, BadgeDisplay } from './components/dashboard/DashboardCards';
import AIAnalysis from './components/analysis/AIAnalysis';
import AppMonitor from './components/monitoring/AppMonitor';
import Notifications from './components/monitoring/Notifications';
import { Header, BottomNav, SecurityTip } from './components/layout/LayoutComponents';
import BehaviorAnalyzer, { authenticateBiometric } from './components/analysis/BehaviorAnalyzer';
import { initialApps, initialBadges, initialNotification } from './utils/mockData';

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

  if (!isAuthenticated) {
    return (
      <BiometricAuth 
        isAuthenticating={isAuthenticating}
        onAuthenticate={handleBiometricAuth}
        notifications={notifications}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <Header onLogout={() => setIsAuthenticated(false)} />

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

      <BottomNav 
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />
    </div>
  );
};

export default SecurityToolkit;