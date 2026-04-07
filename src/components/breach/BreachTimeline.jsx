import React from 'react';
import { Calendar, Target, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const BreachTimeline = ({ breaches }) => {
  const sortedBreaches = [...breaches].sort((a, b) => 
    new Date(b.BreachDate) - new Date(a.BreachDate)
  );

  const getSeverity = (pwnCount) => {
    if (pwnCount > 10000000) return { color: 'bg-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.6)]' };
    if (pwnCount > 1000000) return { color: 'bg-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]' };
    return { color: 'bg-primary-500', glow: 'shadow-[0_0_15px_rgba(56,189,248,0.6)]' };
  };

  return (
    <GlassCard className="p-8" delay={0.6}>
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-primary-500/10 rounded-lg">
          <Calendar className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Chronological Exposure Log</h2>
      </div>

      <div className="relative">
        {/* Glow Line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-slate-800" />
        <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary-500/50 via-purple-500/50 to-transparent blur-[1px]" />

        <div className="space-y-10">
          {sortedBreaches.map((breach, idx) => {
            const severity = getSeverity(breach.PwnCount);
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-12"
              >
                {/* Visual Node */}
                <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-slate-950 ${severity.color} ${severity.glow} z-10 flex items-center justify-center`}>
                  {breach.PwnCount > 1000000 ? <AlertCircle className="w-3 h-3 text-white" /> : <Shield className="w-3 h-3 text-white" />}
                </div>

                <div className="group relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-black text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">
                      {breach.Title}
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-white/5 uppercase tracking-widest">
                      {new Date(breach.BreachDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 italic">
                      "{breach.Description.substring(0, 180)}..."
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-primary-500" />
                        <span>{breach.PwnCount.toLocaleString()} Impact Units</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span>Vector Analyzed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {sortedBreaches.length === 0 && (
        <div className="text-center py-20 opacity-30">
          <Calendar className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">Historical Log Clear</p>
        </div>
      )}
    </GlassCard>
  );
};

export default BreachTimeline;