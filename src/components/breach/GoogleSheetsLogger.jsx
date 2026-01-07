import React from 'react';
import { Database, LogIn, LogOut, CheckCircle } from 'lucide-react';

const GoogleSheetsLogger = ({ isSignedIn, onSignIn, onSignOut }) => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold text-gray-800">Google Sheets Integration</h2>
        </div>
        
        {isSignedIn ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Connected</span>
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-500">Not Connected</span>
        )}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
        {isSignedIn ? (
          <div>
            <p className="text-sm text-gray-700 mb-4">
              ✅ Your breach check history is being logged to Google Sheets. You can export your data anytime.
            </p>
            <button
              onClick={onSignOut}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Disconnect Google Sheets
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700 mb-4">
              📊 Connect your Google account to automatically log breach checks to a spreadsheet. Track your security history over time!
            </p>
            <button
              onClick={onSignIn}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Connect Google Sheets
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              🔒 Your data stays private. We only access your spreadsheets.
            </p>
          </div>
        )}
      </div>

      {isSignedIn && (
        <div className="mt-4 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <h3 className="font-bold text-blue-800 text-sm mb-2">📝 What gets logged:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Email addresses checked</li>
            <li>• Number of breaches found</li>
            <li>• Timestamp of each check</li>
            <li>• Actions taken (password changes, etc.)</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsLogger;