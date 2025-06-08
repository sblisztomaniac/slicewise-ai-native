import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Founder, Safe, OwnershipData, FundingRound } from '../types';
import { generateId, calculateOwnership } from '../utils/helpers';

interface CapTableContextType {
  founders: Founder[];
  safe: Safe | null;
  ownershipData: OwnershipData[];
  totalShares: number;
  fundingRounds: FundingRound[];
  lastExplanation: string | null;
  addFounder: (name: string, shares: number) => void;
  updateFounder: (id: string, updates: Partial<Founder>) => void;
  removeFounder: (id: string) => void;
  setSafe: (newSafe: Safe | null) => void;
  clearTable: () => void;
  loadSampleData: () => void;
  addFundingRound: (round: Omit<FundingRound, 'id' | 'shares' | 'ownershipPercentage'>, explanationStyle?: '12yo' | 'mentor' | 'expert') => Promise<string>;
  removeFundingRound: (id: string) => void;
  explainRoundImpact: (round: FundingRound, style?: '12yo' | 'mentor' | 'expert') => Promise<string>;
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
  const [safe, _setSafe] = useState<Safe | null>(null);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [ownershipData, setOwnershipData] = useState<OwnershipData[]>([]);
  const [totalShares, setTotalShares] = useState<number>(0);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);
  
  // Update ownership data whenever founders, safe, or funding rounds change
  const updateOwnershipData = useCallback(() => {
    const { ownershipData: newOwnershipData, totalShares: newTotalShares } = 
      calculateOwnership(founders, safe, fundingRounds, COLORS);
    setOwnershipData(newOwnershipData);
    setTotalShares(newTotalShares);
  }, [founders, safe, fundingRounds]);

  // Recalculate ownership when dependencies change
  useEffect(() => {
    updateOwnershipData();
  }, [updateOwnershipData]);
  
  // Wrapped setSafe to ensure ownership data is updated when safe changes
  const setSafe = useCallback((newSafe: Safe | null) => {
    _setSafe(newSafe);
  }, []);

  const explainRoundImpact = useCallback(async (round: FundingRound, style: '12yo' | 'mentor' | 'expert' = 'mentor'): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        return "API key is missing. Please add VITE_OPENROUTER_API_KEY to your .env file.";
      }

      let styleInstruction = '';
      switch (style) {
        case '12yo':
          styleInstruction = 'Explain this like I\'m 12 years old. Use simple analogies and avoid financial jargon.';
          break;
        case 'mentor':
          styleInstruction = 'Explain this to a startup founder. Be clear and practical, with actionable insights.';
          break;
        case 'expert':
          styleInstruction = 'Provide a detailed financial analysis with precise calculations and industry benchmarks.';
          break;
      }

      const prompt = `You are a startup equity expert. ${styleInstruction}

New Round: ${round.name}
Amount: $${round.amount.toLocaleString()}
Valuation: $${round.valuation.toLocaleString()}
Shares Issued: ${round.shares.toLocaleString()}
Ownership: ${round.ownershipPercentage.toFixed(2)}%

Current Cap Table:
- Founders: ${founders.length} founders with ${founders.reduce((sum, f) => sum + f.shares, 0).toLocaleString()} shares
- SAFE: ${safe ? 'Yes' : 'No'}
- Previous Rounds: ${fundingRounds.length}
- Total Shares: ${totalShares.toLocaleString()}

Explain the dilution impact and what this means for existing shareholders.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/mixtral-8x7b-instruct",
          messages: [{
            role: "user",
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const explanation = data.choices?.[0]?.message?.content || "No explanation generated";
      setLastExplanation(explanation);
      return explanation;
    } catch (error) {
      console.error("Error generating explanation:", error);
      return "Sorry, I couldn't generate an explanation. Please try again later.";
    }
  }, [founders, fundingRounds.length, safe, totalShares]);

  const addFundingRound = useCallback(async (round: Omit<FundingRound, 'id' | 'shares' | 'ownershipPercentage'>, explanationStyle: '12yo' | 'mentor' | 'expert' = 'mentor'): Promise<string> => {
    try {
      // For the first round, use a default total shares if none exist
      const currentTotalShares = totalShares || 10000000; // Default 10M shares if no shares exist yet
      
      // Calculate shares based on post-money valuation
      const newShares = Math.round((round.amount / round.valuation) * currentTotalShares);
      const ownershipPercentage = (newShares / (currentTotalShares + newShares)) * 100;

      const newRound: FundingRound = {
        ...round,
        id: generateId(),
        shares: newShares,
        ownershipPercentage,
        date: round.date || new Date().toISOString(),
        // Include SAFE-specific fields if they exist
        ...(round.type === 'safe' && {
          valuationCap: (round as any).valuationCap,
          discountRate: (round as any).discountRate,
          safeType: (round as any).safeType || 'cap-only'
        })
      };

      // Add the round
      setFundingRounds(prevRounds => [...prevRounds, newRound]);

      // Trigger explanation with the selected style
      const explanation = await explainRoundImpact(newRound, explanationStyle);
      
      return explanation;
    } catch (error) {
      console.error("Error adding funding round:", error);
      throw error;
    }
  }, [totalShares, explainRoundImpact]);

  const addFounder = useCallback((name: string, shares: number) => {
    const newFounder: Founder = {
      id: generateId(),
      name,
      shares,
    };
    setFounders(prev => [...prev, newFounder]);
  }, []);

  const updateFounder = useCallback((id: string, updates: Partial<Founder>) => {
    setFounders(prev =>
      prev.map(founder =>
        founder.id === id ? { ...founder, ...updates } : founder
      )
    );
  }, []);

  const removeFounder = useCallback((id: string) => {
    setFounders(prev => prev.filter((founder) => founder.id !== id));
  }, []);

  const clearTable = useCallback(() => {
    setFounders([]);
    _setSafe(null);
    setFundingRounds([]);
    setLastExplanation(null);
  }, []);

  const loadSampleData = useCallback(() => {
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
    _setSafe({
      id: generateId(),
      name: 'Angel Investor SAFE',
      amount: 500000, // $500k
      valuationCap: 5000000, // $5M cap
    });
  }, [clearTable]);

  const removeFundingRound = useCallback((id: string) => {
    setFundingRounds(prevRounds => prevRounds.filter(round => round.id !== id));
  }, []);

  return (
    <CapTableContext.Provider
      value={{
        founders,
        safe,
        ownershipData,
        totalShares,
        fundingRounds,
        lastExplanation,
        addFounder,
        updateFounder,
        removeFounder,
        setSafe,
        clearTable,
        loadSampleData,
        addFundingRound,
        removeFundingRound,
        explainRoundImpact,
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