
import { Type } from "@google/genai";
import { AsIsProjectedData, BudgetCategoryData, ProjectQuestion, ScopeOfWorkSummary, SelectOption, PropertyDetails, AppState, GeneralContractor, GcOnboardingData, RiskAdjustments, FeasibilityData, MarketMetrics, WalkthroughState, LandDetails, BudgetTemplate } from './types';

export const INITIAL_PROPERTY_DETAILS: PropertyDetails = {
  street: '',
  city: '',
  state: '',
  zip: '',
  purchasePrice: '',
};

export const INITIAL_LAND_DETAILS: LandDetails = {
  lotSize: '',
  zoning: '',
  entitlementStatus: '',
};

export const MOCK_SAVED_GC_PROFILE: GeneralContractor & { savedDocs: Record<string, { name: string, expiry: string }> } = {
    performerType: 'General Contractor',
    businessName: "John's Custom Builds, LLC",
    website: "www.johnsbuilds.com",
    socialPages: "",
    buildzoomUrl: "https://www.buildzoom.com/contractor/johns-custom-builds",
    googleReviewsUrl: "",
    gcLicenseDoc: { file: new File([], "license_on_file"), name: "GC_License_2024.pdf" },
    driversLicenseDoc: { file: new File([], "dl_on_file"), name: "DL_Copy.pdf" },
    generalLiabilityDoc: { file: new File([], "gl_on_file"), name: "Gen_Liability_2024.pdf" },
    workersCompDoc: null,
    savedDocs: {
        gcLicenseDoc: { name: "GC_License_2024.pdf", expiry: "12/31/2025" },
        driversLicenseDoc: { name: "DL_Copy.pdf", expiry: "05/15/2028" },
        generalLiabilityDoc: { name: "Gen_Liability_Cert.pdf", expiry: "09/01/2025" }
    }
};

export const ENTITLEMENT_STATUS_OPTIONS: SelectOption[] = [
    { value: 'Raw Land', label: 'Raw Land' },
    { value: 'Platted', label: 'Platted' },
    { value: 'Shovel Ready', label: 'Shovel Ready' },
];

export const INITIAL_AS_IS_PROJECTED_DATA: AsIsProjectedData = {
  totalBuildingSqFeet: { label: 'Total Building Sq. Feet', asIs: '', projected: '' },
  floorsAboveBasement: { label: 'Floors Above Basement', asIs: '', projected: '' },
  bedroomCount: { label: 'Bedroom Count', asIs: '', projected: '' },
  bathroomCount: { label: 'Bathroom Count', asIs: '', projected: '' },
  unitCount: { label: 'Unit Count', asIs: '', projected: '' },
  bedroomCountPerUnit: { label: 'Bedroom Count Per Unit', asIs: [], projected: [] },
  bathroomCountPerUnit: { label: 'Bathroom Count Per Unit', asIs: [], projected: [] },
};

export const CONDITIONS_OF_PROPERTY: SelectOption[] = [
  { value: 'C-1', label: 'Nearly New (C-1)', description: 'House is brand new, has never been lived in, and everything is in perfect condition with no signs of wear', colorClass: 'bg-green-700' },
  { value: 'C-2', label: 'Excellent (C2)', description: 'House has been recently renovated/repaired, with no need for maintenance or updates, making it feel almost like new', colorClass: 'bg-green-500' },
  { value: 'C-3', label: 'Well Maintained (C3)', description: 'The house is well-maintained, with some minor wear, and a few components may have been recently updated or repaired', colorClass: 'bg-yellow-500' },
  { value: 'C-4', label: 'Worn but Adequate (C4)', description: 'The house is in decent shape, with minor signs of wear, and needs only small cosmetic fixes or maintenance on a few components', colorClass: 'bg-orange-500' },
  { value: 'C-5', label: 'Significant Repairs (C5)', description: 'The house needs some significant repairs or updates, but it is still functional and livable as a home', colorClass: 'bg-red-500' },
  { value: 'C-6', label: 'Uninhabitable (C6)', description: 'The house has serious issues that affect its safety or structure, and it requires major repairs to be made livable again', colorClass: 'bg-red-700' },
];

export const TYPES_OF_REHAB: SelectOption[] = [
  { value: 'Light-Cosmetic', label: 'Light- Cosmetic', description: 'Sheetrock stays - cosmetic in nature', colorClass: 'bg-green-400' },
  { value: 'Standard-Full', label: 'Standard- Full', description: 'Three outside walls and the foundation remain in place', colorClass: 'bg-teal-500' },
  { value: 'Heavy', label: 'Heavy', description: 'Removing of 2+ outside walls and/or foundation does not remain in place', colorClass: 'bg-yellow-400' },
  { value: 'New Construction', label: 'New Construction', description: 'Ground Up or Adding more than 100% of existing Sqft', colorClass: 'bg-orange-600' },
];

export const DRAW_SCHEDULE_OPTIONS = [
    { id: 'unassigned', label: 'Unassigned Items', description: 'Items not yet allocated to a draw' },
    { id: 'draw_1', label: 'Draw 1: Foundation & Site', description: 'Site prep, foundation, undergrounds' },
    { id: 'draw_2', label: 'Draw 2: Framing & Roughs', description: 'Framing, roofing, rough MEP' },
    { id: 'draw_3', label: 'Draw 3: Drywall & Exterior', description: 'Insulation, drywall hang/tape, exterior finish' },
    { id: 'draw_4', label: 'Draw 4: Finishes & Trim', description: 'Cabinets, flooring, painting, trim' },
    { id: 'draw_5', label: 'Draw 5: Final', description: 'Final MEP, appliances, punch list' },
];

export const MATERIAL_QUALITIES: SelectOption[] = [
  { value: 'Q1', label: 'Luxury (Q1)', description: 'High-end, custom-designed homes with exceptional materials and craftsmanship', colorClass: 'bg-purple-700' },
  { value: 'Q2', label: 'Custom (Q2)', description: 'Custom or upscale homes with high-quality materials, finishes, and design', colorClass: 'bg-purple-500' },
  { value: 'Q3', label: 'Upscale (Q3)', description: 'Well-built homes with stylish designs and upgraded features', colorClass: 'bg-blue-500' },
  { value: 'Q4', label: 'Standard (Q4)', description: 'Reliable homes with basic designs and some decorative touches', colorClass: 'bg-green-500' },
  { value: 'Q5', label: 'Functional (Q5)', description: 'Simple, affordable homes focused on practicality and meeting basic codes', colorClass: 'bg-yellow-500' },
  { value: 'Q6', label: 'Substandard (Q6)', description: 'Basic homes built cheaply, often lacking proper systems', colorClass: 'bg-red-500' },
];

// Specific items to hide for New Construction to "Remove the Fluff"
export const NC_HIDDEN_ITEM_NUMBERS = [
    '2000-2', // Trashout
    '2000-4', // HazMat
    '2000-5', // Mold
    '4000-6', // Slab Leveling
    '4000-7', // Basement wall repairs
    '4000-8', // CMU/Stemwall Repairs
    '4000-9', // Vapor Barrier (Crawl Space)
    '5000-7', // Wall/Roof Sheathing Repairs
    '6000-1', // Roofing* (As requested)
    '6000-2', // Flashing/Roof Repairs
    '6000-10', // Porch Repairs
    '6000-11', // Gutters/Gutter Repairs
    '8000-5', // Re-Surface Tubs
    '9000-6', // Cabinet Re-finishing
    '9000-8', // Shower Enclosures
    '10000-9' // Backer Board
];

// Specific items to hide for Renovation to "Remove the Fluff"
export const RENOVATION_HIDDEN_ITEM_NUMBERS = [
    '1000-7',  // Impact Fees
    '1000-10', // Temp Security / Privacy Fencing
    '2000-4',  // HazMat Testing & Abatement
    '4000-1',  // PreTreat
    '4000-2',  // Excavation & Backfill
    '4000-5',  // Slab (Form/Place/Finish)*
    '4000-6',  // Slab Leveling
    '4000-8',  // CMU/Stemwall Repairs
    '5000-3',  // Joist System
    '5000-8',  // House Wrap
    '7000-9',  // Fire Sprinklers Rough*
    '7000-10', // Fire Sprinklers Final
    '7000-11', // Gas Rough*
    '7000-12', // Gas Final
    '7000-18', // Low Voltage Rough
    '7000-19', // Low Voltage Final
    '12000-5', // Profit
    '12000-6', // Overhead
    '12000-7'  // GC/Builder Fees
];

// --- Smart Budget Validator Constants ---

// Deprecated in favor of dynamic calculation, but kept as absolute fallback
export const BASE_RATE_SQFT = 145.0;

export interface PricingTier {
  maxSqFt: number;
  rate: number;
}

export const FNF_UNDER_100K_TIERS: PricingTier[] = [
  { maxSqFt: 999, rate: 52.00 },
  { maxSqFt: 1199, rate: 47.00 },
  { maxSqFt: 1499, rate: 39.00 },
  { maxSqFt: 1749, rate: 35.00 },
  { maxSqFt: 1999, rate: 32.00 },
  { maxSqFt: 2499, rate: 26.00 },
  { maxSqFt: 2999, rate: 23.00 },
  { maxSqFt: 3499, rate: 19.00 },
  { maxSqFt: Infinity, rate: 16.00 },
];

export const FNF_OVER_100K_TIERS: PricingTier[] = [
  { maxSqFt: 1199, rate: 137.00 },
  { maxSqFt: 1499, rate: 110.00 },
  { maxSqFt: 1749, rate: 95.00 },
  { maxSqFt: 1999, rate: 86.00 },
  { maxSqFt: 2499, rate: 84.00 },
  { maxSqFt: 2999, rate: 87.00 },
  { maxSqFt: 3499, rate: 80.00 },
  { maxSqFt: 4499, rate: 103.00 },
  { maxSqFt: Infinity, rate: 80.00 },
];

export const NC_SQFT_TIERS: PricingTier[] = [
  { maxSqFt: 1199, rate: 226.00 },
  { maxSqFt: 1499, rate: 173.00 },
  { maxSqFt: 1749, rate: 146.00 },
  { maxSqFt: 1999, rate: 154.00 },
  { maxSqFt: 2499, rate: 152.00 },
  { maxSqFt: 2999, rate: 177.00 },
  { maxSqFt: 3499, rate: 210.00 },
  { maxSqFt: 4499, rate: 281.00 },
  { maxSqFt: Infinity, rate: 249.00 },
];

export const NC_STATE_RATES: Record<string, number> = {
  'AL': 123, 'AZ': 185, 'CA': 347, 'CO': 207, 'FL': 162,
  'GA': 142, 'HI': 432, 'ID': 205, 'IL': 225, 'IN': 127,
  'MI': 164, 'MT': 207, 'NC': 140, 'NV': 213, 'OR': 219,
  'SC': 132, 'TN': 225, 'TX': 126, 'UT': 411, 'VA': 217,
  'WA': 169
};

export const INITIAL_RISK_ADJUSTMENTS: RiskAdjustments = {
  ultraUrban: false,
  remoteRural: false,
  island: false,
  gatedHoa: false,
};

export const INITIAL_FEASIBILITY_DATA: FeasibilityData = {
  borrowerName: '',
  loanNumber: '',
  approvalDate: new Date().toISOString().split('T')[0],
  strategicAccount: false,
  isRepeatBorrower: false, // Default to new
  tierReviewed: '1',
  processedBy: '',
  approvedBy: '',
  recommendation: '',
  conditions: [],
  requiredBeforeDraw: {
    plans: false,
    permits: false,
    other: false,
    otherDescription: '',
  },
  mitigatingFactors: '',
  approvalDates: {
    permit: '',
    plans: '',
  },
  hoa: {
    required: false,
    approved: false,
  },
  borrowerPerformance: {
    buildTimeDays: '',
    avgDaysBetweenDraws: '',
    projectsReviewOutcome: 'Pass',
    violationsLiens: 'None',
    budgetRevisions: 'None',
  },
  cmNotes: {
    adjustmentsToBudget: false,
    gcReviewCompleted: false,
    gcApproved: false,
    sqftVerified: false,
  },
  developmentInfo: {
    isPartOfLargerDevelopment: false,
    totalPhases: '',
    plannedHomesites: '',
    soldOrUnderContract: '',
  },
  budgetNotes: {
    desktopReview: 'Pending',
    sowMatchBudget: 'Yes',
    roomCountChange: 'No',
    sqftChange: 'No',
    plansProvided: 'No',
    permitsProvided: 'No',
    sqftVerified: 'Pending',
    inspection: 'Pending',
  },
  pamNotes: '',
  referenceLoanNumbers: '',
  avgDaysBetweenDraws: '',
};

export const MARKET_WATCHLIST = {
  // Florida West Coast (Broad range example)
  'FL-West': { 
    zips: ['339', '341', '342'], 
    riskLabel: 'Declining Coastal Market',
    trend: 'Declining',
    adjustment: 1.15 // Increase risk score by 15%
  },
  // Austin, TX (Example of softening market)
  'TX-Austin': {
    zips: ['787'],
    riskLabel: 'Market Softening / Oversupply',
    trend: 'Softening',
    adjustment: 1.05
  },
  'CA-Inland': {
      zips: ['923', '924', '925'],
      riskLabel: 'High Delinquency Zone',
      trend: 'Softening',
      adjustment: 1.10
  }
} as const;

export const INITIAL_MARKET_METRICS: MarketMetrics = {
  zipCode: '',
  delinquency90Day: 1.5, // National average baseline
  priceTrend: 'Stable',
  monthsSupply: 3.0,
  avgDaysOnMarket: 45,
  femaDisasterZone: false,
};

export const CONDITION_OPTIONS = [
  'GC Approval',
  'Structural Report',
  'Documents',
  'Permits/Plans',
  'Appraisal Review',
  'CRC Approval',
  'Other'
];

export const LAST_MILE_OPTIONS = [
  { key: 'ultraUrban', label: 'Ultra-Urban (Downtown Infill)', adjustment: 0.10, reason: 'No parking for crews, difficult deliveries, tight site.' },
  { key: 'remoteRural', label: 'Remote Rural (>45 min from city)', adjustment: 0.05, reason: '"Windshield time" (Subcontractors charge for travel).' },
  { key: 'island', label: 'Island / Barrier Island', adjustment: 0.15, reason: 'Barge/Bridge fees, salt-air material upgrades (stainless).' },
  { key: 'gatedHoa', label: 'Gated / High-End HOA', adjustment: 0.03, reason: 'Strict work hours (no weekends), strict clean-up rules.' },
];

// Factors derived from Material Quality
export const FINISH_FACTORS: Record<string, number> = {
  'Q1': 1.75, // Luxury -> Superior
  'Q2': 1.3,  // Custom
  'Q3': 1.3,  // Upscale -> Custom
  'Q4': 1.0,  // Standard -> Stock
  'Q5': 0.9,  // Functional -> Builder
  'Q6': 0.9,  // Substandard -> Builder
};

