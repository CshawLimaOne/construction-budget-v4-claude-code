
import { AppState, RiskAnalysisResult, RiskFactor, DealGrade, RiskCalculationBreakdown } from '../types';
import { CONTINGENCY_ITEM_ID, BASE_RATE_SQFT, LOCATION_FACTORS, FINISH_FACTORS, FNF_UNDER_100K_TIERS, FNF_OVER_100K_TIERS, NC_SQFT_TIERS, NC_STATE_RATES, PricingTier, MARKET_WATCHLIST } from '../constants';

const getTierRate = (sqFt: number, tiers: PricingTier[]): number => {
    const matchedTier = tiers.find(tier => sqFt <= tier.maxSqFt);
    return matchedTier ? matchedTier.rate : tiers[tiers.length - 1].rate;
};

const determineBaseRate = (state: AppState): { rate: number; source: string; locationFactorOverride?: number; isOverridden?: boolean } => {
    const rehabType = state.selectedRehabType;
    const totalSqFt = parseFloat(state.asIsProjectedData.totalBuildingSqFeet.projected || '0');
    const stateAbbrev = state.propertyDetails.state?.toUpperCase();

    // Priority: Analyst Manual Override
    if (state.manualBaseRateOverride && state.manualBaseRateOverride > 0) {
        return {
            rate: state.manualBaseRateOverride,
            source: 'Analyst Manual Override',
            locationFactorOverride: 1.0, // Manual overrides are assumed to be localized
            isOverridden: true
        };
    }

    if (totalSqFt <= 0) {
        return { rate: 0, source: 'Waiting for SqFt', locationFactorOverride: undefined };
    }

    if (!rehabType) {
        return { rate: 0, source: 'Select Rehab Type', locationFactorOverride: undefined };
    }

    if (rehabType === 'New Construction') {
        // 1. Check State Specific History first
        if (stateAbbrev && NC_STATE_RATES[stateAbbrev]) {
            return {
                rate: NC_STATE_RATES[stateAbbrev],
                source: `${stateAbbrev} Historical Data`,
                locationFactorOverride: 1.0 // Historical data is already localized
            };
        }
        // 2. Fallback to NC National Tiers
        const tierRate = getTierRate(totalSqFt, NC_SQFT_TIERS);
        return {
            rate: tierRate,
            source: 'NC National Tiers',
            locationFactorOverride: undefined // Use standard location factor
        };
    } 
    
    // Fix & Flip Logic
    if (rehabType === 'Light-Cosmetic') {
        const initialRate = getTierRate(totalSqFt, FNF_UNDER_100K_TIERS);
        
        // Scope Creep Logic:
        // If the home is very large, a "Light" rehab might mathematically exceed $100k 
        // just due to surface area. Using the lower tier rate might under-budget.
        // Threshold: If raw calc > $125k, switch to the "Over 100k" rate table.
        const tentativeRawBudget = initialRate * totalSqFt;
        
        if (tentativeRawBudget > 125000) {
            const adjustedRate = getTierRate(totalSqFt, FNF_OVER_100K_TIERS);
            return {
                rate: adjustedRate,
                source: 'FnF >$100k Tiers (Large SqFt Adj)',
                locationFactorOverride: undefined
            };
        }

        return {
            rate: initialRate,
            source: 'FnF <$100k Tiers',
            locationFactorOverride: undefined
        };
    } 
    
    if (rehabType === 'Standard-Full' || rehabType === 'Heavy') {
        // Heavy or Standard-Full -> Use Over 100k Tiers
        const tierRate = getTierRate(totalSqFt, FNF_OVER_100K_TIERS);
        return {
            rate: tierRate,
            source: 'FnF >$100k Tiers',
            locationFactorOverride: undefined
        };
    }

    return { rate: 0, source: 'Unknown Type', locationFactorOverride: undefined };
};

