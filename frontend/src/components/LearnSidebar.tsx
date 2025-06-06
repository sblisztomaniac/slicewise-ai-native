import React, { useState, useEffect } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPercent } from '../utils/helpers';

const LearnSidebar: React.FC = () => {
  const { ownershipData, founders, safe } = useCapTable();
  const [isOpen, setIsOpen] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (ownershipData.length === 0) {
      setInsights(["Add founders and investment to see insights about your cap table."]);
      return;
    }

    const newInsights = [];

    // Basic ownership insight
    if (founders.length > 0) {
      const founderTotal = ownershipData
        .filter(owner => !owner.name.includes('Investor'))
        .reduce((acc, owner) => acc + owner.percentage, 0);
      
      newInsights.push(
        `Founders collectively own ${formatPercent(founderTotal)} of the company.`
      );
    }

    // SAFE investor insight
    if (safe && ownershipData.some(owner => owner.name === safe.name)) {
      const safeOwnership = ownershipData.find(owner => owner.name === safe.name)?.percentage || 0;
      newInsights.push(
        `Your SAFE investor will receive approximately ${formatPercent(safeOwnership)} ownership.`
      );

      // Dilution insight
      if (founders.length > 0 && safeOwnership > 0) {
        newInsights.push(
          `Each founder has been diluted by the SAFE investment. This is normal and part of raising capital.`
        );
      }
    }

    // Ownership balance insight
    if (founders.length > 1) {
      const founderOwnership = founders.map(founder => {
        const ownerData = ownershipData.find(owner => owner.name === founder.name);
        return ownerData ? { name: founder.name, percentage: ownerData.percentage } : null;
      }).filter(Boolean) as { name: string; percentage: number }[];
      
      // Only proceed with comparison if we have at least 2 founders with ownership data
      if (founderOwnership.length >= 2) {
        const sorted = [...founderOwnership].sort((a, b) => b.percentage - a.percentage);
        const diff = sorted[0].percentage - sorted[sorted.length - 1].percentage;
        
        if (diff > 20) {
          newInsights.push(
            `There's a significant ownership difference between founders. ${sorted[0].name} has ${formatPercent(diff)} more than ${sorted[sorted.length - 1].name}.`
          );
        } else if (diff < 5) {
          newInsights.push(
            `Founders have a balanced ownership structure with less than 5% difference between highest and lowest.`
          );
        }
      } else {
        newInsights.push(
          "Some founders don't have ownership data yet. Add ownership details to see balance insights."
        );
      }
    }
    
    // General insights
    if (founders.length > 0 && !safe) {
      newInsights.push(
        `Adding a SAFE investment will help you understand how funding affects ownership.`
      );
    }

    if (newInsights.length === 0) {
      newInsights.push("Keep building your cap table to see more insights.");
    }

    setInsights(newInsights);
  }, [ownershipData, founders, safe]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-1/4 w-72 bg-blue-50 border-l border-blue-100 h-auto shadow-lg rounded-l-lg overflow-hidden z-10"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center">
                <Lightbulb className="mr-2" />
                <h3 className="font-semibold">Learn As You Go</h3>
              </div>
            </div>
            
            <div className="p-4">
              <ul className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.li
                    key={index}
                    className="text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm border border-blue-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {insight}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/4 mt-16 bg-blue-600 text-white p-2 rounded-l-lg shadow-md z-20"
      >
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
      </button>
    </>
  );
};

export default LearnSidebar;