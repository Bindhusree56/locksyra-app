import React from 'react';
import { Database } from 'lucide-react';

const GoogleSheetsLogger = ({ isSignedIn, onSignIn, onSignOut }) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-bold text-green-800 text-sm">Google Sheets Logging</h3>
            <p className="text-xs text-green-600">
              {isSignedIn ? '✅ Connected & Logging' : '⚠️ Not Connected'}
            </p>
          </div>
        </div>
        <button
          onClick={isSignedIn ? onSignOut : onSignIn}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isSignedIn 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isSignedIn ? 'Disconnect' : 'Connect Sheets'}
        </button>
      </div>
    </div>
  );
};

export default GoogleSheetsLogger;