"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const historyStudentSchema = new mongoose_1.default.Schema({
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
const historyTeacherSchema = new mongoose_1.default.Schema({
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
const HistoryStudent = mongoose_1.default.models.HistoryStudent || mongoose_1.default.model('HistoryStudent', historyStudentSchema);
const HistoryTeacher = mongoose_1.default.models.HistoryTeacher || mongoose_1.default.model('HistoryTeacher', historyTeacherSchema);
class History {
    static async getPassoutStudents() {
        if (database_1.isMongoConnected) {
            const students = await HistoryStudent.find().exec();
            return students.map(s => {
                const obj = s.toObject();
                return { ...obj, _id: s._id.toString() };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.history.students.map(s => ({ ...s, _id: s.id }));
        }
    }
    static async getPassoutTeachers() {
        if (database_1.isMongoConnected) {
            const teachers = await HistoryTeacher.find().exec();
            return teachers.map(t => {
                const obj = t.toObject();
                return { ...obj, _id: t._id.toString() };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.history.teachers.map(t => ({ ...t, _id: t.id }));
        }
    }
}
exports.History = History;
