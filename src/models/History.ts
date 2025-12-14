import mongoose from 'mongoose';
import { isMongoConnected, readDatabase } from '../config/database';

const historyStudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  rollNumber: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  admissionDate: { type: String, required: true },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

const historyTeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  joiningDate: { type: String, required: true },
  salary: { type: Number, required: true },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

const HistoryStudent = mongoose.models.HistoryStudent || mongoose.model('HistoryStudent', historyStudentSchema);
const HistoryTeacher = mongoose.models.HistoryTeacher || mongoose.model('HistoryTeacher', historyTeacherSchema);

export class History {
  static async getPassoutStudents() {
    if (isMongoConnected) {
      const students = await HistoryStudent.find().exec();
      return students.map(s => {
        const obj = s.toObject();
        return { ...obj, _id: (s._id as mongoose.Types.ObjectId).toString() };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
      return db.history.students.map(s => ({ ...s, _id: s.id }));
    }
  }

  static async getPassoutTeachers() {
    if (isMongoConnected) {
      const teachers = await HistoryTeacher.find().exec();
      return teachers.map(t => {
        const obj = t.toObject();
        return { ...obj, _id: (t._id as mongoose.Types.ObjectId).toString() };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
      return db.history.teachers.map(t => ({ ...t, _id: t.id }));
    }
  }
}
