import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, HelpCircle, DollarSign, TrendingUp, Percent, Calendar, BarChart2, Users, Info, HelpCircle as HelpIcon } from 'lucide-react';
import { useCapTable } from '../context/CapTableContext';
import { formatCurrency, formatNumber, formatDate } from '../utils/helpers';
import { FundingRound } from '../types';

// Tooltip component for ELI5 explanations
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-flex items-center">
      {children}
      <button
        onClick={handleClick}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="text-gray-400 hover:text-blue-500 focus:outline-none ml-1 -mr-1 p-1"
        aria-label="More information"
      >
        <HelpIcon size={14} className="flex-shrink-0" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-[100] w-64 p-3 text-sm text-white bg-blue-600 rounded-md shadow-lg"
            style={{
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
              transformOrigin: 'bottom center',
            }}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
          >
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-t-blue-600 border-l-transparent border-r-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface RoundDetailsModalProps {
  round: FundingRound;
  onClose: () => void;
}

const RoundDetailsModal: React.FC<RoundDetailsModalProps> = ({ round, onClose }) => {
  const [explanationStyle, setExplanationStyle] = useState<'12yo' | 'mentor' | 'expert'>('mentor');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { explainRoundImpact } = useCapTable();

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      try {
        const explanation = await explainRoundImpact(round, explanationStyle);
        setExplanation(explanation);
      } catch (error) {
        console.error('Error fetching explanation:', error);
        setExplanation('Could not load explanation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [round, explanationStyle, explainRoundImpact]);

  const handleStyleToggle = async (style: '12yo' | 'mentor' | 'expert') => {
    if (isLoading) return;
    setExplanationStyle(style);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{round.name}</h3>
              <p className="text-gray-600 capitalize">{round.type} Round</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount Raised</p>
                  <p className="text-lg font-semibold">{formatCurrency(round.amount)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Valuation</p>
                  <p className="text-lg font-semibold">{formatCurrency(round.valuation)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Percent className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Ownership</p>
                  <p className="text-lg font-semibold">{round.ownershipPercentage.toFixed(2)}%</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatNumber(round.shares || 0)} shares issued
                    </span>
                    <Tooltip content="Total number of new shares created in this funding round. This affects the ownership percentage of existing shareholders.">
                      <span className="sr-only">What are shares?</span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-lg">{formatDate(round.date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <BarChart2 className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Price per Share</p>
                  <p className="text-lg">
                    {round.shares && round.shares > 0 
                      ? formatCurrency(round.valuation / round.shares)
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Investors</p>
                  <p className="text-lg">
                    Not specified
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold">Impact Analysis</h4>
              <div className="inline-flex p-0.5 space-x-0.5 bg-blue-100 rounded-md">
                {['12yo', 'mentor', 'expert'].map((style, index) => (
                  <button
                    key={`${style}-${index}`}
                    type="button"
                    onClick={() => handleStyleToggle(style as '12yo' | 'mentor' | 'expert')}
                    disabled={isLoading}
                    className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                      explanationStyle === style
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-blue-600 hover:bg-blue-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-pressed={explanationStyle === style}
                    aria-busy={isLoading && explanationStyle === style}
                  >
                    {style}
                    {isLoading && explanationStyle === style && (
                      <span className="sr-only">Loading</span>
                    )}
                    {isLoading && explanationStyle === style && '...'}
                  </button>
                ))}
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading analysis...</div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="whitespace-pre-line text-sm text-gray-800">
                    {explanation || 'No analysis available.'}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Impact on Cap Table:</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>Dilutes existing shareholders by approximately {round.ownershipPercentage !== undefined ? (100 - round.ownershipPercentage).toFixed(2) : '0.00'}%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>Increases company valuation to {formatCurrency(round.valuation)}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>
                      Issues {round.shares ? formatNumber(round.shares) : '0'} new shares
                      <Tooltip content={`The company created ${round.shares ? formatNumber(round.shares) : '0'} new shares and sold them to investors in this round.`}>
                        <span className="sr-only">New shares issued</span>
                      </Tooltip>
                    </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FundingRoundsList: React.FC = () => {
  const { fundingRounds, removeFundingRound } = useCapTable();
  const [showHelp, setShowHelp] = useState(false);
  const [selectedRound, setSelectedRound] = useState<FundingRound | null>(null);

  if (fundingRounds.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            Funding Rounds
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowHelp(!showHelp);
              }}
              className="ml-2 text-gray-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-full p-1"
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>
          </h3>
        </div>

        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mb-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100">
                <p className="mb-2">
                  <strong>Funding Rounds</strong> represent different stages of investment in your company.
                  Each round affects ownership percentages and company valuation.
                </p>
                <p className="flex items-start">
                  <Info className="flex-shrink-0 mt-0.5 mr-1" size={14} />
                  <span>Click on a round to see detailed analysis, or use the trash icon to remove a round.</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center">
                  <span>
                    Round
                    <Tooltip content="The name and type of the funding round (e.g., Seed, Series A). Each round represents a stage where the company raises money from investors.">
                      <span className="sr-only">What is a funding round?</span>
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center justify-end">
                  <span>
                    Amount
                    <Tooltip content="The total amount of money raised in this funding round. This is how much investors paid to buy shares in your company.">
                      <span className="sr-only">What is the amount?</span>
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center justify-end">
                  <span>
                    Valuation
                    <Tooltip content="The company's total worth at the time of this funding round. If investors pay $1M for 10% of your company, the valuation is $10M.">
                      <span className="sr-only">What is valuation?</span>
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <div className="flex items-center justify-end">
                  <span>
                    Ownership
                    <Tooltip content="The percentage of the company owned by investors after this funding round. This gets diluted in future rounds.">
                      <span className="sr-only">What is ownership percentage?</span>
                    </Tooltip>
                  </span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Date
              </th>
              <th scope="col" className="relative px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {fundingRounds.map((round, index) => (
                <motion.tr
                  key={round.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.02,
                    height: { duration: 0.2 }
                  }}
                  className="group hover:bg-gray-50 transition-colors duration-150"
                >
                  <td 
                    className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer"
                    onClick={() => setSelectedRound(round)}
                  >
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {round.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{round.type}</div>
                  </td>
                  <td 
                    className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 cursor-pointer"
                    onClick={() => setSelectedRound(round)}
                  >
                    <span className="font-mono">
                      {formatCurrency(round.amount)}
                      <Tooltip content={`This is the total amount of money (${formatCurrency(round.amount)}) that investors paid to buy shares in this funding round.`}>
                        <span className="sr-only">Amount raised in this round</span>
                      </Tooltip>
                    </span>
                  </td>
                  <td 
                    className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 cursor-pointer"
                    onClick={() => setSelectedRound(round)}
                  >
                    <span className="font-mono">
                      {formatCurrency(round.valuation)}
                      <Tooltip content={`This means the company was valued at ${formatCurrency(round.valuation)} during this funding round.`}>
                        <span className="sr-only">Company valuation</span>
                      </Tooltip>
                    </span>
                  </td>
                  <td 
                    className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 cursor-pointer"
                    onClick={() => setSelectedRound(round)}
                  >
                    <span className="font-mono">
                      {round.ownershipPercentage !== undefined ? round.ownershipPercentage.toFixed(2) : '0.00'}%
                      <Tooltip content={`Investors in this round own ${round.ownershipPercentage !== undefined ? round.ownershipPercentage.toFixed(2) : '0.00'}% of the company after their investment.`}>
                        <span className="sr-only">Ownership percentage</span>
                      </Tooltip>
                    </span>
                  </td>
                  <td 
                    className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 cursor-pointer"
                    onClick={() => setSelectedRound(round)}
                  >
                    {formatDate(round.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFundingRound(round.id);
                      }}
                      className="text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 rounded-full p-1 transition-colors"
                      aria-label={`Remove ${round.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {fundingRounds.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 text-right text-xs text-gray-500 border-t border-gray-100">
          Showing {fundingRounds.length} funding round{fundingRounds.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Round Details Modal */}
      <AnimatePresence>
        {selectedRound && (
          <RoundDetailsModal 
            round={selectedRound} 
            onClose={() => setSelectedRound(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FundingRoundsList;
