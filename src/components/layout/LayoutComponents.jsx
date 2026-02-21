import React from 'react';
import { Shield, Lock, Brain, TrendingUp, Star, Mail, LogOut, User } from 'lucide-react';

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

// ── Header ────────────────────────────────────────────────────────────────────

export const Header = ({ onLogout, user }) => {
  const name = getDisplayName(user);

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-white flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">Locksyra</h1>
            <p className="text-purple-100 text-xs leading-tight">AI-Powered Protection</p>
          </div>
        </div>

        {/* Right side: greeting + logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
              <User className="w-4 h-4 text-white opacity-80" />
              <span className="text-white text-sm font-medium max-w-[120px] truncate">
                {name}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── BottomNav (legacy export kept for any remaining imports) ──────────────────

export const BottomNav = ({ currentScreen, onScreenChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Shield, label: 'Dashboard' },
    { id: 'analysis',  icon: Brain,  label: 'AI Analysis' },
    { id: 'breach',    icon: Mail,   label: 'Breach Check' },
    { id: 'stats',     icon: TrendingUp, label: 'Stats' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t-2 border-purple-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                className={`flex flex-col items-center gap-1 ${isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon className="w-6 h-6" />
                <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── SecurityTip ───────────────────────────────────────────────────────────────

export const SecurityTip = () => (
  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-300">
    <div className="flex items-start gap-3">
      <Star className="w-6 h-6 text-purple-600 flex-shrink-0" />
      <div>
        <h3 className="font-bold text-purple-800 mb-2">💡 Pro Security Tip</h3>
        <p className="text-sm text-purple-700">
          Enable two-factor authentication on your most important accounts — email, banking, and
          social media. It only takes 2 minutes and blocks 99% of automated attacks. You're doing
          great keeping your security score up! 🎯
        </p>
      </div>
    </div>
  </div>
);