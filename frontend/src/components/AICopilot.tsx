import React, { useState } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const AICopilot: React.FC = () => {
  const { ownershipData, founders, safe } = useCapTable();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState('mentor');

  const toneConfigs = {
    'simple': {
      label: '12-Year-Old',
      description: 'Super simple, like explaining to a kid',
      prompt: 'Explain startup equity like talking to a 12-year-old. Use simple words and fun examples.'
    },
    'mentor': {
      label: 'Mentor Mode',
      description: 'Friendly guidance with clear explanations',
      prompt: 'You are a caring startup mentor. Explain equity clearly in everyday language.'
    },
    'expert': {
      label: 'Expert',
      description: 'Technical and precise for experienced founders',
      prompt: 'You are an equity expert. Use proper financial terminology and detailed analysis.'
    }
  };

  const handleAskQuestion = async (customQuestion?: string) => {
    const questionToAsk = customQuestion || question;
    if (!questionToAsk) return;

    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        setAnswer("API key is missing. Please add VITE_OPENROUTER_API_KEY to your .env file.");
        setIsLoading(false);
        return;
      }

      const capTableData = JSON.stringify({ founders, safe, ownershipData }).slice(0, 1000);
      const selectedPrompt = toneConfigs[selectedTone].prompt;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/mixtral-8x7b-instruct",
          messages: [{
            role: "user",
            content: `${selectedPrompt}\n\nCap Table: ${capTableData}\n\nQuestion: ${questionToAsk}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'No response received';
      
      setAnswer(reply);
      if (!customQuestion) setQuestion('');

    } catch (error) {
      console.error('API Error:', error);
      setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What's my current ownership percentage?",
    "How much equity will I have after my SAFE converts?",
    "What happens to my ownership if we raise more money?"
  ];

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">AI Copilot</h2>
      </div>

      <div className="space-y-4">
        {/* Tone Selection */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Answer Tone</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(toneConfigs).map(([key, config]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  value={key}
                  checked={selectedTone === key}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <span className="font-medium text-gray-800">{config.label}</span>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Questions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Questions</h3>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => handleAskQuestion(q)}
                disabled={isLoading}
                className="text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Question */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Ask Your Own Question</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask me anything about your cap table..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleAskQuestion()}
              disabled={isLoading || !question.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Ask
            </button>
          </div>
        </div>

        {/* Answer */}
        {answer && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Answer</h3>
            <div className="text-gray-700 whitespace-pre-wrap">{answer}</div>
          </div>
        )}

        {isLoading && !answer && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AICopilot;