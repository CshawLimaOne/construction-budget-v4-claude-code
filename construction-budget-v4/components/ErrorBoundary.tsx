import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[ConstructionBudget] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] p-6">
          <div className="max-w-lg w-full bg-white border border-[#F5C6BF] rounded-2xl p-8 text-center space-y-5" style={{ boxShadow: '0 2.12px 19.86px rgba(30,45,92,0.05), 0 9.48px 45.88px rgba(30,45,92,0.036)' }}>
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-[#FFF0EE] border border-[#F5C6BF]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#B92814]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1E2D5C] mb-1">Something went wrong</h2>
              <p className="text-[#78819D] text-sm">
                An unexpected error occurred in the Construction Budget app. Your data has not been lost.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-[#F6F7F9] border border-[#DFE1E5] rounded-lg p-3">
                <p className="text-xs font-mono text-[#B92814] break-words">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-lg bg-white border border-[#DFE1E5] hover:bg-[#F7F9FC] text-[#1E2D5C] text-sm font-semibold transition-colors"
              >
                Reload Page
              </button>
            </div>

            <p className="text-xs text-[#78819D]">
              If this keeps happening, check the browser console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
