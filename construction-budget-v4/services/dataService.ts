import type { AppState, ApplicationStatus, AssignmentRecord, BudgetTemplate, PortalRole, ProjectTypeMode, ReviewTier } from '../types';
import { getInitialAppState, MOCK_TEMPLATES } from '../constants';
import { applyTemplateToState, stripTemplatePhotos } from '../utils/templateUtils';

// Must match App.tsx's own LOCAL_STORAGE_KEY_BASE / storageKey scheme exactly,
// so the wizard's existing save/load effects and this service share one
// source of truth instead of keeping two copies of budget data in sync.
const BUDGET_KEY_BASE = 'constructionBudgetData_v4';
const budgetStorageKey = (budgetId: string) => `${BUDGET_KEY_BASE}_${budgetId}`;

// Ownership is tracked separately because AppState (owned by App.tsx) has no
// concept of "which user does this budget belong to".
const OWNERSHIP_INDEX_KEY = 'l1_budget_ownership_index';

// Assignment/review workflow metadata, also tracked separately from AppState
// - it must not live inside the wizard's own save blob, which the borrower's
// auto-save effect rewrites on every change and knows nothing about tiers,
// assignment, or escalation.
const ASSIGNMENT_INDEX_KEY = 'l1_budget_assignments';

// Borrower-saved templates. MOCK_TEMPLATES (starter templates, no userId)
// are always available to everyone alongside whatever's stored here.
const TEMPLATE_INDEX_KEY = 'l1_budget_templates';

// FNF (Fix & Flip / renovation) vs NC (New Construction) approval ceilings,
// checked against the borrower's submitted total (scopeSummary.borrowerTotal).
type ConcreteProjectType = Exclude<ProjectTypeMode, null>;

export const APPROVAL_LIMITS: Record<ReviewTier, Record<ConcreteProjectType, number>> = {
  analyst_i: { renovation: 250_000, new_construction: 750_000 },
  senior_analyst: { renovation: 1_000_000, new_construction: 2_500_000 },
  manager: { renovation: Infinity, new_construction: Infinity },
};

export function getApprovalLimit(role: ReviewTier, projectType: ProjectTypeMode | null | undefined): number {
  if (!projectType) return APPROVAL_LIMITS[role].renovation;
  return APPROVAL_LIMITS[role][projectType];
}

export interface BudgetSummary {
  budgetId: string;
  userId: string;
  borrowerName: string;
  projectName: string;
  status: ApplicationStatus;
  createdAt: number;
  projectTypeMode: ProjectTypeMode | null;
  rehabType: string;
  borrowerTotal: number;
  assignment: AssignmentRecord | null;
}

export interface ListForReviewFilter {
  status?: ApplicationStatus;
}

export interface DataService {
  listBudgetsForUser(userId: string): Promise<BudgetSummary[]>;
  listBudgetsForReview(filter?: ListForReviewFilter): Promise<BudgetSummary[]>;
  listBudgetsForRole(role: PortalRole, userId: string): Promise<BudgetSummary[]>;
  getBudget(budgetId: string): Promise<AppState | null>;
  getAssignment(budgetId: string): Promise<AssignmentRecord | null>;
  updateStatus(budgetId: string, status: ApplicationStatus): Promise<void>;
  createBudget(userId: string, template?: BudgetTemplate): Promise<string>;
  deleteBudget(budgetId: string, userId: string): Promise<void>;
  assignBudget(budgetId: string, assignedToUserId: string, assignedToName: string, assignedToRole: ReviewTier, assignedByUserId: string): Promise<void>;
  sendBackToAnalyst(budgetId: string): Promise<void>;
  escalate(budgetId: string, nextTier: ReviewTier): Promise<void>;
  listTemplatesForUser(userId: string): Promise<BudgetTemplate[]>;
  saveTemplate(userId: string, template: Omit<BudgetTemplate, 'id' | 'userId' | 'createdAt'>): Promise<BudgetTemplate>;
  deleteTemplate(templateId: string, userId: string): Promise<void>;
}

interface OwnershipEntry {
  budgetId: string;
  userId: string;
  createdAt: number;
}

function readOwnershipIndex(): OwnershipEntry[] {
  const raw = localStorage.getItem(OWNERSHIP_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OwnershipEntry[];
  } catch {
    return [];
  }
}

function writeOwnershipIndex(index: OwnershipEntry[]): void {
  localStorage.setItem(OWNERSHIP_INDEX_KEY, JSON.stringify(index));
}

function readAssignmentIndex(): AssignmentRecord[] {
  const raw = localStorage.getItem(ASSIGNMENT_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AssignmentRecord[];
  } catch {
    return [];
  }
}

function writeAssignmentIndex(index: AssignmentRecord[]): void {
  localStorage.setItem(ASSIGNMENT_INDEX_KEY, JSON.stringify(index));
}

