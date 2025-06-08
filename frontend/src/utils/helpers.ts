import { Founder, Safe, OwnershipData, FundingRound } from '../types';

type ValidationOptions = {
  required?: boolean;
  min?: number;
  max?: number;
  isInteger?: boolean;
};

type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validateNumberInput = (
  value: string,
  options: ValidationOptions = {}
): ValidationResult => {
  const { required = true, min, max, isInteger = false } = options;
  
  // Check if value is empty
  if (!value.trim()) {
    return {
      isValid: !required,
      error: required ? 'This field is required' : undefined
    };
  }
  
  // Remove commas and check if it's a valid number
  const numericValue = value.replace(/,/g, '');
  const num = Number(numericValue);
  
  if (isNaN(num)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid number' 
    };
  }
  
  // Check if it should be an integer
  if (isInteger && !Number.isInteger(num)) {
    return { 
      isValid: false, 
      error: 'Must be a whole number' 
    };
  }
  
  // Check minimum value
  if (min !== undefined && num < min) {
    return { 
      isValid: false, 
      error: `Must be at least ${min.toLocaleString()}` 
    };
  }
  
  // Check maximum value
  if (max !== undefined && num > max) {
    return { 
      isValid: false, 
      error: `Must be less than ${max.toLocaleString()}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Format a numeric string with commas and optional decimal places
 */
export const formatNumberInput = (value: string): string => {
  // Remove all non-digit characters except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '');
  
  // If empty, return empty string
  if (!numericValue) return '';
  
  // If it's a decimal number, format the integer part
  if (numericValue.includes('.')) {
    const [integerPart, decimalPart] = numericValue.split('.');
    const formattedInteger = integerPart ? 
      parseInt(integerPart, 10).toLocaleString() : 
      '0';
    return `${formattedInteger}.${decimalPart || ''}`;
  }
  
  // For integers
  return parseInt(numericValue, 10).toLocaleString();
};

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

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
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
  fundingRounds: FundingRound[],
  colors: string[]
): { ownershipData: OwnershipData[]; totalShares: number } => {
  // Calculate total founder shares
  const totalFounderShares = founders.reduce((total, founder) => total + founder.shares, 0);
  
  // Calculate SAFE shares if applicable
  const safeShares = safe ? calculateSafeShares(safe, totalFounderShares) : 0;
  
  // Calculate total shares from funding rounds
  const totalRoundShares = fundingRounds.reduce((total, round) => total + round.shares, 0);
  
  // Calculate total shares including SAFE and funding rounds (pre-ESOP)
  const preEsopShares = totalFounderShares + safeShares + totalRoundShares;
  
  // Calculate ESOP pool (10% of post-ESOP total, which is 11.11% of pre-ESOP total)
  const esopPool = Math.round((preEsopShares / 9) * 1); // 10% of post-ESOP = 11.11% of pre-ESOP
  
  // Calculate total shares including ESOP
  const totalShares = preEsopShares + esopPool;
  
  // Generate ownership data for visualization
  let ownershipData: OwnershipData[] = [];
  
  // Add founders to ownership data
  founders.forEach((founder, index) => {
    const ownership = (founder.shares / totalShares) * 100;
    ownershipData.push({
      id: founder.id,
      name: founder.name,
      shares: founder.shares,
      ownership,
      type: 'founder',
      color: colors[index % colors.length],
    });
  });
  
  // Add SAFE to ownership data if it exists
  if (safe && safeShares > 0) {
    const safeOwnership = (safeShares / totalShares) * 100;
    ownershipData.push({
      id: safe.id,
      name: safe.name,
      shares: safeShares,
      ownership: safeOwnership,
      type: 'safe',
      color: '#6B7280', // Gray color for SAFE
    });
  }
  
  // Add funding rounds to ownership data
  fundingRounds.forEach((round, index) => {
    const roundOwnership = (round.shares / totalShares) * 100;
    ownershipData.push({
      id: round.id,
      name: `${round.name} (${round.type})`,
      shares: round.shares,
      ownership: roundOwnership,
      type: 'investor',
      color: `hsl(${(index * 137.508) % 360}, 70%, 60%)`, // Generate distinct colors
    });
  });
  
  // Add ESOP pool to ownership data
  if (esopPool > 0) {
    const esopOwnership = (esopPool / totalShares) * 100;
    ownershipData.push({
      id: 'esop-pool',
      name: 'ESOP Pool (10%)',
      shares: esopPool,
      ownership: esopOwnership,
      type: 'esop',
      color: '#F59E0B', // Amber color for ESOP
    });
  }
  
  return { ownershipData, totalShares };
};