// Factors derived from State (Simplified mapping from Reference Database)
export const LOCATION_FACTORS: Record<string, number> = {
  'AL': 0.88, 'AR': 0.84, 'AZ': 1.02, 'CA': 1.45, 'CO': 1.08,
  'CT': 1.18, 'DC': 1.15, 'FL': 1.08, 'GA': 0.98, 'HI': 1.50,
  'IL': 1.15, 'IN': 0.98, 'KY': 0.92, 'LA': 0.92, 'MA': 1.32,
  'MD': 1.06, 'MI': 1.05, 'MN': 1.12, 'MO': 1.02, 'MS': 0.84,
  'NC': 0.93, 'NJ': 1.20, 'NV': 1.08, 'NY': 1.35, 'OH': 1.01,
  'OR': 1.15, 'PA': 1.12, 'SC': 0.95, 'TN': 0.96, 'TX': 0.95,
  'UT': 1.01, 'VA': 1.02, 'WA': 1.15, 'WI': 1.06,
  'DEFAULT': 1.0
};

// --- Walkthrough Mode Database ---
// Estimated costs per unit based on Quality Tiers (Q1=Luxury ... Q6=Substandard)
// Costs are approximate "replace" values for a typical flip.
// "Room" keys added for per-room walkthrough items.
export const COST_DB: Record<string, Record<string, number>> = {
  'Kitchen_Cabinets': { 'Q1': 25000, 'Q2': 15000, 'Q3': 8500, 'Q4': 5500, 'Q5': 3500, 'Q6': 2000 },
  'Kitchen_Countertops': { 'Q1': 12000, 'Q2': 8000, 'Q3': 4500, 'Q4': 3000, 'Q5': 1500, 'Q6': 800 },
  'Kitchen_Faucet': { 'Q1': 1500, 'Q2': 800, 'Q3': 450, 'Q4': 250, 'Q5': 150, 'Q6': 80 },
  'Kitchen_Appliances': { 'Q1': 15000, 'Q2': 9000, 'Q3': 5500, 'Q4': 3500, 'Q5': 2000, 'Q6': 1200 },
  'Flooring_LVP': { 'Q1': 15000, 'Q2': 11000, 'Q3': 8000, 'Q4': 5500, 'Q5': 3500, 'Q6': 2000 }, // Whole House
  'Flooring_Room': { 'Q1': 2000, 'Q2': 1500, 'Q3': 1000, 'Q4': 600, 'Q5': 400, 'Q6': 300 }, // Per Room (e.g. Bed/Bath)
  'Lighting_Fixtures': { 'Q1': 8000, 'Q2': 5000, 'Q3': 3000, 'Q4': 1800, 'Q5': 1000, 'Q6': 500 }, // Whole House
  'Lighting_Room': { 'Q1': 1000, 'Q2': 600, 'Q3': 400, 'Q4': 250, 'Q5': 150, 'Q6': 80 }, // Per Room
  'Paint_Interior': { 'Q1': 15000, 'Q2': 12000, 'Q3': 8000, 'Q4': 6000, 'Q5': 4000, 'Q6': 2500 }, // Whole House
  'Paint_Room': { 'Q1': 1500, 'Q2': 1200, 'Q3': 800, 'Q4': 500, 'Q5': 350, 'Q6': 250 }, // Per Room
  'Bath_Vanity': { 'Q1': 5000, 'Q2': 3500, 'Q3': 2000, 'Q4': 1200, 'Q5': 800, 'Q6': 400 },
  'Bath_Toilet': { 'Q1': 1200, 'Q2': 800, 'Q3': 500, 'Q4': 350, 'Q5': 200, 'Q6': 150 },
  'Bath_TubShower': { 'Q1': 8000, 'Q2': 5000, 'Q3': 3500, 'Q4': 2000, 'Q5': 1200, 'Q6': 600 },
  'Bath_Tile': { 'Q1': 6000, 'Q2': 4000, 'Q3': 2500, 'Q4': 1500, 'Q5': 800, 'Q6': 400 },
  'Bath_Hardware': { 'Q1': 1000, 'Q2': 600, 'Q3': 350, 'Q4': 200, 'Q5': 100, 'Q6': 50 },
  'Doors_Interior': { 'Q1': 5000, 'Q2': 3500, 'Q3': 2200, 'Q4': 1500, 'Q5': 1000, 'Q6': 500 },
  'Trim_Baseboards': { 'Q1': 4000, 'Q2': 3000, 'Q3': 2000, 'Q4': 1200, 'Q5': 800, 'Q6': 400 },
  'Windows_General': { 'Q1': 25000, 'Q2': 18000, 'Q3': 12000, 'Q4': 8000, 'Q5': 5000, 'Q6': 2500 },
  'Ext_Roof': { 'Q1': 20000, 'Q2': 15000, 'Q3': 10000, 'Q4': 7500, 'Q5': 5500, 'Q6': 3500 },
  'Ext_Siding': { 'Q1': 25000, 'Q2': 18000, 'Q3': 12000, 'Q4': 9000, 'Q5': 6000, 'Q6': 3000 },
  'Ext_Paint': { 'Q1': 10000, 'Q2': 7500, 'Q3': 5000, 'Q4': 3500, 'Q5': 2500, 'Q6': 1500 },
  'Ext_Landscape': { 'Q1': 15000, 'Q2': 10000, 'Q3': 6000, 'Q4': 4000, 'Q5': 2000, 'Q6': 1000 },
  'Ext_Concrete': { 'Q1': 12000, 'Q2': 9000, 'Q3': 6000, 'Q4': 4000, 'Q5': 2500, 'Q6': 1500 },
  'Ext_Deck': { 'Q1': 15000, 'Q2': 10000, 'Q3': 6500, 'Q4': 4000, 'Q5': 2500, 'Q6': 1500 },
  'Sys_HVAC': { 'Q1': 18000, 'Q2': 14000, 'Q3': 10000, 'Q4': 7500, 'Q5': 5500, 'Q6': 4000 },
  'Sys_WaterHeater': { 'Q1': 4000, 'Q2': 2500, 'Q3': 1500, 'Q4': 1000, 'Q5': 700, 'Q6': 500 },
  'Sys_Panel': { 'Q1': 5000, 'Q2': 3500, 'Q3': 2500, 'Q4': 1800, 'Q5': 1200, 'Q6': 800 },
};

// Unit Costs for Client-Side Math (Cost per SqFt / Unit)
export const UNIT_COST_DB: Record<string, Record<string, number>> = {
    'Flooring_LVP': { 'Q1': 12.00, 'Q2': 9.50, 'Q3': 6.50, 'Q4': 4.50, 'Q5': 3.00, 'Q6': 2.00 },
    'Paint_Interior': { 'Q1': 5.00, 'Q2': 4.00, 'Q3': 3.00, 'Q4': 2.50, 'Q5': 2.00, 'Q6': 1.50 },
    'Ext_Siding': { 'Q1': 12.00, 'Q2': 9.00, 'Q3': 7.00, 'Q4': 5.50, 'Q5': 4.00, 'Q6': 3.00 },
    'Ext_Roof': { 'Q1': 8.00, 'Q2': 6.50, 'Q3': 5.00, 'Q4': 4.00, 'Q5': 3.50, 'Q6': 3.00 },
    'Ext_Concrete': { 'Q1': 15.00, 'Q2': 12.00, 'Q3': 9.00, 'Q4': 7.00, 'Q5': 6.00, 'Q6': 5.00 },
    'Ext_Paint': { 'Q1': 4.00, 'Q2': 3.50, 'Q3': 2.50, 'Q4': 2.00, 'Q5': 1.75, 'Q6': 1.50 },
    'Bath_Tile': { 'Q1': 25.00, 'Q2': 18.00, 'Q3': 12.00, 'Q4': 8.00, 'Q5': 5.00, 'Q6': 3.00 },
};

