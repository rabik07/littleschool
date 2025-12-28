import mongoose, { Schema, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { isMongoConnected } from '../config/database';
import fs from 'fs';
import path from 'path';

interface IAdmissionDocument extends mongoose.Document {
  data: any;
  status: string;
  submittedAt: string;
}

const admissionSchema = new Schema<IAdmissionDocument>({
  data: { type: Schema.Types.Mixed, required: true },
  status: { type: String, required: true },
  submittedAt: { type: String, required: true }
}, { timestamps: true });

const AdmissionModel: Model<IAdmissionDocument> = mongoose.models.Admission || mongoose.model<IAdmissionDocument>('Admission', admissionSchema);

export class Admission {
  static async create(entry: { data: any; status: string; submittedAt: string }) {
    if (isMongoConnected) {
      const doc = new AdmissionModel(entry);
      const saved = await doc.save();
      const obj = saved.toObject();
      return { ...obj, _id: (saved._id as mongoose.Types.ObjectId).toString(), id: (saved._id as mongoose.Types.ObjectId).toString() };
    } else {
      // JSON fallback: data/admissions.json
      const dbPath = path.join(__dirname, '../../data/admissions.json');
      try {
        let arr: any[] = [];
        if (fs.existsSync(dbPath)) {
          const raw = fs.readFileSync(dbPath, 'utf-8') || '[]';
          arr = JSON.parse(raw);
        }
        const id = uuidv4();
        const toSave = { id, ...entry };
        arr.push(toSave);
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(dbPath, JSON.stringify(arr, null, 2));
        return toSave;
      } catch (error) {
        console.error('Error writing admissions.json fallback:', error);
        throw error;
      }
    }
  }

  static async getAll() {
    if (isMongoConnected) {
      const list = await AdmissionModel.find().sort({ createdAt: -1 }).exec();
      return list.map(l => ({ ...l.toObject(), _id: (l._id as mongoose.Types.ObjectId).toString() }));
    } else {
      const dbPath = path.join(__dirname, '../../data/admissions.json');
      try {
        if (!fs.existsSync(dbPath)) return [];
        const raw = fs.readFileSync(dbPath, 'utf-8') || '[]';
        return JSON.parse(raw);
      } catch (e) {
        console.warn('Could not read admissions.json', e);
        return [];
      }
    }
  }
}
