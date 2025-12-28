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
exports.Teacher = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const teacherSchema = new mongoose_1.Schema({
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
const TeacherModel = mongoose_1.default.models.Teacher || mongoose_1.default.model('Teacher', teacherSchema);
class Teacher {
    static async getAll() {
        if (database_1.isMongoConnected) {
            const teachers = await TeacherModel.find({ isActive: true }).exec();
            return teachers.map(t => {
                const obj = t.toObject();
                return { ...obj, _id: t._id.toString() };
            });
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            return db.teachers.filter(t => t.isActive).map(t => ({ ...t, _id: t.id }));
        }
    }
    static async getById(id) {
        if (database_1.isMongoConnected) {
            const teacher = await TeacherModel.findById(id).exec();
            if (!teacher)
                return null;
            const obj = teacher.toObject();
            return { ...obj, _id: teacher._id.toString() };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const teacher = db.teachers.find(t => t.id === id);
            return teacher ? { ...teacher, _id: teacher.id } : null;
        }
    }
    static async create(teacherData) {
        if (database_1.isMongoConnected) {
            const newTeacher = new TeacherModel({
                ...teacherData,
                isActive: true
            });
            const saved = await newTeacher.save();
            const obj = saved.toObject();
            return { ...obj, _id: saved._id.toString() };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const newTeacher = {
                id: (0, uuid_1.v4)(),
                ...teacherData,
                isActive: true
            };
            db.teachers.push(newTeacher);
            (0, database_1.writeDatabase)(db);
            return { ...newTeacher, _id: newTeacher.id };
        }
    }
    static async update(id, teacherData) {
        if (database_1.isMongoConnected) {
            const teacher = await TeacherModel.findByIdAndUpdate(id, teacherData, { new: true }).exec();
            if (!teacher)
                return null;
            const obj = teacher.toObject();
            return { ...obj, _id: teacher._id.toString() };
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const index = db.teachers.findIndex(t => t.id === id);
            if (index === -1)
                return null;
            db.teachers[index] = { ...db.teachers[index], ...teacherData };
            (0, database_1.writeDatabase)(db);
            return { ...db.teachers[index], _id: db.teachers[index].id };
        }
    }
    static async delete(id) {
        if (database_1.isMongoConnected) {
            const teacher = await TeacherModel.findById(id).exec();
            if (!teacher)
                return false;
            // Move to history
            const HistoryTeacher = mongoose_1.default.models.HistoryTeacher || mongoose_1.default.model('HistoryTeacher', teacherSchema);
            await new HistoryTeacher({ ...teacher.toObject(), isActive: false }).save();
            await TeacherModel.findByIdAndDelete(id).exec();
            return true;
        }
        else {
            // JSON fallback
            const db = (0, database_1.readDatabase)();
            const index = db.teachers.findIndex(t => t.id === id);
            if (index === -1)
                return false;
            // Move to history
            db.history.teachers.push({ ...db.teachers[index], isActive: false });
            db.teachers.splice(index, 1);
            (0, database_1.writeDatabase)(db);
            return true;
        }
    }
}
exports.Teacher = Teacher;
