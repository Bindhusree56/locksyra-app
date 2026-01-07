import React, { useState } from 'react';
import { Shield, Mail, Lock } from 'lucide-react';

const BiometricAuth = ({ onAuthenticate, notifications }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsAuthenticating(true);
    
    // Simulate authentication (replace with real backend later)
    setTimeout(() => {
      // Store email in localStorage for the session
      localStorage.setItem('userEmail', email);
      onAuthenticate(true);
      setIsAuthenticating(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 shadow-2xl">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            SecureU
          </h1>
          <p className="text-purple-600 text-lg">Your Free Security Guardian 🎓</p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-purple-200">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
              <p className="text-gray-600">Sign in to access your security dashboard</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  Sign In
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>🔒 Your data stays private and secure</p>
              <p className="mt-2 text-xs">Free forever for students • No credit card required</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BiometricAuth;