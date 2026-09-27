import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { ScheduleActivity } from '../models/ScheduleActivity.js';
import { ProgressEvent } from '../models/ProgressEvent.js';
import { Document } from '../models/Document.js';
import { Match } from '../models/Match.js';
import { AuditLog } from '../models/AuditLog.js';
import { DelayRecord } from '../models/DelayRecord.js';
import { ProjectMemory } from '../models/ProjectMemory.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/progressbridge';

export async function seedDatabase() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB for seeding');
    }

    // Clear existing collections
    await User.deleteMany({});
    await Project.deleteMany({});
    await ScheduleActivity.deleteMany({});
    await ProgressEvent.deleteMany({});
    await Document.deleteMany({});
    await Match.deleteMany({});
    await AuditLog.deleteMany({});
    await DelayRecord.deleteMany({});
    await ProjectMemory.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Demo Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('progress123', salt);

    const users = await User.create([
      {
        name: 'Amitabh Sen (Admin)',
        email: 'admin@progressbridge.demo',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Project Management Office'
      },
      {
        name: 'Priyanka Sharma (Lead Planner)',
        email: 'planner@progressbridge.demo',
        password: hashedPassword,
        role: 'PLANNER',
        department: 'Planning & Scheduling'
      },
      {
        name: 'Ravi Kumar (Site Supervisor)',
        email: 'supervisor@progressbridge.demo',
        password: hashedPassword,
        role: 'SUPERVISOR',
        department: 'Site Execution (Piping & Mechanical)'
      },
      {
        name: 'Vikramjit Gogoi (Project Manager)',
        email: 'manager@progressbridge.demo',
        password: hashedPassword,
        role: 'PROJECT_MANAGER',
        department: 'Executive Operations'
      }
    ]);
    console.log(`Created ${users.length} demo users`);

    // 2. Demo Project
    const project = await Project.create({
      projectId: 'PRJ-OIL-2026',
      name: 'Integrated Infrastructure Construction Project (Hydrocarbon Processing Unit)',
      description: 'Expansion and modern piping, electrical and instrumentation integration for regional processing hub.',
      code: 'OIL-HPU-EXP',
      client: 'Oil India Limited (Synthetic Demo Context)',
      location: 'Duliajan Complex, Assam',
      startDate: '2026-08-01',
      plannedEndDate: '2026-12-31',
      status: 'ACTIVE',
      disciplines: ['Civil', 'Piping', 'Electrical', 'Instrumentation', 'Mechanical', 'HSE', 'Structural'],
      overallProgress: 68,
      plannedProgress: 72,
      variance: -4
    });

    // 3. Schedule Activities (35+ activities from L1 to L6)
    const scheduleData = [
      // L1 Project Level
      {
        activity_id: 'L1-PRJ-001',
        parent_id: null,
        wbs_level: 'L1',
        discipline: 'Mechanical',
        activity_code: 'WBS-1.0',
        activity_name: 'Hydrocarbon Processing Unit Construction',
        planned_start: '2026-08-01',
        planned_end: '2026-12-31',
        planned_duration: 153,
        status: 'IN_PROGRESS',
        progress_percentage: 68
      },
      // L2 Discipline WBS Nodes
      {
        activity_id: 'L2-CIV-001',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L2',
        discipline: 'Civil',
        activity_code: 'WBS-1.1',
        activity_name: 'Civil & Structural Works Package',
        planned_start: '2026-08-01',
        planned_end: '2026-10-30',
        planned_duration: 90,
        status: 'IN_PROGRESS',
        progress_percentage: 82
      },
      {
        activity_id: 'L2-PIP-001',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L2',
        discipline: 'Piping',
        activity_code: 'WBS-1.2',
        activity_name: 'Piping Fabrication & Erection Package',
        planned_start: '2026-08-15',
        planned_end: '2026-11-20',
        planned_duration: 97,
        status: 'IN_PROGRESS',
        progress_percentage: 65
      },
      {
        activity_id: 'L2-ELE-001',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L2',
        discipline: 'Electrical',
        activity_code: 'WBS-1.3',
        activity_name: 'Electrical Infrastructure & Distribution',
        planned_start: '2026-09-01',
        planned_end: '2026-12-05',
        planned_duration: 95,
        status: 'IN_PROGRESS',
        progress_percentage: 54
      },
      {
        activity_id: 'L2-INS-001',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L2',
        discipline: 'Instrumentation',
        activity_code: 'WBS-1.4',
        activity_name: 'Instrumentation & Automated Control Systems',
        planned_start: '2026-09-10',
        planned_end: '2026-12-15',
        planned_duration: 96,
        status: 'IN_PROGRESS',
        progress_percentage: 42
      },

      // L3 / L4 / L5 Packages
      {
        activity_id: 'L4-PIP-010',
        parent_id: 'L2-PIP-001',
        wbs_level: 'L4',
        discipline: 'Piping',
        activity_code: 'WBS-1.2.4',
        activity_name: 'Process Piping Header Unit 20',
        planned_start: '2026-09-05',
        planned_end: '2026-10-15',
        planned_duration: 40,
        status: 'IN_PROGRESS',
        progress_percentage: 60
      },

      // L6 Micro Executable Activities - Piping
      {
        activity_id: 'L6-PIP-024',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-E-024',
        activity_name: 'Erect Line 24-XX',
        unit_or_line: 'Line 24',
        planned_start: '2026-09-20',
        planned_end: '2026-09-24',
        planned_duration: 4,
        actual_start: null, // Ready for demo upload linking!
        actual_end: null,
        actual_duration: null,
        variance: 0,
        delay_days: 0,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },
      {
        activity_id: 'L6-PIP-025',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-W-025',
        activity_name: 'Fit-up and Field Butt Welding Line 24',
        unit_or_line: 'Line 24',
        planned_start: '2026-09-25',
        planned_end: '2026-09-28',
        planned_duration: 3,
        actual_start: null,
        actual_end: null,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },
      {
        activity_id: 'L6-PIP-026',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-NDT-026',
        activity_name: 'Radiographic Testing & NDT Line 24 Joints',
        unit_or_line: 'Line 24',
        planned_start: '2026-09-29',
        planned_end: '2026-09-30',
        planned_duration: 2,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },
      {
        activity_id: 'L6-PIP-018',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-E-018',
        activity_name: 'Erect Line 18-AB Crude Feed',
        unit_or_line: 'Line 18',
        planned_start: '2026-09-10',
        planned_end: '2026-09-14',
        planned_duration: 4,
        actual_start: '2026-09-12',
        actual_end: '2026-09-17',
        actual_duration: 5,
        variance: 2,
        delay_days: 2,
        status: 'DELAYED',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-PIP-019',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-HYD-019',
        activity_name: 'Hydrostatic Pressure Testing Line 18',
        unit_or_line: 'Line 18',
        planned_start: '2026-09-15',
        planned_end: '2026-09-17',
        planned_duration: 2,
        actual_start: '2026-09-18',
        actual_end: '2026-09-20',
        actual_duration: 2,
        variance: 3,
        delay_days: 3,
        status: 'DELAYED',
        progress_percentage: 100
      },

      // L6 Civil Activities
      {
        activity_id: 'L6-CIV-005',
        parent_id: 'L2-CIV-001',
        wbs_level: 'L6',
        discipline: 'Civil',
        activity_code: 'CIV-FND-005',
        activity_name: 'Foundation Concrete Pouring Pump Skid P-101',
        unit_or_line: 'Skid P-101',
        planned_start: '2026-08-10',
        planned_end: '2026-08-14',
        planned_duration: 4,
        actual_start: '2026-08-10',
        actual_end: '2026-08-13',
        actual_duration: 3,
        variance: -1,
        delay_days: 0,
        status: 'EARLY',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-CIV-006',
        parent_id: 'L2-CIV-001',
        wbs_level: 'L6',
        discipline: 'Civil',
        activity_code: 'CIV-FND-006',
        activity_name: 'Excavation & Rebar Binding Compressor C-201',
        unit_or_line: 'Compressor C-201',
        planned_start: '2026-08-15',
        planned_end: '2026-08-22',
        planned_duration: 7,
        actual_start: '2026-08-15',
        actual_end: '2026-08-26',
        actual_duration: 11,
        variance: 4,
        delay_days: 4,
        status: 'DELAYED',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-CIV-007',
        parent_id: 'L2-CIV-001',
        wbs_level: 'L6',
        discipline: 'Civil',
        activity_code: 'CIV-STR-007',
        activity_name: 'Pipe Rack Concrete Column Curing Bay 3',
        unit_or_line: 'Bay 3',
        planned_start: '2026-09-01',
        planned_end: '2026-09-08',
        planned_duration: 7,
        actual_start: '2026-09-01',
        actual_end: '2026-09-08',
        actual_duration: 7,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-CIV-008',
        parent_id: 'L2-CIV-001',
        wbs_level: 'L6',
        discipline: 'Civil',
        activity_code: 'CIV-TRN-008',
        activity_name: 'Underground Cable Trenching North Corridor',
        unit_or_line: 'North Corridor',
        planned_start: '2026-09-12',
        planned_end: '2026-09-18',
        planned_duration: 6,
        actual_start: '2026-09-14',
        actual_end: '2026-09-22',
        actual_duration: 8,
        variance: 3,
        delay_days: 3,
        status: 'DELAYED',
        progress_percentage: 100
      },

      // L6 Electrical Activities
      {
        activity_id: 'L6-ELE-012',
        parent_id: 'L2-ELE-001',
        wbs_level: 'L6',
        discipline: 'Electrical',
        activity_code: 'ELE-TRY-012',
        activity_name: 'Cable Tray Installation Substation 2',
        unit_or_line: 'Substation 2',
        planned_start: '2026-09-15',
        planned_end: '2026-09-22',
        planned_duration: 7,
        actual_start: '2026-09-16',
        actual_end: null,
        actual_duration: null,
        variance: 0,
        delay_days: 0,
        status: 'IN_PROGRESS',
        progress_percentage: 75
      },
      {
        activity_id: 'L6-ELE-014',
        parent_id: 'L2-ELE-001',
        wbs_level: 'L6',
        discipline: 'Electrical',
        activity_code: 'ELE-CBL-014',
        activity_name: 'HT Power Cable Pulling Feeder Bus 1',
        unit_or_line: 'Feeder Bus 1',
        planned_start: '2026-09-22',
        planned_end: '2026-09-26',
        planned_duration: 4,
        actual_start: null,
        actual_end: null,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },
      {
        activity_id: 'L6-ELE-015',
        parent_id: 'L2-ELE-001',
        wbs_level: 'L6',
        discipline: 'Electrical',
        activity_code: 'ELE-TRM-015',
        activity_name: 'Transformer T-101 Gland and Termination',
        unit_or_line: 'Transformer T-101',
        planned_start: '2026-09-27',
        planned_end: '2026-09-30',
        planned_duration: 3,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },

      // L6 Instrumentation Activities
      {
        activity_id: 'L6-INS-008',
        parent_id: 'L2-INS-001',
        wbs_level: 'L6',
        discipline: 'Instrumentation',
        activity_code: 'INS-TRN-008',
        activity_name: 'Pressure Transmitter PT-104 Calibration & Mounting',
        unit_or_line: 'Unit 20',
        planned_start: '2026-09-18',
        planned_end: '2026-09-21',
        planned_duration: 3,
        actual_start: '2026-09-18',
        actual_end: '2026-09-21',
        actual_duration: 3,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-INS-009',
        parent_id: 'L2-INS-001',
        wbs_level: 'L6',
        discipline: 'Instrumentation',
        activity_code: 'INS-TUB-009',
        activity_name: 'Impulse Tubing Installation Flow Orifice FE-204',
        unit_or_line: 'Line 24',
        planned_start: '2026-09-26',
        planned_end: '2026-09-28',
        planned_duration: 2,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },
      {
        activity_id: 'L6-INS-010',
        parent_id: 'L2-INS-001',
        wbs_level: 'L6',
        discipline: 'Instrumentation',
        activity_code: 'INS-CHK-010',
        activity_name: 'DCS Loop Checking for ESD Valve XV-105',
        unit_or_line: 'Substation 2',
        planned_start: '2026-09-28',
        planned_end: '2026-09-30',
        planned_duration: 2,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },

      // L6 Static & Rotating Equipment
      {
        activity_id: 'L6-EQP-001',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L6',
        discipline: 'Static Equipment',
        activity_code: 'EQP-ST-001',
        activity_name: 'Erection of Distillation Column V-101',
        unit_or_line: 'Column V-101',
        planned_start: '2026-08-20',
        planned_end: '2026-08-25',
        planned_duration: 5,
        actual_start: '2026-08-22',
        actual_end: '2026-08-29',
        actual_duration: 7,
        variance: 3,
        delay_days: 3,
        status: 'DELAYED',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-EQP-002',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L6',
        discipline: 'Rotating Equipment',
        activity_code: 'EQP-ROT-002',
        activity_name: 'Centrifugal Pump P-101A Cold Alignment',
        unit_or_line: 'Skid P-101',
        planned_start: '2026-09-02',
        planned_end: '2026-09-04',
        planned_duration: 2,
        actual_start: '2026-09-02',
        actual_end: '2026-09-04',
        actual_duration: 2,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },

      // HSE Activities
      {
        activity_id: 'L6-HSE-001',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L6',
        discipline: 'HSE',
        activity_code: 'HSE-SAF-001',
        activity_name: 'Pre-Hydrotest Safety Audit & Valve Tagging',
        unit_or_line: 'Plant-wide',
        planned_start: '2026-09-14',
        planned_end: '2026-09-15',
        planned_duration: 1,
        actual_start: '2026-09-14',
        actual_end: '2026-09-15',
        actual_duration: 1,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },

      // Additional L6 Activities for Production Scale (36 Total Activities)
      {
        activity_id: 'L6-PIP-030',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-TRQ-030',
        activity_name: 'Flange Joint Torque Tightening Line 24',
        unit_or_line: 'Line 24',
        planned_start: '2026-09-24',
        planned_end: '2026-09-25',
        planned_duration: 1,
        actual_start: '2026-09-24',
        actual_end: '2026-09-25',
        actual_duration: 1,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-PIP-031',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-NDT-031',
        activity_name: 'Radiographic Testing (RT/NDT) of Field Welds Line 24',
        unit_or_line: 'Line 24',
        planned_start: '2026-09-25',
        planned_end: '2026-09-27',
        planned_duration: 2,
        actual_start: '2026-09-26',
        actual_end: null,
        actual_duration: 3,
        variance: 5,
        delay_days: 5,
        status: 'DELAYED',
        progress_percentage: 40
      },
      {
        activity_id: 'L6-PIP-032',
        parent_id: 'L4-PIP-010',
        wbs_level: 'L6',
        discipline: 'Piping',
        activity_code: 'PIP-SUP-032',
        activity_name: 'Pipe Support Welding & Guide Installation Bay 4',
        unit_or_line: 'Bay 4',
        planned_start: '2026-09-20',
        planned_end: '2026-09-23',
        planned_duration: 3,
        actual_start: '2026-09-20',
        actual_end: '2026-09-23',
        actual_duration: 3,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-ELE-020',
        parent_id: 'L2-ELE-001',
        wbs_level: 'L6',
        discipline: 'Electrical',
        activity_code: 'ELE-GLD-020',
        activity_name: 'Cable Glanding & Megger Insulation Testing',
        unit_or_line: 'Substation 2',
        planned_start: '2026-09-24',
        planned_end: '2026-09-26',
        planned_duration: 2,
        actual_start: '2026-09-24',
        actual_end: '2026-09-26',
        actual_duration: 2,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-ELE-021',
        parent_id: 'L2-ELE-001',
        wbs_level: 'L6',
        discipline: 'Electrical',
        activity_code: 'ELE-SWG-021',
        activity_name: 'High-Voltage Switchgear Panel Cold Commissioning',
        unit_or_line: 'Switchgear Room',
        planned_start: '2026-09-18',
        planned_end: '2026-09-22',
        planned_duration: 4,
        actual_start: '2026-09-20',
        actual_end: '2026-09-26',
        actual_duration: 6,
        variance: 4,
        delay_days: 4,
        status: 'DELAYED',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-ELE-022',
        parent_id: 'L2-ELE-001',
        wbs_level: 'L6',
        discipline: 'Electrical',
        activity_code: 'ELE-LGT-022',
        activity_name: 'Plant Perimeter Lighting & Earthing Grid Continuity',
        unit_or_line: 'Perimeter',
        planned_start: '2026-09-22',
        planned_end: '2026-09-26',
        planned_duration: 4,
        actual_start: '2026-09-22',
        actual_end: '2026-09-25',
        actual_duration: 3,
        variance: -1,
        delay_days: 0,
        status: 'EARLY',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-INS-015',
        parent_id: 'L2-INS-001',
        wbs_level: 'L6',
        discipline: 'Instrumentation',
        activity_code: 'INS-CAL-015',
        activity_name: 'Pressure Transmitter Bench Calibration PT-104',
        unit_or_line: 'Instrument Lab',
        planned_start: '2026-09-12',
        planned_end: '2026-09-15',
        planned_duration: 3,
        actual_start: '2026-09-16',
        actual_end: '2026-09-21',
        actual_duration: 5,
        variance: 6,
        delay_days: 6,
        status: 'DELAYED',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-INS-016',
        parent_id: 'L2-INS-001',
        wbs_level: 'L6',
        discipline: 'Instrumentation',
        activity_code: 'INS-JBOX-016',
        activity_name: 'Field Junction Box Wiring & Cable Sealing Skid P-101',
        unit_or_line: 'Skid P-101',
        planned_start: '2026-09-26',
        planned_end: '2026-09-28',
        planned_duration: 2,
        status: 'NOT_STARTED',
        progress_percentage: 0
      },
      {
        activity_id: 'L6-CIV-012',
        parent_id: 'L2-CIV-001',
        wbs_level: 'L6',
        discipline: 'Civil',
        activity_code: 'CIV-FPR-012',
        activity_name: 'Structural Steel Fireproofing Application Bay 2',
        unit_or_line: 'Bay 2',
        planned_start: '2026-09-23',
        planned_end: '2026-09-27',
        planned_duration: 4,
        actual_start: '2026-09-23',
        actual_end: '2026-09-27',
        actual_duration: 4,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-CIV-013',
        parent_id: 'L2-CIV-001',
        wbs_level: 'L6',
        discipline: 'Civil',
        activity_code: 'CIV-DRA-013',
        activity_name: 'Road Culvert & Storm Drainage Precast Slab Placement',
        unit_or_line: 'Access Road',
        planned_start: '2026-09-25',
        planned_end: '2026-09-29',
        planned_duration: 4,
        actual_start: '2026-09-25',
        actual_end: null,
        actual_duration: 2,
        variance: 0,
        delay_days: 0,
        status: 'IN_PROGRESS',
        progress_percentage: 50
      },
      {
        activity_id: 'L6-MEC-005',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L6',
        discipline: 'Mechanical',
        activity_code: 'MEC-LUB-005',
        activity_name: 'Air Compressor C-201 Lube Oil Console Piping Hookup',
        unit_or_line: 'Compressor C-201',
        planned_start: '2026-09-21',
        planned_end: '2026-09-23',
        planned_duration: 2,
        actual_start: '2026-09-21',
        actual_end: '2026-09-23',
        actual_duration: 2,
        variance: 0,
        delay_days: 0,
        status: 'ON_TIME',
        progress_percentage: 100
      },
      {
        activity_id: 'L6-MEC-006',
        parent_id: 'L1-PRJ-001',
        wbs_level: 'L6',
        discipline: 'Mechanical',
        activity_code: 'MEC-VMD-006',
        activity_name: 'Flare Knockout Drum Internal Demister Pad Erection',
        unit_or_line: 'Flare Drum V-102',
        planned_start: '2026-09-17',
        planned_end: '2026-09-19',
        planned_duration: 2,
        actual_start: '2026-09-18',
        actual_end: '2026-09-21',
        actual_duration: 3,
        variance: 2,
        delay_days: 2,
        status: 'DELAYED',
        progress_percentage: 100
      }
    ];

    await ScheduleActivity.insertMany(scheduleData);
    console.log(`Created ${scheduleData.length} schedule activities (L1 to L6)`);

    // 4. Sample Uploaded Documents
    const docs = await Document.create([
      {
        filename: 'DPR_Piping_20260925.txt',
        file_type: 'TXT',
        file_size: 1420,
        upload_time: new Date('2026-09-25T17:30:00Z'),
        discipline: 'Piping',
        processing_status: 'EXTRACTED',
        records_extracted: 3,
        extracted_preview: 'Spool erection for Line 24 completed. Activity started on 23 September 2026 at 09:30...'
      },
      {
        filename: 'Electrical_Discipline_Tracker_W38.xlsx',
        file_type: 'XLSX',
        file_size: 24500,
        upload_time: new Date('2026-09-24T18:00:00Z'),
        discipline: 'Electrical',
        processing_status: 'EXTRACTED',
        records_extracted: 6,
        extracted_preview: 'Substation 2 cable tray installation, feeder bus cable pulling, transformer termination...'
      },
      {
        filename: 'Site_Diary_Civil_Compressor_Unit.pdf',
        file_type: 'PDF',
        file_size: 89400,
        upload_time: new Date('2026-09-22T19:15:00Z'),
        discipline: 'Civil',
        processing_status: 'EXTRACTED',
        records_extracted: 4,
        extracted_preview: 'Excavation encountered hard shale strata. Foundation rebar tying underway...'
      }
    ]);

    // 5. Progress Events (22 Heterogeneous Actual Site Execution Records)
    const events = await ProgressEvent.create([
      {
        project_id: 'PRJ-OIL-2026',
        source_document_id: docs[0]._id,
        source_type: 'DAILY_REPORT',
        source_filename: 'DPR_Piping_20260925.txt',
        raw_text: 'Spool erected on Line 24.\nActivity started on 23 September 2026 at 09:30.\nActivity completed on 25 September 2026 at 16:45.\nSupervisor: Ravi Kumar.',
        discipline: 'Piping',
        activity_description: 'Spool erected on Line 24',
        actual_start: '2026-09-23 09:30',
        actual_end: '2026-09-25 16:45',
        supervisor: 'Ravi Kumar',
        status: 'Completed',
        match_status: 'PENDING_REVIEW',
        suggested_activity_id: 'L6-PIP-024',
        confidence: 0.86
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_document_id: docs[1]._id,
        source_type: 'SPREADSHEET',
        source_filename: 'Electrical_Discipline_Tracker_W38.xlsx',
        raw_text: 'Substation 2 tray laying & bracket fixing. Commenced 16/09/2026.',
        discipline: 'Electrical',
        activity_description: 'Substation 2 cable tray bracket erection and tray laying',
        actual_start: '2026-09-16',
        actual_end: null,
        supervisor: 'M. Bordoloi',
        status: 'In Progress',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-ELE-012',
        confidence: 0.89
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_document_id: docs[2]._id,
        source_type: 'PDF_SITE_DIARY',
        source_filename: 'Site_Diary_Civil_Compressor_Unit.pdf',
        raw_text: 'Compressor C-201 foundation rebar placement finished. Soil compaction completed on 26-Aug-2026.',
        discipline: 'Civil',
        activity_description: 'Excavation & rebar binding Compressor C-201 foundation',
        actual_start: '2026-08-15',
        actual_end: '2026-08-26',
        supervisor: 'K. Saikia',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-CIV-006',
        confidence: 0.92
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'TIME_AGENT',
        raw_text: 'Supervisor voice transcript: "Crude line 18 spool hydrotesting concluded yesterday with zero pressure drop."',
        discipline: 'Piping',
        activity_description: 'Line 18 hydrostatic pressure testing',
        actual_start: '2026-09-18',
        actual_end: '2026-09-20',
        supervisor: 'Ravi Kumar',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-PIP-019',
        confidence: 0.88
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Distillation column V-101 heavy lift completed and aligned on anchor bolts.',
        discipline: 'Static Equipment',
        activity_description: 'Erection of Distillation Column V-101',
        actual_start: '2026-08-22',
        actual_end: '2026-08-29',
        supervisor: 'A. Dutta',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-EQP-001',
        confidence: 0.94
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'SPREADSHEET',
        raw_text: 'Pump Skid P-101A dial indicator cold alignment verified by QA team.',
        discipline: 'Rotating Equipment',
        activity_description: 'Centrifugal Pump P-101A Cold Alignment',
        actual_start: '2026-09-02',
        actual_end: '2026-09-04',
        supervisor: 'T. Gogoi',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-EQP-002',
        confidence: 0.91
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Foundation concrete poured for pump skid P-101 using RMC batching plant.',
        discipline: 'Civil',
        activity_description: 'Foundation Concrete Pouring Pump Skid P-101',
        actual_start: '2026-08-10',
        actual_end: '2026-08-13',
        supervisor: 'K. Saikia',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-CIV-005',
        confidence: 0.95
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Torque tightening of all ANSI 300# flanges on Line 24 completed.',
        discipline: 'Piping',
        activity_description: 'Flange Joint Torque Tightening Line 24',
        actual_start: '2026-09-24',
        actual_end: '2026-09-25',
        supervisor: 'Ravi Kumar',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-PIP-025',
        confidence: 0.90
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Radiographic non-destructive testing of Line 24 spools delayed due to isotope transport clearance.',
        discipline: 'Piping',
        activity_description: 'Radiographic Testing (RT/NDT) of Field Welds Line 24',
        actual_start: '2026-09-26',
        actual_end: null,
        supervisor: 'Ravi Kumar',
        status: 'In Progress',
        match_status: 'PENDING_REVIEW',
        suggested_activity_id: 'L6-PIP-026',
        confidence: 0.74
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'SPREADSHEET',
        raw_text: 'Secondary pipe support welding at Bay 4 structural headers underway.',
        discipline: 'Piping',
        activity_description: 'Pipe Support Welding & Guide Installation Bay 4',
        actual_start: '2026-09-20',
        actual_end: '2026-09-23',
        supervisor: 'Ravi Kumar',
        status: 'Completed',
        match_status: 'PENDING_REVIEW',
        suggested_activity_id: 'L6-PIP-027',
        confidence: 0.78
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'SPREADSHEET',
        raw_text: 'Substation 2 motor feeder cables glanded and megger continuity passed.',
        discipline: 'Electrical',
        activity_description: 'Cable Glanding & Megger Insulation Testing',
        actual_start: '2026-09-24',
        actual_end: '2026-09-26',
        supervisor: 'M. Bordoloi',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-ELE-014',
        confidence: 0.87
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: '11kV switchgear panel cold loop check and breaker tripping simulation.',
        discipline: 'Electrical',
        activity_description: 'High-Voltage Switchgear Panel Cold Commissioning',
        actual_start: '2026-09-20',
        actual_end: '2026-09-26',
        supervisor: 'M. Bordoloi',
        status: 'Completed',
        match_status: 'PENDING_REVIEW',
        suggested_activity_id: 'L6-ELE-015',
        confidence: 0.72
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'TIME_AGENT',
        raw_text: 'Supervisor update: "Air compressor C-201 lube oil console interconnecting piping completed today."',
        discipline: 'Mechanical',
        activity_description: 'Air Compressor C-201 Lube Oil Console Piping Hookup',
        actual_start: '2026-09-21',
        actual_end: '2026-09-23',
        supervisor: 'T. Gogoi',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-MEC-003',
        confidence: 0.85
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Demister pad modules inside Flare Knockout Drum V-102 hoisted and clamped.',
        discipline: 'Mechanical',
        activity_description: 'Flare Knockout Drum Internal Demister Pad Erection',
        actual_start: '2026-09-18',
        actual_end: '2026-09-21',
        supervisor: 'A. Dutta',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-MEC-004',
        confidence: 0.89
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'PDF_SITE_DIARY',
        raw_text: 'Water ponding and wet burlap curing on Bay 3 columns completed 7-day cycle.',
        discipline: 'Civil',
        activity_description: 'Pipe Rack Concrete Column Curing Bay 3',
        actual_start: '2026-09-01',
        actual_end: '2026-09-08',
        supervisor: 'K. Saikia',
        status: 'Completed',
        match_status: 'APPROVED',
        suggested_activity_id: 'L6-CIV-007',
        confidence: 0.93
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'SPREADSHEET',
        raw_text: 'Emergency shutdown ESD valve XV-105 wired to DCS rack marshalling cabinet.',
        discipline: 'Instrumentation',
        activity_description: 'DCS Loop Checking for ESD Valve XV-105',
        actual_start: '2026-09-28',
        actual_end: null,
        supervisor: 'N. Pathak',
        status: 'In Progress',
        match_status: 'PENDING_REVIEW',
        suggested_activity_id: 'L6-INS-010',
        confidence: 0.76
      },

      // 6 Low-Confidence / Unmatched Events (Module 6 & 7 Demonstration)
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Scaffolding dismantling near canteen boundary wall.',
        discipline: 'Civil',
        activity_description: 'Non-critical peripheral boundary scaffolding removal',
        actual_start: '2026-09-24',
        actual_end: '2026-09-24',
        supervisor: 'S. Das',
        status: 'Completed',
        match_status: 'UNMATCHED',
        suggested_activity_id: null,
        confidence: 0.42
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Ad-hoc temporary drain clearing after monsoon downpour.',
        discipline: 'HSE',
        activity_description: 'Site storm drain clearing and desilting',
        actual_start: '2026-09-21',
        actual_end: '2026-09-21',
        supervisor: 'H. Baruah',
        status: 'UNMATCHED',
        suggested_activity_id: null,
        confidence: 0.38
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Temporary safety warning barricades relocated near fabrication laydown yard.',
        discipline: 'HSE',
        activity_description: 'Fabrication yard safety barricade repositioning',
        actual_start: '2026-09-22',
        actual_end: '2026-09-22',
        supervisor: 'H. Baruah',
        status: 'Completed',
        match_status: 'UNMATCHED',
        suggested_activity_id: null,
        confidence: 0.35
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Night-shift portable diesel lighting tower refueling and oil filter change.',
        discipline: 'Electrical',
        activity_description: 'Portable generator lighting tower maintenance',
        actual_start: '2026-09-23',
        actual_end: '2026-09-23',
        supervisor: 'M. Bordoloi',
        status: 'Completed',
        match_status: 'UNMATCHED',
        suggested_activity_id: null,
        confidence: 0.28
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Spreading river gravel at contractor gate entrance due to mud accumulation.',
        discipline: 'Civil',
        activity_description: 'Gate 2 access gravel dressing and road leveling',
        actual_start: '2026-09-24',
        actual_end: '2026-09-24',
        supervisor: 'S. Das',
        status: 'Completed',
        match_status: 'UNMATCHED',
        suggested_activity_id: null,
        confidence: 0.40
      },
      {
        project_id: 'PRJ-OIL-2026',
        source_type: 'DAILY_REPORT',
        raw_text: 'Scrap rebar cutting waste sorted and stacked in laydown bin 4.',
        discipline: 'General',
        activity_description: 'Scrap metal recycling and segregation',
        actual_start: '2026-09-25',
        actual_end: '2026-09-25',
        supervisor: 'H. Baruah',
        status: 'Completed',
        match_status: 'UNMATCHED',
        suggested_activity_id: null,
        confidence: 0.22
      }
    ]);
    console.log(`Created ${events.length} sample progress events (including 6 low-confidence/unmatched events)`);

    // 6. Match Records (14 Matches across High, Medium, and Low Confidence)
    const matches = await Match.create([
      {
        event_id: events[0]._id,
        activity_id: 'L6-PIP-024',
        actual_description: 'Spool erected on Line 24',
        planned_activity_name: 'Erect Line 24-XX',
        discipline: 'Piping',
        semantic_score: 0.84,
        keyword_score: 0.80,
        discipline_score: 1.0,
        final_confidence: 0.86,
        reason: 'Auto-suggest match (High Confidence): Matching discipline: Piping; Exact equipment / tag identifier match; High semantic text similarity.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'PENDING'
      },
      {
        event_id: events[1]._id,
        activity_id: 'L6-ELE-012',
        actual_description: 'Substation 2 cable tray bracket erection and tray laying',
        planned_activity_name: 'Cable Tray Installation Substation 2',
        discipline: 'Electrical',
        semantic_score: 0.88,
        keyword_score: 0.85,
        discipline_score: 1.0,
        final_confidence: 0.89,
        reason: 'Auto-suggest match (High Confidence): Matching discipline: Electrical; Key activity verbs/nouns match (cable, tray, substation).',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-09-24T18:30:00Z')
      },
      {
        event_id: events[2]._id,
        activity_id: 'L6-CIV-006',
        actual_description: 'Excavation & rebar binding Compressor C-201 foundation',
        planned_activity_name: 'Excavation & Rebar Binding Compressor C-201',
        discipline: 'Civil',
        semantic_score: 0.94,
        keyword_score: 0.90,
        discipline_score: 1.0,
        final_confidence: 0.92,
        reason: 'Auto-suggest match (High Confidence): Exact equipment tag C-201 match and identical phrasing.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-08-27T10:00:00Z')
      },
      {
        event_id: events[3]._id,
        activity_id: 'L6-PIP-019',
        actual_description: 'Line 18 hydrostatic pressure testing',
        planned_activity_name: 'Hydrostatic Pressure Testing Line 18',
        discipline: 'Piping',
        semantic_score: 0.89,
        keyword_score: 0.85,
        discipline_score: 1.0,
        final_confidence: 0.88,
        reason: 'Auto-suggest match (High Confidence): Exact line identifier Line 18 and hydrostatic pressure testing activity.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-09-21T09:00:00Z')
      },
      {
        event_id: events[4]._id,
        activity_id: 'L6-EQP-001',
        actual_description: 'Erection of Distillation Column V-101',
        planned_activity_name: 'Erection of Distillation Column V-101',
        discipline: 'Static Equipment',
        semantic_score: 0.95,
        keyword_score: 0.92,
        discipline_score: 1.0,
        final_confidence: 0.94,
        reason: 'Auto-suggest match (High Confidence): Exact equipment tag V-101 and heavy lift activity.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-08-30T11:00:00Z')
      },
      {
        event_id: events[5]._id,
        activity_id: 'L6-EQP-002',
        actual_description: 'Centrifugal Pump P-101A Cold Alignment',
        planned_activity_name: 'Centrifugal Pump P-101A Cold Alignment',
        discipline: 'Rotating Equipment',
        semantic_score: 0.92,
        keyword_score: 0.88,
        discipline_score: 1.0,
        final_confidence: 0.91,
        reason: 'Auto-suggest match (High Confidence): Cold alignment pump skid P-101A verified match.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-09-05T09:30:00Z')
      },
      {
        event_id: events[6]._id,
        activity_id: 'L6-CIV-005',
        actual_description: 'Foundation Concrete Pouring Pump Skid P-101',
        planned_activity_name: 'Foundation Concrete Pouring Pump Skid P-101',
        discipline: 'Civil',
        semantic_score: 0.96,
        keyword_score: 0.94,
        discipline_score: 1.0,
        final_confidence: 0.95,
        reason: 'Auto-suggest match (High Confidence): Foundation concrete pour pump skid P-101 exact match.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-08-14T14:00:00Z')
      },
      {
        event_id: events[7]._id,
        activity_id: 'L6-PIP-025',
        actual_description: 'Flange Joint Torque Tightening Line 24',
        planned_activity_name: 'Flange Joint Torque Tightening Line 24',
        discipline: 'Piping',
        semantic_score: 0.91,
        keyword_score: 0.88,
        discipline_score: 1.0,
        final_confidence: 0.90,
        reason: 'Auto-suggest match (High Confidence): Torque tightening Line 24 flanges verified.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-09-25T18:00:00Z')
      },
      {
        event_id: events[8]._id,
        activity_id: 'L6-PIP-026',
        actual_description: 'Radiographic Testing (RT/NDT) of Field Welds Line 24',
        planned_activity_name: 'Radiographic Testing (RT/NDT) of Field Welds Line 24',
        discipline: 'Piping',
        semantic_score: 0.76,
        keyword_score: 0.72,
        discipline_score: 1.0,
        final_confidence: 0.74,
        reason: 'Ambiguous / Manual review suggested (Medium Confidence): NDT inspection keyword matches; clearance delay noted in site description.',
        status: 'MEDIUM_CONFIDENCE',
        review_status: 'PENDING'
      },
      {
        event_id: events[9]._id,
        activity_id: 'L6-PIP-027',
        actual_description: 'Pipe Support Welding & Guide Installation Bay 4',
        planned_activity_name: 'Pipe Support Welding & Guide Installation Bay 4',
        discipline: 'Piping',
        semantic_score: 0.80,
        keyword_score: 0.75,
        discipline_score: 1.0,
        final_confidence: 0.78,
        reason: 'Ambiguous / Manual review suggested (Medium Confidence): Structural pipe support match for Bay 4.',
        status: 'MEDIUM_CONFIDENCE',
        review_status: 'PENDING'
      },
      {
        event_id: events[10]._id,
        activity_id: 'L6-ELE-014',
        actual_description: 'Cable Glanding & Megger Insulation Testing',
        planned_activity_name: 'Cable Glanding & Megger Insulation Testing',
        discipline: 'Electrical',
        semantic_score: 0.89,
        keyword_score: 0.84,
        discipline_score: 1.0,
        final_confidence: 0.87,
        reason: 'Auto-suggest match (High Confidence): Megger insulation and glanding tests for Substation 2.',
        status: 'HIGH_CONFIDENCE',
        review_status: 'APPROVED',
        reviewed_by: 'Priyanka Sharma',
        reviewed_at: new Date('2026-09-26T17:00:00Z')
      },
      {
        event_id: events[11]._id,
        activity_id: 'L6-ELE-015',
        actual_description: 'High-Voltage Switchgear Panel Cold Commissioning',
        planned_activity_name: 'High-Voltage Switchgear Panel Cold Commissioning',
        discipline: 'Electrical',
        semantic_score: 0.73,
        keyword_score: 0.70,
        discipline_score: 1.0,
        final_confidence: 0.72,
        reason: 'Ambiguous / Manual review suggested (Medium Confidence): 11kV switchgear breaker test matches cold commissioning scope.',
        status: 'MEDIUM_CONFIDENCE',
        review_status: 'PENDING'
      },
      {
        event_id: events[16]._id,
        activity_id: 'UNMATCHED',
        actual_description: 'Non-critical peripheral boundary scaffolding removal',
        planned_activity_name: 'None',
        discipline: 'Civil',
        semantic_score: 0.35,
        keyword_score: 0.30,
        discipline_score: 0.8,
        final_confidence: 0.42,
        reason: 'Unmatched / Manual review required (Low Confidence): Low semantic similarity across baseline L5/L6 activities. Flagged for planner classification.',
        status: 'LOW_CONFIDENCE',
        review_status: 'PENDING'
      },
      {
        event_id: events[17]._id,
        activity_id: 'UNMATCHED',
        actual_description: 'Site storm drain clearing and desilting',
        planned_activity_name: 'None',
        discipline: 'HSE',
        semantic_score: 0.32,
        keyword_score: 0.28,
        discipline_score: 0.7,
        final_confidence: 0.38,
        reason: 'Unmatched / Non-baseline maintenance activity: Storm drain desilting classified as routine camp upkeep rather than milestone work.',
        status: 'LOW_CONFIDENCE',
        review_status: 'PENDING'
      }
    ]);
    console.log(`Created ${matches.length} match records (including High, Medium, and Low confidence categories)`);

    // Link match ID to event 0
    events[0].match_id = matches[0]._id;
    await events[0].save();

    // 7. Delay Records (7 Delayed Activities for Module 11 Analytics)
    const delayRecords = await DelayRecord.create([
      {
        activity_id: 'L6-CIV-006',
        activity_name: 'Excavation & Rebar Binding Compressor C-201',
        discipline: 'Civil',
        planned_duration: 7,
        actual_duration: 11,
        delay_days: 4,
        possible_cause: 'Weather',
        confidence: 0.91,
        recorded_at: new Date('2026-08-27T10:05:00Z'),
        status: 'ACTIVE'
      },
      {
        activity_id: 'L6-PIP-018',
        activity_name: 'Erect Line 18-AB Crude Feed',
        discipline: 'Piping',
        planned_duration: 4,
        actual_duration: 5,
        delay_days: 2,
        possible_cause: 'Material Delay',
        confidence: 0.88,
        recorded_at: new Date('2026-09-17T14:20:00Z'),
        status: 'ACTIVE'
      },
      {
        activity_id: 'L6-PIP-019',
        activity_name: 'Hydrostatic Pressure Testing Line 18',
        discipline: 'Piping',
        planned_duration: 2,
        actual_duration: 2,
        delay_days: 3,
        possible_cause: 'Access Constraint',
        confidence: 0.85,
        recorded_at: new Date('2026-09-20T16:00:00Z'),
        status: 'ACTIVE'
      },
      {
        activity_id: 'L6-CIV-008',
        activity_name: 'Underground Cable Trenching North Corridor',
        discipline: 'Civil',
        planned_duration: 6,
        actual_duration: 8,
        delay_days: 3,
        possible_cause: 'Manpower Shortage',
        confidence: 0.82,
        recorded_at: new Date('2026-09-22T17:45:00Z'),
        status: 'ACTIVE'
      },
      {
        activity_id: 'L6-EQP-001',
        activity_name: 'Erection of Distillation Column V-101',
        discipline: 'Static Equipment',
        planned_duration: 5,
        actual_duration: 7,
        delay_days: 3,
        possible_cause: 'Equipment Delay',
        confidence: 0.89,
        recorded_at: new Date('2026-08-29T18:10:00Z'),
        status: 'ACTIVE'
      },
      {
        activity_id: 'L6-PIP-026',
        activity_name: 'Radiographic Testing (RT/NDT) of Field Welds Line 24',
        discipline: 'Piping',
        planned_duration: 2,
        actual_duration: 3,
        delay_days: 5,
        possible_cause: 'Approval Delay',
        confidence: 0.87,
        recorded_at: new Date('2026-09-26T18:00:00Z'),
        status: 'ACTIVE'
      },
      {
        activity_id: 'L6-INS-008',
        activity_name: 'Pressure Transmitter Bench Calibration PT-104',
        discipline: 'Instrumentation',
        planned_duration: 3,
        actual_duration: 5,
        delay_days: 6,
        possible_cause: 'Equipment Delay',
        confidence: 0.84,
        recorded_at: new Date('2026-09-21T17:30:00Z'),
        status: 'ACTIVE'
      }
    ]);
    console.log(`Created ${delayRecords.length} delay records`);

    // 8. Institutional Project Memory (12 Engineering Records for Module 12)
    const memory = await ProjectMemory.create([
      {
        activity_keyword: 'Spool Erection',
        discipline: 'Piping',
        average_actual_duration: 3.4,
        planned_duration: 2.5,
        average_delay: 0.9,
        most_common_delay_cause: 'Material availability',
        historical_record_count: 18,
        productivity_rating: 'Moderate',
        recurring_bottleneck: 'Gasket & fast bolt kit shortages at tie-in points',
        recommended_mitigation: 'Verify physical presence of bolts, torque wrenches & test blinds 48h prior to erection.'
      },
      {
        activity_keyword: 'Cable Tray Installation',
        discipline: 'Electrical',
        average_actual_duration: 7.2,
        planned_duration: 6.0,
        average_delay: 1.2,
        most_common_delay_cause: 'Access Constraint',
        historical_record_count: 14,
        productivity_rating: 'Normal',
        recurring_bottleneck: 'Clash with civil scaffolding before wall penetration',
        recommended_mitigation: 'Co-schedule civil scaffold dismantling 1 shift before electrical tray crew mobilization.'
      },
      {
        activity_keyword: 'Foundation Concrete Pouring',
        discipline: 'Civil',
        average_actual_duration: 4.8,
        planned_duration: 4.0,
        average_delay: 0.8,
        most_common_delay_cause: 'Weather',
        historical_record_count: 22,
        productivity_rating: 'High',
        recurring_bottleneck: 'Flash monsoon showers causing rebar pit waterlogging',
        recommended_mitigation: 'Maintain dual submersible dewatering pumps on standby at all excavation blocks.'
      },
      {
        activity_keyword: 'Hydrostatic Pressure Testing',
        discipline: 'Piping',
        average_actual_duration: 2.6,
        planned_duration: 2.0,
        average_delay: 0.6,
        most_common_delay_cause: 'Approval Delay',
        historical_record_count: 12,
        productivity_rating: 'High',
        recurring_bottleneck: 'Third-party inspector and QA/QC sign-off availability',
        recommended_mitigation: 'Pre-schedule QA/QC joint walk-through 24 hours prior to filling manifold with test medium.'
      },
      {
        activity_keyword: 'Loop Checking & DCS Termination',
        discipline: 'Instrumentation',
        average_actual_duration: 2.9,
        planned_duration: 2.0,
        average_delay: 0.9,
        most_common_delay_cause: 'Design Change',
        historical_record_count: 9,
        productivity_rating: 'At Risk',
        recurring_bottleneck: 'I/O assignment revisions in vendor marshalling cabinets',
        recommended_mitigation: 'Freeze DCS I/O mapping 10 days before loop interrogation commence date.'
      },
      {
        activity_keyword: 'Equipment Alignment (Cold & Hot)',
        discipline: 'Rotating Equipment',
        average_actual_duration: 2.8,
        planned_duration: 2.0,
        average_delay: 0.8,
        most_common_delay_cause: 'Equipment Delay',
        historical_record_count: 8,
        productivity_rating: 'Normal',
        recurring_bottleneck: 'Specialized laser alignment tool calibration expiry',
        recommended_mitigation: 'Audit OEM calibration certificates during vendor mobilization check.'
      },
      {
        activity_keyword: 'Underground Cable Trenching',
        discipline: 'Civil',
        average_actual_duration: 8.5,
        planned_duration: 6.0,
        average_delay: 2.5,
        most_common_delay_cause: 'Manpower Shortage',
        historical_record_count: 11,
        productivity_rating: 'At Risk',
        recurring_bottleneck: 'Manual trenching required near live buried utilities',
        recommended_mitigation: 'Deploy ground penetrating radar (GPR) to delineate utilities prior to excavation.'
      },
      {
        activity_keyword: 'Field Butt Welding',
        discipline: 'Piping',
        average_actual_duration: 3.5,
        planned_duration: 3.0,
        average_delay: 0.5,
        most_common_delay_cause: 'Weather',
        historical_record_count: 16,
        productivity_rating: 'High',
        recurring_bottleneck: 'High ambient humidity requiring continuous electrode baking',
        recommended_mitigation: 'Ensure portable heated quivers are supplied to all welders on elevated pipe racks.'
      },
      {
        activity_keyword: 'Column & Vessel Heavy Rigging',
        discipline: 'Static Equipment',
        average_actual_duration: 6.8,
        planned_duration: 5.0,
        average_delay: 1.8,
        most_common_delay_cause: 'Equipment Delay',
        historical_record_count: 6,
        productivity_rating: 'Critical Attention',
        recurring_bottleneck: 'Heavy crawler crane boom assembly & ground bearing plate tests',
        recommended_mitigation: 'Complete soil plate load tests 1 week in advance of main crane boom assembly.'
      },
      {
        activity_keyword: 'Safety Induction & Hot Work Permitting',
        discipline: 'HSE',
        average_actual_duration: 1.1,
        planned_duration: 1.0,
        average_delay: 0.1,
        most_common_delay_cause: 'Approval Delay',
        historical_record_count: 25,
        productivity_rating: 'High',
        recurring_bottleneck: 'Gas test certification delays during morning shift handover',
        recommended_mitigation: 'Station dedicated multi-gas detector technician at Area Permit Office by 07:30 AM.'
      },
      {
        activity_keyword: 'Flare Knockout Drum Demister Pad Installation',
        discipline: 'Mechanical',
        average_actual_duration: 2.5,
        planned_duration: 2.0,
        average_delay: 0.5,
        most_common_delay_cause: 'Equipment Delay',
        historical_record_count: 7,
        productivity_rating: 'Normal',
        recurring_bottleneck: 'Confined space entry ventilation clearance',
        recommended_mitigation: 'Deploy dedicated air-movers 6 hours prior to vessel entry.'
      },
      {
        activity_keyword: 'High-Voltage Switchgear Cold Commissioning',
        discipline: 'Electrical',
        average_actual_duration: 5.8,
        planned_duration: 4.0,
        average_delay: 1.8,
        most_common_delay_cause: 'Vendor Coordination',
        historical_record_count: 10,
        productivity_rating: 'Moderate',
        recurring_bottleneck: 'OEM vendor representative site arrival schedule mismatch',
        recommended_mitigation: 'Issue 14-day formal advance call-off notice to switchgear manufacturer representative.'
      }
    ]);
    console.log(`Created ${memory.length} project memory records`);

    // 9. Audit Trail (15 Cryptographically Hashed Records for Module 13)
    const auditLogs = await AuditLog.create([
      {
        timestamp: new Date('2026-09-24T18:00:00Z'),
        user: 'Priyanka Sharma',
        user_role: 'PLANNER',
        action: 'UPLOAD',
        source_file: 'Electrical_Discipline_Tracker_W38.xlsx',
        details: 'Uploaded spreadsheet containing 6 weekly electrical progress updates.'
      },
      {
        timestamp: new Date('2026-09-24T18:02:00Z'),
        user: 'System Extractor',
        user_role: 'SYSTEM',
        action: 'EXTRACTION',
        source_file: 'Electrical_Discipline_Tracker_W38.xlsx',
        details: 'Extracted 6 progress events with 100% column mapping accuracy.'
      },
      {
        timestamp: new Date('2026-09-24T18:15:00Z'),
        user: 'AI Matching Engine',
        user_role: 'SYSTEM',
        action: 'MATCH_SUGGESTED',
        activity_id: 'L6-ELE-012',
        new_value: 'Cable Tray Installation Substation 2',
        confidence: 0.89,
        details: 'Auto-suggested match for "Substation 2 tray laying & bracket fixing" with 89% confidence.'
      },
      {
        timestamp: new Date('2026-09-24T18:30:00Z'),
        user: 'Priyanka Sharma',
        user_role: 'PLANNER',
        action: 'MATCH_APPROVED',
        activity_id: 'L6-ELE-012',
        old_value: 'Planned Start: 2026-09-15',
        new_value: 'Actual Start: 2026-09-16',
        confidence: 0.89,
        review_status: 'APPROVED',
        details: 'Planner verified physical field photos and approved match to L6-ELE-012.'
      },
      {
        timestamp: new Date('2026-09-24T18:31:00Z'),
        user: 'System Orchestrator',
        user_role: 'SYSTEM',
        action: 'SCHEDULE_UPDATED',
        activity_id: 'L6-ELE-012',
        old_value: 'status: NOT_STARTED',
        new_value: 'status: IN_PROGRESS, actual_start: 2026-09-16, progress: 75%',
        details: 'Calculated project schedule updates. Activity variance: +1 day.'
      },
      {
        timestamp: new Date('2026-09-25T17:30:00Z'),
        user: 'Ravi Kumar',
        user_role: 'SUPERVISOR',
        action: 'UPLOAD',
        source_file: 'DPR_Piping_20260925.txt',
        details: 'Uploaded Daily Progress Report for Piping Section 24.'
      },
      {
        timestamp: new Date('2026-09-25T17:31:00Z'),
        user: 'System Extractor',
        user_role: 'SYSTEM',
        action: 'EXTRACTION',
        source_file: 'DPR_Piping_20260925.txt',
        details: 'Extracted: Piping | Spool erection for Line 24 | Start: 2026-09-23 09:30 | End: 2026-09-25 16:45.'
      },
      {
        timestamp: new Date('2026-09-25T17:32:00Z'),
        user: 'AI Matching Engine',
        user_role: 'SYSTEM',
        action: 'MATCH_SUGGESTED',
        activity_id: 'L6-PIP-024',
        new_value: 'Erect Line 24-XX',
        confidence: 0.86,
        details: 'Strong semantic similarity and matching discipline. Equipment identifier "Line 24" matched.'
      },
      {
        timestamp: new Date('2026-09-25T18:00:00Z'),
        user: 'Priyanka Sharma',
        user_role: 'PLANNER',
        action: 'MATCH_APPROVED',
        activity_id: 'L6-PIP-025',
        old_value: 'Planned Duration: 1 day',
        new_value: 'Actual Start: 2026-09-24, Actual End: 2026-09-25',
        confidence: 0.90,
        review_status: 'APPROVED',
        details: 'Flange Joint Torque Tightening verified against calibration torque sheet.'
      },
      {
        timestamp: new Date('2026-09-26T09:00:00Z'),
        user: 'Ravi Kumar',
        user_role: 'SUPERVISOR',
        action: 'TIME_AGENT_INPUT',
        details: 'Natural language voice log submitted via Time Agent: "Air compressor C-201 lube oil console interconnecting piping completed today."'
      },
      {
        timestamp: new Date('2026-09-26T09:02:00Z'),
        user: 'AI Matching Engine',
        user_role: 'SYSTEM',
        action: 'MATCH_SUGGESTED',
        activity_id: 'L6-MEC-003',
        new_value: 'Air Compressor C-201 Lube Oil Console Piping Hookup',
        confidence: 0.85,
        details: 'Semantic match to L6-MEC-003 from voice transcript.'
      },
      {
        timestamp: new Date('2026-09-26T10:15:00Z'),
        user: 'Priyanka Sharma',
        user_role: 'PLANNER',
        action: 'MATCH_APPROVED',
        activity_id: 'L6-MEC-003',
        old_value: 'status: NOT_STARTED',
        new_value: 'status: ON_TIME, actual_start: 2026-09-21, actual_end: 2026-09-23',
        confidence: 0.85,
        review_status: 'APPROVED',
        details: 'Approved Time Agent field update for air compressor lube console.'
      },
      {
        timestamp: new Date('2026-09-26T17:00:00Z'),
        user: 'Priyanka Sharma',
        user_role: 'PLANNER',
        action: 'MATCH_APPROVED',
        activity_id: 'L6-ELE-014',
        old_value: 'status: IN_PROGRESS',
        new_value: 'status: ON_TIME, progress: 100%',
        confidence: 0.87,
        review_status: 'APPROVED',
        details: 'Cable glanding and megger test reports approved after QC inspector countersignature.'
      },
      {
        timestamp: new Date('2026-09-26T18:05:00Z'),
        user: 'System Delay Engine',
        user_role: 'SYSTEM',
        action: 'DELAY_FLAGGED',
        activity_id: 'L6-PIP-026',
        old_value: 'delay: 0 days',
        new_value: 'delay: 5 days, root_cause: Approval Delay',
        details: 'Radiographic testing delayed waiting for isotope transport regulatory clearance.'
      },
      {
        timestamp: new Date('2026-09-27T08:00:00Z'),
        user: 'Amitabh Sen',
        user_role: 'ADMIN',
        action: 'AUDIT_INTEGRITY_VERIFIED',
        details: 'All 15 cryptographic SHA-256 block hashes verified across the immutable ledger. Zero tampering detected.'
      }
    ]);
    console.log(`Created ${auditLogs.length} audit trail records`);

    console.log('✅ Database seeded successfully with realistic SIH26122 data!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  }
}

// If executed directly from CLI: node src/utils/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
