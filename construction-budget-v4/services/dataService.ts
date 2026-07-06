import type { AppState, ApplicationStatus } from '../types';
import { getInitialAppState } from '../constants';

// Must match App.tsx's own LOCAL_STORAGE_KEY_BASE / storageKey scheme exactly,
// so the wizard's existing save/load effects and this service share one
// source of truth instead of keeping two copies of budget data in sync.
const BUDGET_KEY_BASE = 'constructionBudgetData_v4';
const budgetStorageKey = (budgetId: string) => `${BUDGET_KEY_BASE}_${budgetId}`;

// Ownership is tracked separately because AppState (owned by App.tsx) has no
// concept of "which user does this budget belong to".
const OWNERSHIP_INDEX_KEY = 'l1_budget_ownership_index';

export interface BudgetSummary {
  budgetId: string;
  userId: string;
  borrowerName: string;
  projectName: string;
  status: ApplicationStatus;
  createdAt: number;
}

export interface ListForReviewFilter {
  status?: ApplicationStatus;
}

export interface DataService {
  listBudgetsForUser(userId: string): Promise<BudgetSummary[]>;
  listBudgetsForReview(filter?: ListForReviewFilter): Promise<BudgetSummary[]>;
  getBudget(budgetId: string): Promise<AppState | null>;
  updateStatus(budgetId: string, status: ApplicationStatus): Promise<void>;
  createBudget(userId: string): Promise<string>;
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

  async getBudget(budgetId: string): Promise<AppState | null> {
    return readBudgetState(budgetId);
  }

  async updateStatus(budgetId: string, status: ApplicationStatus): Promise<void> {
    const state = readBudgetState(budgetId);
    if (!state) throw new Error(`Budget ${budgetId} not found.`);
    state.applicationStatus = status;
    localStorage.setItem(budgetStorageKey(budgetId), JSON.stringify(state));
  }

  async createBudget(userId: string): Promise<string> {
    const budgetId = `budget-${userId}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const index = readOwnershipIndex();
    index.push({ budgetId, userId, createdAt: Date.now() });
    writeOwnershipIndex(index);
    // App.tsx writes the real AppState on mount/first change; nothing to
    // pre-seed here besides ownership.
    return budgetId;
  }
}

// Test-mode only: populate a few sample budgets across seeded test users so
// the dashboards have data to render before any real submissions exist.
export function seedTestBudgetsIfEmpty(): void {
  if (readOwnershipIndex().length > 0) return;

  const seeds: Array<{ userId: string; street: string; status: ApplicationStatus; borrowerName: string }> = [
    { userId: 'borrower-1', street: '123 Main St', status: 'draft', borrowerName: 'Jordan Smith' },
    { userId: 'borrower-1', street: '456 Oak Ave', status: 'under_review', borrowerName: 'Jordan Smith' },
    { userId: 'borrower-2', street: '789 Pine Rd', status: 'approved', borrowerName: 'Amy Lee' },
  ];

  const index: OwnershipEntry[] = [];
  seeds.forEach((seed, i) => {
    const budgetId = `budget-seed-${i + 1}`;
    const state = getInitialAppState();
    state.propertyDetails = { ...state.propertyDetails, street: seed.street };
    state.applicationStatus = seed.status;
    state.feasibilityData = { ...state.feasibilityData, borrowerName: seed.borrowerName };
    // A real submitted budget always has these set by the time a borrower
    // gets past the wizard; without them the wizard would show the
    // project-type-selection screen instead of the actual budget.
    state.projectTypeMode = 'renovation';
    state.selectedRehabType = 'Standard-Full';
    state.selectedMaterialQuality = 'Q4';
    localStorage.setItem(budgetStorageKey(budgetId), JSON.stringify(state));
    index.push({ budgetId, userId: seed.userId, createdAt: Date.now() - (seeds.length - i) * 86400000 });
  });
  writeOwnershipIndex(index);
}
