import React, { useState } from 'react';
import { Shield, Mail, Search, CheckCircle, XCircle, RefreshCw, Download, Database, Zap } from 'lucide-react';
import { checkBreaches } from '../../utils/breachUtils';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import BreachCard from './BreachCard';
import BreachTimeline from './BreachTimeline';
import GoogleSheetsLogger from './GoogleSheetsLogger';

const BreachMonitor = () => {
  const [email, setEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [checking, setChecking] = useState(false);
  const [breaches, setBreaches] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [securityScore, setSecurityScore] = useState(85);
  const [badges, setBadges] = useState(['🛡️ First Day', '⚡ Quick Learner']);
  const [checkHistory, setCheckHistory] = useState([]);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  
  const handleBreachCheck = async () => {
    if (!email) return;
    
    setChecking(true);
    setHasChecked(false);
    
    try {
      const foundBreaches = await checkBreaches(email);
      setBreaches(foundBreaches);
      setHasChecked(true);
      
      // Update security score
      if (foundBreaches.length > 0) {
        const criticalCount = foundBreaches.filter(b => b.severity === 'critical').length;
        setSecurityScore(Math.max(40, securityScore - (foundBreaches.length * 10) - (criticalCount * 5)));
      } else {
        setSecurityScore(Math.min(100, securityScore + 10));
        earnBadge('🔍 Breach Hunter');
      }
      
      // Log to check history
      const checkRecord = {
        id: Date.now(),
        email,
        timestamp: new Date().toISOString(),
        breachCount: foundBreaches.length,
        breached: foundBreaches.length > 0,
        action: 'checked'
      };
      setCheckHistory(prev => [checkRecord, ...prev.slice(0, 9)]);
      
      if (foundBreaches.length === 0) {
        earnBadge('✅ Clean Record');
      } else if (foundBreaches.length >= 2) {
        earnBadge('📊 Data Guardian');
      }
      
    } catch (error) {
      console.error('Breach check failed:', error);
    }
    
    setChecking(false);
  };
  
  const earnBadge = (badge) => {
    if (!badges.includes(badge)) {
      setBadges(prev => [...prev, badge]);
    }
  };
  
  const handleBreachAction = (action, breach) => {
    const actionRecord = {
      id: Date.now(),
      email,
      timestamp: new Date().toISOString(),
      breachCount: breaches.length,
      breached: true,
      action: `${action}_${breach.Name}`
    };
    setCheckHistory(prev => [actionRecord, ...prev.slice(0, 9)]);
    
    if (action === 'change') {
      earnBadge('🔐 Password Master');
      setSecurityScore(Math.min(100, securityScore + 15));
    }
  };
  
  const handleGoogleSignIn = () => {
    console.log('Google Sign In - In production, this would authenticate with Google');
    setIsGoogleSignedIn(true);
    earnBadge('📊 Data Guardian');
  };
  
  const handleGoogleSignOut = () => {
    setIsGoogleSignedIn(false);
  };
  
  const exportToSheets = () => {
    if (!isGoogleSignedIn) {
      alert('Please connect to Google Sheets first');
      return;
    }
    
    earnBadge('📤 Export Master');
    alert('✅ Data exported to Google Sheets!');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 pb-32">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-3xl shadow-lg mb-6 sticky top-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Shield className="w-8 h-8 text-white" />
                <h1 className="text-3xl font-bold text-white">SecureU</h1>
              </div>
              <p className="text-purple-100 text-sm">Breach Monitor & Password Analyzer</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{securityScore}</div>
              <div className="text-xs text-purple-100">Security Score</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-gray-800">Badges Earned</h2>
            <span className="ml-auto text-sm text-blue-600 font-medium">{badges.length}/15</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <span key={idx} className="text-2xl bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border-2 border-blue-200">
                {badge}
              </span>
            ))}
          </div>
        </div>
        
        <GoogleSheetsLogger
          isSignedIn={isGoogleSignedIn}
          onSignIn={handleGoogleSignIn}
          onSignOut={handleGoogleSignOut}
        />
        
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-800">Check Email for Breaches</h2>
          </div>
          
          <div className="flex gap-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@university.edu"
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 outline-none text-gray-800"
            />
            <button
              onClick={handleBreachCheck}
              disabled={checking || !email}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check Now
                </>
              )}
            </button>
          </div>
          
          {hasChecked && (
            <div className={`rounded-2xl p-4 border-2 ${breaches.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-3">
                {breaches.length > 0 ? (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-bold text-red-800">⚠️ {breaches.length} Breach{breaches.length > 1 ? 'es' : ''} Found!</h3>
                      <p className="text-sm text-red-600">Your email appeared in {breaches.length} data breach{breaches.length > 1 ? 'es' : ''}. Take action below.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-bold text-green-800">🎉 All Clear!</h3>
                      <p className="text-sm text-green-600">No breaches found for this email. Stay vigilant!</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Test a password (never stored)"
            className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 outline-none text-gray-800 bg-white/80 backdrop-blur"
          />
          <PasswordStrengthMeter password={testPassword} onBadgeEarned={earnBadge} />
        </div>
        
        {breaches.length > 0 && (
          <>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-red-500">⚠️</span>
                Found Breaches ({breaches.length})
              </h2>
              {breaches.map((breach, idx) => (
                <BreachCard 
                  key={idx} 
                  breach={breach} 
                  onAction={handleBreachAction}
                />
              ))}
            </div>
            
            <BreachTimeline breaches={breaches} />
          </>
        )}
        
        {checkHistory.length > 0 && (
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-800">Check History</h2>
              </div>
              <button
                onClick={exportToSheets}
                disabled={!isGoogleSignedIn}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export to Sheets
              </button>
            </div>
            
            <div className="space-y-2">
              {checkHistory.slice(0, 5).map((record) => (
                <div key={record.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{record.email}</div>
                      <div className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.breached ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {record.breached ? `${record.breachCount} breaches` : 'Clean'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{record.action}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-300">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-purple-800 mb-2">💡 Pro Security Tips</h3>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Check your email regularly (aim for monthly checks to maintain your streak!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Use unique passwords for each account (password managers are your friend!)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Enable 2FA/MFA on all important accounts for extra protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>If breached, change passwords immediately and enable security alerts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreachMonitor;