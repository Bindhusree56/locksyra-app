import React, { useState, useEffect } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff,
  AlertCircle, CheckCircle, UserPlus, Loader,
  ShieldCheck, Zap, Globe, Cpu, Terminal, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/emailValidator';
import { motion, AnimatePresence, useTransform, useSpring } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const FloatingAsset = ({ icon: Icon, delay = 0, x = 0, y = 0, scale = 1, opacity = 0.2, rotate = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity, 
        scale,
        x: [x - 10, x + 10, x - 10], 
        y: [y - 15, y + 15, y - 15],
        rotate: [rotate - 5, rotate + 5, rotate - 5]
      }}
      transition={{ 
        duration: 8 + Math.random() * 4, 
        repeat: Infinity, 
        delay, 
        ease: "easeInOut" 
      }}
      className="absolute pointer-events-none"
      style={{ left: `${50 + x}%`, top: `${50 + y}%` }}
    >
      <div className="p-4 bg-primary-500/10 backdrop-blur-3xl rounded-2xl border border-primary-500/20 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
        <Icon className="w-8 h-8 text-primary-400 opacity-60" />
      </div>
    </motion.div>
  );
};

const AuthPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [emailError, setEmailError] = useState('');
  
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });
  
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: ''
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Parallax transforms
  const p1X = useTransform(mouseX, [-0.5, 0.5], [-30, 30]);
  const p1Y = useTransform(mouseY, [-0.5, 0.5], [-30, 30]);
  const p2X = useTransform(mouseX, [-0.5, 0.5], [50, -50]);
  const p2Y = useTransform(mouseY, [-0.5, 0.5], [50, -50]);

  // Backend health check
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('http://localhost:5001/health');
        const data = await res.json();
        setServerStatus(data.success ? 'online' : 'offline');
      } catch {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    if (error) { setError(''); }
    if (field === 'email' && value) {
      const emailCheck = validateEmail(value);
      setEmailError(emailCheck.valid ? '' : emailCheck.message);
    } else if (field === 'email') {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!form.email || !form.password) {
        setError('Email and password are required');
        return;
    }

    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login(form.email, form.password);
      } else {
        result = await register(form.email, form.password, form.firstName, form.lastName);
      }

      if (result.success) {
        setSuccess(mode === 'login' ? '✅ Connection established. Synchronizing session...' : '✅ Profile initialized. Access granted.');
      } else {
        setError(result.error || 'Identity verification failed');
      }
    } catch (err) {
      setError(err.message || 'Fatal communication error with security kernel.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(''); setSuccess(''); setEmailError('');
    setForm({
      email: '', password: '', confirmPassword: '', firstName: '', lastName: ''
    });
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return [
      { label: 'Low Integrity', color: 'bg-rose-500', width: '25%' },
      { label: 'Basic', color: 'bg-amber-500', width: '50%' },
      { label: 'Optimal', color: 'bg-blue-500', width: '75%' },
      { label: 'Fortified', color: 'bg-emerald-500', width: '100%' }
    ][score] || { label: 'Low Integrity', color: 'bg-rose-500', width: '25%' };
  };

  const strength = mode === 'register' ? getPasswordStrength() : null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden relative">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-scanlines opacity-[0.03]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Container */}
      <div className="w-full h-full flex flex-col lg:flex-row p-6 md:p-12 lg:p-24 gap-12 items-center justify-center relative z-10">
        
        {/* LEFT SIDE: 3D Parallax Hero */}
        <div className="hidden lg:flex flex-1 flex-col items-start justify-center relative h-full">
           <motion.div 
             style={{ x: p1X, y: p1Y }}
             className="relative z-20 space-y-8"
           >
              <div className="relative group">
                <div className="w-28 h-28 bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary-500/10 animate-pulse" />
                   <ShieldCheck className="w-full h-full text-primary-400 relative z-10 drop-shadow-[0_0_15px_rgba(14,165,233,0.6)]" />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-7xl font-black leading-[0.9] text-white tracking-tighter uppercase italic">
                   The Digital <br />
                   <span className="text-primary-400 text-glow">Perimeter.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-black uppercase tracking-widest opacity-80 mt-6">
                  Elite Cloud Security & <br /> Identity Intelligence.
                </p>
              </div>

              <div className="flex gap-4">
                 <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Real-Time Monitoring</span>
                 </div>
                 <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary-400" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Node Network</span>
                 </div>
              </div>
           </motion.div>

           {/* Parallax Assets */}
           <motion.div style={{ x: p2X, y: p2Y }} className="absolute inset-0 z-10">
              <FloatingAsset icon={Terminal} x={-20} y={-30} scale={0.8} opacity={0.15} rotate={15} />
              <FloatingAsset icon={Cpu} x={30} y={-20} scale={1.2} opacity={0.2} rotate={-10} />
              <FloatingAsset icon={Key} x={-40} y={20} scale={0.9} opacity={0.1} rotate={45} />
              <FloatingAsset icon={Globe} x={25} y={35} scale={1.5} opacity={0.05} rotate={-20} />
              <FloatingAsset icon={Lock} x={10} y={-45} scale={0.7} opacity={0.15} rotate={10} />
           </motion.div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "circOut" }}
          className="w-full max-w-[520px] relative"
        >
          {/* Form Glow */}
          <div className="absolute inset-0 bg-primary-600/5 blur-[80px] -z-10 rounded-full" />
          
          <GlassCard className="p-0 border-none shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-10 md:p-12 space-y-10">
              {/* Tab Navigation */}
              <div className="flex bg-slate-950/80 p-2 rounded-[2rem] border border-white/5 shadow-inner">
                {[{ id: 'login', label: 'Authenticate', icon: Terminal }, { id: 'register', label: 'Register', icon: UserPlus }].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => switchMode(tab.id)}
                    className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2.5 ${
                      mode === tab.id
                        ? 'bg-primary-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] border border-primary-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Server Status HUD */}
              <div className="flex items-center justify-center gap-3">
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                   serverStatus === 'online' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-rose-400 border-rose-400/20 bg-rose-400/5'
                 }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 shadow-[0_0_8px_currentColor]'}`} />
                    SEC-SERVER: {serverStatus || 'PINGING...'}
                 </div>
                 <div className="px-4 py-2 rounded-full text-[9px] font-black text-primary-400 border border-primary-400/20 bg-primary-400/5 uppercase tracking-widest">
                    ENCRYPTION: AES-256-GCM
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {mode === 'register' && (
                      <div className="grid grid-cols-2 gap-4">
                        {[{ field: 'firstName', placeholder: 'CYPHER', label: 'First Name', icon: User },
                          { field: 'lastName', placeholder: 'VOID', label: 'Last Name', icon: User }].map(({ field, placeholder, label, icon: Icon }) => (
                          <div key={field} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">{label}</label>
                            <div className="relative group">
                              <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                              <input
                                type="text" value={form[field]} onChange={update(field)} placeholder={placeholder}
                                className="w-full pl-14 pr-5 py-4.5 rounded-[1.5rem] border border-white/5 bg-slate-950/60 text-sm font-bold text-white focus:outline-none focus:border-primary-500/40 transition-all placeholder:text-slate-800 placeholder:italic"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Communication ID</label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                        <input
                          type="email" value={form.email} onChange={update('email')}
                          placeholder="OPERATIVE@NETWORK.COM" required
                          className="w-full pl-14 pr-5 py-5 rounded-[1.5rem] border border-white/5 bg-slate-950/60 text-sm font-bold text-white focus:outline-none focus:border-primary-500/40 transition-all placeholder:text-slate-800"
                        />
                      </div>
                      {emailError && <p className="text-[10px] font-black text-rose-400 px-4 mt-1 uppercase tracking-tighter italic">{emailError}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Key</label>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-400 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')}
                          placeholder="••••••••••••" required
                          className="w-full pl-14 pr-14 py-5 rounded-[1.5rem] border border-white/5 bg-slate-950/60 text-sm font-bold text-white focus:outline-none focus:border-primary-500/40 transition-all placeholder:text-slate-800"
                        />
                        <button type="button" onClick={() => setShowPassword(s => !s)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {mode === 'register' && form.password && (
                        <div className="pt-2 px-4">
                          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: strength?.width || '0%' }}
                               className={`h-full ${strength?.color} shadow-[0_0_10px_currentColor]`} 
                            />
                          </div>
                          <p className={`text-[9px] font-black uppercase mt-2 tracking-[0.2em] ${strength?.color?.replace('bg-', 'text-')}`}>
                            Integrity: {strength?.label}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-black uppercase tracking-tighter italic flex items-center gap-3"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    SYSTEM ERROR: {error}
                  </motion.div>
                )}
                
                {success && (
                   <motion.div 
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-tighter italic flex items-center gap-3"
                   >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || serverStatus === 'offline'}
                  className="w-full group relative overflow-hidden bg-primary-600 hover:bg-primary-500 text-white py-6 rounded-[2rem] font-black text-base transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary-900/40"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 tracking-[0.3em] uppercase italic">
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : 
                      mode === 'login' ? <Terminal className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    {mode === 'login' ? 'Establish Link' : 'Initialize Node'}
                  </span>
                </button>
              </form>

              <div className="text-center space-y-6">
                 <button 
                  type="button" 
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all group"
                >
                  {mode === 'login' ? "Unauthorized?" : "Credentialed?"}
                  <span className="text-primary-400 group-hover:underline ml-2">
                    {mode === 'login' ? 'Request Link' : 'Secure Authenticate'}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2 text-[9px] text-slate-700 font-black uppercase tracking-[0.4em] pointer-events-none">
                   <Lock className="w-3 h-3" /> Zero Knowledge Architecture Active
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
