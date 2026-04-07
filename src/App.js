import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import { SecurityScore, DailyStreak, BadgeDisplay } from './components/dashboard/DashboardCards';
import AIAnalysis from './components/analysis/AIAnalysis';
import Notifications from './components/monitoring/Notifications';
import BreachMonitor from './components/breach/BreachMonitor';
import PhishingDetector from './components/security/PhishingDetector';
import SecurityNewsFeed from './components/security/SecurityNewsFeed';
import PasswordManager from './components/security/PasswordManager';
import EducationCenter from './components/education/EducationCenter';
import SettingsPanel from './components/settings/SettingsPanel';
import { Newspaper, Key, Mail, ChevronRight, Activity, Cpu, Zap, Radar } from 'lucide-react';
import { initialBadges } from './utils/mockData';
import AppLayout from './components/layout/AppLayout';
import GlassCard from './components/common/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityToolkit = () => {
  const { user, loading } = useAuth();
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
    theme: 'slate',
    securityLevel: 'balanced',
    scanFrequency: 'daily'
  });

  useEffect(() => {
    if (user) {
      setNotifications([{
        id: Date.now(),
        type: 'success',
        title: 'PROTOCOL INITIALIZED',
        message: `Welcome back, Operative ${user.firstName || 'Alpha'}. Perimeter scan complete.`,
        time: 'Just now',
        risk: 'low'
      }]);
    }
  }, [user]);

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    setAnomalyDetected(false);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setAiInsight('🤖 Security Protocol: Your current credential density is optimal, but we detect potential exposure in secondary domains. Recommend rotating high-value vault entries every 90 days. Keep your digital perimeter tight! 🛡️');
    setSecurityScore(s => Math.min(100, s + 5));
    if (!badges.includes('🧠 AI Analyst')) setBadges(prev => [...prev, '🧠 AI Analyst']);
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      title: 'AI SCAN COMPLETE',
      message: 'Heuristic analysis has identified 3 minor integrity improvements.',
      time: 'Just now',
      risk: 'low'
    }, ...prev.slice(0, 4)]);
    setAnalyzing(false);
  };

  const handleNavigation = (screen) => setCurrentScreen(screen);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 blur-[120px] animate-pulse" />
        <div className="text-center relative z-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-t-2 border-primary-500 rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(14,165,233,0.4)]"
          />
          <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] animate-pulse">Syncing Cryptographic Kernels...</h2>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const renderContent = () => {
    switch (currentScreen) {
      case 'phishing': return <PhishingDetector />;
      case 'news': return <SecurityNewsFeed />;
      case 'passwords': return <PasswordManager />;
      case 'breach': return <BreachMonitor />;
      case 'learn': return <EducationCenter />;
      case 'settingsPanel':
        return <SettingsPanel settings={settings} onSettingChange={(k, v) => setSettings(p => ({ ...p, [k]: v }))} />;
      default:
        return (
          <div className="space-y-12 max-w-7xl mx-auto">
            {/* Header / Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SecurityScore score={securityScore} />
              <DailyStreak streak={streak} />
              <BadgeDisplay badges={badges} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
               <div className="xl:col-span-2 space-y-8">
                  <AIAnalysis 
                    analyzing={analyzing} 
                    anomalyDetected={anomalyDetected} 
                    aiInsight={aiInsight} 
                    onAnalyze={analyzeWithAI} 
                  />

                  {/* Quick Actions Grid */}
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Tactical Inventory</h2>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awaiting Command</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-slate-500" />
                         </div>
                         <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-slate-500" />
                         </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { id: 'phishing', icon: Radar, title: 'Domain Sweep', desc: 'Scan malicious vectors', color: 'text-primary-400', glow: 'shadow-primary-900/20' },
                        { id: 'passwords', icon: Key, title: 'Vault Access', desc: 'Secure credential storage', color: 'text-emerald-400', glow: 'shadow-emerald-900/20' },
                        { id: 'breach', icon: Mail, title: 'Breach Ping', desc: 'Monitor leak signals', color: 'text-rose-400', glow: 'shadow-rose-900/20' },
                        { id: 'news', icon: Newspaper, title: 'Intel Feed', desc: 'Real-time security data', color: 'text-amber-400', glow: 'shadow-amber-900/20' }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <GlassCard key={item.id} delay={idx * 0.1} className="p-0 border-none group">
                            <button 
                              onClick={() => handleNavigation(item.id)}
                              className="w-full p-8 text-left h-full flex flex-col"
                            >
                              <div className={`w-14 h-14 rounded-[20px] mb-6 flex items-center justify-center bg-slate-950/80 border border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:border-primary-500/30 ${item.glow}`}>
                                <Icon className={`w-6 h-6 ${item.color} drop-shadow-[0_0_8px_currentColor]`} />
                              </div>
                              <h3 className="font-black text-sm text-white uppercase tracking-wider mb-2 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6 italic">{item.desc}</p>
                              
                              <div className="mt-auto flex items-center text-[10px] font-black text-primary-400 uppercase tracking-widest group-hover:translate-x-2 transition-all">
                                Execute Protocol <ChevronRight className="w-3 h-3 ml-2" />
                              </div>
                            </button>
                          </GlassCard>
                        );
                      })}
                    </div>
                  </section>
               </div>

               <div className="space-y-8">
                  <Notifications notifications={notifications} />
                  
                  <GlassCard className="p-8 bg-primary-500/5 group" delay={0.4}>
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary-500/10 rounded-lg group-hover:bg-primary-500/20 transition-colors">
                           <Zap className="w-5 h-5 text-primary-400" />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Rapid Insight</h4>
                     </div>
                     <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                       "Biometric authentication combined with a segmented vault architecture reduces identity theft risk by 97.4%."
                     </p>
                  </GlassCard>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout currentScreen={currentScreen} onNavigate={handleNavigation}>
      <AnimatePresence mode="wait">
        <motion.div
           key={currentScreen}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
};

export default SecurityToolkit;
