import React, { useState } from 'react';
import { Flame, Calendar } from 'lucide-react';

const HabitTracker = ({ habits, onHabitComplete, streak }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [habitProgress, setHabitProgress] = useState({});

  const dailyChecklist = [
    { id: 'ai_scan', label: 'Run AI Security Scan', icon: '🤖', points: 10 },
    { id: 'breach_check', label: 'Check for New Breaches', icon: '🔍', points: 15 },
    { id: 'review_perms', label: 'Review App Permissions', icon: '🛡️', points: 10 },
    { id: 'update_password', label: 'Update Weak Password', icon: '🔐', points: 20 }
  ];

  const handleComplete = (habitId) => {
    setHabitProgress({...habitProgress, [habitId]: true});
    onHabitComplete(habitId);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-orange-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Security Habits</h2>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{streak} 🔥</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
        </div>

        {/* Daily Checklist */}
        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Today's Checklist</h3>
          {dailyChecklist.map(habit => (
            <div
              key={habit.id}
              className={`rounded-2xl p-4 border-2 transition-all ${
                habitProgress[habit.id]
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{habit.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{habit.label}</h4>
                    <p className="text-xs text-gray-500">+{habit.points} points</p>
                  </div>
                </div>
                <button
                  onClick={() => handleComplete(habit.id)}
                  disabled={habitProgress[habit.id]}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    habitProgress[habit.id]
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                  }`}
                >
                  {habitProgress[habit.id] ? '✓ Done' : 'Complete'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Streak Calendar */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4 border-2 border-orange-200">
          <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            This Week's Activity
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, idx) => (
              <div key={day} className="text-center">
                <div className="text-xs font-medium text-gray-600 mb-2">{day}</div>
                <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center ${
                  idx < streak ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {idx < streak ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;