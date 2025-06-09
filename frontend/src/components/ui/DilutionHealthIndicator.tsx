// frontend/src/components/ui/DilutionHealthIndicator.tsx

import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface DilutionHealthIndicatorProps {
  equityPercentage: number;
}

export const DilutionHealthIndicator: React.FC<DilutionHealthIndicatorProps> = ({ 
  equityPercentage 
}) => {
  const getHealthStatus = (percentage: number) => {
    if (percentage <= 20) {
      return { 
        status: 'healthy', 
        color: 'green', 
        icon: CheckCircle, 
        message: 'Conservative dilution',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-400',
        textColor: 'text-green-700'
      };
    }
    if (percentage <= 30) {
      return { 
        status: 'moderate', 
        color: 'yellow', 
        icon: AlertCircle, 
        message: 'Moderate dilution',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-700'
      };
    }
    return { 
      status: 'high', 
      color: 'red', 
      icon: AlertTriangle, 
      message: 'High dilution - consider reducing',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-700'
    };
  };

  const health = getHealthStatus(equityPercentage);
  const Icon = health.icon;

  return (
    <div className={`mt-3 p-3 rounded-lg border-l-4 ${health.borderColor} ${health.bgColor}`}>
      <div className="flex items-center">
        <Icon size={16} className={`mr-2 ${health.textColor}`} />
        <span className={`text-sm font-medium ${health.textColor}`}>
          {health.message} ({equityPercentage.toFixed(1)}% equity)
        </span>
      </div>
    </div>
  );
};