import React from 'react';
import Tooltip from '../tooltip';

interface SimpleTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
  delay?: number;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ 
  text, 
  position = 'top',
  children,
  className = '',
  delay = 200
}) => {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {children || <span className="ml-1 text-gray-400 cursor-help hover:text-gray-600">ⓘ</span>}
      <Tooltip 
        content={text} 
        position={position}
        className={className}
        delay={delay}
      >
        <div className="tooltip-content">
          {text}
        </div>
      </Tooltip>
    </div>
  );
};

export default SimpleTooltip;
