import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { generateId } from '../utils/helpers';
import { PlusCircle, Trash2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, validateNumberInput, formatNumberInput } from '../utils/helpers';

const EquityInput: React.FC = () => {
  const {
    founders,
    safe,
    addFounder,
    updateFounder,
    removeFounder,
    setSafe,
  } = useCapTable();

  const [newFounder, setNewFounder] = useState({ name: '', shares: '' });
  const [newSafe, setNewSafe] = useState({
    name: '',
    amount: '',
    valuationCap: '',
  });
  const [errors, setErrors] = useState<{
    founderShares?: string;
    safeAmount?: string;
    safeValuation?: string;
    [key: string]: string | undefined;
  }>({});

  // Add state to track if we should keep form data
  const [keepFormOpen, setKeepFormOpen] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Validate founder shares input
  const validateFounderShares = (value: string): boolean => {
    const { isValid, error } = validateNumberInput(value, {
      required: true,
      min: 1,
      isInteger: true,
      max: 1000000000 // 1 billion max shares
    });
    
    setErrors(prev => ({
      ...prev,
      founderShares: isValid ? undefined : error
    }));
    
    return isValid;
  };
  
  // Validate SAFE amount input
  const validateSafeAmount = (value: string): boolean => {
    const { isValid, error } = validateNumberInput(value, {
      required: true,
      min: 1,
      max: 1000000000000 // 1 trillion max
    });
    
    setErrors(prev => ({
      ...prev,
      safeAmount: isValid ? undefined : error
    }));
    
    return isValid;
  };
  
  // Validate SAFE valuation cap input
  const validateSafeValuation = (value: string): boolean => {
    const { isValid, error } = validateNumberInput(value, {
      required: true,
      min: 1000, // At least $1,000
      max: 1000000000000 // 1 trillion max
    });
    
    setErrors(prev => ({
      ...prev,
      safeValuation: isValid ? undefined : error
    }));
    
    return isValid;
  };
  
  // Format number input with commas
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'shares' | 'amount' | 'valuationCap') => {
    const { value } = e.target;
    const formattedValue = formatNumberInput(value);
    
    if (type === 'shares') {
      setNewFounder(prev => ({ ...prev, shares: formattedValue }));
      validateFounderShares(formattedValue);
    } else if (type === 'amount') {
      setNewSafe(prev => ({ ...prev, amount: formattedValue }));
      validateSafeAmount(formattedValue);
    } else if (type === 'valuationCap') {
      setNewSafe(prev => ({ ...prev, valuationCap: formattedValue }));
      validateSafeValuation(formattedValue);
    }
  };

  // Memoize handlers to prevent unnecessary re-renders
  const handleAddFounder = useCallback(() => {
    const isSharesValid = validateFounderShares(newFounder.shares);
    
    if (!newFounder.name.trim()) {
      setErrors(prev => ({
        ...prev,
        founderName: 'Founder name is required'
      }));
      return;
    }
    
    if (!isSharesValid) return;
    
    try {
      addFounder(newFounder.name, Number(newFounder.shares.replace(/,/g, '')));
      
      // Only clear form if not keeping it open
      if (!keepFormOpen) {
        setNewFounder({ name: '', shares: '' });
      } else {
        // Keep name, clear shares for next entry
        setNewFounder(prev => ({ ...prev, shares: '' }));
      }
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        founderName: undefined,
        founderShares: undefined
      }));
    } catch (error) {
      console.error('Error adding founder:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to add founder. Please try again.'
      }));
    }
  }, [newFounder, addFounder, keepFormOpen]);

  const handleUpdateFounder = useCallback((id: string, field: 'name' | 'shares', value: string) => {
    const founderToUpdate = founders.find((f) => f.id === id);
    if (!founderToUpdate) return;
    
    try {
      if (field === 'shares') {
        const { isValid } = validateNumberInput(value, {
          required: true,
          min: 1,
          isInteger: true,
          max: 1000000000
        });
        
        if (!isValid) return;
        
        // Format the number before updating
        const formattedValue = formatNumberInput(value);
        updateFounder(id, {
          ...founderToUpdate,
          shares: Number(formattedValue.replace(/,/g, ''))
        });
      } else {
        // For name field
        if (!value.trim()) {
          setErrors(prev => ({
            ...prev,
            [`founderName_${id}`]: 'Name cannot be empty'
          }));
          return;
        }
        updateFounder(id, {
          ...founderToUpdate,
          name: value
        });
      }
    } catch (error) {
      console.error('Error updating founder:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to update founder. Please try again.'
      }));
    }
  }, [founders, updateFounder]);

  const handleAddOrUpdateSafe = useCallback(() => {
    const isAmountValid = validateSafeAmount(newSafe.amount);
    const isValuationValid = validateSafeValuation(newSafe.valuationCap);
    
    if (!newSafe.name.trim()) {
      setErrors(prev => ({
        ...prev,
        safeName: 'SAFE name is required'
      }));
      return;
    }
    
    if (!isAmountValid || !isValuationValid) return;
    
    try {
      setSafe({
        id: safe?.id || generateId(),
        name: newSafe.name,
        amount: Number(newSafe.amount.replace(/,/g, '')),
        valuationCap: Number(newSafe.valuationCap.replace(/,/g, ''))
      });
      
      setNewSafe({ name: '', amount: '', valuationCap: '' });
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        safeName: undefined,
        safeAmount: undefined,
        safeValuation: undefined
      }));
    } catch (error) {
      console.error('Error adding SAFE:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to add SAFE. Please try again.'
      }));
    }
  }, [newSafe, safe?.id, setSafe]);

  // Handle Enter key to add founder
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newFounder.name && newFounder.shares) {
      e.preventDefault();
      handleAddFounder();
    }
  }, [newFounder, handleAddFounder]);

  const TooltipIcon: React.FC<{ text: string }> = ({ text }) => {
    const [isHovered, setIsHovered] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
          setIsHovered(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className="relative inline-block ml-1" ref={tooltipRef}>
        <button
          type="button"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsHovered(!isHovered)}
          className="text-blue-500 hover:text-blue-700 focus:outline-none"
          aria-label="More information"
        >
          <HelpCircle size={16} />
        </button>
        
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-blue-600 text-white text-sm rounded-md shadow-lg z-[100]"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
              transformOrigin: 'bottom center',
            }}
          >
            {text}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-t-blue-600 border-l-transparent border-r-transparent"></div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div 
      id="equity-input" 
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Equity Input</h2>
      
      {/* Founders Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold text-blue-800 flex items-center">
            Founders
          </h3>
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={keepFormOpen}
              onChange={(e) => setKeepFormOpen(e.target.checked)}
              className="mr-2"
            />
            Keep form open for multiple entries
          </label>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-700 tracking-wider">Name</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-700 tracking-wider">
                  Shares
                  <TooltipIcon text="The number of shares owned by this founder. Shares represent ownership in the company." />
                </th>
                <th className="px-4 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {founders.map((founder) => (
                <tr key={founder.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={founder.shares.toLocaleString()}
                        onChange={(e) => handleUpdateFounder(founder.id, 'shares', e.target.value)}
                        onFocus={() => setFocusedField(`${founder.id}-shares`)}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`founderShares_${founder.id}`] ? 'border-red-500' : ''
                        }`}
                      />
                      {errors[`founderShares_${founder.id}`] && (
                        <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                          {errors[`founderShares_${founder.id}`]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="number"
                      min="0"
                      value={founder.name}
                      onChange={(e) =>
                        handleUpdateFounder(founder.id, 'name', e.target.value)
                      }
                      onFocus={() => setFocusedField(`${founder.id}-name`)}
                      onBlur={() => setFocusedField(null)}
                      className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => removeFounder(founder.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  <input
                    type="text"
                    placeholder="Founder name"
                    value={newFounder.name}
                    onChange={(e) =>
                      setNewFounder({ ...newFounder, name: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                    onFocus={() => setFocusedField('new-name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newFounder.shares}
                      onChange={(e) => handleNumberInput(e, 'shares')}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setFocusedField('new-shares')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.founderShares ? 'border-red-500' : ''
                      }`}
                      placeholder="1,000,000"
                    />
                    {errors.founderShares && (
                      <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                        {errors.founderShares}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <button
                    onClick={handleAddFounder}
                    disabled={!newFounder.name || !newFounder.shares}
                    className={`flex items-center justify-center rounded-full p-1 transition-colors ${
                      !newFounder.name || !newFounder.shares
                        ? 'text-gray-400'
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    <PlusCircle size={18} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleAddFounder}
            disabled={!newFounder.name || !newFounder.shares}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              !newFounder.name || !newFounder.shares
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Founder
          </button>
          
          {founders.length > 0 && (
            <div className="text-sm text-gray-600 flex items-center">
              Total founders: {founders.length}
            </div>
          )}
        </div>
      </div>
      
      {/* SAFE Investment Section */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          SAFE Investment
          <TooltipIcon text="A SAFE (Simple Agreement for Future Equity) is like an IOU from your company to an investor. For example, with $500,000 at $5,000,000 cap: Investor gives you $500,000 now. They get equity in your next funding round. Their price per share is based on a $5M valuation cap or the next round's valuation (whichever is lower)." />
        </h3>
        
        {safe ? (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{safe.name}</h4>
                <p className="text-gray-600">
                  {formatCurrency(safe.amount)} at {formatCurrency(safe.valuationCap)} cap
                </p>
              </div>
              <button
                onClick={() => setSafe(null)}
                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investor Name
              </label>
              <input
                type="text"
                placeholder="Investor name"
                value={newSafe.name}
                onChange={(e) =>
                  setNewSafe({ ...newSafe, name: e.target.value })
                }
                className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Amount ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newSafe.amount}
                  onChange={(e) => handleNumberInput(e, 'amount')}
                  onFocus={() => setFocusedField('safe-amount')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-6 border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.safeAmount ? 'border-red-500' : ''
                  }`}
                  placeholder="500,000"
                />
                {errors.safeAmount && (
                  <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                    {errors.safeAmount}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valuation Cap ($)
                <TooltipIcon text="The valuation cap sets the maximum company valuation at which the SAFE investor's money converts to equity." />
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newSafe.valuationCap}
                  onChange={(e) => handleNumberInput(e, 'valuationCap')}
                  onFocus={() => setFocusedField('safe-valuation')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-6 border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.safeValuation ? 'border-red-500' : ''
                  }`}
                  placeholder="5,000,000"
                />
                {errors.safeValuation && (
                  <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                    {errors.safeValuation}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!safe && (
          <button
            onClick={handleAddOrUpdateSafe}
            disabled={!newSafe.name || !newSafe.amount || !newSafe.valuationCap}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              !newSafe.name || !newSafe.amount || !newSafe.valuationCap
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <PlusCircle size={18} className="mr-2" />
            Add SAFE Investment
          </button>
        )}
      </div>
    </div>
  );
};

export default EquityInput;