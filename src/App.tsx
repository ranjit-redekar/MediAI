import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PatientList } from './pages/Patients/PatientList';
import { PatientDetail } from './pages/Patients/PatientDetail';
import { PatientFormPage } from './pages/Patients/PatientFormPage';
import { MedicalRecordFormPage } from './pages/Patients/MedicalRecordFormPage';
import { DoctorList } from './pages/Doctors/DoctorList';
import { DoctorDetail } from './pages/Doctors/DoctorDetail';
import { DoctorFormPage } from './pages/Doctors/DoctorFormPage';
import { Appointments } from './pages/Appointments';
import { AppointmentFormPage } from './pages/AppointmentFormPage';
import { PatientJourney } from './pages/PatientJourney';
import { StaffManagement } from './pages/StaffManagement';
import { StaffFormPage } from './pages/StaffFormPage';
import { Billing } from './pages/Billing';
import { Pharmacy } from './pages/Pharmacy';
import { Laboratory } from './pages/Laboratory';
import { Reports } from './pages/Reports';
import { AIInsights } from './pages/AIInsights';
import { AIAgentDetail } from './pages/AIAgentDetail';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { RoleDirectory } from './pages/Roles/RoleDirectory';
import { RoleDetail } from './pages/Roles/RoleDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
