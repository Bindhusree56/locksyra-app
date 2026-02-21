import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import {
  analyzePasswordStrength,
  strengthColors,
  strengthLabels,
} from '../../utils/passwordStrength';
import { checkPasswordBreach } from '../../utils/breachUtils';

const PasswordStrengthMeter = ({ password, onBadgeEarned }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [breachStatus, setBreachStatus] = useState(null);
  const [checkingBreach, setCheckingBreach] = useState(false);

  const strength = analyzePasswordStrength(password);
  const colors = strengthColors[strength.level] || strengthColors.none;

  useEffect(() => {
    if (strength.score >= 80 && password) {
      onBadgeEarned('🔐 Password Master');
    }
  }, [strength.score, password, onBadgeEarned]);

  // Debounced breach check (FREE k-anonymity API)
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
    }
    return () => clearTimeout(timeout);
  }, [password]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Key className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">Password Strength Analyzer</h2>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          FREE API ✅
        </span>
      </div>

      {/* Display-only field — password is passed from parent */}
      <div className="relative mb-4">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          placeholder="Enter password to analyse…"
          className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-purple-200 focus:border-purple-400 outline-none text-gray-800"
          readOnly
        />
        <button
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {password && (
        <>
          {/* Score bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">
                Strength: {strength.score}/100
              </span>
              <span className="text-sm font-bold text-purple-600">
                {strengthLabels[strength.level]}
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bar} transition-all duration-500`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>

          {/* Breach status */}
          <div className="mb-4">
            {checkingBreach ? (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-bold text-blue-800 text-sm">Checking breach database…</p>
                  <p className="text-xs text-blue-600">Using FREE HaveIBeenPwned API</p>
                </div>
              </div>
            ) : breachStatus && (
              <div
                className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
                  breachStatus.breached ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}
              >
                {breachStatus.breached ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-red-800 text-sm">🚨 Password compromised!</p>
                      <p className="text-xs text-red-600 mt-1">{breachStatus.message}</p>
                      <p className="text-xs text-red-500 mt-2">
                        ⚠️ Never use this password — hackers already have it.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800 text-sm">✅ Password secure</p>
                      <p className="text-xs text-green-600 mt-1">{breachStatus.message}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Improvement suggestions */}
          {strength.feedback.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
              <p className="font-bold text-yellow-800 text-sm mb-2">💡 Suggestions to improve:</p>
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