function findAssignment(budgetId: string): AssignmentRecord | null {
  return readAssignmentIndex().find((a) => a.budgetId === budgetId) || null;
}

function readTemplateIndex(): BudgetTemplate[] {
  const raw = localStorage.getItem(TEMPLATE_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BudgetTemplate[];
  } catch {
    return [];
  }
}

function writeTemplateIndex(index: BudgetTemplate[]): void {
  localStorage.setItem(TEMPLATE_INDEX_KEY, JSON.stringify(index));
}

function readBudgetState(budgetId: string): AppState | null {
  const raw = localStorage.getItem(budgetStorageKey(budgetId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

function toSummary(entry: OwnershipEntry, state: AppState | null): BudgetSummary {
  return {
    budgetId: entry.budgetId,
    userId: entry.userId,
    borrowerName: state?.feasibilityData?.borrowerName || '',
    projectName: state?.propertyDetails?.street || 'Untitled Project',
    status: state?.applicationStatus || 'draft',
    createdAt: entry.createdAt,
    projectTypeMode: state?.projectTypeMode || null,
    rehabType: state?.selectedRehabType || '',
    borrowerTotal: state?.scopeSummary?.borrowerTotal || 0,
    assignment: findAssignment(entry.budgetId),
  };
}

export class LocalDataService implements DataService {
  async listBudgetsForUser(userId: string): Promise<BudgetSummary[]> {
    return readOwnershipIndex()
      .filter((entry) => entry.userId === userId)
      .map((entry) => toSummary(entry, readBudgetState(entry.budgetId)));
  }

  async listBudgetsForReview(filter?: ListForReviewFilter): Promise<BudgetSummary[]> {
    const summaries = readOwnershipIndex().map((entry) => toSummary(entry, readBudgetState(entry.budgetId)));
    if (!filter?.status) return summaries;
    return summaries.filter((s) => s.status === filter.status);
  }

  async listBudgetsForRole(role: PortalRole, userId: string): Promise<BudgetSummary[]> {
    if (role === 'borrower') return this.listBudgetsForUser(userId);
    // Manager sees the entire queue; Analyst I / Senior Analyst see only
    // what's been assigned to them. This is the only role-based filtering
    // point - dashboards don't need to know about assignment storage.
    const all = await this.listBudgetsForReview();
    if (role === 'manager') return all;
    return all.filter((b) => b.assignment?.assignedToUserId === userId);
  }

  async getBudget(budgetId: string): Promise<AppState | null> {
    return readBudgetState(budgetId);
  }

  async getAssignment(budgetId: string): Promise<AssignmentRecord | null> {
    return findAssignment(budgetId);
  }

  async updateStatus(budgetId: string, status: ApplicationStatus): Promise<void> {
    const state = readBudgetState(budgetId);
    if (!state) throw new Error(`Budget ${budgetId} not found.`);
    state.applicationStatus = status;
    localStorage.setItem(budgetStorageKey(budgetId), JSON.stringify(state));
  }

  async createBudget(userId: string, template?: BudgetTemplate): Promise<string> {
    const budgetId = `budget-${userId}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const index = readOwnershipIndex();
    index.push({ budgetId, userId, createdAt: Date.now() });
    writeOwnershipIndex(index);
    if (template) {
      // Pre-populate the new budget's storage with the template applied,
      // using the same transformation the in-wizard Template Library uses
      // (see applyTemplateToState) so both entry points stay consistent.
      // Without this, App.tsx would mount with default empty state since
      // it only writes the real AppState on its own mount/first change.
      const initialState = applyTemplateToState(getInitialAppState(), template);
      localStorage.setItem(budgetStorageKey(budgetId), JSON.stringify(initialState));
    }
    return budgetId;
  }

  async deleteBudget(budgetId: string, userId: string): Promise<void> {
    // Scoped to userId so a borrower can only ever delete their own
    // budget, matching deleteTemplate's ownership check.
    const index = readOwnershipIndex();
    const owned = index.find((e) => e.budgetId === budgetId && e.userId === userId);
    if (!owned) throw new Error(`Budget ${budgetId} not found for this user.`);
    writeOwnershipIndex(index.filter((e) => e.budgetId !== budgetId));
    writeAssignmentIndex(readAssignmentIndex().filter((a) => a.budgetId !== budgetId));
    localStorage.removeItem(budgetStorageKey(budgetId));
  }

  async assignBudget(
    budgetId: string,
    assignedToUserId: string,
    assignedToName: string,
    assignedToRole: ReviewTier,
    assignedByUserId: string
  ): Promise<void> {
    const index = readAssignmentIndex();
    const existing = index.find((a) => a.budgetId === budgetId);
    const record: AssignmentRecord = {
      budgetId,
      assignedToUserId,
      assignedToName,
      assignedToRole,
      assignedByUserId,
      assignedAt: Date.now(),
      reviewStatus: 'assigned',
    };
    if (existing) {
      Object.assign(existing, record);
    } else {
      index.push(record);
    }
    writeAssignmentIndex(index);
  }

  async sendBackToAnalyst(budgetId: string): Promise<void> {
    const index = readAssignmentIndex();
    const existing = index.find((a) => a.budgetId === budgetId);
    if (!existing) throw new Error(`No assignment found for budget ${budgetId}.`);
    existing.reviewStatus = 'needs_analyst_revision';
    writeAssignmentIndex(index);
  }

  async escalate(budgetId: string, nextTier: ReviewTier): Promise<void> {
    const index = readAssignmentIndex();
    const existing = index.find((a) => a.budgetId === budgetId);
    if (!existing) throw new Error(`No assignment found for budget ${budgetId}.`);
    // Clears the specific assignee - our assignment model is "assign to a
    // named person", so escalating hands it back to the Manager's pool to
    // reassign to an actual Senior Analyst/Manager, rather than leaving it
    // bound to whoever escalated it (who is NOT that tier) and having it
    // incorrectly still show up in their own assigned-to-me queue.
    existing.assignedToUserId = '';
    existing.assignedToName = '';
    existing.assignedToRole = nextTier;
    existing.reviewStatus = 'escalated';
    writeAssignmentIndex(index);
  }

  async listTemplatesForUser(userId: string): Promise<BudgetTemplate[]> {
    const own = readTemplateIndex().filter((t) => t.userId === userId);
    return [...MOCK_TEMPLATES, ...own];
  }

  async saveTemplate(userId: string, template: Omit<BudgetTemplate, 'id' | 'userId' | 'createdAt'>): Promise<BudgetTemplate> {
    const newTemplate: BudgetTemplate = {
      ...template,
      budgetData: stripTemplatePhotos(template.budgetData),
      id: `custom-template-${Date.now()}`,
      userId,
      createdAt: Date.now(),
    };
    const index = readTemplateIndex();
    index.push(newTemplate);
    writeTemplateIndex(index);
    return newTemplate;
  }

  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const index = readTemplateIndex();
    // Scoped to userId so a borrower can only ever delete their own saved
    // templates, never a starter template (which isn't in this index at
    // all) or another borrower's.
    writeTemplateIndex(index.filter((t) => !(t.id === templateId && t.userId === userId)));
  }
}

// Test-mode only: populate a few sample budgets across seeded test users so
// the dashboards have data to render before any real submissions exist.
export function seedTestBudgetsIfEmpty(): void {
  if (readOwnershipIndex().length > 0) return;

  const seeds: Array<{
    userId: string;
    street: string;
    status: ApplicationStatus;
    borrowerName: string;
    assignment?: { userId: string; name: string; role: ReviewTier; reviewStatus: AssignmentRecord['reviewStatus'] };
  }> = [
    { userId: 'borrower-1', street: '123 Main St', status: 'draft', borrowerName: 'Jordan Smith' },
    {
      userId: 'borrower-1',
      street: '456 Oak Ave',
      status: 'under_review',
      borrowerName: 'Jordan Smith',
      assignment: { userId: 'analyst-1', name: 'Alex Analyst', role: 'analyst_i', reviewStatus: 'assigned' },
    },
    {
      userId: 'borrower-2',
      street: '789 Pine Rd',
      status: 'approved',
      borrowerName: 'Amy Lee',
      assignment: { userId: 'senior-1', name: 'Morgan Chen', role: 'senior_analyst', reviewStatus: 'approved' },
    },
  ];

  const index: OwnershipEntry[] = [];
  const assignments: AssignmentRecord[] = [];
  seeds.forEach((seed, i) => {
    const budgetId = `budget-seed-${i + 1}`;
    const state = getInitialAppState();
    state.propertyDetails = { ...state.propertyDetails, street: seed.street };
    state.applicationStatus = seed.status;
    state.feasibilityData = { ...state.feasibilityData, borrowerName: seed.borrowerName };
    // A real in-progress-or-submitted budget always has these set by the
    // time a borrower gets past the wizard; without them the wizard would
    // show the welcome/project-type screens instead of the actual budget.
    state.projectTypeMode = 'renovation';
    state.selectedRehabType = 'Standard-Full';
    state.selectedMaterialQuality = 'Q4';
    state.isStarted = true;
    localStorage.setItem(budgetStorageKey(budgetId), JSON.stringify(state));
    index.push({ budgetId, userId: seed.userId, createdAt: Date.now() - (seeds.length - i) * 86400000 });

    if (seed.assignment) {
      assignments.push({
        budgetId,
        assignedToUserId: seed.assignment.userId,
        assignedToName: seed.assignment.name,
        assignedToRole: seed.assignment.role,
        assignedByUserId: 'manager-1',
        assignedAt: Date.now() - (seeds.length - i) * 86400000,
        reviewStatus: seed.assignment.reviewStatus,
      });
    }
  });
  writeOwnershipIndex(index);
  writeAssignmentIndex(assignments);
}
