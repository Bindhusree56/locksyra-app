import React from 'react';
import { Activity, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const Notifications = ({ notifications }) => {
  if (notifications.length === 0) return null;

  const getStatusDisplay = (risk) => {
    switch(risk) {
      case 'high': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'low': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      default: return { color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' };
    }
  };

  return (
    <GlassCard className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-500/10 rounded-lg">
          <Activity className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-lg font-black text-white uppercase tracking-tight">Real-Time Intel Stream</h2>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.slice(0, 3).map((notif, idx) => {
            const status = getStatusDisplay(notif.risk);
            return (
              <motion.div 
                key={notif.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`p-5 rounded-2xl border ${status.bg} ${status.border} flex items-start gap-4 group hover:border-white/20 transition-all`}
              >
                <div className={`p-2 rounded-xl bg-slate-900 border border-white/5 relative`}>
                   <div className={`absolute top-0 right-0 w-2 h-2 rounded-full transform -translate-y-1 translate-x-1 animate-pulse shadow-[0_0_8px_currentColor] ${status.color.replace('text', 'bg')}`} />
                   <Terminal className={`w-4 h-4 ${status.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-xs uppercase tracking-tight">{notif.title}</h3>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">{notif.message}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Sub-Process Active</span>
         </div>
         <button className="text-[9px] font-black text-primary-400 uppercase tracking-widest hover:text-white transition-colors">Clear Stream</button>
      </div>
    </GlassCard>
  );
};

export default Notifications;