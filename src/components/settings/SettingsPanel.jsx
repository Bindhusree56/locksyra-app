// SettingsPanel.jsx
import React from 'react';
import { Settings, Bell, Palette, Shield, Activity, Download } from 'lucide-react';

const SettingsPanel = ({ settings, onSettingChange }) => {
  const themes = [
    { id: 'purple', name: 'Purple Dream', colors: 'from-purple-500 to-pink-500' },
    { id: 'blue', name: 'Ocean Blue', colors: 'from-blue-500 to-cyan-500' },
    { id: 'green', name: 'Nature Green', colors: 'from-green-500 to-emerald-500' },
    { id: 'orange', name: 'Sunset Orange', colors: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        </div>

        {/* Notifications */}
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Security Alerts</span>
              <input type="checkbox" checked={settings.securityAlerts} onChange={(e) => onSettingChange('securityAlerts', e.target.checked)} className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Daily Reminders</span>
              <input type="checkbox" checked={settings.dailyReminders} onChange={(e) => onSettingChange('dailyReminders', e.target.checked)} className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Breach Notifications</span>
              <input type="checkbox" checked={settings.breachNotifs} onChange={(e) => onSettingChange('breachNotifs', e.target.checked)} className="w-5 h-5" />
            </label>
          </div>
        </div>

        {/* Theme Customization */}
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => onSettingChange('theme', theme.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.theme === theme.id ? 'border-purple-500' : 'border-gray-200'
                }`}
              >
                <div className={`h-12 rounded-lg bg-gradient-to-r ${theme.colors} mb-2`} />
                <div className="text-sm font-medium text-gray-700">{theme.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Sensitivity */}
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Level
          </h3>
          <select 
            value={settings.securityLevel}
            onChange={(e) => onSettingChange('securityLevel', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none"
          >
            <option value="relaxed">Relaxed - Fewer alerts</option>
            <option value="balanced">Balanced - Recommended</option>
            <option value="strict">Strict - Maximum protection</option>
          </select>
        </div>

        {/* Auto-Scan Frequency */}
        <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Auto-Scan Frequency
          </h3>
          <select 
            value={settings.scanFrequency}
            onChange={(e) => onSettingChange('scanFrequency', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none"
          >
            <option value="hourly">Every Hour</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="manual">Manual Only</option>
          </select>
        </div>

        {/* Export Data */}
        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Export Security Report
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;