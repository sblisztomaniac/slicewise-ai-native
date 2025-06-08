import { useState, useRef, useEffect, FC, useCallback } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { motion } from 'framer-motion';
import { HelpCircle, X, Info, Save, Clock, Trash2 } from 'lucide-react';
import { FundingRound, RoundType } from '../types';
import HelpMeDecideButton from './HelpMeDecideButton';

const LOCAL_STORAGE_KEY = 'savedFundingRounds';

// Round type definitions with typical valuation ranges (in millions)
const ROUND_TYPE_RANGES = {
  'safe': { min: 50000, max: 5000000, description: 'SAFE Note' },
  'pre-seed': { min: 100000, max: 2000000, description: 'Pre-seed: $100K - $2M' },
  'seed': { min: 500000, max: 5000000, description: 'Seed: $500K - $5M' },
  'series-a': { min: 2000000, max: 20000000, description: 'Series A: $2M - $20M' },
  'series-b': { min: 10000000, max: 50000000, description: 'Series B: $10M - $50M' },
  'series-c': { min: 30000000, max: 150000000, description: 'Series C: $30M - $150M' },
  'series-d': { min: 100000000, max: 300000000, description: 'Series D: $100M - $300M' },
  'series-e': { min: 300000000, max: 500000000, description: 'Series E: $300M - $500M' },
  'series-f': { min: 500000000, max: 1000000000, description: 'Series F: $500M - $1B' },
  'series-g': { min: 1000000000, max: 2500000000, description: 'Series G: $1B - $2.5B' },
  'series-h': { min: 2500000000, max: 5000000000, description: 'Series H: $2.5B - $5B' },
  'other': { min: 0, max: 0, description: 'Custom round' }
} as const;

interface AddFundingRoundProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  type: RoundType | 'safe';
  amount: number;
  valuation: number;
  date: string;
  valuationCap?: number;
  discountRate?: number;
  safeType?: 'cap-only' | 'discount-only' | 'cap-and-discount' | 'mfn';
}

type ExplanationStyle = '12yo' | 'mentor' | 'expert';

