import React from 'react';
import ReactMarkdown from 'react-markdown';

interface FormattedExplanationProps {
  content: string;
  className?: string;
}

export const FormattedExplanation: React.FC<FormattedExplanationProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`prose max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />,
          h2: ({node, ...props}) => <h3 className="text-lg font-semibold mt-3 mb-1.5" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
