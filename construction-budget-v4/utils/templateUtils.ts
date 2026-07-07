import type { AppState, BudgetCategoryData, BudgetItem, BudgetTemplate } from '../types';
import { NC_SOFT_COST_ROWS } from '../constants';

// Templates (and budgets) can carry uploaded photos with real File objects,
// which aren't JSON-serializable - localStorage.setItem would silently drop
// them anyway. Strip them before persisting, same treatment App.tsx's own
// save effect already gives budgetData.
export function stripTemplatePhotos(budgetData: BudgetCategoryData[]): BudgetCategoryData[] {
  return budgetData.map((cat) => ({
    ...cat,
    categoryPhotos: [],
    items: cat.items.map((item) => ({ ...item, uploadedPhotos: [] })),
  }));
}

// Builds the budgetData a template produces, including the New Construction
// soft-cost injection - mirrors App.tsx's handleTemplateSelect so the two
// entry points (apply-in-session vs. create-new-budget-from-template) stay
// in sync. If this drifts, budgets created via My Budgets' "Use Template"
// would differ from ones created via the in-wizard Template Library.
export function buildBudgetDataFromTemplate(template: BudgetTemplate): BudgetCategoryData[] {
  const newBudgetData = JSON.parse(JSON.stringify(template.budgetData)) as BudgetCategoryData[];

  if (template.projectType === 'new_construction') {
    const softCostCategory = newBudgetData.find((c) => c.name === 'Soft Costs');
    if (softCostCategory) {
      const existingDrawItems = new Set(softCostCategory.items.map((i) => i.drawItem));
      let injectedCount = 0;
      NC_SOFT_COST_ROWS.forEach((row) => {
        if (!existingDrawItems.has(row.drawItem)) {
          const newItem: BudgetItem = {
            id: `tmpl-${row.id}-${Date.now()}`,
            itemNumber: row.itemNumber,
            drawItem: row.drawItem,
            description: '',
            budget: 0,
            actual: 0,
            isUncertain: false,
            isCustomDescription: false,
            uploadedPhotos: [],
          };
          softCostCategory.items.push(newItem);
          injectedCount++;
        }
      });
      if (injectedCount > 0) {
        softCostCategory.items.sort((a, b) => a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true }));
      }
    }
  }

  return newBudgetData;
}

// Applies a template onto a fresh AppState - used when creating a brand-new
// budget directly from a template (My Budgets' "Use This Template"), where
// there's no live App.tsx instance yet to drive individual setState calls.
export function applyTemplateToState(state: AppState, template: BudgetTemplate): AppState {
  return {
    ...state,
    budgetData: buildBudgetDataFromTemplate(template),
    projectScopeStatement: `Based on ${template.name} template: ${template.description}`,
    asIsProjectedData: {
      ...state.asIsProjectedData,
      totalBuildingSqFeet: { ...state.asIsProjectedData.totalBuildingSqFeet, projected: template.projectedSqFt.toString() },
      bedroomCount: { ...state.asIsProjectedData.bedroomCount, projected: template.projectedBeds.toString() },
      bathroomCount: { ...state.asIsProjectedData.bathroomCount, projected: template.projectedBaths.toString() },
      floorsAboveBasement: { ...state.asIsProjectedData.floorsAboveBasement, projected: template.projectedFloors.toString() },
    },
    selectedMaterialQuality: template.materialQuality || state.selectedMaterialQuality,
    projectTypeMode: template.projectType,
    selectedRehabType: template.rehabType,
    isStarted: true,
  };
}
