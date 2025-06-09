import React from 'react';

interface DilutionHealthIndicatorProps {
  health: {
    color: 'red' | 'yellow' | 'green';
    message: string;
  };
  equityPercentage: number;
}

export const DilutionHealthIndicator: React.FC<DilutionHealthIndicatorProps> = ({ health, equityPercentage }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-3 h-3 rounded-full ${
      health.color === 'green' ? 'bg-green-500' :
      health.color === 'yellow' ? 'bg-yellow-500' :
      'bg-red-500'
    }`} />
    <span className={`text-sm font-medium ${
      health.color === 'green' ? 'text-green-700' :
      health.color === 'yellow' ? 'text-yellow-700' :
      'text-red-700'
    }`}>
      {health.message} ({equityPercentage.toFixed(1)}% equity)
    </span>
  </div>
);
