import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, EyeOff, Plus, Trash2, CheckCircle, Shield,
  RefreshCw, AlertCircle, Edit2, Save, X, Copy, Lock,
} from 'lucide-react';
import api from '../../services/api';
import {
  analyzePasswordStrength,
  strengthColors,
  generatePassword,
} from '../../utils/passwordStrength';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

// ── k-anonymity breach check (browser crypto, no API key needed) ──────────────
const checkPasswordBreach = async (password) => {
  try {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(password));
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
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

const PasswordManager = () => {
  const [passwords, setPasswords]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [copyMsg, setCopyMsg]         = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editId, setEditId]           = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [auditResults, setAuditResults] = useState(null);
  const [auditing, setAuditing]       = useState(false);
  const [editData, setEditData]       = useState({});
  const [newEntry, setNewEntry]       = useState({ website: '', username: '', password: '', notes: '' });

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

  const addPassword = async () => {
    if (!newEntry.website || !newEntry.username || !newEntry.password) {
      setError('Website, Username, and Password are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api.savePassword(newEntry.website, newEntry.username, newEntry.password, newEntry.notes);
      setPasswords((prev) => [res.data, ...prev]);
      setNewEntry({ website: '', username: '', password: '', notes: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save password');
    } finally { setSaving(false); }
  };

  const startEdit  = (entry) => { setEditId(entry.id); setEditData({ website: entry.website, username: entry.username, password: entry.password, notes: entry.notes || '' }); };
  const cancelEdit = ()      => { setEditId(null); setEditData({}); };
  const updateEditField = (field, value) => setEditData((prev) => ({ ...prev, [field]: value }));

  const saveEdit = async (id) => {
    setSaving(true);
    setError('');
    try {
      const res = await api.updatePassword(id, editData);
      setPasswords((prev) => prev.map((p) => p.id === id ? { ...res.data } : p));
      setEditId(null);
      setEditData({});
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally { setSaving(false); }
  };

  const deletePassword = async (id) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await api.deletePassword(id);
      setPasswords((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { setError(err.message || 'Failed to delete'); }
  };

  const copyToClipboard = (text, label = 'password') => {
    navigator.clipboard.writeText(text);
    setCopyMsg(`${label} copied!`);
    setTimeout(() => setCopyMsg(''), 2000);
  };

  const toggleShow = (id) => setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));

  const runAudit = async () => {
    if (passwords.length === 0) return;
    setAuditing(true);
    const results = { total: passwords.length, weak: 0, reused: 0, breached: 0, entries: [] };
    for (const entry of passwords) {
      const issues = [];
      const str = analyzePasswordStrength(entry.password || '');
      if (str.score < 50) { results.weak++; issues.push('⚠️ Weak password'); }
      const dupes = passwords.filter((p) => p.id !== entry.id && p.password === entry.password);
      if (dupes.length > 0) { results.reused++; issues.push(`♻️ Reused on ${dupes.length + 1} sites`); }
      const breach = await checkPasswordBreach(entry.password || '');
      if (breach.breached) { results.breached++; issues.push(`🚨 Found in ${breach.count.toLocaleString()} breaches`); }
      results.entries.push({ ...entry, issues, strength: str });
    }
    setAuditResults(results);
    setAuditing(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Encrypted Vault…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {copyMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl shadow-emerald-500/20 flex items-center gap-2 border border-emerald-400/20"
          >
            <CheckCircle className="w-5 h-5" /> {copyMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Password Vault</h1>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <p className="text-sm">AES-256-GCM Military Encryption Active</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadPasswords} 
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-900/20 flex items-center gap-2"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel Entry' : 'New Password'}
          </button>
        </div>
      </div>

      {/* Vault Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: passwords.length, color: 'text-white' },
          { label: 'Strong Security', value: passwords.filter((p) => p.strength?.level === 'strong' || p.strength?.level === 'excellent').length, color: 'text-emerald-400' },
          { label: 'Weak Risks', value: passwords.filter((p) => p.strength?.level === 'weak').length, color: 'text-rose-400' },
          { label: 'Vulnerability Level', value: passwords.filter((p) => p.strength?.level === 'weak').length > 0 ? 'High' : 'Secure', color: passwords.filter((p) => p.strength?.level === 'weak').length > 0 ? 'text-rose-400' : 'text-emerald-400' }
        ].map((stat, i) => (
          <GlassCard key={i} className="p-4" hover={false} delay={i * 0.1}>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Security Audit Trigger */}
      <button 
        onClick={runAudit} 
        disabled={auditing || passwords.length === 0}
        className="w-full relative group overflow-hidden bg-slate-900 border border-white/5 py-4 rounded-2xl font-black text-slate-300 transition-all hover:border-primary-500/30 flex items-center justify-center gap-3"
      >
        <div className="absolute inset-0 bg-primary-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
        <Shield className={`w-5 h-5 ${auditing ? 'animate-pulse text-primary-400' : ''}`} />
        {auditing ? 'ANALYZING VAULT INFRASTRUCTURE...' : 'EXECUTE COMPREHENSIVE SECURITY AUDIT'}
      </button>

      {/* Audit Report Glass Panel */}
      <AnimatePresence>
        {auditResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="bg-primary-900/10 border-primary-500/20 p-8 mb-8" hover={false}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Shield className="text-primary-400" />
                  Vault Security Report
                </h3>
                <button onClick={() => setAuditResults(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Encryption Low-Entropy', count: auditResults.weak, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                  { label: 'Pattern Reuse Detected', count: auditResults.reused, icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                  { label: 'Identity Breach Exposure', count: auditResults.breached, icon: Shield, color: 'text-primary-400', bg: 'bg-primary-400/10' },
                ].map((s, i) => (
                  <div key={i} className={`p-6 rounded-3xl ${s.bg} border border-white/5`}>
                    <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                    <p className="text-3xl font-black text-white">{s.count}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {auditResults.entries.filter((e) => e.issues.length > 0).map((entry, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={entry.id} 
                    className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{entry.website}</p>
                      <p className="text-xs text-slate-500">{entry.username}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {entry.issues.map((issue, i) => (
                        <span key={i} className="text-[10px] font-black uppercase text-rose-400 px-2 py-0.5 rounded-lg bg-rose-400/10 border border-rose-400/20">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Error HUD */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-tight flex items-center gap-3 mb-6"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              VAULT_ERROR: {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VAULT ENTRIES LISTING */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {passwords.map((entry, idx) => {
              const isEditing = editId === entry.id;
              const currentPw  = isEditing ? editData.password : entry.password;
              const str        = analyzePasswordStrength(currentPw || '');
              
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GlassCard 
                    className={`p-0 overflow-visible transition-all duration-300 border-none ${
                        isEditing ? 'ring-2 ring-primary-500/50' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary-400 font-black border border-white/5">
                               {entry.website[0].toUpperCase()}
                             </div>
                             <div className="flex-1 min-w-0">
                               {isEditing ? (
                                 <input value={editData.website} onChange={(e) => updateEditField('website', e.target.value)}
                                   className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-primary-500/50" />
                               ) : (
                                 <h3 className="text-lg font-black text-white truncate">{entry.website}</h3>
                               )}
                               <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{entry.username}</p>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 max-w-md">
                            <div className="relative flex-1 group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                  type={showPassword[entry.id] || isEditing ? 'text' : 'password'}
                                  value={isEditing ? editData.password : entry.password || ''}
                                  onChange={isEditing ? (e) => updateEditField('password', e.target.value) : undefined}
                                  readOnly={!isEditing}
                                  className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-mono transition-all ${
                                      isEditing 
                                        ? 'bg-slate-950/80 border border-primary-500/30 text-white focus:outline-none' 
                                        : 'bg-slate-950/40 border border-transparent text-slate-400 hover:bg-slate-950/60'
                                  }`}
                                />
                            </div>
                            <button onClick={() => toggleShow(entry.id)} className="p-3 rounded-xl bg-slate-800/50 text-slate-500 hover:text-white transition-colors border border-white/5">
                              {showPassword[entry.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => copyToClipboard(isEditing ? editData.password : entry.password)} className="p-3 rounded-xl bg-primary-600/10 text-primary-400 hover:bg-primary-600 hover:text-white transition-all border border-primary-500/20">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="text-slate-500">Integrity Score</span>
                               <span className={`${strengthColors[str.level]?.text || 'text-slate-500'}`}>{str.level}</span>
                             </div>
                             <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${str.score}%` }}
                                 className={`h-full ${strengthColors[str.level]?.bar || 'bg-slate-500'} transition-all duration-1000`} 
                               />
                             </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(entry.id)} disabled={saving} className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-lg shadow-emerald-900/10">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={cancelEdit} className="p-3 bg-slate-800/50 text-slate-400 rounded-xl hover:bg-slate-700 transition-all border border-white/5">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(entry)} className="p-3 bg-primary-600/10 text-primary-400 rounded-xl hover:bg-primary-600 hover:text-white transition-all border border-primary-500/20 shadow-lg shadow-primary-900/10">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deletePassword(entry.id)} className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg shadow-rose-900/10">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <GlassCard className="p-8 border-primary-500/30">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3 tracking-tight">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <Plus className="w-5 h-5 text-primary-400" />
                    </div>
                    New Asset Protocol
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Website</label>
                       <input type="text" placeholder="example.com" value={newEntry.website}
                          onChange={(e) => setNewEntry((p) => ({ ...p, website: e.target.value }))}
                          className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/40 border border-white/5 text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-600" />
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identity / UID</label>
                       <input type="text" placeholder="username" value={newEntry.username}
                          onChange={(e) => setNewEntry((p) => ({ ...p, username: e.target.value }))}
                          className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/40 border border-white/5 text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-600" />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secret Value</label>
                       <div className="flex gap-2">
                          <input type="text" placeholder="••••••••" value={newEntry.password}
                            onChange={(e) => setNewEntry((p) => ({ ...p, password: e.target.value }))}
                            className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-950/40 border border-white/5 text-sm font-mono text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-600" />
                          <button onClick={() => setNewEntry((p) => ({ ...p, password: generatePassword() }))}
                            className="px-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-300 border border-white/5 hover:text-white transition-colors">
                            GEN
                          </button>
                       </div>
                    </div>

                    <button onClick={addPassword} disabled={saving}
                      className="w-full bg-primary-600 hover:bg-primary-500 text-white py-5 rounded-2xl font-black text-base shadow-xl shadow-primary-900/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                      {saving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
                      ENCRYPT & STORE
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <GlassCard className="p-8 bg-emerald-500/5 border-emerald-400/10">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              Vault Directives
            </h3>
            <ul className="space-y-4">
              {[
                'AES-256-GCM symmetric encryption applied',
                'Zero-knowledge architecture policies',
                'Cross-device account synchronization',
                'In-situ breach exposure analysis'
              ].map((directive, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                  <span className="text-xs text-slate-400 leading-relaxed font-medium">{directive}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PasswordManager;