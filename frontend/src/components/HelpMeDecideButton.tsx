// frontend/src/components/ui/HelpMeDecideButton.tsx

import React from 'react';
import { Sparkles } from 'lucide-react';
import { RoundType } from '../../types/capTable';

interface HelpMeDecideButtonProps {
  onSelect: (values: { amount: number; valuation: number }) => void;
  roundType: RoundType;
  className?: string;
}

export const HelpMeDecideButton: React.FC<HelpMeDecideButtonProps> = ({ 
  onSelect, 
  roundType,
  className = '' 
}) => {
  // Default values for each round type
  const suggestions: Record<RoundType, { amount: number; valuation: number }> = {
    'pre-seed': { amount: 500000, valuation: 2000000 },
    'seed': { amount: 1500000, valuation: 6000000 },
    'series-a': { amount: 10000000, valuation: 40000000 },
    'series-b': { amount: 30000000, valuation: 120000000 },
    'series-c': { amount: 50000000, valuation: 200000000 },
    'series-d': { amount: 100000000, valuation: 500000000 },
    'series-e': { amount: 150000000, valuation: 1000000000 },
    'series-f': { amount: 200000000, valuation: 2000000000 },
    'series-g': { amount: 300000000, valuation: 4000000000 },
    'series-h': { amount: 400000000, valuation: 6000000000 },
    'safe': { amount: 250000, valuation: 0 },
    'other': { amount: 5000000, valuation: 20000000 }
  };

  const handleClick = () => {
    const suggestion = suggestions[roundType] || suggestions.seed;
    onSelect(suggestion);
  };

  const getRoundLabel = (type: RoundType): string => {
    const labels: Record<RoundType, string> = {
      'pre-seed': 'Pre-Seed',
      'seed': 'Seed',
      'series-a': 'Series A',
      'series-b': 'Series B',
      'series-c': 'Series C',
      'series-d': 'Series D',
      'series-e': 'Series E',
      'series-f': 'Series F',
      'series-g': 'Series G',
      'series-h': 'Series H',
      'safe': 'SAFE',
      'other': 'Custom'
    };
    return labels[type] || 'Round';
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${className}`}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Suggest {getRoundLabel(roundType)} Numbers
    </button>
  );
};