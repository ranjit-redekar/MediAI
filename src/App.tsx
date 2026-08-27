import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { PortalLayout } from './components/layout/PortalLayout';
import { RouteFallback } from './components/ui/RouteFallback';

// Only the app shell loads eagerly; every page is code-split so the first paint
// stays small and the login screen never downloads the charting library.
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PatientList = lazy(() => import('./pages/Patients/PatientList').then(m => ({ default: m.PatientList })));
const PatientDetail = lazy(() => import('./pages/Patients/PatientDetail').then(m => ({ default: m.PatientDetail })));
const PatientFormPage = lazy(() => import('./pages/Patients/PatientFormPage').then(m => ({ default: m.PatientFormPage })));
const MedicalRecordFormPage = lazy(() => import('./pages/Patients/MedicalRecordFormPage').then(m => ({ default: m.MedicalRecordFormPage })));
const DoctorList = lazy(() => import('./pages/Doctors/DoctorList').then(m => ({ default: m.DoctorList })));
const DoctorDetail = lazy(() => import('./pages/Doctors/DoctorDetail').then(m => ({ default: m.DoctorDetail })));
const DoctorFormPage = lazy(() => import('./pages/Doctors/DoctorFormPage').then(m => ({ default: m.DoctorFormPage })));
const Appointments = lazy(() => import('./pages/Appointments').then(m => ({ default: m.Appointments })));
const AppointmentFormPage = lazy(() => import('./pages/AppointmentFormPage').then(m => ({ default: m.AppointmentFormPage })));
const PatientJourney = lazy(() => import('./pages/PatientJourney').then(m => ({ default: m.PatientJourney })));
const StaffManagement = lazy(() => import('./pages/StaffManagement').then(m => ({ default: m.StaffManagement })));
const StaffFormPage = lazy(() => import('./pages/StaffFormPage').then(m => ({ default: m.StaffFormPage })));
const Billing = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })));
const Pharmacy = lazy(() => import('./pages/Pharmacy').then(m => ({ default: m.Pharmacy })));
const Laboratory = lazy(() => import('./pages/Laboratory').then(m => ({ default: m.Laboratory })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const AIInsights = lazy(() => import('./pages/AIInsights').then(m => ({ default: m.AIInsights })));
const AIAgentDetail = lazy(() => import('./pages/AIAgentDetail').then(m => ({ default: m.AIAgentDetail })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const RoleDirectory = lazy(() => import('./pages/Roles/RoleDirectory').then(m => ({ default: m.RoleDirectory })));
const RoleDetail = lazy(() => import('./pages/Roles/RoleDetail').then(m => ({ default: m.RoleDetail })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const PortalHome = lazy(() => import('./pages/Portal/PortalHome').then(m => ({ default: m.PortalHome })));

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Patients get their own shell — never the admin chrome. */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalHome />} />
          </Route>

          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="patients/new" element={<PatientFormPage />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="patients/:id/edit" element={<PatientFormPage />} />
            <Route path="patients/:id/records/new" element={<MedicalRecordFormPage />} />
            <Route path="doctors" element={<DoctorList />} />
            <Route path="doctors/new" element={<DoctorFormPage />} />
            <Route path="doctors/:id" element={<DoctorDetail />} />
            <Route path="doctors/:id/edit" element={<DoctorFormPage />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/new" element={<AppointmentFormPage />} />
            <Route path="appointments/:id/edit" element={<AppointmentFormPage />} />
            <Route path="journey" element={<PatientJourney />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="staff/new" element={<StaffFormPage />} />
            <Route path="staff/:id/edit" element={<StaffFormPage />} />
            <Route path="billing" element={<Billing />} />
            <Route path="pharmacy" element={<Pharmacy />} />
            <Route path="laboratory" element={<Laboratory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="agents/:agentId" element={<AIAgentDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="roles" element={<RoleDirectory />} />
            <Route path="roles/:roleId" element={<RoleDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
