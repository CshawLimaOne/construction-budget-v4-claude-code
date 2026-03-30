
import { LOCATION_FACTORS } from '../constants';

export interface GuidanceResult {
  status: 'OK' | 'LOW_WARNING' | 'HIGH_WARNING';
  message?: string;
  benchmarkLow?: number;
  benchmarkHigh?: number;
}

// Mock Database of Cost Per SqFt averages for common line items
// These ranges assume a full replacement/installation scenario.
// Based on typical ~2000 sqft home.
const HISTORICAL_BENCHMARKS: Record<string, { low: number; high: number }> = {
  // Exterior
  'Roofing': { low: 3.50, high: 6.50 },
  'Siding': { low: 4.50, high: 8.50 },
  'Gutters': { low: 0.75, high: 1.50 },
  'Painting - Exterior': { low: 1.75, high: 3.75 },
  'Windows': { low: 2.50, high: 6.00 },
  'Decks': { low: 15.00, high: 35.00 }, // Higher cost per sqft of DECK area, but we approximate vs house sqft for rough check or skip

  // Systems
  'HVAC': { low: 3.00, high: 6.50 }, // Matches Rough HVAC
  'Plumbing': { low: 3.50, high: 7.00 },
  'Electrical': { low: 3.50, high: 7.00 },
  
  // Interior
  'Flooring': { low: 3.00, high: 7.00 },
  'Painting - Interior': { low: 2.00, high: 4.50 },
  'Drywall': { low: 2.00, high: 4.50 },
  'Insulation': { low: 1.25, high: 3.00 },
  
  // Finishes (Kitchen/Bath heavily skew these, using broad averages)
  'Cabinets': { low: 7.00, high: 18.00 }, 
  'Countertops': { low: 3.00, high: 8.00 },
  
  // Structural
  'Demolition': { low: 1.50, high: 4.00 },
  'Foundation': { low: 5.00, high: 12.00 },
  'Framing': { low: 6.00, high: 14.00 },
};

export const SUPPORTED_BENCHMARKS = Object.keys(HISTORICAL_BENCHMARKS);

export const checkBudgetLineItem = (
  itemName: string,
  amount: number,
  totalSqFt: number,
  state: string
): GuidanceResult => {
  if (!totalSqFt || totalSqFt <= 0) return { status: 'OK' };

  // Normalize item name for matching (remove *, lowercase)
  const normalizedItemName = itemName.replace('*', '').toLowerCase();

  // Find best benchmark match
  // We check keys to see if the item name contains the key (e.g. "Rough HVAC" contains "HVAC")
  const benchmarkKey = Object.keys(HISTORICAL_BENCHMARKS).find(k => 
    normalizedItemName.includes(k.toLowerCase())
  );

  if (!benchmarkKey) return { status: 'OK' };

  const benchmark = HISTORICAL_BENCHMARKS[benchmarkKey];
  const stateFactor = LOCATION_FACTORS[state?.toUpperCase()] || LOCATION_FACTORS['DEFAULT'];
  
  // Calculate expected range for the given home size
  const expectedLow = Math.round(benchmark.low * stateFactor * totalSqFt);
  const expectedHigh = Math.round(benchmark.high * stateFactor * totalSqFt);

  const result: GuidanceResult = {
      status: 'OK',
      benchmarkLow: expectedLow,
      benchmarkHigh: expectedHigh
  };

  // Only perform validation checks if amount is entered
  if (amount > 0) {
      // Thresholds for Demo Purposes
      // "Low Warning": If amount is < 50% of the expected low
      if (amount < expectedLow * 0.5) {
         result.status = 'LOW_WARNING';
         result.message = `Typical full replacement for ${benchmarkKey} in this area usually starts around $${expectedLow.toLocaleString()}. Is this a partial repair?`;
      }
      
      // "High Warning": If amount is > 150% of the expected high
      if (amount > expectedHigh * 1.5) {
          result.status = 'HIGH_WARNING';
          result.message = `This cost ($${amount.toLocaleString()}) is significantly higher than the local average ($${expectedHigh.toLocaleString()}). Double check your quote?`;
      }
  }

  return result;
};
