import React from 'react';
import { Shield, Lock, Brain, TrendingUp, Star, Mail, LogOut } from 'lucide-react';

export const Header = ({ onLogout, user }) => {
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 shadow-lg sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <Shield className="w-7 h-7 text-white" />
            <h1 className="text-2xl font-bold text-white">Locksyra</h1>
          </div>
          <p className="text-purple-100 text-xs">
            {user ? `👋 ${displayName}` : 'AI-Powered Protection'} • Free Forever
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white text-sm"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export const BottomNav = ({ currentScreen, onScreenChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Shield, label: 'Dashboard' },
    { id: 'analysis', icon: Brain, label: 'AI Analysis' },
    { id: 'breach', icon: Mail, label: 'Breach Check' },
    { id: 'stats', icon: TrendingUp, label: 'Stats' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t-2 border-purple-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
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

export const SecurityTip = () => (
  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-300">
    <div className="flex items-start gap-3">
      <Star className="w-6 h-6 text-purple-600 flex-shrink-0" />
      <div>
        <h3 className="font-bold text-purple-800 mb-2">💡 Pro Security Tip</h3>
        <p className="text-sm text-purple-700">
          Use the Password Vault to store all your credentials securely — they're encrypted and tied to your account.
          Run the AI Scan regularly and keep that streak going! You're doing great! 🎯
        </p>
      </div>
    </div>
  </div>
);