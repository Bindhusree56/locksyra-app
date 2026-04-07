import React from 'react';
import { Activity, AlertTriangle, Zap, Shield, Cpu, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const AIAnalysis = ({ 
  analyzing, 
  anomalyDetected, 
  aiInsight, 
  onAnalyze 
}) => {
  return (
    <GlassCard className="flex flex-col h-full bg-primary-900/5" delay={0.4}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Cpu className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Cognitive Security</h2>
            <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Deep Pattern Analysis</p>
          </div>
        </div>
        <button 
          onClick={onAnalyze} 
          disabled={analyzing} 
          className="relative group overflow-hidden bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-black text-xs transition-all disabled:opacity-50 shadow-xl shadow-primary-900/20 flex items-center gap-2 whitespace-nowrap"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
          {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {analyzing ? 'ANALYZING...' : 'EXECUTE AI SCAN'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-12"
          >
            <div className="relative w-32 h-32 mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-primary-500/30"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-4 rounded-full bg-primary-500/20 blur-xl"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-10 h-10 text-primary-400 animate-pulse" />
              </div>
            </div>
            <p className="text-xs font-black text-primary-400 uppercase tracking-[0.2em] animate-pulse">Scanning Behavior Protocols...</p>
          </motion.div>
        ) : anomalyDetected ? (
          <motion.div 
            key="anomaly"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Anomalous Activity Pattern</h3>
                <p className="text-sm text-rose-400/80 mt-1">Unusual system behavior detected in the last session. Mitigation required.</p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {aiInsight && !analyzing && (
          <motion.div 
            key="insight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-4"
          >
            <div className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Shield className="w-24 h-24 text-primary-400" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(56,189,248,1)]" />
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Intelligence Report</h3>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-sm text-slate-300 leading-relaxed font-medium italic"
                >
                  "{aiInsight}"
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">
               <span>Provider: Claude 3.5 Sonnet</span>
               <span>Integrity: 99.9%</span>
            </div>
          </motion.div>
        )}

        {!aiInsight && !analyzing && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-white/5 opacity-50">
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Cognitive Core Standby</h3>
            <p className="text-xs text-slate-600 mt-2 max-w-[200px]">Execute scan for real-time behavioral security insights.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default AIAnalysis;