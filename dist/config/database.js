"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.isMongoConnected = void 0;
exports.readDatabase = readDatabase;
exports.writeDatabase = writeDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management';
const dbPath = path_1.default.join(__dirname, '../../data/database.json');
// Track MongoDB connection status
exports.isMongoConnected = false;
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        exports.isMongoConnected = true;
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.warn('MongoDB connection failed, using JSON file fallback:', error);
        exports.isMongoConnected = false;
        // Don't exit, allow fallback to JSON
    }
};
exports.connectDatabase = connectDatabase;
// JSON File Operations
function readDatabase() {
    try {
        const data = fs_1.default.readFileSync(dbPath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading database.json:', error);
        return {
            students: [],
            teachers: [],
            billing: [],
            history: {
                students: [],
                teachers: []
            }
        };
    }
}
function writeDatabase(data) {
    try {
        // Ensure data directory exists
        const dataDir = path_1.default.dirname(dbPath);
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        fs_1.default.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error('Error writing database.json:', error);
    }
}
