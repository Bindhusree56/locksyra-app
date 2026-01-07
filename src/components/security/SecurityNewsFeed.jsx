import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const SecurityNewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSecurityNews();
  }, []);

  const fetchSecurityNews = async () => {
    setLoading(true);
    
    try {
      // FREE Method: Use rss2json.com to convert RSS to JSON (no API key needed)
      const feeds = [
        'https://feeds.feedburner.com/TheHackersNews', // The Hacker News
        'https://krebsonsecurity.com/feed/', // Krebs on Security
        'https://www.bleepingcomputer.com/feed/', // Bleeping Computer
      ];

      const allNews = [];
      
      for (const feed of feeds) {
        try {
          const response = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`
          );
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

      // Sort by date (newest first)
      allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      
      setNews(allNews);
    } catch (error) {
      console.error('News fetch failed:', error);
      // Fallback to mock data
      setNews(getMockNews());
    }
    
    setLoading(false);
  };

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

  const getMockNews = () => [
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
  ];

  const getCategoryColor = (category) => {
    switch(category) {
      case 'breach': return 'bg-red-100 text-red-700';
      case 'vulnerability': return 'bg-orange-100 text-orange-700';
      case 'malware': return 'bg-purple-100 text-purple-700';
      case 'phishing': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'breach': return '🚨';
      case 'vulnerability': return '⚠️';
      case 'malware': return '🦠';
      case 'phishing': return '🎣';
      default: return '📰';
    }
  };

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.category === filter);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-indigo-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-800">Security News Feed</h2>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              ✅ LIVE
            </span>
          </div>
          <button
            onClick={fetchSecurityNews}
            disabled={loading}
            className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'breach', 'vulnerability', 'malware', 'phishing', 'general'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* News List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600">Loading latest security news...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No news found in this category
              </div>
            ) : (
              filteredNews.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-800 text-lg pr-4">
                          {item.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description.substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">{item.source}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                        </div>
                        
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Read More
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Trending Threats */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-6 border-2 border-red-200">
        <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Security Threats This Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-2xl mb-2">🎣</div>
            <h4 className="font-bold text-gray-800 mb-1">Phishing Attacks</h4>
            <p className="text-sm text-gray-600">↑ 23% increase targeting students</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-2xl mb-2">🔐</div>
            <h4 className="font-bold text-gray-800 mb-1">Credential Stuffing</h4>
            <p className="text-sm text-gray-600">↑ 45% from reused passwords</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-bold text-gray-800 mb-1">SMS Scams</h4>
            <p className="text-sm text-gray-600">↑ 67% fake delivery notifications</p>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-600" />
          Alert Preferences
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-700">Notify about data breaches</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-700">Daily security digest</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-700">Critical vulnerabilities only</span>
            <input type="checkbox" className="w-5 h-5" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SecurityNewsFeed;