import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';

export const LoginPage: React.FC = () => {
  const { login } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await login(email, password);
      navigate(session.role === 'borrower' ? '/dashboard' : '/review', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#DFE1E5] shadow-sm p-8">
        <div className="pb-5 mb-6 border-b border-[#DFE1E5]">
          <img
            src="https://www.limaone.com/wp-content/uploads/lima-one-logo-light-250x66.webp"
            alt="Lima One Capital"
            width={170}
            height={45}
            className="object-contain"
            style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(44%) saturate(1200%) hue-rotate(200deg) brightness(90%) contrast(95%)' }}
          />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#78819D] mt-2">
            Construction Finance Platform
          </p>
        </div>

        <h1 className="text-xl font-bold text-[#1E2D5C] mb-1">Sign in</h1>
        <p className="text-sm text-[#78819D] mb-6">Construction Budget Portal (Test Mode)</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1E2D5C] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-[#DFE1E5] rounded-lg px-3 py-2 text-sm text-[#1E2D5C] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1E2D5C] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-[#DFE1E5] rounded-lg px-3 py-2 text-sm text-[#1E2D5C] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-[#B92814]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="button-base w-full bg-brand-500 hover:bg-brand-600 text-white"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 border-t border-[#DFE1E5] pt-4 text-xs text-[#78819D] space-y-1">
          <p className="font-semibold text-[#1E2D5C]">Test-mode accounts:</p>
          <p>borrower@test.com / password (Borrower)</p>
          <p>borrower2@test.com / password (Borrower)</p>
          <p>analyst1@test.com / password (Analyst I)</p>
          <p>analyst2@test.com / password (Analyst I)</p>
          <p>senior@test.com / password (Senior Analyst)</p>
          <p>manager@test.com / password (Manager)</p>
        </div>
      </div>
    </div>
  );
};
