import React, { useState, useMemo } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { Lightbulb, ChevronLeft, ChevronRight, AlertTriangle, Info, ArrowUpRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPercent, formatCurrency } from '../utils/helpers';

type InsightType = 'info' | 'warning' | 'success' | 'tip';

interface Insight {
  id: string;
  type: InsightType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  learnMore?: string;
}

const LearnSidebar: React.FC = () => {
  const { ownershipData, founders, safe, fundingRounds } = useCapTable();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'glossary'>('insights');
  const [pinnedInsights, setPinnedInsights] = useState<Set<string>>(new Set());
  
  const togglePinInsight = (id: string) => {
    setPinnedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const insights = useMemo<Insight[]>(() => {
    if (ownershipData.length === 0) {
      return [{
        id: 'no-data',
        type: 'info',
        message: 'Add founders and investment to see insights about your cap table.',
        action: {
          label: 'Add Founder',
          onClick: () => { /* Will be connected to add founder action */ }
        }
      }];
    }

    const newInsights: Insight[] = [];
    const founderTotal = ownershipData
      .filter(owner => !owner.name.includes('Investor'))
      .reduce((acc, owner) => acc + (owner.ownership || 0), 0);
    
    // Founder ownership insight
    if (founders.length > 0) {
      newInsights.push({
        id: 'founder-ownership',
        type: 'info',
        message: `Founders collectively own ${formatPercent(founderTotal)} of the company.`,
        learnMore: '/learn/founder-equity'
      });
    }

    // Funding round insights
    if (fundingRounds.length > 0) {
      // Latest round is used for future expansion
      const totalRaised = fundingRounds.reduce((sum, round) => sum + round.amount, 0);
      
      newInsights.push({
        id: 'funding-summary',
        type: 'info',
        message: `You've raised ${formatCurrency(totalRaised)} across ${fundingRounds.length} funding round${fundingRounds.length > 1 ? 's' : ''}.`,
        action: {
          label: 'Add Round',
          onClick: () => { /* Will be connected to add funding round action */ }
        }
      });
      
      // Check for down rounds
      if (fundingRounds.length > 1) {
        for (let i = 1; i < fundingRounds.length; i++) {
          const current = fundingRounds[i];
          const previous = fundingRounds[i - 1];
          const currentPPS = current.valuation / (current.shares || 1);
          const previousPPS = previous.valuation / (previous.shares || 1);
          
          if (currentPPS < previousPPS * 0.9) { // More than 10% drop in price
            newInsights.push({
              id: `downround-${i}`,
              type: 'warning',
              message: `Your ${current.name} round has a lower price per share than the previous round.`,
              learnMore: '/learn/down-rounds'
            });
            break;
          }
        }
      }
    }

    // SAFE investor insight
    if (safe && ownershipData.some(owner => owner.name === safe.name)) {
      const safeOwnership = ownershipData.find(owner => owner.name === safe.name)?.ownership || 0;
      
      newInsights.push({
        id: 'safe-ownership',
        type: 'info',
        message: `SAFE investors will receive approximately ${formatPercent(safeOwnership)} ownership.`,
        learnMore: '/learn/safe-notes'
      });

      // Dilution insight
      if (founders.length > 0 && safeOwnership > 0) {
        newInsights.push({
          id: 'dilution-notice',
          type: 'tip',
          message: `Founders have been diluted by the SAFE investment. This is normal when raising capital.`,
          learnMore: '/learn/dilution'
        });
      }
    }

    // Ownership balance insight
    if (founders.length > 1) {
      const founderOwnership = founders
        .map(founder => ({
          name: founder.name,
          ownership: ownershipData.find(owner => owner.name === founder.name)?.ownership || 0
        }))
        .filter(f => f.ownership > 0);
      
      if (founderOwnership.length >= 2) {
        const sorted = [...founderOwnership].sort((a, b) => b.ownership - a.ownership);
        const diff = sorted[0].ownership - sorted[sorted.length - 1].ownership;
        
        if (diff > 20) {
          newInsights.push({
            id: 'ownership-imbalance',
            type: 'warning',
            message: `Significant ownership difference: ${sorted[0].name} has ${formatPercent(diff)} more than ${sorted[sorted.length - 1].name}.`,
            action: {
              label: 'Adjust Equity',
              onClick: () => { /* Will be connected to adjust equity action */ }
            },
            learnMore: '/learn/equity-splits'
          });
        } else if (diff < 5) {
          newInsights.push({
            id: 'ownership-balance',
            type: 'success',
            message: 'Founders have a balanced ownership structure (less than 5% difference).',
            learnMore: '/learn/equity-splits'
          });
        }
      }
    }
    
    // General guidance
    if (founders.length > 0 && !safe && fundingRounds.length === 0) {
      newInsights.push({
        id: 'add-funding-suggestion',
        type: 'tip',
        message: 'Add a funding round to see how it affects ownership and dilution.',
        action: {
          label: 'Add Round',
          onClick: () => { /* Will be connected to add funding round action */ }
        }
      });
    }

    // Add a welcome message if no other insights
    if (newInsights.length === 0) {
      newInsights.push({
        id: 'welcome',
        type: 'info',
        message: 'Keep building your cap table to see more personalized insights.'
      });
    }

    return newInsights;
  }, [ownershipData, founders, safe, fundingRounds]);

  const getIconForType = (type: InsightType) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 flex-shrink-0" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 flex-shrink-0" />;
    }
  };

  const getTypeStyles = (type: InsightType) => {
    const baseStyles = 'p-1 rounded-full';
    switch (type) {
      case 'warning':
        return `${baseStyles} bg-amber-100 text-amber-600`;
      case 'success':
        return `${baseStyles} bg-green-100 text-green-600`;
      case 'tip':
        return `${baseStyles} bg-blue-100 text-blue-600`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-600`;
    }
  };

  // Filter insights to show pinned ones first
  const sortedInsights = [...insights].sort((a, b) => {
    const aPinned = pinnedInsights.has(a.id);
    const bPinned = pinnedInsights.has(b.id);
    return aPinned === bPinned ? 0 : aPinned ? -1 : 1;
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-1/4 w-80 bg-white border-l border-gray-200 h-auto shadow-xl rounded-l-lg overflow-hidden z-10 flex flex-col"
            style={{ maxHeight: '70vh' }}
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Lightbulb className="mr-2" />
                  <h3 className="font-semibold">Cap Table Insights</h3>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setActiveTab('insights')}
                    className={`px-2 py-1 text-xs rounded ${activeTab === 'insights' ? 'bg-blue-500' : 'hover:bg-blue-400'}`}
                  >
                    Insights
                  </button>
                  <button 
                    onClick={() => setActiveTab('glossary')}
                    className={`px-2 py-1 text-xs rounded ${activeTab === 'glossary' ? 'bg-blue-500' : 'hover:bg-blue-400'}`}
                  >
                    Glossary
                  </button>
                </div>
              </div>
            </div>
            
            {activeTab === 'insights' ? (
              <div className="flex-1 overflow-y-auto">
                {sortedInsights.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {sortedInsights.map((insight, index) => (
                      <motion.li
                        key={insight.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 ${pinnedInsights.has(insight.id) ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-start">
                          <div className={getTypeStyles(insight.type)}>
                            {getIconForType(insight.type)}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm text-gray-800">{insight.message}</p>
                            <div className="mt-2 flex items-center space-x-3">
                              {insight.action && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    insight.action?.onClick();
                                  }}
                                  className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded"
                                >
                                  {insight.action.label}
                                </button>
                              )}
                              {insight.learnMore && (
                                <a
                                  href={insight.learnMore}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Learn more <ArrowUpRight className="ml-1 w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePinInsight(insight.id);
                            }}
                            className={`ml-2 p-1 rounded-full ${pinnedInsights.has(insight.id) ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
                            aria-label={pinnedInsights.has(insight.id) ? 'Unpin insight' : 'Pin insight'}
                          >
                            {pinnedInsights.has(insight.id) ? '📌' : '📍'}
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No insights available. Add more data to see personalized insights.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 overflow-y-auto">
                <h4 className="font-medium text-gray-900 mb-3">Common Terms</h4>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="bg-blue-100 text-blue-600 p-1 rounded-full mr-2">
                        <Info className="w-3 h-3" />
                      </span>
                      SAFE Note
                    </dt>
                    <dd className="mt-1 text-sm text-gray-600 ml-6">
                      A Simple Agreement for Future Equity that converts to shares in a future funding round.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="bg-blue-100 text-blue-600 p-1 rounded-full mr-2">
                        <Info className="w-3 h-3" />
                      </span>
                      Dilution
                    </dt>
                    <dd className="mt-1 text-sm text-gray-600 ml-6">
                      The reduction in ownership percentage when new shares are issued.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="bg-blue-100 text-blue-600 p-1 rounded-full mr-2">
                        <Info className="w-3 h-3" />
                      </span>
                      Valuation Cap
                    </dt>
                    <dd className="mt-1 text-sm text-gray-600 ml-6">
                      The maximum valuation at which a SAFE converts into equity.
                    </dd>
                  </div>
                </dl>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <a 
                href="/learn" 
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
              >
                Visit Learning Center <ArrowUpRight className="ml-1 w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/4 mt-16 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-l-lg shadow-md z-20 transition-colors ${isOpen ? 'opacity-0' : 'opacity-100'}`}
        aria-label={isOpen ? 'Collapse insights' : 'Expand insights'}
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </>
  );
};

export default LearnSidebar;