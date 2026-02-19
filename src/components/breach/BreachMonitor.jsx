import React, { useState } from 'react';
import {
  Mail, Search, CheckCircle, XCircle, RefreshCw,
  AlertCircle, Shield, Info, X, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { validateEmail } from '../../utils/emailValidator';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import BreachCard from './BreachCard';
import BreachTimeline from './BreachTimeline';

const BreachMonitor = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [breaches, setBreaches] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [apiMessage, setApiMessage] = useState('');
  const [apiStatus, setApiStatus] = useState(''); // 'ok' | 'partial' | 'unavailable'
  const [error, setError] = useState('');
  const [badges, setBadges] = useState(['🛡️ First Day', '⚡ Quick Learner']);
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
    setApiMessage('');
  };

  const handleBreachCheck = async () => {
    // Validate email before proceeding
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setEmailError(emailCheck.message);
      return;
    }

    setChecking(true);
    setHasChecked(false);
    setBreaches([]);
    setError('');
    setApiMessage('');

    try {
      // Use backend API (requires login, uses HIBP)
      const res = await api.checkEmailBreach(email);
      const foundBreaches = res.data?.breaches || [];

      setBreaches(foundBreaches);
      setHasChecked(true);

      if (res.data?.breachCount > 0) {
        setApiStatus('ok');
        setApiMessage(`Found ${res.data.breachCount} breach${res.data.breachCount !== 1 ? 'es' : ''} via HaveIBeenPwned database.`);
        earnBadge('🔍 Breach Hunter');
      } else {
        setApiStatus('ok');
        setApiMessage('No known breaches found for this email address.');
        earnBadge('✅ Clean Record');
      }

      // Log to history
      setCheckHistory(prev => [{
        id: Date.now(),
        email,
        timestamp: new Date().toISOString(),
        breachCount: foundBreaches.length,
        breached: foundBreaches.length > 0
      }, ...prev.slice(0, 9)]);

    } catch (err) {
      const message = err.message || 'Breach check failed';

      if (message.includes('HIBP') || message.includes('api key') || message.includes('API')) {
        // API not configured — tell user clearly
        setApiStatus('unavailable');
        setApiMessage('');
        setHasChecked(true);
        setError('Breach database not configured. Ask your admin to set the HIBP_API_KEY in the backend .env file.');
      } else if (message.includes('connect') || message.includes('fetch') || message.includes('server')) {
        setError('Cannot reach the backend server. Make sure it is running on port 5001.');
      } else if (message.includes('token') || message.includes('auth') || message.includes('unauthorized')) {
        setError('Please log in to check for email breaches.');
      } else {
        setError(message);
      }
      setHasChecked(false);
    }

    setChecking(false);
  };

  const earnBadge = (badge) => {
    setBadges(prev => prev.includes(badge) ? prev : [...prev, badge]);
  };

  const handleBreachAction = (action, breach) => {
    if (action === 'change') earnBadge('🔐 Password Master');
  };

  const isEmailReady = email && !emailError;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 mt-6">

      {/* Badges */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-gray-800">Badges Earned</h2>
          <span className="ml-auto text-sm text-blue-600 font-medium">{badges.length}/15</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, idx) => (
            <span key={idx} className="text-2xl bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border-2 border-blue-200">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Email Breach Check */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-800">Check Email for Breaches</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Enter a real email address to check if it has appeared in known data breaches.
        </p>

        {/* Email Input */}
        <div className="mb-2">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={e => e.key === 'Enter' && isEmailReady && !checking && handleBreachCheck()}
                placeholder="your.real.email@domain.com"
                className={`w-full pl-9 pr-4 py-3 rounded-2xl border-2 outline-none transition-all ${
                  emailError ? 'border-red-300 bg-red-50' :
                  isEmailReady ? 'border-green-300 bg-green-50' :
                  'border-purple-200 focus:border-purple-400'
                }`}
              />
              {isEmailReady && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
            </div>
            <button
              onClick={handleBreachCheck}
              disabled={checking || !isEmailReady}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {checking ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Checking...</>
              ) : (
                <><Search className="w-5 h-5" /> Check</>
              )}
            </button>
          </div>

          {/* Real-time email feedback */}
          {emailError && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 ml-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" /> {emailError}
            </p>
          )}
          {!emailError && email && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1 ml-1">
              <CheckCircle className="w-3 h-3" /> Valid email format
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Result Banner */}
        {hasChecked && !error && (
          <div className={`mt-4 rounded-2xl p-4 border-2 ${
            breaches.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start gap-3">
              {breaches.length > 0 ? (
                <>
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-800">
                      ⚠️ {breaches.length} Breach{breaches.length > 1 ? 'es' : ''} Found
                    </h3>
                    <p className="text-sm text-red-600 mt-0.5">
                      <strong>{email}</strong> was found in {breaches.length} data breach{breaches.length > 1 ? 'es' : ''}.
                      Update your passwords immediately.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-800">🎉 No Breaches Found!</h3>
                    <p className="text-sm text-green-600 mt-0.5">
                      <strong>{email}</strong> has not appeared in any known data breaches.
                    </p>
                  </div>
                </>
              )}
            </div>
            {apiMessage && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 ml-9">
                <Info className="w-3 h-3" /> {apiMessage}
              </p>
            )}
          </div>
        )}

        {/* HIBP info */}
        <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-xs text-blue-700 flex items-start gap-2">
            <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>Powered by <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer"
              className="underline font-medium flex-inline items-center gap-0.5">HaveIBeenPwned <ExternalLink className="w-2.5 h-2.5 inline" /></a>.
              Only the hash of your email is used — your actual email is never stored externally.
              Consistent results: the same email will always show the same breaches.
            </span>
          </p>
        </div>
      </div>

      {/* Password Strength Tester */}
      <div className="space-y-4">
        <input
          type="password"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          placeholder="Test a password strength (never stored or sent)"
          className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 outline-none text-gray-800 bg-white/80 backdrop-blur"
        />
        <PasswordStrengthMeter password={testPassword} onBadgeEarned={earnBadge} />
      </div>

      {/* Breach Details */}
      {breaches.length > 0 && (
        <>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-red-500">⚠️</span>
              Breach Details ({breaches.length})
            </h2>
            {breaches.map((breach, idx) => (
              <BreachCard key={idx} breach={breach} onAction={handleBreachAction} />
            ))}
          </div>
          <BreachTimeline breaches={breaches} />
        </>
      )}

      {/* Check History */}
      {checkHistory.length > 0 && (
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-800">Recent Checks</h2>
          </div>
          <div className="space-y-2">
            {checkHistory.slice(0, 5).map(record => (
              <div key={record.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 text-sm">{record.email}</div>
                  <div className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString()}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  record.breached ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {record.breached ? `${record.breachCount} breach${record.breachCount !== 1 ? 'es' : ''}` : 'Clean'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-300">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-purple-800 mb-2">💡 Pro Security Tips</h3>
            <ul className="space-y-1.5 text-sm text-purple-700">
              <li>• Check your email monthly to stay ahead of new breaches</li>
              <li>• Use unique passwords for every account — never reuse them</li>
              <li>• Enable 2FA on email, banking, and social media accounts</li>
              <li>• If your email is breached, change your password immediately</li>
              <li>• Check breaches for every email address you own</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreachMonitor;
