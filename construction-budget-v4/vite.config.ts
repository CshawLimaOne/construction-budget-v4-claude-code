// vite.config.ts
// Dev mode:    npm run dev           → standard Vite SPA on localhost:5173
// Widget build: BUILD_TARGET=widget npm run build  → UMD bundle in dist/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom plugin to inject CSS into the JS bundle for a single-file output
const cssInjectedByJsPlugin = () => {
  return {
    name: 'css-injected-by-js',
    apply: 'build',
    enforce: 'post',
    generateBundle(options, bundle) {
      let cssCode = '';
      // 1. Collect all CSS from the bundle
      for (const key in bundle) {
        const chunk = bundle[key];
        if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) {
          cssCode += chunk.source;
          delete bundle[key]; // Remove the separate CSS file from output
        }
      }

      // 2. Inject the CSS as a string into the entry JavaScript chunk
      if (cssCode.length > 0) {
        for (const key in bundle) {
          const chunk = bundle[key];
          if (chunk.type === 'chunk' && chunk.isEntry) {
            // Basic minification: remove newlines and extra spaces
            const minifiedCss = cssCode.replace(/\s+/g, ' ').replace(/\s*\{\s*/g, '{').replace(/\s*\}\s*/g, '}');
            
            // Create a self-executing function to inject the style tag
            const injectCode = `(function(){try{var e=document.createElement("style");e.textContent=${JSON.stringify(minifiedCss)};document.head.appendChild(e)}catch(e){console.error("Construction Budget Widget: CSS Injection failed", e)}})();`;
            
            // Prepend to the bundle code
            chunk.code = injectCode + chunk.code;
            break; // Only inject into the entry point
          }
        }
      }
    }
  };
};

const isWidget = process.env.BUILD_TARGET === 'widget';

export default defineConfig({
  plugins: [
    react(),
    ...(isWidget ? [cssInjectedByJsPlugin()] : []),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
  server: {
    port: 5173,
    open: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Reads GEMINI_API_KEY from .env.local and exposes it as process.env.API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
  },
  build: isWidget
    ? {
        lib: {
          entry: resolve(__dirname, 'index.tsx'),
          name: 'ConstructionBudget',
          fileName: 'construction-budget-widget',
          formats: ['umd'],
        },
        rollupOptions: { external: [] },
        cssCodeSplit: false,
      }
    : {
        outDir: 'dist',
        sourcemap: true,
      },
});