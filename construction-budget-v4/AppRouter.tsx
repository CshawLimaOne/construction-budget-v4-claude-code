import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BudgetWizardRoute } from './components/BudgetWizardRoute';
import { BorrowerDashboard } from './components/BorrowerDashboard';
import { ReviewDashboard } from './components/ReviewDashboard';
import { seedTestBudgetsIfEmpty } from './services/dataService';

const RootRedirect: React.FC = () => {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={session.role === 'borrower' ? '/dashboard' : '/review'} replace />;
};

export const AppRouter: React.FC = () => {
  useEffect(() => {
    seedTestBudgetsIfEmpty();
  }, []);

  return (
    <SessionProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['borrower']}>
                <BorrowerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ProtectedRoute allowedRoles={['analyst_i', 'senior_analyst', 'manager']}>
                <ReviewDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget/:budgetId"
            element={
              <ProtectedRoute>
                <BudgetWizardRoute />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </SessionProvider>
  );
};
