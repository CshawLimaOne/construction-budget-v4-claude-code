import React, { createContext, useContext, useState, useCallback } from 'react';
import { MockAuthService, type Session, type AuthService } from '../services/authService';

const authService: AuthService = new MockAuthService();

interface SessionContextValue {
  session: Session | null;
  login: (email: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(() => authService.getCurrentSession());

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setSession(result);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
