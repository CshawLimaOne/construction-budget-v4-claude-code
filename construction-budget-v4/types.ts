
// ... existing imports
// Add to existing types:

export interface PendingSyncJob {
  id: string;
  type: 'room_voice' | 'item_photo';
  roomId: string;
  timestamp: number;
  dataKey: string; // Key in IndexedDB
}

// Update WalkthroughState to include sync queue
export interface WalkthroughState {
  isActive: boolean;
  currentRoomId: string | null;
  roomsCompleted: string[]; 
  customRooms: WalkthroughRoomDef[]; 
  items: Record<string, WalkthroughItemRecord>; 
  isProcessingRoom?: boolean;
  pendingJobs?: PendingSyncJob[]; // New field
}

// ... rest of file
export type WalkthroughItemStatus = 'Keep' | 'Repair' | 'Replace' | 'N/A';

export interface WalkthroughItemRecord {
  status: WalkthroughItemStatus;
  notes: string;
  photos: { file: File; preview: string }[];
  costEstimate?: number; 
}

export interface WalkthroughItemDef {
  id: string;
  label: string;
  targetCategory: string;
  targetItemName: string; 
  defaultCostCode: string; 
}

export interface WalkthroughRoomDef {
  id: string;
  label: string;
  icon: string;
  items: WalkthroughItemDef[];
}

export interface BatchRoomUpdate {
  itemId: string;
  status: WalkthroughItemStatus;
  description: string;
  costEstimate?: number;
}

export interface PropertyDetails {
  street: string;
  city: string;
  state: string;
  zip: string;
  purchasePrice: string;
}

export interface LandDetails {
  lotSize: string;
  zoning: string;
  entitlementStatus: string;
}

export type EntitlementStatus = 'Raw Land' | 'Platted' | 'Shovel Ready' | '';

export interface AsIsProjectedItem {
  label: string;
  asIs: string;
  projected: string;
}

export interface AsIsProjectedPerUnitItem {
  label: string;
  asIs: string[];
  projected: string[];
}

export interface AsIsProjectedData {
  totalBuildingSqFeet: AsIsProjectedItem;
  floorsAboveBasement: AsIsProjectedItem;
  bedroomCount: AsIsProjectedItem;
  bathroomCount: AsIsProjectedItem;
  unitCount: AsIsProjectedItem;
  bedroomCountPerUnit: AsIsProjectedPerUnitItem;
  bathroomCountPerUnit: AsIsProjectedPerUnitItem;
}

export type AsIsProjectedField = keyof AsIsProjectedData;
export type AsIsProjectedAspect = 'asIs' | 'projected';

export interface ProjectQuestion {
  id: string;
  question: string;
  answer: string;
  explanation: string;
}

export interface BudgetItem {
  id: string;
  itemNumber: string;
  drawItem: string;
  description: string;
  budget: number;
  actual: number;
  isUncertain?: boolean;
  isCustomDescription?: boolean;
  isRedText?: boolean;
  isContingencyItem?: boolean;
  isGcBuilderFeeItem?: boolean;
  uploadedPhotos?: { file: File; preview: string }[];
  isAiDetected?: boolean;
  aiLogic?: string;
  drawId?: string;
}

export interface BudgetCategoryData {
  name: string;
  itemNumberPrefix: string;
  categoryPhotos: { file: File; preview: string }[];
  description: string;
  items: BudgetItem[];
}

export interface ScopeOfWorkSummary {
  borrowerTotal: number;
  limaOneApprovedTotal: number;
  perSqFtBudget: string;
  perSqFtActual: string;
  startDate: string;
  projectedCompletionDate: string;
  isContingencyAutoCalculated: boolean;
  contingencyPercentage: number;
}

export type UserRole = 'borrower' | 'analyst';

export interface Comment {
  id: string;
  fieldId: string;
  threadId: string;
  authorRole: UserRole;
  authorName: string;
  text: string;
  timestamp: string;
}

export type CommentThreadStatus = 'needs_borrower_action' | 'pending_analyst_review' | 'resolved';

