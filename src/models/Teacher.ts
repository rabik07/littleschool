import mongoose, { Schema, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ITeacher, isMongoConnected, readDatabase, writeDatabase, Teacher as TeacherType } from '../config/database';

// MongoDB Model
interface ITeacherDocument extends ITeacher, mongoose.Document {}

const teacherSchema = new Schema<ITeacherDocument>({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  joiningDate: { type: String, required: true },
  salary: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const TeacherModel: Model<ITeacherDocument> = mongoose.models.Teacher || mongoose.model<ITeacherDocument>('Teacher', teacherSchema);

export class Teacher {
  static async getAll(): Promise<any[]> {
    if (isMongoConnected) {
      const teachers = await TeacherModel.find({ isActive: true }).exec();
      return teachers.map(t => {
        const obj = t.toObject();
        return { ...obj, _id: (t._id as mongoose.Types.ObjectId).toString() };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
      return db.teachers.filter(t => t.isActive).map(t => ({ ...t, _id: t.id }));
    }
  }

  static async getById(id: string): Promise<any | null> {
    if (isMongoConnected) {
      const teacher = await TeacherModel.findById(id).exec();
      if (!teacher) return null;
      const obj = teacher.toObject();
      return { ...obj, _id: (teacher._id as mongoose.Types.ObjectId).toString() };
    } else {
      // JSON fallback
      const db = readDatabase();
      const teacher = db.teachers.find(t => t.id === id);
      return teacher ? { ...teacher, _id: teacher.id } : null;
    }
  }

  static async create(teacherData: Omit<ITeacher, 'isActive'>): Promise<any> {
    if (isMongoConnected) {
      const newTeacher = new TeacherModel({
        ...teacherData,
        isActive: true
      });
      const saved = await newTeacher.save();
      const obj = saved.toObject();
      return { ...obj, _id: (saved._id as mongoose.Types.ObjectId).toString() };
    } else {
      // JSON fallback
      const db = readDatabase();
      const newTeacher: TeacherType = {
        id: uuidv4(),
        ...teacherData,
        isActive: true
      };
      db.teachers.push(newTeacher);
      writeDatabase(db);
      return { ...newTeacher, _id: newTeacher.id };
    }
  }

  static async update(id: string, teacherData: Partial<ITeacher>): Promise<any | null> {
    if (isMongoConnected) {
      const teacher = await TeacherModel.findByIdAndUpdate(id, teacherData, { new: true }).exec();
      if (!teacher) return null;
      const obj = teacher.toObject();
      return { ...obj, _id: (teacher._id as mongoose.Types.ObjectId).toString() };
    } else {
      // JSON fallback
      const db = readDatabase();
      const index = db.teachers.findIndex(t => t.id === id);
      if (index === -1) return null;
      db.teachers[index] = { ...db.teachers[index], ...teacherData };
      writeDatabase(db);
      return { ...db.teachers[index], _id: db.teachers[index].id };
    }
  }

  static async delete(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const teacher = await TeacherModel.findById(id).exec();
      if (!teacher) return false;
      
      // Move to history
      const HistoryTeacher = mongoose.models.HistoryTeacher || mongoose.model('HistoryTeacher', teacherSchema);
      await new HistoryTeacher({ ...teacher.toObject(), isActive: false }).save();
      
      await TeacherModel.findByIdAndDelete(id).exec();
      return true;
    } else {
      // JSON fallback
      const db = readDatabase();
      const index = db.teachers.findIndex(t => t.id === id);
      if (index === -1) return false;
      
      // Move to history
      db.history.teachers.push({ ...db.teachers[index], isActive: false });
      db.teachers.splice(index, 1);
      writeDatabase(db);
      return true;
    }
  }
}
