import React from 'react';
import { BookOpen, Zap } from 'lucide-react';

const EducationCenter = () => {
  const tutorials = [
    { id: 1, title: 'Understanding Phishing Attacks', duration: '5 min', difficulty: 'Beginner', icon: '🎣' },
    { id: 2, title: 'Creating Strong Passwords', duration: '3 min', difficulty: 'Beginner', icon: '🔐' },
    { id: 3, title: 'Two-Factor Authentication', duration: '4 min', difficulty: 'Intermediate', icon: '📱' },
    { id: 4, title: 'Securing Your WiFi', duration: '6 min', difficulty: 'Intermediate', icon: '📡' }
  ];

  const tips = [
    "Never share your passwords, even with friends",
    "Use different passwords for different accounts",
    "Enable 2FA on all important accounts",
    "Keep your apps and OS updated",
    "Be cautious of suspicious emails and links"
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg border-2 border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">Education Center</h2>
        </div>

        {/* Tutorials */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Interactive Tutorials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map(tutorial => (
              <div key={tutorial.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{tutorial.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{tutorial.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>⏱️ {tutorial.duration}</span>
                      <span>📊 {tutorial.difficulty}</span>
                    </div>
                  </div>
                  <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-600">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Tips Carousel */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-200 mb-6">
          <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Security Tips
          </h3>
          <div className="space-y-2">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                <span className="text-yellow-600 font-bold">{idx + 1}.</span>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200">
          <h3 className="font-bold text-blue-800 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            <details className="bg-white/60 rounded-xl p-4">
              <summary className="font-semibold text-gray-800 cursor-pointer">How often should I check for breaches?</summary>
              <p className="text-sm text-gray-600 mt-2">We recommend checking weekly, or whenever you hear about a major data breach in the news.</p>
            </details>
            <details className="bg-white/60 rounded-xl p-4">
              <summary className="font-semibold text-gray-800 cursor-pointer">Is my data safe with LockSyra?</summary>
              <p className="text-sm text-gray-600 mt-2">Absolutely! All data is processed locally on your device. We never store your passwords or personal information.</p>
            </details>
            <details className="bg-white/60 rounded-xl p-4">
              <summary className="font-semibold text-gray-800 cursor-pointer">What makes a strong password?</summary>
              <p className="text-sm text-gray-600 mt-2">A strong password is at least 12 characters long, includes uppercase and lowercase letters, numbers, and special characters.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationCenter;