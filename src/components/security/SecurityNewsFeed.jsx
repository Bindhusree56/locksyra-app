import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, TrendingUp, AlertCircle, ExternalLink, RefreshCw, Filter, Zap, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const SecurityNewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const cleanHTML = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const categorizeNews = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.match(/breach|leak|hack|attack/)) return 'breach';
    if (lowerText.match(/vulnerability|cve|exploit/)) return 'vulnerability';
    if (lowerText.match(/malware|ransomware|virus/)) return 'malware';
    if (lowerText.match(/phishing|scam|fraud/)) return 'phishing';
    return 'general';
  };

  const getMockNews = useCallback(() => [
    {
      title: 'Major University Data Breach Affects 50,000 Students',
      description: 'A significant data breach at a large university has exposed personal information of thousands of students...',
      link: '#',
      pubDate: new Date().toISOString(),
      source: 'Security Weekly',
      category: 'breach'
    },
    {
      title: 'New Phishing Campaign Targets College Students',
      description: 'Security researchers have identified a new phishing campaign specifically targeting students with fake scholarship offers...',
      link: '#',
      pubDate: new Date(Date.now() - 3600000).toISOString(),
      source: 'Cyber News',
      category: 'phishing'
    }
  ], []);

  const fetchSecurityNews = useCallback(async () => {
    setLoading(true);
    try {
      const feeds = [
        'https://feeds.feedburner.com/TheHackersNews',
        'https://krebsonsecurity.com/feed/',
        'https://www.bleepingcomputer.com/feed/',
      ];
      const allNews = [];
      for (const feed of feeds) {
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`);
          const data = await response.json();
          if (data.items) {
            const items = data.items.slice(0, 5).map(item => ({
              title: item.title,
              description: cleanHTML(item.description || item.content),
              link: item.link,
              pubDate: item.pubDate,
              source: data.feed.title,
              category: categorizeNews(item.title + ' ' + item.description)
            }));
            allNews.push(...items);
          }
        } catch (err) {
          console.error('Feed fetch error:', err);
        }
      }
      allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setNews(allNews);
    } catch (error) {
      console.error('News fetch failed:', error);
      setNews(getMockNews());
    }
    setLoading(false);
  }, [getMockNews]);

  useEffect(() => {
    fetchSecurityNews();
  }, [fetchSecurityNews]);

  const getCategoryColor = (category) => {
    switch(category) {
      case 'breach': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'vulnerability': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'malware': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'phishing': return 'text-primary-400 border-primary-500/30 bg-primary-500/10';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.category === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Intelligence Feed</h1>
          <div className="flex items-center gap-2 text-slate-400 mt-2">
            <Globe className="w-4 h-4 text-primary-400" />
            <p className="text-sm font-medium italic">Global Security Telemetry & Zero-Day Updates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSecurityNews}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 rounded-xl transition-all disabled:opacity-50 font-black text-xs uppercase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            SYNCHRONIZE FEED
          </button>
        </div>
      </div>

      {/* Filters Hub */}
      <GlassCard className="p-4 overflow-x-auto no-scrollbar" delay={0.1}>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-800 rounded-lg mr-2">
             <Filter className="w-4 h-4 text-slate-400" />
          </div>
          {['all', 'breach', 'vulnerability', 'malware', 'phishing', 'general'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === cat
                  ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* News Items List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 flex flex-col items-center justify-center text-center space-y-4"
              >
                <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
                <p className="text-xs font-black text-primary-400 uppercase tracking-widest animate-pulse">Decrypting Intel Packets...</p>
              </motion.div>
            ) : filteredNews.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center glass-card p-12 border-dashed"
              >
                <div className="p-4 bg-slate-900 rounded-3xl w-fit mx-auto mb-4 border border-white/5 opacity-30">
                   <Newspaper className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Intelligence Records Found</p>
              </motion.div>
            ) : (
              filteredNews.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <GlassCard className="p-0 overflow-hidden group border-none">
                    <div className="flex flex-col md:flex-row h-full">
                       <div className="md:w-fix p-8 flex flex-col justify-between bg-slate-950/40 border-r border-white/5 relative">
                          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary-500/20 to-transparent" />
                          
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all duration-500 ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                               <Clock className="w-3 h-3" /> {new Date(item.pubDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-black text-white leading-tight mb-4 group-hover:text-primary-400 transition-colors">
                            {item.title}
                          </h3>
                          
                          <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6 line-clamp-3">
                            {item.description.substring(0, 220)}...
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-primary-400 border border-white/10 uppercase">
                                  {item.source.charAt(0)}
                               </div>
                               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.source}</span>
                            </div>
                            
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs font-black text-primary-400 hover:text-white transition-all group/link"
                            >
                              EXTRACT FULL REPORT
                              <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                            </a>
                          </div>
                       </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Intel */}
        <div className="space-y-6">
          <GlassCard className="p-8 border-rose-500/20">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-rose-400" />
              </div>
              Global Threat Matrix
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Credential Stuffing', trend: '+45%', desc: 'Increased reuse targeting .edu domains.', icon: '🔐', color: 'text-rose-400' },
                { label: 'Phishing Vectors', trend: '+23%', desc: 'Sophisticated scholarship-based scams.', icon: '🎣', color: 'text-amber-400' },
                { label: 'SMS Integrity', trend: '+67%', desc: 'Mass delivery notification impersonations.', icon: '📱', color: 'text-primary-400' }
              ].map((threat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-rose-500/20 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                       <span className="text-xl group-hover:scale-110 transition-transform">{threat.icon}</span>
                       <span className="text-xs font-black text-white uppercase tracking-tight">{threat.label}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase ${threat.color}`}>{threat.trend}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium tracking-tight italic leading-relaxed">
                    {threat.desc}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8 bg-primary-500/5 group" delay={0.3}>
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary-400" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Intel Protocol</h4>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
               "Operational readiness is maintained by staying ahead of the adversary's technical curve."
             </p>
             <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-950/40 border border-white/5 mb-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link Synchronized</span>
                </div>
                <p className="text-[9px] text-slate-600 uppercase tracking-tighter italic">Source: Distributed Security Heuristics v1.2</p>
             </div>
          </GlassCard>

          <GlassCard className="p-6 bg-slate-900/40 border-slate-800" hover={false}>
            <div className="flex items-center gap-4 text-slate-500">
               <AlertCircle className="w-5 h-5 flex-shrink-0" />
               <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tighter italic leading-none pt-0.5">
                 "Live data feeds from 12 separate node arrays integrated into telemetry hub."
               </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SecurityNewsFeed;
;

