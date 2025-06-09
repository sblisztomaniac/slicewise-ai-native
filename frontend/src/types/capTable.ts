export type RoundType = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'safe' | 'other';

export type ExplanationStyle = '12yo' | 'mentor' | 'expert';

export interface FundingRound {
  id: string;
  name: string;
  type: RoundType;
  amount: number;
  valuation: number;
  date: string;
  notes?: string;
  // SAFE specific fields
  valuationCap?: number;
  discountRate?: number;
  safeType?: 'cap-only' | 'discount-only' | 'cap-and-discount';
  // Calculated fields
  shares?: number;
  ownershipPercentage?: number;
}

export interface Founder {
  id: string;
  name: string;
  shares: number;
  ownershipPercentage: number;
}

export interface OwnershipData {
  founders: Founder[];
  investors: Array<{
    id: string;
    name: string;
    shares: number;
    ownershipPercentage: number;
    roundId: string;
  }>;
  totalShares: number;
  fullyDilutedShares: number;
}

export interface CapTableState {
  founders: Founder[];
  fundingRounds: FundingRound[];
  ownershipData: OwnershipData;
  lastExplanation?: string;
  addFounder: (name: string, shares: number) => void;
  updateFounder: (id: string, updates: Partial<Founder>) => void;
  removeFounder: (id: string) => void;
  addFundingRound: (round: Omit<FundingRound, 'id' | 'shares' | 'ownershipPercentage'>, explanationStyle?: ExplanationStyle) => Promise<string>;
  removeFundingRound: (id: string) => void;
  updateFundingRound: (id: string, updates: Partial<FundingRound>) => void;
  clearTable: () => void;
  setSafe: (safe: FundingRound | null) => void;
  explainRoundImpact: (round: FundingRound, style: ExplanationStyle) => Promise<string>;
};

export interface FundingRound {
  id: string;
  name: string;
  type: RoundType;
  amount: number;
  valuation: number;
  date: string;
  notes?: string;
  // SAFE specific fields
  valuationCap?: number;
  discountRate?: number;
  safeType?: 'cap-only' | 'discount-only' | 'cap-and-discount';
  // Calculated fields
  shares?: number;
  ownershipPercentage?: number;
}

export interface Founder {
  id: string;
  name: string;
  shares: number;
  ownershipPercentage: number;
}

export interface OwnershipData {
  founders: Founder[];
  investors: Array<{
    id: string;
    name: string;
    shares: number;
    ownershipPercentage: number;
    roundId: string;
  }>;
  totalShares: number;
  fullyDilutedShares: number;
}

export interface CapTableState {
  founders: Founder[];
  fundingRounds: FundingRound[];
  ownershipData: OwnershipData;
  lastExplanation?: string;
  addFounder: (name: string, shares: number) => void;
  updateFounder: (id: string, updates: Partial<Founder>) => void;
  removeFounder: (id: string) => void;
  addFundingRound: (round: Omit<FundingRound, 'id' | 'shares' | 'ownershipPercentage'>, explanationStyle?: '12yo' | 'mentor' | 'expert') => Promise<string>;
  removeFundingRound: (id: string) => void;
  updateFundingRound: (id: string, updates: Partial<FundingRound>) => void;
  clearTable: () => void;
  setSafe: (safe: FundingRound | null) => void;
  explainRoundImpact: (round: FundingRound, style: '12yo' | 'mentor' | 'expert') => Promise<string>;
}
