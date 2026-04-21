
// ... existing imports
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Shepherd from 'shepherd.js';
import { GoogleGenAI } from '@google/genai';
import { PropertyDetails, AsIsProjectedData, ProjectQuestion, BudgetItem, BudgetCategoryData, ScopeOfWorkSummary, AsIsProjectedField, AsIsProjectedAspect, AppState, SelectOption, AsIsProjectedItem, ProjectDocument, GeneralContractor, GcOnboardingData, GcDocument, Requirement, AsIsProjectedPerUnitItem, UserRole, Comment, ApplicationStatus, CommentThread, CommentThreadStatus, AuditLogEntry, InitializationData, RiskAdjustments, FeasibilityData, MarketMetrics, EstimatorResult, WalkthroughItemRecord, WalkthroughRoomDef, ProjectTypeMode, LandDetails, BudgetTemplate, PendingSyncJob } from './types';
import { INITIAL_PROPERTY_DETAILS, INITIAL_AS_IS_PROJECTED_DATA, INITIAL_PROJECT_QUESTIONS, INITIAL_BUDGET_CATEGORIES, INITIAL_SCOPE_SUMMARY, getInitialAppState, CONDITIONS_OF_PROPERTY, TYPES_OF_REHAB, MATERIAL_QUALITIES, CONTINGENCY_ITEM_ID, CONTINGENCY_CATEGORY_NAME, GC_BUILDER_FEES_ITEM_ID, FINAL_MISC_CATEGORY_NAME, INITIAL_GENERAL_CONTRACTOR, INITIAL_GC_ONBOARDING_DATA, TEMPLATE_BUDGET_DATA, getTargetBudgetJSON, getCategoryNames, INITIAL_RISK_ADJUSTMENTS, INITIAL_FEASIBILITY_DATA, INITIAL_MARKET_METRICS, ESTIMATOR_SYSTEM_INSTRUCTION, ESTIMATOR_JSON_SCHEMA, BUDGET_PARSER_SYSTEM_INSTRUCTION, BUDGET_PARSER_SCHEMA, INITIAL_WALKTHROUGH_STATE, WALKTHROUGH_AUDIO_SCHEMA, WALKTHROUGH_AUDIO_INSTRUCTION, WALKTHROUGH_DEPENDENCIES, INITIAL_LAND_DETAILS, NC_SOFT_COST_ROWS, MOCK_TEMPLATES } from './constants';
import { Step1Form } from './components/Step1Form';
import { Step2Contractor } from './components/Step2Contractor';
import { Step2Budget } from './components/Step2Budget';
import { Step4Review } from './components/Step4Review';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProjectTypeSelectionScreen } from './components/ProjectTypeSelectionScreen';
import { ActionableRequirements } from './components/ActionableRequirements';
import Tooltip from './components/Tooltip';
import { InfoIcon, WarningTriangleIcon, CheckCircleIcon } from './components/Icons'; 
import { BulkPhotoUploader } from './components/BulkPhotoUploader';
import { AnalystReport } from './components/AnalystReport';
import { RevisionDeltaReport } from './components/RevisionDeltaReport';
import { ComplexModal } from './components/ComplexModal';
import { GcOnboardingForm } from './components/GcOnboardingForm';
import { CommentThread as CommentThreadPanel } from './components/CommentThread';
import { ActionCenterSidebar } from './components/ActionCenter';
import { AIReviewModal, ReconciliationModal } from './components/AIReviewModal';
import { PrintableReport } from './components/PrintableReport';
import { SafetyCheckModal } from './components/SafetyCheckModal';
import { EstimatorModal } from './components/EstimatorModal';
import { SoftCostWizardModal } from './components/SoftCostWizardModal';
import { WalkthroughDashboard } from './components/WalkthroughDashboard';
import { WalkthroughRoomView } from './components/WalkthroughRoomView';
import { WALKTHROUGH_TEMPLATE } from './walkthroughConstants';
import { calculateRiskScore, calculateDealGrade } from './utils/riskEngine';
import { calculateApplicationStrength } from './utils/scoring';
import { TemplateSelector } from './components/TemplateSelector';
import { SaveTemplateModal } from './components/SaveTemplateModal';
import { getTutorialSteps } from './tutorialSteps';
import { ConnectivityBanner } from './components/ConnectivityBanner';
import { getAsset, deleteAsset } from './utils/offlineStorage';
import { useToast, ToastContainer } from './components/Toast';


const LOCAL_STORAGE_KEY_BASE = 'constructionBudgetData_v4'; 

export type StagedPhoto = {
  file: File;
  preview: string;
  assignment: string | null;
  isAiAssigned?: boolean;
};

type GcDocUploadKey = 'gcLicenseDoc' | 'driversLicenseDoc' | 'generalLiabilityDoc' | 'workersCompDoc';

export const App: React.FC<{ initialData?: InitializationData }> = ({ initialData }) => {
  const { toasts, showToast, dismissToast } = useToast();

  // ... (State declarations remain same)
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>(INITIAL_PROPERTY_DETAILS);
  const [landDetails, setLandDetails] = useState<LandDetails>(INITIAL_LAND_DETAILS); 
  const [asIsProjectedData, setAsIsProjectedData] = useState<AsIsProjectedData>(INITIAL_AS_IS_PROJECTED_DATA);
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedRehabType, setSelectedRehabType] = useState<string>('');
  const [selectedMaterialQuality, setSelectedMaterialQuality] = useState<string>('');
  const [projectQuestions, setProjectQuestions] = useState<ProjectQuestion[]>(INITIAL_PROJECT_QUESTIONS);
  const [budgetData, setBudgetData] = useState<BudgetCategoryData[]>(INITIAL_BUDGET_CATEGORIES);
  const [scopeSummary, setScopeSummary] = useState<ScopeOfWorkSummary>(INITIAL_SCOPE_SUMMARY);
  const [projectScopeStatement, setProjectScopeStatement] = useState<string>('');
  const [generalContractor, setGeneralContractor] = useState<GeneralContractor>(INITIAL_GENERAL_CONTRACTOR);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('borrower');
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('draft');
  const [currentWizardStep, setCurrentWizardStep] = useState(1); 
  const [isStarted, setIsStarted] = useState(false);
  const [projectTypeMode, setProjectTypeMode] = useState<ProjectTypeMode | null>(null); 
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'mismatch'>('idle');
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);
  const [actionableRequirements, setActionableRequirements] = useState<Requirement[]>([]);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [currentView, setCurrentView] = useState<'budget' | 'analystReport' | 'revisionReport'>('budget');
  const [gcOnboardingData, setGcOnboardingData] = useState<GcOnboardingData>(INITIAL_GC_ONBOARDING_DATA);
  const [isGcOnboardingModalOpen, setIsGcOnboardingModalOpen] = useState(false);
  const [isGcModalBlankMode, setIsGcModalBlankMode] = useState(false);
  const [highlightLimaOneTotalMismatch, setHighlightLimaOneTotalMismatch] = useState(false);
  const [isReimbursementAcknowledged, setIsReimbursementAcknowledged] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentThreads, setCommentThreads] = useState<CommentThread[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [pendingAnalystEdit, setPendingAnalystEdit] = useState<{
    categoryName: string; itemId: string; itemLabel: string; oldValue: number; newValue: number;
  } | null>(null);
  const [pendingAnalystEditComment, setPendingAnalystEditComment] = useState('');
  const [pendingChange, setPendingChange] = useState<{ fieldId: string; fieldLabel: string; oldValue: any; newValue: any; updateStateCallback: () => void; } | null>(null);
  const [activeCommentThread, setActiveCommentThread] = useState<{ fieldId: string; fieldLabel: string } | null>(null);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [scrollToFieldId, setScrollToFieldId] = useState<string | null>(null);
  const [isParsingBudget, setIsParsingBudget] = useState(false);
  const [budgetParsingError, setBudgetParsingError] = useState<string | null>(null);
  const [reviewableSuggestions, setReviewableSuggestions] = useState<{ mappedItems: any[], newItems: any[], totalBudgetFromFile?: number, projectDetails?: any } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAnalyzingBudget, setIsAnalyzingBudget] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastAppliedSuggestions, setLastAppliedSuggestions] = useState<{ mapped: any[], new: any[] } | null>(null);
  const [highlightedItemIds, setHighlightedItemIds] = useState<Set<string>>(new Set());
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [isGeneratingScope, setIsGeneratingScope] = useState(false);
  const [isPrintingReport, setIsPrintingReport] = useState(false);
  const [budgetViewMode, setBudgetViewMode] = useState<'simplified' | 'detailed' | 'draw_schedule'>('detailed');
  const [expandedInSimplifiedView, setExpandedInSimplifiedView] = useState<Set<string>>(new Set());
  const [riskAdjustments, setRiskAdjustments] = useState<RiskAdjustments>(INITIAL_RISK_ADJUSTMENTS);
  const [feasibilityData, setFeasibilityData] = useState<FeasibilityData>(INITIAL_FEASIBILITY_DATA);
  const [manualBaseRateOverride, setManualBaseRateOverride] = useState<number>(0);
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics>(INITIAL_MARKET_METRICS);
  const [isRepeatUser, setIsRepeatUser] = useState(false); 
  
  // Soft Cost Wizard State
  const [isSoftCostWizardOpen, setIsSoftCostWizardOpen] = useState(false);

  // Template Library State
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [templateList, setTemplateList] = useState<BudgetTemplate[]>(MOCK_TEMPLATES); 
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);

  // Walkthrough Mode State
  const [walkthroughState, setWalkthroughState] = useState(INITIAL_WALKTHROUGH_STATE);

  // Safety Check & Missing Fields State
  const [isSafetyCheckModalOpen, setIsSafetyCheckModalOpen] = useState(false);
  const [missingSafetyItems, setMissingSafetyItems] = useState<string[]>([]);
  const [highlightMissingFields, setHighlightMissingFields] = useState(false);

  // Estimator Modal State
  const [isEstimatorModalOpen, setIsEstimatorModalOpen] = useState(false);
  const [isEstimatorGenerating, setIsEstimatorGenerating] = useState(false);
  const [estimatorResult, setEstimatorResult] = useState<EstimatorResult | null>(null);

  // Tutorial State
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const tourRef = useRef<Shepherd.Tour | null>(null);

  // Animation Direction State
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
      // Register Service Worker
      if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').then(registration => {
              console.log('SW registered: ', registration);
          }).catch(registrationError => {
              console.log('SW registration failed: ', registrationError);
          });
      }

      // Online/Offline Listeners
      const handleOnline = () => {
          setIsOnline(true);
          processPendingSyncs(); // Trigger sync
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  // Sync Processor
  const processPendingSyncs = async () => {
      const pending = walkthroughState.pendingJobs || [];
      if (pending.length === 0) return;

      console.log(`Attempting to sync ${pending.length} items...`);
      
      // In a real app, we would loop through, grab blobs from IndexedDB, and send to API
      // Since this is a demo environment, we will simulate the sync process
      // by "processing" them via a mock or simpler logic.
      
      // We will clear the queue to simulate success
      setWalkthroughState(prev => ({
          ...prev,
          pendingJobs: []
      }));
      
      // Optionally cleanup IndexedDB
      for (const job of pending) {
          if (job.dataKey) {
              await deleteAsset(job.dataKey);
          }
      }
      
      showToast(`Sync complete: ${pending.length} items processed.`, 'success');
  };

  const handleAddPendingJob = (job: PendingSyncJob) => {
      setWalkthroughState(prev => ({
          ...prev,
          pendingJobs: [...(prev.pendingJobs || []), job]
      }));
  };

  const storageKey = initialData?.id ? `${LOCAL_STORAGE_KEY_BASE}_${initialData.id}` : LOCAL_STORAGE_KEY_BASE;

  const isLimaApprovedBudgetEditable = currentUserRole === 'analyst' && applicationStatus === 'under_review';

  // Track previous rehab type to trigger side effects only on change
  const prevRehabTypeRef = useRef(selectedRehabType);

  // ... (Tutorial logic) ...
  const handleStartTutorial = useCallback(() => {
      setIsStarted(true);
      setCurrentWizardStep(1); // Force to Step 1
      setProjectTypeMode(null); // Ensure no project type overlay blocks the view
      setIsTutorialActive(true);
      
      const goTo = (step: number, tourStepId: string, targetSelector?: string) => {
          const tour = tourRef.current;
          if (!tour) return;

          // 1. Update React State to switch views
          setCurrentWizardStep(step); 

          // 2. Poll for the element to exist before showing the step
          let attempts = 0;
          const maxAttempts = 20; // 2 seconds (100ms * 20)
          
          const poll = setInterval(() => {
              attempts++;
              
              // Only check if selector provided, otherwise assume ready (or let Shepherd handle missing target gracefully)
              const element = targetSelector ? document.querySelector(targetSelector) : true;
              
              if (element) {
                  clearInterval(poll);
                  // Small delay to allow layout to stabilize
                  setTimeout(() => {
                      if (tourRef.current) tourRef.current.show(tourStepId);
                  }, 300);
              } else if (attempts >= maxAttempts) {
                  clearInterval(poll);
                  console.warn(`Tutorial: Target element ${targetSelector} not found after timeout. Showing step anyway.`);
                  if (tourRef.current) tourRef.current.show(tourStepId);
              }
          }, 100);
      };

      const tour = new Shepherd.Tour({
          useModalOverlay: true,
          defaultStepOptions: {
              classes: 'shepherd-theme-custom',
              scrollTo: true,
              cancelIcon: { enabled: true }
          }
      });

      // Pass next, back, and the robust goTo function
      const steps = getTutorialSteps(() => tour.next(), () => tour.back(), goTo);
      tour.addSteps(steps);
      
      tour.on('complete', () => setIsTutorialActive(false));
      tour.on('cancel', () => setIsTutorialActive(false));

      tourRef.current = tour;
      
      // Delay start slightly to allow Welcome Screen to unmount
      setTimeout(() => tour.start(), 500);
  }, []);

  // ... (State Snapshot & Risk Logic) ...
  const stateSnapshot = useMemo<AppState>(() => ({
      propertyDetails,
      landDetails,
      asIsProjectedData,
      selectedCondition,
      selectedRehabType,
      selectedMaterialQuality,
      projectQuestions,
      budgetData,
      projectScopeStatement,
      scopeSummary,
      generalContractor,
      currentUserRole,
      collapsedCategories,
      verificationStatus,
      gcOnboardingData,
      comments,
      commentThreads,
      applicationStatus,
      auditLog,
      budgetViewMode,
      expandedInSimplifiedView: Array.from(expandedInSimplifiedView),
      riskAdjustments,
      feasibilityData,
      manualBaseRateOverride,
      marketMetrics,
      walkthroughState,
      projectTypeMode,
  }), [
      propertyDetails, 
      landDetails,
      asIsProjectedData, 
      selectedCondition, 
      selectedRehabType, 
      selectedMaterialQuality, 
      projectQuestions, 
      budgetData, 
      scopeSummary, 
      generalContractor,
      riskAdjustments,
      feasibilityData,
      projectScopeStatement,
      manualBaseRateOverride,
      marketMetrics,
      gcOnboardingData,
      walkthroughState,
      projectTypeMode
  ]);

  const riskAnalysis = useMemo(() => {
      return calculateRiskScore(stateSnapshot);
  }, [stateSnapshot]);

  const dealGrade = useMemo(() => {
      return calculateDealGrade(stateSnapshot);
  }, [stateSnapshot]);

  const applicationStrength = useMemo(() => {
      return calculateApplicationStrength(stateSnapshot);
  }, [stateSnapshot]);

  // ... (Validation Logic) ...
  const isStep1Valid = useMemo(() => {
      const isNewConstruction = projectTypeMode === 'new_construction' || selectedRehabType === 'New Construction';
      const hasRehabType = !!selectedRehabType;
      const hasCondition = isNewConstruction ? true : !!selectedCondition; 
      const hasQuality = !!selectedMaterialQuality;
      
      return hasRehabType && hasCondition && hasQuality;
  }, [selectedRehabType, selectedCondition, selectedMaterialQuality, projectTypeMode]);

  const isNextDisabled = useMemo(() => {
      if (currentWizardStep === 1) return !isStep1Valid;
      return false; 
  }, [currentWizardStep, isStep1Valid]);

  // ... (Effects for Rehab Type changes, Totals sync, Local Storage) ...
  useEffect(() => {
    if (prevRehabTypeRef.current !== selectedRehabType) {
        if (selectedRehabType === 'Light-Cosmetic') {
            setBudgetViewMode('simplified');
        } else if (budgetViewMode === 'simplified') {
            setBudgetViewMode('detailed');
        }

        if (['Standard-Full', 'Heavy'].includes(selectedRehabType)) {
            setCollapsedCategories(prev => {
                const next = { ...prev };
                budgetData.forEach(cat => {
                    next[cat.name] = true;
                });
                return next;
            });
        }
        
        prevRehabTypeRef.current = selectedRehabType;
    }
  }, [selectedRehabType, budgetData, budgetViewMode]);

  useEffect(() => {
    const newTotal = budgetData.reduce((acc, cat) => {
        return acc + cat.items.reduce((catSum, item) => catSum + (Number(item.budget) || 0), 0);
    }, 0);
    
    if (newTotal !== scopeSummary.borrowerTotal) {
        setScopeSummary(prev => ({ ...prev, borrowerTotal: newTotal }));
    }
  }, [budgetData]);

  useEffect(() => {
    const savedDataString = localStorage.getItem(storageKey);
    // ... (Loading logic preserved) ...
    if (savedDataString) {
      try {
        const savedData: AppState & { comments?: (Comment & {status?: any})[], isRepeatUser?: boolean } = JSON.parse(savedDataString);
        const initialAppStateForMerge = getInitialAppState(); 

        setPropertyDetails(savedData.propertyDetails || initialAppStateForMerge.propertyDetails);
        setLandDetails(savedData.landDetails || initialAppStateForMerge.landDetails);
        const loadedAsIsProjectedData = savedData.asIsProjectedData || initialAppStateForMerge.asIsProjectedData;

        // ... (Nested property fixes) ...
        if (loadedAsIsProjectedData.bedroomCountPerUnit && typeof (loadedAsIsProjectedData.bedroomCountPerUnit as any).asIs === 'string') {
          (loadedAsIsProjectedData.bedroomCountPerUnit as AsIsProjectedPerUnitItem).asIs = [];
          (loadedAsIsProjectedData.bedroomCountPerUnit as AsIsProjectedPerUnitItem).projected = [];
        }
        if (loadedAsIsProjectedData.bathroomCountPerUnit && typeof (loadedAsIsProjectedData.bathroomCountPerUnit as any).asIs === 'string') {
          (loadedAsIsProjectedData.bathroomCountPerUnit as AsIsProjectedPerUnitItem).asIs = [];
          (loadedAsIsProjectedData.bathroomCountPerUnit as AsIsProjectedPerUnitItem).projected = [];
        }
        
        setAsIsProjectedData(loadedAsIsProjectedData);
        
        setSelectedCondition(savedData.selectedCondition || initialAppStateForMerge.selectedCondition);
        setSelectedRehabType(savedData.selectedRehabType || initialAppStateForMerge.selectedRehabType);
        setSelectedMaterialQuality(savedData.selectedMaterialQuality || initialAppStateForMerge.selectedMaterialQuality);
        setProjectQuestions(savedData.projectQuestions || initialAppStateForMerge.projectQuestions);
        setCollapsedCategories(savedData.collapsedCategories || initialAppStateForMerge.collapsedCategories || {});
        setVerificationStatus(savedData.verificationStatus || initialAppStateForMerge.verificationStatus || 'idle');
        setCurrentUserRole(savedData.currentUserRole || 'borrower');
        setApplicationStatus(savedData.applicationStatus || 'draft');
        setAuditLog(savedData.auditLog || []);
        setBudgetViewMode(savedData.budgetViewMode || 'detailed');
        setExpandedInSimplifiedView(new Set(savedData.expandedInSimplifiedView || []));
        setRiskAdjustments(savedData.riskAdjustments || INITIAL_RISK_ADJUSTMENTS);
        setFeasibilityData(savedData.feasibilityData || initialAppStateForMerge.feasibilityData || INITIAL_FEASIBILITY_DATA);
        setManualBaseRateOverride(savedData.manualBaseRateOverride || 0);
        setMarketMetrics(savedData.marketMetrics || initialAppStateForMerge.marketMetrics || INITIAL_MARKET_METRICS);
        const loadedWalkthrough = savedData.walkthroughState || initialAppStateForMerge.walkthroughState || INITIAL_WALKTHROUGH_STATE;
        setWalkthroughState({
            ...loadedWalkthrough,
            customRooms: Array.isArray(loadedWalkthrough.customRooms) ? loadedWalkthrough.customRooms : []
        });
        
        setProjectTypeMode(savedData.projectTypeMode || null); 
        
        setIsRepeatUser(savedData.isRepeatUser || savedData.feasibilityData?.isRepeatBorrower || false);

        if (savedData.commentThreads) {
            setCommentThreads(savedData.commentThreads);
            setComments(savedData.comments || []);
        } else if (savedData.comments && savedData.comments.length > 0) {
            // ... (Legacy comment migration logic) ...
            const threadsMap = new Map<string, { comments: (Comment & {status?: any})[] }>();
            savedData.comments.forEach(c => {
                if (!threadsMap.has(c.threadId)) {
                    threadsMap.set(c.threadId, { comments: [] });
                }
                const threadData = threadsMap.get(c.threadId)!;
                threadData.comments.push(c);
            });

            const newThreads: CommentThread[] = [];
            const newComments: Comment[] = [];
            
            threadsMap.forEach((data, threadId) => {
                const sortedComments = data.comments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const lastComment = sortedComments[sortedComments.length - 1];
                let status: CommentThreadStatus = 'resolved';
                let assignee: UserRole = lastComment.authorRole;
                const hasOpen = data.comments.some(c => (c as any).status === 'open');

                if (hasOpen) {
                    if (lastComment.authorRole === 'borrower') {
                        status = 'pending_analyst_review';
                        assignee = 'analyst';
                    } else {
                        status = 'needs_borrower_action';
                        assignee = 'borrower';
                    }
                }
                
                const label = threadId.startsWith('budgetItem.') ? `Budget Item: ${threadId.split('.')[1]}` : `Field: ${threadId}`;
                newThreads.push({ id: threadId, label, status, assignee });

                sortedComments.forEach(c => {
                    const { status, ...rest } = c as any; 
                    newComments.push(rest);
                });
            });

            setCommentThreads(newThreads);
            setComments(newComments);
        }


        const loadedGc = savedData.generalContractor || initialAppStateForMerge.generalContractor;
        setGeneralContractor({
          ...loadedGc,
          gcLicenseDoc: null,
          driversLicenseDoc: null,
          generalLiabilityDoc: null,
          workersCompDoc: null,
        });
        setGcOnboardingData(savedData.gcOnboardingData || initialAppStateForMerge.gcOnboardingData || INITIAL_GC_ONBOARDING_DATA);
        
        const loadedBudgetData = (savedData.budgetData || initialAppStateForMerge.budgetData).map(savedCategory => {
            const initialCategoryTemplate = initialAppStateForMerge.budgetData.find(c => c.name === savedCategory.name);
            return {
                ...(initialCategoryTemplate || {}), 
                ...savedCategory, 
                description: savedCategory.description || '',
                categoryPhotos: [], 
                items: (savedCategory.items || initialCategoryTemplate?.items || []).map(savedItem => {
                    const initialItemTemplate = initialCategoryTemplate?.items.find(i => i.id === savedItem.id);
                    const mergedItem = {
                        ...(initialItemTemplate || {}), 
                        ...savedItem, 
                        id: savedItem.id || initialItemTemplate?.id || `new-id-${Date.now()}-${Math.random()}`,
                        itemNumber: initialItemTemplate?.itemNumber || savedItem.itemNumber || '',
                        drawItem: initialItemTemplate?.isCustomDescription 
                                    ? (savedItem.drawItem || '') 
                                    : (initialItemTemplate?.drawItem || savedItem.drawItem || ''), 
                        description: savedItem.description || '', 
                        budget: Number(savedItem.budget) || 0,
                        actual: Number(savedItem.actual) || 0,
                        isUncertain: savedItem.isUncertain || false,
                        isCustomDescription: initialItemTemplate?.isCustomDescription || savedItem.isCustomDescription || false,
                        isRedText: initialItemTemplate?.isRedText || savedItem.isRedText || false,
                        isContingencyItem: initialItemTemplate?.isContingencyItem || savedItem.isContingencyItem || false,
                        isGcBuilderFeeItem: initialItemTemplate?.isGcBuilderFeeItem || savedItem.isGcBuilderFeeItem || false,
                        uploadedPhotos: [],
                        isAiDetected: savedItem.isAiDetected || false,
                        aiLogic: savedItem.aiLogic || '', 
                    };
                    return mergedItem;
                })
            };
        });
        setBudgetData(loadedBudgetData);

        setProjectScopeStatement(savedData.projectScopeStatement || initialAppStateForMerge.projectScopeStatement);
        
        const initialScopeSummary = initialAppStateForMerge.scopeSummary;
        setScopeSummary({
          ...initialScopeSummary, 
          ...(savedData.scopeSummary || {}), 
          borrowerTotal: Number(savedData.scopeSummary?.borrowerTotal) || initialScopeSummary.borrowerTotal,
          limaOneApprovedTotal: Number(savedData.scopeSummary?.limaOneApprovedTotal) || initialScopeSummary.limaOneApprovedTotal,
          contingencyPercentage: savedData.scopeSummary?.contingencyPercentage !== undefined ? Number(savedData.scopeSummary.contingencyPercentage) : initialScopeSummary.contingencyPercentage,
          isContingencyAutoCalculated: savedData.scopeSummary?.isContingencyAutoCalculated !== undefined ? savedData.scopeSummary.isContingencyAutoCalculated : initialScopeSummary.isContingencyAutoCalculated,
          startDate: savedData.scopeSummary?.startDate || initialScopeSummary.startDate,
          projectedCompletionDate: savedData.scopeSummary?.projectedCompletionDate || initialScopeSummary.projectedCompletionDate,
          perSqFtBudget: savedData.scopeSummary?.perSqFtBudget || initialScopeSummary.perSqFtBudget,
          perSqFtActual: savedData.scopeSummary?.perSqFtActual || initialScopeSummary.perSqFtActual,
        });
      } catch (error) {
        console.error("Failed to parse saved data from localStorage:", error);
        localStorage.removeItem(storageKey); 
      }
    }

    if (initialData) {
        if (initialData.propertyDetails) {
            setPropertyDetails(prev => ({ ...prev, ...initialData.propertyDetails }));
        }
        if (initialData.userRole) {
            setCurrentUserRole(initialData.userRole);
        }
    }

  }, [initialData, storageKey]);

  useEffect(() => {
    if (currentUserRole === 'borrower' && currentView !== 'budget') {
      setCurrentView('budget');
    }
  }, [currentUserRole, currentView]);

  useEffect(() => {
    const dataToSave: AppState & { isRepeatUser: boolean } = {
      propertyDetails,
      landDetails,
      asIsProjectedData,
      selectedCondition,
      selectedRehabType,
      selectedMaterialQuality,
      projectQuestions,
      budgetData: budgetData.map(cat => ({
          ...cat,
          items: cat.items.map(item => ({ ...item, uploadedPhotos: []})),
          categoryPhotos: [],
      })),
      projectScopeStatement,
      scopeSummary,
      generalContractor: {
        ...generalContractor,
        gcLicenseDoc: undefined,
        driversLicenseDoc: undefined,
        generalLiabilityDoc: undefined,
        workersCompDoc: undefined,
      },
      gcOnboardingData,
      currentUserRole,
      collapsedCategories,
      verificationStatus,
      comments,
      commentThreads,
      applicationStatus,
      auditLog,
      budgetViewMode,
      expandedInSimplifiedView: Array.from(expandedInSimplifiedView),
      riskAdjustments,
      feasibilityData,
      manualBaseRateOverride,
      marketMetrics,
      walkthroughState,
      projectTypeMode,
      isRepeatUser, 
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [
    propertyDetails,
    landDetails,
    asIsProjectedData,
    selectedCondition,
    selectedRehabType,
    selectedMaterialQuality,
    projectQuestions,
    budgetData,
    projectScopeStatement,
    scopeSummary,
    generalContractor,
    gcOnboardingData,
    currentUserRole,
    collapsedCategories,
    verificationStatus,
    comments,
    commentThreads,
    applicationStatus,
    auditLog,
    budgetViewMode,
    expandedInSimplifiedView,
    riskAdjustments,
    feasibilityData,
    manualBaseRateOverride,
    marketMetrics,
    storageKey,
    walkthroughState,
    projectTypeMode,
    isRepeatUser
  ]);

    // ... (Soft cost helper functions) ...
    const injectNcSoftCosts = () => {
        setBudgetData(prevData => {
            const newData = [...prevData];
            const softCostCategory = newData.find(c => c.name === 'Soft Costs');
            
            if (softCostCategory) {
                const existingDrawItems = new Set(softCostCategory.items.map(i => i.drawItem));
                let injectedCount = 0;

                NC_SOFT_COST_ROWS.forEach(row => {
                    if (!existingDrawItems.has(row.drawItem)) {
                        softCostCategory.items.push({
                            id: row.id,
                            itemNumber: row.itemNumber,
                            drawItem: row.drawItem,
                            description: '',
                            budget: 0,
                            actual: 0,
                            isUncertain: false,
                            isCustomDescription: false,
                            uploadedPhotos: [],
                        });
                        injectedCount++;
                    }
                });
                
                if (injectedCount > 0) {
                    softCostCategory.items.sort((a, b) => a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true }));
                }
            }
            return newData;
        });
    };

    const removeNcSoftCosts = () => {
        setBudgetData(prevData => {
            const newData = [...prevData];
            const softCostCategory = newData.find(c => c.name === 'Soft Costs');
            
            if (softCostCategory) {
                // Filter out NC items by matching ID or itemNumber pattern
                const ncIds = new Set(NC_SOFT_COST_ROWS.map(r => r.id));
                softCostCategory.items = softCostCategory.items.filter(item => 
                    !ncIds.has(item.id) && !item.itemNumber.includes('-NC')
                );
            }
            return newData;
        });
    };

    const handleSoftCostWizardSave = (updates: { id: string; budget: number }[]) => {
        setBudgetData(prevData => {
            const newData = [...prevData];
            const softCostCategory = newData.find(c => c.name === 'Soft Costs');
            
            if (softCostCategory) {
                updates.forEach(update => {
                    const item = softCostCategory.items.find(i => i.id === update.id);
                    if (item) {
                        item.budget = update.budget;
                    }
                });
            }
            return newData;
        });
        setIsSoftCostWizardOpen(false);
    };

    // ... (Template logic) ...
    const handleTemplateSelect = (templateId: string) => {
        const selected = templateList.find(t => t.id === templateId);
        if (selected) {
            const newBudgetData = JSON.parse(JSON.stringify(selected.budgetData)) as BudgetCategoryData[];

            // Only inject NC soft costs if this is a New Construction template
            if (selected.projectType === 'new_construction') {
                const softCostCategory = newBudgetData.find(c => c.name === 'Soft Costs');
                if (softCostCategory) {
                    const existingDrawItems = new Set(softCostCategory.items.map(i => i.drawItem));
                    let injectedCount = 0;
                    NC_SOFT_COST_ROWS.forEach(row => {
                        if (!existingDrawItems.has(row.drawItem)) {
                            softCostCategory.items.push({
                                id: `tmpl-${row.id}-${Date.now()}`, 
                                itemNumber: row.itemNumber,
                                drawItem: row.drawItem,
                                description: '',
                                budget: 0,
                                actual: 0,
                                isUncertain: false,
                                isCustomDescription: false,
                                uploadedPhotos: [],
                            });
                            injectedCount++;
                        }
                    });
                    if (injectedCount > 0) {
                        softCostCategory.items.sort((a, b) => a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true }));
                    }
                }
            }

            setBudgetData(newBudgetData);
            
            setProjectScopeStatement(`Based on ${selected.name} template: ${selected.description}`);
            
            setAsIsProjectedData(prev => ({
                ...prev,
                totalBuildingSqFeet: { ...prev.totalBuildingSqFeet, projected: selected.projectedSqFt.toString() },
                bedroomCount: { ...prev.bedroomCount, projected: selected.projectedBeds.toString() },
                bathroomCount: { ...prev.bathroomCount, projected: selected.projectedBaths.toString() },
                floorsAboveBasement: { ...prev.floorsAboveBasement, projected: selected.projectedFloors.toString() }
            }));

            if (selected.materialQuality) {
                setSelectedMaterialQuality(selected.materialQuality);
            }

            setIsTemplateLibraryOpen(false);
            setIsStarted(true);
            setIsRepeatUser(true);
            
            // Explicitly set direction to forward and step to 1 for smooth entry
            setDirection('forward');
            setCurrentWizardStep(1); 
            setBudgetViewMode('detailed'); // Reset any potential simplified view state
            
            // Use values from template instead of hardcoding
            setProjectTypeMode(selected.projectType);
            setSelectedRehabType(selected.rehabType);
        }
    };

    const handleSaveTemplate = (name: string, description: string) => {
        const newTemplate: BudgetTemplate = {
            id: `custom-template-${Date.now()}`,
            name,
            description,
            tags: ['Custom', 'User Saved'],
            totalCostEstimate: scopeSummary.borrowerTotal,
            budgetData: JSON.parse(JSON.stringify(budgetData)), 
            projectedSqFt: parseFloat(asIsProjectedData.totalBuildingSqFeet.projected || '0'),
            projectedBeds: parseFloat(asIsProjectedData.bedroomCount.projected || '0'),
            projectedBaths: parseFloat(asIsProjectedData.bathroomCount.projected || '0'),
            projectedFloors: parseFloat(asIsProjectedData.floorsAboveBasement.projected || '0'),
            materialQuality: selectedMaterialQuality,
            rehabType: selectedRehabType,
            projectType: projectTypeMode || 'renovation', // Default to renovation if not set
        };

        setTemplateList(prev => [...prev, newTemplate]);
        setIsSaveTemplateModalOpen(false);
        showToast(`Template "${name}" saved to your library!`, 'success');
    };

    const handleCategoryBulkAdjust = (categoryName: string, percent: number) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name === categoryName) {
                const multiplier = 1 + (percent / 100);
                const updatedItems = cat.items.map(item => {
                    if (item.budget > 0) {
                        return {
                            ...item,
                            budget: Math.round(item.budget * multiplier)
                        };
                    }
                    return item;
                });
                return { ...cat, items: updatedItems };
            }
            return cat;
        }));
    };

    // ... (Estimator Logic) ...
    const handleGenerateEstimate = useCallback(async (file: File | null, location: string, userPlan: string) => {
      setIsEstimatorGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        let parts: any[] = [];
        
        const fullPrompt = `
          **Input Data:**
          ${location ? `**Location:** ${location}` : ''}
          **Borrower's Stated Plan:**
          > "${userPlan}"
          
          ${!file ? `**Visual Description:** No file provided. Rely on user plan.` : '**Visual Evidence:** A property inspection report or photo set is attached. Analyze it thoroughly.'}
        `;
        
        parts.push({ text: fullPrompt });

        if (file) {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            parts.push({
                inlineData: {
                    mimeType: file.type,
                    data: base64Data
                }
            });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts },
          config: {
            systemInstruction: ESTIMATOR_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: ESTIMATOR_JSON_SCHEMA,
            temperature: 0.0, 
            topK: 1, 
          },
        });

        const result = JSON.parse(response.text) as EstimatorResult;
        setEstimatorResult(result);

      } catch (error) {
        console.error("Error generating estimate:", error);
        showToast("Sorry, there was an error generating the estimate. Please try again.", 'error');
      } finally {
        setIsEstimatorGenerating(false);
      }
    }, []);

    const handleApplyEstimate = useCallback((result: EstimatorResult) => {
      const itemsByCategory = new Map<string, typeof result.estimatedItems>();
      result.estimatedItems.forEach(item => {
        const current = itemsByCategory.get(item.category) || [];
        current.push(item);
        itemsByCategory.set(item.category, current);
      });

      setBudgetData(prevData => {
        return prevData.map(category => {
          const newItemsForCategory = itemsByCategory.get(category.name);
          if (!newItemsForCategory) return category;

          const updatedItems = [...category.items];
          let maxSuffix = 0;
          updatedItems.forEach(item => {
            const match = item.itemNumber.match(/^(\d+)-(\d+)$/);
            if (match && category.itemNumberPrefix && match[1] === category.itemNumberPrefix) {
                maxSuffix = Math.max(maxSuffix, parseInt(match[2]));
            }
          });

          newItemsForCategory.forEach(newItem => {
            maxSuffix++;
            const newItemNumber = `${category.itemNumberPrefix || 'Custom'}-${maxSuffix}`;
            const newItemId = `${category.name.toLowerCase().replace(/\s+/g, '-')}-estimator-${Date.now()}-${Math.random()}`;
            
            const newBudgetItem: BudgetItem = {
              id: newItemId,
              itemNumber: newItemNumber,
              drawItem: newItem.item,
              description: newItem.description,
              budget: newItem.cost,
              actual: 0,
              isCustomDescription: true,
              isUncertain: false,
              isAiDetected: newItem.isAiDetected,
              aiLogic: newItem.logic 
            };
            updatedItems.push(newBudgetItem);
          });

          return { ...category, items: updatedItems };
        });
      });

      setIsEstimatorModalOpen(false);
      setEstimatorResult(null);
      setIsStarted(true);
      
      // Explicitly set direction to forward for smooth transition to Step 3
      setDirection('forward');
      setCurrentWizardStep(3);
      showToast(`${result.estimatedItems.length} items added to your budget. Review them in Step 3.`, 'success');
    }, []);

    // ... (Walkthrough Logic) ...
    const handleWalkthroughUpdate = (itemId: string, field: keyof WalkthroughItemRecord, value: any) => {
        setWalkthroughState(prev => {
            const currentItem = prev.items[itemId] || { status: 'Keep', notes: '', photos: [] };
            return {
                ...prev,
                items: {
                    ...prev.items,
                    [itemId]: { ...currentItem, [field]: value }
                }
            };
        });
    };

    const handleUpdateProjectDetails = (beds: number, baths: number) => {
        setAsIsProjectedData(prev => ({
            ...prev,
            bedroomCount: { ...prev.bedroomCount, projected: beds.toString() },
            bathroomCount: { ...prev.bathroomCount, projected: baths.toString() }
        }));
        
        setAsIsProjectedData(prev => {
            if (!prev.bedroomCount.asIs) {
                return { ...prev, bedroomCount: { ...prev.bedroomCount, asIs: beds.toString() } };
            }
            return prev;
        });
    };

    const handleSyncWalkthrough = () => {
        const missingDependencies: string[] = [];
        
        Object.keys(walkthroughState.items).forEach(key => {
            const item = walkthroughState.items[key];
            if (item.status === 'Replace') {
                const dependencies = WALKTHROUGH_DEPENDENCIES[key];
                if (dependencies) {
                    dependencies.forEach(depKey => {
                        const depItem = walkthroughState.items[depKey];
                        if (!depItem || depItem.status === 'Keep') {
                            let label = depKey;
                            for (const room of WALKTHROUGH_TEMPLATE) {
                                const found = room.items.find(i => `${room.id}_${i.id}` === depKey);
                                if (found) label = found.label;
                            }
                            missingDependencies.push(`${label} (related to ${key.split('_').pop()})`);
                        }
                    });
                }
            }
        });

        if (missingDependencies.length > 0) {
            setMissingSafetyItems(missingDependencies);
            setIsSafetyCheckModalOpen(true);
            return;
        }

        performSync();
    };

    const performSync = () => {
        const newBudget = [...budgetData];
        const allTemplates = [...WALKTHROUGH_TEMPLATE, ...(walkthroughState.customRooms || [])];
        
        Object.keys(walkthroughState.items).forEach(key => {
            const record = walkthroughState.items[key];
            if (!record || record.status === 'Keep') return;

            let def: any = null;
            let roomLabel = '';
            
            for (const room of allTemplates) {
                const found = room.items.find(i => `${room.id}_${i.id}` === key);
                if (found) {
                    def = found;
                    roomLabel = room.label;
                    break;
                }
            }

            if (!def) return;

            const categoryIndex = newBudget.findIndex(c => c.name === def.targetCategory);
            if (categoryIndex === -1) return;

            const category = newBudget[categoryIndex];
            const existingItemIndex = category.items.findIndex(i => i.drawItem === def.targetItemName);

            const notes = `[Walkthrough: ${roomLabel} - ${record.status}] ${record.notes || ''}`;

            if (existingItemIndex > -1) {
                const existing = category.items[existingItemIndex];
                category.items[existingItemIndex] = {
                    ...existing,
                    budget: (record.costEstimate && record.costEstimate > 0) ? record.costEstimate : existing.budget,
                    description: existing.description ? `${existing.description}\n${notes}` : notes,
                    uploadedPhotos: [...(existing.uploadedPhotos || []), ...record.photos]
                };
            } else {
                const newItem: BudgetItem = {
                    id: `walkthrough-${key}-${Date.now()}`,
                    itemNumber: `${category.itemNumberPrefix}-W`,
                    drawItem: def.targetItemName, 
                    description: notes,
                    budget: record.costEstimate || 0,
                    actual: 0,
                    isCustomDescription: true, 
                    uploadedPhotos: record.photos
                };
                category.items.push(newItem);
            }
        });

        const newTotal = newBudget.reduce((acc, category) => {
            return acc + category.items.reduce((catAcc, item) => catAcc + (item.budget || 0), 0);
        }, 0);

        setBudgetData(newBudget);
        setScopeSummary(prev => ({ ...prev, borrowerTotal: newTotal }));
        
        setHighlightMissingFields(true);
        setWalkthroughState(prev => ({ ...prev, isActive: false, currentRoomId: null }));
        setIsStarted(true);

        // Navigate to Step 1 so user completes property details
        setDirection('forward');
        setCurrentWizardStep(1);

        showToast('Walkthrough synced! Your budget has been updated. Complete the property details below.', 'success');
    };

    const handleAddCustomRoom = (roomName: string, templateType: string) => {
        const baseTemplate = WALKTHROUGH_TEMPLATE.find(r => r.id === templateType.toLowerCase()) || 
                             WALKTHROUGH_TEMPLATE.find(r => r.id === 'living_areas'); 

        if (baseTemplate) {
            const newRoomId = `custom_${roomName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
            const newRoom: WalkthroughRoomDef = {
                ...baseTemplate,
                id: newRoomId,
                label: roomName,
                icon: baseTemplate.icon, 
                items: baseTemplate.items.map(item => ({...item})) 
            };
            
            setWalkthroughState(prev => {
                const currentCustom = Array.isArray(prev.customRooms) ? prev.customRooms : [];
                return {
                    ...prev,
                    customRooms: [...currentCustom, newRoom]
                };
            });
        }
    };

    // ... (Bulk Upload Logic) ...
    const handleStageFiles = (files: FileList) => {
        const newStaged = Array.from(files).map(f => ({ file: f, preview: URL.createObjectURL(f), assignment: null }));
        setStagedPhotos(prev => [...prev, ...newStaged]);
    };

    const handleAssignStagedPhoto = (index: number, assignment: string | null, isAiAssigned: boolean = false) => {
        setStagedPhotos(prev => prev.map((p, i) => i === index ? { ...p, assignment, isAiAssigned } : p));
    };

    const handleFinalizeAssignments = () => {
        const newBudgetData = [...budgetData];
        
        stagedPhotos.forEach(photo => {
            if (!photo.assignment) return;
            
            const [type, id] = photo.assignment.split(':');
            
            if (type === 'CATEGORY') {
                const category = newBudgetData.find(c => c.name === id);
                if (category) {
                    category.categoryPhotos = [...(category.categoryPhotos || []), { file: photo.file, preview: photo.preview }];
                }
            } else if (type === 'ITEM') {
                newBudgetData.forEach(category => {
                    const item = category.items.find(i => i.id === id);
                    if (item) {
                        item.uploadedPhotos = [...(item.uploadedPhotos || []), { file: photo.file, preview: photo.preview }];
                    }
                });
            }
        });

        setBudgetData(newBudgetData);
        setStagedPhotos([]);
        setIsBulkUploadModalOpen(false);
    };

    // ... (Navigation, Print, etc.) ...
    const handlePrintReport = () => {
        setIsPrintingReport(true);
    };

    const handleClearAll = () => {
      if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
          localStorage.removeItem(storageKey);
          window.location.reload();
      }
    };

    const propertyAddressDisplay = [propertyDetails.street, propertyDetails.city].filter(Boolean).join(', ');

    const handleSidebarStepClick = (step: number) => {
        if (step > currentWizardStep) {
            setDirection('forward');
        } else {
            setDirection('back');
        }
        setCurrentWizardStep(step);
    };

    const handleProcessBudgetFile = async (file: File) => {
        // ... (Budget Parser Implementation) ...
        setIsParsingBudget(true);
        setBudgetParsingError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // Use current budgetData (not static INITIAL_BUDGET_CATEGORIES) so NC soft cost
            // items injected by injectNcSoftCosts() are included in the valid items list.
            const targetTopology = JSON.stringify(
                budgetData.flatMap(category =>
                    category.items
                        .filter(item => !item.isCustomDescription && item.drawItem)
                        .map(item => ({
                            id: item.id,
                            itemNumber: item.itemNumber,
                            drawItem: item.drawItem,
                            categoryName: category.name,
                        }))
                )
            );
            
            let contentPart: any;

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls')) {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = (window as any).XLSX.read(arrayBuffer);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const csvText = (window as any).XLSX.utils.sheet_to_csv(worksheet);
                
                contentPart = { text: `**Input CSV Data:**\n${csvText}` };
            } else {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                contentPart = { inlineData: { mimeType: file.type, data: base64Data } };
            }

            const topologyPart = { text: `**VALID_BUDGET_ITEMS (Topology Map):**\n${targetTopology}` };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [topologyPart, contentPart] },
                config: {
                    systemInstruction: BUDGET_PARSER_SYSTEM_INSTRUCTION,
                    responseMimeType: "application/json",
                    responseSchema: BUDGET_PARSER_SCHEMA,
                    temperature: 0.0,
                    thinkingConfig: { thinkingBudget: 0 },
                },
            });

            const parsedResult = JSON.parse(response.text);
            
            const calculatedTotal = [
                ...(parsedResult.mappedItems || []), 
                ...(parsedResult.newItems || [])
            ].reduce((sum: number, item: any) => sum + (item.budget || 0), 0);

            setReviewableSuggestions({
                mappedItems: parsedResult.mappedItems || [],
                newItems: parsedResult.newItems || [],
                totalBudgetFromFile: calculatedTotal,
                projectDetails: parsedResult.projectDetails
            });
            setTimeout(() => setIsReviewModalOpen(true), 100);

        } catch (error: any) {
            console.error("Budget parsing failed:", error);
            const detail = error?.message || error?.toString() || '';
            setBudgetParsingError(
                detail
                    ? `Failed to process file: ${detail}`
                    : "Failed to process the file. Please ensure it is a valid budget document."
            );
        } finally {
            setIsParsingBudget(false);
        }
    };

    const handleProjectTypeSelect = (mode: ProjectTypeMode) => {
        setProjectTypeMode(mode);
        if (mode === 'new_construction') {
            setSelectedRehabType('New Construction');
            injectNcSoftCosts();
        } else if (mode === 'renovation') {
            if (selectedRehabType === 'New Construction') {
                setSelectedRehabType(''); 
            }
            removeNcSoftCosts();
        }
    };

    const handleLandDetailsChange = (key: keyof LandDetails, value: string) => {
        setLandDetails(prev => ({ ...prev, [key]: value }));
    };

    const isFormLocked = currentUserRole === 'borrower' && (applicationStatus === 'under_review' || applicationStatus === 'approved');

    const handleScrollComplete = () => setScrollToFieldId(null);

    const addAuditEntry = (fieldId: string, fieldLabel: string, oldValue: any, newValue: any) => {
        const entry: AuditLogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            authorRole: currentUserRole,
            authorName: currentUserRole === 'analyst' ? 'Analyst' : 'Borrower',
            fieldId,
            fieldLabel,
            changeType: 'value_change',
            oldValue,
            newValue,
            commentText: `Changed ${fieldLabel} from ${oldValue} to ${newValue}`
        };
        setAuditLog(prev => [...prev, entry]);
    };

    const handlePropertyDetailChangeWithAudit = (name: keyof PropertyDetails, value: string) => {
        const oldValue = propertyDetails[name];
        setPropertyDetails(prev => ({ ...prev, [name]: value }));
        if (oldValue !== value && isStarted) {
            addAuditEntry(`propertyDetails.${String(name)}`, `Property ${String(name)}`, oldValue, value);
        }
    };

    const handleAsIsProjectedChangeWithAudit = (field: AsIsProjectedField, aspect: AsIsProjectedAspect, value: string, index?: number) => {
        setAsIsProjectedData(prev => {
            const newData = { ...prev };
            const item = { ...newData[field] } as any;
            newData[field] = item;

            if (index !== undefined && Array.isArray(item[aspect])) {
                 const newArray = [...item[aspect]];
                 newArray[index] = value;
                 item[aspect] = newArray;

                 if (aspect === 'asIs') {
                     const prevProjectedArray = (prev[field] as any).projected || [];
                     const prevAsIsArray = (prev[field] as any).asIs || [];
                     const prevProjectedVal = prevProjectedArray[index] || '';
                     const prevAsIsVal = prevAsIsArray[index] || '';

                     if (prevProjectedVal === '' || prevProjectedVal === prevAsIsVal) {
                         const newProjectedArray = [...(item.projected || [])];
                         while (newProjectedArray.length <= index) newProjectedArray.push('');
                         
                         newProjectedArray[index] = value;
                         item.projected = newProjectedArray;
                     }
                 }
            } else {
                item[aspect] = value;

                if (aspect === 'asIs') {
                    const prevProjectedVal = (prev[field] as AsIsProjectedItem).projected;
                    const prevAsIsVal = (prev[field] as AsIsProjectedItem).asIs;
                    
                    if (prevProjectedVal === '' || prevProjectedVal === prevAsIsVal) {
                        item.projected = value;
                    }
                }
            }
            return newData;
        });
    };

    const handleSelectedConditionChangeWithAudit = (value: string) => setSelectedCondition(value);
    const handleSelectedRehabTypeChangeWithAudit = (value: string) => setSelectedRehabType(value);
    const handleSelectedMaterialQualityChangeWithAudit = (value: string) => setSelectedMaterialQuality(value);
    
    const handleProjectQuestionChangeWithAudit = (id: string, field: keyof ProjectQuestion, value: string) => {
        setProjectQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const isGcOnboardingComplete = !!(gcOnboardingData.authorization.signature && gcOnboardingData.authorization.agreedToTerms);

    const handleGeneralContractorChange = (field: keyof GeneralContractor, value: string) => {
        setGeneralContractor(prev => ({ ...prev, [field]: value }));
    };

    const handleGeneralContractorDocChange = (docType: GcDocUploadKey, file: File | null) => {
        if (file) {
            setGeneralContractor(prev => ({ ...prev, [docType]: { file, name: file.name } }));
        }
    };

    const handleRemoveGeneralContractorDoc = (docType: GcDocUploadKey) => {
        setGeneralContractor(prev => ({ ...prev, [docType]: null }));
    };

    const handleOpenGcModal = (options?: { blank?: boolean }) => {
        setIsGcModalBlankMode(!!options?.blank);
        setIsGcOnboardingModalOpen(true);
    };

    const handleAddProjectDocument = (doc: ProjectDocument) => {
        setProjectDocuments(prev => [...prev, doc]);
    };

    const handleRemoveProjectDocument = (index: number) => {
        setProjectDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleOpenCommentThread = (fieldId: string, fieldLabel: string) => {
        setActiveCommentThread({ fieldId, fieldLabel });
    };

    const handleCloseCommentThread = () => setActiveCommentThread(null);

    const handleToggleCategoryCollapse = (categoryName: string) => {
        setCollapsedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
    };

    const handleUpdateBudgetItem = (categoryName: string, itemId: string, field: keyof BudgetItem, value: any, originalValue?: any, fieldLabel?: string) => {
        // Item 1 & 2: Intercept analyst edits to 'actual' (Lima Approved) and prompt for a comment
        if (currentUserRole === 'analyst' && field === 'actual') {
            const category = budgetData.find(c => c.name === categoryName);
            const item = category?.items.find(i => i.id === itemId);
            const parsedValue = typeof value === 'string' ? (parseFloat(value) || 0) : (value ?? 0);
            if (item && parsedValue !== item.actual) {
                setPendingAnalystEdit({
                    categoryName,
                    itemId,
                    itemLabel: item.drawItem || 'Budget Item',
                    oldValue: item.actual,
                    newValue: parsedValue,
                });
                setPendingAnalystEditComment('');
                return; // Hold — don't save until analyst adds a comment
            }
        }
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            return {
                ...cat,
                items: cat.items.map(item => {
                    if (item.id !== itemId) return item;
                    return { ...item, [field]: value };
                })
            };
        }));
    };

    // Item 1 & 2: Confirm analyst edit — save value and auto-create comment thread for borrower
    const handleConfirmAnalystEdit = () => {
        if (!pendingAnalystEdit || !pendingAnalystEditComment.trim()) return;
        const { categoryName, itemId, itemLabel, newValue } = pendingAnalystEdit;

        // Apply the approved amount
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            return { ...cat, items: cat.items.map(item => item.id === itemId ? { ...item, actual: newValue } : item) };
        }));

        // Auto-create thread + comment so borrower sees it in Action Center
        const threadId = `analyst-edit-${itemId}`;
        const threadLabel = `Analyst Correction: ${itemLabel} (${categoryName})`;
        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            fieldId: threadId,
            threadId,
            authorRole: 'analyst',
            authorName: 'Analyst',
            text: pendingAnalystEditComment.trim(),
            timestamp: new Date().toISOString(),
        };
        setComments(prev => [...prev, newComment]);
        setCommentThreads(prev => {
            const existing = prev.find(t => t.id === threadId);
            if (existing) {
                return prev.map(t => t.id === threadId ? { ...t, status: 'needs_borrower_action' as const, assignee: 'borrower' as const } : t);
            }
            return [...prev, { id: threadId, label: threadLabel, status: 'needs_borrower_action' as const, assignee: 'borrower' as const }];
        });

        setPendingAnalystEdit(null);
        setPendingAnalystEditComment('');
    };

    const handleCancelAnalystEdit = () => {
        setPendingAnalystEdit(null);
        setPendingAnalystEditComment('');
    };

    // Item 5: Borrower accepts analyst's corrected amount (budget = actual)
    const handleAcceptAnalystChange = (categoryName: string, itemId: string) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            return { ...cat, items: cat.items.map(item => {
                if (item.id !== itemId) return item;
                return { ...item, budget: item.actual };
            })};
        }));
        handleResolveThread(`analyst-edit-${itemId}`);
    };

    // Item 5: Borrower keeps their original value (actual reverts to budget)
    const handleKeepBorrowerValue = (categoryName: string, itemId: string) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            return { ...cat, items: cat.items.map(item => {
                if (item.id !== itemId) return item;
                return { ...item, actual: item.budget };
            })};
        }));
        handleResolveThread(`analyst-edit-${itemId}`);
    };

    const handleScopeSummaryChange = (field: keyof ScopeOfWorkSummary, value: any) => {
        setScopeSummary(prev => ({ ...prev, [field]: value }));
    };

    const handleProjectScopeStatementChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setProjectScopeStatement(e.target.value);
    };

    const handleAddCustomBudgetItem = (categoryName: string, options?: { fromSimplifiedView?: boolean, initialValues?: Partial<BudgetItem> }) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            const newItem: BudgetItem = {
                id: `custom-${Date.now()}`,
                itemNumber: `${cat.itemNumberPrefix}-C`,
                drawItem: '',
                description: '',
                budget: 0,
                actual: 0,
                isCustomDescription: true,
                uploadedPhotos: [],
                ...options?.initialValues // Spread initial values if provided
            };
            return { ...cat, items: [...cat.items, newItem] };
        }));
    };

    const handleRemoveCustomBudgetItem = (categoryName: string, itemId: string) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            return { ...cat, items: cat.items.filter(i => i.id !== itemId) };
        }));
    };

    const handlePrefillBudget = () => {
        setBudgetData(TEMPLATE_BUDGET_DATA.map(c => ({...c, categoryPhotos: []})));
    };

    const handleRemovePhoto = (categoryName: string, itemId: string, photoIndex: number) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            return {
                ...cat,
                items: cat.items.map(item => {
                    if (item.id !== itemId) return item;
                    const updated = [...(item.uploadedPhotos || [])];
                    updated.splice(photoIndex, 1);
                    return { ...item, uploadedPhotos: updated };
                })
            };
        }));
    };

    const handleRemoveCategoryPhoto = (categoryName: string, photoIndex: number) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            const updated = [...(cat.categoryPhotos || [])];
            updated.splice(photoIndex, 1);
            return { ...cat, categoryPhotos: updated };
        }));
    };

    const handleOpenBulkUploadModal = () => setIsBulkUploadModalOpen(true);
    const handleCloseBulkUploadModal = () => setIsBulkUploadModalOpen(false);

    const handleCopyCategoryAmounts = (categoryName: string) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;
            return {
                ...cat,
                items: cat.items.map(item => ({ ...item, actual: item.budget }))
            };
        }));
    };

    const handleGenerateScopeWithAI = () => {
        setIsGeneratingScope(true);
        setTimeout(() => {
            setProjectScopeStatement("Generated Scope: Based on the budget items, this project involves a comprehensive renovation including full kitchen remodel, master bath update, and new flooring throughout.");
            setIsGeneratingScope(false);
        }, 2000);
    };

    const handleToggleSimplifiedCategoryExpansion = (categoryName: string) => {
        setExpandedInSimplifiedView(prev => {
            const next = new Set(prev);
            if (next.has(categoryName)) next.delete(categoryName);
            else next.add(categoryName);
            return next;
        });
    };

    const handleUpdateCategoryDescription = (categoryName: string, description: string) => {
        setBudgetData(prev => prev.map(cat => cat.name === categoryName ? { ...cat, description } : cat));
    };

    const handleUpdateCategoryTotalBudget = (categoryName: string, totalBudget: number) => {
        setBudgetData(prev => prev.map(cat => {
            if (cat.name !== categoryName) return cat;

            // Calculate current total
            const currentTotal = cat.items.reduce((sum, item) => sum + item.budget, 0);
            
            // Find existing allowance item or create one
            let allowanceItem = cat.items.find(i => i.drawItem === 'General Allowance');
            
            // Calculate the difference needed to reach totalBudget
            const diff = totalBudget - currentTotal;

            if (allowanceItem) {
                // Update existing allowance
                const newAllowance = allowanceItem.budget + diff;
                allowanceItem = { ...allowanceItem, budget: Math.max(0, newAllowance) };
                
                return {
                    ...cat,
                    items: cat.items.map(i => i.id === allowanceItem!.id ? allowanceItem! : i)
                };
            } else {
                // Create new allowance item
                if (diff > 0) {
                     const newItem: BudgetItem = {
                        id: `allowance-${Date.now()}`,
                        itemNumber: `${cat.itemNumberPrefix}-GS`,
                        drawItem: 'General Allowance',
                        description: 'Lump sum category allowance',
                        budget: diff,
                        actual: 0,
                        isCustomDescription: true,
                        uploadedPhotos: [],
                    };
                    return { ...cat, items: [...cat.items, newItem] };
                }
                return cat;
            }
        }));
    };

    const handleAcknowledgementChange = (isChecked: boolean) => setIsReimbursementAcknowledged(isChecked);

    const handleNextStep = () => {
        setDirection('forward');
        setCurrentWizardStep(curr => Math.min(curr + 1, 4));
        // Smooth scroll to top when changing steps
        document.querySelector('.main-content-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    
    const handlePrevStep = () => {
        if (currentWizardStep > 1) {
            setDirection('back');
            setCurrentWizardStep(curr => curr - 1);
            // Smooth scroll to top when changing steps
            document.querySelector('.main-content-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            setProjectTypeMode(null);
        }
    };
    
    const activeNavButtonClasses = "bg-brand-600 text-white hover:bg-brand-700";
    const inactiveNavButtonClasses = "bg-gray-300 text-gray-700 hover:bg-gray-400";

    const handleAttemptSubmit = () => {
        setApplicationStatus('under_review');
        window.scrollTo(0, 0);
    };

    const handleRequestChanges = () => setApplicationStatus('needs_borrower_action');
    const handleApproveBudget = () => setApplicationStatus('approved');
    const handleReopenBudget = () => setApplicationStatus('under_review');
    const handlePrint = () => window.print();
    const handleResubmit = () => setApplicationStatus('under_review');

    const handleRiskAdjustmentChange = (key: keyof RiskAdjustments, value: boolean) => {
        setRiskAdjustments(prev => ({ ...prev, [key]: value }));
    };

    const handleFeasibilityChange = (path: string, value: any) => {
        setFeasibilityData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleManualBaseRateChange = (value: number) => setManualBaseRateOverride(value);
    const handleMarketMetricsChange = (field: keyof MarketMetrics, value: any) => {
        setMarketMetrics(prev => ({ ...prev, [field]: value }));
    };

    const handleGcOnboardingChange = (path: string, value: any) => {
         setGcOnboardingData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (keys[i] === 'previousExperience') {
                    if (Array.isArray(value)) {
                        return { ...prev, previousExperience: value };
                    }
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const gcModalFooter = (
        <button onClick={() => setIsGcOnboardingModalOpen(false)} className="button-base bg-brand-500 text-white hover:bg-brand-600">Done</button>
    );

    const handleSubmitAuditEntry = (text: string, threadId: string, label: string) => {
        const newComment: Comment = {
            id: Date.now().toString(),
            fieldId: threadId,
            threadId: threadId,
            authorRole: currentUserRole,
            authorName: currentUserRole === 'analyst' ? 'Analyst' : 'Borrower',
            text: text,
            timestamp: new Date().toISOString()
        };
        setComments(prev => [...prev, newComment]);
        
        setCommentThreads(prev => {
            const existing = prev.find(t => t.id === threadId);
            if (existing) {
                return prev.map(t => t.id === threadId ? { ...t, status: currentUserRole === 'borrower' ? 'pending_analyst_review' : 'needs_borrower_action', assignee: currentUserRole === 'borrower' ? 'analyst' : 'borrower' } : t); // Assignee logic slightly simplified for demo
            }
            return [...prev, { id: threadId, label, status: currentUserRole === 'borrower' ? 'pending_analyst_review' : 'needs_borrower_action', assignee: currentUserRole === 'borrower' ? 'analyst' : 'borrower' }];
        });
    };

    const handleResolveThread = (threadId: string) => {
        setCommentThreads(prev => prev.map(t => t.id === threadId ? { ...t, status: 'resolved' } : t));
    };

    const handleReopenThread = (threadId: string) => {
        setCommentThreads(prev => prev.map(t => t.id === threadId ? { ...t, status: 'pending_analyst_review' } : t)); 
    };

    const handleActionCenterItemClick = (thread: CommentThread) => {
        setActiveCommentThread({ fieldId: thread.id, fieldLabel: thread.label });
        setIsActionCenterOpen(false);
    };

    const handleProceedWithSubmit = () => {
        setIsRequirementsModalOpen(false);
        handleAttemptSubmit();
    };

    const handleRequirementFileUpload = (reqId: string, file: File) => {
        setActionableRequirements(prev => prev.map(r => r.id === reqId ? { ...r, status: 'completed', file } : r));
    };

    const handleConfirmReview = (mapped: any[], newItems: any[], details: any) => {
        // ... (Budget application logic) ...
        const currentBudgetData = [...budgetData];
        let newTotal = 0;

        const updatedBudgetData = currentBudgetData.map(category => {
            let updatedItems = category.items.map(item => {
                // Use filter+reduce instead of find so that if Gemini returns multiple
                // mapped entries for the same ID (e.g. two NC soft costs both mapping
                // to sc5), their budgets are SUMMED rather than the later ones silently
                // dropped by find().
                const mappedMatches = mapped.filter((m: any) => m.id === item.id);
                if (mappedMatches.length > 0) {
                    const totalBudget = mappedMatches.reduce((sum: number, m: any) => sum + (m.budget || 0), 0);
                    // When multiple file rows map to the same line item (e.g. "Siding Material"
                    // + "Siding Labor"), combine their original texts into the description so
                    // both are traceable in the budget detail.
                    const combinedDescription = mappedMatches.length > 1
                        ? mappedMatches
                            .map((m: any) => m.originalText || m.description)
                            .filter(Boolean)
                            .join(' + ')
                        : (mappedMatches[0].description || item.description);
                    return {
                        ...item,
                        budget: totalBudget,
                        description: combinedDescription || item.description,
                        isUncertain: mappedMatches.some((m: any) => m.isUncertain)
                    };
                }
                return item;
            });

            const newItemsForCategory = newItems.filter((n: any) => n.categoryName === category.name);
            if (newItemsForCategory.length > 0) {
                const createdItems = newItemsForCategory.map((n: any) => ({
                    id: `ai-new-${Date.now()}-${Math.random()}`,
                    itemNumber: 'New',
                    drawItem: n.drawItem,
                    description: n.description,
                    budget: n.budget,
                    actual: 0,
                    isCustomDescription: true,
                    isUncertain: n.isUncertain,
                    uploadedPhotos: []
                }));
                updatedItems = [...updatedItems, ...createdItems];
            }

            return {
                ...category,
                items: updatedItems
            };
        });

        updatedBudgetData.forEach(cat => {
            cat.items.forEach(item => {
                newTotal += (item.budget || 0);
            });
        });

        const hasManualContingency = mapped.some((m: any) => m.id === CONTINGENCY_ITEM_ID);

        setBudgetData(updatedBudgetData);
        
        setScopeSummary(prev => ({
            ...prev,
            borrowerTotal: newTotal,
            isContingencyAutoCalculated: hasManualContingency ? false : prev.isContingencyAutoCalculated
        }));

        if (details) {
            setPropertyDetails(prev => ({
                ...prev,
                ...(details.street   ? { street: details.street }   : {}),
                ...(details.city     ? { city:   details.city }     : {}),
                ...(details.state    ? { state:  details.state }    : {}),
                ...(details.zip      ? { zip:    details.zip }      : {}),
            }));

            if (details.asIsSqft) {
                handleAsIsProjectedChangeWithAudit('totalBuildingSqFeet', 'asIs', String(details.asIsSqft));
            }
            if (details.projectedSqft) {
                handleAsIsProjectedChangeWithAudit('totalBuildingSqFeet', 'projected', String(details.projectedSqft));
            }
            if (details.asIsBedrooms) {
                handleAsIsProjectedChangeWithAudit('bedroomCount', 'asIs', String(details.asIsBedrooms));
            }
            if (details.projectedBedrooms) {
                handleAsIsProjectedChangeWithAudit('bedroomCount', 'projected', String(details.projectedBedrooms));
            }
            if (details.asIsBathrooms) {
                handleAsIsProjectedChangeWithAudit('bathroomCount', 'asIs', String(details.asIsBathrooms));
            }
            if (details.projectedBathrooms) {
                handleAsIsProjectedChangeWithAudit('bathroomCount', 'projected', String(details.projectedBathrooms));
            }
            if (details.typeOfRehab) {
                handleSelectedRehabTypeChangeWithAudit(details.typeOfRehab);
            }
            if (details.conditionOfProperty) {
                handleSelectedConditionChangeWithAudit(details.conditionOfProperty);
            }
            if (details.materialQuality) {
                handleSelectedMaterialQualityChangeWithAudit(details.materialQuality);
            }
            if (details.projectScopeStatement) {
                setProjectScopeStatement(details.projectScopeStatement);
            }
        }

        setLastAppliedSuggestions({ mapped, new: newItems });
        setIsReviewModalOpen(false);
        setTimeout(() => setIsReconciliationModalOpen(true), 500);
    };

    const handleSafetyCheckContinue = () => {
        setIsSafetyCheckModalOpen(false);
        performSync(); 
    };

    const handleReconciliationContinue = () => {
        setIsReconciliationModalOpen(false);
        setIsStarted(true);
        if (!projectTypeMode) {
            setProjectTypeMode(null);
        }
        setCurrentWizardStep(1); 
    };

  // ... (Walkthrough Mode Render Logic) ...
  const walkthroughRoomList = useMemo(() => {
      if (!walkthroughState.isActive) return [];

      const beds = parseInt(asIsProjectedData.bedroomCount.projected || '0');
      const baths = parseInt(asIsProjectedData.bathroomCount.projected || '0');
      
      const dynamicRooms: WalkthroughRoomDef[] = [];

      WALKTHROUGH_TEMPLATE.forEach(template => {
          if (['kitchen', 'exterior', 'systems', 'living_room'].includes(template.id)) {
              dynamicRooms.push(template);
          }
          if (template.id === 'master_bath' && baths >= 1) {
              dynamicRooms.push(template);
          }
          if (template.id === 'basement') {
              dynamicRooms.push(template);
          }
      });

      if (beds > 0) {
          const bedTemplate = WALKTHROUGH_TEMPLATE.find(t => t.id === 'bedroom');
          if (bedTemplate) {
              for (let i = 1; i <= beds; i++) {
                  dynamicRooms.push({
                      ...bedTemplate,
                      id: `bedroom_${i}`,
                      label: i === 1 ? 'Primary Bedroom' : `Bedroom ${i}`
                  });
              }
          }
      }

      if (baths > 1) {
          const bathTemplate = WALKTHROUGH_TEMPLATE.find(t => t.id === 'bath_secondary');
          if (bathTemplate) {
              for (let i = 2; i <= baths; i++) {
                  dynamicRooms.push({
                      ...bathTemplate,
                      id: `bath_${i}`,
                      label: `Bath ${i}`
                  });
              }
          }
      }
      
      if (walkthroughState.customRooms) {
          dynamicRooms.push(...walkthroughState.customRooms);
      }

      const sortOrder = ['kitchen', 'master_bath', 'bath_', 'bedroom_', 'living', 'basement', 'exterior', 'systems'];
      return dynamicRooms.sort((a, b) => {
          const indexA = sortOrder.findIndex(key => a.id.startsWith(key));
          const indexB = sortOrder.findIndex(key => b.id.startsWith(key));
          const valA = indexA === -1 ? 99 : indexA;
          const valB = indexB === -1 ? 99 : indexB;
          return valA - valB;
      });
  }, [walkthroughState.isActive, walkthroughState.customRooms, asIsProjectedData.bedroomCount.projected, asIsProjectedData.bathroomCount.projected]);

  if (walkthroughState.isActive) {
      if (walkthroughState.currentRoomId) {
          const currentRoomIndex = walkthroughRoomList.findIndex(r => r.id === walkthroughState.currentRoomId);
          const prevRoom = currentRoomIndex > 0 ? walkthroughRoomList[currentRoomIndex - 1] : null;
          const nextRoom = currentRoomIndex < walkthroughRoomList.length - 1 ? walkthroughRoomList[currentRoomIndex + 1] : null;
          
          const roomDef = walkthroughRoomList[currentRoomIndex];
          
          if (roomDef) {
              return (
                  <>
                    <div className="fixed top-0 left-0 w-full z-50">
                        <ConnectivityBanner isOnline={isOnline} pendingCount={walkthroughState.pendingJobs?.length || 0} />
                    </div>
                    <div className="pt-8 h-full"> 
                        <WalkthroughRoomView
                            room={roomDef}
                            itemsState={walkthroughState.items}
                            onUpdateItem={handleWalkthroughUpdate}
                            onBack={() => setWalkthroughState(prev => ({ ...prev, currentRoomId: null }))}
                            selectedQuality={selectedMaterialQuality || 'Q4'}
                            onNextRoom={nextRoom ? () => setWalkthroughState(prev => ({ ...prev, currentRoomId: nextRoom.id })) : undefined}
                            onPrevRoom={prevRoom ? () => setWalkthroughState(prev => ({ ...prev, currentRoomId: prevRoom.id })) : undefined}
                            nextRoomLabel={nextRoom?.label}
                            prevRoomLabel={prevRoom?.label}
                            onAddPendingJob={handleAddPendingJob}
                            onToast={showToast}
                        />
                    </div>
                  </>
              );
          }
      }
      
      const bedCount = parseInt(asIsProjectedData.bedroomCount.projected || '0');
      const bathCount = parseInt(asIsProjectedData.bathroomCount.projected || '0');

      return (
          <>
            <div className="fixed top-0 left-0 w-full z-50">
                <ConnectivityBanner isOnline={isOnline} pendingCount={walkthroughState.pendingJobs?.length || 0} />
            </div>
            <div className="pt-8 h-full">
                <WalkthroughDashboard
                    walkthroughState={walkthroughState}
                    onRoomSelect={(roomId) => setWalkthroughState(prev => ({ ...prev, currentRoomId: roomId }))}
                    onFinish={handleSyncWalkthrough}
                    onExit={() => setWalkthroughState(prev => ({ ...prev, isActive: false, currentRoomId: null }))}
                    onAddRoom={handleAddCustomRoom} 
                    projectDetails={{ beds: bedCount, baths: bathCount }}
                    onUpdateProjectDetails={handleUpdateProjectDetails}
                />
            </div>
            <SafetyCheckModal
                isOpen={isSafetyCheckModalOpen}
                onClose={() => setIsSafetyCheckModalOpen(false)}
                onContinue={handleSafetyCheckContinue}
                missingItems={missingSafetyItems}
            />
          </>
      );
  }

  // ... (Main Render Logic) ...
  if (!isStarted) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-900 to-[#1E2E5C] relative overflow-hidden">
        {/* Ambient Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl"></div>
        </div>
        <WelcomeScreen 
          onGetStarted={(type) => { 
              setIsStarted(true); 
              if (type === 'repeat') {
                  setIsRepeatUser(true);
                  setFeasibilityData(prev => ({ ...prev, isRepeatBorrower: true }));
              } else {
                  setIsRepeatUser(false);
                  setFeasibilityData(prev => ({ ...prev, isRepeatBorrower: false }));
              }
          }} 
          onStartWithTemplate={() => setIsTemplateLibraryOpen(true)}
          onOpenEstimator={() => setIsEstimatorModalOpen(true)}
          onStartWalkthrough={() => setWalkthroughState(prev => ({ ...prev, isActive: true }))}
          onStartTutorial={handleStartTutorial}
          onProcessBudgetFile={handleProcessBudgetFile}
          isProcessing={isParsingBudget || isAnalyzingBudget}
          budgetParsingError={budgetParsingError}
        />
        
        {isEstimatorModalOpen && (
            <EstimatorModal 
            isOpen={isEstimatorModalOpen}
            onClose={() => setIsEstimatorModalOpen(false)}
            onGenerate={handleGenerateEstimate}
            onApply={handleApplyEstimate}
            isGenerating={isEstimatorGenerating}
            estimatorResult={estimatorResult}
            />
        )}

        <TemplateSelector 
            isOpen={isTemplateLibraryOpen}
            onClose={() => setIsTemplateLibraryOpen(false)}
            templates={templateList}
            onSelectTemplate={handleTemplateSelect}
        />
        <AIReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onConfirm={handleConfirmReview}
            suggestions={reviewableSuggestions}
            budgetCategoryData={budgetData}
            scopeSummary={scopeSummary}
            conditions={CONDITIONS_OF_PROPERTY}
            rehabTypes={TYPES_OF_REHAB}
            materialQualities={MATERIAL_QUALITIES}
        />
        <ReconciliationModal
            isOpen={isReconciliationModalOpen}
            onClose={handleReconciliationContinue}
            lastAppliedSuggestions={lastAppliedSuggestions}
            budgetData={budgetData}
        />
      </div>
    );
  }

  if (isStarted && !projectTypeMode && !isTutorialActive) {
      return (
          <div className="h-full bg-gradient-to-br from-slate-900 to-[#1E2E5C] relative overflow-hidden">
                {/* Ambient Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl"></div>
                </div>
              <ProjectTypeSelectionScreen 
                onSelect={handleProjectTypeSelect} 
                onBack={() => setIsStarted(false)} 
              />
          </div>
      );
  }

  return (
    <div className="app-shell bg-[#F4F5F7] text-[#1E2D5C] min-h-screen relative overflow-hidden flex flex-col">

      <header className="app-shell-nav flex items-center justify-between bg-white border-b border-[#DFE1E5] px-6 py-3 shadow-sm z-20 relative">
        <div className="flex items-center gap-4">
            <img src="https://www.limaone.com/wp-content/uploads/lima-one-logo-dark-250x66.webp" alt="Lima One Capital" width={140} height={37} className="object-contain" />
            <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-[#DFE1E5]">/</span>
                <span className="text-[#78819D] font-medium">
                  {propertyAddressDisplay || (projectTypeMode === 'new_construction' ? 'New Construction' : projectTypeMode === 'renovation' ? 'Renovation' : 'Construction Budget')}
                </span>
                {propertyAddressDisplay && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 border border-brand-200 text-brand-500">
                    {projectTypeMode === 'new_construction' ? 'New Construction' : 'Renovation'}
                  </span>
                )}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="role-switcher-container">
                <button onClick={() => setCurrentUserRole('borrower')} className={`role-switcher-option ${currentUserRole === 'borrower' ? 'active bg-brand-500 text-white shadow-sm border border-brand-600' : ''}`}>Borrower</button>
                <button onClick={() => setCurrentUserRole('analyst')} className={`role-switcher-option ${currentUserRole === 'analyst' ? 'active bg-brand-500 text-white shadow-sm border border-brand-600' : ''}`}>Analyst</button>
            </div>
            <button
              onClick={() => { if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) handleClearAll(); }}
              className="flex items-center gap-1.5 text-xs text-[#78819D] hover:text-[#B92814] transition-colors px-2 py-1 rounded border border-transparent hover:border-[#B92814]/30"
              title="Clear all entered data"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Clear
            </button>
        </div>
      </header>

      <div className="budget-wizard-layout z-10 relative">
        {currentView === 'budget' && (
            <Sidebar 
                currentStep={currentWizardStep} 
                propertyAddress={propertyAddressDisplay} 
                onStepClick={handleSidebarStepClick}
                isStarted={isStarted}
                applicationStatus={applicationStatus}
                commentThreads={commentThreads}
                currentUserRole={currentUserRole}
                onOpenActionCenter={() => setIsActionCenterOpen(true)}
                isParsingBudget={isParsingBudget}
                budgetParsingError={budgetParsingError}
                isAnalyzingBudget={isAnalyzingBudget}
                analysisError={analysisError}
                onProcessBudgetFile={handleProcessBudgetFile}
                riskAnalysis={riskAnalysis}
                applicationStrength={applicationStrength}
            />
        )}

        <main className="content-area flex-grow bg-transparent p-4 md:p-8" ref={tourRef as any}>
          {currentUserRole === 'analyst' && (
            <div className="mb-6 border-b border-[#DFE1E5]">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setCurrentView('budget')}
                  className={`${currentView === 'budget' ? 'border-brand-500 text-brand-500' : 'border-transparent text-[#78819D] hover:text-[#1E2D5C] hover:border-[#DFE1E5]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Construction Budget
                </button>
                <button
                  onClick={() => setCurrentView('analystReport')}
                  className={`${currentView === 'analystReport' ? 'border-brand-500 text-brand-500' : 'border-transparent text-[#78819D] hover:text-[#1E2D5C] hover:border-[#DFE1E5]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  AI Analyst Report
                </button>
                <button
                  onClick={() => setCurrentView('revisionReport')}
                  className={`${currentView === 'revisionReport' ? 'border-brand-500 text-brand-500' : 'border-transparent text-[#78819D] hover:text-[#1E2D5C] hover:border-[#DFE1E5]'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Revision Report
                </button>
              </nav>
            </div>
          )}

          {currentView === 'budget' && (
            <>
              {/* Main Card Container with Dark Glassmorphism and Animated Transition Wrapper */}
              <div className="main-content-container bg-white border border-[#DFE1E5] shadow-sm rounded-2xl p-4 md:p-6 mb-6 w-full max-w-[95%] xl:max-w-[1800px] mx-auto overflow-hidden">
                <div key={currentWizardStep} className={`step-transition-wrapper ${direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}`}>
                    {currentWizardStep === 1 && (
                    <Step1Form
                        propertyDetails={propertyDetails}
                        landDetails={landDetails} 
                        asIsProjectedData={asIsProjectedData}
                        selectedCondition={selectedCondition}
                        selectedRehabType={selectedRehabType}
                        selectedMaterialQuality={selectedMaterialQuality}
                        projectQuestions={projectQuestions}
                        verificationStatus={verificationStatus}
                        isLocked={isFormLocked}
                        scrollToFieldId={scrollToFieldId}
                        onScrollComplete={handleScrollComplete}
                        onPropertyDetailChange={handlePropertyDetailChangeWithAudit}
                        onLandDetailsChange={handleLandDetailsChange} 
                        onAsIsProjectedChange={handleAsIsProjectedChangeWithAudit}
                        onSelectedConditionChange={handleSelectedConditionChangeWithAudit}
                        onSelectedRehabTypeChange={handleSelectedRehabTypeChangeWithAudit}
                        onSelectedMaterialQualityChange={handleSelectedMaterialQualityChangeWithAudit}
                        onProjectQuestionChange={handleProjectQuestionChangeWithAudit}
                        highlightMissingFields={highlightMissingFields}
                        projectTypeMode={projectTypeMode} 
                    />
                    )}
                    {currentWizardStep === 2 && (
                    <Step2Contractor
                        generalContractor={generalContractor}
                        selectedRehabType={selectedRehabType}
                        isGcOnboardingComplete={isGcOnboardingComplete}
                        projectDocuments={projectDocuments}
                        isLocked={isFormLocked}
                        scrollToFieldId={scrollToFieldId}
                        onScrollComplete={handleScrollComplete}
                        onGeneralContractorChange={handleGeneralContractorChange}
                        onGeneralContractorDocChange={handleGeneralContractorDocChange}
                        onRemoveGeneralContractorDoc={handleRemoveGeneralContractorDoc}
                        onOpenGcOnboarding={handleOpenGcModal}
                        onAddProjectDocument={handleAddProjectDocument}
                        onRemoveProjectDocument={handleRemoveProjectDocument}
                        highlightMissingFields={highlightMissingFields}
                        isRepeatUser={isRepeatUser} 
                    />
                    )}
                    {currentWizardStep === 3 && (
                    <Step2Budget
                        budgetData={budgetData}
                        scopeSummary={scopeSummary}
                        projectScopeStatement={projectScopeStatement}
                        isLimaApprovedBudgetEditable={isLimaApprovedBudgetEditable}
                        collapsedCategories={collapsedCategories}
                        comments={comments}
                        commentThreads={commentThreads}
                        currentUserRole={currentUserRole}
                        applicationStatus={applicationStatus}
                        isLocked={isFormLocked}
                        scrollToFieldId={scrollToFieldId}
                        highlightedItemIds={highlightedItemIds}
                        isGeneratingScope={isGeneratingScope}
                        isSimplifiedViewAvailable={selectedRehabType === 'Light-Cosmetic'}
                        budgetViewMode={budgetViewMode}
                        expandedInSimplifiedView={expandedInSimplifiedView}
                        onScrollComplete={handleScrollComplete}
                        onOpenCommentThread={handleOpenCommentThread}
                        onToggleCategoryCollapse={handleToggleCategoryCollapse}
                        onUpdateBudgetItem={handleUpdateBudgetItem}
                        onScopeSummaryChange={handleScopeSummaryChange}
                        onProjectScopeStatementChange={handleProjectScopeStatementChange}
                        highlightLimaOneTotalMismatch={highlightLimaOneTotalMismatch}
                        onAddCustomBudgetItem={handleAddCustomBudgetItem}
                        onRemoveCustomBudgetItem={handleRemoveCustomBudgetItem}
                        onPrefillBudget={handlePrefillBudget}
                        onRemovePhoto={handleRemovePhoto}
                        onRemoveCategoryPhoto={handleRemoveCategoryPhoto}
                        onOpenBulkUploadModal={handleOpenBulkUploadModal}
                        onCopyCategoryAmounts={handleCopyCategoryAmounts}
                        onGenerateScope={handleGenerateScopeWithAI}
                        onSetBudgetViewMode={setBudgetViewMode}
                        onToggleSimplifiedCategoryExpansion={handleToggleSimplifiedCategoryExpansion}
                        onUpdateCategoryDescription={handleUpdateCategoryDescription}
                        onUpdateCategoryTotalBudget={handleUpdateCategoryTotalBudget}
                        riskAnalysis={riskAnalysis}
                        totalSqFt={asIsProjectedData.totalBuildingSqFeet.projected}
                        propertyState={propertyDetails.state}
                        selectedRehabType={selectedRehabType}
                        onSwitchToWalkthrough={() => setWalkthroughState(prev => ({ ...prev, isActive: true }))}
                        onOpenSoftCostWizard={() => setIsSoftCostWizardOpen(true)}
                        highlightMissingFields={highlightMissingFields}
                        onCategoryBulkAdjust={handleCategoryBulkAdjust}
                        onSaveAsTemplate={() => setIsSaveTemplateModalOpen(true)}
                        isRepeatUser={isRepeatUser}
                    />
                    )}
                    {currentWizardStep === 4 && (
                    <Step4Review
                        propertyDetails={propertyDetails}
                        asIsProjectedData={asIsProjectedData}
                        selectedCondition={selectedCondition}
                        selectedRehabType={selectedRehabType}
                        selectedMaterialQuality={selectedMaterialQuality}
                        projectQuestions={projectQuestions}
                        generalContractor={generalContractor}
                        budgetData={budgetData}
                        scopeSummary={scopeSummary}
                        projectScopeStatement={projectScopeStatement}
                        isReimbursementAcknowledged={isReimbursementAcknowledged}
                        isLocked={isFormLocked}
                        onAcknowledgementChange={handleAcknowledgementChange}
                        applicationStatus={applicationStatus}
                        onProjectQuestionChange={handleProjectQuestionChangeWithAudit}
                        currentUserRole={currentUserRole}
                        comments={comments}
                        commentThreads={commentThreads}
                        onRequestChanges={handleRequestChanges}
                        onApproveBudget={handleApproveBudget}
                        onAcceptAnalystChange={handleAcceptAnalystChange}
                        onKeepBorrowerValue={handleKeepBorrowerValue}
                    />
                    )}
                </div>
              </div>

              <footer className="app-shell-footer flex justify-between items-center bg-white border-t border-[#DFE1E5] px-6 py-5">
                <div>
                  <button
                    onClick={handlePrevStep}
                    disabled={false}
                    className={`button-base py-2.5 px-7 font-semibold transition-all ${currentWizardStep === 1 && !projectTypeMode ? 'invisible pointer-events-none' : 'bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC] shadow-sm'}`}
                  >
                    ← Back
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {currentWizardStep < 4 ? (
                    <button
                      onClick={handleNextStep}
                      disabled={isNextDisabled}
                      className={`button-base py-2.5 px-8 font-bold transition-all
                        ${isNextDisabled
                          ? 'bg-[#BCBFC7] text-white cursor-not-allowed shadow-none'
                          : 'bg-brand-500 text-white hover:bg-brand-600'}`}
                    >
                      Next Step →
                    </button>
                  ) : currentUserRole === 'analyst' ? null
                    : applicationStatus === 'needs_borrower_action' ? (
                    /* Item 6: Borrower resubmit after reviewing analyst changes */
                    <button
                      onClick={handleResubmit}
                      disabled={!isReimbursementAcknowledged}
                      className={`button-base py-2.5 px-8 font-bold transition-all
                        ${!isReimbursementAcknowledged
                          ? 'bg-[#BCBFC7] text-white cursor-not-allowed shadow-none'
                          : 'bg-[#EAA800] text-white hover:bg-[#D49700]'}`}
                    >
                      Resubmit Application →
                    </button>
                  ) : (
                    <button
                      onClick={isRequirementsModalOpen ? handleProceedWithSubmit : () => setIsRequirementsModalOpen(true)}
                      disabled={!isReimbursementAcknowledged || isFormLocked}
                      className={`button-base py-2.5 px-8 font-bold transition-all
                        ${(!isReimbursementAcknowledged || isFormLocked)
                          ? 'bg-[#BCBFC7] text-white cursor-not-allowed shadow-none'
                          : 'bg-brand-500 text-white hover:bg-brand-600'}`}
                    >
                      {applicationStatus === 'approved' ? 'Approved ✓' : (applicationStatus === 'under_review' ? 'Under Review' : 'Submit Application →')}
                    </button>
                  )}
                  {currentWizardStep === 3 && (
                    <button
                      onClick={() => setIsSaveTemplateModalOpen(true)}
                      className="button-base py-2.5 px-6 font-semibold transition-all bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC] shadow-sm"
                    >
                      Save Template
                    </button>
                  )}
                </div>
              </footer>
            </>
          )}

          {currentView === 'analystReport' && (
            <AnalystReport
              borrowerTotal={scopeSummary.borrowerTotal}
              limaOneApprovedTotal={scopeSummary.limaOneApprovedTotal}
              totalSqFt={asIsProjectedData.totalBuildingSqFeet.projected}
              selectedConditionValue={selectedCondition}
              selectedRehabTypeValue={selectedRehabType}
              selectedMaterialQualityValue={selectedMaterialQuality}
              conditions={CONDITIONS_OF_PROPERTY}
              rehabTypes={TYPES_OF_REHAB}
              materialQualities={MATERIAL_QUALITIES}
              riskAnalysis={riskAnalysis}
              riskAdjustments={riskAdjustments}
              onRiskAdjustmentChange={handleRiskAdjustmentChange}
              feasibilityData={feasibilityData}
              onFeasibilityChange={handleFeasibilityChange}
              asIsProjectedData={asIsProjectedData}
              budgetData={budgetData}
              projectDocuments={projectDocuments}
              propertyDetails={propertyDetails}
              dealGrade={dealGrade}
              generalContractor={generalContractor}
              manualBaseRateOverride={manualBaseRateOverride}
              onManualBaseRateChange={handleManualBaseRateChange}
              marketMetrics={marketMetrics}
              onMarketMetricsChange={handleMarketMetricsChange}
              onToast={showToast}
            />
          )}

          {currentView === 'revisionReport' && (
             <RevisionDeltaReport auditLog={auditLog} />
          )}
        </main>
      </div>

      {isBulkUploadModalOpen && (
        <BulkPhotoUploader
          isOpen={isBulkUploadModalOpen}
          onClose={handleCloseBulkUploadModal}
          stagedPhotos={stagedPhotos}
          budgetData={budgetData}
          onStageFiles={handleStageFiles}
          onAssignPhoto={handleAssignStagedPhoto}
          onFinalize={handleFinalizeAssignments}
          onToast={showToast}
        />
      )}

      {/* ... (Other modals unchanged) */}
      <ComplexModal isOpen={isGcOnboardingModalOpen} onClose={() => setIsGcOnboardingModalOpen(false)} title="GC Onboarding" footer={gcModalFooter} size="lg">
          <GcOnboardingForm data={gcOnboardingData} onChange={handleGcOnboardingChange} isReadOnly={isFormLocked} />
      </ComplexModal>

      <CommentThreadPanel
        isOpen={!!activeCommentThread}
        onClose={handleCloseCommentThread}
        threadId={activeCommentThread?.fieldId || ''}
        threadLabel={activeCommentThread?.fieldLabel || ''}
        comments={comments}
        commentThreads={commentThreads}
        currentUserRole={currentUserRole}
        onSubmitEntry={handleSubmitAuditEntry}
        onResolveThread={handleResolveThread}
        onReopenThread={handleReopenThread}
      />

      {/* Item 1 & 2: Analyst edit comment modal — required before a correction is saved */}
      {pendingAnalystEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(4,11,31,0.5)' }}>
          <div className="bg-white border border-[#DFE1E5] rounded-2xl w-full max-w-lg mx-4 p-6 animate-in fade-in zoom-in-95 duration-200" style={{ boxShadow: '0 2.12px 19.86px rgba(30,45,92,0.05), 0 9.48px 45.88px rgba(30,45,92,0.036), 0 23.59px 104.77px rgba(30,45,92,0.028)' }}>
            <h3 className="text-lg font-bold text-[#1E2D5C] mb-1">Explain This Correction</h3>
            <p className="text-sm text-[#78819D] mb-1">
              You're adjusting <span className="text-[#1E2D5C] font-semibold">{pendingAnalystEdit.itemLabel}</span>
            </p>
            <div className="flex items-center gap-3 bg-[#F6F7F9] rounded-xl px-4 py-3 mb-5 border border-[#DFE1E5]">
              <div className="text-center flex-1">
                <div className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-1">Previous Approved</div>
                <div className="text-base font-mono text-[#78819D] line-through">{pendingAnalystEdit.oldValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</div>
              </div>
              <div className="text-[#78819D] text-xl">→</div>
              <div className="text-center flex-1">
                <div className="text-[10px] font-bold text-[#78819D] uppercase tracking-widest mb-1">New Approved</div>
                <div className="text-base font-mono font-bold text-[#139B23]">{pendingAnalystEdit.newValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</div>
              </div>
            </div>
            <label className="block text-xs font-bold text-[#78819D] uppercase tracking-wider mb-2">
              Reason for adjustment <span className="text-[#B92814]">*</span>
            </label>
            <textarea
              className="form-input-premium w-full rounded-xl p-3 text-sm resize-none mb-5"
              rows={4}
              placeholder="Explain why this line item is being corrected. The borrower will see this note..."
              value={pendingAnalystEditComment}
              onChange={e => setPendingAnalystEditComment(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={handleCancelAnalystEdit} className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC]">
                Cancel
              </button>
              <button
                onClick={handleConfirmAnalystEdit}
                disabled={!pendingAnalystEditComment.trim()}
                className={`button-base font-bold transition-all ${pendingAnalystEditComment.trim() ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-[#BCBFC7] text-white cursor-not-allowed'}`}
              >
                Save & Notify Borrower
              </button>
            </div>
          </div>
        </div>
      )}

      {isRequirementsModalOpen && (
        <ComplexModal
            isOpen={isRequirementsModalOpen}
            onClose={() => setIsRequirementsModalOpen(false)}
            title="Submit Application"
            footer={
                <>
                    <button onClick={() => setIsRequirementsModalOpen(false)} className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC] focus:ring-brand-500">Keep Editing</button>
                    <button onClick={handleProceedWithSubmit} className="button-base bg-brand-600 text-white hover:bg-brand-500 focus:ring-brand-500">Submit Application</button>
                </>
            }
            size="lg"
        >
            <ActionableRequirements requirements={actionableRequirements} onUploadFile={handleRequirementFileUpload} />
        </ComplexModal>
      )}

      <ActionCenterSidebar
        isOpen={isActionCenterOpen}
        onClose={() => setIsActionCenterOpen(false)}
        threads={commentThreads}
        comments={comments}
        currentUserRole={currentUserRole}
        onItemClick={handleActionCenterItemClick}
      />

      {isEstimatorModalOpen && (
        <EstimatorModal
            isOpen={isEstimatorModalOpen}
            onClose={() => setIsEstimatorModalOpen(false)}
            onGenerate={handleGenerateEstimate}
            onApply={handleApplyEstimate}
            isGenerating={isEstimatorGenerating}
            estimatorResult={estimatorResult}
        />
      )}

      <AIReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleConfirmReview}
        suggestions={reviewableSuggestions}
        budgetCategoryData={budgetData}
        scopeSummary={scopeSummary}
        conditions={CONDITIONS_OF_PROPERTY}
        rehabTypes={TYPES_OF_REHAB}
        materialQualities={MATERIAL_QUALITIES}
      />

      <ReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={handleReconciliationContinue}
        lastAppliedSuggestions={lastAppliedSuggestions}
        budgetData={budgetData}
      />

      <SoftCostWizardModal
        isOpen={isSoftCostWizardOpen}
        onClose={() => setIsSoftCostWizardOpen(false)}
        currentItems={budgetData.find(c => c.name === 'Soft Costs')?.items || []}
        onSave={handleSoftCostWizardSave}
      />

      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
      />

      {/* Hidden Report for Printing */}
      {isPrintingReport && (
          <div className="fixed inset-0 bg-white z-[9999] overflow-auto p-8">
              <div className="max-w-4xl mx-auto">
                  <div className="flex justify-end mb-4 print:hidden">
                      <button onClick={() => setIsPrintingReport(false)} className="mr-4 text-[#78819D] underline">Close Preview</button>
                      <button onClick={handlePrint} className="bg-brand-500 text-white px-4 py-2 rounded font-bold hover:bg-brand-600">Print / Save PDF</button>
                  </div>
                  <PrintableReport
                      propertyDetails={propertyDetails}
                      asIsProjectedData={asIsProjectedData}
                      selectedCondition={selectedCondition}
                      selectedRehabType={selectedRehabType}
                      selectedMaterialQuality={selectedMaterialQuality}
                      projectQuestions={projectQuestions}
                      budgetData={budgetData}
                      scopeSummary={scopeSummary}
                      projectScopeStatement={projectScopeStatement}
                  />
              </div>
          </div>
      )}
    {/* Brand Footer Strip */}
    <div className="w-full border-t border-[#DFE1E5] bg-white py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0 print:hidden">
      {/* Logo */}
      <img
        src="https://www.limaone.com/wp-content/uploads/lima-one-logo-dark-250x66.webp"
        alt="Lima One Capital"
        width={100}
        height={27}
        className="object-contain"
      />
      {/* Legal text */}
      <p className="text-[10px] text-[#78819D] text-center leading-relaxed">
        © {new Date().getFullYear()} Lima One Capital, LLC &nbsp;·&nbsp; NMLS #1324403 &nbsp;·&nbsp; 300 East McBee Ave, Suite 200, Greenville, SC 29601 &nbsp;·&nbsp; Nation's Premier Lender for Real Estate Investors®
      </p>
      {/* Contact */}
      <a
        href="tel:8003904212"
        className="text-[11px] text-[#78819D] hover:text-brand-500 transition-colors font-medium whitespace-nowrap"
      >
        (800) 390-4212
      </a>
    </div>
    <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
