"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Routes
app.use('/', routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error',
        error: err.message || 'An unexpected error occurred'
    });
});
// Connect to MongoDB and start server
const startServer = async () => {
    // Try to connect to MongoDB (non-blocking)
    await (0, database_1.connectDatabase)();
    // Start server regardless of MongoDB connection status
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        if (database_1.isMongoConnected) {
            console.log('✓ Using MongoDB database');
        }
        else {
            console.log('⚠ Using JSON file fallback (database.json)');
            console.log('  MongoDB connection failed or not available');
        }
    });
};
startServer();
