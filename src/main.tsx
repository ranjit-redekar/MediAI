import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider, DEFAULT_THEME, THEMES } from './context/ThemeContext.tsx';
import { JourneyProvider } from './context/JourneyContext.tsx';
import { StaffProvider } from './context/StaffContext.tsx';
import { PatientsProvider } from './context/PatientsContext.tsx';
import { DoctorsProvider } from './context/DoctorsContext.tsx';
import { AppointmentsProvider } from './context/AppointmentsContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AIActionsProvider } from './context/AIActionsContext.tsx';
import { SessionProvider } from './context/SessionContext.tsx';

// Apply the saved theme before first paint to avoid a flash.
const stored = typeof window !== 'undefined' ? localStorage.getItem('mediai-theme') : null;
// A theme removed since it was saved (e.g. "midnight") falls back instead of flashing unstyled.
const savedTheme = stored && THEMES.some(t => t.id === stored) ? stored : DEFAULT_THEME;
document.documentElement.setAttribute('data-theme', savedTheme);
document.body.setAttribute('data-theme', savedTheme);
document.body.classList.toggle('is-light', savedTheme === 'light');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <SessionProvider>
          <AIActionsProvider>
          <PatientsProvider>
            <DoctorsProvider>
              <AppointmentsProvider>
                <JourneyProvider>
                  <StaffProvider>
                    <App />
                  </StaffProvider>
                </JourneyProvider>
              </AppointmentsProvider>
            </DoctorsProvider>
          </PatientsProvider>
          </AIActionsProvider>
        </SessionProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
);
