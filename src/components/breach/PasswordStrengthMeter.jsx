import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { analyzePasswordStrength, checkPasswordBreach } from '../../utils/breachUtils';

const PasswordStrengthMeter = ({ password, onBadgeEarned }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [breachStatus, setBreachStatus] = useState(null);
  const [checkingBreach, setCheckingBreach] = useState(false);
  const strength = analyzePasswordStrength(password);
  
  useEffect(() => {
    if (strength.score >= 80 && password) {
      onBadgeEarned('🔐 Password Master');
    }
  }, [strength.score, password, onBadgeEarned]);
  
  // Check password against breach database (FREE API!)
  useEffect(() => {
    let timeout;
    if (password && password.length >= 4) {
      setCheckingBreach(true);
      // Debounce to avoid too many API calls
      timeout = setTimeout(async () => {
        const result = await checkPasswordBreach(password);
        setBreachStatus(result);
        setCheckingBreach(false);
        
        if (!result.breached && strength.score >= 80) {
          onBadgeEarned('🛡️ Breach-Free Pro');
        }
      }, 1000);
    } else {
      setBreachStatus(null);
    }
    
    return () => clearTimeout(timeout);
  }, [password]);
  
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
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          FREE API ✅
        </span>
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
          {/* Strength Analysis */}
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
          
          {/* Breach Status (FREE API Check) */}
          <div className="mb-4">
            {checkingBreach ? (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <h3 className="font-bold text-blue-800 text-sm">Checking Breach Database...</h3>
                  <p className="text-xs text-blue-600">Using FREE HaveIBeenPwned API</p>
                </div>
              </div>
            ) : breachStatus && (
              <div className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
                breachStatus.breached 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                {breachStatus.breached ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-800 text-sm">🚨 Password Compromised!</h3>
                      <p className="text-xs text-red-600 mt-1">{breachStatus.message}</p>
                      <p className="text-xs text-red-500 mt-2">
                        ⚠️ This password should NEVER be used. Hackers have it in their databases!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-green-800 text-sm">✅ Password Secure!</h3>
                      <p className="text-xs text-green-600 mt-1">{breachStatus.message}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Improvement Suggestions */}
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
      
      {!password && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-sm">Type a password above to see real-time analysis</p>
          <p className="text-xs mt-2">✅ 100% FREE breach checking • Privacy protected • No storage</p>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;