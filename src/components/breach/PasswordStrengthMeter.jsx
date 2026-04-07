import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, AlertTriangle, CheckCircle, Shield, HelpCircle, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  analyzePasswordStrength,
  strengthColors,
  strengthLabels,
} from '../../utils/passwordStrength';
import { checkPasswordBreach } from '../../utils/breachUtils';
import GlassCard from '../common/GlassCard';

const PasswordStrengthMeter = ({ password, onBadgeEarned }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [breachStatus, setBreachStatus] = useState(null);
  const [checkingBreach, setCheckingBreach] = useState(false);

  const strength = analyzePasswordStrength(password);
  const currentColors = strengthColors[strength.level] || strengthColors.none;

  useEffect(() => {
    if (strength.score >= 80 && password) {
      onBadgeEarned('🔐 Password Master');
    }
  }, [strength.score, password, onBadgeEarned]);

  useEffect(() => {
    let timeout;
    if (password && password.length >= 4) {
      setCheckingBreach(true);
      timeout = setTimeout(async () => {
        const result = await checkPasswordBreach(password);
        setBreachStatus(result);
        setCheckingBreach(false);
        if (!result.breached && strength.score >= 80) {
          onBadgeEarned('🛡️ Breach-Free Pro');
        }
      }, 900);
    } else {
      setBreachStatus(null);
      setCheckingBreach(false);
    }
    return () => clearTimeout(timeout);
  }, [password]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GlassCard className="p-8" delay={0.2}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Key className="w-5 h-5 text-primary-400" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Entropy Analysis</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-400/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">K-Anonymity Verified</span>
        </div>
      </div>

      <div className="relative mb-8 group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          readOnly
          placeholder="Awaiting entropy input..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl border border-white/5 bg-slate-950/40 text-sm font-mono text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600 cursor-default"
        />
        <button
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!password ? (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 opacity-30"
          >
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Identity Vector</p>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Strength HUD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-500">Security Gradient</span>
                <span className={currentColors.text}>{strengthLabels[strength.level]}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.score}%` }}
                  className={`h-full ${currentColors.bar} transition-all duration-1000`}
                />
              </div>
              <p className="text-right text-[10px] font-bold text-slate-500">BITS OF ENTROPY: {strength.score}</p>
            </div>

            {/* Breach Status HUD */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {checkingBreach ? (
                  <motion.div 
                    key="checking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl bg-primary-500/5 border border-primary-500/10 flex items-center gap-4"
                  >
                    <RefreshCw className="w-5 h-5 text-primary-400 animate-spin" />
                    <p className="text-xs font-black text-primary-400 uppercase tracking-widest">Querying Global Breach Arrays...</p>
                  </motion.div>
                ) : breachStatus && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl border ${
                      breachStatus.breached ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${breachStatus.breached ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                        {breachStatus.breached ? <AlertTriangle className="w-6 h-6 text-rose-400" /> : <CheckCircle className="w-6 h-6 text-emerald-400" />}
                      </div>
                      <div>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${breachStatus.breached ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {breachStatus.breached ? 'Identity Compromised' : 'Identity Isolated'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{breachStatus.message}</p>
                        {breachStatus.breached && (
                          <div className="mt-4 flex items-center gap-2 p-2 px-3 bg-rose-500/20 rounded-xl w-fit">
                             <AlertCircle className="w-3 h-3 text-rose-400" />
                             <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Action Required: Immediate Rotation</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Suggestions HUD */}
            {strength.feedback.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-950/40 border border-white/5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <HelpCircle className="w-3 h-3 text-primary-400" /> Improvement Protocol
                </h3>
                <ul className="space-y-2">
                  {strength.feedback.map((tip, idx) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-xs text-slate-500 flex items-start gap-3"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center opacity-30">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
          <Shield className="w-3 h-3" /> Zero-Knowledge Analysis Channel
        </p>
      </div>
    </GlassCard>
  );
};

export default PasswordStrengthMeter;