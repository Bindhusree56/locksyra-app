import React from 'react';
import { Activity, AlertTriangle, Zap } from 'lucide-react';

const AIAnalysis = ({ 
  analyzing, 
  anomalyDetected, 
  aiInsight, 
  onAnalyze 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-800">AI Behavior Analysis</h2>
        </div>
        <button 
          onClick={onAnalyze} 
          disabled={analyzing} 
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Run Deep AI Scan
            </>
          )}
        </button>
      </div>

      {anomalyDetected && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-700 mb-1">⚠️ Security Anomaly Detected!</h3>
            <p className="text-sm text-red-600">Unusual activity patterns found. Check the AI insight below for details.</p>
          </div>
        </div>
      )}

      {aiInsight && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
              🤖
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-700 mb-2">Claude AI Security Insight</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      {!aiInsight && !analyzing && (
        <div className="text-center py-8 text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "Run Deep AI Scan" to get personalized security insights</p>
          <p className="text-xs mt-2">Powered by Claude AI • Analyzes behavior patterns in real-time</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;