import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Newspaper, Key, BookOpen, Settings, 
  Home, Mail, LogOut, ChevronRight, User, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ currentScreen, onNavigate }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Control Deck' },
    { id: 'phishing', icon: Globe, label: 'Domain Sweep' },
    { id: 'passwords', icon: Key, label: 'Vault Access' },
    { id: 'breach', icon: Mail, label: 'Breach Monitor' },
    { id: 'news', icon: Newspaper, label: 'Intel Feed' },
    { id: 'learn', icon: BookOpen, label: 'Academy' },
    { id: 'settingsPanel', icon: Settings, label: 'Operational Params' }
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-80 flex-col z-50 p-6">
        <div className="flex-1 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex flex-col p-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/10 blur-[100px] pointer-events-none" />
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-12 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 bg-slate-950/80 rounded-2xl flex items-center justify-center border border-primary-500/30 group-hover:border-primary-500/60 transition-all duration-500">
                <Shield className="text-primary-400 w-7 h-7" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">LockSyra</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none">Ops Online</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 relative">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-4">Tactical Nav</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full group relative flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 ${
                    isActive 
                      ? 'bg-primary-500/10 text-white border border-primary-500/20' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 z-10">
                    <Icon className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-primary-400 scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'group-hover:text-slate-300'}`} />
                    <span className={`text-[13px] font-black uppercase tracking-wider transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 w-1 h-6 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,1)]"
                    />
                  )}
                  
                  <ChevronRight className={`w-4 h-4 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                </button>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="relative mt-8 pt-8 border-t border-white/5 space-y-6">
            <div className="p-5 rounded-3xl bg-slate-950/40 border border-white/5 group/profile hover:border-white/10 transition-all duration-500">
               <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/10 blur-md rounded-full" />
                    <div className="relative w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-primary-400 font-black border border-white/10 group-hover/profile:border-primary-500/30 transition-all">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white uppercase tracking-tight truncate">{user?.firstName || 'Opr. Alpha'}</p>
                    <p className="text-[10px] text-slate-500 truncate font-mono tracking-tighter italic">{user?.email}</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex flex-col items-center">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                     <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Verified</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex flex-col items-center">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank</span>
                     <span className="text-[9px] font-black text-primary-400 uppercase tracking-tighter">Guardian</span>
                  </div>
               </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 text-slate-500 hover:text-white bg-slate-950/40 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-2xl transition-all duration-500 group/logout"
            >
              <LogOut className="w-5 h-5 group-hover:text-rose-400 group-hover:-translate-x-1 transition-all" />
              <span className="font-black text-xs uppercase tracking-[0.2em] group-hover:text-rose-400">Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-2.5 flex items-center justify-around shadow-2xl">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative p-3.5 rounded-2xl transition-all duration-500 ${
                  isActive ? 'text-primary-400 bg-primary-500/10' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : ''}`} />
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full shadow-[0_0_12px_rgba(14,165,233,1)]" 
                  />
                )}
              </button>
            );
          })}
          
          <button 
            onClick={() => onNavigate('settingsPanel')}
            className={`p-3.5 rounded-2xl transition-all duration-500 ${
              currentScreen === 'settingsPanel' ? 'text-primary-400 bg-primary-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Settings className="w-6 h-6" />
          </button>
          
          <button 
            onClick={logout}
            className="p-3.5 rounded-2xl text-slate-500 hover:text-rose-400 transition-all duration-500"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
