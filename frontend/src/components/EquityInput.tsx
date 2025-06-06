import React, { useState } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { PlusCircle, Trash2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/helpers';

const EquityInput: React.FC = () => {
  const {
    founders,
    safe,
    addFounder,
    updateFounder,
    removeFounder,
    addSafe,
    updateSafe,
    removeSafe,
  } = useCapTable();

  const [newFounder, setNewFounder] = useState({ name: '', shares: '' });
  const [newSafe, setNewSafe] = useState({
    name: '',
    amount: '',
    valuationCap: '',
  });

  const handleAddFounder = () => {
    if (newFounder.name && newFounder.shares) {
      addFounder(newFounder.name, Number(newFounder.shares));
      setNewFounder({ name: '', shares: '' });
    }
  };

  const handleUpdateFounder = (id: string, field: 'name' | 'shares', value: string) => {
    const founderToUpdate = founders.find((f) => f.id === id);
    if (founderToUpdate) {
      updateFounder(
        id,
        field === 'name' ? value : founderToUpdate.name,
        field === 'shares' ? Number(value) : founderToUpdate.shares
      );
    }
  };

  const handleAddOrUpdateSafe = () => {
    if (newSafe.name && newSafe.amount && newSafe.valuationCap) {
      if (safe) {
        updateSafe(
          newSafe.name || safe.name,
          Number(newSafe.amount) || safe.amount,
          Number(newSafe.valuationCap) || safe.valuationCap
        );
      } else {
        addSafe(
          newSafe.name,
          Number(newSafe.amount),
          Number(newSafe.valuationCap)
        );
      }
      setNewSafe({ name: '', amount: '', valuationCap: '' });
    }
  };

  const TooltipIcon: React.FC<{ text: string }> = ({ text }) => (
    <span title={text} className="inline-flex items-center ml-1 text-blue-500 cursor-help">
      <HelpCircle size={16} />
    </span>
  );

  return (
    <motion.div 
      id="equity-input" 
      className="bg-white rounded-lg shadow-md p-6 mb-8"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Equity Input</h2>
      
      {/* Founders Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          Founders
        </h3>
        
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
                <motion.tr 
                  key={founder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="text"
                      value={founder.name}
                      onChange={(e) =>
                        handleUpdateFounder(founder.id, 'name', e.target.value)
                      }
                      className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <input
                      type="number"
                      min="0"
                      value={founder.shares}
                      onChange={(e) =>
                        handleUpdateFounder(founder.id, 'shares', e.target.value)
                      }
                      className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => removeFounder(founder.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <input
                    type="text"
                    placeholder="Founder name"
                    value={newFounder.name}
                    onChange={(e) =>
                      setNewFounder({ ...newFounder, name: e.target.value })
                    }
                    className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <input
                    type="number"
                    placeholder="Number of shares"
                    min="0"
                    value={newFounder.shares}
                    onChange={(e) =>
                      setNewFounder({ ...newFounder, shares: e.target.value })
                    }
                    className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <button
                    onClick={handleAddFounder}
                    disabled={!newFounder.name || !newFounder.shares}
                    className={`flex items-center justify-center rounded-full p-1 transition-colors ${
                      !newFounder.name || !newFounder.shares
                        ? 'text-gray-400'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    <PlusCircle size={18} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <button
          onClick={handleAddFounder}
          disabled={!newFounder.name || !newFounder.shares}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            !newFounder.name || !newFounder.shares
              ? 'bg-gray-200 text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <PlusCircle size={18} className="mr-2" />
          Add Founder
        </button>
      </div>
      
      {/* SAFE Investment Section */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
          SAFE Investment
          <TooltipIcon text="SAFE (Simple Agreement for Future Equity) is an agreement between an investor and a company that provides rights to the investor for future equity in the company." />
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
                onClick={removeSafe}
                className="text-red-600 hover:text-red-800 transition-colors"
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
              <input
                type="number"
                placeholder="e.g., 250000"
                min="0"
                value={newSafe.amount}
                onChange={(e) =>
                  setNewSafe({ ...newSafe, amount: e.target.value })
                }
                className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valuation Cap ($)
                <TooltipIcon text="The valuation cap sets the maximum company valuation at which the SAFE investor's money converts to equity." />
              </label>
              <input
                type="number"
                placeholder="e.g., 4000000"
                min="0"
                value={newSafe.valuationCap}
                onChange={(e) =>
                  setNewSafe({ ...newSafe, valuationCap: e.target.value })
                }
                className="w-full border-gray-200 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        {!safe && (
          <button
            onClick={handleAddOrUpdateSafe}
            disabled={!newSafe.name || !newSafe.amount || !newSafe.valuationCap}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              !newSafe.name || !newSafe.amount || !newSafe.valuationCap
                ? 'bg-gray-200 text-gray-400'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <PlusCircle size={18} className="mr-2" />
            Add SAFE Investment
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EquityInput;