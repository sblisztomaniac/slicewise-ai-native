import React, { useState } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { RefreshCw, FileText, PlusCircle, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddFundingRound from './AddFundingRound.tsx';

interface ControlsProps {
  variant?: 'default' | 'compact';
}

const Controls: React.FC<ControlsProps> = ({ variant = 'default' }) => {
  const { clearTable, loadSampleData } = useCapTable();
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20"
              >
                <button
                  onClick={() => {
                    loadSampleData();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FileText size={16} className="mr-2" />
                  Load Sample Data
                </button>
                
                <button
                  onClick={() => {
                    setIsAddRoundOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Funding Round
                </button>
                
                <hr className="my-1 border-gray-200" />
                
                <button
                  onClick={() => {
                    clearTable();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Clear Table
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AddFundingRound 
          isOpen={isAddRoundOpen} 
          onClose={() => setIsAddRoundOpen(false)} 
        />
      </div>
    );
  }

  // Default variant (original layout)
  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={clearTable}
          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={18} className="mr-2" />
          Clear Table
        </button>
        <button
          onClick={loadSampleData}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FileText size={18} className="mr-2" />
          Load Sample Scenario
        </button>
      </motion.div>
      
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button
          onClick={() => setIsAddRoundOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          Add Funding Round
        </button>
      </motion.div>
      
      <AddFundingRound 
        isOpen={isAddRoundOpen} 
        onClose={() => setIsAddRoundOpen(false)} 
      />
    </div>
  );
};

export default Controls;