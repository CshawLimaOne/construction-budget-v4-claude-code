import type { UserRole } from '../types';

export interface Session {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
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
  role: UserRole;
}

// Test-mode only. Not for production use - passwords are plaintext and
// unrelated to any real identity provider.
const TEST_USERS: TestUser[] = [
  { userId: 'borrower-1', name: 'Jordan Smith', email: 'borrower@test.com', password: 'password', role: 'borrower' },
  { userId: 'borrower-2', name: 'Amy Lee', email: 'borrower2@test.com', password: 'password', role: 'borrower' },
  { userId: 'analyst-1', name: 'Morgan Chen', email: 'analyst@test.com', password: 'password', role: 'analyst' },
];

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
