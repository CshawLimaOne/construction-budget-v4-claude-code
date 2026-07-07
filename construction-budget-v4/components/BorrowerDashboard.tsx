import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { LocalDataService, BudgetSummary } from '../services/dataService';
import type { ApplicationStatus, BudgetTemplate } from '../types';
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

const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const BorrowerDashboard: React.FC = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  // Prevents double-creating a budget when React StrictMode (dev only)
  // double-invokes this effect, and guards against re-firing on re-renders.
  const hasAutoRedirectedRef = useRef(false);

  const loadTemplates = async () => {
    if (!session) return;
    const list = await dataService.listTemplatesForUser(session.userId);
    setTemplates(list);
  };

  const loadBudgets = async () => {
    if (!session) return;
    setIsLoading(true);
    const list = await dataService.listBudgetsForUser(session.userId);
    list.sort((a, b) => b.createdAt - a.createdAt);

    // First-time user (no budgets yet): skip the empty list and go straight
    // to a fresh budget's landing page, same as clicking "+ New Budget".
    if (list.length === 0) {
      if (hasAutoRedirectedRef.current) return;
      hasAutoRedirectedRef.current = true;
      const budgetId = await dataService.createBudget(session.userId);
      navigate(`/budget/${budgetId}`, { replace: true });
      return;
    }

    setBudgets(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBudgets();
    loadTemplates();
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

  const handleUseTemplate = async (template: BudgetTemplate) => {
    if (!session) return;
    setCreatingTemplateId(template.id);
    try {
      const budgetId = await dataService.createBudget(session.userId, template);
      navigate(`/budget/${budgetId}`);
    } finally {
      setCreatingTemplateId(null);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!session) return;
    if (!window.confirm('Delete this saved template? This cannot be undone.')) return;
    await dataService.deleteTemplate(templateId, session.userId);
    loadTemplates();
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F5F7] p-8">
      <div className="max-w-4xl mx-auto">
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

        {templates.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-[#1E2D5C] mb-1">Template Library</h2>
            <p className="text-sm text-[#78819D] mb-4">
              Start a new budget pre-filled from a starter template or one you've saved.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((t) => {
                const isOwnTemplate = !!t.userId;
                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl border border-[#DFE1E5] shadow-sm p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-[#1E2D5C]">{t.name}</h3>
                      {isOwnTemplate && (
                        <button
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="text-xs text-[#BCBFC7] hover:text-[#B92814] transition-colors flex-shrink-0"
                          title="Delete template"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-[#78819D] mt-1 flex-grow">{t.description}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold uppercase tracking-wide bg-[#F4F5F7] text-[#78819D] rounded-full px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#DFE1E5]">
                      <span className="font-semibold text-[#1E2D5C]">{formatCurrency(t.totalCostEstimate)}</span>
                      <button
                        onClick={() => handleUseTemplate(t)}
                        disabled={creatingTemplateId === t.id}
                        className="button-base bg-brand-500 hover:bg-brand-600 text-white text-sm"
                      >
                        {creatingTemplateId === t.id ? 'Creating...' : 'Use This Template'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
