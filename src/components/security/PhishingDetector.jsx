import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Loader } from 'lucide-react';

const PhishingDetector = () => {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // FREE Alternative: Use ipqualityscore.com (100 free requests/day)
  const checkURL = async () => {
    if (!url) return;
    
    setChecking(true);
    setResult(null);

    try {
      // Method 1: ipqualityscore.com (FREE - 100 requests/day, no card needed)
      const response = await fetch(
        `https://www.ipqualityscore.com/api/json/url/vPIy7so7AwJpfySXMfqqwExA4vbvc6fN/${encodeURIComponent(url)}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      
      const risk = data.risk_score || 0;
      const isSafe = risk < 75;
      
      const checkResult = {
        url,
        safe: isSafe,
        risk: risk >= 85 ? 'high' : risk >= 50 ? 'medium' : 'low',
        score: risk,
        details: {
          malware: data.malware || false,
          phishing: data.phishing || false,
          suspicious: data.suspicious || false,
          parking: data.parking || false,
          spamming: data.spamming || false,
          adult: data.adult || false
        },
        domain: data.domain || new URL(url).hostname,
        timestamp: new Date().toISOString()
      };
      
      setResult(checkResult);
      setHistory(prev => [checkResult, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('URL check failed:', error);
      
      // Fallback: Basic client-side checks
      const basicCheck = performBasicCheck(url);
      setResult(basicCheck);
      setHistory(prev => [basicCheck, ...prev.slice(0, 9)]);
    }
    
    setChecking(false);
  };

  // Fallback: Basic URL safety checks (works offline)
  const performBasicCheck = (urlString) => {
    const suspiciousPatterns = [
      /paypal.*verify/i,
      /secure.*account/i,
      /suspended.*account/i,
      /update.*billing/i,
      /confirm.*identity/i,
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP address
      /bit\.ly|tinyurl|goo\.gl/, // URL shorteners
      /\-/g // Multiple hyphens
    ];
    
    let riskScore = 0;
    const flags = [];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(urlString)) {
        riskScore += 20;
        flags.push('Suspicious pattern detected');
      }
    });
    
    // Check for HTTPS
    if (!urlString.startsWith('https://')) {
      riskScore += 30;
      flags.push('Not using secure HTTPS');
    }
    
    // Check for unusual TLDs
    const unusualTLDs = /\.(tk|ml|ga|cf|gq|xyz|top|work)$/i;
    if (unusualTLDs.test(urlString)) {
      riskScore += 15;
      flags.push('Unusual domain extension');
    }
    
    return {
      url: urlString,
      safe: riskScore < 50,
      risk: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
      score: Math.min(100, riskScore),
      details: { flags },
      domain: new URL(urlString).hostname,
      timestamp: new Date().toISOString(),
      offline: true
    };
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'from-green-50 to-emerald-50 border-green-300';
      case 'medium': return 'from-yellow-50 to-orange-50 border-yellow-300';
      case 'high': return 'from-red-50 to-pink-50 border-red-300';
      default: return 'from-gray-50 to-gray-100 border-gray-300';
    }
  };

  const getRiskIcon = (risk) => {
    switch(risk) {
      case 'low': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'medium': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'high': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default: return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Main Scanner */}
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Phishing URL Detector</h2>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            ✅ FREE API
          </span>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://suspicious-website.com"
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-blue-200 focus:border-blue-400 outline-none"
          />
          <button
            onClick={checkURL}
            disabled={checking || !url}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {checking ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Scan URL
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-6 border-2 bg-gradient-to-r ${getRiskColor(result.risk)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getRiskIcon(result.risk)}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {result.safe ? '✅ Safe Website' : '⚠️ Dangerous Website'}
                  </h3>
                  <p className="text-sm text-gray-600">{result.domain}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{result.score}</div>
                <div className="text-xs text-gray-600">Risk Score</div>
              </div>
            </div>

            {/* Threat Details */}
            {result.details && (
              <div className="space-y-2">
                {result.details.malware && (
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-medium">
                    🦠 Malware detected
                  </div>
                )}
                {result.details.phishing && (
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-medium">
                    🎣 Phishing attempt detected
                  </div>
                )}
                {result.details.suspicious && (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium">
                    ⚠️ Suspicious activity
                  </div>
                )}
                {result.details.flags && result.details.flags.map((flag, idx) => (
                  <div key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm">
                    • {flag}
                  </div>
                ))}
              </div>
            )}

            {result.offline && (
              <div className="mt-4 text-xs text-gray-600 bg-white/50 rounded-lg p-3">
                ℹ️ Basic offline check performed. For comprehensive scanning, add your free API key.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scan History */}
      {history.length > 0 && (
        <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Recent Scans ({history.length})
          </h3>
          <div className="space-y-3">
            {history.slice(0, 5).map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getRiskIcon(item.risk)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{item.domain}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.safe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.safe ? 'Safe' : 'Dangerous'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Tips */}
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl p-6 border-2 border-blue-300">
        <h3 className="font-bold text-blue-800 mb-3">🛡️ How to Spot Phishing URLs:</h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li className="flex items-start gap-2">
            <span>1.</span>
            <span>Check for HTTPS (secure lock icon)</span>
          </li>
          <li className="flex items-start gap-2">
            <span>2.</span>
            <span>Look for misspellings in the domain (paypa1.com instead of paypal.com)</span>
          </li>
          <li className="flex items-start gap-2">
            <span>3.</span>
            <span>Avoid clicking shortened URLs from unknown sources</span>
          </li>
          <li className="flex items-start gap-2">
            <span>4.</span>
            <span>Be wary of urgent requests to "verify account" or "update billing"</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PhishingDetector;