import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RoundType, FundingRound, ExplanationStyle } from '../types/capTable';
import { useCapTable } from '../context/CapTableContext';
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { SimpleTooltip } from './ui/SimpleTooltip';
import { FormattedExplanation } from './ui/FormattedExplanation';
import { HelpMeDecideButton } from './ui/HelpMeDecideButton';

interface AddFundingRoundProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRound: (round: Omit<FundingRound, 'id' | 'shares' | 'ownershipPercentage'>) => Promise<void>;
}

const ROUND_TYPE_RANGES = {
  'pre-seed': { min: 0, max: 2, label: 'Pre-Seed', description: 'Initial funding to get started' },
  'seed': { min: 0.5, max: 5, label: 'Seed', description: 'Early stage funding to build the product' },
  'series-a': { min: 2, max: 15, label: 'Series A', description: 'Scaling the business' },
  'series-b': { min: 10, max: 30, label: 'Series B', description: 'Expanding market reach' },
  'series-c': { min: 20, max: 100, label: 'Series C+', description: 'Scaling to new markets' },
  'safe': { min: 0.1, max: 50, label: 'SAFE', description: 'Simple Agreement for Future Equity' },
  'other': { min: 0, max: 1000, label: 'Other', description: 'Custom funding round' },
} as const satisfies Record<RoundType, { min: number; max: number; label: string; description: string }>;

