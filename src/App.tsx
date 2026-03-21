import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PatientList } from './pages/Patients/PatientList';
import { PatientDetail } from './pages/Patients/PatientDetail';
import { DoctorList } from './pages/Doctors/DoctorList';
import { DoctorDetail } from './pages/Doctors/DoctorDetail';
import { Appointments } from './pages/Appointments';
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
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="appointments" element={<Appointments />} />
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
