import React, { useState } from 'react';
import { Shield, CheckCircle, Loader, Globe, Zap, History, Info, Radar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';

const PhishingDetector = () => {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const checkURL = async () => {
    if (!url) return;
    setChecking(true);
    setResult(null);
    try {
      const response = await api.checkPhishingURL(url);
      if (response.success) {
        setResult(response.data);
        setHistory(prev => [response.data, ...prev.slice(0, 9)]);
      } else {
        throw new Error(response.message || 'URL check failed');
      }
    } catch (error) {
      console.error('URL check failed:', error);
    }
    setChecking(false);
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'high': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };



  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Perimeter Scanner</h1>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <Globe className="w-4 h-4 text-primary-400" />
            <p className="text-sm font-medium">Real-time URL Insight & Phishing Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Global Intelligence Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Scanner Pane */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8" delay={0.1}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Radar className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Active Domain Sweep</h2>
            </div>

            <div className="flex gap-2 p-2 bg-slate-950/40 rounded-2xl border border-white/5 focus-within:border-primary-500/50 transition-all mb-8">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://secure-gate.io"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder:text-slate-600"
              />
              <button
                onClick={checkURL}
                disabled={checking || !url}
                className="relative group overflow-hidden bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-black text-xs transition-all disabled:opacity-50 shadow-xl shadow-primary-900/20 flex items-center gap-2"
              >
                {checking ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {checking ? 'ANALYZING' : 'INITIATE SCAN'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {checking ? (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center"
                >
                  <div className="relative w-32 h-32 mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-primary-500/40"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-4 rounded-full bg-primary-500 blur-2xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Radar className="w-10 h-10 text-primary-400 animate-pulse" />
                    </div>
                    {/* Scanning Beam */}
                    <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/0 via-primary-500/0 to-primary-500/40"
                    />
                  </div>
                  <p className="text-xs font-black text-primary-400 uppercase tracking-[0.3em] animate-pulse">Running Diagnostic Arrays...</p>
                </motion.div>
              ) : result && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl border-2 ${result.safe ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Gauge Visual */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                       <svg className="w-full h-full transform -rotate-90">
                         <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                         <motion.circle 
                            cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={251.2}
                            initial={{ strokeDashoffset: 251.2 }}
                            animate={{ strokeDashoffset: 251.2 - (251.2 * result.score / 100) }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={getRiskColor(result.risk)} 
                         />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-xl font-black text-white">{result.score}</span>
                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">RISK INDEX</span>
                       </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                        <h3 className={`text-xl font-black uppercase tracking-tight ${result.safe ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {result.safe ? 'Verified Secure' : 'Malicious Vector Detected'}
                        </h3>
                      </div>
                      <p className="text-sm font-mono text-slate-400 mb-4">{result.domain}</p>
                      
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {result.details?.malware && <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase rounded-lg border border-rose-500/20">Malware Detected</span>}
                        {result.details?.phishing && <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase rounded-lg border border-rose-500/20">Phishing Payload</span>}
                        {result.details?.suspicious && <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase rounded-lg border border-amber-500/20">Anomalous Behavior</span>}
                        {!result.details?.malware && !result.details?.phishing && result.safe && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">Clean Payload</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Tips Section */}
          <GlassCard className="p-8 bg-primary-500/5 group" delay={0.3}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-500/10 rounded-lg group-hover:bg-primary-500/20 transition-colors">
                 <Shield className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Security Directives</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Protocol Check', desc: 'Secure domains utilize HTTPS encryption by default.' },
                { title: 'Character Sweep', desc: 'Watch for homograph attacks (e.g., paypa1.com).' },
                { title: 'Source Auth', desc: 'Verification of shortening service origins is mandatory.' },
                { title: 'Urgency Flag', desc: 'Psychological pressure is a primary phishing vector.' }
              ].map((tip, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-primary-500/20 transition-colors">
                  <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">{tip.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{tip.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* History Pane */}
        <div className="space-y-6">
          <GlassCard className="p-8 h-fit" delay={0.2}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-slate-800 rounded-lg">
                <History className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Scan History</h3>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {history.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className="p-4 rounded-[20px] bg-slate-950/40 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${item.safe ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {item.safe ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate w-32">{item.domain}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mt-0.5">
                           Risk: {item.score}
                        </p>
                      </div>
                    </div>
                    <div className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${item.safe ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10' : 'text-rose-400 bg-rose-500/5 border border-rose-500/10'}`}>
                      {item.safe ? 'Pass' : 'Risk'}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {history.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <div className="p-4 bg-slate-800 rounded-2xl w-fit mx-auto mb-4">
                     <Radar className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Log Entries Null</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-slate-900/40 border-slate-800" hover={false}>
            <div className="flex items-center gap-4 text-slate-500">
               <Info className="w-5 h-5 flex-shrink-0" />
               <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tighter italic">
                 "Our perimeter heuristic scan cross-references 1.2M+ malicious indicators in real-time."
               </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PhishingDetector;
