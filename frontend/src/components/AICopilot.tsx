import React, { useState } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const AICopilot: React.FC = () => {
  const { ownershipData, founders, safe } = useCapTable();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = (customQuestion?: string) => {
    // In a real app, this would send the question and cap table data to an API
    // For this MVP, we'll simulate AI responses
    const questionToAsk = customQuestion || question;
    if (!questionToAsk) return;

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const simulatedResponse = generateSimulatedResponse(questionToAsk);
      setAnswer(simulatedResponse);
      setIsLoading(false);
      
      if (!customQuestion) {
        setQuestion('');
      }
    }, 1000);
  };

  const generateSimulatedResponse = (question: string) => {
    // This is a simplified simulation - in a real app, this would be an API call to an LLM
    
    const totalShares = ownershipData.reduce((acc, owner) => acc + owner.shares, 0);
    const founderNames = founders.map(f => f.name).join(' and ');
    const founderPercentages = founders.map(f => {
      const ownerData = ownershipData.find(o => o.name === f.name);
      return ownerData ? ownerData.percentage.toFixed(2) + '%' : '0%';
    }).join(' and ');
    
    const safePercentage = safe ? 
      (ownershipData.find(o => o.name === safe.name)?.percentage.toFixed(2) || '0') + '%' 
      : '0%';
    
    if (question.toLowerCase().includes('what happens if i raise')) {
      return `## Funding Round Simulation

If you raise additional capital, here's what would happen:

1. **Dilution Effect**: All current shareholders (${founderNames}) would be diluted proportionally.

2. **New Ownership Structure**:
   - Founders would go from owning ${founderPercentages} to a lower percentage
   - The SAFE investor would convert at the valuation cap of $${safe?.valuationCap.toLocaleString()}
   - The new investor would receive newly issued shares

Remember: Dilution isn't necessarily bad if the investment helps grow your company's value significantly!`;
    }
    
    if (question.toLowerCase().includes('what % does the safe investor get')) {
      return `## SAFE Investor Ownership

The SAFE investor (${safe?.name}) currently gets **${safePercentage}** of the company.

This happens because:
1. They invested $${safe?.amount.toLocaleString()} at a $${safe?.valuationCap.toLocaleString()} valuation cap
2. This gives them a certain price per share
3. When converted, this results in ${safePercentage} ownership

The key thing to remember is that SAFE notes convert to equity at a later date, usually during your next priced round, and the actual percentage depends on that future valuation.`;
    }
    
    return `## Cap Table Analysis

Based on your current cap table:

1. **Ownership Structure**:
   - ${founders.map(f => {
       const data = ownershipData.find(o => o.name === f.name);
       return `${f.name}: ${data ? data.percentage.toFixed(2) + '%' : '0%'} (${f.shares.toLocaleString()} shares)`;
     }).join('\n   - ')}
   ${safe ? `   - ${safe.name}: ${safePercentage} (post-conversion)` : ''}

2. **Key Insights**:
   - Total shares: ${totalShares.toLocaleString()}
   - The founders collectively own ${founders.reduce((acc, f) => {
       const data = ownershipData.find(o => o.name === f.name);
       return acc + (data ? data.percentage : 0);
     }, 0).toFixed(2)}% of the company
   ${safe ? `   - SAFE investment of $${safe.amount.toLocaleString()} at $${safe.valuationCap.toLocaleString()} valuation cap` : ''}

If you have a more specific question, feel free to ask!`;
  };

  const predefinedQuestions = [
    "What happens if I raise $1M at $5M?",
    "What % does the SAFE investor get?"
  ];

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 mb-8"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <MessageSquare className="mr-2 text-teal-600" />
        AI Copilot
      </h2>
      
      <div className="mb-4">
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {predefinedQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => handleAskQuestion(q)}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap hover:bg-blue-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Ask about your cap table..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
            className="flex-1 border-gray-200 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={!question || isLoading}
            className={`p-3 rounded-lg flex items-center justify-center transition-colors ${
              !question || isLoading
                ? 'bg-gray-200 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      )}
      
      {answer && !isLoading && (
        <motion.div 
          className="p-4 bg-blue-50 rounded-lg border border-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="prose" dangerouslySetInnerHTML={{ __html: formatMarkdown(answer) }}></div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Simple markdown formatter for headers and lists
const formatMarkdown = (text: string) => {
  return text
    .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-blue-800 mb-2">$1</h2>')
    .replace(/\n([0-9]+)\. (.*?)$/gm, '<div class="flex space-x-2 mb-1"><span class="font-bold">$1.</span><span>$2</span></div>')
    .replace(/\n- (.*?)$/gm, '<div class="flex space-x-2 mb-1"><span>•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<p class="my-2"></p>');
};

export default AICopilot;