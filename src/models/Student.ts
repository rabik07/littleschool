import mongoose, { Schema, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IStudent, isMongoConnected, readDatabase, writeDatabase, Student as StudentType } from '../config/database';

// MongoDB Model
interface IStudentDocument extends IStudent, mongoose.Document {}

const studentSchema = new Schema<IStudentDocument>({
  name: { type: String, required: true },
  class: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  dob: { type: String, required: false }, // Date of Birth (optional for now)
  admissionDate: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const StudentModel: Model<IStudentDocument> = mongoose.models.Student || mongoose.model<IStudentDocument>('Student', studentSchema);

export class Student {
  static async getAll(): Promise<any[]> {
    if (isMongoConnected) {
      const students = await StudentModel.find({ isActive: true }).exec();
      return students.map(s => {
        const obj = s.toObject();
        return { ...obj, _id: (s._id as mongoose.Types.ObjectId).toString(), dob: obj.dob || '' };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
  return db.students.filter(s => s.isActive).map(s => ({ ...s, _id: s.id, dob: s.dob || '' }));
    }
  }

  static async getByClass(className: string): Promise<any[]> {
    if (isMongoConnected) {
      const students = await StudentModel.find({ class: className, isActive: true }).exec();
      return students.map(s => {
        const obj = s.toObject();
        return { ...obj, _id: (s._id as mongoose.Types.ObjectId).toString() };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
      return db.students
        .filter(s => s.class === className && s.isActive)
        .map(s => ({ ...s, _id: s.id }));
    }
  }

  static async getById(id: string): Promise<any | null> {
    if (isMongoConnected) {
      const student = await StudentModel.findById(id).exec();
      if (!student) return null;
      const obj = student.toObject();
      return { ...obj, _id: (student._id as mongoose.Types.ObjectId).toString() };
    } else {
      // JSON fallback
      const db = readDatabase();
      const student = db.students.find(s => s.id === id);
      return student ? { ...student, _id: student.id } : null;
    }
  }

  static async create(studentData: Omit<IStudent, 'isActive'>): Promise<any> {
    if (isMongoConnected) {
      const newStudent = new StudentModel({
        ...studentData,
        isActive: true
      });
      const saved = await newStudent.save();
      const obj = saved.toObject();
      return { ...obj, _id: (saved._id as mongoose.Types.ObjectId).toString() };
    } else {
      // JSON fallback
      const db = readDatabase();
      const newStudent: StudentType = {
        id: uuidv4(),
        ...studentData,
        isActive: true
      };
      db.students.push(newStudent);
      writeDatabase(db);
      return { ...newStudent, _id: newStudent.id };
    }
  }

  static async update(id: string, studentData: Partial<IStudent>): Promise<any | null> {
    if (isMongoConnected) {
      const student = await StudentModel.findByIdAndUpdate(id, studentData, { new: true }).exec();
      if (!student) return null;
      const obj = student.toObject();
      return { ...obj, _id: (student._id as mongoose.Types.ObjectId).toString() };
    } else {
      // JSON fallback
      const db = readDatabase();
      const index = db.students.findIndex(s => s.id === id);
      if (index === -1) return null;
      db.students[index] = { ...db.students[index], ...studentData };
      writeDatabase(db);
      return { ...db.students[index], _id: db.students[index].id };
    }
  }

  static async delete(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const student = await StudentModel.findById(id).exec();
      if (!student) return false;
      
      // Move to history
      const HistoryStudent = mongoose.models.HistoryStudent || mongoose.model('HistoryStudent', studentSchema);
      await new HistoryStudent({ ...student.toObject(), isActive: false }).save();
      
      await StudentModel.findByIdAndDelete(id).exec();
      return true;
    } else {
      // JSON fallback
      const db = readDatabase();
      const index = db.students.findIndex(s => s.id === id);
      if (index === -1) return false;
      
      // Move to history
      db.history.students.push({ ...db.students[index], isActive: false });
      db.students.splice(index, 1);
      writeDatabase(db);
      return true;
    }
  }

  static async getClasses(): Promise<string[]> {
    if (isMongoConnected) {
      const classes = await StudentModel.find({ isActive: true }).distinct('class').exec();
      return classes.sort();
    } else {
      // JSON fallback
      const db = readDatabase();
      const classes = [...new Set(db.students.filter(s => s.isActive).map(s => s.class))];
      return classes.sort();
    }
  }
}
