export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: string;
  lastVisit: string;
  status: 'Active' | 'Inactive' | 'Critical';
  avatar?: string;
  medicalHistory?: MedicalRecord[];
  aiRiskScore?: number;
  aiRecommendations?: string[];
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  medications: string[];
  doctorId: string;
  notes: string;
  visitType?: 'Emergency' | 'Routine' | 'Follow-up' | 'Specialist' | 'Surgery' | 'Preventive';
  vitals?: VitalSigns;
  labResults?: LabResultItem[];
  followUpDate?: string;
  attachments?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  phone: string;
  email: string;
  schedule: Schedule[];
  status: 'Available' | 'Busy' | 'Offline';
  rating: number;
  patientsCount: number;
  avatar?: string;
  department: string;
  bio?: string;
  achievements?: string[];
  languages?: string[];
  consultationFee?: number;
  totalAppointments?: number;
  completionRate?: number;
  joinedDate?: string;
}

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
  type: 'In-Person' | 'Video' | 'Phone';
  notes?: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod?: string;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  unitPrice: number;
  expiryDate: string;
  manufacturer: string;
  description: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  category: string;
  orderedDate: string;
  completedDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  results?: TestResult[];
  doctorId: string;
  doctorName: string;
}

export interface TestResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
}

export interface AIInsight {
  id: string;
  patientId: string;
  type: 'Risk Assessment' | 'Diagnosis Support' | 'Treatment Recommendation' | 'Anomaly Detection';
  confidence: number;
  description: string;
  recommendations: string[];
  createdAt: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingBills: number;
  monthlyRevenue: number;
  patientGrowth: number;
  appointmentGrowth: number;
  revenueGrowth: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}
