import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Founder, Safe, OwnershipData } from '../types';
import { generateId, calculateOwnership } from '../utils/helpers';

interface CapTableContextType {
  founders: Founder[];
  safe: Safe | null;
  ownershipData: OwnershipData[];
  addFounder: (name: string, shares: number) => void;
  updateFounder: (id: string, name: string, shares: number) => void;
  removeFounder: (id: string) => void;
  addSafe: (name: string, amount: number, valuationCap: number) => void;
  updateSafe: (name: string, amount: number, valuationCap: number) => void;
  removeSafe: () => void;
  clearTable: () => void;
  loadSampleData: () => void;
  totalShares: number;
}

const CapTableContext = createContext<CapTableContextType | undefined>(undefined);

// Predefined colors for the chart
const COLORS = [
  '#1E40AF', // Primary blue
  '#0D9488', // Teal
  '#F97316', // Orange
  '#4F46E5', // Indigo
  '#9333EA', // Purple
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#F59E0B', // Amber
];

export const CapTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [safe, setSafe] = useState<Safe | null>(null);
  const [ownershipData, setOwnershipData] = useState<OwnershipData[]>([]);
  const [totalShares, setTotalShares] = useState<number>(0);

  useEffect(() => {
    // Calculate ownership percentages whenever founders or SAFE changes
    updateOwnershipData();
  }, [founders, safe]);

  const updateOwnershipData = () => {
    const { ownershipData: newData, totalShares: newTotal } = calculateOwnership(founders, safe, COLORS);
    setOwnershipData(newData);
    setTotalShares(newTotal);
  };

  const addFounder = (name: string, shares: number) => {
    const newFounder: Founder = {
      id: generateId(),
      name,
      shares,
    };
    setFounders([...founders, newFounder]);
  };

  const updateFounder = (id: string, name: string, shares: number) => {
    setFounders(
      founders.map((founder) =>
        founder.id === id ? { ...founder, name, shares } : founder
      )
    );
  };

  const removeFounder = (id: string) => {
    setFounders(founders.filter((founder) => founder.id !== id));
  };

  const addSafe = (name: string, amount: number, valuationCap: number) => {
    setSafe({
      id: generateId(),
      name,
      amount,
      valuationCap,
    });
  };

  const updateSafe = (name: string, amount: number, valuationCap: number) => {
    if (safe) {
      setSafe({
        ...safe,
        name,
        amount,
        valuationCap,
      });
    } else {
      addSafe(name, amount, valuationCap);
    }
  };

  const removeSafe = () => {
    setSafe(null);
  };

  const clearTable = () => {
    setFounders([]);
    setSafe(null);
  };

  const loadSampleData = () => {
    // Clear existing data first
    clearTable();
    
    // Add 2 founders
    const founder1Id = generateId();
    const founder2Id = generateId();
    
    setFounders([
      {
        id: founder1Id,
        name: 'Founder 1 (CEO)',
        shares: 4500000, // 45%
      },
      {
        id: founder2Id,
        name: 'Founder 2 (CTO)',
        shares: 4500000, // 45%
      },
    ]);

    // Add SAFE (10% of company post-money)
    setSafe({
      id: generateId(),
      name: 'Angel Investor SAFE',
      amount: 500000, // $500k
      valuationCap: 5000000, // $5M cap
    });
    
    // Note: ESOP pool would be 10% (1,000,000 shares) but not allocated to any specific person
    // This would be part of the total shares calculation in the ownership model
  };

  return (
    <CapTableContext.Provider
      value={{
        founders,
        safe,
        ownershipData,
        addFounder,
        updateFounder,
        removeFounder,
        addSafe,
        updateSafe,
        removeSafe,
        clearTable,
        loadSampleData,
        totalShares,
      }}
    >
      {children}
    </CapTableContext.Provider>
  );
};

export const useCapTable = (): CapTableContextType => {
  const context = useContext(CapTableContext);
  if (context === undefined) {
    throw new Error('useCapTable must be used within a CapTableProvider');
  }
  return context;
};