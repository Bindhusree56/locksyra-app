import React, { useState } from 'react';
import { 
  Settings, Bell, Palette, Activity, Download, 
  Trash2, Lock, Smartphone, ShieldCheck, AlertTriangle, 
  RefreshCw, ChevronRight, CheckCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import api from '../../services/api';

const Toggle = ({ enabled, onChange, label }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
    <div 
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-primary-500 shadow-[0_0_15px_rgba(56,189,248,0.4)]' : 'bg-slate-800'}`}
    >
      <motion.div 
        animate={{ x: enabled ? 26 : 4 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </div>
  </label>
);

const SettingsPanel = ({ settings, onSettingChange }) => {
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [message, setMessage] = useState('');

  const themes = [
    { id: 'slate', name: 'Cyber Slate', colors: 'from-slate-900 via-slate-800 to-slate-900', border: 'border-primary-500/50' },
    { id: 'purple', name: 'Neon Void', colors: 'from-purple-900 via-slate-900 to-purple-900', border: 'border-purple-500/30' },
    { id: 'emerald', name: 'Grid Matrix', colors: 'from-emerald-900 via-slate-900 to-emerald-900', border: 'border-emerald-500/30' },
    { id: 'rose', name: 'Threat Level', colors: 'from-rose-900 via-slate-900 to-rose-900', border: 'border-rose-500/30' }
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await api.exportBreachHistory();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `locksyra-breach-history-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setMessage({ type: 'error', text: 'Export failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const res = await api.generate2FA();
      setQrCode(res.data.qrCode);
      setShow2FA(true);
    } catch (err) {
      setMessage({ type: 'error', text: '2FA generation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      await api.verify2FA(twoFACode);
      setMessage({ type: 'success', text: '2FA Activated Successfully' });
      setShow2FA(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL: This will permanently delete your account and all encrypted vault data. This action is irreversible. Proceed?')) return;
    setLoading(true);
    try {
      await api.deleteAccount();
      window.location.reload();
    } catch (err) {
      setMessage({ type: 'error', text: 'Account deletion failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Control Center</h1>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <Settings className="w-4 h-4 text-primary-400" />
            <p className="text-sm font-medium italic">Operational Parameters & Security Protocols</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Settings Pane */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications & Core Preferences */}
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Signal Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Toggle 
                label="Critical Security Alerts" 
                enabled={settings.securityAlerts} 
                onChange={(val) => onSettingChange('securityAlerts', val)} 
              />
              <Toggle 
                label="Identity Breach Pings" 
                enabled={settings.breachNotifs} 
                onChange={(val) => onSettingChange('breachNotifs', val)} 
              />
              <Toggle 
                label="System Health Reminders" 
                enabled={settings.dailyReminders} 
                onChange={(val) => onSettingChange('dailyReminders', val)} 
              />
              <Toggle 
                label="AI Analysis Insight Memos" 
                enabled={settings.aiMemos !== false} 
                onChange={(val) => onSettingChange('aiMemos', val)} 
              />
            </div>
          </GlassCard>

          {/* Security Protocols */}
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Access Protocols</h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-950/40 border border-white/5">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Two-Factor Authentication</h4>
                  <p className="text-xs text-slate-500 font-medium italic">Standard TOTP MFA Protocol (Google/Authy)</p>
                </div>
                <button 
                  onClick={handleSetup2FA}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-black transition-all shadow-lg shadow-primary-900/20"
                >
                  INITIALIZE MFA
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-950/40 border border-white/5">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Defense Sensitivity</h4>
                  <p className="text-xs text-slate-500 font-medium italic">Adjust heuristic detection aggressively</p>
                </div>
                <select 
                  value={settings.securityLevel}
                  onChange={(e) => onSettingChange('securityLevel', e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-black focus:outline-none focus:border-primary-500"
                >
                  <option value="relaxed font-black">RELAXED</option>
                  <option value="balanced font-black">BALANCED</option>
                  <option value="strict font-black">ULTRA-STRICT</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Data Management */}
          <GlassCard className="p-8 border-rose-500/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Kernel Procedures</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleExport}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-primary-500/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                   <Download className="w-5 h-5 text-primary-400" />
                   <span className="text-xs font-black text-white uppercase tracking-widest">Breach Log (CSV)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
              </button>

              <button 
                onClick={handleDeleteAccount}
                className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500 hover:border-rose-400 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                   <Trash2 className="w-5 h-5 text-rose-400 group-hover:text-white" />
                   <span className="text-xs font-black text-rose-400 group-hover:text-white uppercase tracking-widest">WIPE ACCOUNT</span>
                </div>
                <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Theme & Meta Pane */}
        <div className="space-y-6">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Palette className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Visual Interface</h2>
            </div>
            
            <div className="space-y-4">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onSettingChange('theme', theme.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    settings.theme === theme.id ? theme.border : 'border-white/5 bg-slate-950/20 shadow-none grayscale hover:grayscale-0'
                  }`}
                >
                  <div className={`h-12 w-16 rounded-xl bg-gradient-to-br ${theme.colors} shadow-xl`} />
                  <div className="text-left">
                    <p className="text-sm font-black text-white uppercase tracking-tight">{theme.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol Variant</p>
                  </div>
                  {settings.theme === theme.id && <CheckCircle className="w-5 h-5 text-primary-400 ml-auto" />}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8 bg-slate-900/40 border-slate-800" hover={false}>
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Encryption Channel</h4>
             <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">TLS 1.3 / AES-256 Enabled</span>
             </div>
             <p className="text-[9px] text-slate-600 leading-relaxed uppercase tracking-tighter">
               All control directives are signed with your ephemeral session key before execution.
             </p>
          </GlassCard>
        </div>
      </div>

      {/* 2FA Setup Modal Overlay */}
      <AnimatePresence>
        {show2FA && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
          >
            <GlassCard className="max-w-md w-full p-8 relative">
              <button 
                onClick={() => setShow2FA(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <Smartphone className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">MFA Sync Protocol</h3>
                <p className="text-sm text-slate-400 mb-8">Scan the holographic matrix below with your authenticator agent.</p>

                <div className="p-4 bg-white rounded-3xl mb-8 inline-block shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                   <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="ENTER 6-DIGIT SYNC CODE"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl font-mono text-white tracking-[0.5em] focus:outline-none focus:border-primary-500"
                  />
                  <button 
                    onClick={handleVerify2FA}
                    disabled={loading || twoFACode.length !== 6}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white py-5 rounded-2xl font-black text-base transition-all disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-6 h-6 animate-spin mx-auto" /> : 'SYNCHRONIZE CREDENTIALS'}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Status Message */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] px-8 py-4 rounded-2xl font-black text-sm border-2 shadow-2xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-400' : 'bg-rose-950 border-rose-500 text-rose-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
            <button onClick={() => setMessage('')} className="ml-4 opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SettingsPanel;