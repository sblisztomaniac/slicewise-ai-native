import { Founder, Safe, OwnershipData } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatPercent = (percent: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percent / 100);
};

export const calculateSafeShares = (safe: Safe, preMoneySafeShares: number): number => {
  if (!safe || !safe.amount || !safe.valuationCap || preMoneySafeShares === 0) {
    return 0;
  }

  // Calculate price per share based on the valuation cap
  const pricePerShare = safe.valuationCap / preMoneySafeShares;
  
  // Calculate shares issued to the SAFE holder
  return safe.amount / pricePerShare;
};

export const calculateOwnership = (
  founders: Founder[],
  safe: Safe | null,
  colors: string[]
): { ownershipData: OwnershipData[]; totalShares: number } => {
  // Calculate total founder shares
  const totalFounderShares = founders.reduce((total, founder) => total + founder.shares, 0);
  
  // Calculate SAFE shares if applicable
  const safeShares = safe ? calculateSafeShares(safe, totalFounderShares) : 0;
  
  // Calculate total shares including SAFE
  const totalShares = totalFounderShares + safeShares;
  
  // Generate ownership data for visualization
  let ownershipData: OwnershipData[] = [];
  
  // Add founders to ownership data
  founders.forEach((founder, index) => {
    const percentage = totalShares > 0 ? (founder.shares / totalShares) * 100 : 0;
    ownershipData.push({
      name: founder.name,
      shares: founder.shares,
      percentage,
      color: colors[index % colors.length],
    });
  });
  
  // Add SAFE to ownership data if it exists
  if (safe && safeShares > 0) {
    const percentage = (safeShares / totalShares) * 100;
    ownershipData.push({
      name: safe.name,
      shares: safeShares,
      percentage,
      color: colors[founders.length % colors.length],
    });
  }
  
  return { ownershipData, totalShares };
};