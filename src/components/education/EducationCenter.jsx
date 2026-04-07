import React from 'react';
import { BookOpen, Zap, Play, ChevronRight, HelpCircle, Shield, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const EducationCenter = () => {
  const tutorials = [
    { id: 1, title: 'Infiltration Protocols: Phishing', duration: '5 min', difficulty: 'Beginner', icon: '🎣', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: 2, title: 'Identity Fortification: Passwords', duration: '3 min', difficulty: 'Beginner', icon: '🔐', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 3, title: 'Verification Cycles: 2FA Hub', duration: '4 min', difficulty: 'Intermediate', icon: '📱', color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { id: 4, title: 'Signal Isolation: WiFi Security', duration: '6 min', difficulty: 'Intermediate', icon: '📡', color: 'text-purple-400', bg: 'bg-purple-500/10' }
  ];

  const tips = [
    "Encryption keys should remain isolated from secondary agents.",
    "Heterogeneous credential patterns prevent cross-domain compromise.",
    "Multi-factor verification is the primary defense against identity theft.",
    "Periodic system kernel updates mitigate zero-day vulnerabilities.",
    "Execute diagnostic sweeps on all unexpected transmission links."
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Security Academy</h1>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <BookOpen className="w-4 h-4 text-primary-400" />
            <p className="text-sm font-medium italic">Operational Intelligence & Tactical Training</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Knowledge Rank</p>
            <p className="text-sm font-black text-white uppercase tracking-tight">Cyber Guardian I</p>
          </div>
          <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
            <Award className="w-6 h-6 text-primary-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Learning Track */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Play className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Interactive Modules</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorials.map((tutorial, idx) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <GlassCard className="p-0 overflow-hidden cursor-pointer group border-none">
                    <div className={`${tutorial.bg} p-6 border-b border-white/5`}>
                        <div className="flex items-start justify-between">
                           <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                             {tutorial.icon}
                           </div>
                           <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                        <h4 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors">
                          {tutorial.title}
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> {tutorial.duration}
                          </div>
                          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${tutorial.color}`}>
                            <Zap className="w-3 h-3" /> {tutorial.difficulty}
                          </div>
                        </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

          <GlassCard className="p-8">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-primary-400" />
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Intelligence Queries (FAQ)</h2>
             </div>
             
             <div className="space-y-4">
                {[
                  { q: "Breach Frequency Analysis?", a: "We recommend a full-system audit every 168 hours (weekly), or immediately following publicized critical exposure events." },
                  { q: "Data Integrity Protocol?", a: "Zero-Knowledge Architecture. All data processing occurs within your hardware's secure enclave; no credentials traverse our servers." },
                  { q: "Optimal Entropy Threshold?", a: "Minimum 12 randomized characters including cross-case literals, numeric strings, and symbolic markers." }
                ].map((item, i) => (
                  <details key={i} className="group overflow-hidden rounded-2xl bg-slate-950/40 border border-white/5 transition-all">
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-bold text-slate-300 group-open:text-primary-400 group-open:bg-primary-500/5 transition-colors">
                      <span className="text-sm font-black uppercase tracking-tight">{item.q}</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="p-5 pt-0 text-xs text-slate-500 leading-relaxed font-medium italic border-t border-white/5 bg-slate-950/20">
                      {item.a}
                    </div>
                  </details>
                ))}
             </div>
          </GlassCard>
        </div>

        {/* Tactical Feed / Tips */}
        <div className="space-y-6">
          <GlassCard className="p-8 border-primary-500/30">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary-400" />
              </div>
              Rapid Directives
            </h3>
            
            <div className="space-y-4">
              <AnimatePresence>
                {tips.map((tip, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-primary-500/20 transition-colors"
                  >
                    <div className="w-6 h-6 flex-shrink-0 bg-primary-900/40 rounded-lg flex items-center justify-center text-[10px] font-black text-primary-400 border border-primary-500/20">
                       {idx + 1}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>

          <GlassCard className="p-8 bg-emerald-500/5 border-emerald-500/10" hover={false}>
             <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
                   <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Perimeter Secured</h4>
                <p className="text-[10px] text-emerald-400/60 font-medium">Your current academic progression has fortified the digital perimeter by 1.2x.</p>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default EducationCenter;
