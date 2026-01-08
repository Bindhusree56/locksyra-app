import React from 'react';
import { Shield, Lock, Brain, TrendingUp, Star, Mail } from 'lucide-react';

export const Header = ({ onLogout }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 shadow-lg sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Locksyra</h1>
          </div>
          <p className="text-purple-100 text-sm">AI-Powered Protection • Free Forever</p>
        </div>
        <button 
          onClick={onLogout} 
          className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
        >
          <Lock className="w-5 h-5 text-white" />
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

export const SecurityTip = () => {
  return (
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
  );
};