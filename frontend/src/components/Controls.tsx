import React, { useState } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { RefreshCw, FileText, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AddFundingRound from './AddFundingRound.tsx';

const Controls: React.FC = () => {
  const { clearTable, loadSampleData } = useCapTable();
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);

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