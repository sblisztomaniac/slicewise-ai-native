// frontend/src/components/AddFundingRound.tsx

import { useState, useRef, useEffect, FC, useCallback } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { motion } from 'framer-motion';
import { HelpCircle, X, Info, Save, Clock, Trash2, BarChart2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { FundingRound, RoundType } from '../types';
import HelpMeDecideButton from './HelpMeDecideButton';
import { FormattedExplanation } from './FormattedExplanation';

// Simple Tooltip Component - Working Version
const SimpleTooltip: FC<{ text: string | React.ReactNode; className?: string }> = ({ text, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className={`relative inline-block ml-1 ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <HelpCircle size={16} className="text-blue-500 hover:text-blue-700 cursor-help transition-colors" />
      
      {isVisible && (
        <div className="absolute z-[10000] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-lg max-w-xs whitespace-normal pointer-events-none">
          {typeof text === 'string' ? text : <div>{text}</div>}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
        </div>
      )}
    </span>
  );
};

const LOCAL_STORAGE_KEY = 'savedFundingRounds';

// Round type definitions with typical valuation ranges (in millions)
const ROUND_TYPE_RANGES = {
  'pre-seed': { min: 100000, max: 2000000, description: 'Pre-seed: $100K - $2M' },
  'seed': { min: 500000, max: 5000000, description: 'Seed: $500K - $5M' },
  'series-a': { min: 2000000, max: 20000000, description: 'Series A: $2M - $20M' },
  'series-b': { min: 10000000, max: 50000000, description: 'Series B: $10M - $50M' },
  'series-c': { min: 30000000, max: 150000000, description: 'Series C: $30M - $150M' },
  'series-d': { min: 100000000, max: 300000000, description: 'Series D: $100M - $300M' },
  'other': { min: 0, max: 0, description: 'Custom round' }
} as const;

interface AddFundingRoundProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  type: RoundType;
  amount: number;
  valuation: number;
  date: string;
}

interface CalculatedFields {
  postMoneyValuation: number;
  equityPercentage: number;
  sharePrice: number;
  newSharesIssued: number;
  suggestedRange: { min: number; max: number };
}

interface RoundHistory {
  id: string;
  name: string;
  amount: number;
  valuation: number;
  postMoney: number;
  ownershipPercentage: number;
  timestamp: number;
}

type ExplanationStyle = '12yo' | 'mentor' | 'expert';

// Dilution Health Assessment Component
const DilutionHealthIndicator: FC<{ equityPercentage: number }> = ({ equityPercentage }) => {
  const getHealthStatus = (percentage: number) => {
    if (percentage <= 20) return { status: 'healthy', color: 'green', icon: CheckCircle, message: 'Conservative dilution' };
    if (percentage <= 30) return { status: 'moderate', color: 'yellow', icon: AlertCircle, message: 'Moderate dilution' };
    return { status: 'high', color: 'red', icon: AlertTriangle, message: 'High dilution - consider reducing' };
  };

  const health = getHealthStatus(equityPercentage);
  const Icon = health.icon;

  return (
    <div className={`mt-3 p-3 rounded-lg border-l-4 ${
      health.color === 'green' ? 'border-green-400 bg-green-50' :
      health.color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
      'border-red-400 bg-red-50'
    }`}>
      <div className="flex items-center">
        <Icon size={16} className={`mr-2 ${
          health.color === 'green' ? 'text-green-600' :
          health.color === 'yellow' ? 'text-yellow-600' :
          'text-red-600'
        }`} />
        <span className={`text-sm font-medium ${
          health.color === 'green' ? 'text-green-700' :
          health.color === 'yellow' ? 'text-yellow-700' :
          'text-red-700'
        }`}>
          {health.message} ({equityPercentage.toFixed(1)}% equity)
        </span>
      </div>
    </div>
  );
};

// Impact Preview Component
const ImpactPreview: FC<{ calculated: CalculatedFields; formData: FormData }> = ({ 
  calculated, 
  formData
}) => {
  if (!formData.amount || !formData.valuation) return null;

  return (
    <motion.div 
      className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
        <BarChart2 size={16} className="mr-2" />
        Live Impact Preview
      </h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Equity Given Away:</span>
            <span className="font-mono font-bold text-red-600">
              {calculated.equityPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Post-Money Value:</span>
            <span className="font-mono font-bold text-green-600">
              ${calculated.postMoneyValuation.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Share Price:</span>
            <span className="font-mono">
              ${calculated.sharePrice.toFixed(4)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">New Shares:</span>
            <span className="font-mono">
              {calculated.newSharesIssued.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Suggested Amount Range */}
      <div className="mt-3 p-2 bg-white rounded border">
        <div className="text-xs text-gray-500 mb-1">Suggested range (15-25% dilution):</div>
        <div className="font-mono text-sm text-blue-700">
          ${calculated.suggestedRange.min.toLocaleString()} - ${calculated.suggestedRange.max.toLocaleString()}
        </div>
      </div>
      
      {/* Dilution Health Indicator */}
      <DilutionHealthIndicator equityPercentage={calculated.equityPercentage} />
    </motion.div>
  );
};

const AddFundingRound: FC<AddFundingRoundProps> = ({ isOpen, onClose }) => {
  const { addFundingRound, explainRoundImpact, totalShares } = useCapTable();
  const generateId = useCallback((): string => Math.random().toString(36).substring(2, 9), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<FundingRound | null>(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [explanationStyle, setExplanationStyle] = useState<ExplanationStyle>('mentor');
  const [savedRounds, setSavedRounds] = useState<RoundHistory[]>([]);
  const [selectedRound, setSelectedRound] = useState<RoundHistory | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Enhanced form data with better defaults
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'seed' as RoundType,
    amount: 0,
    valuation: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Auto-calculated fields state
  const [calculatedFields, setCalculatedFields] = useState<CalculatedFields>({
    postMoneyValuation: 0,
    equityPercentage: 0,
    sharePrice: 0,
    newSharesIssued: 0,
    suggestedRange: { min: 0, max: 0 }
  });

  // Load saved rounds on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setSavedRounds(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved rounds:', error);
      }
    }
  }, []);

  // Calculate all derived fields when amount/valuation changes
  useEffect(() => {
    if (formData.amount && formData.valuation && formData.amount > 0 && formData.valuation > 0) {
      const currentTotalShares = totalShares || 10000000; // Default 10M shares
      const postMoney = formData.valuation + formData.amount;
      const equityPct = (formData.amount / postMoney) * 100;
      const sharePrice = formData.valuation / currentTotalShares;
      const newShares = Math.round(formData.amount / sharePrice);
      
      // Calculate suggested range (15-25% dilution)
      const targetLowDilution = 0.15; // 15%
      const targetHighDilution = 0.25; // 25%
      const suggestedMin = (formData.valuation * targetLowDilution) / (1 - targetLowDilution);
      const suggestedMax = (formData.valuation * targetHighDilution) / (1 - targetHighDilution);
      
      setCalculatedFields({
        postMoneyValuation: postMoney,
        equityPercentage: equityPct,
        sharePrice: sharePrice,
        newSharesIssued: newShares,
        suggestedRange: { min: suggestedMin, max: suggestedMax }
      });
    } else {
      setCalculatedFields({
        postMoneyValuation: 0,
        equityPercentage: 0,
        sharePrice: 0,
        newSharesIssued: 0,
        suggestedRange: { min: 0, max: 0 }
      });
    }
  }, [formData.amount, formData.valuation, totalShares]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'valuation' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSaveRound = () => {
    if (!formData.name || !formData.amount || !formData.valuation) return;
    
    const roundToSave: RoundHistory = {
      id: generateId(),
      name: formData.name,
      amount: formData.amount,
      valuation: formData.valuation,
      postMoney: calculatedFields.postMoneyValuation,
      ownershipPercentage: calculatedFields.equityPercentage,
      timestamp: Date.now()
    };
    
    const updatedRounds = [...savedRounds, roundToSave];
    setSavedRounds(updatedRounds);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRounds));
  };

  const handleLoadRound = (round: RoundHistory) => {
    setFormData({
      name: round.name,
      type: formData.type,
      amount: round.amount,
      valuation: round.valuation,
      date: formData.date
    });
    setSelectedRound(round);
  };

  const handleClearRounds = () => {
    setSavedRounds([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter a round name';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (formData.amount > formData.valuation * 0.5) {
      newErrors.amount = 'Investment amount should typically be less than 50% of the valuation';
    }
    
    if (formData.valuation <= 0) {
      newErrors.valuation = 'Please enter a valid valuation';
    } else if (formData.valuation < 1000) {
      newErrors.valuation = 'Valuation seems too low';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setExplanation(null);

    try {
      const explanation = await addFundingRound({
        ...formData,
        date: new Date(formData.date).toISOString(),
      }, explanationStyle);
      
      const newRound: FundingRound = {
        ...formData,
        id: generateId(),
        date: new Date(formData.date).toISOString(),
        shares: calculatedFields.newSharesIssued,
        ownershipPercentage: calculatedFields.equityPercentage
      };
      
      setCurrentRound(newRound);
      setExplanation(explanation);
      
    } catch (error) {
      console.error('Error adding funding round:', error);
      alert('Failed to add funding round. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStyleToggle = async (style: '12yo' | 'mentor' | 'expert') => {
    if (!currentRound) return;
    setExplanationStyle(style);
    
    try {
      setIsExplanationLoading(true);
      const newExplanation = await explainRoundImpact(currentRound, style);
      const formattedExplanation = `## Impact of $${currentRound.amount.toLocaleString()} at $${currentRound.valuation.toLocaleString()} Valuation

${newExplanation}

### Key Takeaways:
- **Equity Dilution**: ${((currentRound.amount / currentRound.valuation) * 100).toFixed(1)}% of the company
- **Post-Money Valuation**: $${(currentRound.amount + currentRound.valuation).toLocaleString()}
- **Price Per Share**: $${(currentRound.valuation / (totalShares || 10000000)).toFixed(4)}`;
      setExplanation(formattedExplanation);
    } catch (error) {
      console.error('Error updating explanation:', error);
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'seed',
      amount: 0,
      valuation: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedRound(null);
    setExplanation(null);
    setCurrentRound(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Funding Round</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Round Name <span className="text-red-500">*</span>
                    <SimpleTooltip text="Give your round a descriptive name like 'Seed Round' or 'Series A'" />
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Seed Round"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Round Type <span className="text-red-500">*</span>
                    <SimpleTooltip text="Select the stage of your funding round. Each stage has different typical ranges." />
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    {Object.entries(ROUND_TYPE_RANGES).map(([key, { description }]) => (
                      <option key={key} value={key}>
                        {description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="valuation" className="block text-sm font-medium text-gray-700 mb-1">
                    Pre-Money Valuation ($) <span className="text-red-500">*</span>
                    <SimpleTooltip 
                      text={
                        <div className="space-y-2">
                          <p className="font-medium">Pre-Money Valuation</p>
                          <p>What your company is worth BEFORE this investment. This determines how much equity you give away.</p>
                          <p className="text-xs text-blue-200 mt-2">
                            <strong>Typical ranges:</strong><br />
                            • Pre-seed: $1M - $5M<br />
                            • Seed: $5M - $15M<br />
                            • Series A: $15M - $50M
                          </p>
                        </div>
                      }
                    />
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="valuation"
                      name="valuation"
                      value={formData.valuation || ''}
                      onChange={handleChange}
                      min="0"
                      step="100000"
                      placeholder="5,000,000"
                      className={`block w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.valuation ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.valuation && (
                    <p className="mt-1 text-sm text-red-600">{errors.valuation}</p>
                  )}
                  
                  {/* Post-Money Display */}
                  {calculatedFields.postMoneyValuation > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Post-money: <span className="font-medium text-green-600">
                        ${calculatedFields.postMoneyValuation.toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Raised ($) <span className="text-red-500">*</span>
                    <SimpleTooltip text="How much money you're raising. This dilutes existing shareholders but gives you cash to grow." />
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount || ''}
                      onChange={handleChange}
                      min="0"
                      step="50000"
                      placeholder="1,500,000"
                      className={`block w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.amount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                  
                  {/* Equity Percentage Display */}
                  {calculatedFields.equityPercentage > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Equity: <span className="font-medium text-blue-600">
                        {calculatedFields.equityPercentage.toFixed(1)}%
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Date and Help Me Decide */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Round Date
                    <SimpleTooltip text="When this funding round occurs or occurred. Defaults to today for modeling future scenarios." />
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Help Me Decide Button */}
                <div className="flex items-end">
                  <HelpMeDecideButton 
                    onSelect={(values) => {
                      setFormData(prev => ({
                        ...prev,
                        amount: values.amount,
                        valuation: values.valuation
                      }));
                    }}
                    roundType={formData.type}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Impact Preview Section */}
            <ImpactPreview 
              calculated={calculatedFields} 
              formData={formData}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.amount || !formData.valuation}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Adding Round...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Add Round
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Explanation Section */}
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-blue-800">Round Impact Analysis</h3>
                
                {/* Explanation Style Toggle */}
                <div className="flex space-x-1 bg-white rounded-lg p-1 border border-blue-200">
                  {(['12yo', 'mentor', 'expert'] as ExplanationStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleStyleToggle(style)}
                      disabled={isExplanationLoading}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        explanationStyle === style
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-blue-600 hover:bg-blue-50'
                      } disabled:opacity-50`}
                    >
                      {style === '12yo' ? '🎈 Kid Mode' : style === 'mentor' ? '👨‍🏫 Mentor' : '🎓 Expert'}
                    </button>
                  ))}
                </div>
              </div>

              {isExplanationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="ml-2 text-blue-600">Generating explanation...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <FormattedExplanation content={explanation} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-blue-200">
                <button
                  onClick={resetForm}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Try Another Scenario
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
                >
                  ✅ Done
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddFundingRound;