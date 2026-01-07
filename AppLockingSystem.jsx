import React, { useState } from 'react';
import { Lock, Unlock, Settings, Clock } from 'lucide-react';

const AppLockingSystem = ({ apps, onAppLockToggle, onUnlockApp, lockedApps = {} }) => {
  const [unlockingApp, setUnlockingApp] = useState(null);
  const [biometricType, setBiometricType] = useState('fingerprint');
  const [lockSchedule, setLockSchedule] = useState({ enabled: false, start: '22:00', end: '07:00' });

  const handleBiometricUnlock = async (appId) => {
    setUnlockingApp(appId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.15;
    
    if (success) {
      onUnlockApp(appId);
      setUnlockingApp(null);
    } else {
      alert('❌ Biometric authentication failed. Try again.');
      setUnlockingApp(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-800">App Locking System</h2>
        </div>

        {/* Biometric Settings */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border-2 border-purple-200">
          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Lock Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Biometric Method</label>
              <select 
                value={biometricType}
                onChange={(e) => setBiometricType(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-400 outline-none"
              >
                <option value="fingerprint">👆 Fingerprint</option>
                <option value="face">👤 Face ID</option>
                <option value="pattern">🔢 Pattern Lock</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Auto-Lock Schedule
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lockSchedule.enabled}
                  onChange={(e) => setLockSchedule({...lockSchedule, enabled: e.target.checked})}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm text-gray-600">
                  {lockSchedule.start} - {lockSchedule.end}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* App List with Lock Toggle */}
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="bg-white rounded-2xl p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{app.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800">{app.name}</h3>
                    <p className="text-xs text-gray-500">{app.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {lockedApps[app.id] && (
                    <button
                      onClick={() => handleBiometricUnlock(app.id)}
                      disabled={unlockingApp === app.id}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {unlockingApp === app.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          Unlock
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => onAppLockToggle(app.id)}
                    className={`p-3 rounded-xl transition-all ${
                      lockedApps[app.id]
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {lockedApps[app.id] ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppLockingSystem;
