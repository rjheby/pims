
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './pages/dispatch/components/stops/ErrorBoundary'

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error("Error rendering application:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Application Error</h2>
        <p>Sorry, there was an error loading the application. Please try refreshing the page.</p>
        <pre style="text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px;">${error}</pre>
      </div>
    `;
  }
}
