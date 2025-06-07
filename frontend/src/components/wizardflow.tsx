import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users, DollarSign, PieChart, MessageSquare, Lightbulb, Play, RefreshCw, PlusCircle } from 'lucide-react';
import { useCapTable } from '../context/CapTableContext';
import EquityInput from './EquityInput';
import AddFundingRound from './AddFundingRound';
import FundingRoundsList from './FundingRoundsList';
import CapTable from './CapTable';
import AICopilot from './AICopilot';


interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isAccessible: boolean;
}

const WizardFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [showAICopilot, setShowAICopilot] = useState(false);
  const { founders, safe, fundingRounds, ownershipData, loadSampleData, clearTable } = useCapTable();

  // Define the steps - NOW ALL ARE ACCESSIBLE ANYTIME
  const steps: Step[] = [
    {
      id: 0,
      title: "Add Founders",
      description: "Start by adding your founding team and their initial equity allocation",
      icon: <Users className="w-5 h-5" />,
      component: <EquityInput />,
      isAccessible: true // Always accessible
    },
    {
      id: 1,
      title: "Simulate Funding",
      description: "Add SAFE investments or funding rounds to see their impact",
      icon: <DollarSign className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-900">Funding Simulation</h2>
              <button
                onClick={() => setIsAddRoundOpen(true)}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Funding Round
              </button>
            </div>
            
            {/* SAFE Investment Display - More Prominent */}
            {safe && (
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-teal-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-teal-900 mb-2">SAFE Investment Active</h3>
                    <p className="text-teal-700 text-sm mb-3">
                      <strong>{safe.name}</strong>: ${safe.amount.toLocaleString()} at ${safe.valuationCap.toLocaleString()} valuation cap
                    </p>
                    <div className="bg-teal-100 p-3 rounded border border-teal-300">
                      <p className="text-teal-800 text-sm">
                        💡 <strong>How SAFEs work:</strong> This investment will convert to equity shares in your next funding round. 
                        The conversion price is based on either the valuation cap (${safe.valuationCap.toLocaleString()}) or 
                        the next round's valuation - whichever gives the investor a better deal.
                      </p>
                      <button 
                        onClick={() => setShowAICopilot(true)}
                        className="text-teal-600 underline text-sm mt-2 hover:text-teal-800"
                      >
                        Ask AI: "How will my SAFE convert?" →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {(fundingRounds.length > 0) ? (
              <FundingRoundsList />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">No funding rounds yet</h3>
                <p className="text-gray-400 mb-4">Add a funding round to see how it affects ownership and dilution</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setIsAddRoundOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Add Your First Round
                  </button>
                  <button
                    onClick={() => setShowAICopilot(true)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <MessageSquare size={18} className="mr-2" />
                    Learn About Funding
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <AddFundingRound 
            isOpen={isAddRoundOpen} 
            onClose={() => setIsAddRoundOpen(false)} 
          />
        </div>
      ),
      isAccessible: true // Always accessible
    },
    {
      id: 2,
      title: "View Cap Table",
      description: "See your updated ownership structure and equity distribution",
      icon: <PieChart className="w-5 h-5" />,
      component: <CapTable />,
      isAccessible: true // Always accessible
    },
    {
      id: 3,
      title: "AI Copilot",
      description: "Get personalized explanations about your cap table and equity changes",
      icon: <MessageSquare className="w-5 h-5" />,
      component: <AICopilot />,
      isAccessible: true // Always accessible
    }
  ];

  // Auto-advance logic (but users can still jump around)
  useEffect(() => {
    if (currentStep === 0 && founders.length > 0) {
      const timer = setTimeout(() => {
        if (currentStep === 0) {
          setCurrentStep(1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [founders.length, currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = steps[currentStep];
  const hasData = founders.length > 0 || safe || fundingRounds.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Compact Header with Quick Actions */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SliceWise</h1>
                <p className="text-xs text-gray-500">Equity Simulation Playground</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Quick Actions - More Prominent */}
              <button
                onClick={loadSampleData}
                className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
              >
                <Play className="w-4 h-4 mr-1" />
                Try Example
              </button>
              
              {/* AI Copilot - Always Available */}
              <button
                onClick={() => setShowAICopilot(!showAICopilot)}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  showAICopilot 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                AI Help
              </button>


              <button
                onClick={clearTable}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </button>
            </div>
          </div>
          
          {/* Step Progress Indicator - All Sections Clickable */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-blue-100 text-blue-700'
                      : index < currentStep
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    index === currentStep
                      ? 'bg-blue-500 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </span>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium">{step.title}</div>
                  </div>
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-8 h-px mx-2 ${
                    index < currentStep ? 'bg-green-300' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {!hasData && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="text-blue-800 font-medium">
                  Welcome to SliceWise! Simulate how funding rounds and SAFEs affect your startup's ownership.
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Start by clicking "Try Example" to see how it works, or add your own founders below.
                </p>
              </div>
              <button
                onClick={() => setShowAICopilot(true)}
                className="text-blue-600 underline text-sm hover:text-blue-800"
              >
                How does this work? →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
                    <p className="text-gray-600">{currentStepData.description}</p>
                  </div>
                </div>
              </div>

              {currentStepData.component}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
                Section {currentStep + 1} of {steps.length}
              </div>
              
              {/* Quick Jump to Results */}
              {currentStep < 2 && hasData && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Jump to Results →
                </button>
              )}
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === steps.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Completed' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
            </button>
          </div>

          {/* Progress Summary */}
          {hasData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h3 className="text-sm font-medium text-blue-800 mb-2">Your Progress</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Founders:</span>
                  <span className="ml-2 font-medium">{founders.length}</span>
                </div>
                <div>
                  <span className="text-blue-600">SAFE:</span>
                  <span className="ml-2 font-medium">{safe ? `$${safe.amount.toLocaleString()}` : 'None'}</span>
                </div>
                <div>
                  <span className="text-blue-600">Funding Rounds:</span>
                  <span className="ml-2 font-medium">{fundingRounds.length}</span>
                </div>
                <div>
                  <span className="text-blue-600">Cap Table:</span>
                  <span className="ml-2 font-medium">{ownershipData.length > 0 ? 'Ready' : 'Pending'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Copilot Modal - Always Available */}
      <AnimatePresence>
        {showAICopilot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAICopilot(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium">AI Equity Copilot - Always Here to Help!</h3>
                <button
                  onClick={() => setShowAICopilot(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-0">
                <AICopilot />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Sidebar - On Demand */}
    </div>
  );
};

export default WizardFlow;