import React from 'react';
import { useCapTable } from '../context/CapTableContext';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatNumber, formatPercent } from '../utils/helpers';
import OwnershipChart from './OwnershipChart';
import { motion } from 'framer-motion';

const CapTable: React.FC = () => {
  const { ownershipData, totalShares } = useCapTable();

  if (ownershipData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
        <PieChartIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-500">No data to display</h3>
        <p className="text-gray-400">Add founders and investments to see your cap table</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 mb-8"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Cap Table</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Chart */}
        <div className="flex justify-center items-center">
          <OwnershipChart data={ownershipData} />
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-sm font-medium text-gray-700 tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 bg-gray-50 text-right text-sm font-medium text-gray-700 tracking-wider">
                  Shares
                </th>
                <th className="px-4 py-3 bg-gray-50 text-right text-sm font-medium text-gray-700 tracking-wider">
                  Ownership
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ownershipData.map((owner, index) => (
                <motion.tr 
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <td className="px-4 py-4 text-sm text-gray-900 flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: owner.color }}
                    ></span>
                    {owner.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {formatNumber(Math.round(owner.shares))}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {formatPercent(owner.ownership / 100)}  
                    </span>
                  </td>
                </motion.tr>
              ))}
              {/* Total row */}
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                  {formatNumber(totalShares)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default CapTable;