import React from 'react';
import { Shield, Fingerprint } from 'lucide-react';

const BiometricAuth = ({ isAuthenticating, onAuthenticate, notifications }) => {
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
          <p className="text-purple-600 text-lg">Your Free AI Security Guardian 🎓</p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-purple-200">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
              <p className="text-gray-600">Authenticate to access your security dashboard</p>
            </div>

            <button
              onClick={onAuthenticate}
              disabled={isAuthenticating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="w-6 h-6" />
                  Unlock with Biometrics
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-purple-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">100%</div>
                <div className="text-xs text-gray-500">Free Forever</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-500">AI</div>
                <div className="text-xs text-gray-500">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">24/7</div>
                <div className="text-xs text-gray-500">Protected</div>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="mt-4 space-y-2">
                {notifications.slice(0, 2).map(notif => (
                  <div key={notif.id} className={`p-3 rounded-xl text-sm ${notif.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {notif.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-purple-600">
          <p>🔒 Your data stays private and secure</p>
        </div>
      </div>
    </div>
  );
};

export default BiometricAuth;