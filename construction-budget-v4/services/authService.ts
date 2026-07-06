import type { PortalRole, ReviewTier } from '../types';

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: PortalRole;
}

export interface AuthService {
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getCurrentSession(): Session | null;
}

const SESSION_STORAGE_KEY = 'l1_session';

interface TestUser {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: PortalRole;
}

// Test-mode only. Not for production use - passwords are plaintext and
// unrelated to any real identity provider.
const TEST_USERS: TestUser[] = [
  { userId: 'borrower-1', name: 'Jordan Smith', email: 'borrower@test.com', password: 'password', role: 'borrower' },
  { userId: 'borrower-2', name: 'Amy Lee', email: 'borrower2@test.com', password: 'password', role: 'borrower' },
  { userId: 'analyst-1', name: 'Alex Analyst', email: 'analyst1@test.com', password: 'password', role: 'analyst_i' },
  { userId: 'analyst-2', name: 'Sam Analyst', email: 'analyst2@test.com', password: 'password', role: 'analyst_i' },
  { userId: 'senior-1', name: 'Morgan Chen', email: 'senior@test.com', password: 'password', role: 'senior_analyst' },
  { userId: 'manager-1', name: 'Taylor Manager', email: 'manager@test.com', password: 'password', role: 'manager' },
];

export interface AssignableUser {
  userId: string;
  name: string;
  role: ReviewTier;
}

// Test-mode only: the roster a Manager can assign budgets to. In a real
// backend this would be a directory/user-management API call, not a
// lookup against the mock login roster.
export function listAssignableUsers(): AssignableUser[] {
  return TEST_USERS.filter((u): u is TestUser & { role: ReviewTier } => u.role !== 'borrower' && u.role !== 'manager').map(
    (u) => ({ userId: u.userId, name: u.name, role: u.role })
  );
}

export class MockAuthService implements AuthService {
  async login(email: string, password: string): Promise<Session> {
    const match = TEST_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!match) {
      throw new Error('Invalid email or password.');
    }
    const session: Session = {
      userId: match.userId,
      name: match.name,
      email: match.email,
      role: match.role,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  getCurrentSession(): Session | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }
}
