import React, { useState, useEffect } from 'react';
import {
  Shield, Mail, Lock, User, Eye, EyeOff,
  AlertCircle, CheckCircle, UserPlus, ArrowRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthPage = ({ onAuthenticate }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'not_found' | 'wrong_password' | 'already_exists' | 'generic'
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [prefillEmail, setPrefillEmail] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const update = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    // Clear errors when user starts typing
    if (error) { setError(''); setErrorType(''); }
  };

  // Backend health check
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('http://localhost:5001/health');
        const data = await res.json();
        setServerStatus(data.success ? 'online' : 'offline');
      } catch {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  // Pre-fill email when switching to register after "not found" error
  useEffect(() => {
    if (prefillEmail && mode === 'register') {
      setForm(f => ({ ...f, email: prefillEmail }));
    }
  }, [mode, prefillEmail]);

  const validateForm = () => {
    if (!form.email || !form.password) return ['Email and password are required', 'generic'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return ['Please enter a valid email address', 'generic'];
    if (form.password.length < 8) return ['Password must be at least 8 characters long', 'generic'];
    if (mode === 'register') {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
        return ['Password needs uppercase, lowercase & a number', 'generic'];
      if (form.password !== form.confirmPassword) return ['Passwords do not match', 'generic'];
    }
    return null;
  };

  // Classify the backend error message to decide what UI to show
  const classifyError = (message = '') => {
    const msg = message.toLowerCase();
    if (msg.includes('user not found') || msg.includes('not found') || msg.includes('no account'))
      return 'not_found';
    if (msg.includes('invalid email or password') || msg.includes('incorrect password') || msg.includes('wrong password'))
      return 'wrong_password';
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate'))
      return 'already_exists';
    return 'generic';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setSuccess('');

    const validation = validateForm();
    if (validation) { setError(validation[0]); setErrorType(validation[1]); return; }

    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login(form.email, form.password);
      } else {
        result = await register(form.email, form.password, form.firstName, form.lastName);
      }

      if (result.success) {
        setSuccess(mode === 'login' ? '✅ Welcome back! Signing you in...' : '✅ Account created! Taking you in...');
        setTimeout(() => onAuthenticate(true, result.user), 800);
      } else {
        const type = classifyError(result.error);
        setError(result.error || 'Authentication failed');
        setErrorType(type);
        // Save email so we can pre-fill if they switch to register
        if (type === 'not_found') setPrefillEmail(form.email);
      }
    } catch (err) {
      const type = classifyError(err.message);
      setError(err.message || 'Something went wrong. Please try again.');
      setErrorType(type);
      if (type === 'not_found') setPrefillEmail(form.email);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode, keepEmail = false) => {
    setMode(newMode);
    setError('');
    setErrorType('');
    setSuccess('');
    setForm(f => ({
      email: keepEmail ? f.email : '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    }));
  };

  // One-click "register with this email" from error banner
  const handleRegisterInstead = () => {
    setPrefillEmail(form.email);
    switchMode('register', true);
  };

  // One-click "sign in instead" from already-exists error
  const handleLoginInstead = () => {
    switchMode('login', true);
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return [
      { label: 'Weak', color: 'bg-red-400', width: '25%' },
      { label: 'Fair', color: 'bg-yellow-400', width: '50%' },
      { label: 'Good', color: 'bg-blue-400', width: '75%' },
      { label: 'Strong', color: 'bg-green-400', width: '100%' }
    ][score] || { label: 'Weak', color: 'bg-red-400', width: '25%' };
  };

  const strength = mode === 'register' ? getPasswordStrength() : null;

  // ─── Smart Error Banner ──────────────────────────────────────────────
  const renderErrorBanner = () => {
    if (!error) return null;

    // "User not found" — invite them to register
    if (errorType === 'not_found') {
      return (
        <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-orange-800 text-sm">Account not found</p>
              <p className="text-orange-700 text-xs mt-0.5">
                <span className="font-medium">{form.email}</span> is not registered yet.
                New here? Create a free account in seconds!
              </p>
            </div>
            <button onClick={() => setError('')} className="text-orange-400 hover:text-orange-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={handleRegisterInstead}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Create Account with this Email
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // "Wrong password" — clear hint
    if (errorType === 'wrong_password') {
      return (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-red-800 text-sm">Incorrect password</p>
            <p className="text-red-600 text-xs mt-0.5">
              The password you entered doesn't match this account. Please try again.
            </p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    // "Email already registered" — invite to login
    if (errorType === 'already_exists') {
      return (
        <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-blue-800 text-sm">Email already registered</p>
              <p className="text-blue-700 text-xs mt-0.5">
                <span className="font-medium">{form.email}</span> already has an account.
                Sign in instead!
              </p>
            </div>
            <button onClick={() => setError('')} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={handleLoginInstead}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-md transition-all"
            >
              <Lock className="w-4 h-4" />
              Sign In Instead
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // Generic error
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-700 flex-1">{error}</p>
        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-block p-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-3 shadow-2xl">
            <Shield className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            Locksyra
          </h1>
          <p className="text-purple-600 text-sm">Your Free Security Guardian 🎓</p>
        </div>

        {/* Server Status */}
        <div className={`flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs font-medium ${
          serverStatus === 'online'  ? 'bg-green-50 text-green-700 border border-green-200' :
          serverStatus === 'offline' ? 'bg-red-50 text-red-700 border border-red-200' :
                                       'bg-gray-50 text-gray-400 border border-gray-200'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            serverStatus === 'online' ? 'bg-green-500' :
            serverStatus === 'offline' ? 'bg-red-500' : 'bg-gray-300'
          }`} />
          {serverStatus === 'online'  ? '🟢 Backend connected — MongoDB running' :
           serverStatus === 'offline' ? '🔴 Backend offline — run: cd backend && npm start' :
                                        'Checking server connection...'}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/60 rounded-2xl p-1 mb-5 border border-purple-200 shadow-sm">
          {[
            { id: 'login',    label: '🔐 Sign In' },
            { id: 'register', label: '✨ Create Account' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => switchMode(tab.id)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                mode === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-purple-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur rounded-3xl p-7 shadow-2xl border border-purple-100">

          {/* Register heading */}
          {mode === 'register' && (
            <div className="mb-5 text-center">
              <h2 className="text-xl font-bold text-gray-800">Create your free account</h2>
              <p className="text-xs text-gray-500 mt-1">All your security data — synced & encrypted</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name fields — register only */}
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { field: 'firstName', placeholder: 'First name e.g. Jane' },
                  { field: 'lastName',  placeholder: 'Last name e.g. Doe'  }
                ].map(({ field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                      {field === 'firstName' ? 'First Name' : 'Last Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="text"
                        value={form[field]}
                        onChange={update(field)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-purple-100 focus:border-purple-400 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className={`w-full pl-9 pr-3 py-3 rounded-xl border-2 outline-none bg-white transition-colors ${
                    errorType === 'not_found' ? 'border-orange-300 bg-orange-50' :
                    errorType === 'already_exists' ? 'border-blue-300 bg-blue-50' :
                    'border-purple-100 focus:border-purple-400'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder={mode === 'register' ? 'Min. 8 chars, mixed case + number' : 'Your password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={`w-full pl-9 pr-10 py-3 rounded-xl border-2 outline-none bg-white transition-colors ${
                    errorType === 'wrong_password' ? 'border-red-300 bg-red-50' :
                    'border-purple-100 focus:border-purple-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar — register only */}
              {mode === 'register' && form.password && strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-500`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm Password — register only */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    placeholder="Repeat your password"
                    required
                    autoComplete="new-password"
                    className={`w-full pl-9 pr-10 py-3 rounded-xl border-2 outline-none bg-white transition-colors ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : form.confirmPassword && form.password === form.confirmPassword
                        ? 'border-green-300 bg-green-50'
                        : 'border-purple-100 focus:border-purple-400'
                    }`}
                  />
                  {form.confirmPassword && form.password === form.confirmPassword ? (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>
            )}

            {/* ── Smart Error Banner ── */}
            {renderErrorBanner()}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || serverStatus === 'offline'}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-bold text-base transition-all transform hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? <Lock className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {mode === 'login' ? 'Sign In' : 'Create Free Account'}
                </>
              )}
            </button>

            {/* Bottom switch hint */}
            <p className="text-center text-xs text-gray-400 pt-1">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('register')} className="text-purple-600 font-semibold hover:underline">
                    Register here
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="text-purple-600 font-semibold hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>

            <p className="text-center text-xs text-gray-400">
              🔒 Encrypted & stored on your local MongoDB
            </p>
          </form>
        </div>

        {/* Password requirements checklist — register only */}
        {mode === 'register' && form.password && (
          <div className="mt-4 bg-white/70 backdrop-blur rounded-2xl p-4 border border-purple-200 text-xs">
            <p className="font-semibold text-gray-600 mb-2">Password requirements</p>
            <ul className="space-y-1">
              {[
                [form.password.length >= 8,               'At least 8 characters'],
                [/[A-Z]/.test(form.password),             'One uppercase letter (A–Z)'],
                [/[a-z]/.test(form.password),             'One lowercase letter (a–z)'],
                [/[0-9]/.test(form.password),             'One number (0–9)'],
                [/[^a-zA-Z0-9]/.test(form.password),     'Special character (!@#$…) — recommended']
              ].map(([met, label], i) => (
                <li key={i} className={`flex items-center gap-2 transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="text-base leading-none">{met ? '✅' : '○'}</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthPage;