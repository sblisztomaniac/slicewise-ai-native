import { useCallback, useState, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Sparkles, CheckCircle, DollarSign, ArrowRight } from 'lucide-react';
import { useCapTable } from '../context/CapTableContext';

interface FounderInput {
  name: string;
  shares: string;
}

interface EquityInputProps {
  onNext?: () => void;
}

const EquityInputRedesigned: FC<EquityInputProps> = ({ onNext }) => {
  const {
    founders,
    safe,
    addFounder,
    updateFounder,
    removeFounder,
    setSafe
  } = useCapTable();

  const [showHelp, setShowHelp] = useState(false);
  const [newFounder, setNewFounder] = useState<FounderInput>({ name: '', shares: '' });

  const handleAddFounder = useCallback(() => {
    if (newFounder.name && newFounder.shares) {
      const shares = parseInt(newFounder.shares.replace(/,/g, ''), 10);
      if (!isNaN(shares)) {
        addFounder(newFounder.name, shares);
        setNewFounder({ name: '', shares: '' });
      }
    }
  }, [newFounder, addFounder]);

  const formatNumber = (num: number | string): string => {
    const number = typeof num === 'string' ? parseInt(num.replace(/,/g, '')) || 0 : num;
    return new Intl.NumberFormat().format(number);
  };

  const NovaAvatar = () => (
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
      <Sparkles className="w-6 h-6 text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex space-x-2">
              {['Define Ownership', 'Add Funding Round', 'View Results'].map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    idx === 0 ? 'bg-blue-600 text-white' : 
                    idx === 1 ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {idx === 0 ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  {idx < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="ml-auto bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              I'm ready, simulate my cap table →
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Story & Help */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-start space-x-4 mb-4">
                <NovaAvatar />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Nova</h3>
                  <p className="text-sm text-gray-600">Your equity copilot</p>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-blue-800 text-sm leading-relaxed">
                  🎯 <strong>Let's start simple:</strong> Who are the people building this company? 
                  I'll help you understand how ownership changes when you raise money.
                </p>
                
                <button 
                  onClick={() => setShowHelp(!showHelp)}
                  className="mt-3 text-blue-600 text-sm underline hover:text-blue-800"
                >
                  How does equity actually work? →
                </button>
              </div>

              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-xl border"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">Quick Equity 101</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Shares</strong> = pieces of your company pie</li>
                      <li>• <strong>%</strong> = your slice of that pie</li>
                      <li>• <strong>Funding</strong> = making the pie bigger (but your slice smaller)</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Your Company Today</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Founders</span>
                  <span className="font-semibold">{founders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Shares</span>
                  <span className="font-semibold">{formatNumber(founders.reduce((sum, f) => sum + f.shares, 0))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SAFE Investment</span>
                  <span className="font-semibold">{safe ? '$' + formatNumber(safe.amount) : 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Form */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Meet Your Founding Team</h2>
                    <p className="text-blue-100 text-sm">Enter the owners of your startup and current equity allocation</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Existing Founders */}
                <div className="space-y-4 mb-6">
                  {founders.map((founder, idx) => (
                    <motion.div
                      key={founder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Name</label>
                          <input
                            type="text"
                            value={founder.name}
                            onChange={(e) => {
                              updateFounder(founder.id, { name: e.target.value });
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1">Shares</label>
                          <input
                            type="text"
                            value={formatNumber(Number(founder.shares))}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              const numValue = parseInt(value, 10);
                              if (!isNaN(numValue)) {
                                updateFounder(founder.id, { shares: numValue });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeFounder(founder.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Add New Founder */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                  <div className="text-center mb-4">
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">Add another founder</h3>
                    <p className="text-gray-500 text-sm">Co-founders, technical founders, etc.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Founder name</label>
                      <input
                        type="text"
                        placeholder="e.g., Alex Chen"
                        value={newFounder.name}
                        onChange={(e) => setNewFounder((prev: FounderInput) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Shares</label>
                      <input
                        type="text"
                        placeholder="1,000,000"
                        value={newFounder.shares}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9,]/g, '');
                          setNewFounder((prev: FounderInput) => ({ ...prev, shares: value }));
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddFounder}
                    disabled={!newFounder.name || !newFounder.shares}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      newFounder.name && newFounder.shares
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Founder
                  </button>
                </div>

                {/* SAFE Section Preview */}
                {safe && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-6 h-6 text-teal-600" />
                        <h3 className="font-semibold text-teal-900">SAFE Investment Active</h3>
                      </div>
                      <button
                        onClick={() => setSafe(null)}
                        className="text-teal-600 hover:text-teal-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-teal-700 text-sm">
                      <strong>{safe.name}</strong>: ${formatNumber(safe.amount)} at ${formatNumber(safe.valuationCap)} valuation cap
                    </p>
                    <div className="mt-3 text-xs text-teal-600">
                      💡 This converts to equity in your next funding round
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {founders.length} founder{founders.length !== 1 ? 's' : ''} added
                  </div>
                  <button 
                    onClick={onNext}
                    disabled={!founders.length}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      founders.length 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Next: Add Investors</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquityInputRedesigned;