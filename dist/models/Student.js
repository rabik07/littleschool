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
exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const studentSchema = new mongoose_1.Schema({
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
const StudentModel = mongoose_1.default.models.Student || mongoose_1.default.model('Student', studentSchema);
class Student {
    static async getAll() {
        if (database_1.isMongoConnected) {
            const students = await StudentModel.find({ isActive: true }).exec();
            return students.map(s => {
                const obj = s.toObject();
                return { ...obj, _id: s._id.toString(), dob: obj.dob || '' };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.students.filter(s => s.isActive).map(s => ({ ...s, _id: s.id, dob: s.dob || '' }));
        }
    }
    static async getByClass(className) {
        if (database_1.isMongoConnected) {
            const students = await StudentModel.find({ class: className, isActive: true }).exec();
            return students.map(s => {
                const obj = s.toObject();
                return { ...obj, _id: s._id.toString() };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.students
                .filter(s => s.class === className && s.isActive)
                .map(s => ({ ...s, _id: s.id }));
        }
    }
    static async getById(id) {
        if (database_1.isMongoConnected) {
            const student = await StudentModel.findById(id).exec();
            if (!student)
                return null;
            const obj = student.toObject();
            return { ...obj, _id: student._id.toString() };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const student = db.students.find(s => s.id === id);
            return student ? { ...student, _id: student.id } : null;
        }
    }
    static async create(studentData) {
        if (database_1.isMongoConnected) {
            const newStudent = new StudentModel({
                ...studentData,
                isActive: true
            });
            const saved = await newStudent.save();
            const obj = saved.toObject();
            return { ...obj, _id: saved._id.toString() };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const newStudent = {
                id: (0, uuid_1.v4)(),
                ...studentData,
                isActive: true
            };
            db.students.push(newStudent);
            (0, database_1.writeDatabase)(db);
            return { ...newStudent, _id: newStudent.id };
        }
    }
    static async update(id, studentData) {
        if (database_1.isMongoConnected) {
            const student = await StudentModel.findByIdAndUpdate(id, studentData, { new: true }).exec();
            if (!student)
                return null;
            const obj = student.toObject();
            return { ...obj, _id: student._id.toString() };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const index = db.students.findIndex(s => s.id === id);
            if (index === -1)
                return null;
            db.students[index] = { ...db.students[index], ...studentData };
            (0, database_1.writeDatabase)(db);
            return { ...db.students[index], _id: db.students[index].id };
        }
    }
    static async delete(id) {
        if (database_1.isMongoConnected) {
            const student = await StudentModel.findById(id).exec();
            if (!student)
                return false;
            // Move to history
            const HistoryStudent = mongoose_1.default.models.HistoryStudent || mongoose_1.default.model('HistoryStudent', studentSchema);
            await new HistoryStudent({ ...student.toObject(), isActive: false }).save();
            await StudentModel.findByIdAndDelete(id).exec();
            return true;
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const index = db.students.findIndex(s => s.id === id);
            if (index === -1)
                return false;
            // Move to history
            db.history.students.push({ ...db.students[index], isActive: false });
            db.students.splice(index, 1);
            (0, database_1.writeDatabase)(db);
            return true;
        }
    }
    static async getClasses() {
        if (database_1.isMongoConnected) {
            const classes = await StudentModel.find({ isActive: true }).distinct('class').exec();
            return classes.sort();
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const classes = [...new Set(db.students.filter(s => s.isActive).map(s => s.class))];
            return classes.sort();
        }
    }
}
exports.Student = Student;
