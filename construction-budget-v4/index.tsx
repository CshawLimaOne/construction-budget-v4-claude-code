import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { InitializationData } from './types';
import './styles.css'; // Import isolated styles for bundling

// Define the interface for the window object
declare global {
  interface Window {
    ConstructionBudget: {
      mount: (config?: { selector?: string; data?: InitializationData }) => void;
      unmount: () => void;
    };
  }
}

let root: ReactDOM.Root | null = null;
const DEFAULT_SELECTOR = 'construction-budget-app';

// Helper to ensure external dependencies (Tailwind, Fonts, etc.) are loaded
// if the host site doesn't have them.
const loadDependencies = () => {
  // 1. Tailwind CSS — set brand config before CDN script so custom colors are available
  if (!document.querySelector('script[src*="tailwindcss.com"]')) {
    (window as any).tailwind = {
      config: {
        theme: {
          extend: {
            colors: {
              brand: {
                50:  '#eff8fe',
                100: '#d5edfb',
                200: '#a8daf7',
                300: '#6bbff1',
                400: '#2fa3e8',
                500: '#0693e3',
                600: '#0578c4',
                700: '#0460a3',
                800: '#074d80',
                900: '#09406a',
              }
            }
          }
        }
      }
    };
    const script = document.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }

  // 2. Shepherd.js CSS
  if (!document.querySelector('link[href*="shepherd.js"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/shepherd.js@10.0.1/dist/css/shepherd.css';
    document.head.appendChild(link);
  }

  // 3. Fonts (Inter) - Optional, but good for consistency
  if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
     const linkPre = document.createElement('link');
     linkPre.rel = 'preconnect'; 
     linkPre.href = 'https://fonts.googleapis.com';
     document.head.appendChild(linkPre);

     const linkPre2 = document.createElement('link');
     linkPre2.rel = 'preconnect';
     linkPre2.href = 'https://fonts.gstatic.com';
     linkPre2.crossOrigin = 'anonymous';
     document.head.appendChild(linkPre2);

     const linkFont = document.createElement('link');
     linkFont.rel = 'stylesheet';
     linkFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap';
     document.head.appendChild(linkFont);
  }
};

const mount = (config: { selector?: string; data?: InitializationData } = {}) => {
  loadDependencies(); // Ensure environment is ready

  const selector = config.selector || DEFAULT_SELECTOR;
  const container = document.getElementById(selector);

  if (!container) {
    console.error(`Construction Budget Widget: Container element #${selector} not found.`);
    return;
  }

  // Unmount existing app if any
  if (root) {
    root.unmount();
  }

  root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App initialData={config.data} />
    </React.StrictMode>
  );
};

const unmount = () => {
  if (root) {
    root.unmount();
    root = null;
  }
};

// Expose the global interface
window.ConstructionBudget = {
  mount,
  unmount
};
