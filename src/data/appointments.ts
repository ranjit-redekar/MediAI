import type { Appointment } from '../types';

export const appointments: Appointment[] = [
  // ── D001 Dr. James Wilson (Internal Medicine) ──────────────────────────────
  {
    id: 'A001', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-06', time: '09:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Follow-up for seasonal allergies'
  },
  {
    id: 'A009', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-05', time: '14:30', status: 'Completed', type: 'In-Person',
    notes: 'Annual physical exam — all clear'
  },
  {
    id: 'A011', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-02-28', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Stress & anxiety consultation'
  },
  {
    id: 'A012', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-02-15', time: '11:00', status: 'Completed', type: 'Video',
    notes: 'General wellness check'
  },
  {
    id: 'A013', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-01-22', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'New patient comprehensive physical'
  },
  {
    id: 'A014', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-01-10', time: '16:00', status: 'Cancelled', type: 'In-Person',
    notes: 'Patient rescheduled'
  },

  // ── D002 Dr. Maria Garcia (Endocrinology) ──────────────────────────────────
  {
    id: 'A005', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-06', time: '15:30', status: 'Scheduled', type: 'Video',
    notes: 'Diabetes management consultation'
  },
  {
    id: 'A007', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-07', time: '10:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Lipid panel review & statin adjustment'
  },
  {
    id: 'A015', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-02-25', time: '14:00', status: 'Completed', type: 'In-Person',
    notes: 'HbA1c follow-up — improved to 7.8%'
  },
  {
    id: 'A016', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-02-10', time: '11:00', status: 'Completed', type: 'In-Person',
    notes: 'Cholesterol and metabolic syndrome review'
  },
  {
    id: 'A017', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-01-18', time: '09:30', status: 'Completed', type: 'In-Person',
    notes: 'Initial hyperlipidemia treatment plan'
  },
  {
    id: 'A018', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2025-11-30', time: '15:00', status: 'No-Show', type: 'Video',
    notes: 'Missed — rescheduled for December'
  },

  // ── D003 Dr. Robert Taylor (Cardiology) ────────────────────────────────────
  {
    id: 'A002', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-03-06', time: '10:00', status: 'Scheduled', type: 'In-Person',
    notes: 'BP check and medication review'
  },
  {
    id: 'A004', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-03-06', time: '14:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Urgent: AFib follow-up — INR check'
  },
  {
    id: 'A010', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-03-04', time: '16:00', status: 'No-Show', type: 'In-Person',
    notes: 'Reschedule required'
  },
  {
    id: 'A019', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-03-02', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'New onset AFib — started anticoagulation'
  },
  {
    id: 'A020', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-02-15', time: '10:30', status: 'Completed', type: 'In-Person',
    notes: 'Post-stress test follow-up'
  },
  {
    id: 'A021', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-01-25', time: '13:00', status: 'Completed', type: 'Video',
    notes: 'Blood pressure trending down — good progress'
  },

  // ── D004 Dr. Lisa Anderson (Orthopedics) ───────────────────────────────────
  {
    id: 'A006', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-03-07', time: '09:00', status: 'Scheduled', type: 'In-Person',
    notes: 'MRI result review — L4-L5 disc herniation'
  },
  {
    id: 'A022', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-03-04', time: '11:00', status: 'Completed', type: 'In-Person',
    notes: 'Acute lumbar strain — MRI ordered'
  },
  {
    id: 'A023', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-02-20', time: '14:00', status: 'Completed', type: 'In-Person',
    notes: 'Hip joint pain assessment'
  },
  {
    id: 'A024', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-01-30', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Sleep apnea — OSA diagnosed, CPAP started'
  },
  {
    id: 'A025', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-01-05', time: '09:30', status: 'Cancelled', type: 'In-Person',
    notes: 'Patient cancelled same day'
  },

  // ── D005 Dr. Sarah Patel (OB/GYN) ─────────────────────────────────────────
  {
    id: 'A003', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-03-06', time: '11:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Prenatal check — 22 weeks'
  },
  {
    id: 'A026', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-03-03', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Second trimester anatomy scan'
  },
  {
    id: 'A027', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-02-18', time: '13:00', status: 'Completed', type: 'In-Person',
    notes: 'Annual gynecological exam'
  },
  {
    id: 'A028', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-01-15', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'First trimester nuchal translucency scan'
  },
  {
    id: 'A029', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2025-12-10', time: '11:30', status: 'Completed', type: 'Video',
    notes: 'Pre-conception counseling visit'
  },

  // ── D008 Dr. David Kim (Dermatology) ───────────────────────────────────────
  {
    id: 'A008', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-03-05', time: '11:00', status: 'Completed', type: 'In-Person',
    notes: 'Skin rash examination — contact dermatitis'
  },
  {
    id: 'A030', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-02-22', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Mole mapping and skin cancer screening'
  },
  {
    id: 'A031', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-02-08', time: '14:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Psoriasis follow-up'
  },

  // ── D006 Dr. Jennifer White (Neurology) ───────────────────────────────────
  {
    id: 'A032', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-03-08', time: '09:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Migraine management — new preventive therapy'
  },
  {
    id: 'A033', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-03-08', time: '11:00', status: 'Scheduled', type: 'Video',
    notes: 'Follow-up on tension headaches'
  },
  {
    id: 'A034', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-03-09', time: '10:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Sleep study results review'
  },
  {
    id: 'A035', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-02-28', time: '14:00', status: 'Completed', type: 'In-Person',
    notes: 'MRI brain — normal study'
  },
  {
    id: 'A036', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-02-05', time: '09:30', status: 'Completed', type: 'In-Person',
    notes: 'Initial consultation for chronic headaches'
  },
  {
    id: 'A037', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-01-20', time: '15:00', status: 'Cancelled', type: 'In-Person',
    notes: 'Patient requested reschedule'
  },

  // ── D007 Dr. Michael Brown (Pediatrics) ───────────────────────────────────
  {
    id: 'A038', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D007', doctorName: 'Dr. Michael Brown', specialty: 'Pediatrics',
    date: '2026-03-10', time: '09:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Well-child visit — 12 month checkup'
  },
  {
    id: 'A039', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D007', doctorName: 'Dr. Michael Brown', specialty: 'Pediatrics',
    date: '2026-03-10', time: '10:30', status: 'Scheduled', type: 'Phone',
    notes: 'Postpartum depression screening'
  },
  {
    id: 'A040', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D007', doctorName: 'Dr. Michael Brown', specialty: 'Pediatrics',
    date: '2026-03-11', time: '14:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Vaccination schedule review'
  },
  {
    id: 'A041', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D007', doctorName: 'Dr. Michael Brown', specialty: 'Pediatrics',
    date: '2026-02-15', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: '9-month developmental assessment'
  },
  {
    id: 'A042', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D007', doctorName: 'Dr. Michael Brown', specialty: 'Pediatrics',
    date: '2026-01-12', time: '11:00', status: 'Completed', type: 'Video',
    notes: 'Pediatric consultation for nephew'
  },

  // ── Additional March 2024 Appointments (Current Month) ────────────────────
  {
    id: 'A043', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-08', time: '10:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Blood work review'
  },
  {
    id: 'A044', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-08', time: '14:30', status: 'Scheduled', type: 'Video',
    notes: 'Gestational diabetes screening'
  },
  {
    id: 'A045', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-03-09', time: '09:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Echocardiogram follow-up'
  },
  {
    id: 'A046', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-09', time: '16:00', status: 'Scheduled', type: 'Phone',
    notes: 'Medication refill discussion'
  },
  {
    id: 'A047', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-03-11', time: '09:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Eczema flare-up assessment'
  },
  {
    id: 'A048', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-03-11', time: '11:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Shoulder pain evaluation'
  },
  {
    id: 'A049', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-12', time: '10:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Annual physical'
  },
  {
    id: 'A050', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-12', time: '13:30', status: 'Scheduled', type: 'Video',
    notes: 'Thyroid function test review'
  },
  {
    id: 'A051', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-03-13', time: '09:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Prenatal visit — 24 weeks'
  },
  {
    id: 'A052', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-13', time: '11:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Fatigue workup'
  },
  {
    id: 'A053', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-03-14', time: '10:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Acne treatment follow-up'
  },
  {
    id: 'A054', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-03-14', time: '14:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Hypertension check'
  },
  {
    id: 'A055', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-15', time: '09:00', status: 'Scheduled', type: 'Video',
    notes: 'Lab results discussion'
  },
  {
    id: 'A056', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-15', time: '15:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Diabetes education session'
  },
  {
    id: 'A057', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-03-18', time: '10:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Knee injection procedure'
  },
  {
    id: 'A058', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-18', time: '11:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Diabetes follow-up'
  },
  {
    id: 'A059', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-03-19', time: '09:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Annual skin check'
  },
  {
    id: 'A060', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-03-19', time: '14:00', status: 'Scheduled', type: 'Video',
    notes: 'Palpitations evaluation'
  },
  {
    id: 'A061', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-03-20', time: '10:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Routine prenatal visit'
  },
  {
    id: 'A062', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-03-20', time: '13:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Botox for migraines'
  },
  {
    id: 'A063', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-03-21', time: '09:30', status: 'Scheduled', type: 'In-Person',
    notes: 'Wrist pain assessment'
  },
  {
    id: 'A064', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-21', time: '11:00', status: 'Scheduled', type: 'Phone',
    notes: 'Prescription renewal'
  },
  {
    id: 'A065', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-22', time: '10:00', status: 'Scheduled', type: 'In-Person',
    notes: 'Weight management consultation'
  },
  {
    id: 'A066', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-03-22', time: '14:30', status: 'Scheduled', type: 'Video',
    notes: 'Fertility consultation'
  },

  // ── Additional Historical Data (2023) ─────────────────────────────────────
  {
    id: 'A067', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2025-10-15', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'Annual physical — baseline labs'
  },
  {
    id: 'A068', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2025-09-20', time: '10:30', status: 'Completed', type: 'In-Person',
    notes: 'Initial hypertension diagnosis'
  },
  {
    id: 'A069', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2025-08-12', time: '11:00', status: 'Completed', type: 'In-Person',
    notes: 'Initial pregnancy confirmation'
  },
  {
    id: 'A070', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2025-07-05', time: '14:00', status: 'Completed', type: 'In-Person',
    notes: 'Pre-operative clearance'
  },
  {
    id: 'A071', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2025-06-18', time: '09:30', status: 'Completed', type: 'In-Person',
    notes: 'Initial Type 2 diabetes diagnosis'
  },
  {
    id: 'A072', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2025-05-22', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Anxiety disorder initial evaluation'
  },
  {
    id: 'A073', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2025-04-10', time: '11:30', status: 'Completed', type: 'In-Person',
    notes: 'First dermatology visit'
  },
  {
    id: 'A074', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D007', doctorName: 'Dr. Michael Brown', specialty: 'Pediatrics',
    date: '2025-03-15', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'Newborn first checkup'
  },
  {
    id: 'A075', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2025-02-28', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Annual well-woman exam'
  },
  {
    id: 'A076', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2025-01-15', time: '14:30', status: 'Completed', type: 'In-Person',
    notes: 'Flu symptoms evaluation'
  },

  // ── More Recent Appointments (Late 2023 - Early 2024) ─────────────────────
  {
    id: 'A077', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2025-12-05', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'Quarterly diabetes check'
  },
  {
    id: 'A078', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2025-12-12', time: '11:00', status: 'Completed', type: 'In-Person',
    notes: 'Post-surgical follow-up'
  },
  {
    id: 'A079', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2025-12-18', time: '10:30', status: 'No-Show', type: 'In-Person',
    notes: 'Missed appointment'
  },
  {
    id: 'A080', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2025-12-22', time: '14:00', status: 'Completed', type: 'In-Person',
    notes: 'Pap smear and HPV screening'
  },
  {
    id: 'A081', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-01-08', time: '09:30', status: 'Completed', type: 'In-Person',
    notes: 'Cardiac stress test'
  },
  {
    id: 'A082', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-01-15', time: '11:00', status: 'Completed', type: 'Video',
    notes: 'Thyroid medication adjustment'
  },
  {
    id: 'A083', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-01-25', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Mole removal follow-up'
  },
  {
    id: 'A084', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D005', doctorName: 'Dr. Sarah Patel', specialty: 'OB/GYN',
    date: '2026-02-01', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'First trimester screening'
  },
  {
    id: 'A085', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D004', doctorName: 'Dr. Lisa Anderson', specialty: 'Orthopedics',
    date: '2026-02-08', time: '14:30', status: 'Cancelled', type: 'In-Person',
    notes: 'Patient called to reschedule'
  },
  {
    id: 'A086', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-02-14', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Valentine\'s Day physical — all clear'
  },
  {
    id: 'A087', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-02-20', time: '11:30', status: 'Completed', type: 'In-Person',
    notes: 'Holter monitor results'
  },
  {
    id: 'A088', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D006', doctorName: 'Dr. Jennifer White', specialty: 'Neurology',
    date: '2026-02-22', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'Sleep study ordered'
  },
  {
    id: 'A089', patientId: 'P005', patientName: 'Jennifer Lee',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-02-26', time: '15:00', status: 'Completed', type: 'Phone',
    notes: 'Medication side effects discussion'
  },
  {
    id: 'A090', patientId: 'P008', patientName: 'Christopher Brown',
    doctorId: 'D003', doctorName: 'Dr. Robert Taylor', specialty: 'Cardiology',
    date: '2026-02-29', time: '10:00', status: 'Completed', type: 'In-Person',
    notes: 'Blood pressure check'
  },
  {
    id: 'A091', patientId: 'P001', patientName: 'Sarah Johnson',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-01', time: '11:00', status: 'Completed', type: 'In-Person',
    notes: 'Thyroid panel — TSH slightly elevated'
  },
  {
    id: 'A092', patientId: 'P003', patientName: 'Emily Rodriguez',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-03-02', time: '09:30', status: 'Completed', type: 'In-Person',
    notes: 'Pregnancy-safe skincare consultation'
  },
  {
    id: 'A093', patientId: 'P006', patientName: 'David Martinez',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-03', time: '14:00', status: 'Completed', type: 'Video',
    notes: 'Mental health check-in'
  },
  {
    id: 'A094', patientId: 'P007', patientName: 'Amanda Thompson',
    doctorId: 'D002', doctorName: 'Dr. Maria Garcia', specialty: 'Endocrinology',
    date: '2026-03-04', time: '10:30', status: 'Completed', type: 'In-Person',
    notes: 'PCOS management discussion'
  },
  {
    id: 'A095', patientId: 'P002', patientName: 'Michael Chen',
    doctorId: 'D008', doctorName: 'Dr. David Kim', specialty: 'Dermatology',
    date: '2026-03-05', time: '09:00', status: 'Completed', type: 'In-Person',
    notes: 'Eczema treatment plan'
  },
  {
    id: 'A096', patientId: 'P004', patientName: 'Robert Williams',
    doctorId: 'D001', doctorName: 'Dr. James Wilson', specialty: 'Internal Medicine',
    date: '2026-03-07', time: '11:00', status: 'Completed', type: 'In-Person',
    notes: 'Post-flu recovery check'
  },
];
