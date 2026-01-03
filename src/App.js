import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from 'react';
import { Shield, Activity, Award, TrendingUp, Lock, Smartphone, AlertTriangle, Zap, Star, Fingerprint, Brain } from 'lucide-react';

// AI Behavior Analysis Engine (Local)
class BehaviorAnalyzer {
  constructor() {
    this.patterns = [];
    this.threshold = 0.7;
  }

  analyzePattern(appData) {
    const features = this.extractFeatures(appData);
    const anomalyScore = this.calculateAnomalyScore(features);
    
    return {
      isAnomaly: anomalyScore > this.threshold,
      score: anomalyScore,
      risk: this.getRiskLevel(anomalyScore)
    };
  }

  extractFeatures(appData) {
    const hourOfDay = new Date().getHours();
    const isNightTime = hourOfDay < 6 || hourOfDay > 22;
    const accessFrequency = appData.accessCount || 0;
    
    return {
      timeAnomaly: isNightTime ? 0.6 : 0.2,
      frequencyAnomaly: accessFrequency > 100 ? 0.8 : accessFrequency > 50 ? 0.5 : 0.3,
      permissionAnomaly: (appData.permissions?.length || 0) > 5 ? 0.7 : 0.2
    };
  }

  calculateAnomalyScore(features) {
    const weights = { timeAnomaly: 0.3, frequencyAnomaly: 0.4, permissionAnomaly: 0.3 };
    return Object.keys(features).reduce((sum, key) => {
      return sum + (features[key] * weights[key]);
    }, 0);
  }

  getRiskLevel(score) {
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }
}

// Simulated biometric authentication
const authenticateBiometric = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Math.random() > 0.1), 1500);
  });
};

