import React from 'react';
import { CapTableProvider } from './context/CapTableContext';
import Hero from './components/Hero';
import EquityInput from './components/EquityInput';
import CapTable from './components/CapTable';
import AICopilot from './components/AICopilot';
import LearnSidebar from './components/LearnSidebar';
import Controls from './components/Controls';

function App() {
  return (
    <CapTableProvider>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Hero Section */}
        <Hero />
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 relative">
          <div className="max-w-5xl mx-auto">
            <EquityInput />
            <CapTable />
            <AICopilot />
            <Controls />
          </div>
        </div>
        
        {/* Learning Sidebar */}
        <LearnSidebar />
      </div>
    </CapTableProvider>
  );
}

export default App;