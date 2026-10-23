import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppClerkProvider } from './components/ClerkAuthSection.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppClerkProvider>
      <App />
    </AppClerkProvider>
  </StrictMode>
);
