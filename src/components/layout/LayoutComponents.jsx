import React from 'react';
import { Shield, Lock, Brain, TrendingUp, Star, Mail, LogOut, User, Zap, Info } from 'lucide-react';
import GlassCard from '../common/GlassCard';

/**
 * Derive a short display name from the user object.
 * Falls back through: firstName → email prefix → "User"
 */
const getDisplayName = (user) => {
  if (!user) return '';
  if (user.firstName) return user.firstName;
  if (user.email)     return user.email.split('@')[0];
  return 'User';
};

// ── Header (Deprecated in favor of Sidebar) ────────────────────────────────────────────────────────────────────

export const Header = ({ onLogout, user }) => {
  const name = getDisplayName(user);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary-400 flex-shrink-0" />
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Locksyra</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Ops Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
              <User className="w-4 h-4 text-primary-400" />
              <span className="text-white text-xs font-black uppercase tracking-tight truncate">
                {name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── BottomNav (Deprecated in favor of Mobile Sidebar) ──────────────────

export const BottomNav = ({ currentScreen, onScreenChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Shield, label: 'Home' },
    { id: 'analysis',  icon: Brain,  label: 'AI' },
    { id: 'breach',    icon: Mail,   label: 'Alerts' },
    { id: 'stats',     icon: TrendingUp, label: 'Stats' },
  ];

  return null; // Navigation now handled uniquely in Sidebar.jsx
};

// ── SecurityTip ───────────────────────────────────────────────────────────────

export const SecurityTip = () => (
  <GlassCard className="p-8 border-primary-500/10 group mb-8" delay={0.5}>
    <div className="flex items-start gap-5">
      <div className="p-3 bg-primary-500/10 rounded-2xl group-hover:bg-primary-500/20 transition-colors">
        <Zap className="w-6 h-6 text-primary-400" />
      </div>
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          Tactical Advisory
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-semibold italic">
          "Enable two-factor authentication on your most critical nodes—email, financial, and
          intelligence hubs. This single protocol blocks 99% of automated intrusion attempts. 
          Maintain your defensive posture; you're performing optimal security cycles!"
        </p>
      </div>
    </div>
  </GlassCard>
);