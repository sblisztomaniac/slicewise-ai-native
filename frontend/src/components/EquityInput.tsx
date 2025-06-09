// frontend/src/components/EquityInput.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { generateId } from '../utils/helpers';
import { PlusCircle, Trash2, HelpCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, validateNumberInput, formatNumberInput } from '../utils/helpers';

// Simple Tooltip Component
const SimpleTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-block ml-1"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <HelpCircle size={16} className="text-blue-500 hover:text-blue-700 cursor-help transition-colors" />
      
      {isVisible && (
        <div className="absolute z-[10000] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-lg max-w-xs whitespace-normal pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
        </div>
      )}
    </span>
  );
};

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
    safeName?: string;
    [key: string]: string | undefined;
  }>({});

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

  // Handle number input formatting
  const handleNumberInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const { value } = e.target;
    const formattedValue = formatNumberInput(value);
    
    if (field === 'amount') {
      setNewSafe(prev => ({ ...prev, amount: formattedValue }));
      if (formattedValue) validateSafeAmount(formattedValue);
    } else if (field === 'valuationCap') {
      setNewSafe(prev => ({ ...prev, valuationCap: formattedValue }));
      if (formattedValue) validateSafeValuation(formattedValue);
    }
  }, []);

  // Handle adding founder
  const handleAddFounder = useCallback(() => {
    if (!newFounder.name.trim()) {
      setErrors(prev => ({ ...prev, founderName: 'Name is required' }));
      return;
    }

    if (!newFounder.shares || !validateFounderShares(newFounder.shares)) {
      return;
    }

    try {
      const shares = parseInt(newFounder.shares.replace(/,/g, ''), 10);
      if (!isNaN(shares)) {
        addFounder(newFounder.name, shares);
        setNewFounder({ name: '', shares: '' });
        // Clear any errors
        setErrors(prev => ({
          ...prev,
          founderName: undefined,
          founderShares: undefined
        }));
      }
    } catch (error) {
      console.error('Error adding founder:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to add founder. Please try again.'
      }));
    }
  }, [newFounder, addFounder]);

  // Handle updating founder
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

  // Handle adding or updating SAFE
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

  return (
    <div 
      id="equity-input" 
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Equity & Ownership</h2>
      
      {/* Founders Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          Founders
          <SimpleTooltip text="Add the founding team members and their initial share allocation. These shares represent ownership before any investment." />
        </h3>
        
        {/* Existing Founders Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {founders.map((founder) => (
                <tr key={founder.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="text"
                      value={founder.name}
                      onChange={(e) => handleUpdateFounder(founder.id, 'name', e.target.value)}
                      className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <input
                      type="text"
                      value={formatNumberInput(founder.shares.toString())}
                      onChange={(e) => handleUpdateFounder(founder.id, 'shares', e.target.value)}
                      className="w-full text-right border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => removeFounder(founder.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Remove founder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Add New Founder Row */}
              <tr className="bg-blue-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="text"
                    value={newFounder.name}
                    onChange={(e) => {
                      setNewFounder(prev => ({ ...prev, name: e.target.value }));
                      if (errors.founderName) {
                        setErrors(prev => ({ ...prev, founderName: undefined }));
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Founder name"
                    className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.founderName && (
                    <div className="text-xs text-red-500 mt-1">{errors.founderName}</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="relative">
                    <input
                      type="text"
                      value={newFounder.shares}
                      onChange={(e) => {
                        const formattedValue = formatNumberInput(e.target.value);
                        setNewFounder(prev => ({ ...prev, shares: formattedValue }));
                        if (formattedValue) validateFounderShares(formattedValue);
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="1,000,000"
                      className={`w-full text-right border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.founderShares ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.founderShares && (
                      <div className="text-xs text-red-500 mt-1">{errors.founderShares}</div>
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
      
      {/* SAFE Investment Section - ENHANCED WITH ADD-BACK FUNCTIONALITY */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          SAFE Investment
          <SimpleTooltip text="A SAFE (Simple Agreement for Future Equity) lets investors give you money now in exchange for equity in your next funding round. Example: $500K at $5M cap means they get equity based on whichever is better for them - the $5M cap or your next round's valuation." />
        </h3>
        
        {safe ? (
          /* Existing SAFE Display */
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-teal-900 mb-2 flex items-center">
                  {safe.name}
                  <SimpleTooltip text="This SAFE will convert to equity shares when you do your next funding round." />
                </h4>
                <p className="text-teal-700 text-sm mb-2">
                  <strong>Amount:</strong> {formatCurrency(safe.amount)}
                </p>
                <p className="text-teal-700 text-sm">
                  <strong>Valuation Cap:</strong> {formatCurrency(safe.valuationCap)}
                </p>
                <div className="mt-3 p-2 bg-teal-100 rounded text-xs text-teal-800">
                  💡 This converts to equity in your next funding round at the better of: ${safe.valuationCap.toLocaleString()} cap or the next round's valuation.
                </div>
              </div>
              <button
                onClick={() => {
                  setSafe(null);
                  // IMPORTANT: Reset the form when SAFE is deleted
                  setNewSafe({ name: '', amount: '', valuationCap: '' });
                  // Clear any errors
                  setErrors(prev => ({
                    ...prev,
                    safeName: undefined,
                    safeAmount: undefined,
                    safeValuation: undefined
                  }));
                }}
                className="text-teal-600 hover:text-red-600 transition-colors ml-4"
                title="Remove SAFE"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* SAFE Add Form - Always Available When No SAFE */
          <div className="border-2 border-dashed border-teal-200 rounded-lg p-6 bg-teal-50">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-medium text-teal-900">Add a SAFE Investment</h4>
              <p className="text-teal-700 text-sm mt-1">
                Get money now, give equity later in your next funding round
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SAFE Name
                  <SimpleTooltip text="Give your SAFE a name like 'Angel Round' or 'Pre-Seed SAFE'" />
                </label>
                <input
                  type="text"
                  value={newSafe.name}
                  onChange={(e) => {
                    setNewSafe(prev => ({ ...prev, name: e.target.value }));
                    if (errors.safeName) {
                      setErrors(prev => ({ ...prev, safeName: undefined }));
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Angel Round"
                />
                {errors.safeName && (
                  <p className="text-xs text-red-500 mt-1">{errors.safeName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Amount ($)
                    <SimpleTooltip text="How much money the investor is putting into your company" />
                  </label>
                  <input
                    type="text"
                    value={newSafe.amount}
                    onChange={(e) => handleNumberInput(e, 'amount')}
                    onFocus={() => setFocusedField('safe-amount')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="500,000"
                  />
                  {errors.safeAmount && (
                    <p className="text-xs text-red-500 mt-1">{errors.safeAmount}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valuation Cap ($)
                    <SimpleTooltip text="Maximum company value for conversion. Protects the investor if your company does really well." />
                  </label>
                  <input
                    type="text"
                    value={newSafe.valuationCap}
                    onChange={(e) => handleNumberInput(e, 'valuationCap')}
                    onFocus={() => setFocusedField('safe-valuation')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="5,000,000"
                  />
                  {errors.safeValuation && (
                    <p className="text-xs text-red-500 mt-1">{errors.safeValuation}</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddOrUpdateSafe}
                disabled={!newSafe.name || !newSafe.amount || !newSafe.valuationCap}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  !newSafe.name || !newSafe.amount || !newSafe.valuationCap
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                <PlusCircle size={18} className="inline mr-2" />
                Add SAFE Investment
              </button>
              
              {/* Educational Note */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>💡 How SAFEs work:</strong> You get ${newSafe.amount || 'money'} now. 
                  When you raise your next round, this converts to equity at whichever price is better for the investor:
                  the valuation cap (${newSafe.valuationCap || 'cap'}) or your next round's valuation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{errors.general}</p>
        </div>
      )}
    </div>
  );
};

export default EquityInput;