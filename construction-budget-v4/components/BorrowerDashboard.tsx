import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { LocalDataService, BudgetSummary } from '../services/dataService';
import type { ApplicationStatus } from '../types';
import { PortalHeader } from './PortalHeader';

const dataService = new LocalDataService();

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  draft: 'bg-[#F4F5F7] text-[#78819D]',
  under_review: 'bg-[#FDF3DC] text-[#8A6A05]',
  needs_borrower_action: 'bg-[#FBE4E1] text-[#B92814]',
  approved: 'bg-[#E1F5E3] text-[#139B23]',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  needs_borrower_action: 'Needs Your Action',
  approved: 'Approved',
};

export const BorrowerDashboard: React.FC = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadBudgets = async () => {
    if (!session) return;
    setIsLoading(true);
    const list = await dataService.listBudgetsForUser(session.userId);
    list.sort((a, b) => b.createdAt - a.createdAt);
    setBudgets(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNewBudget = async () => {
    if (!session) return;
    setIsCreating(true);
    try {
      const budgetId = await dataService.createBudget(session.userId);
      navigate(`/budget/${budgetId}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-8">
      <div className="max-w-3xl mx-auto">
        <PortalHeader
          title="My Budgets"
          subtitle={`Welcome back, ${session?.name ?? ''}`}
          actions={
            <>
              <button
                onClick={handleNewBudget}
                disabled={isCreating}
                className="button-base bg-brand-500 hover:bg-brand-600 text-white"
              >
                {isCreating ? 'Creating...' : '+ New Budget'}
              </button>
              <button
                onClick={handleLogout}
                className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5]"
              >
                Log out
              </button>
            </>
          }
        />

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#DFE1E5] shadow-sm p-8 text-center text-[#78819D]">
            Loading...
          </div>
        ) : budgets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DFE1E5] shadow-sm p-8 text-center text-[#78819D]">
            You don't have any budgets yet. Click "+ New Budget" to get started.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DFE1E5] shadow-sm divide-y divide-[#DFE1E5] overflow-hidden">
            {budgets.map((b) => (
              <button
                key={b.budgetId}
                onClick={() => navigate(`/budget/${b.budgetId}`)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-[#F7F9FC] transition-colors"
              >
                <div>
                  <p className="font-semibold text-[#1E2D5C]">{b.projectName}</p>
                  <p className="text-xs text-[#78819D] mt-0.5">
                    Created {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-3 py-1 ${STATUS_STYLES[b.status]}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
