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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admission = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const admissionSchema = new mongoose_1.Schema({
    data: { type: mongoose_1.Schema.Types.Mixed, required: true },
    status: { type: String, required: true },
    submittedAt: { type: String, required: true }
}, { timestamps: true });
const AdmissionModel = mongoose_1.default.models.Admission || mongoose_1.default.model('Admission', admissionSchema);
class Admission {
    static async create(entry) {
        if (database_1.isMongoConnected) {
            const doc = new AdmissionModel(entry);
            const saved = await doc.save();
            const obj = saved.toObject();
            return { ...obj, _id: saved._id.toString(), id: saved._id.toString() };
        }
        else {
            // JSON fallback: data/admissions.json
            const dbPath = path_1.default.join(__dirname, '../../data/admissions.json');
            try {
                let arr = [];
                if (fs_1.default.existsSync(dbPath)) {
                    const raw = fs_1.default.readFileSync(dbPath, 'utf-8') || '[]';
                    arr = JSON.parse(raw);
                }
                const id = (0, uuid_1.v4)();
                const toSave = { id, ...entry };
                arr.push(toSave);
                const dir = path_1.default.dirname(dbPath);
                if (!fs_1.default.existsSync(dir))
                    fs_1.default.mkdirSync(dir, { recursive: true });
                fs_1.default.writeFileSync(dbPath, JSON.stringify(arr, null, 2));
                return toSave;
            }
            catch (error) {
                console.error('Error writing admissions.json fallback:', error);
                throw error;
            }
        }
    }
    static async getAll() {
        if (database_1.isMongoConnected) {
            const list = await AdmissionModel.find().sort({ createdAt: -1 }).exec();
            return list.map(l => ({ ...l.toObject(), _id: l._id.toString() }));
        }
        else {
            const dbPath = path_1.default.join(__dirname, '../../data/admissions.json');
            try {
                if (!fs_1.default.existsSync(dbPath))
                    return [];
                const raw = fs_1.default.readFileSync(dbPath, 'utf-8') || '[]';
                return JSON.parse(raw);
            }
            catch (e) {
                console.warn('Could not read admissions.json', e);
                return [];
            }
        }
    }
}
exports.Admission = Admission;