export interface CommentThread {
  id: string;
  label: string;
  status: CommentThreadStatus;
  assignee: UserRole;
}

export type ApplicationStatus = 'draft' | 'under_review' | 'needs_borrower_action' | 'approved';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  authorRole: UserRole;
  authorName: string;
  fieldId: string;
  fieldLabel: string;
  changeType: 'value_change' | 'comment' | 'thread_resolved' | 'thread_reopened' | 'budget_reopened';
  oldValue: any;
  newValue: any;
  commentText: string;
}

export interface RiskAdjustments {
  ultraUrban: boolean;
  remoteRural: boolean;
  island: boolean;
  gatedHoa: boolean;
}

export interface FeasibilityData {
  borrowerName: string;
  loanNumber: string;
  approvalDate: string;
  strategicAccount: boolean;
  isRepeatBorrower: boolean;
  tierReviewed: string;
  processedBy: string;
  approvedBy: string;
  recommendation: RecommendationType | '';
  conditions: string[];
  requiredBeforeDraw: {
    plans: boolean;
    permits: boolean;
    other: boolean;
    otherDescription: string;
  };
  mitigatingFactors: string;
  approvalDates: {
    permit: string;
    plans: string;
  };
  hoa: {
    required: boolean;
    approved: boolean;
  };
  borrowerPerformance: {
    buildTimeDays: string;
    avgDaysBetweenDraws: string;
    projectsReviewOutcome: string;
    violationsLiens: string;
    budgetRevisions: string;
  };
  cmNotes: {
    adjustmentsToBudget: boolean;
    gcReviewCompleted: boolean;
    gcApproved: boolean;
    sqftVerified: boolean;
  };
  developmentInfo: {
    isPartOfLargerDevelopment: boolean;
    totalPhases: string;
    plannedHomesites: string;
    soldOrUnderContract: string;
  };
  budgetNotes: {
    desktopReview: string;
    sowMatchBudget: string;
    roomCountChange: string;
    sqftChange: string;
    plansProvided: string;
    permitsProvided: string;
    sqftVerified: string;
    inspection: string;
  };
  pamNotes: string;
  referenceLoanNumbers: string;
  avgDaysBetweenDraws: string;
}

export type RecommendationType = 'Recommended' | 'Recommended with Conditions' | 'Not Recommended';

export interface MarketMetrics {
  zipCode: string;
  delinquency90Day: number;
  priceTrend: string;
  monthsSupply: number;
  avgDaysOnMarket: number;
  femaDisasterZone: boolean;
}

export type ProjectTypeMode = 'renovation' | 'new_construction' | null;

export interface InitializationData {
  id?: string;
  propertyDetails?: Partial<PropertyDetails>;
  userRole?: UserRole;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  colorClass?: string;
}

export interface ProjectDocument {
  file: File;
  name: string;
  type: 'Architectural Plan' | 'Structural Plan' | 'Site Plan' | 'Spec Sheet' | 'Permit' | 'Other';
  description?: string;
}

export interface GcDocument {
  file: File;
  name: string;
}

export interface GeneralContractor {
  performerType: string;
  businessName: string;
  website: string;
  socialPages: string;
  buildzoomUrl: string;
  googleReviewsUrl: string;
  gcLicenseDoc?: GcDocument | null;
  driversLicenseDoc?: GcDocument | null;
  generalLiabilityDoc?: GcDocument | null;
  workersCompDoc?: GcDocument | null;
}

export interface GcOnboardingData {
  generalInfo: {
    fullName: string;
    address: string;
    businessPhone: string;
    personalEmail: string;
    ssnOrEin: string;
    birthdate: string;
    entityNameAndType: string;
    gcLicenseNumber: string;
    entityEmail: string;
    numberOfEmployees: string;
  };
  previousExperience: GcPreviousExperience[];
  capabilities: {
    projectsForecasted: string;
    dedicatedFieldSupervisors: string;
    dedicatedProductionAdmin: string;
    inHouseCrewsAvailable: string;
    foundationSubs: string;
    framingSubs: string;
    mepSubs: string;
    otherSubs: string;
  };
  authorization: {
    signature: string;
    printName: string;
    title: string;
    date: string;
    agreedToTerms: boolean;
  };
}

export interface GcPreviousExperience {
  id: string;
  address: string;
  scopeOfWork: string;
  constructionBudget: string;
}

export interface Requirement {
  id: string;
  label: string;
  info: string;
  status: 'pending' | 'completed';
  actionType: 'upload' | 'info';
  file?: File;
}

export interface EstimatorResult {
  inspectionSummary: {
    area: string;
    findings: string[];
  }[];
  detectiveReport: string[];
  estimatedItems: {
    category: string;
    item: string;
    description: string;
    cost: number;
    materialCost?: number;
    laborCost?: number;
    isAiDetected?: boolean;
    logic?: string;
  }[];
  totalEstimate: number;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  totalCostEstimate: number;
  projectedSqFt: number;
  projectedBeds: number;
  projectedBaths: number;
  projectedFloors: number;
  materialQuality: string;
  rehabType: string;
  projectType: 'renovation' | 'new_construction';
  budgetData: BudgetCategoryData[];
}

export interface RiskFactor {
  id?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'verified';
  category?: string;
  itemId?: string;
}

export interface RiskCalculationBreakdown {
  baseRate: number;
  baseRateSource: string;
  locationFactor: number;
  finishFactor: number;
  lastMileFactor: number;
  sqFt: number;
  calculatedPpsf: number;
  stateAbbrev: string;
  isOverridden: boolean;
}

export interface RiskAnalysisResult {
  score: number;
  factors: RiskFactor[];
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  targetBudget: number;
  baseRatePerSqFt: number;
  calculationBreakdown: RiskCalculationBreakdown;
}

export interface DealGrade {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  numericalScore: number;
  breakdown: {
    financials: number;
    sponsorship: number;
    market: number;
    completeness: number;
  };
  summary: string;
}

export interface ApplicationStrength {
  score: number;
  level: 'Getting Started' | 'In Progress' | 'Almost There' | 'Ready to Submit';
  nextBestAction: string;
  nextActionDescription: string;
  actionTargetStep: number;
  breakdown: {
    basics: number;
    team: number;
    budget: number;
    quality: number;
    photos: number;
  };
}

export interface ScopeAuditFinding {
  severity: 'Critical' | 'Medium' | 'Low' | 'verified';
  observation: string;
  missingCategoryOrItem: string;
  photoIndex?: number;
}

export interface ScopeAuditResult {
  summary: string;
  findings: ScopeAuditFinding[];
}

export interface AppState {
  propertyDetails: PropertyDetails;
  landDetails: LandDetails; 
  asIsProjectedData: AsIsProjectedData;
  selectedCondition: string;
  selectedRehabType: string;
  selectedMaterialQuality: string;
  projectQuestions: ProjectQuestion[];
  budgetData: BudgetCategoryData[];
  projectScopeStatement: string; 
  scopeSummary: ScopeOfWorkSummary;
  currentUserRole?: UserRole;
  collapsedCategories?: Record<string, boolean>;
  verificationStatus?: 'idle' | 'verifying' | 'verified' | 'mismatch';
  generalContractor: GeneralContractor;
  gcOnboardingData?: GcOnboardingData;
  comments?: Comment[];
  commentThreads?: CommentThread[];
  applicationStatus?: ApplicationStatus;
  auditLog?: AuditLogEntry[];
  budgetViewMode?: 'simplified' | 'detailed' | 'draw_schedule'; 
  expandedInSimplifiedView?: string[];
  riskAdjustments?: RiskAdjustments;
  feasibilityData?: FeasibilityData;
  manualBaseRateOverride?: number;
  marketMetrics: MarketMetrics;
  walkthroughState?: WalkthroughState; 
  projectTypeMode?: ProjectTypeMode; 
}
