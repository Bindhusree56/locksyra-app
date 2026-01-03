
// Risk color utility functions
export const getRiskColor = (risk) => {
  switch(risk) {
    case 'low': return 'bg-green-100 text-green-700 border-green-300';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'high': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

export const getNotificationColor = (risk) => {
  if (risk === 'high') return 'bg-red-50 border-2 border-red-200';
  if (risk === 'medium') return 'bg-yellow-50 border-2 border-yellow-200';
  return 'bg-green-50 border-2 border-green-200';
};

export const getAlertIconColor = (risk) => {
  if (risk === 'high') return 'text-red-600';
  if (risk === 'medium') return 'text-yellow-600';
  return 'text-green-600';
};