
import React, { useState } from 'react';
import { CalculatorIcon } from './Icons'; // Make sure to import icon if used

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onStartWithTemplate: () => void;
  onOpenEstimator?: () => void; // Optional prop for now
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onStartWithTemplate, onOpenEstimator }) => {
  const [borrowerType, setBorrowerType] = useState<'new' | 'repeat'>('new');

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="borrower-toggle-container">
          <button
            className={`borrower-toggle-option ${borrowerType === 'new' ? 'active' : ''}`}
            onClick={() => setBorrowerType('new')}
            aria-pressed={borrowerType === 'new'}
          >
            New Borrower
          </button>
          <button
            className={`borrower-toggle-option ${borrowerType === 'repeat' ? 'active' : ''}`}
            onClick={() => setBorrowerType('repeat')}
            aria-pressed={borrowerType === 'repeat'}
          >
            Repeat Borrower
          </button>
        </div>

        {borrowerType === 'new' ? (
          <>
            <h1 className="welcome-title">Let's build your Construction Budget.</h1>
            <p className="welcome-text">
              This guided process will help you create a detailed and accurate budget for your project. Please complete the four steps to submit your application for review.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={onGetStarted} className="button-base get-started-button">
                  Get Started
                </button>
                {onOpenEstimator && (
                    <button onClick={onOpenEstimator} className="button-base bg-purple-600 text-white hover:bg-purple-700">
                       🚀 Start with AI Estimator
                    </button>
                )}
            </div>
          </>
        ) : (
          <>
            <h1 className="welcome-title">Welcome back, John!</h1>
            <p className="welcome-text">
              We're excited to see your next project. To speed things up, you can start with your standard budget template which includes your most commonly used line items, or begin with a fresh budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button onClick={onStartWithTemplate} className="button-base get-started-button">
                    Use Standard Template
                </button>
                <button onClick={onGetStarted} className="button-base tutorial-button">
                    Start New Blank Budget
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};