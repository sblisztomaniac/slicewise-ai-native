import { CapTableProvider } from './context/CapTableContext';
import WizardFlow from './components/WizardFlow';

function App() {
  return (
    <CapTableProvider>
      <WizardFlow />
    </CapTableProvider>
  );
}

export default App;