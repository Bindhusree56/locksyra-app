import React from 'react';
import { Trophy, Target, Users } from 'lucide-react';

const GamificationHub = ({ userLevel, userPoints, challenges }) => {
  const leaderboard = [
    { rank: 1, name: 'Alex Chen', points: 1250, level: 12 },
    { rank: 2, name: 'Sarah Johnson', points: 1180, level: 11 },
    { rank: 3, name: 'You', points: userPoints, level: userLevel, isUser: true },
    { rank: 4, name: 'Mike Davis', points: 980, level: 10 },
    { rank: 5, name: 'Emily White', points: 920, level: 9 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-yellow-200">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Gamification Hub</h2>
        </div>

        {/* User Level Progress */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Level {userLevel}</h3>
              <p className="text-gray-600">Expert Guardian</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">{userPoints}</div>
              <div className="text-xs text-gray-600">Total Points</div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-full h-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-gray-600 mt-2">350 points until Level {userLevel + 1}</p>
        </div>

        {/* Challenges */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 mb-6">
          <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Challenges
          </h3>
          <div className="space-y-3">
            {challenges.map((challenge, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{challenge.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{challenge.title}</h4>
                      <p className="text-xs text-gray-500">{challenge.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">+{challenge.points}pts</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full" 
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{challenge.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((user) => (
              <div 
                key={user.rank}
                className={`rounded-xl p-4 border-2 flex items-center justify-between ${
                  user.isUser 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    user.rank === 1 ? 'bg-yellow-400' :
                    user.rank === 2 ? 'bg-gray-400' :
                    user.rank === 3 ? 'bg-orange-400' :
                    'bg-gray-300'
                  }`}>
                    {user.rank}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">Level {user.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{user.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationHub;