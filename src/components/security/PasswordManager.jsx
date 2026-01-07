import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Plus, Trash2, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ website: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState({});
  const [auditResults, setAuditResults] = useState(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('securePasswordVault');
    if (saved) {
      try {
        setPasswords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load passwords');
      }
    }
  }, []);

  const saveToStorage = (updatedPasswords) => {
    localStorage.setItem('securePasswordVault', JSON.stringify(updatedPasswords));
  };

  const addPassword = () => {
    if (!newEntry.website || !newEntry.username || !newEntry.password) {
      alert('Please fill all fields');
      return;
    }

    const entry = {
      id: Date.now(),
      ...newEntry,
      strength: analyzeStrength(newEntry.password),
      lastChecked: new Date().toISOString(),
      breached: false
    };

    const updated = [...passwords, entry];
    setPasswords(updated);
    saveToStorage(updated);
    setNewEntry({ website: '', username: '', password: '' });
    setShowForm(false);
  };

  const deletePassword = (id) => {
    const updated = passwords.filter(p => p.id !== id);
    setPasswords(updated);
    saveToStorage(updated);
  };

  const analyzeStrength = (password) => {
    let score = 0;
    
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    
    const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111'];
    if (commonPatterns.some(p => password.toLowerCase().includes(p))) score -= 20;
    
    score = Math.max(0, Math.min(100, score));
    
    let level = 'weak';
    if (score >= 80) level = 'strong';
    else if (score >= 60) level = 'medium';
    
    return { score, level };
  };

  const checkPasswordBreach = async (password) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      const hashes = text.split('\n');
      for (const line of hashes) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix === suffix) {
          return { breached: true, count: parseInt(count) };
        }
      }
      
      return { breached: false, count: 0 };
    } catch (error) {
      console.error('Breach check failed:', error);
      return { breached: false, count: 0 };
    }
  };

  const runSecurityAudit = async () => {
    setAuditing(true);
    
    const results = {
      total: passwords.length,
      weak: 0,
      reused: 0,
      breached: 0,
      passwords: []
    };

    // Check for weak passwords
    for (const entry of passwords) {
      const analysis = {
        ...entry,
        issues: []
      };

      if (entry.strength.score < 60) {
        results.weak++;
        analysis.issues.push('Weak password');
      }

      // Check for reused passwords
      const duplicates = passwords.filter(p => p.id !== entry.id && p.password === entry.password);
      if (duplicates.length > 0) {
        results.reused++;
        analysis.issues.push(`Reused on ${duplicates.length + 1} sites`);
      }

      // Check if breached (using real API)
      const breachCheck = await checkPasswordBreach(entry.password);
      if (breachCheck.breached) {
        results.breached++;
        analysis.issues.push(`Found in ${breachCheck.count.toLocaleString()} breaches`);
      }

      results.passwords.push(analysis);
    }

    setAuditResults(results);
    setAuditing(false);
  };

  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewEntry({ ...newEntry, password });
  };

  const getStrengthColor = (level) => {
    switch(level) {
      case 'strong': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'weak': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-cyan-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-cyan-500" />
            <h2 className="text-2xl font-bold text-gray-800">Password Manager</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Password
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">New Password Entry</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Website (e.g., facebook.com)"
                value={newEntry.website}
                onChange={(e) => setNewEntry({ ...newEntry, website: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none"
              />
              <input
                type="text"
                placeholder="Username/Email"
                value={newEntry.username}
                onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Password"
                  value={newEntry.password}
                  onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none"
                />
                <button
                  onClick={generatePassword}
                  className="bg-cyan-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-cyan-600"
                >
                  Generate
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addPassword}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold"
                >
                  Save Password
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Audit */}
        <div className="mb-6">
          <button
            onClick={runSecurityAudit}
            disabled={auditing || passwords.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {auditing ? (
              <>
                <Shield className="w-5 h-5 animate-pulse" />
                Running Security Audit...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Run Security Audit
              </>
            )}
          </button>
        </div>

        {/* Audit Results */}
        {auditResults && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 mb-6">
            <h3 className="font-bold text-purple-800 mb-4">Security Audit Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-red-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-700">{auditResults.weak}</div>
                <div className="text-sm text-red-600">Weak Passwords</div>
              </div>
              <div className="bg-orange-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-orange-700">{auditResults.reused}</div>
                <div className="text-sm text-orange-600">Reused Passwords</div>
              </div>
              <div className="bg-yellow-100 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-700">{auditResults.breached}</div>
                <div className="text-sm text-yellow-600">Breached Passwords</div>
              </div>
            </div>
            
            {/* Detailed Issues */}
            <div className="space-y-2">
              {auditResults.passwords.filter(p => p.issues.length > 0).map(entry => (
                <div key={entry.id} className="bg-white rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{entry.website}</div>
                      <div className="text-sm text-gray-600">{entry.username}</div>
                    </div>
                    <div className="text-right">
                      {entry.issues.map((issue, idx) => (
                        <div key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded mb-1">
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password List */}
        <div className="space-y-3">
          {passwords.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Key className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>No passwords saved yet</p>
              <p className="text-sm mt-2">Click "Add Password" to get started</p>
            </div>
          ) : (
            passwords.map(entry => (
              <div key={entry.id} className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{entry.website}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getStrengthColor(entry.strength.level)}`}>
                        {entry.strength.level.toUpperCase()} ({entry.strength.score}/100)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{entry.username}</div>
                    <div className="flex items-center gap-2">
                      <input
                        type={showPassword[entry.id] ? 'text' : 'password'}
                        value={entry.password}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-sm font-mono"
                      />
                      <button
                        onClick={() => setShowPassword({ ...showPassword, [entry.id]: !showPassword[entry.id] })}
                        className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        {showPassword[entry.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(entry.password);
                          alert('Password copied!');
                        }}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePassword(entry.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 ml-3"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200">
        <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Password Security Tips
        </h3>
        <ul className="space-y-2 text-sm text-green-900">
          <li>• Use unique passwords for each account</li>
          <li>• Make passwords at least 12 characters long</li>
          <li>• Use a mix of letters, numbers, and symbols</li>
          <li>• Avoid personal information (birthdays, names)</li>
          <li>• Enable two-factor authentication wherever possible</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordManager;