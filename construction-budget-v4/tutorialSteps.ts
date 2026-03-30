
export const getTutorialSteps = (next: () => void, back: () => void, goTo: (step: number, tourStepId: string, selector?: string) => void) => [
  // --- CHAPTER 1: The Vision (Step 1) ---
  {
    id: 'welcome',
    title: 'Let\'s Build Your Budget! 🚀',
    text: 'Don\'t worry about getting every penny perfect right now. This tool helps you estimate costs so we can approve your loan faster. We\'ll guide you section by section.',
    buttons: [
      {
        classes: 'shepherd-button',
        text: 'Let\'s Go',
        action: next
      }
    ]
  },
  {
    id: 'property-canvas',
    attachTo: { element: '#property-address-section', on: 'bottom' },
    title: 'The Canvas',
    text: 'Start with the property you are buying. The <strong>Purchase Price</strong> helps us calculate your initial loan amount.',
    buttons: [
      { classes: 'shepherd-button-secondary', text: 'Back', action: back },
      { classes: 'shepherd-button', text: 'Next', action: next }
    ]
  },
  {
    id: 'as-is-projected',
    attachTo: { element: '#property-info-table-section', on: 'top' },
    title: 'Before & After',
    text: 'As-Is is what the house looks like today. Projected is your vision for the future.<br/><br/>Example: If you are adding a bedroom, the \'As-Is\' count might be 3, but \'Projected\' will be 4.',
    buttons: [
      { classes: 'shepherd-button-secondary', text: 'Back', action: back },
      { classes: 'shepherd-button', text: 'Next', action: next }
    ]
  },
  {
    id: 'scope-work',
    attachTo: { element: '#type-of-rehab-section', on: 'top' },
    title: 'Scope of Work',
    text: 'Are you doing a quick cosmetic cleanup or tearing down walls? This tells us how much risk is involved and helps us suggest a realistic budget.',
    buttons: [
      { classes: 'shepherd-button-secondary', text: 'Back', action: back },
      { 
        classes: 'shepherd-button', 
        text: 'Next: The Team', 
        action: () => goTo(2, 'contractor-info', '#gc-info-section')
      }
    ]
  },

  // --- CHAPTER 2: The Team (Step 2) ---
  {
    id: 'contractor-info',
    attachTo: { element: '#gc-info-section', on: 'bottom' },
    title: 'Who\'s Doing the Work?',
    text: 'If you are hiring a General Contractor, list them here. If you are managing it yourself, select <strong>Self-Managed</strong>.<br/><br/>Tip: Experienced teams get approved faster!',
    beforeShowPromise: () => new Promise(resolve => setTimeout(resolve, 500)), // Wait for transition
    buttons: [
      { 
          classes: 'shepherd-button-secondary', 
          text: 'Back', 
          action: () => goTo(1, 'scope-work', '#type-of-rehab-section')
      },
      { 
          classes: 'shepherd-button', 
          text: 'Next: The Numbers', 
          action: () => goTo(3, 'budget-grid', '#main-budget-table-container')
      }
    ]
  },

  // --- CHAPTER 3: The Numbers (Step 3) ---
  {
    id: 'budget-grid',
    attachTo: { element: '#main-budget-table-container', on: 'top' },
    title: 'The Budget Breakdown',
    text: 'This is where we list the costs. You don\'t need exact quotes yet—estimates are okay for the draft.',
    beforeShowPromise: () => new Promise(resolve => setTimeout(resolve, 500)),
    buttons: [
      { 
          classes: 'shepherd-button-secondary', 
          text: 'Back', 
          action: () => goTo(2, 'contractor-info', '#gc-info-section')
      },
      { classes: 'shepherd-button', text: 'Next', action: next }
    ]
  },
  {
    id: 'soft-costs',
    attachTo: { element: '#category-row-Soft-Costs', on: 'bottom' },
    title: 'The Invisible Costs',
    text: 'Don\'t forget the costs you can\'t "see". Permits, architectural plans, and utility connection fees go here.',
    buttons: [
      { classes: 'shepherd-button-secondary', text: 'Back', action: back },
      { classes: 'shepherd-button', text: 'Next', action: next }
    ]
  },
  {
    id: 'contingency',
    attachTo: { element: '#budget-item-row-fm3_contingency', on: 'top' },
    title: 'The Safety Net 🛡️',
    text: 'Construction rarely goes exactly to plan. We recommend keeping a 10% Contingency fund for unexpected surprises. It shows us you are prepared.',
    buttons: [
      { classes: 'shepherd-button-secondary', text: 'Back', action: back },
      { classes: 'shepherd-button', text: 'Next', action: next }
    ]
  },
  {
    id: 'ai-estimator',
    attachTo: { element: '#ai-estimator-button', on: 'bottom' },
    title: 'Need Help Estimating?',
    text: 'Stuck on numbers? Click here to use our AI Estimator. You can upload inspection photos, and we\'ll auto-suggest line items for you!',
    buttons: [
      { classes: 'shepherd-button-secondary', text: 'Back', action: back },
      { classes: 'shepherd-button', text: 'Finish Tour', action: next }
    ]
  }
];
