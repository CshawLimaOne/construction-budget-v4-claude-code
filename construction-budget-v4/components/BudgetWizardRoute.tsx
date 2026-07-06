import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from '../App';
import { useSession } from '../contexts/SessionContext';

export const BudgetWizardRoute: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const { session } = useSession();
  const navigate = useNavigate();
  const role = session?.role;

  // App.tsx's load effect keys off initialData's object identity, not its
  // contents - a fresh literal every render would re-trigger that effect
  // continuously and can race with App's own auto-save effect, overwriting
  // freshly loaded budget data with blank defaults. Memoize so identity only
  // changes when budgetId/role actually change.
  const initialData = useMemo(() => ({ id: budgetId, userRole: role }), [budgetId, role]);

  const isAnalyst = role === 'analyst';

  // Force a full remount per budget: without this, navigating from one
  // budget straight to another reuses the same App instance, and its
  // load effect can race with its auto-save effect using the previous
  // budget's still-in-state data before the new budget's data replaces it.
  return (
    <App
      key={budgetId}
      initialData={initialData}
      onNavigateToDashboard={() => navigate(isAnalyst ? '/review' : '/dashboard')}
      dashboardLabel={isAnalyst ? 'Review Queue' : 'My Budgets'}
    />
  );
};