const SecurityToolkit = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [apps, setApps] = useState([
    { id: 1, name: 'Instagram', icon: '📷', lastAccess: '2 min ago', accessCount: 47, risk: 'low', category: 'social', permissions: ['camera', 'storage'] },
    { id: 2, name: 'Banking App', icon: '🏦', lastAccess: '1 hour ago', accessCount: 3, risk: 'low', category: 'finance', permissions: ['contacts', 'location'] },
    { id: 3, name: 'Gmail', icon: '📧', lastAccess: '5 min ago', accessCount: 23, risk: 'low', category: 'email', permissions: ['contacts', 'storage'] },
    { id: 4, name: 'WhatsApp', icon: '💬', lastAccess: '1 min ago', accessCount: 89, risk: 'low', category: 'social', permissions: ['camera', 'storage', 'contacts'] },
    { id: 5, name: 'Unknown App', icon: '❓', lastAccess: '10 min ago', accessCount: 156, risk: 'high', category: 'unknown', permissions: ['camera', 'contacts', 'location', 'storage', 'microphone', 'sms'] }
  ]);
  const [securityScore, setSecurityScore] = useState(72);
  const [streak, setStreak] = useState(5);
  const [badges, setBadges] = useState(['🛡️ First Day', '⚡ Quick Learner']);
  const [selectedApp, setSelectedApp] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [behaviorAnalyzer] = useState(new BehaviorAnalyzer());
  const [currentScreen, setCurrentScreen] = useState('dashboard');

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
      setNotifications([{
        id: Date.now(),
        type: 'success',
        title: '✅ Welcome Back!',
        message: 'All systems secured and monitoring active',
        time: 'Just now',
        risk: 'low'
      }]);
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

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getScoreColor = () => {
    if (securityScore >= 80) return 'text-green-400';
    if (securityScore >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block p-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 shadow-2xl">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              SecureU
            </h1>
            <p className="text-purple-600 text-lg">Your Free AI Security Guardian 🎓</p>
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-purple-200">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Authenticate to access your security dashboard</p>
              </div>

              <button
                onClick={handleBiometricAuth}
                disabled={isAuthenticating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-6 h-6" />
                    Unlock with Biometrics
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-purple-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">100%</div>
                  <div className="text-xs text-gray-500">Free Forever</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-500">AI</div>
                  <div className="text-xs text-gray-500">Powered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">24/7</div>
                  <div className="text-xs text-gray-500">Protected</div>
                </div>
              </div>

              {notifications.length > 0 && (
                <div className="mt-4 space-y-2">
                  {notifications.slice(0, 2).map(notif => (
                    <div key={notif.id} className={`p-3 rounded-xl text-sm ${notif.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {notif.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-purple-600">
            <p>🔒 Your data stays private and secure</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">SecureU</h1>
            </div>
            <p className="text-purple-100 text-sm">AI-Powered Protection • Free Forever</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
            <Lock className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Security Score</span>
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className={`text-5xl font-bold ${getScoreColor()}`}>{securityScore}</div>
            <div className="mt-3 bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500" style={{ width: `${securityScore}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {securityScore >= 80 ? '🎉 Excellent security!' : securityScore >= 60 ? '⚠️ Needs improvement' : '🚨 Critical risks found'}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Daily Streak</span>
            </div>
            <div className="text-5xl font-bold text-orange-400">{streak}🔥</div>
            <p className="text-xs text-gray-500 mt-3">Keep checking daily to maintain your streak!</p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Badges Earned</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <span key={idx} className="text-2xl">{badge}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{badges.length}/10 collected</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-800">Real-Time Alerts</h2>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 3).map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl flex items-start gap-3 ${
                  notif.risk === 'high' ? 'bg-red-50 border-2 border-red-200' :
                  notif.risk === 'medium' ? 'bg-yellow-50 border-2 border-yellow-200' :
                  'bg-green-50 border-2 border-green-200'
                }`}>
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    notif.risk === 'high' ? 'text-red-600' :
                    notif.risk === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{notif.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-800">AI Behavior Analysis</h2>
            </div>
            <button onClick={analyzeWithAI} disabled={analyzing} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Deep AI Scan
                </>
              )}
            </button>
          </div>

          {anomalyDetected && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-700 mb-1">⚠️ Security Anomaly Detected!</h3>
                <p className="text-sm text-red-600">Unusual activity patterns found. Check the AI insight below for details.</p>
              </div>
            </div>
          )}

          {aiInsight && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">🤖</div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-700 mb-2">Claude AI Security Insight</h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
                </div>
              </div>
            </div>
          )}

          {!aiInsight && !analyzing && (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click "Run Deep AI Scan" to get personalized security insights</p>
              <p className="text-xs mt-2">Powered by Claude AI • Analyzes behavior patterns in real-time</p>
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">App Access Monitor</h2>
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">{apps.length} Apps Tracked</span>
          </div>

          <div className="space-y-3">
            {apps.map(app => (
              <div key={app.id} onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{app.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{app.name}</h3>
                      <p className="text-xs text-gray-500">Last access: {app.lastAccess}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-3">
                      <div className="text-sm font-bold text-gray-700">{app.accessCount}</div>
                      <div className="text-xs text-gray-500">accesses</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getRiskColor(app.risk)}`}>
                      {app.risk.toUpperCase()}
                    </span>
                  </div>
                </div>

                {selectedApp === app.id && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">Category</div>
                        <div className="font-bold text-purple-600">{app.category}</div>
                      </div>
                      <div className="bg-pink-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">Daily Avg</div>
                        <div className="font-bold text-pink-600">{Math.round(app.accessCount / 7)}</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">Permissions</div>
                        <div className="font-bold text-blue-600">{app.permissions.length}</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">Status</div>
                        <div className="font-bold text-green-600">Active</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-600 mb-2">Permissions Used:</div>
                      <div className="flex flex-wrap gap-2">
                        {app.permissions.map((perm, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{perm}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-300">
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-purple-800 mb-2">💡 Pro Security Tip</h3>
              <p className="text-sm text-purple-700">
                Apps with 100+ accesses deserve extra attention. Unknown apps with excessive permissions are major red flags 🚩. 
                Run AI scans regularly and maintain that streak! You're doing great! 🎯
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t-2 border-purple-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-around">
            <button onClick={() => setCurrentScreen('dashboard')} className="flex flex-col items-center gap-1 text-purple-600">
              <Shield className="w-6 h-6" />
              <span className="text-xs font-semibold">Dashboard</span>
            </button>
            <button onClick={() => setCurrentScreen('analysis')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <Brain className="w-6 h-6" />
              <span className="text-xs">AI Analysis</span>
            </button>
            <button onClick={() => setCurrentScreen('lock')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <Lock className="w-6 h-6" />
              <span className="text-xs">App Lock</span>
            </button>
            <button onClick={() => setCurrentScreen('stats')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">Stats</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityToolkit;

