import React from 'react';
import { TrendingUp } from 'lucide-react';

const BreachTimeline = ({ breaches }) => {
  const sortedBreaches = [...breaches].sort((a, b) => 
    new Date(b.BreachDate) - new Date(a.BreachDate)
  );
  
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">Breach Timeline</h2>
      </div>
      
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-pink-300" />
        
        <div className="space-y-4">
          {sortedBreaches.map((breach, idx) => (
            <div key={idx} className="relative pl-12">
              <div className="absolute left-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {idx + 1}
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-purple-800">{breach.Title}</h3>
                  <span className="text-xs text-purple-600">{breach.BreachDate}</span>
                </div>
                <p className="text-sm text-gray-600">{breach.PwnCount.toLocaleString()} accounts affected</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreachTimeline;