import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { JourneyProvider } from './context/JourneyContext.tsx';
import { TourProvider } from './context/TourContext.tsx';
import { StaffProvider } from './context/StaffContext.tsx';
import { PatientsProvider } from './context/PatientsContext.tsx';
import { DoctorsProvider } from './context/DoctorsContext.tsx';
import { AppointmentsProvider } from './context/AppointmentsContext.tsx';

// Apply the saved theme before first paint to avoid a flash.
const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('mediai-theme')) || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.body.setAttribute('data-theme', savedTheme);
document.body.classList.toggle('is-light', savedTheme === 'light');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PatientsProvider>
        <DoctorsProvider>
          <AppointmentsProvider>
            <JourneyProvider>
              <StaffProvider>
                <TourProvider>
                  <App />
                </TourProvider>
              </StaffProvider>
            </JourneyProvider>
          </AppointmentsProvider>
        </DoctorsProvider>
      </PatientsProvider>
    </ThemeProvider>
  </StrictMode>
);