export const calculateRiskScore = (state: AppState): RiskAnalysisResult => {
  let score = 0;
  const factors: RiskFactor[] = [];
  const { marketMetrics, propertyDetails } = state;

  // --- 0. Market Watchlist & Metric Analysis ---
  
  // Watchlist Logic
  const zip = propertyDetails.zip ? propertyDetails.zip.trim() : '';
  if (zip.length >= 3) {
      for (const [key, config] of Object.entries(MARKET_WATCHLIST)) {
          if (config.zips.some(prefix => zip.startsWith(prefix))) {
              score += 25; // Significant penalty
              factors.push({
                  id: `watchlist-${key}`,
                  message: `Property is in a Watchlist Area: ${config.riskLabel} (${key}).`,
                  severity: 'critical'
              });
          }
      }
  }

  // Market Metrics Logic
  if (marketMetrics) {
      // Delinquency Trigger
      if (marketMetrics.delinquency90Day > 5.0) {
          score += 20;
          factors.push({
              id: 'market-delinquency',
              message: `High Market Delinquency (>5%): Currently ${marketMetrics.delinquency90Day}%.`,
              severity: 'high'
          });
      }

      // Market Trend Trigger
      if (marketMetrics.priceTrend === 'Declining' || marketMetrics.priceTrend === 'Crash') {
          score += 30;
          factors.push({
              id: 'market-trend-declining',
              message: `Market Trend is ${marketMetrics.priceTrend}. Valuation risk is critical.`,
              severity: 'critical'
          });
      }

      // Inventory Trigger
      if (marketMetrics.avgDaysOnMarket > 120) {
          score += 10;
          factors.push({
              id: 'market-inventory-slow',
              message: `Slow Market: Avg Days on Market is ${marketMetrics.avgDaysOnMarket} days (>120).`,
              severity: 'medium'
          });
      }
  }

  // --- 1. Determine Factors for Smart Validator ---
  
  // A. Location Factor
  const stateAbbrev = state.propertyDetails.state?.toUpperCase() || 'DEFAULT';
  let locationFactor = LOCATION_FACTORS[stateAbbrev] || LOCATION_FACTORS['DEFAULT'];

  // B. Finish Factor
  const finishFactor = FINISH_FACTORS[state.selectedMaterialQuality] || 1.0; // Default to Stock if unknown

  // C. Last Mile Adjustments (Analyst Overrides)
  const adjustments = state.riskAdjustments || { ultraUrban: false, remoteRural: false, island: false, gatedHoa: false };
  let lastMileMultiplier = 1.0;
  if (adjustments.ultraUrban) lastMileMultiplier += 0.10;
  if (adjustments.remoteRural) lastMileMultiplier += 0.05;
  if (adjustments.island) lastMileMultiplier += 0.15;
  if (adjustments.gatedHoa) lastMileMultiplier += 0.03;

  // --- 2. Calculate Targets ---
  
  // Dynamic Base Rate Logic
  const { rate: baseRate, source: baseRateSource, locationFactorOverride, isOverridden } = determineBaseRate(state);
  
  if (locationFactorOverride !== undefined) {
      locationFactor = locationFactorOverride;
  }

  const targetPricePerSqFt = baseRate * locationFactor * finishFactor * lastMileMultiplier;
  const totalSqFt = parseFloat(state.asIsProjectedData.totalBuildingSqFeet.projected || '0');
  const totalBudget = state.scopeSummary.borrowerTotal;
  const actualCostPerSqFt = totalSqFt > 0 ? totalBudget / totalSqFt : 0;

  // Target Budget based on Smart Validator
  const targetTotalBudget = targetPricePerSqFt * totalSqFt;

  // --- 3. Validate Totals (Feasibility) ---

  if (totalSqFt > 0 && targetTotalBudget > 0) {
      // Rule: If Total Budget is > 15% BELOW Feasible Cost -> REJECT/CRITICAL
      if (totalBudget < (targetTotalBudget * 0.85)) {
          score += 40;
          factors.push({
              id: 'critical-underbudget',
              message: `Budget is >15% below feasible cost ($${targetPricePerSqFt.toFixed(2)}/sqft vs Actual $${actualCostPerSqFt.toFixed(2)}/sqft).`,
              severity: 'critical'
          });
      } else if (totalBudget < (targetTotalBudget * 0.95)) {
          score += 15;
          factors.push({
              id: 'warning-underbudget',
              message: `Budget is slightly below market feasibility target ($${targetPricePerSqFt.toFixed(2)}/sqft).`,
              severity: 'medium'
          });
      }
  }

  // --- 4. Category Specific Validation Rules (from provided data) ---

  const categoryTotals: Record<string, number> = {};
  state.budgetData.forEach(cat => {
      categoryTotals[cat.name] = cat.items.reduce((sum, item) => sum + item.budget, 0);
  });

  // Rule: Soft Costs > 15% -> "HIGH SOFT COSTS"
  const softCosts = categoryTotals['Soft Costs'] || 0;
  if (totalBudget > 0 && softCosts > (totalBudget * 0.15)) {
      score += 10;
      factors.push({
          id: 'high-soft-costs',
          message: 'Soft costs exceed 15% of total budget.',
          severity: 'medium',
          category: 'Soft Costs'
      });
  }

  const rehabType = state.selectedRehabType;

  // Only check structural components if NOT Light-Cosmetic
  if (rehabType !== 'Light-Cosmetic') {
      // Rule: Foundation < 8% -> "LOW: Check Labor"
      const foundation = categoryTotals['Foundation'] || 0;
      if (totalBudget > 0 && foundation < (totalBudget * 0.08)) {
          score += 15;
          factors.push({
              id: 'low-foundation',
              message: 'Foundation budget is < 8% of total. Check labor/scope.',
              severity: 'high',
              category: 'Foundation'
          });
      }

      // Rule: Structure < 17% -> "LOW: Missing Lumber?"
      const structure = categoryTotals['Structure'] || 0;
      if ((rehabType === 'New Construction' || rehabType === 'Heavy') && totalBudget > 0 && structure < (totalBudget * 0.17)) {
          score += 20;
          factors.push({
              id: 'low-structure',
              message: 'Structure/Framing budget is < 17%. Possible missing material costs.',
              severity: 'high',
              category: 'Structure'
          });
      }

      // Rule: Systems < 14% -> "LOW: Systems"
      const systems = categoryTotals['Systems'] || 0;
      if (totalBudget > 0 && systems < (totalBudget * 0.14)) {
          score += 10;
          factors.push({
              id: 'low-systems',
              message: 'MEP (Systems) budget is < 14% of total.',
              severity: 'medium',
              category: 'Systems'
          });
      }
  }

  // Rule: Finishes < 25% (if Custom Q3/Q2/Q1) -> "LOW for Custom"
  const finishes = (categoryTotals['Finishes'] || 0) + (categoryTotals['Flooring'] || 0) + (categoryTotals['Appliances'] || 0); // Grouping finish-heavy cats
  const isHighEnd = ['Q1', 'Q2', 'Q3'].includes(state.selectedMaterialQuality);
  if (isHighEnd && totalBudget > 0 && finishes < (totalBudget * 0.25)) {
      score += 15;
      factors.push({
          id: 'low-finishes',
          message: 'Finish budget is < 25% which is low for the selected Material Quality.',
          severity: 'medium',
          category: 'Finishes'
      });
  }

  // Rule: Contingency < 5% -> "CRITICAL: <5% CONTINGENCY"
  let contingencyAmount = 0;
  const isAuto = state.scopeSummary.isContingencyAutoCalculated;
  if (isAuto) {
      if ((state.scopeSummary.contingencyPercentage || 0) < 5) {
          score += 25;
          factors.push({
              id: 'critical-contingency',
              message: 'Contingency is set below 5%.',
              severity: 'critical',
              itemId: CONTINGENCY_ITEM_ID
          });
      }
  } else {
      state.budgetData.forEach(cat => {
          cat.items.forEach(item => {
              if (item.id === CONTINGENCY_ITEM_ID) {
                  contingencyAmount = item.budget;
              }
          });
      });
      if (totalBudget > 0 && (contingencyAmount / totalBudget) < 0.05) {
          score += 25;
          factors.push({
              id: 'critical-contingency-manual',
              message: 'Manual contingency is below 5% of total budget.',
              severity: 'critical',
              itemId: CONTINGENCY_ITEM_ID
          });
      }
  }

  // Cap score at 100
  score = Math.min(100, score);

  let level: RiskAnalysisResult['level'] = 'Low';
  if (score >= 75) level = 'Critical';
  else if (score >= 50) level = 'High';
  else if (score >= 25) level = 'Medium';

  return { 
      score, 
      factors, 
      level,
      targetBudget: targetTotalBudget,
      baseRatePerSqFt: targetPricePerSqFt,
      calculationBreakdown: {
          baseRate: baseRate,
          baseRateSource: baseRateSource,
          locationFactor,
          finishFactor,
          lastMileFactor: lastMileMultiplier,
          sqFt: totalSqFt,
          calculatedPpsf: targetPricePerSqFt,
          stateAbbrev,
          isOverridden: !!isOverridden
      }
  };
};

