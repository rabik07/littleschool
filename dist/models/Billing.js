"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Billing = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const billingSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['student_fee', 'teacher_salary'], required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student' },
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Teacher' },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String, default: '' }
}, {
    timestamps: true
});
const BillingModel = mongoose_1.default.models.Billing || mongoose_1.default.model('Billing', billingSchema);
class Billing {
    static async getAll() {
        if (database_1.isMongoConnected) {
            const records = await BillingModel.find().sort({ createdAt: -1 }).exec();
            return records.map(r => {
                const obj = r.toObject();
                return {
                    ...obj,
                    _id: r._id.toString(),
                    studentId: r.studentId?.toString(),
                    teacherId: r.teacherId?.toString()
                };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.billing.map(b => ({ ...b, _id: b.id }));
        }
    }
    static async getById(id) {
        if (database_1.isMongoConnected) {
            const record = await BillingModel.findById(id).exec();
            if (!record)
                return null;
            const obj = record.toObject();
            return {
                ...obj,
                _id: record._id.toString(),
                studentId: record.studentId?.toString(),
                teacherId: record.teacherId?.toString()
            };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const record = db.billing.find(b => b.id === id);
            return record ? { ...record, _id: record.id } : null;
        }
    }
    static async create(billingData) {
        if (database_1.isMongoConnected) {
            const newRecord = new BillingModel(billingData);
            const saved = await newRecord.save();
            const obj = saved.toObject();
            return {
                ...obj,
                _id: saved._id.toString(),
                studentId: saved.studentId?.toString(),
                teacherId: saved.teacherId?.toString()
            };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const newRecord = {
                id: (0, uuid_1.v4)(),
                type: billingData.type,
                studentId: billingData.studentId?.toString() || billingData.studentId,
                teacherId: billingData.teacherId?.toString() || billingData.teacherId,
                amount: billingData.amount,
                date: billingData.date,
                description: billingData.description || ''
            };
            db.billing.push(newRecord);
            (0, database_1.writeDatabase)(db);
            return { ...newRecord, _id: newRecord.id };
        }
    }
    static async getByStudentId(studentId) {
        if (database_1.isMongoConnected) {
            const records = await BillingModel.find({ type: 'student_fee', studentId }).exec();
            return records.map(r => {
                const obj = r.toObject();
                return {
                    ...obj,
                    _id: r._id.toString(),
                    studentId: r.studentId?.toString()
                };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.billing
                .filter(b => b.type === 'student_fee' && b.studentId === studentId)
                .map(b => ({ ...b, _id: b.id }));
        }
    }
    static async getByTeacherId(teacherId) {
        if (database_1.isMongoConnected) {
            const records = await BillingModel.find({ type: 'teacher_salary', teacherId }).exec();
            return records.map(r => {
                const obj = r.toObject();
                return {
                    ...obj,
                    _id: r._id.toString(),
                    teacherId: r.teacherId?.toString()
                };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.billing
                .filter(b => b.type === 'teacher_salary' && b.teacherId === teacherId)
                .map(b => ({ ...b, _id: b.id }));
        }
    }
}
exports.Billing = Billing;
