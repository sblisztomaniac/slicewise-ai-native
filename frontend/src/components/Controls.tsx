import React from 'react';
import { useCapTable } from '../context/CapTableContext';
import { RefreshCw, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Controls: React.FC = () => {
  const { clearTable, loadSampleData } = useCapTable();

  return (
    <motion.div 
      className="mb-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4"
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
  );
};

export default Controls;