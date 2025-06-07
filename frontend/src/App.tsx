import React from 'react';
import { CapTableProvider } from './context/CapTableContext';
import Hero from './components/Hero';
import EquityInput from './components/EquityInput';
import CapTable from './components/CapTable';
import FundingRoundsList from './components/FundingRoundsList';
import AICopilot from './components/AICopilot';
import LearnSidebar from './components/LearnSidebar';
import Controls from './components/Controls';

function App() {
  return (
    <CapTableProvider>
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        {/* Hero Section */}
        <div className="flex-shrink-0">
          <Hero />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-8">
              <EquityInput />
              <div className="space-y-8">
                <CapTable />
                <FundingRoundsList />
                <AICopilot />
                <Controls />
              </div>
            </div>
          </div>
        </div>
        
        {/* Learning Sidebar */}
        <LearnSidebar />
      </div>
    </CapTableProvider>
  );
}

export default App;