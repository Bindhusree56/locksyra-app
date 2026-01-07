// SecurityProfile.jsx
import React from 'react';
import { Star, TrendingUp, Trophy } from 'lucide-react';

const SecurityProfile = ({ user }) => {
  const scoreHistory = [45, 52, 58, 65, 70, 72, 78, 85];
  const achievements = [
    { date: '2025-01-07', title: 'First Security Scan', icon: '🎯' },
    { date: '2025-01-06', title: '5-Day Streak', icon: '🔥' },
    { date: '2025-01-05', title: 'All Apps Secured', icon: '🔐' },
    { date: '2025-01-04', title: 'Password Master', icon: '🛡️' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-blue-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-4xl">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-purple-600">Level {user.level} - Security Guardian</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{user.score}</div>
            <div className="text-xs text-gray-600 mt-1">Security Score</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{user.streak}</div>
            <div className="text-xs text-gray-600 mt-1">Day Streak</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{user.badges}</div>
            <div className="text-xs text-gray-600 mt-1">Badges</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{user.scansCompleted}</div>
            <div className="text-xs text-gray-600 mt-1">Scans Done</div>
          </div>
        </div>

        {/* Score History Graph */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border-2 border-purple-200 mb-6">
          <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Security Score History
          </h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {scoreHistory.map((score, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-lg" style={{ height: `${score}%` }} />
                <div className="text-xs text-gray-600 mt-2">{idx + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Timeline */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Achievements
          </h3>
          <div className="space-y-2">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/60 rounded-xl p-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{achievement.title}</div>
                  <div className="text-xs text-gray-500">{achievement.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityProfile;