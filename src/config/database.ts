import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management';
const dbPath = path.join(__dirname, '../../data/database.json');

// Track MongoDB connection status
export let isMongoConnected = false;

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    isMongoConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB connection failed, using JSON file fallback:', error);
    isMongoConnected = false;
    // Don't exit, allow fallback to JSON
  }
};

// JSON Database Interface
export interface Database {
  students: Student[];
  teachers: Teacher[];
  billing: BillingRecord[];
  history: {
    students: Student[];
    teachers: Teacher[];
  };
}

export interface Student {
  id: string;
  name: string;
  class: string;
  rollNumber: string;
  email: string;
  phone: string;
  address: string;
  dob?: string; // Date of Birth (optional)
  admissionDate: string;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  address: string;
  joiningDate: string;
  salary: number;
  isActive: boolean;
}

export interface BillingRecord {
  id: string;
  type: 'student_fee' | 'teacher_salary';
  studentId?: string;
  teacherId?: string;
  amount: number;
  date: string;
  description: string;
}

// JSON File Operations
export function readDatabase(): Database {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database.json:', error);
    return {
      students: [],
      teachers: [],
      billing: [],
      history: {
        students: [],
        teachers: []
      }
    };
  }
}

export function writeDatabase(data: Database): void {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database.json:', error);
  }
}

// Mongoose Interfaces (for MongoDB)
export interface IStudent {
  name: string;
  class: string;
  rollNumber: string;
  email: string;
  phone: string;
  address: string;
  dob?: string;
  admissionDate: string;
  isActive: boolean;
}

export interface ITeacher {
  name: string;
  subject: string;
  email: string;
  phone: string;
  address: string;
  joiningDate: string;
  salary: number;
  isActive: boolean;
}

export interface IBillingRecord {
  type: 'student_fee' | 'teacher_salary';
  studentId?: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
  amount: number;
  date: string;
  description: string;
}
