import React from 'react';
import Sidebar from '../navigation/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const AppLayout = ({ children, currentScreen, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-primary-500/30 selection:text-primary-100 flex overflow-x-hidden relative">
      
      {/* Premium Digital Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#020617]" />
        
        {/* Dynamic Glow Nodes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[120px]" />
        
        {/* Fine Grain Texture */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-scanlines opacity-[0.03]" />
      </div>

      {/* Navigation */}
      <Sidebar currentScreen={currentScreen} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 flex flex-col p-4 lg:p-10 pb-36 lg:pb-10 max-w-[1600px] mx-auto w-full relative z-10 transition-all duration-500">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 150 }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AppLayout;
