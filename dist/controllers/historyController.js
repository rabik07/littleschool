"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryController = void 0;
const History_1 = require("../models/History");
class HistoryController {
    static async index(req, res) {
        try {
            const passoutStudents = await History_1.History.getPassoutStudents();
            const passoutTeachers = await History_1.History.getPassoutTeachers();
            res.render('history/index', {
                title: 'History',
                passoutStudents,
                passoutTeachers
            });
        }
        catch (error) {
            console.error('Error loading history:', error);
            res.status(500).send('Error loading history');
        }
    }
}
exports.HistoryController = HistoryController;
