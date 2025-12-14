import mongoose, { Schema, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IBillingRecord, isMongoConnected, readDatabase, writeDatabase, BillingRecord } from '../config/database';

// MongoDB Model
interface IBillingRecordDocument extends IBillingRecord, mongoose.Document {}

const billingSchema = new Schema<IBillingRecordDocument>({
  type: { type: String, enum: ['student_fee', 'teacher_salary'], required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

const BillingModel: Model<IBillingRecordDocument> = mongoose.models.Billing || mongoose.model<IBillingRecordDocument>('Billing', billingSchema);

export class Billing {
  static async getAll(): Promise<any[]> {
    if (isMongoConnected) {
      const records = await BillingModel.find().sort({ createdAt: -1 }).exec();
      return records.map(r => {
        const obj = r.toObject();
        return {
          ...obj,
          _id: (r._id as mongoose.Types.ObjectId).toString(),
          studentId: r.studentId?.toString(),
          teacherId: r.teacherId?.toString()
        };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
      return db.billing.map(b => ({ ...b, _id: b.id }));
    }
  }

  static async getById(id: string): Promise<any | null> {
    if (isMongoConnected) {
      const record = await BillingModel.findById(id).exec();
      if (!record) return null;
      const obj = record.toObject();
      return {
        ...obj,
        _id: (record._id as mongoose.Types.ObjectId).toString(),
        studentId: record.studentId?.toString(),
        teacherId: record.teacherId?.toString()
      };
    } else {
      // JSON fallback
      const db = readDatabase();
      const record = db.billing.find(b => b.id === id);
      return record ? { ...record, _id: record.id } : null;
    }
  }

  static async create(billingData: IBillingRecord | Omit<BillingRecord, 'id'>): Promise<any> {
    if (isMongoConnected) {
      const newRecord = new BillingModel(billingData);
      const saved = await newRecord.save();
      const obj = saved.toObject();
      return {
        ...obj,
        _id: (saved._id as mongoose.Types.ObjectId).toString(),
        studentId: saved.studentId?.toString(),
        teacherId: saved.teacherId?.toString()
      };
    } else {
      // JSON fallback
      const db = readDatabase();
      const newRecord: BillingRecord = {
        id: uuidv4(),
        type: (billingData as any).type,
        studentId: (billingData as any).studentId?.toString() || (billingData as any).studentId,
        teacherId: (billingData as any).teacherId?.toString() || (billingData as any).teacherId,
        amount: (billingData as any).amount,
        date: (billingData as any).date,
        description: (billingData as any).description || ''
      };
      db.billing.push(newRecord);
      writeDatabase(db);
      return { ...newRecord, _id: newRecord.id };
    }
  }

  static async getByStudentId(studentId: string): Promise<any[]> {
    if (isMongoConnected) {
      const records = await BillingModel.find({ type: 'student_fee', studentId }).exec();
      return records.map(r => {
        const obj = r.toObject();
        return {
          ...obj,
          _id: (r._id as mongoose.Types.ObjectId).toString(),
          studentId: r.studentId?.toString()
        };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
      return db.billing
        .filter(b => b.type === 'student_fee' && b.studentId === studentId)
        .map(b => ({ ...b, _id: b.id }));
    }
  }

  static async getByTeacherId(teacherId: string): Promise<any[]> {
    if (isMongoConnected) {
      const records = await BillingModel.find({ type: 'teacher_salary', teacherId }).exec();
      return records.map(r => {
        const obj = r.toObject();
        return {
          ...obj,
          _id: (r._id as mongoose.Types.ObjectId).toString(),
          teacherId: r.teacherId?.toString()
        };
      });
    } else {
      // JSON fallback
      const db = readDatabase();
      return db.billing
        .filter(b => b.type === 'teacher_salary' && b.teacherId === teacherId)
        .map(b => ({ ...b, _id: b.id }));
    }
  }
}
