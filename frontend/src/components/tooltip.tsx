import React, { useState, useRef, useEffect } from 'react';
import './tooltip.css';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  className = '',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      if (tooltipRef.current) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setCoords({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY
        });
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipPosition = () => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return {};

    let style: React.CSSProperties = { position: 'absolute' };

    switch (position) {
      case 'top':
        style = { 
          ...style,
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
        break;
      case 'bottom':
        style = {
          ...style,
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)'
        };
        break;
      case 'left':
        style = {
          ...style,
          right: 'calc(100% + 10px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
        break;
      case 'right':
        style = {
          ...style,
          left: 'calc(100% + 10px)',
          top: '50%',
          transform: 'translateY(-50%)'
        };
        break;
    }

    return style;
  };

  return (
    <div 
      className={`tooltip-container ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setCoords({
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY
        });
      }}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${position}`}
          style={{
            ...getTooltipPosition(),
            top: coords.y,
            left: coords.x,
            zIndex: 10000,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;