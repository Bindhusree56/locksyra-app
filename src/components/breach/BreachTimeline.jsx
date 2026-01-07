import React from 'react';
import { Calendar, TrendingDown } from 'lucide-react';

const BreachTimeline = ({ breaches }) => {
  // Sort breaches by date (newest first)
  const sortedBreaches = [...breaches].sort((a, b) => 
    new Date(b.BreachDate) - new Date(a.BreachDate)
  );

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">Breach Timeline</h2>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-pink-300" />

        {/* Timeline items */}
        <div className="space-y-6">
          {sortedBreaches.map((breach, idx) => (
            <div key={idx} className="relative pl-12">
              {/* Timeline dot */}
              <div className={`absolute left-0 w-8 h-8 rounded-full ${getSeverityColor(breach.severity)} flex items-center justify-center shadow-lg`}>
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>

              {/* Content card */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{breach.Title}</h3>
                  <span className="text-xs text-gray-500">{breach.BreachDate}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{breach.Description.substring(0, 150)}...</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TrendingDown className="w-4 h-4" />
                  <span>{breach.PwnCount.toLocaleString()} accounts affected</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedBreaches.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No breaches to display</p>
        </div>
      )}
    </div>
  );
};

export default BreachTimeline;