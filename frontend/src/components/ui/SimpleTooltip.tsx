// frontend/src/components/ui/SimpleTooltip.tsx

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface SimpleTooltipProps {
  text: string;
  className?: string;
  iconSize?: number;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ 
  text, 
  className = '', 
  iconSize = 16 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className={`relative inline-block ml-1 ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <HelpCircle 
        size={iconSize} 
        className="text-blue-500 hover:text-blue-700 cursor-help transition-colors" 
      />
      
      {isVisible && (
        <div className="absolute z-[10000] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-lg max-w-xs whitespace-normal pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
        </div>
      )}
    </span>
  );
};