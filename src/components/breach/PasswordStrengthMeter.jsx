import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { analyzePasswordStrength } from '../../utils/breachUtils';

const PasswordStrengthMeter = ({ password, onBadgeEarned }) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = analyzePasswordStrength(password);
  
  useEffect(() => {
    if (strength.score >= 80 && password) {
      onBadgeEarned('🔐 Password Master');
    }
  }, [strength.score, password, onBadgeEarned]);
  
  const getStrengthColor = () => {
    switch(strength.level) {
      case 'excellent': return 'from-green-400 to-emerald-400';
      case 'strong': return 'from-blue-400 to-cyan-400';
      case 'medium': return 'from-yellow-400 to-orange-400';
      case 'weak': return 'from-red-400 to-pink-400';
      default: return 'from-gray-300 to-gray-400';
    }
  };
  
  const getStrengthText = () => {
    switch(strength.level) {
      case 'excellent': return '🎉 Excellent! Fort Knox level!';
      case 'strong': return '💪 Strong password!';
      case 'medium': return '⚠️ Could be stronger';
      case 'weak': return '🚨 Too weak!';
      default: return 'Enter a password to check';
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Key className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">Password Strength Analyzer</h2>
      </div>
      
      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          placeholder="Enter password to analyze..."
          className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-purple-200 focus:border-purple-400 outline-none text-gray-800"
          readOnly
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {password && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Strength: {strength.score}/100</span>
              <span className="text-sm font-bold text-purple-600">{getStrengthText()}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getStrengthColor()} transition-all duration-500`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
          
          {strength.feedback.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
              <h3 className="font-bold text-yellow-800 text-sm mb-2">💡 Suggestions to Improve:</h3>
              <ul className="space-y-1">
                {strength.feedback.map((tip, idx) => (
                  <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;