const AddFundingRound = ({ isOpen, onClose, onAddRound }: AddFundingRoundProps) => {
  const { totalShares, explainRoundImpact } = useCapTable();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [explanationStyle, setExplanationStyle] = useState<ExplanationStyle>('mentor');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'seed' as RoundType,
    amount: 0,
    valuation: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'seed' as RoundType,
    amount: 0,
    valuation: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Live calculations
  const postMoneyValuation = formData.type === 'safe' 
    ? (formData.valuationCap || 0) 
    : formData.amount + formData.valuation;
    
  const isSAFE = formData.type === 'safe';
  const equityPercentage = useMemo(() => {
    try {
      const amount = Number(formData.amount || 0);
      if (amount <= 0) return 0;
      
      if (formData.type === 'safe') {
        // For SAFEs, show a rough estimate based on valuation cap
        const cap = Number(formData.valuationCap || 0);
        if (cap > 0) {
          // Cap the equity percentage at 35% for SAFEs to avoid unrealistic numbers
          return Math.min(35, (amount / cap) * 100);
        }
        return 0;
      } else {
        // For equity rounds, calculate based on pre-money valuation
        const valuation = Number(formData.valuation || 0);
        if (valuation > 0) {
          const percentage = (amount / (amount + valuation)) * 100;
          // Cap at 50% for equity rounds to catch potential errors
          return Math.min(50, percentage);
        }
        return 0;
      }
    } catch (error) {
      console.error('Error calculating equity percentage:', error);
      return 0;
    }
  }, [formData.amount, formData.valuation, formData.valuationCap, formData.type]);
  const sharePrice = formData.valuation > 0 && totalShares > 0 
    ? formData.valuation / totalShares 
    : 0;
  const newSharesIssued = sharePrice > 0 
    ? Math.round(formData.amount / sharePrice) 
    : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Enhanced form validation with better error messages and validation rules
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const amount = Number(formData.amount);
    const valuation = Number(formData.valuation);
    const valuationCap = Number(formData.valuationCap);
    const discountRate = Number(formData.discountRate);
    
    // Validate round type
    if (!formData.type) {
      newErrors.type = 'Please select a round type';
    }
    
    // Validate amount
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid investment amount';
    } else if (amount > 1000000000) { // $1B limit
      newErrors.amount = 'Amount seems too high. Please verify.';
    }
    
    // For non-SAFE rounds, validate valuation
    if (formData.type !== 'safe') {
      if (!formData.valuation || isNaN(valuation) || valuation <= 0) {
        newErrors.valuation = 'Please enter a valid pre-money valuation';
      } else if (valuation > 10000000000) { // $10B limit
        newErrors.valuation = 'Valuation seems too high. Please verify.';
      } else if (amount > 0 && valuation > 0 && (amount / valuation) > 0.5) {
        // Warn if raising more than 50% of valuation
        newErrors.amount = 'Raising more than 50% of valuation is unusual. Double check?';
      }
    }
    
    // For SAFE rounds, validate SAFE-specific fields
    if (formData.type === 'safe') {
      // Validate valuation cap
      if (!formData.valuationCap || isNaN(valuationCap) || valuationCap <= 0) {
        newErrors.valuationCap = 'Please enter a valid valuation cap';
      } else if (valuationCap > 1000000000) { // $1B cap limit
        newErrors.valuationCap = 'Valuation cap seems too high. Please verify.';
      }
      
      // Validate discount rate if applicable
      if (formData.safeType === 'discount-only' || formData.safeType === 'cap-and-discount') {
        if (!formData.discountRate || isNaN(discountRate)) {
          newErrors.discountRate = 'Please enter a valid discount rate';
        } else if (discountRate <= 0 || discountRate > 100) {
          newErrors.discountRate = 'Discount rate must be between 0.1% and 100%';
        } else if (discountRate > 30) {
          // Warning for high discount rates
          newErrors.discountRate = 'Discount rate above 30% is unusually high';
        }
      }
      
      // Validate SAFE amount makes sense relative to cap
      if (amount > 0 && valuationCap > 0 && amount > (valuationCap * 0.2)) {
        newErrors.amount = 'SAFE amount seems high relative to valuation cap';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with better error handling and loading state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus the first error field
          (element as HTMLElement).focus();
        }
      }
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare round data based on round type
      const roundData: Omit<FundingRound, 'id' | 'shares' | 'ownershipPercentage'> = {
        name: formData.name,
        type: formData.type,
        amount: Number(formData.amount),
        valuation: formData.type === 'safe' ? 0 : Number(formData.valuation),
        date: formData.date || new Date().toISOString(),
        notes: formData.notes || '',
        ...(formData.type === 'safe' && {
          valuationCap: formData.valuationCap ? Number(formData.valuationCap) : undefined,
          safeType: formData.safeType,
          ...(formData.safeType && (formData.safeType === 'discount-only' || formData.safeType === 'cap-and-discount') && {
            discountRate: formData.discountRate ? Number(formData.discountRate) : undefined
          })
        })
      };
      
      // Call the parent handler with the round data
      await onAddRound(roundData);
      
      // Show success feedback
      toast.success(
        <div>
          <p className="font-medium">Success!</p>
          <p className="text-sm">
            {formData.type === 'safe' 
              ? 'SAFE note added successfully' 
              : `${formData.type} round added successfully`}
          </p>
        </div>,
        { duration: 3000 }
      );
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Error adding funding round:', error);
      toast.error(
        <div>
          <p className="font-medium">Error</p>
          <p className="text-sm">Failed to add {formData.type === 'safe' ? 'SAFE note' : 'funding round'}</p>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStyleToggle = async (style: ExplanationStyle) => {
    setExplanationStyle(style);
    
    try {
      setIsExplanationLoading(true);
      const newExplanation = await explainRoundImpact(formData as FundingRound, style);
      setExplanation(newExplanation);
    } catch (error) {
      console.error('Error updating explanation:', error);
    } finally {
      setIsExplanationLoading(false);
    }
  };

  // Handle form reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: 'seed' as RoundType,
        amount: 0,
        valuation: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        valuationCap: undefined,
        discountRate: undefined,
        safeType: 'cap-only' as const
      });
      setErrors({});
      setExplanation(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={onClose}>
      <motion.div
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Add Funding Round</h2>
            <p className="text-blue-100 text-sm mt-1">
              {isSAFE ? 'Add a SAFE Note' : 'Add a new funding round'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Round Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type of Funding
                <SimpleTooltip text="Select the type of funding round you're adding" />
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(ROUND_TYPE_RANGES).map(([key, { label, description }]) => {
                  const isSelected = formData.type === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: key as RoundType }))}
                      className={`p-4 rounded-xl border-2 transition-all ${isSelected 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}
                    >
                      <div className="font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500 mt-1">{description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Round Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Round Name
                <SimpleTooltip text="Give your round a descriptive name like 'Seed Round' or 'Series A'" />
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={formData.type === 'safe' 
                  ? 'E.g., Pre-seed SAFE' 
                  : `E.g., ${formData.type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} Round`}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              />
              {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Financial Information */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-700">
                {isSAFE ? 'SAFE Terms' : 'Valuation & Investment'}
                <SimpleTooltip text={isSAFE 
                  ? "Set the terms for your SAFE agreement" 
                  : "Enter the financial details of this funding round"} />
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {isSAFE 
                  ? "SAFEs convert to equity in your next funding round"
                  : "These numbers determine the equity given to investors"}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isSAFE ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Pre-Money Valuation
                      </label>
                      <span className="text-xs text-gray-500">${(formData.valuation || 0).toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        name="valuation"
                        value={formData.valuation || ''}
                        onChange={handleChange}
                        placeholder="6,000,000"
                        className="pl-8 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Typical seed: $5M - $15M
                    </p>
                    {errors.valuation && <p className="mt-1 text-sm text-red-600">{errors.valuation}</p>}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Valuation Cap
                      </label>
                      <span className="text-xs text-gray-500">${(formData.valuationCap || 0).toLocaleString()}</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        name="valuationCap"
                        value={formData.valuationCap || ''}
                        onChange={handleChange}
                        placeholder="5,000,000"
                        className="pl-8 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Lower cap = better for investors
                    </p>
                    {errors.valuationCap && <p className="mt-1 text-sm text-red-600">{errors.valuationCap}</p>}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {isSAFE ? 'SAFE Amount' : 'Amount Raised'}
                    </label>
                    <span className="text-xs text-gray-500">${(formData.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount || ''}
                      onChange={handleChange}
                      placeholder={isSAFE ? "250,000" : "1,500,000"}
                      className="pl-8 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                </div>
              </div>
              
              {/* Live calculation preview */}
              {formData.amount > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {isSAFE ? 'Will convert to' : 'Equity given'}
                    </span>
                    <span className="font-medium text-gray-900">
                      {equityPercentage.toFixed(1)}%
                    </span>
                  </div>
                  {!isSAFE && (
                    <div className="mt-2">
                      <DilutionHealthIndicator equityPercentage={equityPercentage} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SAFE-specific fields */}
            {isSAFE && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-700">
                    SAFE Conversion Terms
                    <SimpleTooltip text="Choose how your SAFE will convert in the next funding round" />
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select the type of SAFE and set the conversion terms
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      SAFE Type
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'cap-only', label: 'Valuation Cap Only', description: 'Converts at the lower of cap or next round price' },
                        { value: 'discount-only', label: 'Discount Only', description: 'Converts at a discount to next round price' },
                        { value: 'cap-and-discount', label: 'Cap & Discount', description: 'Converts at the most favorable terms' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
                          <input
                            type="radio"
                            name="safeType"
                            value={option.value}
                            checked={formData.safeType === option.value}
                            onChange={handleChange}
                            className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                            <span className="block text-xs text-gray-500">{option.description}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {(formData.safeType === 'discount-only' || formData.safeType === 'cap-and-discount') && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Discount Rate
                        <SimpleTooltip text="The discount rate (e.g., 20%) at which the SAFE will convert compared to the next round's price." />
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">%</span>
                        </div>
                        <input
                          type="number"
                          name="discountRate"
                          value={formData.discountRate || ''}
                          onChange={handleChange}
                          placeholder="20"
                          min="0"
                          max="100"
                          step="1"
                          className="pl-10 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Common rates: 10-30%
                      </p>
                      {errors.discountRate && <p className="mt-1 text-sm text-red-600">{errors.discountRate}</p>}
                    </div>
                  )}
                </div>
                
                {/* Help text */}
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">How this works:</span> {formData.safeType === 'cap-only' 
                      ? 'Your SAFE will convert at the lower of the valuation cap or the next round price.'
                      : formData.safeType === 'discount-only'
                        ? `Your SAFE will convert at a ${formData.discountRate}% discount to the next round price.`
                        : `Your SAFE will convert at the most favorable terms between the valuation cap or ${formData.discountRate}% discount.`}
                  </p>
                </div>
              </div>
            )}

            {/* Live calculations preview */}
            {formData.amount > 0 && formData.valuation > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <BarChart2 size={16} className="mr-2" />
                  Live Impact Preview
                </h4>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-blue-700 font-medium">Post-Money Value</div>
                    <div className="text-lg font-bold text-blue-900">
                      ${postMoneyValuation.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-medium">Equity Given Away</div>
                    <div className="text-lg font-bold text-red-600">
                      {equityPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-medium">New Shares</div>
                    <div className="text-lg font-bold text-blue-900">
                      {newSharesIssued.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <DilutionHealthIndicator equityPercentage={equityPercentage} />
              </motion.div>
            )}

            {/* Help Me Decide Button */}
            <div className="flex justify-center">
              <HelpMeDecideButton 
                onSelect={(values) => {
                  setFormData(prev => ({
                    ...prev,
                    amount: values.amount,
                    valuation: values.valuation
                  }));
                }}
                roundType={formData.type}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.amount || !formData.valuation}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
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
                
                {/* Simple Style Toggle */}
                <div className="flex space-x-1 bg-white rounded-lg p-1">
                  {(['12yo', 'mentor', 'expert'] as ExplanationStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => handleStyleToggle(style)}
                      disabled={isExplanationLoading}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        explanationStyle === style
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {style === '12yo' ? 'Simple' : style === 'mentor' ? 'Practical' : 'Expert'}
                    </button>
                  ))}
                </div>
              </div>

              {isExplanationLoading ? (
                <div className="flex items-center justify-center py-4">
                  <motion.div
                    className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="ml-2 text-blue-600">Updating explanation...</span>
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
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded hover:bg-blue-50"
                >
                  Try Another Scenario
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700"
                >
                  ✅ Done
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddFundingRound;