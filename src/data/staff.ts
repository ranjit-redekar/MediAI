import type { StaffMember } from '../types/staff';
import { avatarFor } from '../utils/avatar';
import { doctors } from './doctors';

/**
 * Doctors come from the doctors table rather than being typed in again here, so
 * the staff directory and the Doctors page can never disagree about who a
 * doctor is or what they practise.
 */
function doctorStaff(): StaffMember[] {
  return doctors.map(d => ({
    id: `EMP-1${d.id.slice(1)}`,
    name: d.name,
    gender: d.gender,
    role: d.specialty,
    category: 'Doctors',
    department: d.department,
    status: d.status === 'Offline' ? 'Off Duty' : 'Active',
    shift: 'General',
    employmentType: 'Full-time',
    phone: d.phone,
    email: d.email,
    avatar: d.avatar,
    joinedDate: d.joinedDate ?? '',
    location: d.department,
  }));
}

// A representative cross-section of the positions found in a real hospital.
export const staffMembers: StaffMember[] = [
  ...doctorStaff(),

  // --- Nursing ---
  { id: 'EMP-2001', name: 'Linda Martinez', gender: 'Female', role: 'Nursing Superintendent', category: 'Nursing', department: 'Nursing Admin', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 202-2001', email: 'l.martinez@mediai.com', avatar: avatarFor('Linda Martinez', 'Female'), joinedDate: '2014-03-05', location: 'Block A' },
  { id: 'EMP-2002', name: 'Grace Okoro', gender: 'Female', role: 'Head Nurse', category: 'Nursing', department: 'ICU', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 202-2002', email: 'g.okoro@mediai.com', avatar: avatarFor('Grace Okoro', 'Female'), joinedDate: '2018-08-14', location: 'ICU' },
  { id: 'EMP-2003', name: 'Sofia Rossi', gender: 'Female', role: 'ICU Nurse', category: 'Nursing', department: 'ICU', status: 'Active', shift: 'Night', employmentType: 'Full-time', phone: '+1 (555) 202-2003', email: 's.rossi@mediai.com', avatar: avatarFor('Sofia Rossi', 'Female'), joinedDate: '2020-02-11', location: 'ICU' },
  { id: 'EMP-2004', name: 'Hannah Becker', gender: 'Female', role: 'ER Nurse', category: 'Nursing', department: 'Emergency', status: 'On Leave', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 202-2004', email: 'h.becker@mediai.com', avatar: avatarFor('Hannah Becker', 'Female'), joinedDate: '2021-05-09', location: 'ER' },
  { id: 'EMP-2005', name: 'Amara Singh', gender: 'Female', role: 'Midwife', category: 'Nursing', department: 'Maternity', status: 'Active', shift: 'Evening', employmentType: 'Full-time', phone: '+1 (555) 202-2005', email: 'a.singh@mediai.com', avatar: avatarFor('Amara Singh', 'Female'), joinedDate: '2019-10-01', location: 'Maternity Ward' },

  // --- Allied Health ---
  { id: 'EMP-3001', name: 'Daniel Cohen', gender: 'Male', role: 'Physiotherapist', category: 'Allied Health', department: 'Rehabilitation', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 203-3001', email: 'd.cohen@mediai.com', avatar: avatarFor('Daniel Cohen', 'Male'), joinedDate: '2020-07-20', location: 'Rehab Center' },
  { id: 'EMP-3002', name: 'Olivia Park', gender: 'Female', role: 'Radiographer', category: 'Allied Health', department: 'Radiology', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 203-3002', email: 'o.park@mediai.com', avatar: avatarFor('Olivia Park', 'Female'), joinedDate: '2019-12-02', location: 'Imaging' },
  { id: 'EMP-3003', name: 'Marcus Reed', gender: 'Male', role: 'Respiratory Therapist', category: 'Allied Health', department: 'Pulmonology', status: 'Off Duty', shift: 'Night', employmentType: 'Full-time', phone: '+1 (555) 203-3003', email: 'm.reed@mediai.com', avatar: avatarFor('Marcus Reed', 'Male'), joinedDate: '2021-03-15', location: 'Block B' },
  { id: 'EMP-3004', name: 'Emily Davis', gender: 'Female', role: 'Dietitian / Nutritionist', category: 'Allied Health', department: 'Nutrition', status: 'Active', shift: 'General', employmentType: 'Part-time', phone: '+1 (555) 203-3004', email: 'e.davis@mediai.com', avatar: avatarFor('Emily Davis', 'Female'), joinedDate: '2022-01-10', location: 'Block C' },
  { id: 'EMP-3005', name: 'Carlos Mendez', gender: 'Male', role: 'Paramedic / EMT', category: 'Allied Health', department: 'Emergency', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 203-3005', email: 'c.mendez@mediai.com', avatar: avatarFor('Carlos Mendez', 'Male'), joinedDate: '2020-09-28', location: 'Ambulance Bay' },

  // --- Pharmacy ---
  { id: 'EMP-4001', name: 'Nadia Hassan', gender: 'Female', role: 'Chief Pharmacist', category: 'Pharmacy', department: 'Pharmacy', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 204-4001', email: 'n.hassan@mediai.com', avatar: avatarFor('Nadia Hassan', 'Female'), joinedDate: '2016-05-19', location: 'Pharmacy' },
  { id: 'EMP-4002', name: 'Tom Schneider', gender: 'Male', role: 'Pharmacy Technician', category: 'Pharmacy', department: 'Pharmacy', status: 'Active', shift: 'Evening', employmentType: 'Full-time', phone: '+1 (555) 204-4002', email: 't.schneider@mediai.com', avatar: avatarFor('Tom Schneider', 'Male'), joinedDate: '2021-11-08', location: 'Pharmacy' },

  // --- Laboratory ---
  { id: 'EMP-5001', name: 'Dr. Wei Chen', role: 'Pathologist', category: 'Laboratory', department: 'Pathology', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 205-5001', email: 'w.chen@mediai.com', avatar: avatarFor('Dr. Wei Chen'), joinedDate: '2017-02-27', location: 'Lab' },
  { id: 'EMP-5002', name: 'Isabella Romano', gender: 'Female', role: 'Lab Technician', category: 'Laboratory', department: 'Pathology', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 205-5002', email: 'i.romano@mediai.com', avatar: avatarFor('Isabella Romano', 'Female'), joinedDate: '2020-04-06', location: 'Lab' },
  { id: 'EMP-5003', name: 'Kevin Brooks', gender: 'Male', role: 'Phlebotomist', category: 'Laboratory', department: 'Pathology', status: 'Off Duty', shift: 'Morning', employmentType: 'Part-time', phone: '+1 (555) 205-5003', email: 'k.brooks@mediai.com', avatar: avatarFor('Kevin Brooks', 'Male'), joinedDate: '2022-06-21', location: 'Sample Collection' },

  // --- Administration ---
  { id: 'EMP-6001', name: 'Patricia Gomez', gender: 'Female', role: 'Hospital Administrator', category: 'Administration', department: 'Administration', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 206-6001', email: 'p.gomez@mediai.com', avatar: avatarFor('Patricia Gomez', 'Female'), joinedDate: '2013-07-01', location: 'Admin Block' },
  { id: 'EMP-6002', name: 'Ryan Mitchell', gender: 'Male', role: 'Front Desk Receptionist', category: 'Administration', department: 'Front Office', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 206-6002', email: 'r.mitchell@mediai.com', avatar: avatarFor('Ryan Mitchell', 'Male'), joinedDate: '2021-08-23', location: 'Reception' },
  { id: 'EMP-6003', name: 'Chloe Bennett', gender: 'Female', role: 'Billing Executive', category: 'Administration', department: 'Finance', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 206-6003', email: 'c.bennett@mediai.com', avatar: avatarFor('Chloe Bennett', 'Female'), joinedDate: '2020-10-12', location: 'Admin Block' },
  { id: 'EMP-6004', name: 'David Okafor', gender: 'Male', role: 'HR Manager', category: 'Administration', department: 'Human Resources', status: 'On Leave', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 206-6004', email: 'd.okafor@mediai.com', avatar: avatarFor('David Okafor', 'Male'), joinedDate: '2018-04-17', location: 'Admin Block' },
  { id: 'EMP-6005', name: 'Sara Lindqvist', gender: 'Female', role: 'Medical Records Officer', category: 'Administration', department: 'Health Information', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 206-6005', email: 's.lindqvist@mediai.com', avatar: avatarFor('Sara Lindqvist', 'Female'), joinedDate: '2022-02-28', location: 'Records' },

  // --- Support Services ---
  { id: 'EMP-7001', name: 'Joseph Adeyemi', gender: 'Male', role: 'Housekeeping Supervisor', category: 'Support Services', department: 'Housekeeping', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 207-7001', email: 'j.adeyemi@mediai.com', avatar: avatarFor('Joseph Adeyemi', 'Male'), joinedDate: '2017-12-04', location: 'Facility' },
  { id: 'EMP-7002', name: 'Rosa Fernandez', gender: 'Female', role: 'Sanitation / Cleaning Staff', category: 'Support Services', department: 'Housekeeping', status: 'Active', shift: 'Rotating', employmentType: 'Contract', phone: '+1 (555) 207-7002', email: 'r.fernandez@mediai.com', avatar: avatarFor('Rosa Fernandez', 'Female'), joinedDate: '2023-01-16', location: 'All Wards' },
  { id: 'EMP-7003', name: 'Michael Brown', gender: 'Male', role: 'Ward Orderly', category: 'Support Services', department: 'Patient Support', status: 'Active', shift: 'Evening', employmentType: 'Full-time', phone: '+1 (555) 207-7003', email: 'm.brown@mediai.com', avatar: avatarFor('Michael Brown', 'Male'), joinedDate: '2021-09-30', location: 'Block A' },
  { id: 'EMP-7004', name: 'Anita Sharma', gender: 'Female', role: 'Catering Staff', category: 'Support Services', department: 'Dietary', status: 'Off Duty', shift: 'Morning', employmentType: 'Contract', phone: '+1 (555) 207-7004', email: 'a.sharma2@mediai.com', avatar: avatarFor('Anita Sharma', 'Female'), joinedDate: '2022-11-11', location: 'Kitchen' },
  { id: 'EMP-7005', name: 'Victor Petrov', gender: 'Male', role: 'Maintenance Technician', category: 'Support Services', department: 'Facilities', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 207-7005', email: 'v.petrov@mediai.com', avatar: avatarFor('Victor Petrov', 'Male'), joinedDate: '2019-03-19', location: 'Facility' },
  { id: 'EMP-7006', name: 'Samuel Eze', gender: 'Male', role: 'Ambulance Driver', category: 'Support Services', department: 'Emergency Transport', status: 'Active', shift: 'Night', employmentType: 'Full-time', phone: '+1 (555) 207-7006', email: 's.eze@mediai.com', avatar: avatarFor('Samuel Eze', 'Male'), joinedDate: '2020-12-07', location: 'Ambulance Bay' },

  // --- Security ---
  { id: 'EMP-8001', name: 'Frank Castle', gender: 'Male', role: 'Security Officer', category: 'Security', department: 'Security', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 208-8001', email: 'f.castle@mediai.com', avatar: avatarFor('Frank Castle', 'Male'), joinedDate: '2018-06-25', location: 'Main Gate' },
  { id: 'EMP-8002', name: 'George Mwangi', gender: 'Male', role: 'Security Guard', category: 'Security', department: 'Security', status: 'Active', shift: 'Night', employmentType: 'Contract', phone: '+1 (555) 208-8002', email: 'g.mwangi@mediai.com', avatar: avatarFor('George Mwangi', 'Male'), joinedDate: '2022-03-08', location: 'Block B' },

  // --- IT & Biomedical ---
  { id: 'EMP-9001', name: 'Aisha Rahman', gender: 'Female', role: 'IT Support Engineer', category: 'IT & Biomedical', department: 'Information Technology', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 209-9001', email: 'a.rahman@mediai.com', avatar: avatarFor('Aisha Rahman', 'Female'), joinedDate: '2021-01-25', location: 'IT Dept' },
  { id: 'EMP-9002', name: 'Lucas Müller', gender: 'Male', role: 'Biomedical Engineer', category: 'IT & Biomedical', department: 'Biomedical', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 209-9002', email: 'l.muller@mediai.com', avatar: avatarFor('Lucas Müller', 'Male'), joinedDate: '2020-05-13', location: 'Biomedical Lab' }
];
