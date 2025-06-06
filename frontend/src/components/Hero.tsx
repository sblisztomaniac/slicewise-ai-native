import React from 'react';
import { PieChart, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const scrollToCapTable = () => {
    const capTableElement = document.getElementById('equity-input');
    if (capTableElement) {
      capTableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <PieChart size={64} className="text-teal-400" />
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          SliceWise
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-blue-100 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          See what happens to your startup when you raise money.
        </motion.p>
        
        <motion.button
          className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          onClick={scrollToCapTable}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Start My Cap Table
        </motion.button>
        
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="bg-blue-800 bg-opacity-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-teal-400 mb-3">1</div>
            <h3 className="text-lg font-medium mb-2">Add Team Members</h3>
            <p className="text-blue-200">Enter founders and their share allocations.</p>
          </div>
          
          <div className="bg-blue-800 bg-opacity-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-teal-400 mb-3">2</div>
            <h3 className="text-lg font-medium mb-2">Simulate Funding</h3>
            <p className="text-blue-200">Add a SAFE investment or funding round.</p>
          </div>
          
          <div className="bg-blue-800 bg-opacity-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-teal-400 mb-3">3</div>
            <h3 className="text-lg font-medium mb-2">Learn What Changed</h3>
            <p className="text-blue-200">See real-time visuals and explanations.</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button 
            onClick={scrollToCapTable}
            className="text-blue-200 hover:text-white flex flex-col items-center transition-colors"
          >
            <span className="mb-2">Get Started</span>
            <ChevronDown className="animate-bounce" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Hero;