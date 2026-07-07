import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { LocalDataService, BudgetSummary } from '../services/dataService';
import { listAssignableUsers } from '../services/authService';
import type { ApplicationStatus, ReviewTier } from '../types';
import { PortalHeader } from './PortalHeader';

const dataService = new LocalDataService();
const assignableUsers = listAssignableUsers();

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  draft: 'bg-[#F4F5F7] text-[#78819D]',
  under_review: 'bg-[#FDF3DC] text-[#8A6A05]',
  needs_borrower_action: 'bg-[#FBE4E1] text-[#B92814]',
  approved: 'bg-[#E1F5E3] text-[#139B23]',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  needs_borrower_action: 'Needs Borrower Action',
  approved: 'Approved',
};

const TIER_LABELS: Record<ReviewTier, string> = {
  analyst_i: 'Analyst I',
  senior_analyst: 'Senior Analyst',
  manager: 'Manager',
};

const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatRehabType = (rehabType: string) => (rehabType ? rehabType.replace(/-/g, ' - ') : '—');

const STATUS_FILTERS: Array<{ value: ApplicationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'needs_borrower_action', label: 'Needs Borrower Action' },
  { value: 'approved', label: 'Approved' },
  { value: 'draft', label: 'Draft' },
];

export const ReviewDashboard: React.FC = () => {
  const { session, logout } = useSession();
  const navigate = useNavigate();
  const isManager = session?.role === 'manager';
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('under_review');
  const [search, setSearch] = useState('');

  const loadBudgets = async () => {
    if (!session) return;
    setIsLoading(true);
    const list = await dataService.listBudgetsForRole(session.role, session.userId);
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

  const handleAssign = async (budgetId: string, assigneeKey: string) => {
    if (!session) return;
    if (!assigneeKey) return;
    const assignee = assignableUsers.find((u) => u.userId === assigneeKey);
    if (!assignee) return;
    await dataService.assignBudget(budgetId, assignee.userId, assignee.name, assignee.role, session.userId);
    loadBudgets();
  };

  const filtered = useMemo(() => {
    return budgets.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!b.borrowerName.toLowerCase().includes(q) && !b.projectName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [budgets, statusFilter, search]);

  return (
    <div className="h-full overflow-y-auto bg-[#F4F5F7] p-8">
      <div className="max-w-6xl mx-auto">
        <PortalHeader
          title={isManager ? 'Budget Review Queue' : 'My Assigned Reviews'}
          subtitle={isManager ? `Signed in as ${session?.name ?? ''} · all submitted budgets` : `Signed in as ${session?.name ?? ''}`}
          actions={
            <button
              onClick={handleLogout}
              className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5]"
            >
              Log out
            </button>
          }
        />

        <div className="flex items-center gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
            className="border border-[#DFE1E5] rounded-lg text-sm px-3 py-2 bg-white text-[#1E2D5C] focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search borrower or address..."
            className="flex-1 border border-[#DFE1E5] rounded-lg text-sm px-3 py-2 text-[#1E2D5C] focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#DFE1E5] shadow-sm p-8 text-center text-[#78819D]">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DFE1E5] shadow-sm p-8 text-center text-[#78819D]">
            {isManager ? 'No budgets match this filter.' : "Nothing's been assigned to you yet."}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DFE1E5] shadow-sm divide-y divide-[#DFE1E5] overflow-hidden">
            <div
              className={`grid gap-4 px-6 py-3 text-xs font-semibold text-[#78819D] uppercase tracking-wide ${isManager ? 'grid-cols-7' : 'grid-cols-6'}`}
            >
              <span>Borrower</span>
              <span>Project</span>
              <span>Rehab Type</span>
              <span>Requested Budget</span>
              <span>Status</span>
              <span>Assigned To</span>
              {isManager && <span>Assign</span>}
            </div>
            {filtered.map((b) => (
              <div
                key={b.budgetId}
                onClick={() => navigate(`/budget/${b.budgetId}`)}
                className={`grid gap-4 items-center px-6 py-4 hover:bg-[#F7F9FC] transition-colors cursor-pointer ${isManager ? 'grid-cols-7' : 'grid-cols-6'}`}
              >
                <span className="font-semibold text-[#1E2D5C]">{b.borrowerName || 'Unknown'}</span>
                <span className="text-[#4A5580]">{b.projectName}</span>
                <span className="text-[#4A5580]">{formatRehabType(b.rehabType)}</span>
                <span className="font-semibold text-[#1E2D5C]">{formatCurrency(b.borrowerTotal)}</span>
                <span>
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 ${STATUS_STYLES[b.status]}`}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </span>
                <span className="text-xs text-[#78819D]">
                  {b.assignment?.assignedToUserId ? (
                    <>
                      {b.assignment.assignedToName}
                      <span className="block text-[10px] uppercase tracking-wide text-[#BCBFC7]">
                        {TIER_LABELS[b.assignment.assignedToRole]}
                      </span>
                    </>
                  ) : b.assignment?.reviewStatus === 'escalated' ? (
                    <span className="text-[#8A6A05] font-semibold">
                      Needs {TIER_LABELS[b.assignment.assignedToRole]}
                    </span>
                  ) : (
                    <span className="text-[#BCBFC7]">Unassigned</span>
                  )}
                </span>
                {isManager && (
                  <span onClick={(e) => e.stopPropagation()}>
                    <select
                      value={b.assignment?.assignedToUserId ?? ''}
                      onChange={(e) => handleAssign(b.budgetId, e.target.value)}
                      className="w-full border border-[#DFE1E5] rounded-lg text-xs px-2 py-1.5 bg-white text-[#1E2D5C] focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Unassigned</option>
                      {assignableUsers.map((u) => (
                        <option key={u.userId} value={u.userId}>
                          {u.name} ({TIER_LABELS[u.role]})
                        </option>
                      ))}
                    </select>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
