import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { getRiskColor } from '../../utils/riskColors';

const AppCard = ({ app, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(app.id)} 
      className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-4xl">{app.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{app.name}</h3>
            <p className="text-xs text-gray-500">Last access: {app.lastAccess}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-3">
            <div className="text-sm font-bold text-gray-700">{app.accessCount}</div>
            <div className="text-xs text-gray-500">accesses</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getRiskColor(app.risk)}`}>
            {app.risk.toUpperCase()}
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Category</div>
              <div className="font-bold text-purple-600">{app.category}</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Daily Avg</div>
              <div className="font-bold text-pink-600">{Math.round(app.accessCount / 7)}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Permissions</div>
              <div className="font-bold text-blue-600">{app.permissions.length}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Status</div>
              <div className="font-bold text-green-600">Active</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-gray-600 mb-2">Permissions Used:</div>
            <div className="flex flex-wrap gap-2">
              {app.permissions.map((perm, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{perm}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppMonitor = ({ apps }) => {
  const [selectedApp, setSelectedApp] = useState(null);

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <Smartphone className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800">App Access Monitor</h2>
        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          {apps.length} Apps Tracked
        </span>
      </div>

      <div className="space-y-3">
        {apps.map(app => (
          <AppCard 
            key={app.id} 
            app={app} 
            isSelected={selectedApp === app.id}
            onSelect={(id) => setSelectedApp(selectedApp === id ? null : id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AppMonitor;