// Mock Historical Data for Smart Suggestions
export const MOCK_HISTORICAL_DATA: Record<string, { price: number, label: string }> = {
    'Kitchen_Cabinets': { price: 4200, label: 'Standard Shaker (123 Main St)' },
    'Flooring_LVP': { price: 2800, label: 'Luxury Vinyl (123 Main St)' },
    'Paint_Interior': { price: 3200, label: 'Sherwin Williams (456 Oak St)' },
};

export const INITIAL_WALKTHROUGH_STATE: WalkthroughState = {
  isActive: false,
  currentRoomId: null,
  roomsCompleted: [],
  customRooms: [], // Initialize customRooms
  items: {}, 
};

export const WALKTHROUGH_AUDIO_SCHEMA = {
  type: "OBJECT",
  properties: {
    action: { type: "STRING", description: "The action to take: 'Replace', 'Repair', or 'Keep'." },
    description: { type: "STRING", description: "Detailed notes about the condition and work needed." },
    costEstimate: { type: "NUMBER", description: "Estimated cost if mentioned or implied. If unsure, return 0." }
  },
  required: ["action", "description"]
};

export const WALKTHROUGH_AUDIO_INSTRUCTION = `
You are a construction estimator assistant processing voice notes from a site walkthrough.
Analyze the audio and extract the scope of work.
If the user says "Trash it", "Gut it", "New one", "Replace", map to 'Replace'.
If the user says "Fix", "Patch", "Paint", "Repair", map to 'Repair'.
If the user mentions specific quantities (e.g. "300 sqft"), include that in the description.
Use the context of the room and item provided to ensure relevance.
`;

// Logic Trigger Map: If Key is 'Replace', Value MUST NOT be 'Keep'/'N/A'
export const WALKTHROUGH_DEPENDENCIES: Record<string, string[]> = {
    'kitchen_cabinets': ['kitchen_countertops', 'kitchen_faucet'],
    'kitchen_countertops': ['kitchen_faucet'],
    'master_bath_vanity': ['master_bath_faucet'],
    'master_bath_tub_shower': ['master_bath_faucet'],
    'exterior_siding': ['exterior_paint_ext']
};

export const INITIAL_PROJECT_QUESTIONS: ProjectQuestion[] = [
  { id: 'q1', question: 'Will this project require any type of permits?', answer: '', explanation: '' },
  { id: 'q2', question: 'Will plans be needed to complete this project?', answer: '', explanation: '' },
  { id: 'q3', question: 'Any Zoning Changes Required?', answer: '', explanation: '' },
  { id: 'q4', question: 'Any Unit Changes/Splitting the lot or making other property changes?', answer: '', explanation: '' },
  { id: 'q5', question: 'Is there a Septic, Oil Tank or any environmental concerns?', answer: '', explanation: '' },
  { id: 'q6', question: 'Will you be adding or removing an ADU?', answer: '', explanation: '' },
  { id: 'q7', question: 'Will work be performed on the property before closing of the loan?', answer: '', explanation: '' },
  { id: 'q8', question: 'What are your plans after construction to repay the loan?', answer: '', explanation: '' },
];

const getDefaultBudgetItemFields = () => ({
  description: "",
  budget: 0,
  actual: 0,
  isUncertain: false,
  isContingencyItem: false,
  isGcBuilderFeeItem: false,
  uploadedPhotos: [],
});

