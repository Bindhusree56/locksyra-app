import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Zap, Award, Activity, Cpu } from 'lucide-react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const AnimatedNumber = ({ value, className }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{displayValue}</span>;
};

export const SecurityScore = ({ score }) => {
  return (
    <GlassCard className="flex flex-col h-full group overflow-hidden" delay={0.1}>
      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 rounded-[14px] border border-primary-500/20 group-hover:border-primary-500/40 transition-all duration-500">
            <Shield className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block leading-none mb-1">Defense Index</span>
            <span className="text-xs font-bold text-white tracking-tight uppercase italic">Operational Status</span>
          </div>
        </div>
        <motion.div 
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
        >
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400">SAFE</span>
        </motion.div>
      </div>
      
      <div className="flex items-baseline gap-3 mb-8 relative z-10">
        <AnimatedNumber value={score} className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(14,165,233,0.3)]" />
        <span className="text-xl font-black text-slate-700 italic tracking-widest">/SEC</span>
      </div>

      <div className="mt-auto space-y-5 relative z-10">
        <div className="space-y-2">
           <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Structural Integrity</span>
              <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest">{score}%</span>
           </div>
           <div className="bg-slate-900/60 rounded-full h-1.5 overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 2, ease: "circOut" }}
              className="bg-gradient-to-r from-primary-600 via-primary-400 to-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-white/5 group-hover:border-primary-500/20 transition-all duration-500">
           <Activity className="w-4 h-4 text-slate-600 group-hover:text-primary-400 transition-colors" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic">
             Perimeter Scan: {score >= 80 ? 'No Anomalies Found' : 'Partial Exposure Detected'}
           </p>
        </div>
      </div>
    </GlassCard>
  );
};

export const DailyStreak = ({ streak }) => {
  return (
    <GlassCard className="flex flex-col h-full group" delay={0.2}>
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-2.5 bg-amber-500/10 rounded-[14px] border border-amber-500/20 group-hover:border-amber-500/40 transition-all duration-500">
          <Zap className="w-5 h-5 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block leading-none mb-1">Operational Activity</span>
          <span className="text-xs font-bold text-white tracking-tight uppercase italic">Duty Cycle</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <AnimatedNumber value={streak} className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0], filter: ["blur(0px)", "blur(2px)", "blur(0px)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl drop-shadow-[0_0_15px_rgba(251,91,36,0.4)]"
        >
          🔥
        </motion.div>
      </div>
      
      <div className="mt-auto pt-6 border-t border-white/5">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
          Maintain the <span className="text-amber-400 italic">Sentinel Protocol</span> for {7 - (streak % 7)} more cycles to elevate rank.
        </p>
        <div className="flex gap-1 mt-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i < (streak % 7 || 7) ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export const BadgeDisplay = ({ badges = [] }) => {
  return (
    <GlassCard className="flex flex-col h-full group" delay={0.3}>
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-[14px] border border-purple-500/20 group-hover:border-purple-500/40 transition-all duration-500">
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block leading-none mb-1">Service Rank</span>
            <span className="text-xs font-bold text-white tracking-tight uppercase italic">Merit Awards</span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/5 text-[10px] font-black text-slate-500 tracking-widest">
           {badges.length}/12 <span className="text-purple-400 ml-1">UNLOCKED</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-6">
        <AnimatePresence>
          {badges.map((badge, idx) => (
            <motion.div 
              key={idx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.15, rotate: 5, y: -5 }}
              className="relative p-2.5 bg-slate-950/60 rounded-2xl border border-white/5 cursor-pointer shadow-xl group/badge flex items-center justify-center min-w-[56px] h-[56px]"
              title={badge}
            >
              <div className="absolute inset-0 bg-purple-500/5 blur-xl group-hover/badge:bg-purple-500/20 transition-all rounded-2xl" />
              <span className="text-2xl relative z-10">{badge.split(' ')[0]}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-auto">
        <div className="p-3 rounded-xl bg-slate-950/40 border border-dashed border-white/10 flex items-center gap-3 group-hover:border-purple-500/20 transition-all duration-700">
          <Cpu className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] leading-normal group-hover:text-slate-400">
            Next Level: Guardian Alpha <br />
            <span className="text-purple-500 italic">2 Achievements Required</span>
          </p>
        </div>
      </div>
    </GlassCard>
  );
};