export const calculateDealGrade = (state: AppState): DealGrade => {
    const riskAnalysis = calculateRiskScore(state);
    const { feasibilityData, marketMetrics } = state;

    // 1. Financial Score (35% weight)
    // Inverse of risk score. High risk (100) = Low Financial Score (0).
    const financialScore = Math.max(0, 100 - riskAnalysis.score);

    // 2. Sponsorship Score (25% weight)
    let sponsorshipScore = 50; // Baseline
    if (feasibilityData?.isRepeatBorrower) sponsorshipScore += 20;
    // Removed specific closed loan check, relying on other factors now or assume neutral if not repeat borrower
    if (feasibilityData?.borrowerPerformance?.violationsLiens === 'None') sponsorshipScore += 15;
    sponsorshipScore = Math.min(100, sponsorshipScore);

    // 3. Market Score (20% weight) - Updated for Step 2
    let marketScore = 100; // Start at 100
    
    if (marketMetrics) {
        // Delinquency Penalty
        if (marketMetrics.delinquency90Day > 4.0) marketScore -= 25;
        else if (marketMetrics.delinquency90Day >= 2.0) marketScore -= 10;

        // Price Trend Penalty
        if (marketMetrics.priceTrend === 'Declining' || marketMetrics.priceTrend === 'Crash') marketScore -= 40;
        else if (marketMetrics.priceTrend === 'Softening') marketScore -= 15;

        // Saturation Penalty
        if (marketMetrics.monthsSupply > 6) marketScore -= 10;
    } else {
        // Fallback for missing data, using old location proxy as backup
        const stateAbbrev = state.propertyDetails.state?.toUpperCase() || 'DEFAULT';
        const locationFactor = LOCATION_FACTORS[stateAbbrev] || 1.0;
        if (locationFactor > 1.1) marketScore = 85; 
        else if (locationFactor < 0.9) marketScore = 60;
        else marketScore = 70;
    }
    
    marketScore = Math.min(100, Math.max(0, marketScore));

    // 4. Data Completeness (20% weight)
    let dataScore = 0;
    if (state.projectScopeStatement && state.projectScopeStatement.length > 50) dataScore += 25;
    
    if (feasibilityData?.requiredBeforeDraw?.plans) dataScore += 25;
    if (feasibilityData?.requiredBeforeDraw?.permits) dataScore += 25;
    
    const totalItems = state.budgetData.reduce((acc, cat) => acc + cat.items.filter(i => i.budget > 0).length, 0);
    if (totalItems > 10) dataScore += 25;
    dataScore = Math.min(100, dataScore);

    // Weighted Total
    const totalScore = (financialScore * 0.35) + (sponsorshipScore * 0.25) + (marketScore * 0.20) + (dataScore * 0.20);

    let grade: DealGrade['grade'] = 'F';
    if (totalScore >= 97) grade = 'A+';
    else if (totalScore >= 93) grade = 'A';
    else if (totalScore >= 85) grade = 'B+';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';
    else if (totalScore >= 60) grade = 'D';

    let summary = "Deal shows critical deficiencies.";
    if (totalScore >= 90) summary = "Excellent deal profile. Low risk.";
    else if (totalScore >= 80) summary = "Strong deal with minor observations.";
    else if (totalScore >= 70) summary = "Average deal. Requires standard underwriting.";
    else if (totalScore >= 60) summary = "Below average. Significant structuring required.";

    // --- Grade Capping Logic (Step 2) ---
    // If the market is declining, the grade cannot exceed 'C' (roughly B- equivalent in this scale)
    if (marketMetrics && (marketMetrics.priceTrend === 'Declining' || marketMetrics.priceTrend === 'Crash')) {
        const cappedGrades = ['A+', 'A', 'B+', 'B']; // Grades higher than C
        if (cappedGrades.includes(grade)) {
            grade = 'C';
            summary += " (Grade Capped due to Declining Market)";
        }
    }

    return {
        grade,
        numericalScore: Math.round(totalScore),
        breakdown: {
            financials: Math.round(financialScore),
            sponsorship: Math.round(sponsorshipScore),
            market: Math.round(marketScore),
            completeness: Math.round(dataScore)
        },
        summary
    };
};