const AddFundingRound: FC<AddFundingRoundProps> = ({ isOpen, onClose }) => {
  const { addFundingRound, explainRoundImpact, totalShares } = useCapTable();
  
  // State declarations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [explanationStyle, setExplanationStyle] = useState<ExplanationStyle>('mentor');
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [savedRounds, setSavedRounds] = useState<FundingRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<FundingRound | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'seed',
    amount: 0,
    valuation: 0,
    date: new Date().toISOString().split('T')[0],
    valuationCap: undefined,
    discountRate: undefined,
    safeType: 'cap-only'
  });

  const helpRef = useRef<HTMLDivElement>(null);

  const generateId = useCallback((): string => Math.random().toString(36).substring(2, 9), []);

  // Helper functions
  const getSuggestedAmount = (valuation: number) => 
    Math.round((valuation * 0.15) / 100000) * 100000; // Round to nearest 100K

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'valuation' ? Number(value) : value,
    }));
    
    // Auto-suggest valuation based on round type
    if (name === 'type' && value in ROUND_TYPE_RANGES) {
      const range = ROUND_TYPE_RANGES[value as keyof typeof ROUND_TYPE_RANGES];
      setFormData(prev => ({
        ...prev,
        amount: Math.round(range.min * 0.15),
        valuation: range.min
      }));
    }
  };

  const handleHelpClick = (field: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHelp(activeHelp === field ? null : field);
  };

  const handleHelpMeDecide = (values: { amount: number; valuation: number }) => {
    setFormData(prev => ({
      ...prev,
      amount: values.amount,
      valuation: values.valuation
    }));
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Round name is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.valuation <= 0) {
      newErrors.valuation = 'Valuation must be greater than 0';
    }

    if (formData.amount >= formData.valuation) {
      newErrors.amount = 'Amount must be less than valuation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const roundData = {
        name: formData.name,
        type: formData.type,
        amount: formData.amount,
        valuation: formData.valuation,
        date: formData.date,
        ...(formData.type === 'safe' && {
          valuationCap: formData.valuationCap,
          discountRate: formData.discountRate,
          safeType: formData.safeType
        })
      };

      const explanation = await addFundingRound(roundData, explanationStyle);
      
      setExplanation(explanation);
      
      // Reset form
      setFormData({
        name: '',
        type: 'seed',
        amount: 0,
        valuation: 0,
        date: new Date().toISOString().split('T')[0],
        valuationCap: undefined,
        discountRate: undefined,
        safeType: 'cap-only'
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding funding round:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, addFundingRound, explanationStyle, onClose]);

  const handleSaveRound = useCallback(() => {
    if (!formData.name || !formData.amount || !formData.valuation) return;
    
    const roundToSave: FundingRound = {
      id: generateId(),
      name: formData.name,
      type: formData.type,
      amount: formData.amount,
      valuation: formData.valuation,
      date: formData.date,
      shares: Math.round((formData.amount / formData.valuation) * (totalShares || 10000000)),
      ownershipPercentage: (formData.amount / formData.valuation) * 100
    };
    
    const updatedRounds = [...savedRounds, roundToSave];
    setSavedRounds(updatedRounds);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRounds));
  }, [formData, savedRounds, generateId, totalShares]);

  const handleLoadRound = useCallback((round: FundingRound) => {
    setFormData({
      name: round.name,
      type: round.type,
      amount: round.amount,
      valuation: round.valuation,
      date: round.date || new Date().toISOString().split('T')[0]
    });
    setSelectedRound(round);
  }, []);

  const handleClearRounds = useCallback(() => {
    setSavedRounds([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSelectedRound(null);
  }, []);

  const handleDeleteRound = useCallback((id: string) => {
    const updatedRounds = savedRounds.filter(round => round.id !== id);
    setSavedRounds(updatedRounds);
    if (updatedRounds.length === 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRounds));
    }
  }, [savedRounds]);

  const handleStyleToggle = useCallback((style: ExplanationStyle) => {
    setExplanationStyle(style);
    
    if (selectedRound) {
      setIsExplanationLoading(true);
      explainRoundImpact(selectedRound, style)
        .then(explanation => {
          setExplanation(explanation);
          setIsExplanationLoading(false);
        })
        .catch(error => {
          console.error('Error generating explanation:', error);
          setExplanation('Failed to generate explanation. Please try again.');
          setIsExplanationLoading(false);
        });
    }
  }, [selectedRound, explainRoundImpact]);

  const generateExplanation = useCallback(async () => {
    if (!formData.amount || !formData.valuation) return;
    
    const round: FundingRound = {
      id: generateId(),
      name: formData.name,
      type: formData.type,
      amount: formData.amount,
      valuation: formData.valuation,
      date: formData.date,
      shares: Math.round((formData.amount / formData.valuation) * (totalShares || 10000000)),
      ownershipPercentage: (formData.amount / formData.valuation) * 100
    };
    
    setIsExplanationLoading(true);
    
    try {
      const explanation = await explainRoundImpact(round, explanationStyle);
      setExplanation(explanation);
    } catch (error) {
      console.error('Error generating explanation:', error);
      setExplanation('Failed to generate explanation. Please try again.');
    } finally {
      setIsExplanationLoading(false);
    }
  }, [formData, explanationStyle, explainRoundImpact, generateId, totalShares]);

  // Load saved rounds on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setSavedRounds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved rounds', e);
      }
    }
  }, []);

  // Generate explanation when form data changes
  useEffect(() => {
    generateExplanation();
  }, [formData.amount, formData.valuation, formData.type, generateExplanation]);

  // Close help when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setActiveHelp(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // HelpTooltip component
  const HelpTooltip: FC<{ field: string; content: React.ReactNode; className?: string }> = ({ field, content, className = '' }) => (
    <div className={`relative ml-2 ${className}`}>
      <button
        type="button"
        onClick={(e) => handleHelpClick(field, e)}
        className="text-gray-400 hover:text-blue-500 focus:outline-none"
        aria-label={`Help for ${field}`}
      >
        <HelpCircle size={16} />
      </button>
      {activeHelp === field && (
        <div 
          ref={helpRef}
          className="absolute z-10 w-72 p-4 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="flex items-start">
            <Info className="flex-shrink-0 mt-0.5 mr-2 text-blue-500" size={16} />
            <div>{content}</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveHelp(null);
            }}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
            aria-label="Close help"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  const suggestedAmount = getSuggestedAmount(formData.valuation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add Funding Round</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Saved Rounds Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Saved Rounds</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSaveRound}
                  disabled={!formData.name || !formData.amount || !formData.valuation}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-3 h-3 mr-1" /> Save Current
                </button>
                {savedRounds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearRounds}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Clear All
                  </button>
                )}
              </div>
            </div>

            {savedRounds.length === 0 ? (
              <p className="text-sm text-gray-500">No saved rounds yet. Fill out the form and click "Save Current".</p>
            ) : (
              <div className="space-y-2">
                {savedRounds.map((round) => (
                  <div
                    key={round.id}
                    className={`flex items-center justify-between p-2 text-sm rounded-md cursor-pointer ${
                      selectedRound?.id === round.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleLoadRound(round)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{round.name}</div>
                      <div className="text-xs text-gray-500">
                        ${round.amount.toLocaleString()} at ${round.valuation.toLocaleString()} pre
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(round.date).toLocaleDateString()}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRound(round.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Round Details</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Round Name
                    </label>
                    <span className="text-red-500 ml-1">*</span>
                    <HelpTooltip
                      field="name"
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Round Name</p>
                          <p>A descriptive name for this funding round (e.g., 'Seed Round', 'Series A')</p>
                        </div>
                      }
                    />
                  </div>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Round Type
                    </label>
                    <span className="text-red-500 ml-1">*</span>
                    <HelpTooltip
                      field="type"
                      content={
                        <div>
                          <p className="mb-2">Select the type of funding round:</p>
                          <ul className="pl-4 space-y-1 list-disc">
                            <li><strong>SAFE:</strong> Simple Agreement for Future Equity - Converts to equity in future rounds</li>
                            <li><strong>Pre-seed:</strong> Early stage, often from friends & family</li>
                            <li><strong>Seed:</strong> First significant round of funding</li>
                            <li><strong>Series A, B, C, etc.:</strong> Successive funding rounds</li>
                          </ul>
                        </div>
                      }
                    />
                  </div>
                  <div className="relative mt-1">
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      {Object.entries(ROUND_TYPE_RANGES).map(([value, { description }]) => (
                        <option key={value} value={value}>
                          {description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center">
                    <label htmlFor="valuation" className="block text-sm font-medium text-gray-700">
                      Pre-Money Valuation ($)
                    </label>
                    <span className="text-red-500 ml-1">*</span>
                    <HelpTooltip
                      field="valuation"
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Pre-Money Valuation</p>
                          <p>The company's valuation before this investment. This is what your company is worth before the new money comes in.</p>
                          <p className="text-xs text-gray-500 mt-2">
                            <strong>Typical ranges:</strong><br />
                            • Pre-seed: $1M - $5M<br />
                            • Seed: $5M - $15M<br />
                            • Series A: $15M - $50M
                          </p>
                        </div>
                      }
                    />
                  </div>
                  <div className="relative mt-1">
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
                      step="1000"
                      className={`block w-full pl-7 pr-3 border ${
                        errors.valuation ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      required
                    />
                  </div>
                  {errors.valuation && <p className="mt-1 text-sm text-red-600">{errors.valuation}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Post-money: <span className="font-medium">${(formData.valuation + formData.amount).toLocaleString()}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount Raised ($)
                    </label>
                    <span className="text-red-500 ml-1">*</span>
                    <HelpTooltip
                      field="amount"
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Investment Amount</p>
                          <p>How much money you're raising in this round. This will determine what percentage of the company you're selling.</p>
                          <p className="text-xs text-gray-500 mt-2">
                            <strong>Typical ranges:</strong><br />
                            • Pre-seed: $100K - $2M<br />
                            • Seed: $500K - $5M<br />
                            • Series A: $2M - $20M
                          </p>
                        </div>
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative flex-1">
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
                        step="1000"
                        className={`block w-full pl-7 pr-3 border ${
                          errors.amount ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        required
                      />
                    </div>
                    <HelpMeDecideButton 
                      onSelect={handleHelpMeDecide} 
                      roundType={formData.type}
                      className="whitespace-nowrap"
                    />
                  </div>
                  {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                  {formData.valuation > 0 && formData.amount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Equity: <span className="font-medium">
                        {((formData.amount / (formData.valuation + formData.amount)) * 100).toFixed(1)}%
                      </span>
                    </p>
                  )}
                  {suggestedAmount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Suggested amount: ${suggestedAmount.toLocaleString()} (15% of valuation)
                    </p>
                  )}
                </div>

                {formData.type === 'safe' && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="safeType" className="block text-sm font-medium text-gray-700">
                        SAFE Type
                      </label>
                      <select
                        id="safeType"
                        name="safeType"
                        value={formData.safeType}
                        onChange={handleChange}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="cap-only">Valuation Cap Only</option>
                        <option value="discount-only">Discount Only</option>
                        <option value="cap-and-discount">Cap & Discount</option>
                        <option value="mfn">Most Favored Nation (MFN)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Choose the type of SAFE agreement
                      </p>
                    </div>

                    {(formData.safeType === 'cap-only' || formData.safeType === 'cap-and-discount') && (
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <label htmlFor="valuationCap" className="block text-sm font-medium text-gray-700">
                            Valuation Cap ($)
                          </label>
                          <HelpTooltip
                            field="valuationCap"
                            content={
                              <div className="space-y-2">
                                <p className="font-medium">Valuation Cap</p>
                                <p>The maximum valuation at which your SAFE will convert to equity in future rounds.</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  <strong>Example:</strong> With a $5M cap, if the next round values the company at $10M, your SAFE converts as if the company was valued at $5M.
                                </p>
                              </div>
                            }
                          />
                        </div>
                        <input
                          type="number"
                          id="valuationCap"
                          name="valuationCap"
                          value={formData.valuationCap || ''}
                          onChange={handleChange}
                          min="0"
                          step="1000"
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    {(formData.safeType === 'discount-only' || formData.safeType === 'cap-and-discount') && (
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700">
                            Discount Rate (%)
                          </label>
                          <HelpTooltip
                            field="discountRate"
                            content={
                              <div className="space-y-2">
                                <p className="font-medium">Discount Rate</p>
                                <p>The percentage discount your SAFE investors get when the SAFE converts to equity.</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  <strong>Example:</strong> With a 20% discount, if the next round's price per share is $1, your SAFE converts at $0.80 per share.
                                </p>
                              </div>
                            }
                          />
                        </div>
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            id="discountRate"
                            name="discountRate"
                            value={formData.discountRate || ''}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="1"
                            className="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 sm:text-sm" id="discount-rate">%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Round'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {explanation && (
          <motion.div 
            className="border-t border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-4 text-sm bg-blue-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-800">
                  {explanationStyle === '12yo' ? '👶 ' : explanationStyle === 'mentor' ? '👔 ' : '🎓 '}
                  Round Analysis
                </h3>
                
                <div className="inline-flex p-0.5 space-x-0.5 bg-blue-100 rounded-md">
                  {['12yo', 'mentor', 'expert'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleStyleToggle(style as ExplanationStyle)}
                      disabled={isExplanationLoading}
                      className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                        explanationStyle === style
                          ? 'bg-white shadow-sm text-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      } ${isExplanationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {style}
                      {isExplanationLoading && explanationStyle === style && '...'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 text-blue-700">
                <p className="whitespace-pre-line">{explanation}</p>
                {selectedRound && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-100 text-sm">
                    <p className="font-medium text-blue-800 border-b pb-1 mb-2">Round Summary</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium">{selectedRound.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium capitalize">{selectedRound.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium">${selectedRound.amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Valuation</p>
                        <p className="font-medium">${selectedRound.valuation?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ownership</p>
                        <p className="font-medium">
                          {selectedRound.ownershipPercentage?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AddFundingRound;