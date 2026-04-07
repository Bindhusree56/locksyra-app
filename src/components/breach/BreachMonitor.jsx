import React, { useState } from 'react';
import {
  Mail, Search, CheckCircle, XCircle, RefreshCw,
  AlertCircle, Shield, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { validateEmail } from '../../utils/emailValidator';

import BreachCard from './BreachCard';
import BreachTimeline from './BreachTimeline';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const BreachMonitor = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [checking, setChecking] = useState(false);
  const [breaches, setBreaches] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [error, setError] = useState('');
  const [checkHistory, setCheckHistory] = useState([]);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val) {
      const check = validateEmail(val);
      setEmailError(check.valid ? '' : check.message);
    } else {
      setEmailError('');
    }
    setError('');
    setHasChecked(false);
    setBreaches([]);
  };

  const handleBreachCheck = async () => {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.message);
      return;
    }

    setChecking(true);
    setHasChecked(false);
    setBreaches([]);
    setError('');

    try {
      const res = await api.checkEmailBreach(email);
      const foundBreaches = res.data?.breaches || [];

      setBreaches(foundBreaches);
      setHasChecked(true);

      if (res.data?.breachCount > 0) {
        // Earned badge logic removed as badges are unused in this view
      } else {
        // Earned badge logic removed
      }

      setCheckHistory(prev => [{
        id: Date.now(),
        email,
        timestamp: new Date().toISOString(),
        breachCount: foundBreaches.length,
        breached: foundBreaches.length > 0
      }, ...prev.slice(0, 9)]);

    } catch (err) {
      setError(err.message || 'Breach check failed');
      setHasChecked(false);
    }
    setChecking(false);
  };

  const handleBreachAction = (action) => {
    // Action handling logic
  };

  const isEmailReady = email && !emailError;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Breach Monitor</h1>
          <p className="text-slate-400 mt-2">Surface web & darknet data exposure analysis.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => api.exportBreachHistory()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-white/5 transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Export History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Input & History */}
        <div className="lg:col-span-1 space-y-8">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Identity Scan</h2>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={e => e.key === 'Enter' && isEmailReady && !checking && handleBreachCheck()}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-slate-950/40 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600"
                />
              </div>

              {emailError && (
                <p className="text-[11px] font-semibold text-rose-400 px-2">{emailError}</p>
              )}

              <button
                onClick={handleBreachCheck}
                disabled={checking || !isEmailReady}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-900/40"
              >
                {checking ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {checking ? 'Scanning...' : 'Execute Scan'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3 text-emerald-500" /> Secure Hashing Enabled
              </p>
            </div>
          </GlassCard>

          {checkHistory.length > 0 && (
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Logs</h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">Session Only</span>
              </div>
              <div className="space-y-3">
                {checkHistory.slice(0, 4).map(record => (
                  <div key={record.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{record.email}</p>
                      <p className="text-[10px] text-slate-500">{new Date(record.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                      record.breached ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {record.breached ? record.breachCount : 'Safe'}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!hasChecked ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass-card border-dashed border-2 border-white/5 opacity-50 rounded-3xl"
              >
                <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                  <Mail className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-300">Ready for Scan</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs">Enter your email to initiate a deep-scan against known data exposure databases.</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold">Scan Interrupted</p>
                  <p className="text-sm opacity-80 mt-1">{error}</p>
                  <button onClick={handleBreachCheck} className="mt-4 text-xs font-bold underline hover:no-underline flex items-center gap-2">
                    <RefreshCw className="w-3 h-3" /> Retry Scan
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-3xl border ${
                  breaches.length > 0 
                    ? 'bg-rose-500/10 border-rose-400/20' 
                    : 'bg-emerald-500/10 border-emerald-400/20'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${breaches.length > 0 ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                      {breaches.length > 0 ? <XCircle className="w-8 h-8 text-rose-400" /> : <CheckCircle className="w-8 h-8 text-emerald-400" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {breaches.length > 0 ? `${breaches.length} Exposures Detected` : 'Environment Secured'}
                      </h2>
                      <p className="text-sm text-slate-400">Scan completed for <span className="text-white font-bold">{email}</span></p>
                    </div>
                  </div>
                </div>

                {breaches.map((breach, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <BreachCard breach={breach} onAction={handleBreachAction} />
                  </motion.div>
                ))}

                {breaches.length > 0 && <BreachTimeline breaches={breaches} />}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips Section */}
          <GlassCard className="bg-primary-600/5 border-primary-500/10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-500/10 rounded-2xl">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Proactive Security Directives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    'Check monthly for new leakage logs',
                    'Implement hardware-grade 2FA (TOTP)',
                    'Use unique vault-stored passwords',
                    'Zero-trust password reuse policy'
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default BreachMonitor;
