// frontend/src/types/capTable.ts

export interface Founder {
  id: string;
  name: string;
  shares: number;
}

export interface Safe {
  id: string;
  name: string;
  amount: number;
  valuationCap: number;
  shares?: number;
  ownershipPercentage?: number;
}

export interface OwnershipData {
  id: string;
  name: string;
  shares: number;
  ownership: number; // percentage of ownership
  type: 'founder' | 'safe' | 'esop' | 'investor' | 'other';
  color: string;
}

export type RoundType = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'series-e' | 'series-f' | 'series-g' | 'series-h' | 'other' | 'safe';

export type SafeType = 'cap-only' | 'discount-only' | 'cap-and-discount' | 'mfn';

export interface FundingRound {
  id: string;
  name: string;
  type: RoundType;
  amount: number;
  valuation: number;
  date: string;
  shares: number;
  ownershipPercentage: number;
  notes?: string;
  // SAFE-specific fields
  valuationCap?: number;
  discountRate?: number;
  safeType?: SafeType;
}

export type ExplanationStyle = '12yo' | 'mentor' | 'expert';

export interface CapTableSnapshot {
  timestamp: string;
  founders: Founder[];
  safe: Safe | null;
  fundingRounds: FundingRound[];
  totalShares: number;
  ownershipData: OwnershipData[];
}