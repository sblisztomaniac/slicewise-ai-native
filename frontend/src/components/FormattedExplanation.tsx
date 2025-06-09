// frontend/src/components/ui/FormattedExplanation.tsx

import React from 'react';

interface FormattedExplanationProps {
  content: string;
  className?: string;
}

export const FormattedExplanation: React.FC<FormattedExplanationProps> = ({ 
  content, 
  className = '' 
}) => {
  // Split content into paragraphs and format
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Handle headers (lines starting with ##)
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
      }
      
      // Handle subheaders (lines starting with ###)
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-md font-medium text-gray-800 mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      
      // Handle bullet points (lines starting with - )
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-1 text-gray-700">
            {line.replace('- ', '')}
          </li>
        );
      }
      
      // Handle bold text (**text**)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="mb-2 text-gray-700">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="mb-2 text-gray-700 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {formatContent(content)}
    </div>
  );
};