import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import { Shield, AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';

const BreachCard = ({ breach, onAction }) => {
  
  const getSeverity = () => {
    const pwnCount = breach.PwnCount || 0;
    if (pwnCount > 10000000) return { label: 'CRITICAL', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: AlertCircle };
    if (pwnCount > 1000000) return { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle };
    if (pwnCount > 100000) return { label: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Info };
    return { label: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Shield };
  };

  const severity = getSeverity();
  const Icon = severity.icon;
  
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <GlassCard className="p-0 overflow-hidden border-none shadow-[0_0_40px_rgba(30,41,59,0.3)]">
        <div className={`h-1.5 w-full bg-gradient-to-r from-transparent via-slate-400/20 to-transparent`} />
        
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${severity.bg} ${severity.border} border`}>
                <Icon className={`w-6 h-6 ${severity.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">{breach.Title}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                  Breach Logged: {new Date(breach.BreachDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${severity.bg} ${severity.color} border ${severity.border}`}>
              {severity.label}
            </div>
          </div>

          <div 
            className="text-sm text-slate-400 leading-relaxed max-h-24 overflow-y-auto pr-2 custom-scrollbar"
            dangerouslySetInnerHTML={{ __html: breach.Description }}
          />

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               Compromised Metadata Vectors
            </p>
            <div className="flex flex-wrap gap-2">
              {breach.DataClasses.map((dc, idx) => (
                <span key={idx} className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-900/60 text-slate-300 border border-white/5">
                  {dc}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
               <span className="text-xs font-bold text-slate-500">
                 {breach.PwnCount.toLocaleString()} impact clusters
               </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onAction('change', breach)}
                className="group px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-primary-900/20"
              >
                ROTATE SECRET <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default BreachCard;