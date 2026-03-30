
import { AppState, ApplicationStrength } from '../types';

export const calculateApplicationStrength = (state: AppState): ApplicationStrength => {
  let score = 0;
  const breakdown = {
    basics: 0,
    team: 0,
    budget: 0,
    quality: 0,
    photos: 0,
  };

  // 1. The Basics (20 pts)
  // Property Address (street, city, state, zip) - 5 pts
  const { street, city, state: pState, zip } = state.propertyDetails;
  if (street && city && pState && zip && state.propertyDetails.purchasePrice) {
    breakdown.basics += 5;
  }

  // Step 1 Questions answered - 5 pts
  // Assuming 8 questions, full points if all non-empty
  const allQuestionsAnswered = state.projectQuestions.every(q => q.answer !== '');
  if (allQuestionsAnswered) {
    breakdown.basics += 5;
  }

  // Basic Project Details - 10 pts
  if (state.selectedCondition && state.selectedRehabType && state.selectedMaterialQuality) {
    breakdown.basics += 10;
  }

  score += breakdown.basics;

  // 2. The Team (15 pts)
  // Logic: If Rehab Type is Light or Standard, GC is not required. Auto-award points.
  const isGcExempt = state.selectedRehabType === 'Light-Cosmetic' || state.selectedRehabType === 'Standard-Full';

  if (isGcExempt) {
    breakdown.team = 15;
  } else {
    // GC Selection Made - 5 pts
    if (state.generalContractor.performerType) {
        if (state.generalContractor.performerType === 'Self-Managed') {
             breakdown.team += 5;
        } else if (state.generalContractor.businessName) {
             breakdown.team += 5;
        }
    }

    // GC Documents - 10 pts
    // Either docs uploaded OR onboarding form agreed OR self-managed
    if (state.generalContractor.performerType === 'Self-Managed') {
        breakdown.team += 10;
    } else {
        const hasGcDocs = !!(state.generalContractor.gcLicenseDoc || state.generalContractor.generalLiabilityDoc);
        const onboardingStarted = state.gcOnboardingData?.authorization?.agreedToTerms;
        
        if (hasGcDocs || onboardingStarted) {
            breakdown.team += 10;
        }
    }
  }

  score += breakdown.team;

  // 3. Budget Granularity (30 pts)
  // Count items with budget > 0
  let budgetItemCount = 0;
  let softCostsTotal = 0;
  let hasDescriptions = 0;
  let photoCount = 0;

  state.budgetData.forEach(cat => {
    // Photos count
    photoCount += (cat.categoryPhotos?.length || 0);

    // Items
    cat.items.forEach(item => {
      photoCount += (item.uploadedPhotos?.length || 0);

      if (item.budget > 0) {
        budgetItemCount++;
        if (cat.name === 'Soft Costs') {
          softCostsTotal += item.budget;
        }
        // Check for custom descriptions (quality metric)
        if (item.description && item.description.length > 5) {
            hasDescriptions++;
        }
      }
    });
  });

  if (budgetItemCount >= 5) breakdown.budget += 10;
  if (budgetItemCount >= 15) breakdown.budget += 10;
  if (softCostsTotal > 0) breakdown.budget += 10;

  score += breakdown.budget;

  // 4. Descriptive Quality (20 pts)
  // At least 3 line items have custom text description
  if (hasDescriptions >= 3) {
    breakdown.quality += 10;
  }
  // Scope of Work statement > 50 chars
  if (state.projectScopeStatement && state.projectScopeStatement.length > 50) {
    breakdown.quality += 10;
  }

  score += breakdown.quality;

  // 5. Visual Evidence (15 pts)
  if (photoCount >= 1) breakdown.photos += 5;
  if (photoCount >= 5) breakdown.photos += 10; // Total 15

  score += breakdown.photos;

  // Determine Level (Friendlier Labels)
  let level: ApplicationStrength['level'] = 'Getting Started';
  if (score >= 90) level = 'Ready to Submit';
  else if (score >= 70) level = 'Almost There';
  else if (score >= 40) level = 'In Progress';

  // Determine Next Best Action (Friendly, Why-based)
  let nextBestAction = "Review and Submit";
  let nextActionDescription = "You're all set! Review your information in Step 4 to finalize your application.";
  let actionTargetStep = 4;

  if (breakdown.basics < 20) {
    nextBestAction = "Start with the Basics";
    nextActionDescription = "📍 **Why?** Accurate property details help us instantly pull comparable sales and speed up your valuation.";
    actionTargetStep = 1;
  } else if (!isGcExempt && breakdown.team < 5) {
    // Only suggest GC actions if not exempt
    nextBestAction = "Add Construction Team";
    nextActionDescription = "👷 **Why?** Knowing who is doing the work builds confidence in the project's success.";
    actionTargetStep = 2;
  } else if (breakdown.budget < 20) {
    nextBestAction = "Break Down the Budget";
    nextActionDescription = "💰 **Why?** Detailed line items (instead of lump sums) reduce questions from analysts later.";
    actionTargetStep = 3;
  } else if (breakdown.quality < 10 && state.projectScopeStatement.length < 50) {
    nextBestAction = "Tell the Project Story";
    nextActionDescription = "📝 **Why?** A clear Scope of Work helps us understand your vision immediately.";
    actionTargetStep = 3;
  } else if (breakdown.photos < 15) {
    nextBestAction = "Upload Site Photos";
    nextActionDescription = "📸 **Boost Approval Speed:** Uploading photos helps our analysts visualize your project instantly.";
    actionTargetStep = 3;
  } else if (breakdown.quality < 20) {
    nextBestAction = "Add Item Descriptions";
    nextActionDescription = "✍️ **Why?** Specific notes (e.g., '1200sqft LVP flooring') show you've planned carefully.";
    actionTargetStep = 3;
  } else if (!isGcExempt && breakdown.team < 15) {
    // Only suggest GC docs if not exempt and not self-managed (if self-managed, team score is typically handled)
    if (state.generalContractor.performerType !== 'Self-Managed') {
        nextBestAction = "Verify Contractor";
        nextActionDescription = "✅ **Why?** Uploading a license or insurance now prevents delays during closing.";
        actionTargetStep = 2;
    }
  }

  return {
    score,
    level,
    nextBestAction,
    nextActionDescription,
    actionTargetStep,
    breakdown
  };
};
