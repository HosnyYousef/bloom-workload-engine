import * as Sentry from '@sentry/react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Sentry is only active when VITE_SENTRY_DSN is set in the environment.
// In local dev without a DSN it is a no-op — no console noise, no network calls.
// To enable: add VITE_SENTRY_DSN=<your-dsn> to a .env.local file.
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Capture 100% of transactions in dev; lower this in production (e.g. 0.1)
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  // Replay 10% of sessions normally, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
  // Disable entirely if no DSN is configured (local dev without Sentry account)
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