export const INITIAL_BUDGET_CATEGORIES: BudgetCategoryData[] = [
  {
    name: "Soft Costs", itemNumberPrefix: "1000", categoryPhotos: [], description: "",
    items: [
      { id: "sc1", itemNumber: "1000-1", drawItem: "Water Service/Meter Set", ...getDefaultBudgetItemFields() },
      { id: "sc2", itemNumber: "1000-2", drawItem: "Temp Power*/service/meter", ...getDefaultBudgetItemFields() },
      { id: "sc3", itemNumber: "1000-3", drawItem: "Gas* Service/meter set", ...getDefaultBudgetItemFields() },
      { id: "sc4", itemNumber: "1000-4", drawItem: "Architectural Fees", ...getDefaultBudgetItemFields() },
      { id: "sc5", itemNumber: "1000-5", drawItem: "Engineering Fees", ...getDefaultBudgetItemFields() },
      { id: "sc6", itemNumber: "1000-6", drawItem: "Building Permit*", ...getDefaultBudgetItemFields() },
      { id: "sc7", itemNumber: "1000-7", drawItem: "Impact Fees", ...getDefaultBudgetItemFields() },
      { id: "sc8", itemNumber: "1000-8", drawItem: "Survey/Drawings/Plans*", ...getDefaultBudgetItemFields() },
      { id: "sc9", itemNumber: "1000-9", drawItem: "Temp Toilet", ...getDefaultBudgetItemFields() },
      { id: "sc10", itemNumber: "1000-10", drawItem: "Temp Security / Privacy Fencing", ...getDefaultBudgetItemFields() },
      { id: "sc11", itemNumber: "1000-11", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Demolition- Trashout", itemNumberPrefix: "2000", categoryPhotos: [], description: "",
    items: [
      { id: "dt1", itemNumber: "2000-1", drawItem: "Demolition*", ...getDefaultBudgetItemFields() },
      { id: "dt2", itemNumber: "2000-2", drawItem: "Trashout", ...getDefaultBudgetItemFields() },
      { id: "dt3", itemNumber: "2000-3", drawItem: "Dumpster", ...getDefaultBudgetItemFields() },
      { id: "dt4", itemNumber: "2000-4", drawItem: "HazMat Testing & Abatement", isRedText: true, ...getDefaultBudgetItemFields() },
      { id: "dt5", itemNumber: "2000-5", drawItem: "Mold Remediation", isRedText: true, ...getDefaultBudgetItemFields() },
      { id: "dt6", itemNumber: "2000-6", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Site Improvements", itemNumberPrefix: "3000", categoryPhotos: [], description: "",
    items: [
      { id: "si1", itemNumber: "3000-1", drawItem: "Grading*", ...getDefaultBudgetItemFields() },
      { id: "si2", itemNumber: "3000-2", drawItem: "Conduit/Electric Service", ...getDefaultBudgetItemFields() },
      { id: "si3", itemNumber: "3000-3", drawItem: "Water Lines*", ...getDefaultBudgetItemFields() },
      { id: "si4", itemNumber: "3000-4", drawItem: "Well*", ...getDefaultBudgetItemFields() },
      { id: "si5", itemNumber: "3000-5", drawItem: "Septic *", ...getDefaultBudgetItemFields() },
      { id: "si6", itemNumber: "3000-6", drawItem: "Sewer Lines*", ...getDefaultBudgetItemFields() },
      { id: "si7", itemNumber: "3000-7", drawItem: "Flatwork", ...getDefaultBudgetItemFields() },
      { id: "si8", itemNumber: "3000-8", drawItem: "Fencing", ...getDefaultBudgetItemFields() },
      { id: "si9", itemNumber: "3000-9", drawItem: "Pavers-Hardscape", ...getDefaultBudgetItemFields() },
      { id: "si10", itemNumber: "3000-10", drawItem: "Landscape", ...getDefaultBudgetItemFields() },
      { id: "si11", itemNumber: "3000-11", drawItem: "Sod-Plants", ...getDefaultBudgetItemFields() },
      { id: "si12", itemNumber: "3000-12", drawItem: "Pool/SPA*", ...getDefaultBudgetItemFields() },
      { id: "si13", itemNumber: "3000-13", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
   {
    name: "Foundation", itemNumberPrefix: "4000", categoryPhotos: [], description: "",
    items: [
      { id: "f1", itemNumber: "4000-1", drawItem: "PreTreat", ...getDefaultBudgetItemFields() },
      { id: "f2", itemNumber: "4000-2", drawItem: "Excavation & Backfill", ...getDefaultBudgetItemFields() },
      { id: "f3", itemNumber: "4000-3", drawItem: "Footings*", ...getDefaultBudgetItemFields() },
      { id: "f4", itemNumber: "4000-4", drawItem: "Foundation *", ...getDefaultBudgetItemFields() },
      { id: "f5", itemNumber: "4000-5", drawItem: "Slab (Form/Place/Finish)*", ...getDefaultBudgetItemFields() },
      { id: "f6", itemNumber: "4000-6", drawItem: "Slab Leveling", isRedText: true, ...getDefaultBudgetItemFields() },
      { id: "f7", itemNumber: "4000-7", drawItem: "Basement wall repairs", ...getDefaultBudgetItemFields() },
      { id: "f8", itemNumber: "4000-8", drawItem: "CMU/Stemwall Repairs", ...getDefaultBudgetItemFields() },
      { id: "f9", itemNumber: "4000-9", drawItem: "Vapor Barrier (Crawl Space)", isRedText: true, ...getDefaultBudgetItemFields() },
      { id: "f10", itemNumber: "4000-10", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Structure", itemNumberPrefix: "5000", categoryPhotos: [], description: "",
    items: [
      { id: "s1", itemNumber: "5000-1", drawItem: "Framing *(L & M)", ...getDefaultBudgetItemFields() },
      { id: "s2", itemNumber: "5000-2", drawItem: "Roof Trusses", ...getDefaultBudgetItemFields() },
      { id: "s3", itemNumber: "5000-3", drawItem: "Joist System", isRedText: true, ...getDefaultBudgetItemFields() },
      { id: "s4", itemNumber: "5000-4", drawItem: "Stairs", ...getDefaultBudgetItemFields() },
      { id: "s5", itemNumber: "5000-5", drawItem: "Window (L & M)", isRedText: true, ...getDefaultBudgetItemFields() },
      { id: "s6", itemNumber: "5000-6", drawItem: "Ext Doors (Main,access..)", ...getDefaultBudgetItemFields() },
      { id: "s7", itemNumber: "5000-7", drawItem: "Wall/Roof Sheathing Repairs", ...getDefaultBudgetItemFields() },
      { id: "s8", itemNumber: "5000-8", drawItem: "House Wrap", ...getDefaultBudgetItemFields() },
      { id: "s9", itemNumber: "5000-9", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Exterior", itemNumberPrefix: "6000", categoryPhotos: [], description: "",
    items: [
      { id: "e1", itemNumber: "6000-1", drawItem: "Roofing*", ...getDefaultBudgetItemFields() },
      { id: "e2", itemNumber: "6000-2", drawItem: "Flashing/Roof Repairs", ...getDefaultBudgetItemFields() },
      { id: "e3", itemNumber: "6000-3", drawItem: "Soffit/Fascia", ...getDefaultBudgetItemFields() },
      { id: "e4", itemNumber: "6000-4", drawItem: "Siding", ...getDefaultBudgetItemFields() },
      { id: "e5", itemNumber: "6000-5", drawItem: "Stucco", ...getDefaultBudgetItemFields() },
      { id: "e6", itemNumber: "6000-6", drawItem: "Masonry Veneer (Stone/Brick)", ...getDefaultBudgetItemFields() },
      { id: "e7", itemNumber: "6000-7", drawItem: "Decks*", ...getDefaultBudgetItemFields() },
      { id: "e8", itemNumber: "6000-8", drawItem: "Painting - Exterior", ...getDefaultBudgetItemFields() },
      { id: "e9", itemNumber: "6000-9", drawItem: "Garage Door", ...getDefaultBudgetItemFields() },
      { id: "e10", itemNumber: "6000-10", drawItem: "Porch Repairs (Railing, columns)", ...getDefaultBudgetItemFields() },
      { id: "e11", itemNumber: "6000-11", drawItem: "Gutters/Gutter Repairs", ...getDefaultBudgetItemFields() },
      { id: "e12", itemNumber: "6000-12", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
    {
    name: "Systems", itemNumberPrefix: "7000", categoryPhotos: [], description: "",
    items: [
      { id: "sys1", itemNumber: "7000-1", drawItem: "Rough HVAC* (Ductwork)", ...getDefaultBudgetItemFields() },
      { id: "sys2", itemNumber: "7000-2", drawItem: "Final HVAC (Start-up / Service)", ...getDefaultBudgetItemFields() },
      { id: "sys3", itemNumber: "7000-3", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
      { id: "sys4", itemNumber: "7000-4", drawItem: "Underslab Plumbing (Rough)*", ...getDefaultBudgetItemFields() },
      { id: "sys5", itemNumber: "7000-5", drawItem: "Rough Plumbing (Top Out)", ...getDefaultBudgetItemFields() },
      { id: "sys6", itemNumber: "7000-6", drawItem: "Plumbing - Fixtures", ...getDefaultBudgetItemFields() },
      { id: "sys7", itemNumber: "7000-7", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
      { id: "sys8", itemNumber: "7000-8", drawItem: "Water Heaters", ...getDefaultBudgetItemFields() },
      { id: "sys9", itemNumber: "7000-9", drawItem: "Fire Sprinklers Rough*", ...getDefaultBudgetItemFields() },
      { id: "sys10", itemNumber: "7000-10", drawItem: "Fire Sprinklers Final", ...getDefaultBudgetItemFields() },
      { id: "sys11", itemNumber: "7000-11", drawItem: "Gas Rough*", ...getDefaultBudgetItemFields() },
      { id: "sys12", itemNumber: "7000-12", drawItem: "Gas Final", ...getDefaultBudgetItemFields() },
      { id: "sys13", itemNumber: "7000-13", drawItem: "Underslab Electrical*", ...getDefaultBudgetItemFields() },
      { id: "sys14", itemNumber: "7000-14", drawItem: "Rough Electrical*", ...getDefaultBudgetItemFields() },
      { id: "sys15", itemNumber: "7000-15", drawItem: "Electrical Fixtures / Lighting", ...getDefaultBudgetItemFields() },
      { id: "sys16", itemNumber: "7000-16", drawItem: "Smoke / CO2 Detectors", ...getDefaultBudgetItemFields() },
      { id: "sys17", itemNumber: "7000-17", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
      { id: "sys18", itemNumber: "7000-18", drawItem: "Low Voltage Rough", ...getDefaultBudgetItemFields() },
      { id: "sys19", itemNumber: "7000-19", drawItem: "Low Voltage Final", ...getDefaultBudgetItemFields() },
      { id: "sys20", itemNumber: "7000-20", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Interior", itemNumberPrefix: "8000", categoryPhotos: [], description: "",
    items: [
      { id: "int1", itemNumber: "8000-1", drawItem: "Insulation (Batt & Blown)", ...getDefaultBudgetItemFields() },
      { id: "int2", itemNumber: "8000-2", drawItem: "Drywall", ...getDefaultBudgetItemFields() },
      { id: "int3", itemNumber: "8000-3", drawItem: "Painting - Interior", ...getDefaultBudgetItemFields() },
      { id: "int4", itemNumber: "8000-4", drawItem: "Fireplace", ...getDefaultBudgetItemFields() },
      { id: "int5", itemNumber: "8000-5", drawItem: "Re-Surface Tubs/Re-glaze", ...getDefaultBudgetItemFields() },
      { id: "int6", itemNumber: "8000-6", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Finishes", itemNumberPrefix: "9000", categoryPhotos: [], description: "",
    items: [
      { id: "fin1", itemNumber: "9000-1", drawItem: "Finish Carpentry", ...getDefaultBudgetItemFields() },
      { id: "fin2", itemNumber: "9000-2", drawItem: "Interior Doors", ...getDefaultBudgetItemFields() },
      { id: "fin3", itemNumber: "9000-3", drawItem: "Finish Hardware", ...getDefaultBudgetItemFields() },
      { id: "fin4", itemNumber: "9000-4", drawItem: "Cabinets (Kitchen & Bath)", ...getDefaultBudgetItemFields() },
      { id: "fin5", itemNumber: "9000-5", drawItem: "Countertops (Kitchen & Bath)", ...getDefaultBudgetItemFields() },
      { id: "fin6", itemNumber: "9000-6", drawItem: "Cabinet Re-finishing", ...getDefaultBudgetItemFields() },
      { id: "fin7", itemNumber: "9000-7", drawItem: "Cabinet Hardware", ...getDefaultBudgetItemFields() },
      { id: "fin8", itemNumber: "9000-8", drawItem: "Shower Enclosures", ...getDefaultBudgetItemFields() },
      { id: "fin9", itemNumber: "9000-9", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Flooring", itemNumberPrefix: "10000", categoryPhotos: [], description: "",
    items: [
      { id: "fl1", itemNumber: "10000-1", drawItem: "Tile/Marble", ...getDefaultBudgetItemFields() },
      { id: "fl2", itemNumber: "10000-2", drawItem: "Wood Flooring", ...getDefaultBudgetItemFields() },
      { id: "fl3", itemNumber: "10000-3", drawItem: "Refinish Hardwoods", ...getDefaultBudgetItemFields() },
      { id: "fl4", itemNumber: "10000-4", drawItem: "LVP (Vinyl Plank Flooring)", ...getDefaultBudgetItemFields() },
      { id: "fl5", itemNumber: "10000-5", drawItem: "Carpet", ...getDefaultBudgetItemFields() },
      { id: "fl6", itemNumber: "10000-6", drawItem: "Vinyl (Sheets, Linoleum)", ...getDefaultBudgetItemFields() },
      { id: "fl7", itemNumber: "10000-7", drawItem: "Shoe Molding", ...getDefaultBudgetItemFields() },
      { id: "fl8", itemNumber: "10000-8", drawItem: "Bathroom Tile", ...getDefaultBudgetItemFields() },
      { id: "fl9", itemNumber: "10000-9", drawItem: "Backer Board", ...getDefaultBudgetItemFields() },
      { id: "fl10", itemNumber: "10000-10", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Appliances", itemNumberPrefix: "11000", categoryPhotos: [], description: "",
    items: [
      { id: "app1", itemNumber: "11000-1", drawItem: "Range", ...getDefaultBudgetItemFields() },
      { id: "app2", itemNumber: "11000-2", drawItem: "Cooktop", ...getDefaultBudgetItemFields() },
      { id: "app3", itemNumber: "11000-3", drawItem: "Microwave", ...getDefaultBudgetItemFields() },
      { id: "app4", itemNumber: "11000-4", drawItem: "Dishwasher", ...getDefaultBudgetItemFields() },
      { id: "app5", itemNumber: "11000-5", drawItem: "Refrigerator", ...getDefaultBudgetItemFields() },
      { id: "app6", itemNumber: "11000-6", drawItem: "Exhaust Hood", ...getDefaultBudgetItemFields() },
      { id: "app7", itemNumber: "11000-7", drawItem: "Washer & Dryer", ...getDefaultBudgetItemFields() },
      { id: "app8", itemNumber: "11000-8", drawItem: "Total Appliance Package", ...getDefaultBudgetItemFields() },
      { id: "app9", itemNumber: "11000-9", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  },
  {
    name: "Final - Misc", itemNumberPrefix: "12000", categoryPhotos: [], description: "",
    items: [
      { id: "fm1", itemNumber: "12000-1", drawItem: "Cleaning (roughs,final,touchup)", ...getDefaultBudgetItemFields() },
      { id: "fm2", itemNumber: "12000-2", drawItem: "Pressure Wash", ...getDefaultBudgetItemFields() },
      { id: "fm3_contingency", itemNumber: "12000-3", drawItem: "Contingency", ...getDefaultBudgetItemFields(), isContingencyItem: true },
      { id: "fm4", itemNumber: "12000-4", drawItem: "Staging", ...getDefaultBudgetItemFields() },
      { id: "fm5", itemNumber: "12000-5", drawItem: "Profit (released as a % of completion)", ...getDefaultBudgetItemFields() },
      { id: "fm6", itemNumber: "12000-6", drawItem: "Overhead (released as a % of completion)", ...getDefaultBudgetItemFields() },
      { id: "fm7_gc_fees", itemNumber: "12000-7", drawItem: "GC/Builder Fees (released as % of completion)", ...getDefaultBudgetItemFields(), isGcBuilderFeeItem: true },
      { id: "fm8_custom", itemNumber: "12000-8", drawItem: "(your description)", isCustomDescription: true, ...getDefaultBudgetItemFields() },
    ]
  }
];

export const INITIAL_SCOPE_SUMMARY: ScopeOfWorkSummary = {
  borrowerTotal: 0,
  limaOneApprovedTotal: 0,
  perSqFtBudget: '#DIV/0!',
  perSqFtActual: '#DIV/0!',
  startDate: '',
  projectedCompletionDate: '',
  isContingencyAutoCalculated: false,
  contingencyPercentage: 10, // Default to 10%
};

export const INITIAL_GENERAL_CONTRACTOR: GeneralContractor = {
  performerType: '',
  businessName: '',
  website: '',
  socialPages: '',
  buildzoomUrl: '',
  googleReviewsUrl: '',
  gcLicenseDoc: null,
  driversLicenseDoc: null,
  generalLiabilityDoc: null,
  workersCompDoc: null,
};

export const INITIAL_GC_ONBOARDING_DATA: GcOnboardingData = {
  generalInfo: {
    fullName: '',
    address: '',
    businessPhone: '',
    personalEmail: '',
    ssnOrEin: '',
    birthdate: '',
    entityNameAndType: '',
    gcLicenseNumber: '',
    entityEmail: '',
    numberOfEmployees: '',
  },
  previousExperience: [
    { id: `exp-1`, address: '', scopeOfWork: '', constructionBudget: '' },
    { id: `exp-2`, address: '', scopeOfWork: '', constructionBudget: '' },
    { id: `exp-3`, address: '', scopeOfWork: '', constructionBudget: '' },
  ],
  capabilities: {
    projectsForecasted: '',
    dedicatedFieldSupervisors: '',
    dedicatedProductionAdmin: '',
    inHouseCrewsAvailable: '',
    foundationSubs: '',
    framingSubs: '',
    mepSubs: '',
    otherSubs: '',
  },
  authorization: {
    signature: '',
    printName: '',
    title: '',
    date: '',
    agreedToTerms: false,
  },
};

export const NC_SOFT_COST_ROWS = [
    { id: 'nc_sc_1', itemNumber: '1000-NC1', drawItem: 'Architecture & Design' },
    { id: 'nc_sc_2', itemNumber: '1000-NC2', drawItem: 'Civil Engineering' },
    { id: 'nc_sc_3', itemNumber: '1000-NC3', drawItem: 'Soil / Geotech Report' },
    { id: 'nc_sc_4', itemNumber: '1000-NC4', drawItem: 'Surveying (Topo, Stake, Final)' },
    { id: 'nc_sc_5', itemNumber: '1000-NC5', drawItem: 'School Impact Fees' },
    { id: 'nc_sc_6', itemNumber: '1000-NC6', drawItem: 'Water/Sewer Tap Fees' },
];

export const getTargetBudgetJSON = (): string => {
  const allItems = INITIAL_BUDGET_CATEGORIES.flatMap(category => 
    category.items.map(item => ({
      id: item.id,
      itemNumber: item.itemNumber,
      drawItem: item.drawItem,
    }))
  );
  return JSON.stringify(allItems);
};

export const getCategoryNames = (): string[] => {
  return INITIAL_BUDGET_CATEGORIES.map(category => category.name);
};

export const getInitialAppState = (): AppState => {
  const initialPropertyDetails = { ...INITIAL_PROPERTY_DETAILS };
  const initialLandDetails = { ...INITIAL_LAND_DETAILS };
  const initialAsIsProjectedData = JSON.parse(JSON.stringify(INITIAL_AS_IS_PROJECTED_DATA));
  const initialProjectQuestions = INITIAL_PROJECT_QUESTIONS.map(q => ({
    ...q,
    answer: '' as const, 
    explanation: ''
  }));

  const initialBudgetData = INITIAL_BUDGET_CATEGORIES.map(category => ({
    ...category, 
    items: category.items.map(originalItem => ({ 
      ...originalItem, 
      drawItem: originalItem.isCustomDescription ? '' : originalItem.drawItem, 
      description: '', 
      budget: 0,       
      actual: 0,       
      isUncertain: false,
      uploadedPhotos: [],
    })),
    categoryPhotos: [],
  }));

  const initialScopeSummary = { 
    ...INITIAL_SCOPE_SUMMARY, 
    borrowerTotal: 0,
    limaOneApprovedTotal: 0,
    perSqFtBudget: '#DIV/0!',
    perSqFtActual: '#DIV/0!',
    startDate: '',
    projectedCompletionDate: '',
    isContingencyAutoCalculated: false, 
    contingencyPercentage: 10, 
   };

  const initialGeneralContractor = { ...INITIAL_GENERAL_CONTRACTOR };
  const initialGcOnboardingData = JSON.parse(JSON.stringify(INITIAL_GC_ONBOARDING_DATA));
  const initialFeasibilityData = JSON.parse(JSON.stringify(INITIAL_FEASIBILITY_DATA));
  const initialMarketMetrics = { ...INITIAL_MARKET_METRICS };
  
  const initialWalkthroughState: WalkthroughState = { ...INITIAL_WALKTHROUGH_STATE };

  // Phase 3: Accordion Flow - Default all collapsed except Soft Costs
  const initialCollapsedCategories: Record<string, boolean> = {};
  INITIAL_BUDGET_CATEGORIES.forEach((cat, index) => {
      initialCollapsedCategories[cat.name] = index !== 0; 
  });

  return {
    propertyDetails: initialPropertyDetails,
    landDetails: initialLandDetails,
    asIsProjectedData: initialAsIsProjectedData,
    selectedCondition: '',
    selectedRehabType: '',
    selectedMaterialQuality: '',
    projectQuestions: initialProjectQuestions,
    budgetData: initialBudgetData,
    projectScopeStatement: '',
    scopeSummary: initialScopeSummary,
    currentUserRole: 'borrower',
    collapsedCategories: initialCollapsedCategories, 
    verificationStatus: 'idle',
    generalContractor: initialGeneralContractor,
    gcOnboardingData: initialGcOnboardingData,
    comments: [],
    commentThreads: [],
    applicationStatus: 'draft',
    auditLog: [],
    budgetViewMode: 'detailed',
    expandedInSimplifiedView: [],
    riskAdjustments: { ...INITIAL_RISK_ADJUSTMENTS },
    feasibilityData: initialFeasibilityData,
    manualBaseRateOverride: 0,
    marketMetrics: initialMarketMetrics,
    walkthroughState: initialWalkthroughState, 
    projectTypeMode: null,
  };
};

export const CONTINGENCY_ITEM_ID = "fm3_contingency";
export const GC_BUILDER_FEES_ITEM_ID = "fm7_gc_fees";
export const FINAL_MISC_CATEGORY_NAME = "Final - Misc";
export const CONTINGENCY_CATEGORY_NAME = "Final - Misc";

export const TEMPLATE_BUDGET_DATA: BudgetCategoryData[] = JSON.parse(JSON.stringify(INITIAL_BUDGET_CATEGORIES));
const findAndUpdateItem = (categoryName: string, drawItemName: string, newBudgetValue: number) => {
    const category = TEMPLATE_BUDGET_DATA.find(c => c.name === categoryName);
    if (category) {
        const item = category.items.find(i => i.drawItem === drawItemName);
        if (item) {
            item.budget = newBudgetValue;
            item.description = "Based on standard template";
        }
    }
};
findAndUpdateItem("Exterior", "Roofing*", 12500);
findAndUpdateItem("Exterior", "Painting - Exterior", 6000);
findAndUpdateItem("Interior", "Painting - Interior", 7500);
findAndUpdateItem("Interior", "Drywall", 8000);
findAndUpdateItem("Flooring", "LVP (Vinyl Plank Flooring)", 9000);
findAndUpdateItem("Finishes", "Cabinets (Kitchen & Bath)", 15000);
findAndUpdateItem("Appliances", "Total Appliance Package", 5500);

export const ESTIMATOR_SYSTEM_INSTRUCTION = `You are an expert construction estimator AI.
Your goal is to generate a detailed, realistic line-item construction budget based on the provided inputs (Property Location, User's Renovation Plan, and Visual Evidence from photos/reports).

GUIDELINES:
1. Analyze the Visual Evidence (if provided) to identify the current condition and necessary repairs.
2. Cross-reference with the User's Plan to determine the Scope of Work.
3. If the user plan is vague (e.g., "update kitchen"), infer standard necessary items (cabinets, countertops, appliances, flooring, paint, plumbing fixtures) suitable for a "Fix & Flip" investment property.
4. Use the Location to adjust pricing tiers (e.g., higher labor in CA/NY, lower in TX/AL).
5. Generate specific line items with estimated costs.
6. Flag items that are clearly visible in photos but missing from the user's plan as "AI Detected".
7. Explain your pricing logic briefly in the "logic" field.
`;

export const ESTIMATOR_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    inspectionSummary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING },
          findings: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    detectiveReport: { type: Type.ARRAY, items: { type: Type.STRING } },
    estimatedItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          item: { type: Type.STRING },
          description: { type: Type.STRING },
          cost: { type: Type.NUMBER },
          materialCost: { type: Type.NUMBER },
          laborCost: { type: Type.NUMBER },
          isAiDetected: { type: Type.BOOLEAN },
          logic: { type: Type.STRING }
        },
        required: ["category", "item", "cost"]
      }
    },
    totalEstimate: { type: Type.NUMBER }
  }
};

export const BUDGET_PARSER_SYSTEM_INSTRUCTION = `You are a construction budget data extraction specialist.
Your task is to parse a raw budget file (text/csv/pdf content) and map it to a structured format.

I will provide you with a list of VALID_BUDGET_ITEMS in JSON format. You must aggregate the user's file content and map it to these specific IDs.

1. Identify standard budget categories and line items from the user's file.
2. Extract budget amounts.
3. Identify project metadata (address, sqft, etc.) if available in the header/footer.
4. Map identified items to the VALID_BUDGET_ITEMS list provided.
   - If a user item implies "Roofing", find the ID for "Roofing" in the VALID_BUDGET_ITEMS list and use that ID.
   - If multiple user items map to the same VALID_BUDGET_ITEM ID (e.g., "Roof Shingles" and "Roof Labor" both map to "Roofing*"), sum their costs into that single ID.
5. If an item does NOT match any VALID_BUDGET_ITEM, create a new item in the "newItems" array with a suggested category.
`;

export const BUDGET_PARSER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    projectDetails: {
      type: Type.OBJECT,
      properties: {
        propertyAddress: { type: Type.STRING },
        asIsSqft: { type: Type.NUMBER },
        projectedSqft: { type: Type.NUMBER },
        asIsBedrooms: { type: Type.NUMBER },
        projectedBedrooms: { type: Type.NUMBER },
        asIsBathrooms: { type: Type.NUMBER },
        projectedBathrooms: { type: Type.NUMBER },
        conditionOfProperty: { type: Type.STRING },
        typeOfRehab: { type: Type.STRING },
        materialQuality: { type: Type.STRING },
        projectScopeStatement: { type: Type.STRING }
      }
    },
    mappedItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "ID of the matching standard item from the provided list, if any." },
          originalText: { type: Type.STRING },
          budget: { type: Type.NUMBER },
          description: { type: Type.STRING },
          isUncertain: { type: Type.BOOLEAN }
        }
      }
    },
    newItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          categoryName: { type: Type.STRING },
          drawItem: { type: Type.STRING },
          originalText: { type: Type.STRING },
          budget: { type: Type.NUMBER },
          description: { type: Type.STRING },
          isUncertain: { type: Type.BOOLEAN }
        }
      }
    }
  }
};

export const AUDITOR_SYSTEM_INSTRUCTION = `You are a Construction Scope Auditor.
Your goal is to cross-reference a provided "Borrower Budget" against "Visual Evidence" (photos/inspection report).
1. Identify discrepancies: Are there repairs visible in photos that are NOT in the budget? (Scope Gap).
2. Verify inclusions: Are the budgeted items actually needed based on the photos?
3. Flag risks: "Critical" (Major missing item like Roof/Foundation), "Medium" (Missing cosmetic), "Low" (Pricing question).
4. Mark items as "verified" if the budget matches the visual need.
`;

export const AUDITOR_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ["Critical", "Medium", "Low", "verified"] },
          observation: { type: Type.STRING },
          missingCategoryOrItem: { type: Type.STRING },
          photoIndex: { type: Type.INTEGER }
        }
      }
    }
  }
};

// --- Mock Template Helpers ---

// Helper to create a deep copy of the initial budget
const createBaseBudget = () => JSON.parse(JSON.stringify(INITIAL_BUDGET_CATEGORIES)) as BudgetCategoryData[];

// Helper to populate budget items
const populateBudget = (updates: Record<string, Record<string, number>>) => {
    const budget = createBaseBudget();
    budget.forEach(cat => {
        if (updates[cat.name]) {
            cat.items.forEach(item => {
                if (updates[cat.name][item.drawItem]) {
                    item.budget = updates[cat.name][item.drawItem];
                    item.description = "Pre-filled by Template";
                }
            });
        }
    });
    return budget;
};

// 1. Standard Cosmetic Flip
const COSMETIC_FLIP_BUDGET = populateBudget({
    "Interior": { "Painting - Interior": 5500, "Drywall": 2500 },
    "Flooring": { "LVP (Vinyl Plank Flooring)": 7500, "Carpet": 2000 },
    "Finishes": { "Cabinets (Kitchen & Bath)": 8500, "Countertops (Kitchen & Bath)": 4500, "Finish Hardware": 1200 },
    "Appliances": { "Total Appliance Package": 4500 },
    "Exterior": { "Painting - Exterior": 3500, "Landscape": 1500 },
    "Final - Misc": { "Cleaning (roughs,final,touchup)": 800 }
});

// 2. Full Gut Renovation
const GUT_RENO_BUDGET = populateBudget({
    "Demolition- Trashout": { "Demolition*": 6500, "Dumpster": 2000 },
    "Systems": { "Rough HVAC* (Ductwork)": 12000, "Rough Plumbing (Top Out)": 8500, "Rough Electrical*": 9500 },
    "Structure": { "Framing *(L & M)": 15000, "Window (L & M)": 8000 },
    "Interior": { "Drywall": 12000, "Insulation (Batt & Blown)": 3500, "Painting - Interior": 9500 },
    "Flooring": { "LVP (Vinyl Plank Flooring)": 12000, "Tile/Marble": 5000 },
    "Finishes": { "Cabinets (Kitchen & Bath)": 18000, "Countertops (Kitchen & Bath)": 7500, "Interior Doors": 3500 },
    "Exterior": { "Roofing*": 12500, "Siding": 14000 },
    "Final - Misc": { "Contingency": 15000 }
});

// 3. New Construction
const NEW_CONSTRUCTION_BUDGET = populateBudget({
    "Soft Costs": { "Architectural Fees": 5000, "Building Permit*": 4500, "Impact Fees": 8000 },
    "Site Improvements": { "Grading*": 4500, "Water Lines*": 3500, "Sewer Lines*": 4000 },
    "Foundation": { "Foundation *": 18000, "Slab (Form/Place/Finish)*": 15000 },
    "Structure": { "Framing *(L & M)": 35000, "Roof Trusses": 8500, "Window (L & M)": 12000 },
    "Exterior": { "Roofing*": 14000, "Siding": 18000, "Garage Door": 2500 },
    "Systems": { "Rough HVAC* (Ductwork)": 14000, "Rough Plumbing (Top Out)": 11000, "Rough Electrical*": 12000 },
    "Interior": { "Drywall": 15000, "Insulation (Batt & Blown)": 5000, "Painting - Interior": 11000 },
    "Flooring": { "LVP (Vinyl Plank Flooring)": 14000 },
    "Finishes": { "Cabinets (Kitchen & Bath)": 22000, "Countertops (Kitchen & Bath)": 9000 },
    "Final - Misc": { "Contingency": 25000, "GC/Builder Fees (released as % of completion)": 35000 }
});

export const MOCK_TEMPLATES: BudgetTemplate[] = [
    {
        id: 'tmpl_1',
        name: 'Standard Cosmetic Flip',
        description: 'Ideal for properties needing paint, flooring, and minor updates. Includes kitchen refresh and bath updates.',
        tags: ['Cosmetic', 'Quick Turn', 'Low Risk'],
        totalCostEstimate: 45000,
        projectedSqFt: 1500,
        projectedBeds: 3,
        projectedBaths: 2,
        projectedFloors: 1,
        materialQuality: 'Q4',
        rehabType: 'Light-Cosmetic',
        projectType: 'renovation',
        budgetData: COSMETIC_FLIP_BUDGET
    },
    {
        id: 'tmpl_2',
        name: 'Full Gut Renovation',
        description: 'For distressed properties requiring new systems (HVAC/Plumbing/Electric), layout changes, and full finish replacement.',
        tags: ['Heavy Rehab', 'High ROI', 'Experienced'],
        totalCostEstimate: 165000, // Updated based on values
        projectedSqFt: 2000,
        projectedBeds: 4,
        projectedBaths: 2.5,
        projectedFloors: 2,
        materialQuality: 'Q3',
        rehabType: 'Heavy',
        projectType: 'renovation',
        budgetData: GUT_RENO_BUDGET
    },
    {
        id: 'tmpl_3',
        name: 'New Construction (Spec Home)',
        description: 'Ground-up construction template for a standard 2000 sqft single family home. Includes site work and impact fees.',
        tags: ['New Build', 'Spec', 'Ground Up'],
        totalCostEstimate: 290000, // Updated based on values
        projectedSqFt: 2200,
        projectedBeds: 4,
        projectedBaths: 3,
        projectedFloors: 2,
        materialQuality: 'Q2',
        rehabType: 'New Construction',
        projectType: 'new_construction',
        budgetData: NEW_CONSTRUCTION_BUDGET
    }
];