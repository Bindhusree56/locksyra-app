import React, { useState } from 'react';

const BreachCard = ({ breach, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getSeverityColor = () => {
    switch(breach.severity) {
      case 'critical': return 'bg-red-50 border-red-300 text-red-700';
      case 'high': return 'bg-orange-50 border-orange-300 text-orange-700';
      case 'medium': return 'bg-yellow-50 border-yellow-300 text-yellow-700';
      default: return 'bg-blue-50 border-blue-300 text-blue-700';
    }
  };
  
  const getSeverityIcon = () => {
    switch(breach.severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };
  
  return (
    <div className={`rounded-2xl p-5 border-2 ${getSeverityColor()} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getSeverityIcon()}</div>
          <div>
            <h3 className="font-bold text-lg">{breach.Title}</h3>
            <p className="text-xs opacity-75">Breached: {breach.BreachDate}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/50">
          {breach.PwnCount.toLocaleString()} affected
        </span>
      </div>
      
      <p className="text-sm mb-3 opacity-90">{breach.Description}</p>
      
      <div className="mb-3">
        <h4 className="text-xs font-bold mb-2">Compromised Data:</h4>
        <div className="flex flex-wrap gap-2">
          {breach.DataClasses.map((dc, idx) => (
            <span key={idx} className="text-xs px-2 py-1 rounded-lg bg-white/60">
              {dc}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onAction('change', breach)}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
        >
          Change Password
        </button>
        <button
          onClick={() => onAction('review', breach)}
          className="flex-1 bg-white/60 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 transition-all"
        >
          Review Account
        </button>
      </div>
    </div>
  );
};

export default BreachCard;