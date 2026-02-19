import React, { useState, useEffect, useCallback } from 'react';
import { Key, Eye, EyeOff, Plus, Trash2, CheckCircle, Shield, RefreshCw, AlertCircle, Edit2, Save, X } from 'lucide-react';
import api from '../../services/api';

const analyzeStrength = (password) => {
  let score = 0;
  if (password.length >= 16) score += 30;
  else if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  const common = ['123', 'abc', 'password', 'qwerty', '111'];
  if (common.some(p => password.toLowerCase().includes(p))) score -= 25;
  score = Math.max(0, Math.min(100, score));
  let level = 'weak';
  if (score >= 80) level = 'strong';
  else if (score >= 50) level = 'medium';
  return { score, level };
};

const checkPasswordBreach = async (password) => {
  try {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(password));
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();
    for (const line of text.split('\n')) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix?.trim() === suffix) return { breached: true, count: parseInt(count) };
    }
    return { breached: false, count: 0 };
  } catch {
    return { breached: false, count: 0 };
  }
};

const strengthColors = {
  strong: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  weak: 'bg-red-100 text-red-700 border-red-300'
};

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [auditResults, setAuditResults] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [newEntry, setNewEntry] = useState({ website: '', username: '', password: '', notes: '' });

  // ─── Load from backend ──────────────────────────────────────────────
  const loadPasswords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getSavedPasswords();
      setPasswords(res.data.passwords || []);
    } catch (err) {
      setError(err.message || 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPasswords(); }, [loadPasswords]);

  // ─── Add password ───────────────────────────────────────────────────
  const addPassword = async () => {
    if (!newEntry.website || !newEntry.username || !newEntry.password) {
      setError('Please fill in Website, Username, and Password');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api.savePassword(newEntry.website, newEntry.username, newEntry.password, newEntry.notes);
      setPasswords(prev => [res.data, ...prev]);
      setNewEntry({ website: '', username: '', password: '', notes: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save password');
    } finally {
      setSaving(false);
    }
  };

  // ─── Update password ─────────────────────────────────────────────────
  const updatePassword = async (id) => {
    const entry = passwords.find(p => p.id === id);
    if (!entry) return;
    setSaving(true);
    try {
      const res = await api.updatePassword(id, {
        website: entry.website,
        username: entry.username,
        password: entry.password,
        notes: entry.notes
      });
      setPasswords(prev => prev.map(p => p.id === id ? res.data : p));
      setEditId(null);
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete password ─────────────────────────────────────────────────
  const deletePassword = async (id) => {
    if (!window.confirm('Delete this password entry?')) return;
    try {
      await api.deletePassword(id);
      setPasswords(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  // ─── Edit inline ─────────────────────────────────────────────────────
  const updateField = (id, field, value) => {
    setPasswords(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // ─── Generate password ───────────────────────────────────────────────
  const generatePassword = (field = 'password') => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const pw = Array.from({ length: 16 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    setNewEntry(prev => ({ ...prev, [field]: pw }));
  };

  // ─── Security Audit ──────────────────────────────────────────────────
  const runAudit = async () => {
    if (passwords.length === 0) return;
    setAuditing(true);
    const results = { total: passwords.length, weak: 0, reused: 0, breached: 0, entries: [] };

    for (const entry of passwords) {
      const issues = [];
      const str = analyzeStrength(entry.password);
      if (str.score < 50) { results.weak++; issues.push('⚠️ Weak password'); }
      const duplicates = passwords.filter(p => p.id !== entry.id && p.password === entry.password);
      if (duplicates.length > 0) { results.reused++; issues.push(`♻️ Reused on ${duplicates.length + 1} sites`); }
      const breach = await checkPasswordBreach(entry.password);
      if (breach.breached) { results.breached++; issues.push(`🚨 Found in ${breach.count.toLocaleString()} breaches`); }
      results.entries.push({ ...entry, issues, strength: str });
    }

    setAuditResults(results);
    setAuditing(false);
  };

  const toggleShowPassword = (id) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Loading your passwords from server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Card */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-cyan-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-cyan-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Password Vault</h2>
              <p className="text-xs text-gray-500">🔒 Encrypted & synced with your account</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadPasswords}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setError(''); }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">➕ New Password Entry</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Website (e.g., facebook.com)"
                value={newEntry.website}
                onChange={(e) => setNewEntry(p => ({ ...p, website: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none"
              />
              <input
                type="text"
                placeholder="Username or Email"
                value={newEntry.username}
                onChange={(e) => setNewEntry(p => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Password"
                  value={newEntry.password}
                  onChange={(e) => setNewEntry(p => ({ ...p, password: e.target.value }))}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none font-mono"
                />
                <button onClick={() => generatePassword('password')} className="bg-cyan-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-cyan-600 text-sm">
                  Generate
                </button>
              </div>
              {newEntry.password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${analyzeStrength(newEntry.password).level === 'strong' ? 'bg-green-400' : analyzeStrength(newEntry.password).level === 'medium' ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${analyzeStrength(newEntry.password).score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{analyzeStrength(newEntry.password).level}</span>
                </div>
              )}
              <textarea
                placeholder="Notes (optional)"
                value={newEntry.notes}
                onChange={(e) => setNewEntry(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={addPassword}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save to Account</>}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Audit */}
        <button
          onClick={runAudit}
          disabled={auditing || passwords.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
        >
          {auditing ? <><Shield className="w-5 h-5 animate-pulse" /> Running Audit...</> : <><Shield className="w-5 h-5" /> Run Security Audit</>}
        </button>

        {/* Audit Results */}
        {auditResults && (
          <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200 mb-4">
            <h3 className="font-bold text-purple-800 mb-3">🔍 Audit Results</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: 'Weak', count: auditResults.weak, color: 'bg-red-100 text-red-700' },
                { label: 'Reused', count: auditResults.reused, color: 'bg-orange-100 text-orange-700' },
                { label: 'Breached', count: auditResults.breached, color: 'bg-yellow-100 text-yellow-700' }
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs">{s.label}</div>
                </div>
              ))}
            </div>
            {auditResults.entries.filter(e => e.issues.length > 0).map(entry => (
              <div key={entry.id} className="bg-white rounded-xl p-3 mb-2">
                <div className="font-semibold text-gray-800">{entry.website} — {entry.username}</div>
                {entry.issues.map((issue, i) => (
                  <div key={i} className="text-xs text-red-600 mt-1">{issue}</div>
                ))}
              </div>
            ))}
            {auditResults.entries.filter(e => e.issues.length > 0).length === 0 && (
              <div className="text-center text-green-700 font-medium">🎉 All passwords look good!</div>
            )}
          </div>
        )}

        {/* Password List */}
        <div className="space-y-3">
          {passwords.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Key className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No passwords saved yet</p>
              <p className="text-sm mt-1">Click "+ Add" to save your first password</p>
            </div>
          ) : (
            passwords.map(entry => (
              <div key={entry.id} className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-cyan-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Website & Username */}
                    {editId === entry.id ? (
                      <div className="space-y-2 mb-2">
                        <input
                          value={entry.website}
                          onChange={e => updateField(entry.id, 'website', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border-2 border-cyan-300 outline-none text-sm font-semibold"
                        />
                        <input
                          value={entry.username}
                          onChange={e => updateField(entry.id, 'username', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border-2 border-cyan-300 outline-none text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{entry.website}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${strengthColors[entry.strength?.level] || strengthColors.weak}`}>
                          {entry.strength?.level || 'weak'} ({entry.strength?.score || 0}/100)
                        </span>
                      </div>
                    )}
                    {editId !== entry.id && <div className="text-sm text-gray-500 mb-2">{entry.username}</div>}

                    {/* Password field */}
                    <div className="flex items-center gap-2">
                      {editId === entry.id ? (
                        <input
                          type={showPassword[entry.id] ? 'text' : 'password'}
                          value={entry.password}
                          onChange={e => updateField(entry.id, 'password', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border-2 border-cyan-300 outline-none text-sm font-mono"
                        />
                      ) : (
                        <input
                          type={showPassword[entry.id] ? 'text' : 'password'}
                          value={entry.password || ''}
                          readOnly
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-mono"
                        />
                      )}
                      <button onClick={() => toggleShowPassword(entry.id)} className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300">
                        {showPassword[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(entry.password); }}
                        className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-xs hover:bg-cyan-600"
                      >
                        Copy
                      </button>
                    </div>
                    {entry.notes && editId !== entry.id && (
                      <p className="text-xs text-gray-400 mt-1 italic">{entry.notes}</p>
                    )}
                    {editId === entry.id && (
                      <textarea
                        value={entry.notes || ''}
                        onChange={e => updateField(entry.id, 'notes', e.target.value)}
                        placeholder="Notes..."
                        className="w-full mt-2 px-3 py-1.5 rounded-lg border-2 border-cyan-300 outline-none text-xs"
                        rows={2}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {editId === entry.id ? (
                      <>
                        <button
                          onClick={() => updatePassword(entry.id)}
                          disabled={saving}
                          className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditId(null); loadPasswords(); }}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditId(entry.id)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePassword(entry.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-5 border-2 border-green-200">
        <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Security Info
        </h3>
        <ul className="space-y-1.5 text-sm text-green-800">
          <li>🔐 Passwords are encrypted with AES-256-GCM before storage</li>
          <li>☁️ Synced to your MongoDB account — accessible after every login</li>
          <li>🔑 Only you can decrypt your passwords (tied to your account)</li>
          <li>🛡️ Never shared with third parties</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordManager;