import type { StaffMember } from '../types/staff';

const avatar = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;

// A representative cross-section of the positions found in a real hospital.
export const staffMembers: StaffMember[] = [
  // --- Doctors ---
  { id: 'EMP-1001', name: 'Dr. James Wilson', role: 'Chief Medical Officer', category: 'Doctors', department: 'Internal Medicine', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 201-1001', email: 'j.wilson@mediai.com', avatar: avatar('emp1001'), joinedDate: '2015-04-12', location: 'Block A' },
  { id: 'EMP-1002', name: 'Dr. Maria Garcia', role: 'Cardiologist', category: 'Doctors', department: 'Cardiology', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 201-1002', email: 'm.garcia@mediai.com', avatar: avatar('emp1002'), joinedDate: '2017-09-03', location: 'Block B' },
  { id: 'EMP-1003', name: 'Dr. Robert Taylor', role: 'Orthopedic Surgeon', category: 'Doctors', department: 'Orthopedics', status: 'On Leave', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 201-1003', email: 'r.taylor@mediai.com', avatar: avatar('emp1003'), joinedDate: '2018-01-22', location: 'OT Wing' },
  { id: 'EMP-1004', name: 'Dr. Priya Nair', role: 'Pediatrician', category: 'Doctors', department: 'Pediatrics', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 201-1004', email: 'p.nair@mediai.com', avatar: avatar('emp1004'), joinedDate: '2019-06-18', location: 'Block C' },
  { id: 'EMP-1005', name: 'Dr. Ahmed Khan', role: 'Anesthesiologist', category: 'Doctors', department: 'Anesthesiology', status: 'Off Duty', shift: 'Night', employmentType: 'Full-time', phone: '+1 (555) 201-1005', email: 'a.khan@mediai.com', avatar: avatar('emp1005'), joinedDate: '2016-11-30', location: 'OT Wing' },

  // --- Nursing ---
  { id: 'EMP-2001', name: 'Linda Martinez', role: 'Nursing Superintendent', category: 'Nursing', department: 'Nursing Admin', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 202-2001', email: 'l.martinez@mediai.com', avatar: avatar('emp2001'), joinedDate: '2014-03-05', location: 'Block A' },
  { id: 'EMP-2002', name: 'Grace Okoro', role: 'Head Nurse', category: 'Nursing', department: 'ICU', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 202-2002', email: 'g.okoro@mediai.com', avatar: avatar('emp2002'), joinedDate: '2018-08-14', location: 'ICU' },
  { id: 'EMP-2003', name: 'Sofia Rossi', role: 'ICU Nurse', category: 'Nursing', department: 'ICU', status: 'Active', shift: 'Night', employmentType: 'Full-time', phone: '+1 (555) 202-2003', email: 's.rossi@mediai.com', avatar: avatar('emp2003'), joinedDate: '2020-02-11', location: 'ICU' },
  { id: 'EMP-2004', name: 'Hannah Becker', role: 'ER Nurse', category: 'Nursing', department: 'Emergency', status: 'On Leave', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 202-2004', email: 'h.becker@mediai.com', avatar: avatar('emp2004'), joinedDate: '2021-05-09', location: 'ER' },
  { id: 'EMP-2005', name: 'Amara Singh', role: 'Midwife', category: 'Nursing', department: 'Maternity', status: 'Active', shift: 'Evening', employmentType: 'Full-time', phone: '+1 (555) 202-2005', email: 'a.singh@mediai.com', avatar: avatar('emp2005'), joinedDate: '2019-10-01', location: 'Maternity Ward' },

  // --- Allied Health ---
  { id: 'EMP-3001', name: 'Daniel Cohen', role: 'Physiotherapist', category: 'Allied Health', department: 'Rehabilitation', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 203-3001', email: 'd.cohen@mediai.com', avatar: avatar('emp3001'), joinedDate: '2020-07-20', location: 'Rehab Center' },
  { id: 'EMP-3002', name: 'Olivia Park', role: 'Radiographer', category: 'Allied Health', department: 'Radiology', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 203-3002', email: 'o.park@mediai.com', avatar: avatar('emp3002'), joinedDate: '2019-12-02', location: 'Imaging' },
  { id: 'EMP-3003', name: 'Marcus Reed', role: 'Respiratory Therapist', category: 'Allied Health', department: 'Pulmonology', status: 'Off Duty', shift: 'Night', employmentType: 'Full-time', phone: '+1 (555) 203-3003', email: 'm.reed@mediai.com', avatar: avatar('emp3003'), joinedDate: '2021-03-15', location: 'Block B' },
  { id: 'EMP-3004', name: 'Emily Davis', role: 'Dietitian / Nutritionist', category: 'Allied Health', department: 'Nutrition', status: 'Active', shift: 'General', employmentType: 'Part-time', phone: '+1 (555) 203-3004', email: 'e.davis@mediai.com', avatar: avatar('emp3004'), joinedDate: '2022-01-10', location: 'Block C' },
  { id: 'EMP-3005', name: 'Carlos Mendez', role: 'Paramedic / EMT', category: 'Allied Health', department: 'Emergency', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 203-3005', email: 'c.mendez@mediai.com', avatar: avatar('emp3005'), joinedDate: '2020-09-28', location: 'Ambulance Bay' },

  // --- Pharmacy ---
  { id: 'EMP-4001', name: 'Nadia Hassan', role: 'Chief Pharmacist', category: 'Pharmacy', department: 'Pharmacy', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 204-4001', email: 'n.hassan@mediai.com', avatar: avatar('emp4001'), joinedDate: '2016-05-19', location: 'Pharmacy' },
  { id: 'EMP-4002', name: 'Tom Schneider', role: 'Pharmacy Technician', category: 'Pharmacy', department: 'Pharmacy', status: 'Active', shift: 'Evening', employmentType: 'Full-time', phone: '+1 (555) 204-4002', email: 't.schneider@mediai.com', avatar: avatar('emp4002'), joinedDate: '2021-11-08', location: 'Pharmacy' },

  // --- Laboratory ---
  { id: 'EMP-5001', name: 'Dr. Wei Chen', role: 'Pathologist', category: 'Laboratory', department: 'Pathology', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 205-5001', email: 'w.chen@mediai.com', avatar: avatar('emp5001'), joinedDate: '2017-02-27', location: 'Lab' },
  { id: 'EMP-5002', name: 'Isabella Romano', role: 'Lab Technician', category: 'Laboratory', department: 'Pathology', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 205-5002', email: 'i.romano@mediai.com', avatar: avatar('emp5002'), joinedDate: '2020-04-06', location: 'Lab' },
  { id: 'EMP-5003', name: 'Kevin Brooks', role: 'Phlebotomist', category: 'Laboratory', department: 'Pathology', status: 'Off Duty', shift: 'Morning', employmentType: 'Part-time', phone: '+1 (555) 205-5003', email: 'k.brooks@mediai.com', avatar: avatar('emp5003'), joinedDate: '2022-06-21', location: 'Sample Collection' },

  // --- Administration ---
  { id: 'EMP-6001', name: 'Patricia Gomez', role: 'Hospital Administrator', category: 'Administration', department: 'Administration', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 206-6001', email: 'p.gomez@mediai.com', avatar: avatar('emp6001'), joinedDate: '2013-07-01', location: 'Admin Block' },
  { id: 'EMP-6002', name: 'Ryan Mitchell', role: 'Front Desk Receptionist', category: 'Administration', department: 'Front Office', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 206-6002', email: 'r.mitchell@mediai.com', avatar: avatar('emp6002'), joinedDate: '2021-08-23', location: 'Reception' },
  { id: 'EMP-6003', name: 'Chloe Bennett', role: 'Billing Executive', category: 'Administration', department: 'Finance', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 206-6003', email: 'c.bennett@mediai.com', avatar: avatar('emp6003'), joinedDate: '2020-10-12', location: 'Admin Block' },
  { id: 'EMP-6004', name: 'David Okafor', role: 'HR Manager', category: 'Administration', department: 'Human Resources', status: 'On Leave', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 206-6004', email: 'd.okafor@mediai.com', avatar: avatar('emp6004'), joinedDate: '2018-04-17', location: 'Admin Block' },
  { id: 'EMP-6005', name: 'Sara Lindqvist', role: 'Medical Records Officer', category: 'Administration', department: 'Health Information', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 206-6005', email: 's.lindqvist@mediai.com', avatar: avatar('emp6005'), joinedDate: '2022-02-28', location: 'Records' },

  // --- Support Services ---
  { id: 'EMP-7001', name: 'Joseph Adeyemi', role: 'Housekeeping Supervisor', category: 'Support Services', department: 'Housekeeping', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 207-7001', email: 'j.adeyemi@mediai.com', avatar: avatar('emp7001'), joinedDate: '2017-12-04', location: 'Facility' },
  { id: 'EMP-7002', name: 'Rosa Fernandez', role: 'Sanitation / Cleaning Staff', category: 'Support Services', department: 'Housekeeping', status: 'Active', shift: 'Rotating', employmentType: 'Contract', phone: '+1 (555) 207-7002', email: 'r.fernandez@mediai.com', avatar: avatar('emp7002'), joinedDate: '2023-01-16', location: 'All Wards' },
  { id: 'EMP-7003', name: 'Michael Brown', role: 'Ward Orderly', category: 'Support Services', department: 'Patient Support', status: 'Active', shift: 'Evening', employmentType: 'Full-time', phone: '+1 (555) 207-7003', email: 'm.brown@mediai.com', avatar: avatar('emp7003'), joinedDate: '2021-09-30', location: 'Block A' },
  { id: 'EMP-7004', name: 'Anita Sharma', role: 'Catering Staff', category: 'Support Services', department: 'Dietary', status: 'Off Duty', shift: 'Morning', employmentType: 'Contract', phone: '+1 (555) 207-7004', email: 'a.sharma2@mediai.com', avatar: avatar('emp7004'), joinedDate: '2022-11-11', location: 'Kitchen' },
  { id: 'EMP-7005', name: 'Victor Petrov', role: 'Maintenance Technician', category: 'Support Services', department: 'Facilities', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 207-7005', email: 'v.petrov@mediai.com', avatar: avatar('emp7005'), joinedDate: '2019-03-19', location: 'Facility' },
  { id: 'EMP-7006', name: 'Samuel Eze', role: 'Ambulance Driver', category: 'Support Services', department: 'Emergency Transport', status: 'Active', shift: 'Night', employmentType: 'Full-time', phone: '+1 (555) 207-7006', email: 's.eze@mediai.com', avatar: avatar('emp7006'), joinedDate: '2020-12-07', location: 'Ambulance Bay' },

  // --- Security ---
  { id: 'EMP-8001', name: 'Frank Castle', role: 'Security Officer', category: 'Security', department: 'Security', status: 'Active', shift: 'Rotating', employmentType: 'Full-time', phone: '+1 (555) 208-8001', email: 'f.castle@mediai.com', avatar: avatar('emp8001'), joinedDate: '2018-06-25', location: 'Main Gate' },
  { id: 'EMP-8002', name: 'George Mwangi', role: 'Security Guard', category: 'Security', department: 'Security', status: 'Active', shift: 'Night', employmentType: 'Contract', phone: '+1 (555) 208-8002', email: 'g.mwangi@mediai.com', avatar: avatar('emp8002'), joinedDate: '2022-03-08', location: 'Block B' },

  // --- IT & Biomedical ---
  { id: 'EMP-9001', name: 'Aisha Rahman', role: 'IT Support Engineer', category: 'IT & Biomedical', department: 'Information Technology', status: 'Active', shift: 'General', employmentType: 'Full-time', phone: '+1 (555) 209-9001', email: 'a.rahman@mediai.com', avatar: avatar('emp9001'), joinedDate: '2021-01-25', location: 'IT Dept' },
  { id: 'EMP-9002', name: 'Lucas Müller', role: 'Biomedical Engineer', category: 'IT & Biomedical', department: 'Biomedical', status: 'Active', shift: 'Morning', employmentType: 'Full-time', phone: '+1 (555) 209-9002', email: 'l.muller@mediai.com', avatar: avatar('emp9002'), joinedDate: '2020-05-13', location: 'Biomedical Lab' }
];
