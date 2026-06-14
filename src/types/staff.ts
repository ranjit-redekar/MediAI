// Hospital staff / HR directory types — lets the admin see and manage every
// position in the hospital, from doctors and nurses to housekeeping and security.

export type StaffCategory =
  | 'Doctors'
  | 'Nursing'
  | 'Allied Health'
  | 'Pharmacy'
  | 'Laboratory'
  | 'Administration'
  | 'Support Services'
  | 'Security'
  | 'IT & Biomedical';

export const STAFF_CATEGORIES: StaffCategory[] = [
  'Doctors',
  'Nursing',
  'Allied Health',
  'Pharmacy',
  'Laboratory',
  'Administration',
  'Support Services',
  'Security',
  'IT & Biomedical'
];

export type StaffStatus = 'Active' | 'On Leave' | 'Off Duty' | 'Inactive';
export const STAFF_STATUSES: StaffStatus[] = ['Active', 'On Leave', 'Off Duty', 'Inactive'];

export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'Rotating' | 'General';
export const SHIFT_TYPES: ShiftType[] = ['Morning', 'Evening', 'Night', 'Rotating', 'General'];

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract'];

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  category: StaffCategory;
  department: string;
  status: StaffStatus;
  shift: ShiftType;
  employmentType: EmploymentType;
  phone: string;
  email: string;
  avatar?: string;
  joinedDate: string;
  location?: string;
}

/** Common position titles per category — used to power the "Add Staff" form. */
export const ROLE_LIBRARY: Record<StaffCategory, string[]> = {
  Doctors: [
    'Chief Medical Officer', 'Consultant Physician', 'Surgeon', 'Cardiologist',
    'Pediatrician', 'Anesthesiologist', 'Orthopedic Surgeon', 'Radiologist',
    'Gynecologist', 'Resident Doctor', 'Emergency Physician'
  ],
  Nursing: [
    'Nursing Superintendent', 'Head Nurse', 'Staff Nurse', 'ICU Nurse',
    'ER Nurse', 'Operating Room Nurse', 'Midwife', 'Nursing Assistant'
  ],
  'Allied Health': [
    'Physiotherapist', 'Occupational Therapist', 'Respiratory Therapist',
    'Dietitian / Nutritionist', 'Radiographer', 'Speech Therapist', 'Paramedic / EMT'
  ],
  Pharmacy: ['Chief Pharmacist', 'Pharmacist', 'Pharmacy Technician'],
  Laboratory: ['Pathologist', 'Lab Technician', 'Phlebotomist', 'Microbiologist'],
  Administration: [
    'Hospital Administrator', 'Front Desk Receptionist', 'Admissions Officer',
    'Billing Executive', 'Medical Records Officer', 'HR Manager', 'Accountant'
  ],
  'Support Services': [
    'Housekeeping Supervisor', 'Sanitation / Cleaning Staff', 'Ward Orderly',
    'Catering Staff', 'Laundry Staff', 'Maintenance Technician', 'Ambulance Driver', 'Porter'
  ],
  Security: ['Security Officer', 'Security Guard', 'Fire Safety Officer'],
  'IT & Biomedical': ['IT Support Engineer', 'Biomedical Engineer', 'Systems Administrator']
};
