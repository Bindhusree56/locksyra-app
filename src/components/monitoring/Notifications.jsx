import React from 'react';
import { Brain, AlertTriangle } from 'lucide-react';
import { getNotificationColor, getAlertIconColor } from '../../utils/riskColors';

const Notifications = ({ notifications }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">Real-Time Alerts</h2>
      </div>
      <div className="space-y-2">
        {notifications.slice(0, 3).map(notif => (
          <div 
            key={notif.id} 
            className={`p-4 rounded-2xl flex items-start gap-3 ${getNotificationColor(notif.risk)}`}
          >
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getAlertIconColor(notif.risk)}`} />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">{notif.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;