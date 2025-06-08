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

export type FundingRound = {
  id: string;
  name: string;
  type: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'series-e' | 'series-f' | 'series-g' | 'series-h' | 'other' | 'safe';
  amount: number;
  valuation: number;
  date: string;
  shares: number;
  ownershipPercentage: number;
  // SAFE-specific fields
  valuationCap?: number;
  discountRate?: number;
  safeType?: 'cap-only' | 'discount-only' | 'cap-and-discount' | 'mfn';
};

export type RoundType = FundingRound['type'];

export interface CapTableSnapshot {
  timestamp: string;
  founders: Founder[];
  safe: Safe | null;
  fundingRounds: FundingRound[];
  totalShares: number;
  ownershipData: OwnershipData[];
}