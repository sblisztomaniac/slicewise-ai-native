import React from 'react';

interface DilutionHealthIndicatorProps {
  equityPercentage: number;
}

const DilutionHealthIndicator: React.FC<DilutionHealthIndicatorProps> = ({ equityPercentage }) => {
  // Define health levels based on equity percentage
  const getHealthLevel = (percentage: number) => {
    if (percentage < 10) return 'high';
    if (percentage < 20) return 'medium';
    return 'low';
  };

  const healthLevel = getHealthLevel(equityPercentage);
  
  // Define colors and labels based on health level
  const healthConfig = {
    high: {
      color: 'bg-red-500',
      label: 'High Dilution',
      description: 'Consider raising more money or increasing valuation'
    },
    medium: {
      color: 'bg-yellow-500',
      label: 'Moderate Dilution',
      description: 'Standard for early-stage rounds'
    },
    low: {
      color: 'bg-green-500',
      label: 'Low Dilution',
      description: 'Founder-friendly terms'
    }
  };

  const { color, label, description } = healthConfig[healthLevel];
  
  // Calculate width percentage (capped at 100%)
  const widthPercentage = Math.min(100, (equityPercentage / 30) * 100);

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{equityPercentage.toFixed(1)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
      
      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default DilutionHealthIndicator;
