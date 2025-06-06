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
  name: string;
  shares: number;
  percentage: number;
  color: string;
}