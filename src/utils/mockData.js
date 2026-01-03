// Mock data for initial app state
export const initialApps = [
  { 
    id: 1, 
    name: 'Instagram', 
    icon: '📷', 
    lastAccess: '2 min ago', 
    accessCount: 47, 
    risk: 'low', 
    category: 'social', 
    permissions: ['camera', 'storage'] 
  },
  { 
    id: 2, 
    name: 'Banking App', 
    icon: '🏦', 
    lastAccess: '1 hour ago', 
    accessCount: 3, 
    risk: 'low', 
    category: 'finance', 
    permissions: ['contacts', 'location'] 
  },
  { 
    id: 3, 
    name: 'Gmail', 
    icon: '📧', 
    lastAccess: '5 min ago', 
    accessCount: 23, 
    risk: 'low', 
    category: 'email', 
    permissions: ['contacts', 'storage'] 
  },
  { 
    id: 4, 
    name: 'WhatsApp', 
    icon: '💬', 
    lastAccess: '1 min ago', 
    accessCount: 89, 
    risk: 'low', 
    category: 'social', 
    permissions: ['camera', 'storage', 'contacts'] 
  },
  { 
    id: 5, 
    name: 'Unknown App', 
    icon: '❓', 
    lastAccess: '10 min ago', 
    accessCount: 156, 
    risk: 'high', 
    category: 'unknown', 
    permissions: ['camera', 'contacts', 'location', 'storage', 'microphone', 'sms'] 
  }
];

export const initialBadges = ['🛡️ First Day', '⚡ Quick Learner'];

export const initialNotification = {
  id: Date.now(),
  type: 'success',
  title: '✅ Welcome Back!',
  message: 'All systems secured and monitoring active',
  time: 'Just now',
  risk: 'low'
};