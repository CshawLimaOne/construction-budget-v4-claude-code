import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from '../App';
import { useSession } from '../contexts/SessionContext';
import { LocalDataService } from '../services/dataService';
import type { AssignmentRecord, ReviewTier, UserRole } from '../types';

const dataService = new LocalDataService();

const NEXT_TIER: Partial<Record<ReviewTier, ReviewTier>> = {
  analyst_i: 'senior_analyst',
  senior_analyst: 'manager',
};

export const BudgetWizardRoute: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const { session } = useSession();
  const navigate = useNavigate();
  const role = session?.role;
  const isBorrower = role === 'borrower';
  const reviewerRole = !isBorrower && role !== undefined ? role : undefined;

  const [assignment, setAssignment] = useState<AssignmentRecord | null>(null);

  useEffect(() => {
    if (!budgetId || isBorrower) return;
    dataService.getAssignment(budgetId).then(setAssignment);
  }, [budgetId, isBorrower]);

  // App.tsx's internal UserRole is only 'borrower' | 'analyst' - it doesn't
  // yet distinguish Analyst I / Senior Analyst / Manager tiers for most of
  // its logic. Any non-borrower PortalRole maps down to 'analyst' there;
  // the real tier is passed separately (reviewerRole, below) for the
  // approval-limit / escalation logic that does need it.
  const wizardRole: UserRole | undefined = role ? (isBorrower ? 'borrower' : 'analyst') : undefined;

  // App.tsx's load effect keys off initialData's object identity, not its
  // contents - a fresh literal every render would re-trigger that effect
  // continuously and can race with App's own auto-save effect, overwriting
  // freshly loaded budget data with blank defaults. Memoize so identity only
  // changes when budgetId/role actually change.
  const initialData = useMemo(() => ({ id: budgetId, userRole: wizardRole }), [budgetId, wizardRole]);

  const handleEscalate = async () => {
    if (!budgetId || !reviewerRole) return;
    const nextTier = NEXT_TIER[reviewerRole as ReviewTier];
    if (!nextTier) return;
    await dataService.escalate(budgetId, nextTier);
    navigate('/review');
  };

  const handleSendBackToAnalyst = async () => {
    if (!budgetId) return;
    await dataService.sendBackToAnalyst(budgetId);
    navigate('/review');
  };

  // Force a full remount per budget: without this, navigating from one
  // budget straight to another reuses the same App instance, and its
  // load effect can race with its auto-save effect using the previous
  // budget's still-in-state data before the new budget's data replaces it.
  return (
    <App
      key={budgetId}
      initialData={initialData}
      onNavigateToDashboard={() => navigate(isBorrower ? '/dashboard' : '/review')}
      dashboardLabel={isBorrower ? 'My Budgets' : 'Review Queue'}
      reviewerRole={reviewerRole as ReviewTier | undefined}
      assignedToRole={assignment?.assignedToRole}
      onEscalate={handleEscalate}
      onSendBackToAnalyst={handleSendBackToAnalyst}
    />
  );
};
