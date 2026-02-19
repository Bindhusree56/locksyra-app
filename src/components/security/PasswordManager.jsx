import React, { useState, useEffect, useCallback } from 'react';
import {
  Key, Eye, EyeOff, Plus, Trash2, CheckCircle, Shield,
  RefreshCw, AlertCircle, Edit2, Save, X, Copy, Lock
} from 'lucide-react';
import api from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();
    for (const line of text.split('\n')) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix?.trim() === suffix) return { breached: true, count: parseInt(count) };
    }
    return { breached: false, count: 0 };
  } catch { return { breached: false, count: 0 }; }
};

const strengthColors = {
  strong: { bg: 'bg-green-100 text-green-700 border-green-300', bar: 'bg-green-400' },
  medium: { bg: 'bg-yellow-100 text-yellow-700 border-yellow-300', bar: 'bg-yellow-400' },
  weak: { bg: 'bg-red-100 text-red-700 border-red-300', bar: 'bg-red-400' }
};

const generatePassword = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from({ length: 18 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
};

// ─── Component ─────────────────────────────────────────────────────────────────

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copyMsg, setCopyMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [auditResults, setAuditResults] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newEntry, setNewEntry] = useState({ website: '', username: '', password: '', notes: '' });

  // ── Load passwords from backend ────────────────────────────────────────────
  const loadPasswords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getSavedPasswords();
      setPasswords(res.data.passwords || []);
    } catch (err) {
      setError(err.message || 'Failed to load passwords. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPasswords(); }, [loadPasswords]);

  // ── Add ────────────────────────────────────────────────────────────────────
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
    } finally { setSaving(false); }
  };

  // ── Start Edit ─────────────────────────────────────────────────────────────
  const startEdit = (entry) => {
    setEditId(entry.id);
    setEditData({
      website: entry.website,
      username: entry.username,
      password: entry.password,
      notes: entry.notes || ''
    });
  };

  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const updateEditField = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));

  // ── Save Edit ──────────────────────────────────────────────────────────────
  const saveEdit = async (id) => {
    if (!editData.website || !editData.username || !editData.password) {
      setError('Website, username, and password are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api.updatePassword(id, {
        website: editData.website,
        username: editData.username,
        password: editData.password,
        notes: editData.notes
      });
      setPasswords(prev => prev.map(p => p.id === id ? { ...res.data } : p));
      setEditId(null);
      setEditData({});
      // Refresh to get updated strength from server
      loadPasswords();
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deletePassword = async (id) => {
    if (!window.confirm('Delete this password entry? This cannot be undone.')) return;
    try {
      await api.deletePassword(id);
      setPasswords(prev => prev.filter(p => p.id !== id));
      if (editId === id) cancelEdit();
    } catch (err) { setError(err.message || 'Failed to delete'); }
  };

  // ── Copy ───────────────────────────────────────────────────────────────────
  const copyToClipboard = (text, label = 'password') => {
    navigator.clipboard.writeText(text);
    setCopyMsg(`${label} copied!`);
    setTimeout(() => setCopyMsg(''), 2000);
  };

  // ── Toggle show password ───────────────────────────────────────────────────
  const toggleShow = (id) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Security Audit ─────────────────────────────────────────────────────────
  const runAudit = async () => {
    if (passwords.length === 0) return;
    setAuditing(true);
    const results = { total: passwords.length, weak: 0, reused: 0, breached: 0, entries: [] };

    for (const entry of passwords) {
      const issues = [];
      const str = analyzeStrength(entry.password || '');
      if (str.score < 50) { results.weak++; issues.push('⚠️ Weak password'); }
      const dupes = passwords.filter(p => p.id !== entry.id && p.password === entry.password);
      if (dupes.length > 0) { results.reused++; issues.push(`♻️ Reused on ${dupes.length + 1} sites`); }
      try {
        const breach = await checkPasswordBreach(entry.password || '');
        if (breach.breached) { results.breached++; issues.push(`🚨 Found in ${breach.count.toLocaleString()} breaches`); }
      } catch {}
      results.entries.push({ ...entry, issues, strength: str });
    }

    setAuditResults(results);
    setAuditing(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600 font-medium">Loading your passwords from server...</p>
          <p className="text-gray-400 text-sm mt-1">Passwords are stored securely in MongoDB</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">

      {/* Copy Toast */}
      {copyMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg animate-bounce">
          ✅ {copyMsg}
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-cyan-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-cyan-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Password Vault</h2>
              <p className="text-xs text-gray-500">🔒 AES-256 encrypted · synced to your account</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={loadPasswords} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setError(''); }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs rounded-full font-medium">
            {passwords.length} saved
          </span>
          <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full font-medium">
            {passwords.filter(p => p.strength?.level === 'strong').length} strong
          </span>
          <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs rounded-full font-medium">
            {passwords.filter(p => p.strength?.level === 'weak').length} weak
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-5 border-2 border-cyan-200 mb-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-600" /> New Password Entry
            </h3>
            <div className="space-y-3">
              <input type="text" placeholder="Website (e.g., facebook.com)" value={newEntry.website}
                onChange={e => setNewEntry(p => ({ ...p, website: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none text-sm" />
              <input type="text" placeholder="Username or Email" value={newEntry.username}
                onChange={e => setNewEntry(p => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none text-sm" />
              <div className="flex gap-2">
                <input type="text" placeholder="Password" value={newEntry.password}
                  onChange={e => setNewEntry(p => ({ ...p, password: e.target.value }))}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none text-sm font-mono" />
                <button onClick={() => setNewEntry(p => ({ ...p, password: generatePassword() }))}
                  className="bg-cyan-500 text-white px-3 py-2.5 rounded-xl font-medium hover:bg-cyan-600 text-sm">
                  Generate
                </button>
              </div>
              {newEntry.password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthColors[analyzeStrength(newEntry.password).level]?.bar || 'bg-red-400'} transition-all`}
                      style={{ width: `${analyzeStrength(newEntry.password).score}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{analyzeStrength(newEntry.password).level}</span>
                </div>
              )}
              <textarea placeholder="Notes (optional)" value={newEntry.notes}
                onChange={e => setNewEntry(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-cyan-200 focus:border-cyan-400 outline-none text-sm" rows={2} />
              <div className="flex gap-2">
                <button onClick={addPassword} disabled={saving}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save to Account</>}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Button */}
        <button onClick={runAudit} disabled={auditing || passwords.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4">
          {auditing ? <><Shield className="w-5 h-5 animate-pulse" /> Running Audit...</> : <><Shield className="w-5 h-5" /> Run Security Audit</>}
        </button>

        {/* Audit Results */}
        {auditResults && (
          <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-purple-800">🔍 Audit Results</h3>
              <button onClick={() => setAuditResults(null)} className="text-purple-400 hover:text-purple-600"><X className="w-4 h-4" /></button>
            </div>
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
                <div className="font-semibold text-gray-800 text-sm">{entry.website} — <span className="text-gray-500">{entry.username}</span></div>
                {entry.issues.map((issue, i) => <div key={i} className="text-xs text-red-600 mt-0.5">{issue}</div>)}
              </div>
            ))}
            {auditResults.entries.filter(e => e.issues.length > 0).length === 0 && (
              <div className="text-center text-green-700 font-medium py-2">🎉 All passwords look great!</div>
            )}
          </div>
        )}

        {/* Password List */}
        <div className="space-y-3">
          {passwords.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Lock className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No passwords saved yet</p>
              <p className="text-sm mt-1">Click "+ Add" to save your first password securely</p>
            </div>
          ) : (
            passwords.map(entry => {
              const isEditing = editId === entry.id;
              const currentPassword = isEditing ? editData.password : entry.password;
              const str = analyzeStrength(currentPassword || '');
              const colors = strengthColors[entry.strength?.level || 'weak'];

              return (
                <div key={entry.id}
                  className={`rounded-2xl p-4 border-2 transition-all ${
                    isEditing ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-cyan-300'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-2">

                      {/* Website */}
                      {isEditing ? (
                        <input value={editData.website}
                          onChange={e => updateEditField('website', e.target.value)}
                          placeholder="Website"
                          className="w-full px-3 py-1.5 rounded-lg border-2 border-blue-300 outline-none text-sm font-bold bg-white" />
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-800">{entry.website}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors?.bg}`}>
                            {entry.strength?.level || 'weak'} ({entry.strength?.score ?? 0}/100)
                          </span>
                        </div>
                      )}

                      {/* Username */}
                      {isEditing ? (
                        <input value={editData.username}
                          onChange={e => updateEditField('username', e.target.value)}
                          placeholder="Username or email"
                          className="w-full px-3 py-1.5 rounded-lg border-2 border-blue-300 outline-none text-sm bg-white" />
                      ) : (
                        <div className="text-sm text-gray-500">{entry.username}</div>
                      )}

                      {/* Password field */}
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <input
                              type={showPassword[entry.id] ? 'text' : 'password'}
                              value={editData.password}
                              onChange={e => updateEditField('password', e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border-2 border-blue-300 outline-none text-sm font-mono bg-white"
                            />
                            <button onClick={() => updateEditField('password', generatePassword())}
                              className="px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">
                              Gen
                            </button>
                          </>
                        ) : (
                          <input
                            type={showPassword[entry.id] ? 'text' : 'password'}
                            value={entry.password || ''}
                            readOnly
                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-mono cursor-default"
                          />
                        )}
                        <button onClick={() => toggleShow(entry.id)}
                          className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all">
                          {showPassword[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => copyToClipboard(isEditing ? editData.password : entry.password)}
                          className="p-1.5 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-all">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Strength bar in edit mode */}
                      {isEditing && editData.password && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${strengthColors[str.level]?.bar} transition-all`}
                              style={{ width: `${str.score}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 capitalize">{str.level}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {isEditing ? (
                        <textarea value={editData.notes}
                          onChange={e => updateEditField('notes', e.target.value)}
                          placeholder="Notes (optional)"
                          className="w-full px-3 py-1.5 rounded-lg border-2 border-blue-300 outline-none text-xs bg-white"
                          rows={2} />
                      ) : (
                        entry.notes && <p className="text-xs text-gray-400 italic">{entry.notes}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(entry.id)} disabled={saving}
                            title="Save changes"
                            className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-all">
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button onClick={cancelEdit} title="Cancel edit"
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(entry)} title="Edit this entry"
                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deletePassword(entry.id)} title="Delete this entry"
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Editing — click Save to confirm changes
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-5 border-2 border-green-200">
        <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Security Information
        </h3>
        <ul className="space-y-1.5 text-sm text-green-800">
          <li>🔐 All passwords are encrypted with AES-256-GCM before storage</li>
          <li>☁️ Stored in your MongoDB account — visible only after login</li>
          <li>🔑 Passwords are never stored locally or in the browser</li>
          <li>✏️ Click the edit icon on any entry to update it</li>
          <li>🛡️ Run the Security Audit to detect weak, reused, or breached passwords</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordManager;
