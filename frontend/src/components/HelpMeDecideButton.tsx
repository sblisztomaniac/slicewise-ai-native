import { FC } from 'react';
import { Sparkles } from 'lucide-react';

interface HelpMeDecideButtonProps {
  onSelect: (values: { amount: number; valuation: number }) => void;
  roundType: string;
  className?: string;
}

const HelpMeDecideButton: FC<HelpMeDecideButtonProps> = ({ 
  onSelect, 
  roundType,
  className = '' 
}) => {
  // Default values for each round type
  const suggestions: Record<string, { amount: number; valuation: number }> = {
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
    'other': { amount: 5000000, valuation: 20000000 }
  };

  const handleClick = () => {
    const suggestion = suggestions[roundType] || suggestions.seed;
    onSelect(suggestion);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      <Sparkles className="w-3 h-3 mr-1" />
      Help me decide
    </button>
  );
};

export default HelpMeDecideButton;
