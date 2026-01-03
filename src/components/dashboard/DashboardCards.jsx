import React from 'react';
import { Shield, TrendingUp, Zap, Award } from 'lucide-react';
import { getScoreColor } from '../../utils/riskColors';

export const SecurityScore = ({ score }) => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium text-gray-600">Security Score</span>
        </div>
        <TrendingUp className="w-4 h-4 text-green-500" />
      </div>
      <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</div>
      <div className="mt-3 bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500" 
          style={{ width: `${score}%` }} 
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {score >= 80 ? '🎉 Excellent security!' : score >= 60 ? '⚠️ Needs improvement' : '🚨 Critical risks found'}
      </p>
    </div>
  );
};

export const DailyStreak = ({ streak }) => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-orange-500" />
        <span className="text-sm font-medium text-gray-600">Daily Streak</span>
      </div>
      <div className="text-5xl font-bold text-orange-400">{streak}🔥</div>
      <p className="text-xs text-gray-500 mt-3">Keep checking daily to maintain your streak!</p>
    </div>
  );
};

export const BadgeDisplay = ({ badges }) => {
  return (
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
  );
};